import { LEVELS, TYPES as types, RULES } from "./levels.js";
const { diamondBonus, dynamiteCapacity } = RULES;
export function supplyPrices(index) {
  const goal = LEVELS[index].target;
  // Scale sinks with the upcoming mine, rounded to readable $25 price steps.
  return {
    dynamite: Math.max(100, Math.ceil((goal * 0.05) / 25) * 25),
    strength: Math.max(150, Math.ceil((goal * 0.12) / 25) * 25),
    book: Math.max(150, Math.ceil((goal * 0.12) / 25) * 25),
    magnet: Math.max(75, Math.ceil((goal * 0.06) / 25) * 25),
  };
}
export function catchValue(obj, book = false) {
  return obj.type === "diamondPig"
    ? types.pig.value + Math.round((obj.value - types.pig.value) * (book ? diamondBonus : 1))
    : Math.round(obj.value * (obj.type === "diamond" && book ? diamondBonus : 1));
}
export const SUPPLY_KEYS = Object.freeze(["dynamite", "strength", "book", "magnet", "magnetArmed"]);
export const suppliesOf = (state) =>
  Object.fromEntries(SUPPLY_KEYS.map((key) => [key, state[key]]));
export function buySupplies({ phase, level, bank, supplies }, item) {
  if (phase !== "shop" || level >= LEVELS.length - 1) return false;
  const prices = supplyPrices(level + 1);
  if (
    !Object.hasOwn(prices, item) ||
    bank < prices[item] ||
    (item === "dynamite" && supplies.dynamite >= dynamiteCapacity) ||
    (item === "strength" && supplies.strength) ||
    (item === "book" && supplies.book) ||
    (item === "magnet" && supplies.magnet)
  )
    return false;
  return {
    bank: bank - prices[item],
    supplies: {
      ...supplies,
      [item]: item === "dynamite" ? supplies.dynamite + 1 : true,
    },
  };
}
export function settleMine(s) {
  if (s.phase !== "playing") return false;
  const total = s.bank + s.haul,
    goal = LEVELS[s.level].target;
  return total < goal
    ? { ...s, time: 0, phase: "lost" }
    : {
        ...s,
        time: 0,
        bank: total - goal,
        haul: 0,
        strength: false,
        book: false,
        phase: s.level === LEVELS.length - 1 ? "won" : "shop",
      };
}
