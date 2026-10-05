import { VisualConstants } from "./constants.js";
("use strict");
// Local decoded art only. Providers retain their procedural fallback on load failure.
export function createSceneAssets({ constants = VisualConstants, Image = globalThis.Image } = {}) {
  const backgrounds = {},
    sprites = {},
    pending = new Set();
  let disposed = false;
  const names = [
    "gold",
    "rock",
    "diamond",
    "gem",
    "bag",
    "tnt",
    "pig",
    "cart",
    "winch",
    "normal",
    "pulling",
    "surprised",
    "happy",
    "worried",
  ];
  function load(name, target) {
    return new Promise((resolve) => {
      const image = new Image(),
        record = { image, resolve };
      pending.add(record);
      const finish = (loaded) => {
        pending.delete(record);
        image.onload = image.onerror = null;
        if (disposed) return;
        if (loaded) target[name] = image;
        resolve(loaded);
      };
      image.onload = () => finish(true);
      image.onerror = () => finish(false);
      image.src = `assets/aaa/${name}.webp`;
    });
  }
  const ready = Promise.all([
    ...["classic", "sky", "sky-tall", "cavern"].map((name) => load(name, backgrounds)),
    ...names.map((name) => load(name, sprites)),
  ]);
  function paintBackground(theme, canvas, view) {
    const c = canvas.getContext("2d"),
      { left = 0, right = 1100, top = 0, bottom = 580 } = view;
    const width = right - left,
      height = bottom - top;
    // Sky's tall composition keeps the ruins visible instead of enlarging clouds.
    const tall =
      theme === "sky" && height / width > constants.sky.tallRatio && backgrounds["sky-tall"];
    const image = tall && backgrounds.sky ? tall : backgrounds[theme];
    if (!image) return false;
    if (theme === "sky") {
      // One continuous image, anchored at the live rig shelf. Independently
      // cropping two planes would create a visible seam through these islands.
      const ground = constants.sky.ground;
      const horizon = tall ? constants.sky.tallHorizon : constants.authored.horizon.sky;
      const scale = Math.max(
        width / image.naturalWidth,
        (ground - top) / (image.naturalHeight * horizon),
        (bottom - ground) / (image.naturalHeight * (1 - horizon)),
      );
      const w = image.naturalWidth * scale,
        h = image.naturalHeight * scale;
      c.drawImage(image, left + (width - w) / 2, ground - h * horizon, w, h);
    } else if (theme === "cavern") {
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const w = image.naturalWidth * scale,
        h = image.naturalHeight * scale;
      c.drawImage(image, left + (width - w) / 2, top + (height - h) / 2, w, h);
    } else {
      const ground = 142,
        horizon = constants.authored.horizon[theme];
      // Classic retains separate depth planes so tall screens do not magnify soil.
      const skyline = image.naturalHeight * horizon;
      for (const [sy, sh, dy, dh] of [
        [0, skyline, top, ground - top],
        [skyline, image.naturalHeight - skyline, ground, bottom - ground],
      ]) {
        if (dh <= 0) continue;
        const scale = Math.max(width / image.naturalWidth, dh / sh),
          w = image.naturalWidth * scale,
          h = sh * scale;
        c.save();
        c.beginPath();
        c.rect(left, dy, width, dh);
        c.clip();
        c.drawImage(image, 0, sy, image.naturalWidth, sh, left + (width - w) / 2, dy, w, h);
        c.restore();
      }
    }
    return true;
  }
  function ambient(ctx, now, env, theme) {
    const cfg = constants.authored,
      t = now / 1000;
    const view = env.view || { left: 0, right: 1100, top: 0, bottom: 580 };
    ctx.save();
    ctx.fillStyle = theme === "cavern" ? "#ffe1a1" : "#fff2cc";
    for (let i = 0; i < cfg.motes; i++) {
      const x = view.left + ((i * 137 + t * cfg.drift) % (view.right - view.left));
      const y =
        view.top + (((i * 83) % 580) / 580) * (view.bottom - view.top) + Math.sin(t * 0.5 + i) * 4;
      ctx.globalAlpha = cfg.moteAlpha * (0.6 + Math.sin(t + i) * 0.4);
      const size = cfg.motePx / (env.scale || 1);
      ctx.fillRect(x, y, size, size);
    }
    ctx.restore();
  }
  function destroy() {
    if (disposed) return;
    disposed = true;
    for (const { image, resolve } of pending) {
      image.onload = image.onerror = null;
      image.src = "";
      resolve(false);
    }
    pending.clear();
    for (const target of [backgrounds, sprites])
      for (const name of Object.keys(target)) delete target[name];
  }
  return { backgrounds, sprites, ready, paintBackground, ambient, destroy };
}
