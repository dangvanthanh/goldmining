import {
  LEVELS,
  TYPES as types,
  SPAWN_COUNTS as spawnCounts,
  DIFFICULTY_RHYTHM as difficultyRhythm,
  RULES,
} from "./levels.js";
const { height: H, origin, blastRadius } = RULES;
export const reachable = (x, y, layoutVersion) =>
  layoutVersion < 3 || Math.abs(Math.atan2(x - origin.x, y - origin.y)) < 1.08;
export function random(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
// Phase 1: which object types a mine holds (no random draws).
function chooseKinds(index, layoutVersion) {
  const kinds = [];
  if (layoutVersion === 1) {
    // Legacy expeditions retain positions, IDs and random draw order.
    const density = Math.min(index, 9);
    kinds.push(
      "large",
      "large",
      "gold",
      "gold",
      "small",
      "small",
      "diamond",
      "gem",
      "bag",
      "rock",
      "rock",
    );
    for (let i = 0; i < density; i++) kinds.push(i % 2 ? "large" : "diamond");
    for (let i = 0; i < Math.floor(density / 2); i++) kinds.push("rock");
  } else {
    const counts = { ...spawnCounts[layoutVersion][index < 10 ? 0 : index < 40 ? 1 : 2] };
    // Alternate gold-heavy and gem-heavy mines without adding hazards.
    if (index % 2) {
      counts.large--;
      counts.gem += 2;
    }
    for (const [type, count] of Object.entries(counts)) kinds.push(...Array(count).fill(type));
  }
  return kinds;
}
// Phase 2: instantiate and place the stationary objects.
function createObjects(kinds, layoutVersion, rand) {
  return kinds
    .map((type, id) => {
      const spec = types[type];
      return {
        type,
        id,
        ...spec,
        x: 0,
        y: 0,
        taken: false,
        rotation: rand() * 0.6 - 0.3,
        value:
          type === "bag" ? Math.round((spec.value * (0.2 + rand() * 1.6)) / 25) * 25 : spec.value,
      };
    })
    .reduce((placed, obj) => {
      for (let attempt = 0; attempt < 500; attempt++) {
        obj.x = 85 + rand() * 930;
        obj.y = 220 + rand() * (300 - obj.radius);
        if (
          reachable(obj.x, obj.y, layoutVersion) &&
          placed.every(
            (other) =>
              Math.hypot(obj.x - other.x, obj.y - other.y) > obj.radius + other.radius + 18,
          )
        )
          break;
      }
      placed.push(obj);
      return placed;
    }, []);
}
// Phase 3: scale treasure values to the mine's target; returns the richness factor.
function scaleValues(map, index, layoutVersion) {
  // Legacy boards: 45–50% at mines 1–10, 52–60% at 11–40, 60–68% at 41–100.
  // v3 boards fit a minute's work, so goals ask 60–66%, 68–74%, then 74–78%.
  // Each band ramps gradually while preserving five-mine challenge/recovery cycles.
  const baseShare =
    layoutVersion < 3
      ? index < 10
        ? 0.475
        : index < 40
          ? 0.545 + (0.03 * (index - 10)) / 29
          : 0.625 + (0.03 * (index - 40)) / 59
      : index < 10
        ? 0.6 + (0.06 * index) / 9
        : index < 40
          ? 0.68 + (0.06 * (index - 10)) / 29
          : 0.74 + (0.04 * (index - 40)) / 59;
  const targetShare = baseShare + difficultyRhythm[index % 5];
  const treasure = map.filter((obj) => obj.type !== "rock");
  const richness =
    LEVELS[index].target / (targetShare * treasure.reduce((sum, obj) => sum + obj.value, 0));
  treasure.forEach((obj) => {
    obj.value = Math.round(obj.value * richness);
  });
  return richness;
}
// Phase 4: add TNT and pigs where a safe, reachable spot is found.
function addHazards(map, index, layoutVersion, rand, richness) {
  const hazards = [];
  if (layoutVersion === 1) {
    const count = Math.min(6, 1 + Math.floor(index / 4));
    hazards.push(...Array(count).fill("tnt"));
    const pigTier = Math.min(3, 1 + Math.floor(index / 5));
    hazards.push(...Array(Math.floor(rand() * (pigTier + 1))).fill("pig"));
    const diamondTier = index < 9 ? 0 : index >= 19 ? 2 : 1;
    hazards.push(...Array(Math.floor(rand() * (diamondTier + 1))).fill("diamondPig"));
  } else {
    // Introduce TNT at mine 6 (mine 4 on v3 boards); two only on mid/late finales.
    if (index >= (layoutVersion < 3 ? 5 : 3)) hazards.push("tnt");
    if (index >= 10 && index % 5 === 4) hazards.push("tnt");
    if (index >= 10) hazards.push("pig", "diamondPig");
  }
  for (const type of hazards) {
    const obj = {
      type,
      id: map.length,
      ...types[type],
      taken: false,
      rotation: rand() * 0.6 - 0.3,
    };
    if (type === "diamondPig")
      obj.value =
        types.pig.value + Math.round((types.diamondPig.value - types.pig.value) * richness);
    for (let attempt = 0; attempt < 500; attempt++) {
      obj.x = 85 + rand() * 930;
      obj.y = obj.speed ? 205 + rand() * (H - 245 - obj.radius) : 220 + rand() * 275;
      // New TNT cannot chain-react or destroy stationary treasure from its spawn.
      const safeBlast =
        layoutVersion === 1 ||
        type !== "tnt" ||
        map.every(
          (other) =>
            Math.hypot(obj.x - other.x, obj.y - other.y) >
            (other.type === "tnt" ? 2 * blastRadius : blastRadius + other.radius),
        );
      if (
        safeBlast &&
        reachable(obj.x, obj.y, layoutVersion) &&
        map.every(
          (other) =>
            Math.hypot(obj.x - other.x, obj.y - other.y) >
            obj.radius + other.radius + (obj.speed ? 4 : 18),
        )
      ) {
        if (obj.speed) {
          obj.startX = obj.x;
          obj.direction = 1;
          obj.rotation = 0;
        }
        map.push(obj);
        break;
      }
    }
  }
}
export function makeMap(index, layoutVersion = 3) {
  const rand = random(1849 + index * 719);
  const map = createObjects(chooseKinds(index, layoutVersion), layoutVersion, rand);
  const richness = scaleValues(map, index, layoutVersion);
  addHazards(map, index, layoutVersion, rand, richness);
  return map;
}
