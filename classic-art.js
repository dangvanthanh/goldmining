'use strict';
// Classic look: flat, saturated cartoon geology in full daylight, in the spirit
// of Gold Miner (2003). Same contract as CavernArt so game.js can swap styles
// without branching: the board is rasterized once per mine, and drawAmbient adds
// a few cheap live touches (drifting clouds, birds) each frame.
window.ClassicArt = (() => {
  const lit = false;                 // full daylight: no lantern pass
  const bannerTint = '62,38,14';     // title cards sit on a varnished-wood band
  function random(seed) {
    return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  }
  function shape(c, points, fill, stroke, width = 1) {
    c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath();
    c.fillStyle = fill; c.fill();
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.stroke(); }
  }
  function glow(c, x, y, rx, ry, stops) {
    c.save(); c.translate(x, y); c.scale(rx, ry);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
    stops.forEach(([at, color]) => g.addColorStop(at, color));
    c.fillStyle = g; c.fillRect(-1, -1, 2, 2); c.restore();
  }
  function strata(c, w, y, amp, phase) {
    const points = [];
    for (let x = 0; x <= w; x += 20) points.push([x, y + Math.sin(x * .006 + phase) * amp]);
    return points;
  }
  function band(c, w, y, thickness, amp, phase, fill) {
    const top = strata(c, w, y, amp, phase);
    shape(c, [...top, ...top.map(([x, yy]) => [x + 2, yy + thickness]).reverse()], fill);
  }
  const GROUND = 142;   // sky above, dirt below; the rig is docked on this line
  const RIG = [420, 830];   // keep scenery props out from behind the miner and cart
  // Rolling hill heights, shared by the hill fill and the trees planted on it.
  const hill = (x, lift, amp, freq) => GROUND - lift + Math.sin(x * freq + lift) * amp + Math.sin(x * .023 + lift) * amp * .25;
  // The caller maps the 1100×580 field onto the canvas. view.top/bottom are the
  // extra rows visible on tall screens; view.aspect keeps round shapes round.
  function paintBackground(canvas, seed, lamp, view = { top: 0, bottom: 580, aspect: 1 }) {
    const c = canvas.getContext('2d'), w = 1100, h = 580, { top, bottom, aspect } = view;
    const rand = random(31337 + seed * 977);
    const round = (x, y, draw) => { c.save(); c.translate(x, y); c.scale(1, aspect); draw(); c.restore(); };
    // Sky: deep zenith blue warming to a sunlit haze on the horizon.
    const sky = c.createLinearGradient(0, Math.min(0, top), 0, GROUND + 12);
    sky.addColorStop(0, '#2a7fcb'); sky.addColorStop(.5, '#6cbbe8'); sky.addColorStop(.86, '#c4e8f5'); sky.addColorStop(1, '#f7edcf');
    c.fillStyle = sky; c.fillRect(0, top, w, GROUND + 12 - top);
    // Sun: soft god-rays fanning from a flat two-tone disc. Clouds drift over it live.
    round(930, 46, () => {
      glow(c, 0, 0, 260, 260, [[0, '#fff8d8cc'], [.25, '#ffeaa055'], [1, '#ffe9a000']]);
      const ray = c.createRadialGradient(0, 0, 24, 0, 0, 230);
      ray.addColorStop(0, '#fff4c040'); ray.addColorStop(1, '#fff4c000');
      for (let i = 0; i < 14; i++) { c.rotate(Math.PI / 7); shape(c, [[0, 0], [-11, -230], [11, -230]], ray); }
      c.beginPath(); c.arc(0, 0, 27, 0, Math.PI * 2); c.fillStyle = '#ffd24d'; c.fill();
      c.beginPath(); c.arc(-4, -4, 20, 0, Math.PI * 2); c.fillStyle = '#fff1a6'; c.fill();
    });
    // Far range: low-poly peaks with snow caps; faces turned from the sun fall into shade.
    const peaks = [];
    for (let x = -30; x < w + 60; x += 55 + rand() * 60) peaks.push([x, GROUND - 40 - rand() * 62]);
    shape(c, [[-30, GROUND + 20], ...peaks, [w + 60, GROUND + 20]], '#a9c6de');
    for (let i = 1; i < peaks.length; i++) {
      const [ax, ay] = peaks[i - 1], [bx, by] = peaks[i];
      if (by < ay) shape(c, [[ax, ay], [bx, by], [bx - (bx - ax) * .35, GROUND + 20]], '#8eaecb');   // west-facing slope
      if (by < GROUND - 78) {
        const k = .3;
        shape(c, [[bx + (ax - bx) * k, by + (ay - by) * k], [bx, by], ...(peaks[i + 1] ? [[bx + (peaks[i + 1][0] - bx) * k, by + (peaks[i + 1][1] - by) * k]] : []),
          [bx + 4, by + (GROUND - by) * .16], [bx - 5, by + (GROUND - by) * .2]], '#f1f7fc');
      }
    }
    // Atmospheric haze settles between the ranges.
    const haze = c.createLinearGradient(0, GROUND - 70, 0, GROUND + 10);
    haze.addColorStop(0, '#f6efd800'); haze.addColorStop(1, '#f6efd8aa');
    c.fillStyle = haze; c.fillRect(0, GROUND - 70, w, 80);
    // Rolling hills; the middle one carries a treeline so the horizon has depth.
    const hills = [['#86b06a', 30, 10, .006], ['#5f9541', 12, 8, .006]];
    const ridge = (lift, amp, freq) => { const r = []; for (let x = 0; x <= w; x += 20) r.push([x, hill(x, lift, amp, freq)]); return r; };
    shape(c, [[0, GROUND + 20], ...ridge(...hills[0].slice(1)), [w, GROUND + 20]], hills[0][0]);
    for (let x = 6 + rand() * 20; x < w; x += 16 + rand() * 34) {
      if (x > RIG[0] && x < RIG[1]) continue;
      const base = hill(x, 30, 10, .006) + 3, s = .7 + rand() * .55;
      round(x, base, () => {
        c.scale(s, s);
        if (rand() > .4) {   // pine: stacked tiers, lit on the sun side
          c.fillStyle = '#4a321c'; c.fillRect(-1.5, -5, 3, 6);
          for (const [y0, half, tall] of [[-4, 9, 12], [-11, 7, 11], [-18, 5, 10]]) {
            shape(c, [[-half, y0], [0, y0 - tall], [half, y0]], '#2f6a37');
            shape(c, [[0, y0], [0, y0 - tall], [half, y0]], '#45883f');
          }
        } else {             // broadleaf: trunk and three overlapping crowns
          c.fillStyle = '#4a321c'; c.fillRect(-1.5, -9, 3, 10);
          for (const [dx, dy, r, col] of [[-5, -14, 7, '#3b7a36'], [5, -15, 7, '#3b7a36'], [0, -20, 8, '#4c9142'], [2, -21, 4, '#6bb056']]) {
            c.beginPath(); c.arc(dx, dy, r, 0, Math.PI * 2); c.fillStyle = col; c.fill();
          }
        }
      });
    }
    shape(c, [[0, GROUND + 20], ...ridge(...hills[1].slice(1)), [w, GROUND + 20]], hills[1][0]);
    // Dirt body: warm at the lit top, deep umber at the floor.
    const dirt = c.createLinearGradient(0, GROUND, 0, Math.max(h, bottom));
    dirt.addColorStop(0, '#c68f52'); dirt.addColorStop(.45, '#a97038'); dirt.addColorStop(1, '#73441c');
    shape(c, [[0, bottom], ...strata(c, w, GROUND + 4, 5, 1.2), [w, bottom]], dirt);
    // Dark soil lip, its lit crumb edge, then a bright grass turf with tufts.
    band(c, w, GROUND - 2, 15, 5, 1.2, '#4a2b0f');
    band(c, w, GROUND + 12, 4, 4.6, 1.2, '#db9f5f');
    band(c, w, GROUND - 5, 7, 5, 1.2, '#5f9a35');
    band(c, w, GROUND - 5, 2.5, 5, 1.2, '#a3d466');
    for (let x = 4; x < w; x += 9 + rand() * 14) {
      const y = GROUND - 4 + Math.sin(x * .006 + 1.2) * 5, t = 4 + rand() * 6;
      shape(c, [[x - 3, y], [x - 1, y - t], [x + 1, y - t * .4], [x + 3, y - t * .9], [x + 5, y]], rand() > .5 ? '#6fae3f' : '#4f8a2c');
      if (rand() > .93 && (x < RIG[0] || x > RIG[1])) round(x + 1, y - t - 1, () => {   // wildflowers
        c.beginPath(); c.arc(0, 0, 2.2, 0, Math.PI * 2); c.fillStyle = rand() > .5 ? '#fff6e0' : '#ffd23f'; c.fill();
        c.beginPath(); c.arc(0, 0, .9, 0, Math.PI * 2); c.fillStyle = '#e08a1e'; c.fill();
      });
    }
    // Hanging roots just under the turf.
    for (let i = 0; i < 16; i++) {
      const x = rand() * w, y = GROUND + 12 + Math.sin(x * .006 + 1.2) * 5, len = 10 + rand() * 24;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (rand() - .5) * 14, y + len * .6, x + (rand() - .5) * 10, y + len);
      c.strokeStyle = '#5a3412cc'; c.lineWidth = 1.4; c.stroke();
    }
    // Broad terraced strata, the signature of the classic dirt wall.
    const beds = ['#b8803f', '#96602c', '#c89659', '#8a5524', '#b57a3a'];
    for (let y = GROUND + 34, row = 0; y < bottom; row++) {
      band(c, w, y, 9 + rand() * 22, 6, row * .7, beds[row % beds.length] + '9c');
      band(c, w, y, 2.4, 6, row * .7, '#e0a96755');
      y += 30 + rand() * 16;
    }
    // Soft pockets of darker soil break the horizontal rhythm without hard stripes.
    for (let i = 0; i < 10; i++) {
      const x = rand() * w, y = GROUND + 60 + rand() * (bottom - GROUND - 60);
      round(x, y, () => glow(c, 0, 0, 40 + rand() * 60, 18 + rand() * 20, [[0, '#6d402055'], [1, '#6d402000']]));
    }
    // Granular soil: fine light and dark grains read as packed earth up close.
    for (let i = 0; i < 9000; i++) {
      const x = rand() * w, y = GROUND + 16 + rand() * (bottom - GROUND - 16), s = .4 + rand() * 1.2;
      c.fillStyle = rand() > .5 ? '#f3c78a1c' : '#3d200a24'; c.fillRect(x, y, s * 1.6, s);
    }
    // Embedded pebbles: dark outline, flat fill, a single highlight facet.
    for (let i = 0; i < 74; i++) {
      const x = rand() * w, y = GROUND + 20 + rand() * (bottom - GROUND - 24), r = 3 + rand() * 12;
      const points = [];
      for (let a = 0; a < 7; a++) {
        const ang = a / 7 * Math.PI * 2, rr = r * (.7 + rand() * .5);
        points.push([Math.cos(ang) * rr, Math.sin(ang) * rr * .78]);
      }
      round(x, y, () => {
        shape(c, points, rand() > .35 ? '#a5713a' : '#7d4d22', '#5c3413aa', 1.2);
        shape(c, [[-r * .5, -r * .3], [-r * .05, -r * .55], [r * .2, -r * .1]], '#d9a46877');
      });
    }
    // Sparse gold flecks in the wall: decoration, never worth catching.
    for (let i = 0; i < 120; i++) {
      const x = rand() * w, y = GROUND + 34 + rand() * (bottom - GROUND - 44), s = .9 + rand() * 2.2;
      round(x, y, () => shape(c, [[0, -s], [s, 0], [0, s], [-s, 0]], rand() > .5 ? '#ffd95e' : '#e8a52c', '#7a4a12aa', .8));
    }
    // Shaded walls frame the cut, fading in softly instead of a hard seam.
    for (const side of [-1, 1]) {
      const g = c.createLinearGradient(side < 0 ? 0 : w, 0, side < 0 ? 110 : w - 110, 0);
      g.addColorStop(0, '#4b2a0eaa'); g.addColorStop(.5, '#6b3d1844'); g.addColorStop(1, '#6b3d1800');
      c.fillStyle = g; c.fillRect(side < 0 ? 0 : w - 110, GROUND + 8, 110, bottom - GROUND - 8);
    }
    // Floor haze keeps the deepest row of treasure legible.
    const floor = c.createLinearGradient(0, bottom - 90, 0, bottom);
    floor.addColorStop(0, '#00000000'); floor.addColorStop(1, '#3a1e0788');
    c.fillStyle = floor; c.fillRect(0, bottom - 90, w, 90);
  }
  function paintLight() {}   // daylight: nothing to bake
  // Live sky: clouds drift at parallax speeds and a small flock crosses now and then.
  // One cloud sprite is rasterized at 3× and reused, so a frame costs a few drawImages.
  const clouds = (() => { const r = random(77); return Array.from({ length: 6 }, () => ({ x: r() * 1360, y: 16 + r() * 66, s: .5 + r() * .8, speed: 3 + r() * 8 })); })();
  let cloudSprite = null;
  function cloudImage() {
    if (cloudSprite) return cloudSprite;
    cloudSprite = document.createElement('canvas'); cloudSprite.width = 420; cloudSprite.height = 240;
    const c = cloudSprite.getContext('2d');
    c.scale(3, 3); c.translate(70, 44);
    const lobes = [[-30, 4, 17], [0, -4, 25], [30, 5, 19], [12, 8, 22], [-14, 8, 20]];
    const blob = grow => { c.beginPath(); for (const [dx, dy, r] of lobes) { c.moveTo(dx + r + grow, dy); c.arc(dx, dy, r + grow, 0, Math.PI * 2); } };
    blob(2.5); c.fillStyle = '#7fb4d6'; c.fill();
    blob(0); c.fillStyle = '#ffffff'; c.fill();
    c.save(); blob(0); c.clip();
    c.fillStyle = '#d6ebf7'; c.fillRect(-60, 12, 120, 30);
    c.fillStyle = '#ffffffaa'; c.beginPath(); c.arc(-6, -14, 12, 0, Math.PI * 2); c.fill();   // sunlit crown
    c.restore();
    return cloudSprite;
  }
  function drawAmbient(ctx, now, env) {
    const t = now / 1000, img = cloudImage();
    for (const cl of clouds) {
      const x = (cl.x + t * cl.speed) % 1360 - 130;
      ctx.save(); ctx.translate(x, cl.y); ctx.scale(cl.s, cl.s * env.aspect);
      ctx.drawImage(img, -70, -44, 140, 80); ctx.restore();
    }
    // The flock is on screen about half the time: 2400 units of travel, 1200 visible.
    ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const x = (t * 34) % 2400 - 80 - i * 24 - (i % 2) * 8, y = 60 + i * 7 + Math.sin(t * .8 + i) * 4;
      if (x < -20 || x > 1120) continue;
      const flap = Math.sin(t * 9 + i * 1.3) * 3;
      ctx.save(); ctx.translate(x, y); ctx.scale(1, env.aspect);
      ctx.beginPath(); ctx.moveTo(-7, -flap); ctx.quadraticCurveTo(-3, -3 - flap * .3, 0, 0); ctx.quadraticCurveTo(3, -3 - flap * .3, 7, -flap);
      ctx.stroke(); ctx.restore();
    }
  }
  const surfaces = new Map();
  function surface(id, radius, rocky) {
    const key = `${id}:${radius}:${rocky}`;
    if (surfaces.has(key)) return surfaces.get(key);
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = Math.ceil(radius * 2.6);
    const c = canvas.getContext('2d'), rand = random(724 + id * 137), size = canvas.width;
    for (let i = 0; i < 340; i++) {
      const x = rand() * size, y = rand() * size, s = .8 + rand() * 2.4;
      c.fillStyle = rand() > .55
        ? (rocky ? '#efe0c0aa' : '#fff0a9cc')
        : (rocky ? '#2c1806aa' : '#6d3c0caa');
      c.fillRect(x, y, s, s * .7);
    }
    for (let i = 0; i < 26; i++) {
      const x = rand() * size, y = rand() * size, r = 1.4 + rand() * 3.4;
      c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath();
      c.fillStyle = rand() > .5 ? '#ffffff8c' : '#3d2208a6'; c.fill();
    }
    surfaces.set(key, canvas); return canvas;
  }
  return { paintBackground, paintLight, drawAmbient, surface, lit, bannerTint };
})();

