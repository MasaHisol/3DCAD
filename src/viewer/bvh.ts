// Bounding volume hierarchy over the triangles of an indexed mesh: ray picks
// visit only the boxes the ray crosses instead of every triangle (no THREE).

export interface TriHit {
  /** Distance along the (normalised) ray. */
  t: number;
  /** Triangle index (indices[3 * tri .. 3 * tri + 2]). */
  tri: number;
  /** True when the ray hits the triangle's back side. */
  back: boolean;
}

const LEAF = 8;

export class TriangleBVH {
  /** Per node: min xyz, max xyz. */
  private box: Float32Array;
  /** Per node: [left child or -1, right child, first tri, tri count]. */
  private node: Int32Array;
  private tris: Uint32Array;
  private nodes = 0;

  constructor(
    readonly positions: ArrayLike<number>,
    readonly indices: ArrayLike<number>,
  ) {
    const n = Math.floor(indices.length / 3);
    this.tris = new Uint32Array(n);
    const cen = new Float32Array(n * 3), tb = new Float32Array(n * 6);
    for (let t = 0; t < n; t++) {
      this.tris[t] = t;
      let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
      for (let k = 0; k < 3; k++) {
        const v = indices[t * 3 + k] * 3, x = positions[v], y = positions[v + 1], z = positions[v + 2];
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (z < z0) z0 = z;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
        if (z > z1) z1 = z;
      }
      tb.set([x0, y0, z0, x1, y1, z1], t * 6);
      cen.set([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], t * 3);
    }
    const cap = Math.max(1, 2 * Math.ceil(n / (LEAF / 2)) + 1);
    this.box = new Float32Array(cap * 6);
    this.node = new Int32Array(cap * 4);
    if (n) this.build(0, n, tb, cen);
  }

  get nodeCount() {
    return this.nodes;
  }

  private build(start: number, end: number, tb: Float32Array, cen: Float32Array): number {
    const id = this.nodes++;
    const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    const c = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    for (let i = start; i < end; i++) {
      const t = this.tris[i];
      for (let k = 0; k < 3; k++) {
        b[k] = Math.min(b[k], tb[t * 6 + k]);
        b[k + 3] = Math.max(b[k + 3], tb[t * 6 + 3 + k]);
        c[k] = Math.min(c[k], cen[t * 3 + k]);
        c[k + 3] = Math.max(c[k + 3], cen[t * 3 + k]);
      }
    }
    this.box.set(b, id * 6);
    if (end - start <= LEAF) {
      this.node.set([-1, -1, start, end - start], id * 4);
      return id;
    }
    // split at the centroid midpoint of the widest axis
    const ext = [c[3] - c[0], c[4] - c[1], c[5] - c[2]];
    const ax = ext[0] >= ext[1] && ext[0] >= ext[2] ? 0 : ext[1] >= ext[2] ? 1 : 2;
    const mid = (c[ax] + c[ax + 3]) / 2;
    let i = start, j = end - 1;
    while (i <= j) {
      if (cen[this.tris[i] * 3 + ax] < mid) i++;
      else {
        const tmp = this.tris[i];
        this.tris[i] = this.tris[j];
        this.tris[j--] = tmp;
      }
    }
    if (i === start || i === end) i = (start + end) >> 1; // all centroids equal
    const l = this.build(start, i, tb, cen);
    const r = this.build(i, end, tb, cen);
    this.node.set([l, r, 0, 0], id * 4);
    return id;
  }

  /**
   * Every triangle hit by the ray o + t·d (t in [near, far]), sorted by
   * distance. `cullBack` skips back-facing hits (front-side materials).
   */
  raycast(o: ArrayLike<number>, d: ArrayLike<number>, near = 0, far = Infinity, cullBack = false): TriHit[] {
    const hits: TriHit[] = [];
    if (!this.nodes) return hits;
    const inv = [1 / d[0], 1 / d[1], 1 / d[2]];
    const stack = [0];
    const P = this.positions, I = this.indices, B = this.box;
    while (stack.length) {
      const id = stack.pop()!;
      // slab test
      let t0 = near, t1 = far;
      for (let k = 0; k < 3; k++) {
        let a = (B[id * 6 + k] - o[k]) * inv[k], b = (B[id * 6 + 3 + k] - o[k]) * inv[k];
        if (a > b) [a, b] = [b, a];
        if (Number.isNaN(a)) a = -Infinity;
        if (Number.isNaN(b)) b = Infinity;
        if (a > t0) t0 = a;
        if (b < t1) t1 = b;
        if (t0 > t1) break;
      }
      if (t0 > t1) continue;
      const l = this.node[id * 4];
      if (l >= 0) {
        stack.push(l, this.node[id * 4 + 1]);
        continue;
      }
      const s = this.node[id * 4 + 2], n = this.node[id * 4 + 3];
      for (let i = s; i < s + n; i++) {
        const tri = this.tris[i];
        const a = I[tri * 3] * 3, b = I[tri * 3 + 1] * 3, c = I[tri * 3 + 2] * 3;
        // Möller–Trumbore
        const e1x = P[b] - P[a], e1y = P[b + 1] - P[a + 1], e1z = P[b + 2] - P[a + 2];
        const e2x = P[c] - P[a], e2y = P[c + 1] - P[a + 1], e2z = P[c + 2] - P[a + 2];
        const px = d[1] * e2z - d[2] * e2y, py = d[2] * e2x - d[0] * e2z, pz = d[0] * e2y - d[1] * e2x;
        const det = e1x * px + e1y * py + e1z * pz;
        if (Math.abs(det) < 1e-14) continue;
        const back = det < 0;
        if (back && cullBack) continue;
        const id2 = 1 / det;
        const tx = o[0] - P[a], ty = o[1] - P[a + 1], tz = o[2] - P[a + 2];
        const u = (tx * px + ty * py + tz * pz) * id2;
        if (u < 0 || u > 1) continue;
        const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
        const v = (d[0] * qx + d[1] * qy + d[2] * qz) * id2;
        if (v < 0 || u + v > 1) continue;
        const t = (e2x * qx + e2y * qy + e2z * qz) * id2;
        if (t < near || t > far) continue;
        hits.push({ t, tri, back });
      }
    }
    return hits.sort((x, y) => x.t - y.t);
  }
}
