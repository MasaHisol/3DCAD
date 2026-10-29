// Section caps (断面の塗りつぶし): stencil-filled cut faces with hatching.
//
// For each section plane and each hatch group (parts sharing a pattern):
//   1. the group's bodies, clipped by that plane only, are drawn into the
//      stencil buffer without colour or depth (back faces +1, front faces −1),
//      leaving a non-zero count exactly where the plane is inside material;
//   2. a quad on the plane, clipped by the other planes, is drawn where the
//      stencil is non-zero with the group's hatch texture, resetting the
//      stencil to zero for the next group.
// Only classic materials with stencil state are used, so the same code runs
// on the WebGL and the WebGPU renderer. Bodies whose bounding sphere does not
// reach a plane are skipped, which keeps the cost low for large assemblies.
import * as THREE from "three";
import { hatchPatternFor, hatchPatternIndex } from "../../core/hatchStyle";

export interface CapItem {
  mesh: THREE.Mesh;
  /** Hatch pattern key (part id / material / index). */
  pattern: number | string | undefined;
  /** Tint of the cut face (part colour). */
  color?: string;
}

/** Tileable hatch texture: one line (two when cross-hatched) per tile. */
function hatchTexture(cross: boolean): THREE.CanvasTexture | THREE.DataTexture {
  const N = 32;
  const data = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const line = y < 3 || (cross && x < 3);
      const i = (y * N + x) * 4;
      const v = line ? 40 : 255;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  const t = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

export class SectionCaps {
  readonly group = new THREE.Group();
  /** Cut faces drawn (statistics / tests). */
  stats = { planes: 0, groups: 0, stencilMeshes: 0 };
  private textures = new Map<string, THREE.Texture>();
  /**
   * WebGPU: clipping is per group (ClippingGroup), not per material; set to a
   * factory of clipping groups. WebGL: null (materials carry the planes).
   */
  makeClipGroup: ((planes: THREE.Plane[]) => THREE.Group) | null = null;
  private mats: THREE.Material[] = [];
  private geoms: THREE.BufferGeometry[] = [];

  constructor() {
    this.group.name = "section-caps";
  }

  clear() {
    this.group.clear();
    this.mats.forEach((m) => m.dispose());
    this.mats = [];
    this.geoms.forEach((g) => g.dispose());
    this.geoms = [];
    this.stats = { planes: 0, groups: 0, stencilMeshes: 0 };
  }

  dispose() {
    this.clear();
    this.textures.forEach((t) => t.dispose());
    this.textures.clear();
  }

  private texture(patternIdx: number, worldSpacing: number, quadSize: number): THREE.Texture {
    const pat = hatchPatternFor(patternIdx);
    const key = `${patternIdx}|${worldSpacing.toPrecision(4)}|${quadSize.toPrecision(4)}`;
    let t = this.textures.get(key);
    if (!t) {
      t = hatchTexture(pat.cross);
      t.repeat.set(quadSize / worldSpacing, quadSize / worldSpacing);
      t.center.set(0.5, 0.5);
      t.rotation = (pat.angle * Math.PI) / 180;
      this.textures.set(key, t);
    }
    return t;
  }

  /**
   * Rebuilds the caps for `planes` (clipping planes, kept side positive).
   * `bounds` is the model's bounding box (quad size and hatch scale).
   */
  update(planes: THREE.Plane[], items: CapItem[], bounds: THREE.Box3, hatch = true) {
    this.clear();
    if (!planes.length || !items.length || bounds.isEmpty()) return;
    const size = bounds.getSize(new THREE.Vector3()).length() || 1;
    const center = bounds.getCenter(new THREE.Vector3());
    const quadSize = size * 2.2;
    // hatch pitch: the drawing pitch scaled so ~80 lines cross the model at 2.5 mm
    const pitchUnit = size / 80 / 2.5;
    // groups by pattern
    const groups = new Map<number, CapItem[]>();
    for (const it of items) {
      const k = hatchPatternIndex(it.pattern);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(it);
    }
    const sph = new THREE.Sphere();
    let order = 1000;
    planes.forEach((plane, pi) => {
      const others = planes.filter((_, j) => j !== pi);
      for (const [pk, list] of groups) {
        const cut = list.filter((it) => {
          const g = it.mesh.geometry;
          if (!g.boundingSphere) g.computeBoundingSphere();
          sph.copy(g.boundingSphere!).applyMatrix4(it.mesh.matrixWorld);
          return Math.abs(plane.distanceToPoint(sph.center)) <= sph.radius;
        });
        if (!cut.length) continue;
        const back = this.stencilMat(THREE.BackSide, THREE.IncrementWrapStencilOp, plane);
        const front = this.stencilMat(THREE.FrontSide, THREE.DecrementWrapStencilOp, plane);
        const stencilParent = this.makeClipGroup ? this.makeClipGroup([plane]) : this.group;
        if (stencilParent !== this.group) this.group.add(stencilParent);
        for (const it of cut) {
          for (const [m, o] of [
            [back, order],
            [front, order + 1],
          ] as const) {
            const s = new THREE.Mesh(it.mesh.geometry, m);
            s.matrixAutoUpdate = false;
            s.matrix.copy(it.mesh.matrixWorld);
            s.matrixWorldNeedsUpdate = true;
            s.renderOrder = o;
            s.frustumCulled = false;
            stencilParent.add(s);
            this.stats.stencilMeshes++;
          }
        }
        // the cap quad on the plane
        const pat = hatchPatternFor(pk);
        const tint = new THREE.Color(cut[0].color ?? "#c9ced6").lerp(new THREE.Color("#ffffff"), 0.35);
        const capMat = new THREE.MeshBasicMaterial({
          color: tint,
          map: hatch ? this.texture(pk, pitchUnit * pat.spacing, quadSize) : null,
          side: THREE.DoubleSide,
          clippingPlanes: others,
          stencilWrite: true,
          stencilRef: 0,
          stencilFunc: THREE.NotEqualStencilFunc,
          stencilFail: THREE.ReplaceStencilOp,
          stencilZFail: THREE.ReplaceStencilOp,
          stencilZPass: THREE.ReplaceStencilOp,
        });
        this.mats.push(capMat);
        const geom = new THREE.PlaneGeometry(quadSize, quadSize);
        this.geoms.push(geom);
        const quad = new THREE.Mesh(geom, capMat);
        const at = plane.projectPoint(center, new THREE.Vector3());
        quad.position.copy(at);
        // quad frame: x along the projected world X (Y for planes normal to X), like the section DXF
        // (viewed from the + side of the axis: same 2D frame as planeDefOf / the DXF)
        const n = plane.normal.clone().normalize();
        if (n.x + n.y + n.z < 0) n.negate();
        const ref = Math.abs(n.x) > 0.9 ? new THREE.Vector3(0, 1, 0) : Math.abs(n.y) > 0.9 ? new THREE.Vector3(-1, 0, 0) : new THREE.Vector3(1, 0, 0);
        const ux = ref.sub(n.clone().multiplyScalar(ref.dot(n))).normalize();
        const uy = n.clone().cross(ux);
        quad.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(ux, uy, n));
        quad.renderOrder = order + 2;
        quad.frustumCulled = false;
        quad.userData.sectionCap = { plane: pi, pattern: pk };
        if (this.makeClipGroup && others.length) {
          const g = this.makeClipGroup(others);
          g.add(quad);
          this.group.add(g);
        } else this.group.add(quad);
        this.stats.groups++;
        order += 3;
      }
      this.stats.planes++;
    });
  }

  private stencilMat(side: THREE.Side, op: THREE.StencilOp, plane: THREE.Plane): THREE.Material {
    const m = new THREE.MeshBasicMaterial({
      side,
      colorWrite: false,
      depthWrite: false,
      depthTest: false,
      clippingPlanes: [plane],
      stencilWrite: true,
      stencilFunc: THREE.AlwaysStencilFunc,
      stencilFail: op,
      stencilZFail: op,
      stencilZPass: op,
    });
    this.mats.push(m);
    return m;
  }
}
