import { RULES } from "../core/levels.js";
export const hookPosition = (state) => ({
  x: RULES.origin.x + Math.sin(state.angle) * state.length,
  y: RULES.origin.y + Math.cos(state.angle) * state.length,
});
