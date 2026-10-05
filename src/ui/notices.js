import { money } from "./format.js";
const NOTICES = {
  blast: (e) =>
    e.kind === "tnt"
      ? "TNT! Nearby treasure destroyed. No points earned."
      : "Catch destroyed. Back to the good stuff.",
  reward(e) {
    if (e.objectType === "bag") return "Mystery bag! You found " + money(e.value) + ".";
    if (e.objectType === "diamondPig") return "Diamond-mouth pig! " + money(e.value) + " secured.";
    return null;
  },
  magnet: (e) => (e.armed ? "Magnetic claw armed for your next launch." : "Magnetic claw stowed."),
};
// Player-facing toast for a core event, or null when it has none.
export const noticeFor = (e) => NOTICES[e.type]?.(e) ?? null;
