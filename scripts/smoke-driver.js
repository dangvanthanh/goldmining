// Browser-only fixture driver. Production sources are served byte-for-byte.
import { app } from "../src/main.js";
import { makeMap } from "../src/core/map.js";
import { createFacets } from "../src/render/facets.js";
import { validSave } from "../src/core/save.js";
import { RULES } from "../src/core/levels.js";
const origin = RULES.origin,
  W = RULES.width;
const seed = (patch, resume = true) => {
  const now = app.clock.now(),
    s = app.game.snapshot(now);
  if (!s) throw Error("Start the expedition first");
  Object.assign(s, patch);
  if (app.command("restore", s, now) === false) throw Error("Invalid smoke snapshot");
  if (resume && s.phase === "paused") app.command("resume", undefined, now);
  return s;
};
let preview;
const draw = (state = preview ?? app.game.state, fx = app.effects.state) =>
  app.renderer.draw(state, fx, app.clock.now());
window.__hudWrites = 0;
const observer = new MutationObserver(() => window.__hudWrites++);
observer.observe(document.querySelector(".hud"), {
  subtree: true,
  attributes: true,
  childList: true,
  characterData: true,
});
Object.assign(window, {
  SceneAssets: app.assets,
  VisualConstants: app.constants,
  ProspectorArt: app.providers,
  ClassicArt: app.providers.classic,
  CavernArt: app.providers.cavern,
  SkyArt: app.providers.sky,
});
window.__smoke = {
  state: () => {
    const s = app.game.state;
    return {
      phase: s.phase,
      time: s.time,
      bank: s.bank,
      haul: s.haul,
      shownScore: app.effects.state.shownScore,
      length: s.length,
      hookState: s.hookState,
      caught: s.caught?.id ?? null,
      shakeMag: app.effects.state.shakeMag,
      objectAspect: RULES.objectAspect,
      fit: app.renderer.fit,
      level: s.level,
      taken: s.objects.filter((o) => o.taken).map((o) => o.id),
    };
  },
  credit: (n) => seed({ haul: n }),
  expire: () => seed({ time: 0, phase: "paused" }),
  catch: (type) => {
    const obj = app.game.state.objects.find((o) => !o.taken && o.type === type);
    seed({
      taken: [...new Set([...app.game.snapshot(app.clock.now()).taken, obj.id])],
      caughtId: obj.id,
      hookState: "back",
      length: 180,
    });
  },
  launchAt: (type, keepAnother = false) => {
    const board = app.game.state.objects,
      obj = board.find((o) => !o.taken && o.type === type),
      other = keepAnother
        ? board.find(
            (o) =>
              o !== obj &&
              Math.abs(
                Math.atan2(o.x - origin.x, o.y - origin.y) -
                  Math.atan2(obj.x - origin.x, obj.y - origin.y),
              ) > 0.4,
          )
        : null;
    seed({
      taken: board.filter((o) => o !== obj && o !== other).map((o) => o.id),
      caughtId: null,
      hookState: "swing",
      length: 23,
      angle: Math.atan2(obj.x - origin.x, obj.y - origin.y),
    });
    app.command("drop");
    return obj.id;
  },
  sounds: () => {
    for (const name of app.audio.names) app.audio.play(name, 1);
    return app.audio.names;
  },
  musicState: () => app.audio.state,
  pigsAtEdge: (edge) => {
    let count = 0;
    preview = {
      ...app.game.state,
      objects: app.game.state.objects.map((o) => {
        if (!o.speed) return o;
        count++;
        return {
          ...o,
          x: edge === "left" ? o.radius + 40 : W - o.radius - 40,
          direction: edge === "left" ? -1 : 1,
        };
      }),
    };
    return count;
  },
  effects: () => ({
    particles: app.effects.state.particles.length,
    crankAngle: app.effects.state.crankAngle,
    reelClick: app.game.state.reelClick,
  }),
  presentation: () => ({
    rings: app.effects.state.rings.length,
    trail: app.effects.state.trail.length,
    portrait: app.renderer.portraitBox,
  }),
  backgroundPixels: () =>
    [
      [120, 240],
      [220, 370],
      [870, 450],
    ].flatMap(([x, y]) => [
      ...app.renderer.background
        .getContext("2d")
        .getImageData(
          Math.round(app.renderer.fit.ox + x * app.renderer.fit.sx),
          Math.round(app.renderer.fit.oy + y * app.renderer.fit.sy),
          1,
          1,
        ).data,
    ]),
  cartGold: () => {
    const { fit, ctx } = app.renderer,
      r = {
        x: Math.floor(fit.ox + 646 * fit.sx),
        y: Math.floor(fit.oy + 70 * fit.sy),
        width: Math.ceil(134 * fit.sx),
        height: Math.ceil(23 * fit.sy),
      },
      d = ctx.getImageData(r.x, r.y, r.width, r.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] > 140 && d[i + 1] > 100 && d[i + 2] < 130) n++;
    return n;
  },
  revealed: () => {
    const ctx = app.renderer.ctx,
      labels = [],
      fill = ctx.fillText;
    ctx.fillText = function (text, ...args) {
      const m = this.measureText(text),
        t = this.getTransform(),
        pad = this.lineWidth / 2;
      labels.push({
        text,
        font: this.font,
        box: {
          x: t.e + (args[0] - m.actualBoundingBoxLeft - pad) * t.a,
          y: t.f + (args[1] - m.actualBoundingBoxAscent - pad) * t.d,
          width: (m.actualBoundingBoxLeft + m.actualBoundingBoxRight + 2 * pad) * t.a,
          height: (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + 2 * pad) * t.d,
        },
      });
      return fill.call(this, text, ...args);
    };
    try {
      draw();
    } finally {
      ctx.fillText = fill;
      preview = undefined;
    }
    return labels;
  },
  blast: () => {
    const now = app.clock.now();
    app.effects.consume({ type: "blast-source", pos: { x: 300, y: 350 }, radius: 25, now });
    app.effects.consume({ type: "blast", kind: "tnt", pos: { x: 300, y: 350 }, radius: 25, now });
  },
  gear: () => seed({ dynamite: 2, strength: true, book: true, magnet: true }),
  mine: (index) => {
    const now = app.clock.now(),
      old = app.game.snapshot(now);
    app.command("newExpedition", undefined, now);
    seed({
      ...old,
      level: index,
      bank: 0,
      haul: 0,
      time: 60,
      phase: "paused",
      angle: 0,
      swing: -0.8,
      length: 23,
      hookState: "swing",
      caughtId: null,
      taken: [],
      magnetArmed: false,
    });
  },
  shake: app.effects.shake,
  makeMap: (i, v) =>
    makeMap(i, v ?? app.game.state.mapVersion).map((o) => ({ ...o, ...createFacets(i, o) })),
  validSave,
  saveProgress: () => app.command("save"),
  rig: (a, l, mode) => {
    const state = {
        ...app.game.state,
        angle: a,
        length: l,
        hookState: mode,
        caught: mode === "back" ? app.game.state.objects.find((o) => o.type === "rock") : null,
      },
      fx = { ...app.effects.state, crankAngle: a },
      ctx = app.renderer.ctx,
      fit = app.renderer.fit,
      constants = app.constants;
    const methods = {
      moveTo: ctx.moveTo,
      quadraticCurveTo: ctx.quadraticCurveTo,
      arc: ctx.arc,
      ellipse: ctx.ellipse,
    };
    let start, cable, eye, handle;
    ctx.moveTo = function (x, y) {
      start = { x, y };
      return methods.moveTo.call(this, x, y);
    };
    ctx.quadraticCurveTo = function (cx, cy, x, y) {
      if (start?.x === 550 && start?.y === 132) cable = { from: start, to: { x, y } };
      return methods.quadraticCurveTo.call(this, cx, cy, x, y);
    };
    ctx.arc = function (x, y, r, ...args) {
      if (x === 0 && y === constants.rig.eyeY && r === constants.rig.eyeRadius) {
        const t = this.getTransform(),
          yy = y - r;
        eye = {
          x: (t.a * x + t.c * yy + t.e - fit.ox) / fit.sx,
          y: (t.b * x + t.d * yy + t.f - fit.oy) / fit.sy,
        };
      }
      return methods.arc.call(this, x, y, r, ...args);
    };
    ctx.ellipse = function (x, y, rx, ry, ...args) {
      if (rx === 4.5 && ry === 4.5) handle = { x, y };
      return methods.ellipse.call(this, x, y, rx, ry, ...args);
    };
    let result;
    try {
      draw(state, fx);
      result = app.renderer.geometry(state, fx);
    } finally {
      Object.assign(ctx, methods);
    }
    const { operator, grip, operatorFeet } = result;
    let gloveError = 0;
    if (operator) {
      const c = document.createElement("canvas");
      c.width = app.renderer.canvas.width;
      c.height = app.renderer.canvas.height;
      const ref = c.getContext("2d"),
        width = (operator.height * operator.image.width) / operator.image.height;
      ref.setTransform(fit.sx, 0, 0, fit.sy, fit.ox, fit.oy);
      ref.drawImage(operator.image, operator.x - width / 2, operator.y, width, operator.height);
      gloveError = Math.max(
        ...[
          [0.89, 0.409],
          [0.91, 0.419],
          [0.92, 0.43],
        ].map(([u, v]) => {
          const px = Math.round(fit.ox + (operator.x - width / 2 + u * width) * fit.sx),
            py = Math.round(fit.oy + (operator.y + v * operator.height) * fit.sy),
            actual = ctx.getImageData(px, py, 1, 1).data,
            expected = ref.getImageData(px, py, 1, 1).data;
          return Math.max(...[0, 1, 2].map((i) => Math.abs(actual[i] - expected[i])));
        }),
      );
    }
    return { cable, eye, grip, handle, operatorFeet, gloveError };
  },
};
export const cleanup = () => observer.disconnect();
