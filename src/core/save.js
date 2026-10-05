import { LEVELS, RULES } from "./levels.js";
import { makeMap } from "./map.js";
export const SAVE_PHASES = ["paused", "shop", "lost", "won"];
export const HOOK_STATES = ["swing", "out", "back"];
export const HISTORIC_FINALES = [9, 29, 49];
const validHeader = (s) =>
  Boolean(s) &&
  s.version === 1 &&
  Number.isInteger(s.level) &&
  s.level >= 0 &&
  s.level < LEVELS.length &&
  (s.mapVersion === undefined || [1, 2, 3].includes(s.mapVersion));
const validPhase = (s) =>
  SAVE_PHASES.includes(s.phase) &&
  (s.phase !== "shop" || s.level < LEVELS.length - 1) &&
  (s.phase !== "won" || s.level === LEVELS.length - 1 || HISTORIC_FINALES.includes(s.level));
const validCash = (s) =>
  ["bank", "haul", "dynamite"].every((k) => Number.isSafeInteger(s[k]) && s[k] >= 0);
const validFlags = (s) =>
  ["strength", "book", "sound"].every((k) => typeof s[k] === "boolean") &&
  ["magnet", "magnetArmed"].every((k) => s[k] === undefined || typeof s[k] === "boolean");
const validHook = (s) =>
  Number.isFinite(s.time) &&
  s.time >= 0 &&
  s.time <= RULES.roundSeconds &&
  Number.isFinite(s.angle) &&
  Math.abs(s.angle) <= RULES.swingAmplitude &&
  Number.isFinite(s.swing) &&
  Number.isFinite(s.length) &&
  s.length >= RULES.restLength &&
  s.length <= RULES.maxLength &&
  HOOK_STATES.includes(s.hookState);
const validTaken = (s, board) =>
  Array.isArray(s.taken) &&
  s.taken.every((id) => Number.isInteger(id) && id >= 0 && id < board.length) &&
  (s.caughtId === null ||
    (Number.isInteger(s.caughtId) &&
      s.taken.includes(s.caughtId) &&
      board[s.caughtId]?.type !== "tnt" &&
      s.hookState === "back"));
export function validSave(s, makeBoard = makeMap) {
  if (!validHeader(s)) return false;
  const board = makeBoard(s.level, s.mapVersion ?? 1);
  return validPhase(s) && validCash(s) && validFlags(s) && validHook(s) && validTaken(s, board);
}
export function encodeSave(s, now = 0) {
  if (s.phase === "ready") return null;
  const {
    mapVersion,
    level,
    bank,
    haul,
    time,
    phase,
    angle,
    swing,
    length,
    hookState,
    caught,
    objects,
    dynamite,
    strength,
    book,
    sound,
    magnet,
    magnetArmed,
    deadline,
  } = s;
  return {
    id: "expedition",
    version: 1,
    mapVersion,
    level,
    bank,
    haul,
    time: phase === "playing" ? Math.max(0, (deadline - now) / 1000) : time,
    phase: phase === "playing" ? "paused" : phase,
    angle,
    swing,
    length,
    hookState,
    caughtId: caught?.id ?? null,
    taken: objects.filter((o) => o.taken).map((o) => o.id),
    dynamite,
    strength,
    book,
    sound,
    magnet,
    magnetArmed,
  };
}
export function decodeSave(s, makeBoard = makeMap) {
  if (!validSave(s, makeBoard)) return false;
  return {
    ...s,
    taken: [...s.taken],
    mapVersion: s.mapVersion ?? 1,
    magnet: s.magnet ?? false,
    magnetArmed: s.magnetArmed ?? false,
    phase: s.phase === "won" && s.level < LEVELS.length - 1 ? "shop" : s.phase,
  };
}
