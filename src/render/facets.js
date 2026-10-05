import { random } from "../core/map.js";
export function createFacets(index, obj) {
  const facets = {};
  const r2 = random(97 + index * 31 + obj.id * 13);
  const stony = obj.type === "rock",
    golden = ["large", "gold", "small"].includes(obj.type);
  if (golden || stony) {
    // Lumpy silhouette: raw gold and boulders are never regular heptagons.
    facets.outline = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * 6.283,
        lump = i % 3 === 2 ? 0.8 : 1;
      const rr = obj.radius * (0.76 + r2() * 0.4) * lump;
      return [Math.cos(a) * rr, Math.sin(a) * rr * 0.92];
    });
  }
  if (stony) {
    // Fissures picked once so boulders read as cracked stone, not grey gems.
    facets.cracks = Array.from({ length: 2 + Math.floor(r2() * 2) }, () => {
      let cx = (r2() - 0.5) * obj.radius * 1.1,
        cy = (r2() - 0.5) * obj.radius * 1.1;
      const pts = [[cx, cy]];
      for (let s = 0, seg = 2 + Math.floor(r2() * 2); s < seg; s++) {
        cx += (r2() - 0.5) * obj.radius * 0.8;
        cy += (r2() - 0.5) * obj.radius * 0.7;
        pts.push([cx, cy]);
      }
      return pts;
    });
  }
  if (golden) {
    // Anchor points for twinkling star flares on the facets.
    facets.glints = Array.from({ length: 2 }, () => ({
      x: (r2() - 0.5) * obj.radius * 1.2,
      y: (r2() - 0.5) * obj.radius * 1.2,
      s: obj.radius * (0.22 + r2() * 0.2),
      phase: r2() * 6.283,
    }));
  }
  facets.chunks = Array.from({ length: 3 + Math.floor(r2() * 3) }, () => ({
    pts: Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * 6.283 + (r2() - 0.5) * 0.5,
        rr = obj.radius * (0.34 + r2() * 0.34);
      return [
        Math.cos(a) * rr + (r2() - 0.5) * obj.radius * 0.5,
        Math.sin(a) * rr + (r2() - 0.5) * obj.radius * 0.4,
      ];
    }),
    lit: r2(),
  }));

  return facets;
}
