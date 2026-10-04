'use strict';
// Sky look: flat, saturated cartoon geology in full daylight, in the spirit
// of Gold Miner (2003). Same contract as CavernArt so game.js can swap styles
// without branching: the board is rasterized once per mine, and drawAmbient adds
// a few cheap live touches (drifting clouds, birds) each frame.
window.SkyArt = (() => {
  const cfg = VisualConstants.sky;
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
  function strata(c, w, y, amp, phase, left = 0) {
    const points = [];
    for (let x = left; x <= w; x += 20) points.push([x, y + Math.sin(x * .006 + phase) * amp]);
    points.push([w, y + Math.sin(w * .006 + phase) * amp]);
    return points;
  }
  function band(c, w, y, thickness, amp, phase, fill, left = 0) {
    const top = strata(c, w, y, amp, phase, left);
    shape(c, [...top, ...top.map(([x, yy]) => [x + 2, yy + thickness]).reverse()], fill);
  }
  const GROUND = 142;   // sky above, dirt below; the rig is docked on this line
  const RIG = [420, 830];   // keep scenery props out from behind the miner and cart
  // Rolling hill heights, shared by the hill fill and the trees planted on it.
  const hill = (x, lift, amp, freq) => GROUND - lift + Math.sin(x * freq + lift) * amp + Math.sin(x * .023 + lift) * amp * .25;
  // The caller maps the 1100×580 field onto the canvas. view.top/bottom are the
  // extra rows visible on tall screens; view.aspect keeps round shapes round.
  function paintBackground(canvas, seed, lamp, view = { top: 0, bottom: 580, aspect: 1 }) {
    if (window.SceneAssets?.paintBackground('sky', canvas, view)) return;
    const c = canvas.getContext('2d'), w = 1100, h = 580, { top, bottom, aspect, left = 0, right = w } = view;
    const span = right - left;
    const rand = random(31337 + seed * 977);
    const round = (x, y, draw) => { c.save(); c.translate(x, y); c.scale(1, aspect); draw(); c.restore(); };
    // Sky: deep zenith blue warming to a sunlit haze on the horizon.
    const sky = c.createLinearGradient(0, Math.min(0, top), 0, GROUND + 12);
    sky.addColorStop(0, cfg.zenith); sky.addColorStop(.5, '#6cbbe8'); sky.addColorStop(.86, '#c4e8f5'); sky.addColorStop(1, cfg.haze);
    c.fillStyle = sky; c.fillRect(left, top, span, GROUND + 12 - top);
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
    for (let x = left - 30; x < right + 60; x += 55 + rand() * 60) peaks.push([x, GROUND - 40 - rand() * 62]);
    shape(c, [[left - 30, GROUND + 20], ...peaks, [right + 60, GROUND + 20]], '#a9c6de');
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
    c.fillStyle = haze; c.fillRect(left, GROUND - 70, span, 80);
    // Rolling hills; the middle one carries a treeline so the horizon has depth.
    const hills = [['#86b06a', 30, 10, .006], ['#5f9541', 12, 8, .006]];
    const ridge = (lift, amp, freq) => { const r = []; for (let x = left; x <= right; x += 20) r.push([x, hill(x, lift, amp, freq)]); r.push([right, hill(right, lift, amp, freq)]); return r; };
    shape(c, [[left, GROUND + 20], ...ridge(...hills[0].slice(1)), [right, GROUND + 20]], hills[0][0]);
    for (let x = left + 6 + rand() * 20; x < right; x += 16 + rand() * 34) {
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
    shape(c, [[left, GROUND + 20], ...ridge(...hills[1].slice(1)), [right, GROUND + 20]], hills[1][0]);
    // A distant supply shack and rail fence make this a worked mining landscape.
    // Baked scenery only: no objects, collisions or extra targets.
    const mx=cfg.mineX, my=hill(mx,12,8,.006), mw=cfg.mineWidth;
    shape(c,[[mx-mw*.5,my],[mx-mw*.5,my-31],[mx+mw*.45,my-31],[mx+mw*.45,my]],cfg.mineWall,cfg.mineShade,.7);
    shape(c,[[mx-mw*.62,my-29],[mx-mw*.34,my-43],[mx+mw*.3,my-43],[mx+mw*.58,my-29]],cfg.mineRoof,cfg.mineShade,1);
    shape(c,[[mx-mw*.34,my-43],[mx+mw*.3,my-43],[mx+mw*.58,my-29],[mx-mw*.1,my-29]],'#ad8857');
    c.fillStyle=cfg.mineShade; c.fillRect(mx-11,my-25,20,25);
    c.fillStyle=cfg.fenceHighlight; c.fillRect(mx+20,my-22,10,9);
    c.strokeStyle=cfg.mineRoof; c.lineWidth=1; c.strokeRect(mx+20,my-22,10,9);
    c.beginPath(); c.moveTo(mx+25,my-22); c.lineTo(mx+25,my-13); c.moveTo(mx+20,my-17.5); c.lineTo(mx+30,my-17.5); c.stroke();
    for(let x=mx+mw*.6;x<390;x+=cfg.fenceSpacing) {
      const y=hill(x,12,8,.006)+2, nextY=hill(x+cfg.fenceSpacing,12,8,.006)+2;
      c.strokeStyle=cfg.fence; c.lineWidth=2.5; c.beginPath(); c.moveTo(x,y); c.lineTo(x,y-11); c.moveTo(x,y-7); c.lineTo(x+cfg.fenceSpacing,nextY-7); c.stroke();
      c.strokeStyle=cfg.fenceHighlight; c.lineWidth=.6; c.stroke();
    }
    const ridgeMist=c.createLinearGradient(0,GROUND-16,0,GROUND+2);
    ridgeMist.addColorStop(0,cfg.ridgeMist); ridgeMist.addColorStop(1,'#fff3d800');
    c.fillStyle=ridgeMist; c.fillRect(left,GROUND-16,span,18);
    // Dirt body: warm at the lit top, deep umber at the floor.
    const dirt = c.createLinearGradient(0, GROUND, 0, Math.max(h, bottom));
    dirt.addColorStop(0, '#c68f52'); dirt.addColorStop(.45, '#a97038'); dirt.addColorStop(1, '#73441c');
    shape(c, [[left, bottom], ...strata(c, right, GROUND + 4, 5, 1.2, left), [right, bottom]], dirt);
    // Dark soil lip, its lit crumb edge, then a bright grass turf with tufts.
    band(c, right, GROUND - 2, 15, 5, 1.2, '#4a2b0f', left);
    band(c, right, GROUND + 12, 4, 4.6, 1.2, '#db9f5f', left);
    band(c, right, GROUND - 5, 7, 5, 1.2, '#5f9a35', left);
    band(c, right, GROUND - 5, 2.5, 5, 1.2, '#a3d466', left);
    for (let x = left + 4; x < right; x += 9 + rand() * 14) {
      const y = GROUND - 4 + Math.sin(x * .006 + 1.2) * 5, t = 4 + rand() * 6;
      shape(c, [[x - 3, y], [x - 1, y - t], [x + 1, y - t * .4], [x + 3, y - t * .9], [x + 5, y]], rand() > .5 ? '#6fae3f' : '#4f8a2c');
      if (rand() > .93 && (x < RIG[0] || x > RIG[1])) round(x + 1, y - t - 1, () => {   // wildflowers
        c.beginPath(); c.arc(0, 0, 2.2, 0, Math.PI * 2); c.fillStyle = rand() > .5 ? '#fff6e0' : '#ffd23f'; c.fill();
        c.beginPath(); c.arc(0, 0, .9, 0, Math.PI * 2); c.fillStyle = '#e08a1e'; c.fill();
      });
    }
    // Hanging roots just under the turf.
    for (let i = 0; i < 16; i++) {
      const x = left + rand() * span, y = GROUND + 12 + Math.sin(x * .006 + 1.2) * 5, len = 10 + rand() * 24;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (rand() - .5) * 14, y + len * .6, x + (rand() - .5) * 10, y + len);
      c.strokeStyle = '#5a3412cc'; c.lineWidth = 1.4; c.stroke();
    }
    // Broad terraced strata, the signature of the classic dirt wall.
    const beds = ['#b8803f', '#96602c', '#c89659', '#8a5524', '#b57a3a'];
    for (let y = GROUND + 34, row = 0; y < bottom; row++) {
      band(c, right, y, 9 + rand() * 22, 6, row * .7, beds[row % beds.length] + '9c', left);
      band(c, right, y, 2.4, 6, row * .7, '#e0a96755', left);
      y += 30 + rand() * 16;
    }
    // Soft pockets of darker soil break the horizontal rhythm without hard stripes.
    for (let i = 0; i < 10; i++) {
      const x = left + rand() * span, y = GROUND + 60 + rand() * (bottom - GROUND - 60);
      round(x, y, () => glow(c, 0, 0, 40 + rand() * 60, 18 + rand() * 20, [[0, '#6d402055'], [1, '#6d402000']]));
    }
    // Granular soil: fine light and dark grains read as packed earth up close.
    for (let i = 0; i < 9000; i++) {
      const x = left + rand() * span, y = GROUND + 16 + rand() * (bottom - GROUND - 16), s = .4 + rand() * 1.2;
      c.fillStyle = rand() > .5 ? '#f3c78a1c' : '#3d200a24'; c.fillRect(x, y, s * 1.6, s);
    }
    // Embedded pebbles: dark outline, flat fill, a single highlight facet.
    for (let i = 0; i < 74; i++) {
      const x = left + rand() * span, y = GROUND + 20 + rand() * (bottom - GROUND - 24), r = 3 + rand() * 12;
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
      const x = left + rand() * span, y = GROUND + 34 + rand() * (bottom - GROUND - 44), s = .9 + rand() * 2.2;
      round(x, y, () => shape(c, [[0, -s], [s, 0], [0, s], [-s, 0]], rand() > .5 ? '#ffd95e' : '#e8a52c', '#7a4a12aa', .8));
    }
    // Shaded walls frame the cut, fading in softly instead of a hard seam.
    for (const side of [-1, 1]) {
      const g = c.createLinearGradient(side < 0 ? left : right, 0, side < 0 ? left + 110 : right - 110, 0);
      g.addColorStop(0, '#4b2a0eaa'); g.addColorStop(.5, '#6b3d1844'); g.addColorStop(1, '#6b3d1800');
      c.fillStyle = g; c.fillRect(side < 0 ? left : right - 110, GROUND + 8, 110, bottom - GROUND - 8);
    }
    // Floor haze keeps the deepest row of treasure legible.
    const floor = c.createLinearGradient(0, bottom - 90, 0, bottom);
    floor.addColorStop(0, '#00000000'); floor.addColorStop(1, '#3a1e0788');
    c.fillStyle = floor; c.fillRect(left, bottom - 90, span, 90);
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
    if (window.SceneAssets?.backgrounds.sky) { window.SceneAssets.ambient(ctx,now,env,'sky'); return; }
    const t = now / 1000, img = cloudImage(), v = VisualConstants, palette = v.palettes.sky;
    if (env.pulse || env.entrance) glow(ctx, 700, 92, 240, 170, [[0, `rgba(${palette.glow},${v.pulseAlpha * Math.max(env.pulse || 0, env.entrance || 0)})`], [1, `rgba(${palette.glow},0)`]]);
    // Daylight pollen gives the opening life without turning the sky into confetti.
    ctx.save(); ctx.fillStyle = palette.lamp;
    for (let i = 0; i < v.ambientMotes; i++) {
      const x = (i * 97 + t * v.ambientDrift) % 1100, y = 154 + (i * 43) % 310 + Math.sin(t + i) * v.ambientDrift;
      ctx.globalAlpha = v.ambientMoteAlpha + Math.sin(t + i) * v.ambientMotePulse;
      const size = v.ambientMotePx / (env.scale || 1);
      ctx.fillRect(x, y, size, size);
    }
    ctx.restore();
    const view=env.view||{left:0,right:1100,top:0}, cycle=Math.max(1360,view.right-view.left+260);
    for (const [i,cl] of clouds.entries()) {
      const x = view.left + (cl.x/1360*cycle + t * cl.speed) % cycle - 130;
      const y = Math.min(cl.y, view.top + (GROUND-view.top)*(.18+i*.11));
      ctx.save(); ctx.translate(x, y); ctx.scale(cl.s, cl.s * env.aspect);
      ctx.drawImage(img, -70, -44, 140, 80); ctx.restore();
    }
    // The flock is on screen about half the time: 2400 units of travel, 1200 visible.
    ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const x = view.left + (t * 34) % (cycle+1100) - 80 - i * 24 - (i % 2) * 8;
      const y = Math.min(60,view.top+(GROUND-view.top)*.62) + i * 7 + Math.sin(t * .8 + i) * 4;
      if (x < view.left-20 || x > view.right+20) continue;
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