// ---------------------------------------------------------------------------
// Core loop for "Gold Miner Classic": swing → extend → grab → retract → bank.
// Canvas-free and art-free, so any renderer can draw it: ClassicArt above paints
// the board, the caller owns the object list, this module owns the physics.
// All rates are per second; dt is seconds.
// ---------------------------------------------------------------------------
window.GoldMinerCore = (() => {
  const CONFIG = {
    pivot: { x: 550, y: 132 },   // fixed pivot, top-centre of the board
    arc: 1.16,                   // swing half-angle, radians either side of straight down
    swingRate: 1.6,              // angular speed is arc × swingRate — constant, not eased
    extendSpeed: 540,            // px/sec while the claw dives
    reelSpeed: 360,              // px/sec for a haul of weight 1
    idleWeight: .65,             // empty claw: lighter than any treasure, so it snaps home
    length: 24,                  // rest length, claw parked at the pivot
    clawRadius: 8,
    bounds: { left: 20, right: 1080, bottom: 550 } // touching a wall reels the claw in
  };
  // weight is the only thing that changes reel-in speed: heavy hauls come home slow.
  const TYPES = {
    small:   { value: 200,  weight: .9,  radius: 17 },
    diamond: { value: 550,  weight: 1,   radius: 16 },
    gold:    { value: 475,  weight: 1.8, radius: 29 },
    rock:    { value: 75,   weight: 2.2, radius: 34 },
    large:   { value: 1000, weight: 3.2, radius: 43 }
  };
  function create(options) {
    const cfg = { ...CONFIG, ...options };
    const speed = cfg.arc * cfg.swingRate;
    const state = { phase: 'swing', angle: 0, direction: 1, length: cfg.length, haul: null, score: 0 };
    const tip = () => ({
      x: cfg.pivot.x + Math.sin(state.angle) * state.length,
      y: cfg.pivot.y + Math.cos(state.angle) * state.length
    });
    const launch = () => state.phase === 'swing' && (state.phase = 'extend', true);
    // ponytail: one collision step per frame. Sub-step if extendSpeed × dt can
    // approach the smallest radius (9px/frame vs radius 16 today).
    const hit = objects => {
      const p = tip();
      return objects.find(o => !o.taken && Math.hypot(o.x - p.x, o.y - p.y) < o.radius + cfg.clawRadius);
    };
    // Returns one event for the frame, or null: caught | wall | home | banked.
    function update(dt, objects = []) {
      if (state.phase === 'swing') {
        state.angle += state.direction * speed * dt;
        if (state.angle >= cfg.arc) { state.angle = cfg.arc; state.direction = -1; }
        else if (state.angle <= -cfg.arc) { state.angle = -cfg.arc; state.direction = 1; }
        return null;
      }
      if (state.phase === 'extend') {
        state.length += cfg.extendSpeed * dt;
        const object = hit(objects);
        if (object) { object.taken = true; state.haul = object; state.phase = 'retract'; return { type: 'caught', object }; }
        const p = tip();
        if (p.x < cfg.bounds.left || p.x > cfg.bounds.right || p.y > cfg.bounds.bottom) {
          state.phase = 'retract';
          return { type: 'wall' };
        }
        return null;
      }
      state.length -= cfg.reelSpeed / (state.haul ? state.haul.weight : cfg.idleWeight) * dt;
      if (state.length > cfg.length) return null;
      state.length = cfg.length;
      state.phase = 'swing';
      const haul = state.haul;
      state.haul = null;
      if (!haul) return { type: 'home' };
      state.score += haul.value;
      objects.splice(objects.indexOf(haul), 1);   // banked treasure leaves the board
      return { type: 'banked', object: haul, value: haul.value, score: state.score };
    }
    return { config: cfg, types: TYPES, state, tip, launch, update };
  }
  return { create, config: CONFIG, types: TYPES };
})();
