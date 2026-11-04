// GPU picking (ID buffer): the pickable body meshes are drawn once per view
// into an offscreen float target holding (body + 1, face, view depth) per
// pixel; a pick then reads one pixel. Rendering is lazy (only when a pick
// happens after the view or the model changed), so hovering costs a 1-pixel
// readback instead of a ray test against every body. The ray / BVH test is
// still used to get the exact point on the found body and as the fallback
// (WebGPU: no synchronous readback; no float colour buffers; context lost).
import * as THREE from "three";

export interface GpuPickHit {
  body: number;
  face: number;
  /** View-space depth (positive, world units). */
  depth: number;
}

const vertexShader = /* glsl */ `
  attribute float faceId;
  varying float vFace;
  varying float vDepth;
  #include <common>
  #include <clipping_planes_pars_vertex>
  void main() {
    vFace = faceId;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    #include <clipping_planes_vertex>
  }`;

const fragmentShader = /* glsl */ `
  uniform float bodyId;
  varying float vFace;
  varying float vDepth;
  #include <clipping_planes_pars_fragment>
  void main() {
    #include <clipping_planes_fragment>
    gl_FragColor = vec4(bodyId + 1.0, floor(vFace + 0.5), vDepth, 1.0);
  }`;

/** Per-vertex face index attribute from the face ranges (start, count into the index buffer). */
export function faceIdAttribute(vertexCount: number, index: ArrayLike<number>, faceRanges: ArrayLike<number>): Float32Array {
  const out = new Float32Array(vertexCount).fill(-1);
  for (let f = 0; f * 2 < faceRanges.length; f++) {
    const s = faceRanges[f * 2], n = faceRanges[f * 2 + 1];
    for (let i = s; i < s + n; i++) out[index[i]] = f;
  }
  return out;
}

export class GpuPicker {
  /** False once the backend proved unable to do it (fallback to BVH for good). */
  supported = true;
  /** Picks answered by the ID buffer / by the fallback (statistics). */
  stats = { renders: 0, reads: 0 };
  private target: THREE.WebGLRenderTarget | null = null;
  private scene = new THREE.Scene();
  private key = "";
  private mats: THREE.ShaderMaterial[] = [];
  private px = new Float32Array(4);

  constructor(private renderer: THREE.WebGLRenderer) {
    const gl = renderer.getContext?.() as WebGL2RenderingContext | undefined;
    // float colour attachments (WebGL 2 + EXT_color_buffer_float)
    if (!gl || typeof (gl as WebGL2RenderingContext).texStorage2D !== "function" || !gl.getExtension("EXT_color_buffer_float")) this.supported = false;
  }

  dispose() {
    this.target?.dispose();
    this.target = null;
    this.mats.forEach((m) => m.dispose());
    this.mats = [];
  }

  /** Marks the ID buffer stale (model, visibility or clipping changed). */
  invalidate() {
    this.key = "";
  }

  /**
   * Body / face under the pixel (x, y in CSS pixels from the top left), or null
   * for background; undefined when the GPU path is unavailable.
   */
  pick(meshes: readonly THREE.Mesh[], faceRangesOf: (i: number) => ArrayLike<number> | undefined, camera: THREE.Camera, width: number, height: number, x: number, y: number, clipping: THREE.Plane[], viewKey: string): GpuPickHit | null | undefined {
    if (!this.supported || !meshes.length || width < 1 || height < 1) return undefined;
    const r = this.renderer;
    try {
      const w = Math.max(1, Math.round(width)), h = Math.max(1, Math.round(height));
      const key = `${viewKey}|${w}x${h}|${meshes.length}`;
      if (key !== this.key || !this.target) {
        if (!this.target || this.target.width !== w || this.target.height !== h) {
          this.target?.dispose();
          this.target = new THREE.WebGLRenderTarget(w, h, { type: THREE.FloatType, format: THREE.RGBAFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true, generateMipmaps: false });
        }
        this.build(meshes, faceRangesOf, clipping);
        const prevTarget = r.getRenderTarget();
        const prevClear = r.getClearColor(new THREE.Color()), prevAlpha = r.getClearAlpha();
        const prevScissor = r.getScissorTest();
        r.setScissorTest(false);
        r.setRenderTarget(this.target);
        r.setClearColor(0x000000, 0);
        r.clear(true, true, false);
        r.render(this.scene, camera);
        r.setRenderTarget(prevTarget);
        r.setClearColor(prevClear, prevAlpha);
        r.setScissorTest(prevScissor);
        this.key = key;
        this.stats.renders++;
        // release the per-pick scene graph references (geometries stay shared)
        this.scene.clear();
      }
      const px = Math.min(w - 1, Math.max(0, Math.floor(x))), py = Math.min(h - 1, Math.max(0, h - 1 - Math.floor(y)));
      r.readRenderTargetPixels(this.target, px, py, 1, 1, this.px);
      this.stats.reads++;
      const id = Math.round(this.px[0]) - 1;
      if (id < 0) return null;
      return { body: id, face: Math.round(this.px[1]), depth: this.px[2] };
    } catch {
      this.supported = false;
      return undefined;
    }
  }

  private build(meshes: readonly THREE.Mesh[], faceRangesOf: (i: number) => ArrayLike<number> | undefined, clipping: THREE.Plane[]) {
    this.scene.clear();
    meshes.forEach((m, i) => {
      const g = m.geometry;
      const pos = g.getAttribute("position");
      if (!pos || !g.index) return;
      if (!g.getAttribute("faceId")) {
        const fr = faceRangesOf(i);
        if (!fr) return;
        g.setAttribute("faceId", new THREE.BufferAttribute(faceIdAttribute(pos.count, g.index.array, fr), 1));
      }
      let mat = this.mats[i];
      if (!mat) {
        mat = this.mats[i] = new THREE.ShaderMaterial({ uniforms: { bodyId: { value: i } }, vertexShader, fragmentShader, side: THREE.DoubleSide, clipping: true });
      }
      mat.uniforms.bodyId.value = i;
      // same culling as the display (solids: front faces; surfaces: both)
      mat.side = Array.isArray(m.material) ? THREE.DoubleSide : m.material.side;
      mat.clippingPlanes = clipping;
      const o = new THREE.Mesh(g, mat);
      o.matrixAutoUpdate = false;
      o.matrix.copy(m.matrixWorld);
      o.matrixWorld.copy(m.matrixWorld);
      o.frustumCulled = true;
      this.scene.add(o);
    });
    // fewer materials when the model shrank
    for (const m of this.mats.splice(meshes.length)) m.dispose();
  }
}
