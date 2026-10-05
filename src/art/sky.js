import { shape, glow } from "./canvas.js";
import { VisualConstants } from "./constants.js";
("use strict");
// Sky is an airborne realm: ivory islands, open blue air and a moving cloud sea.
// Static scenery is baked once; the same native atmosphere runs with local art
// or the procedural fallback. Provider contract and game coordinates stay intact.
export function createSkyArt({ constants = VisualConstants, assets } = {}) {
  const cfg = constants.sky;
  const fade = (color) => [
    [0, color],
    [1, "#ffffff00"],
  ];
  const lit = false,
    bannerTint = cfg.bannerTint;
  function random(seed) {
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }
  // One translucent cloud sprite, reused across both art paths and screen sizes.
  let cloudSprite;
  function cloudImage() {
    if (cloudSprite) return cloudSprite;
    cloudSprite = document.createElement("canvas");
    cloudSprite.width = 600;
    cloudSprite.height = 240;
    const c = cloudSprite.getContext("2d");
    for (const [x, y, rx, ry] of [
      [105, 136, 104, 64],
      [222, 92, 126, 85],
      [340, 109, 116, 74],
      [470, 147, 116, 52],
    ]) {
      glow(c, x, y, rx, ry, fade(cfg.cloudShade));
      glow(c, x - 7, y - 18, rx * 0.91, ry * 0.83, fade(cfg.cloud));
    }
    return cloudSprite;
  }
  function arch(c, x, y, size) {
    c.save();
    c.translate(x, y);
    c.scale(size, size);
    c.strokeStyle = cfg.stoneShade;
    c.lineWidth = 9;
    c.beginPath();
    c.moveTo(-16, 0);
    c.lineTo(-16, -29);
    c.arc(0, -29, 16, Math.PI, 0);
    c.lineTo(16, 0);
    c.stroke();
    c.strokeStyle = cfg.ruin;
    c.lineWidth = 7;
    c.beginPath();
    c.moveTo(-18, 0);
    c.lineTo(-18, -30);
    c.arc(-2, -30, 16, Math.PI, 0);
    c.lineTo(14, 0);
    c.stroke();
    c.fillStyle = cfg.ivory;
    c.fillRect(-24, -33, 13, 4);
    c.fillRect(9, -33, 13, 4);
    c.fillRect(-24, -3, 13, 5);
    c.fillRect(9, -3, 13, 5);
    c.strokeStyle = "#6c999844";
    c.lineWidth = 0.8;
    for (let yy = -9; yy > -29; yy -= 8) {
      c.beginPath();
      c.moveTo(-22, yy);
      c.lineTo(-14, yy);
      c.moveTo(10, yy);
      c.lineTo(18, yy);
      c.stroke();
    }
    c.restore();
  }
  function island(c, { x, y, width, depth, seed, ruin = false }) {
    const rand = random(seed),
      points = [
        [-width * 0.5, 0],
        [-width * 0.33, depth * 0.57],
        [-width * 0.12, depth * 0.84],
        [0, depth],
        [width * 0.17, depth * 0.66],
        [width * 0.38, depth * 0.53],
        [width * 0.5, 0],
      ];
    c.save();
    c.translate(x, y);
    const stone = c.createLinearGradient(-width * 0.4, 0, width * 0.4, depth);
    stone.addColorStop(0, cfg.ivory);
    stone.addColorStop(0.46, cfg.stone);
    stone.addColorStop(1, cfg.stoneShade);
    shape(c, points, stone);
    shape(
      c,
      [
        [-width * 0.5, 0],
        [-width * 0.33, depth * 0.57],
        [-width * 0.12, depth * 0.84],
        [-width * 0.19, depth * 0.31],
      ],
      "#fffbed99",
    );
    shape(
      c,
      [
        [0, depth],
        [width * 0.17, depth * 0.66],
        [width * 0.38, depth * 0.53],
        [width * 0.27, depth * 0.12],
      ],
      "#629eb54d",
    );
    c.save();
    shape(c, points, stone);
    c.clip();
    for (let i = 0; i < 18; i++) {
      const xx = (rand() - 0.5) * width,
        yy = rand() * depth;
      shape(
        c,
        [
          [xx, yy],
          [xx + 7, yy + depth * 0.17],
          [xx + 17, yy + 4],
        ],
        rand() > 0.5 ? "#f6fff12a" : "#588f9c20",
      );
    }
    c.restore();
    const turf = [];
    for (let xx = -width * 0.5; xx <= width * 0.5; xx += width / 18)
      turf.push([xx, -4 - Math.sin(xx * 0.07) * 2 - rand() * 3]);
    shape(c, [...turf, [width * 0.5, 4], [-width * 0.5, 4]], cfg.moss);
    c.strokeStyle = cfg.mossLight;
    c.lineWidth = 2;
    c.beginPath();
    turf.forEach(([xx, yy], i) => (i ? c.lineTo(xx, yy) : c.moveTo(xx, yy)));
    c.stroke();
    for (let i = 0; i < width / 5; i++) {
      const xx = (rand() - 0.5) * width,
        yy = -5 - rand() * 4;
      c.fillStyle = rand() > 0.5 ? cfg.cloud : cfg.mossLight;
      c.fillRect(xx, yy, 1.3, 1.3);
    }
    for (let i = 0; i < 4; i++) {
      const xx = (rand() - 0.5) * width * 0.9;
      shape(
        c,
        [
          [xx, -2],
          [xx + 4, 12 + rand() * 15],
          [xx + 9, 2],
        ],
        cfg.moss + "bb",
      );
    }
    if (ruin) arch(c, -width * 0.07, -6, Math.min(1.8, width / 160));
    c.restore();
  }
  function paintBackground(canvas, seed, view = { top: 0, bottom: 580, aspect: 1 }) {
    if (assets?.paintBackground("sky", canvas, view)) return;
    const c = canvas.getContext("2d"),
      { left = 0, right = 1100, top = 0, bottom = 580 } = view;
    const width = right - left,
      height = bottom - top,
      rand = random(cfg.seed + seed * 977);
    const sky = c.createLinearGradient(0, top, 0, bottom);
    sky.addColorStop(0, cfg.zenith);
    sky.addColorStop(0.28, cfg.haze);
    sky.addColorStop(0.55, "#55b5d4");
    sky.addColorStop(1, cfg.depth);
    c.fillStyle = sky;
    c.fillRect(left, top, width, height);
    glow(
      c,
      cfg.sunX,
      Math.min(cfg.sunY, top + height * 0.11),
      width * 0.4,
      height * 0.46,
      fade("#fff8d29c"),
    );
    // Clouds and distant ruins behind the live rig, never a continuous dirt wall.
    const cloud = cloudImage();
    for (let i = 0; i < cfg.islandCount; i++) {
      const x = left + ((i + 0.35) / cfg.islandCount) * width,
        y = Math.min(112, top + (cfg.ground - top) * (0.45 + rand() * 0.3));
      const size = 75 + rand() * 70;
      c.globalAlpha = 0.5 + rand() * 0.25;
      island(c, { x, y, width: size, depth: size * 0.44, seed: cfg.seed + i, ruin: i % 2 === 0 });
      c.globalAlpha = 1;
      c.drawImage(cloud, x - size, y - 12, size * 2, size * 0.7);
    }
    // Mossy shelves frame empty air; a gap stays beneath the cable at x550.
    island(c, { x: 100, y: cfg.ground, width: 270, depth: 158, seed: cfg.seed, ruin: true });
    island(c, { x: 1015, y: cfg.ground, width: 280, depth: 185, seed: cfg.seed + 1, ruin: true });
    island(c, { x: 437, y: cfg.ground, width: 207, depth: 64, seed: cfg.seed + 2 });
    island(c, { x: 688, y: cfg.ground, width: 250, depth: 67, seed: cfg.seed + 3 });
    // Background-only terraces sit well outside the playable center.
    c.globalAlpha = 0.4;
    island(c, { x: 90, y: 385, width: 185, depth: 110, seed: cfg.seed + 4, ruin: true });
    island(c, { x: 995, y: 411, width: 160, depth: 96, seed: cfg.seed + 5, ruin: true });
    island(c, { x: 820, y: 329, width: 86, depth: 69, seed: cfg.seed + 6, ruin: true });
    c.globalAlpha = 1;
    for (let i = 0; i < 9; i++) {
      const size = 120 + (i % 3) * 50,
        x = left + (i / 8) * width;
      c.drawImage(cloud, x - size, bottom - size * 0.65, size * 2, size * 0.8);
    }
    const mist = c.createLinearGradient(0, bottom - 110, 0, bottom);
    mist.addColorStop(0, "#e2f5f000");
    mist.addColorStop(1, "#e2f5f06b");
    c.fillStyle = mist;
    c.fillRect(left, bottom - 110, width, 110);
  }
  function paintLight() {} // The entire realm is illuminated by open daylight.
  // Project waterfall landmarks through the same lower plane as the local image.
  function falls(view) {
    const images = assets?.backgrounds;
    if (!images?.sky)
      return [
        { x: 107, y: cfg.ground, length: 150, width: 10 },
        { x: 1000, y: cfg.ground, length: 174, width: 13 },
      ];
    const { left = 0, right = 1100, top = 0, bottom = 580 } = view;
    const tall = (bottom - top) / (right - left) > cfg.tallRatio && images["sky-tall"];
    const image = tall || images.sky,
      horizon = tall ? cfg.tallHorizon : constants.authored.horizon.sky;
    const start = tall ? cfg.tallFallStart : cfg.fallStart,
      end = tall ? cfg.tallFallEnd : cfg.fallEnd;
    const scale = Math.max(
      (right - left) / image.naturalWidth,
      (cfg.ground - top) / (image.naturalHeight * horizon),
      (bottom - cfg.ground) / (image.naturalHeight * (1 - horizon)),
    );
    const offset = left + (right - left - image.naturalWidth * scale) / 2;
    return (tall ? cfg.tallFalls : cfg.falls).map((u) => ({
      x: offset + u * image.naturalWidth * scale,
      y: cfg.ground + (start - horizon) * image.naturalHeight * scale,
      length: image.naturalHeight * (end - start) * scale,
      width: image.naturalWidth * cfg.fallWidth * scale,
    }));
  }
  function drawAmbient(ctx, now, env) {
    const t = now / 1000,
      view = env.view || { left: 0, right: 1100, top: 0, bottom: 580 };
    const { left = 0, right = 1100, top = 0, bottom = 580 } = view,
      width = right - left,
      height = bottom - top;
    ctx.save();
    // Small moving highlights, not a second opaque waterfall painted over art.
    for (const fall of falls(view)) {
      const mist = ctx.createLinearGradient(0, fall.y, 0, fall.y + fall.length);
      mist.addColorStop(0, "#e1ffff00");
      mist.addColorStop(0.16, "#e1ffff70");
      mist.addColorStop(1, "#e1ffff00");
      ctx.globalAlpha = cfg.fallAlpha;
      ctx.fillStyle = mist;
      ctx.fillRect(fall.x - fall.width / 2, fall.y, fall.width, fall.length);
      ctx.strokeStyle = "#f4ffff";
      ctx.lineWidth = 1 / (env.scale || 1);
      ctx.lineCap = "round";
      for (let i = 0; i < cfg.fallStrands; i++) {
        const y = fall.y + ((t * cfg.fallSpeed + i * 29) % fall.length),
          x = fall.x + (i / (cfg.fallStrands - 1) - 0.5) * fall.width * 0.65;
        ctx.globalAlpha = cfg.fallAlpha * Math.sin(((y - fall.y) / fall.length) * Math.PI);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 7);
        ctx.stroke();
      }
      ctx.globalAlpha = cfg.fallAlpha;
      glow(ctx, fall.x, fall.y + fall.length, fall.width * 3, 12, fade("#e2ffff66"));
    }
    // Slow translucent wisps at the perimeter keep the central targets crisp.
    const cloud = cloudImage(),
      cycle = width + cfg.cloudSize * 4;
    ctx.globalAlpha = cfg.cloudAlpha;
    for (let i = 0; i < cfg.cloudCount; i++) {
      const x =
        left +
        (((i * cycle) / cfg.cloudCount + t * cfg.cloudSpeed * (1 + i * 0.17)) % cycle) -
        cfg.cloudSize * 2;
      const y =
        i % 2
          ? bottom - cfg.cloudSize * 0.6
          : Math.min(90, top + (cfg.ground - top) * (0.34 + i * 0.08));
      ctx.drawImage(cloud, x, y, cfg.cloudSize * 2.6, cfg.cloudSize);
    }
    // White birds follow a quiet arc above the islands, never in the ore field.
    ctx.globalAlpha = 0.82;
    ctx.strokeStyle = cfg.cloud;
    ctx.lineWidth = 1.4 / (env.scale || 1);
    for (let i = 0; i < cfg.birdCount; i++) {
      const x = left + ((width * 0.5 + t * cfg.birdSpeed + i * 26) % (width + 430)) - 160;
      const y = top + (cfg.ground - top) * 0.4 + Math.sin(t * 0.45 + i * 0.2) * 8 + i * 3;
      const flap = Math.sin(t * 4.6 + i) * 3,
        size = cfg.birdSize;
      ctx.beginPath();
      ctx.moveTo(x - size, y - flap);
      ctx.quadraticCurveTo(x - size * 0.4, y - 3, x, y);
      ctx.quadraticCurveTo(x + size * 0.4, y - 3, x + size, y - flap);
      ctx.stroke();
    }
    // Airborne spores are tiny and sparse, unlike cavern sparks or soil grains.
    ctx.fillStyle = cfg.cloud;
    for (let i = 0; i < cfg.moteCount; i++) {
      const x = left + ((i * 137 + t * cfg.moteSpeed) % width),
        y = top + ((i * 83 + t * cfg.moteSpeed * 0.35) % height);
      ctx.globalAlpha = cfg.moteAlpha * (0.5 + 0.5 * Math.sin(t * 0.8 + i));
      const size = 1.2 / (env.scale || 1);
      ctx.fillRect(x, y, size, size);
    }
    const pulse = Math.max(env.pulse || 0, env.entrance || 0);
    if (pulse) {
      ctx.globalAlpha = constants.pulseAlpha * pulse;
      glow(ctx, 550, 240, 360, 260, fade("#e0fff4"));
    }
    ctx.restore();
  }
  const surfaces = new Map();
  function surface(id, radius, rocky) {
    const key = `${id}:${radius}:${rocky}`;
    if (surfaces.has(key)) return surfaces.get(key);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = Math.ceil(radius * 2.6);
    const c = canvas.getContext("2d"),
      rand = random(cfg.seed + id * 137);
    for (let i = 0; i < cfg.surfaceGrain; i++) {
      c.fillStyle = rand() > 0.5 ? cfg.surfaceLight : cfg.surfaceShade;
      c.fillRect(rand() * canvas.width, rand() * canvas.height, 0.7 + rand() * 1.5, 0.8);
    }
    surfaces.set(key, canvas);
    return canvas;
  }
  return { paintBackground, paintLight, drawAmbient, surface, lit, bannerTint };
}
