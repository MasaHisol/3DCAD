/// <reference types="node" />
// Regenerates the sample files in tests/fixtures (run: GEN_FIXTURES=1 npx vitest run tests/fixtures.gen.test.ts).
// The committed files are what the other tests and the e2e check open.
import { it } from "vitest";
import { writeFileSync } from "node:fs";
import opencascade from "replicad-opencascadejs";
import * as R from "replicad";
import { exportStepXcaf, shapesToIges } from "../src/kernel/exchange";
import { writeIges } from "../src/io/iges";
import { writeGlb, writeGltf } from "../src/io/gltf";
import { writePlyPoints } from "../src/io/pointcloud";
import { writeE57 } from "../src/io/e57";

const out = (name: string, data: string | Uint8Array) => writeFileSync(new URL(`./fixtures/${name}`, import.meta.url), data);

it.skipIf(!process.env.GEN_FIXTURES)("generates the fixtures", async () => {
  const OC = await (opencascade as unknown as () => Promise<unknown>)();
  R.setOC(OC as never);
  const translate = (x: number, y: number, z: number) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
  // STEP assembly: plate + two pins (names, colours, placements)
  const plate = R.makeBaseBox(40, 20, 5) as unknown as R.Shape3D;
  const pin = R.makeCylinder(3, 12) as unknown as R.Shape3D;
  const step = exportStepXcaf(
    [
      { name: "プレート", color: "#336699", shapes: [plate] },
      { name: "Pin-M6", color: "#cc3300", shapes: [pin] },
    ],
    [
      { part: 0, name: "プレート:1", matrix: translate(0, 0, 0) },
      { part: 1, name: "Pin-M6:1", matrix: translate(-10, 0, 5) },
      { part: 1, name: "Pin-M6:2", matrix: translate(10, 0, 5) },
    ],
    "組立品",
  );
  out("assembly-colors.step", new Uint8Array(await step.arrayBuffer()));
  // IGES: inch plate 2 x 1 x 0.5 in, and a mm block 40 x 20 x 10 for the e2e check
  out("plate-inch.igs", writeIges(shapesToIges([{ shape: R.makeBaseBox(50.8, 25.4, 12.7) as unknown as R.Shape3D, name: "Plate", color: "#808080" }]), "plate-inch.igs", "3DCAD Studio", "inch"));
  const block = (R.makeBox([0, 0, 0], [40, 20, 10]) as unknown as R.Shape3D).cut(R.makeCylinder(4, 10).translate([20, 10, 0]) as never) as R.Shape3D;
  out("sample.igs", writeIges(shapesToIges([{ shape: block, name: "IGES-Block", color: "#3a7bd5" }]), "sample.igs"));
  // glTF: the same block outline as a closed mesh (40 x 20 x 10)
  const p = [0, 0, 0, 40, 0, 0, 40, 20, 0, 0, 20, 0, 0, 0, 10, 40, 0, 10, 40, 20, 10, 0, 20, 10];
  const t = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];
  const mesh = [{ name: "glTF-Block", positions: new Float32Array(p), indices: new Uint32Array(t), color: "#e0a030" }];
  out("sample.gltf", writeGltf(mesh));
  out("sample.glb", writeGlb(mesh));
  // point clouds: 100 x 50 mm grid, 5 mm pitch
  const P: number[] = [], C: number[] = [], I: number[] = [];
  for (let i = 0; i <= 20; i++)
    for (let j = 0; j <= 10; j++) {
      P.push(i * 5, j * 5, 0);
      C.push(i / 20, j / 10, 0.6);
      I.push((i + j) / 30);
    }
  out("cloud.ply", writePlyPoints({ name: "grid", positions: new Float32Array(P), colors: new Float32Array(C) }));
  // E57: scaled-integer coordinates (0.1 mm), intensity, pose shifted 10 mm along X
  out("cloud.e57", writeE57({ name: "grid", positions: new Float32Array(P) }, { scale: 0.0001, intensity: new Float32Array(I), pose: { translation: [0.01, 0, 0] } }));
});
