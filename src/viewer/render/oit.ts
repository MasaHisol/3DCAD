// Correct transparency for X-ray / transparent parts (engine #4).
//
// WebGL 2 with float colour buffers: weighted blended order-independent
// transparency (McGuire & Bavoil 2013) in one MRT pass. Both attachments use
// additive blending (WebGL 2 has no per-attachment blend state), so the
// revealage Π(1 - αᵢ) is accumulated as Σ -ln(1 - αᵢ) and exponentiated in the
// composite. Transparent surfaces are depth tested against the opaque bodies
// (their depth is laid down in the same target first), never against each
// other, so the result does not depend on draw order — overlapping parts and
// the inner faces of a part blend correctly in every view.
//
// Elsewhere (WebGPU, no float buffers) the fallback is per-object sorted
// blending (back faces first, then front faces, no depth writes).
import * as THREE from "three";

export interface TransparentItem {
  mesh: THREE.Mesh;
  color: THREE.ColorRepresentation;
  opacity: number;
}

const accumVS = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  varying float vZ;
  #include <common>
  #include <clipping_planes_pars_vertex>
  void main() {
    vec4 p = vec4(position, 1.0);
    vec3 nrm = normal;
    #ifdef USE_INSTANCING
      p = instanceMatrix * p;
      nrm = mat3(instanceMatrix) * nrm;
    #endif
    vec4 mvPosition = modelViewMatrix * p;
    vN = normalMatrix * nrm;
    vV = -mvPosition.xyz;
    vZ = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    #include <clipping_planes_vertex>
  }`;

const accumFS = /* glsl */ `
  layout(location = 0) out vec4 accum;
  layout(location = 1) out vec4 reveal;
  uniform vec3 color;
  uniform float opacity;
  uniform vec2 depthRange;
  varying vec3 vN;
  varying vec3 vV;
  varying float vZ;
  #include <clipping_planes_pars_fragment>
  void main() {
    #include <clipping_planes_fragment>
    vec3 n = normalize(vN);
    vec3 v = normalize(vV);
    float ndv = abs(dot(n, v));
    // X-ray look: soft diffuse plus a rim that keeps silhouettes readable
    vec3 c = color * (0.45 + 0.55 * ndv) + vec3(0.18) * pow(1.0 - ndv, 3.0);
    float a = clamp(opacity * (0.75 + 0.5 * pow(1.0 - ndv, 2.0)), 0.0, 0.98);
    float z = clamp((vZ - depthRange.x) / max(1e-6, depthRange.y - depthRange.x), 0.0, 1.0);
    float w = clamp(a * max(1e-2, 3e3 * pow(1.0 - z, 3.0)), 1e-2, 3e3);
    accum = vec4(c * a, a) * w;
    reveal = vec4(-log(1.0 - a), 0.0, 0.0, 0.0);
  }`;

const compositeVS = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const compositeFS = /* glsl */ `
  uniform sampler2D tAccum;
  uniform sampler2D tReveal;
  varying vec2 vUv;
  void main() {
    vec4 acc = texture2D(tAccum, vUv);
    float alpha = 1.0 - exp(-texture2D(tReveal, vUv).r);
    if (alpha < 1e-4) discard;
    gl_FragColor = vec4(acc.rgb / clamp(acc.a, 1e-4, 5e4), alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

export class TransparencyPass {
  /** "oit" when weighted blended OIT runs, "sorted" for the portable fallback. */
  mode: "oit" | "sorted";
  /** Fallback: sorted transparent proxies drawn in the main scene. */
  readonly sortedGroup = new THREE.Group();
  private items: TransparentItem[] = [];
  private target: THREE.WebGLRenderTarget | null = null;
  private scene = new THREE.Scene();
  private depthScene = new THREE.Scene();
  private quad: THREE.Mesh;
  private quadScene = new THREE.Scene();
  private quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private mats = new Map<string, THREE.Material>();
  private depthMat = new THREE.MeshBasicMaterial({ colorWrite: false });
  private dirty = true;

  constructor(
    private renderer: THREE.WebGLRenderer,
    backend: "webgl" | "webgpu",
  ) {
    const gl = backend === "webgl" ? (renderer.getContext?.() as WebGL2RenderingContext | undefined) : undefined;
    this.mode = gl && typeof gl.texStorage2D === "function" && gl.getExtension("EXT_color_buffer_float") ? "oit" : "sorted";
    this.quad = new THREE.Mesh(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)),
      new THREE.ShaderMaterial({ uniforms: { tAccum: { value: null }, tReveal: { value: null } }, vertexShader: compositeVS, fragmentShader: compositeFS, transparent: true, depthTest: false, depthWrite: false, blending: THREE.NormalBlending }),
    );
    this.quad.frustumCulled = false;
    this.quadScene.add(this.quad);
  }

  get active() {
    return this.items.length > 0;
  }

  /** Transparent bodies to draw (meshes keep their own geometry / placement). */
  setItems(items: TransparentItem[], clipping: THREE.Plane[]) {
    this.items = items;
    this.clipping = clipping;
    this.dirty = true;
  }
  private clipping: THREE.Plane[] = [];

  private material(color: THREE.ColorRepresentation, opacity: number, side: THREE.Side): THREE.Material {
    const c = new THREE.Color(color);
    const key = `${this.mode}|${c.getHexString()}|${opacity.toFixed(3)}|${side}`;
    let m = this.mats.get(key);
    if (!m) {
      if (this.mode === "oit") {
        m = new THREE.ShaderMaterial({
          glslVersion: THREE.GLSL3,
          uniforms: { color: { value: c }, opacity: { value: opacity }, depthRange: { value: new THREE.Vector2(0, 1) } },
          vertexShader: accumVS,
          fragmentShader: accumFS,
          side: THREE.DoubleSide,
          depthWrite: false,
          transparent: true,
          blending: THREE.CustomBlending,
          blendEquation: THREE.AddEquation,
          blendSrc: THREE.OneFactor,
          blendDst: THREE.OneFactor,
          blendSrcAlpha: THREE.OneFactor,
          blendDstAlpha: THREE.OneFactor,
          clipping: true,
        });
      } else {
        m = new THREE.MeshStandardMaterial({ color: c, metalness: 0.05, roughness: 0.55, transparent: true, opacity, depthWrite: false, side });
      }
      this.mats.set(key, m);
    }
    m.clippingPlanes = this.clipping;
    return m;
  }

  private rebuild() {
    this.dirty = false;
    this.scene.clear();
    this.sortedGroup.clear();
    const proxy = (src: THREE.Mesh, mat: THREE.Material, order = 0) => {
      const o = new THREE.Mesh(src.geometry, mat);
      o.matrixAutoUpdate = false;
      src.updateWorldMatrix(true, false);
      o.matrix.copy(src.matrixWorld);
      o.matrixWorldNeedsUpdate = true;
      o.renderOrder = order;
      return o;
    };
    // repeated bodies (assembly instances: same geometry, colour and opacity)
    // are drawn as one InstancedMesh, like the opaque batches
    const groups = new Map<string, TransparentItem[]>();
    for (const it of this.items) {
      const k = `${it.mesh.geometry.uuid}|${new THREE.Color(it.color).getHexString()}|${it.opacity}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(it);
    }
    const make = (list: TransparentItem[], mat: THREE.Material, order: number): THREE.Mesh => {
      if (list.length === 1) return proxy(list[0].mesh, mat, order);
      const im = new THREE.InstancedMesh(list[0].mesh.geometry, mat, list.length);
      list.forEach((it, i) => {
        it.mesh.updateWorldMatrix(true, false);
        im.setMatrixAt(i, it.mesh.matrixWorld);
      });
      im.instanceMatrix.needsUpdate = true;
      im.computeBoundingSphere();
      im.renderOrder = order;
      return im;
    };
    for (const list of groups.values()) {
      const it = list[0];
      if (this.mode === "oit") this.scene.add(make(list, this.material(it.color, it.opacity, THREE.DoubleSide), 0));
      else {
        // back faces first, then front faces: the closest approximation without OIT
        this.sortedGroup.add(make(list, this.material(it.color, it.opacity, THREE.BackSide), 10));
        this.sortedGroup.add(make(list, this.material(it.color, it.opacity, THREE.FrontSide), 11));
      }
    }
  }

  /** Call before the main render (fallback proxies live in the main scene). */
  prepare() {
    if (this.dirty) this.rebuild();
  }

  /**
   * Weighted blended OIT on top of the frame already drawn: accumulate the
   * transparent bodies (depth tested against `opaque`) and composite.
   */
  render(camera: THREE.Camera, opaque: THREE.Mesh[], depthRange: [number, number]): { calls: number; triangles: number } {
    const info = { calls: 0, triangles: 0 };
    if (this.mode !== "oit" || !this.items.length) return info;
    const count = () => {
      info.calls += this.renderer.info.render.calls;
      info.triangles += this.renderer.info.render.triangles;
    };
    if (this.dirty) this.rebuild();
    const r = this.renderer;
    const size = r.getDrawingBufferSize(new THREE.Vector2());
    const w = Math.max(1, size.x), h = Math.max(1, size.y);
    if (!this.target || this.target.width !== w || this.target.height !== h) {
      this.target?.dispose();
      this.target = new THREE.WebGLRenderTarget(w, h, { count: 2, type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: true, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    }
    for (const m of this.mats.values()) if (m instanceof THREE.ShaderMaterial) m.uniforms.depthRange.value.set(depthRange[0], depthRange[1]);
    const prev = r.getRenderTarget();
    const prevClear = r.getClearColor(new THREE.Color()), prevAlpha = r.getClearAlpha();
    const prevScissor = r.getScissorTest();
    r.setScissorTest(false);
    r.setRenderTarget(this.target);
    r.setClearColor(0x000000, 0);
    r.clear(true, true, false);
    // opaque bodies: depth only, so they hide the transparent ones behind them
    if (opaque.length) {
      this.depthScene.clear();
      this.depthMat.clippingPlanes = this.clipping;
      for (const m of opaque) {
        const o = new THREE.Mesh(m.geometry, this.depthMat);
        o.matrixAutoUpdate = false;
        o.matrix.copy(m.matrixWorld);
        o.matrixWorldNeedsUpdate = true;
        this.depthScene.add(o);
      }
      r.render(this.depthScene, camera);
      count();
      this.depthScene.clear();
    }
    r.render(this.scene, camera);
    count();
    r.setRenderTarget(prev);
    r.setClearColor(prevClear, prevAlpha);
    const qm = this.quad.material as THREE.ShaderMaterial;
    qm.uniforms.tAccum.value = this.target.textures[0];
    qm.uniforms.tReveal.value = this.target.textures[1];
    r.render(this.quadScene, this.quadCam);
    count();
    r.setScissorTest(prevScissor);
    return info;
  }

  dispose() {
    this.target?.dispose();
    this.mats.forEach((m) => m.dispose());
    this.mats.clear();
  }
}
