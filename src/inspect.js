import { LEVELS } from "./core/levels.js";
import { catchValue } from "./core/economy.js";
import { hookPosition } from "./render/geometry.js";
// Read-only JSON-ready snapshot of the running game (field units, top-left origin).
export function inspect({ game, renderer, dialogs, effects, canvas }) {
  const s = game.state;
  return {
    coordinates: "Field units: origin top-left; x right, y down. Uniform viewport scale.",
    phase: s.phase,
    modal: dialogs.active()?.id ?? null,
    art: renderer.artName,
    mine: s.level + 1,
    score: s.bank + s.haul,
    displayedScore: effects.state.shownScore,
    bank: s.bank,
    haul: s.haul,
    target: LEVELS[s.level].target,
    secondsLeft: s.time,
    viewport: { width: canvas.clientWidth, height: canvas.clientHeight, ...renderer.fit },
    hook: {
      state: s.hookState,
      angle: s.angle,
      length: s.length,
      ...hookPosition(s),
      caughtId: s.caught?.id ?? null,
    },
    supplies: {
      ...s.supplies,
    },
    objects: s.objects.map((o) => ({
      id: o.id,
      type: o.type,
      x: o.x,
      y: o.y,
      radius: o.radius,
      value: catchValue(o, s.book),
      taken: o.taken,
    })),
  };
}
