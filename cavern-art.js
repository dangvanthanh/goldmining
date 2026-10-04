'use strict';
// Static geology is rasterized once per level. No image assets or per-frame noise;
// drawAmbient animates only a few cheap accents (water drips, crystal glints).
window.CavernArt = (() => {
  const cfg = VisualConstants.cavern;
  const bannerTint = '4,8,10';   // title cards sit on a band of cave shadow
  let drips = [], sparkles = [];   // live accents, positioned by the last painted board
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
  // The caller maps the 1100×580 field onto the canvas; view.top/bottom are the
  // extra rows visible on tall screens, so rock must reach past 0..h.
  function paintBackground(canvas, seed, lamp, view = { top: 0, bottom: 580 }) {
    if (window.SceneAssets?.paintBackground('cavern', canvas, view)) return;
    const c = canvas.getContext('2d'), w = 1100, h = 580, { top, bottom, left = 0, right = w } = view;
    const span = right - left;
    const rand = random(90210 + seed * 173);
    c.fillStyle = '#070b0e'; c.fillRect(left, top, span, bottom - top);
    // The black ceiling opens into a deep, amber-filled ravine, not a flat dirt wall.
    shape(c, [[120,190],[200,140],[300,180],[425,100],[600,65],[770,112],[950,35],[w,bottom],[0,bottom]], '#101311');
    for (let layer = 0; layer < 4; layer++) {
      const points = [[0,bottom]];
      for (let x = 0; x <= w; x += 30) {
        points.push([x, 190 + layer * 63 + Math.sin(x * .006 + layer) * 52 + Math.sin(x * .019 + layer * 2) * 19]);
      }
      points.push([w,bottom]);
      const g = c.createLinearGradient(0, 160 + layer * 65, 0, h);
      g.addColorStop(0, ['#171b18','#201f16','#302615','#493018'][layer]); g.addColorStop(1, '#141410');
      shape(c, points, g);
    }
    glow(c, 365, 495, 550, 390, [[0,'#d1892480'],[.35,'#a4662028'],[1,'#54381400']]);
    // Cool recesses separate the amber working shaft from its distant walls.
    glow(c, 215, 295, 310, 340, [[0,'#498d8420'],[.5,'#1b4a4620'],[1,'#0b282700']]);
    glow(c, 910, 340, 230, 310, [[0,'#6ea79c18'],[1,'#18373400']]);
    // Recessed, eroded flutes keep the central play field quiet and deep.
    for (let i = 0; i < 27; i++) {
      const x = 130 + rand() * 850, y = 70 + rand() * 420;
      c.beginPath(); c.moveTo(x,y);
      c.bezierCurveTo(x+35,y+70,x-65,y+130,x-85,y+230);
      c.strokeStyle = i % 3 ? '#b9822510' : '#03080b65';
      c.lineWidth = 6 + rand()*25; c.stroke();
    }
    // Shelves wrap around tall buttresses. Their irregular contours avoid a
    // repeated diagonal stripe pattern at full-screen scale.
    const leftCliff = [[0,0],[111,0],[139,35],[145,75],[190,111],[179,137],[139,160],[123,202],[132,250],[159,291],[147,335],[172,396],[207,448],[230,489],[154,535],[0,580]];
    const rightCliff = [[w,0],[930,0],[915,65],[874,101],[850,145],[789,180],[805,217],[779,257],[796,298],[767,333],[758,376],[728,414],[722,455],[666,499],[627,550],[w,h]];
    const reach = ([x, y]) => [x === 0 ? left : x === w ? right : x, y === 0 ? top : y === h ? bottom : y];
    cliff(leftCliff.map(reach), false); cliff(rightCliff.map(reach), true);
    // Mineral seams are embedded in the outer walls, duller than collectible gems.
    for(let i=0;i<cfg.seamCount;i++) {
      const side=i%2, x=side?1000-i*7:45+i*11, y=170+i*45;
      c.beginPath(); c.moveTo(x,y); c.bezierCurveTo(x-18,y+34,x+16,y+52,x-4,y+92);
      c.strokeStyle=cfg.seamShadow; c.lineWidth=5; c.stroke();
      c.strokeStyle=cfg.seamColor; c.lineWidth=1.3; c.stroke();
    }
    for(const [x,y,size] of cfg.mineralPositions) {
      glow(c,x,y,size*2,size*1.7,[[0,'#69a69a15'],[1,'#69a69a00']]);
      for(let i=0;i<3;i++) {
        const dx=x+(i-1)*size*.32, base=y+size*.35, tip=y-size*(.5+(i%2)*.5);
        shape(c,[[dx-size*.13,base],[dx-size*.16,tip+size*.15],[dx,tip],[dx+size*.14,tip+size*.12],[dx+size*.1,base]],cfg.mineral,cfg.mineralShade,.9);
        shape(c,[[dx,base],[dx,tip],[dx+size*.14,tip+size*.12],[dx+size*.1,base]],cfg.mineralShade);
        c.beginPath(); c.moveTo(dx,tip); c.lineTo(dx-size*.1,tip+size*.17); c.lineTo(dx-size*.08,base);
        c.strokeStyle=cfg.mineralLight+'50'; c.lineWidth=.8; c.stroke();
      }
      shape(c,[[x-size*.6,y+size*.5],[x-size*.25,y+size*.2],[x+size*.5,y+size*.4],[x+size*.6,y+size*.65]],'#17251e');
    }
    function cliff(outline, rightSide) {
      c.save(); shape(c, outline, '#302414'); c.clip();
      const g = c.createLinearGradient(rightSide ? w : 0, 0, rightSide ? 700 : 210, 0);
      g.addColorStop(0, '#080c0c'); g.addColorStop(.45, '#2b1e12'); g.addColorStop(.8, '#82521c'); g.addColorStop(1, '#d49332');
      c.fillStyle = g; c.fillRect(left,top,span,bottom-top);
      // Unequal beds split into broad angular blocks, with black undercuts.
      for (let row = -8; row < 43; row++) {
        const y = row*19 + rand()*12, points=[];
        for (let x=left;x<=right;x+=14) {
          const slope = rightSide ? -.38 : .24;
          const ripple = Math.sin(x*.014+row*.37)*12 + Math.sin(x*.047+row*.8)*3;
          points.push([x,y+(x-(rightSide?800:100))*slope+ripple]);
        }
        const thickness=8+rand()*24;
        const bottom=points.map(([x,yy])=>[x+3,yy+thickness]).reverse();
        shape(c,[...points,...bottom],row%4===0?'#030708b8':'#8e59242b');
        c.beginPath(); points.forEach(([x,yy],i)=>i?c.lineTo(x,yy):c.moveTo(x,yy));
        c.strokeStyle=row%4===0?'#efb95766':'#bc853338'; c.lineWidth=.7+rand()*2; c.stroke();
      }
      // Broken faces receive the lantern on their inward edges, not everywhere.
      for(let i=0;i<95;i++) {
        const x=rightSide?760+rand()*340:rand()*190,y=top+rand()*(bottom-top);
        const rw=18+rand()*70,rh=12+rand()*50;
        const face=c.createLinearGradient(x,y,x+rw,y+rh);
        face.addColorStop(0,'#edac4438');face.addColorStop(.3,'#8b592018');face.addColorStop(1,'#02070988');
        shape(c,[[x,y],[x+rw*.7,y-rh*.2],[x+rw,y+rh*.5],[x+rw*.6,y+rh],[x+4,y+rh*.7]],face);
      }
      // Broad vertical fractures break bedding into solid, weighty rock faces.
      for (let i=0;i<24;i++) {
        let x=rightSide?760+rand()*340:rand()*190, y=top+rand()*(bottom-top);
        c.beginPath(); c.moveTo(x,y);
        for(let j=0;j<7;j++){x+=(rand()-.48)*17;y+=7+rand()*17;c.lineTo(x,y);}
        c.strokeStyle='#080b09aa';c.lineWidth=1+rand()*3;c.stroke();
        c.translate(1.5,0);c.strokeStyle='#bb8b392a';c.lineWidth=.7;c.stroke();c.translate(-1.5,0);
      }
      // Embedded pyrite follows short fractures, never competing with treasure.
      for(let i=0;i<150;i++) {
        const x=rightSide?775+rand()*285:rand()*185,y=top+rand()*(bottom-top);
        const band=Math.sin(x*.022+y*.033);
        if(band>.88){c.fillStyle=rand()>.75?'#ddb25299':'#a879343f';c.fillRect(x,y,1+rand()*3,.5+rand());}
      }
      c.restore();
    }
    // Distant excavated doorway and scaffold cut into the high right wall.
    shape(c, [[806,110],[847,92],[894,96],[905,151],[859,171],[817,156]], '#765323');
    shape(c, [[829,115],[850,104],[878,108],[883,147],[848,158],[832,146]], '#090e0d');
    for (let i=0;i<12;i++) {
      c.fillStyle = i%3 ? '#be8a383d' : '#110f0b'; c.fillRect(812+(i%3)*3,111+i*4,15,2);
    }
    for (const x of [825,858,899]) {
      c.strokeStyle = '#1b170e'; c.lineWidth = 5; c.beginPath(); c.moveTo(x,68); c.lineTo(x-8,192); c.stroke();
      c.strokeStyle = '#b0884344'; c.lineWidth = 1; c.stroke();
    }
    for (const y of [78,99,175,186]) {
      c.strokeStyle = '#69522b'; c.lineWidth = 3; c.beginPath(); c.moveTo(800,y+8); c.lineTo(922,y-15); c.stroke();
    }
    glow(c, 833, 121, 95, 72, [[0,'#e3a13c48'],[.45,'#b8792420'],[1,'#b8792400']]);
    // Narrow path on the cavern floor and damp, gold-lit sediment.
    shape(c, [[left,bottom],[215,511],[340,491],[435,501],[600,532],[right,bottom]], '#342715');
    glow(c, 337, 521, 285, 39, [[0,'#fff1aaff'],[.12,'#ffbd36ee'],[.45,'#ce8b2f55'],[1,'#5b441600']]);
    // A thin, still pool catches the cool wall light below the last ore row.
    const poolY=Math.min(cfg.poolY,bottom-24);
    glow(c,cfg.poolX,poolY,cfg.poolWidth,14,[[0,cfg.poolColor],[1,'#77bcb000']]);
    for(let i=0;i<4;i++) {
      c.beginPath(); c.ellipse(cfg.poolX+i*5,poolY+i*2,cfg.poolWidth*(.65-i*.1),1.5+i*.25,0,0,Math.PI);
      c.strokeStyle=cfg.poolLight; c.lineWidth=.6; c.stroke();
    }
    for (let i=0;i<210;i++) {
      const y = 510+rand()*(bottom-510), x = left+rand()*span;
      c.fillStyle = rand()>.6 ? '#c4a05240' : '#03090980'; c.fillRect(x,y,2+rand()*19,.4+rand()*1.4);
    }
    // Fine sandstone pits with directional highlights, baked into the geology.
    for(let i=0;i<23000;i++) {
      const x=left+rand()*span,y=top+rand()*(bottom-top),r=.2+rand()*1.3;
      c.fillStyle=rand()>.55?'#e3ad4809':'#02070922';
      c.fillRect(x,y,r*2,r);
    }
    // Film-like stone grain stays subtle enough to preserve the large silhouettes.
    const image = c.getImageData(0,0,canvas.width,canvas.height);
    for (let i=0;i<image.data.length;i+=4) {
      const n = (rand()-.5)*5;
      image.data[i] += n; image.data[i+1] += n*.8; image.data[i+2] += n*.5;
    }
    c.putImageData(image,0,0);
    glow(c, 305, 105, 300, 240, [[0,'#02070bd9'],[.5,'#02070b88'],[1,'#02070b00']]);
    // A suspended, weathered catwalk keeps the entire playable field below unobstructed.
    for (const x of [402,794]) {
      c.strokeStyle = '#0a0e0d'; c.lineWidth = 4; c.beginPath(); c.moveTo(x,0); c.lineTo(x,138); c.stroke();
      c.strokeStyle = '#75644555'; c.lineWidth = .7; c.stroke();
    }
    shape(c, [[385,132],[807,132],[790,146],[401,146]], '#211b12', '#74572d', 1);
    for (let x=395;x<800;x+=18) {
      c.fillStyle = '#9f7a3735'; c.fillRect(x,133,15,2);
      c.fillStyle = '#050909'; c.fillRect(x+15,134,2,9);
    }
    c.fillStyle = '#0a0e0d'; c.fillRect(396,144,400,5);
    c.strokeStyle = '#826739'; c.lineWidth = 2;
    for (const y of [129,137]) { c.beginPath(); c.moveTo(396,y); c.lineTo(800,y); c.stroke(); }
    // Stalactites hang from the top of the screen into the ceiling darkness.
    const drip = random(4021 + seed * 59);   // own stream: grain above consumes rand() per pixel
    drips = [];
    for (let x = 140 + drip() * 30; x < 960; x += 26 + drip() * 46) {
      if (x > 380 && x < 820 && drip() > .35) continue;   // keep the catwalk cables readable
      const len = 14 + drip() * (x > 380 && x < 820 ? 26 : 70), half = 5 + drip() * 9;
      const root = top - 4, tip = len, lean = (drip() - .5) * 8;
      // Stone faces the lantern: warm on the near side, black on the far side.
      const face = c.createLinearGradient(x - half, 0, x + half, 0), lit = x < lamp.x;
      face.addColorStop(0, lit ? '#0a0c0b' : '#4a361d'); face.addColorStop(.6, '#1d1710'); face.addColorStop(1, lit ? '#4a361d' : '#0a0c0b');
      shape(c, [[x - half, root], [x + half, root], [x + half * .35, tip - len * .35], [x + lean, tip], [x - half * .4, tip - len * .4]], face, '#02050699', 1);
      c.fillStyle = '#d29a4655'; c.fillRect(x + lean - .8, tip - 2, 1.6, 2);   // wet tip catches the light
      drips.push({ x: x + lean, y: tip, floor: 480 + drip() * 70, period: 2.6 + drip() * 5, phase: drip() * 9 });
    }
    // Quartz glints on the outer cliff faces, clear of the treasure field.
    const glint = random(733 + seed * 41);
    sparkles = Array.from({ length: 26 }, () => {
      const right = glint() > .5;
      return { x: right ? 945 + glint() * 145 : 8 + glint() * 105, y: 150 + glint() * 400, size: 2.5 + glint() * 3.5, rate: .5 + glint() * .9, phase: glint() * 30 };
    });
    // Foreground rubble frames the floor without covering collectible hit targets.
    for (let i=0;i<20;i++) {
      const x=left+rand()*span, y=564+rand()*(bottom-556), r=10+rand()*48;
      shape(c, [[x-r,y+10],[x-r*.7,y-r*.2],[x-r*.1,y-r*.48],[x+r*.65,y-r*.12],[x+r,y+15]], '#0b100f', '#514a2b55');
    }
    glow(c, lamp.x, lamp.y+30, 240, 165, [[0,'#b477271f'],[1,'#b4772700']]);
  }
  // Drops swell on each stalactite tip, fall through the lantern light and splash.
  // Everything derives from the clock, so there is no per-drop state to update.
  function drawAmbient(ctx, now, env) {
    if (window.SceneAssets?.backgrounds.cavern) { window.SceneAssets.ambient(ctx,now,env,'cavern'); return; }
    const t = now / 1000, gravity = 900;
    const v = VisualConstants, palette = v.palettes.cavern;
    if (env.pulse || env.entrance) glow(ctx, 700, 92, 240, 170, [[0, `rgba(${palette.glow},${v.pulseAlpha * Math.max(env.pulse || 0, env.entrance || 0)})`], [1, `rgba(${palette.glow},0)`]]);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const s of sparkles) {
      const a = Math.pow(Math.max(0, Math.sin(t * s.rate + s.phase)), 14);
      if (a < .03) continue;
      const r = s.size * (.5 + a * .7);
      ctx.globalAlpha = a; ctx.strokeStyle = '#ffe2a0'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(s.x - r, s.y); ctx.lineTo(s.x + r, s.y);
      ctx.moveTo(s.x, s.y - r * env.aspect); ctx.lineTo(s.x, s.y + r * env.aspect); ctx.stroke();
      ctx.fillStyle = '#fff6d6'; ctx.fillRect(s.x - .8, s.y - .8, 1.6, 1.6);
    }
    for (const d of drips) {
      const fall = Math.sqrt(2 * (d.floor - d.y) / gravity), local = (t + d.phase) % d.period;
      ctx.strokeStyle = ctx.fillStyle = '#ffd99a';
      if (local < fall) {
        const y = d.y + gravity / 2 * local * local, len = Math.min(14, 2 + gravity * local * .016);
        ctx.globalAlpha = .55; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(d.x, y - len); ctx.lineTo(d.x, y); ctx.stroke();
      } else if (local < fall + .45) {
        const k = (local - fall) / .45;
        ctx.globalAlpha = (1 - k) * .5; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(d.x, d.floor, 3 + k * 14, (1 + k * 3) * env.aspect, 0, 0, Math.PI * 2); ctx.stroke();
        for (const side of [-1, 1]) ctx.fillRect(d.x + side * k * 10 - .7, d.floor - Math.sin(k * Math.PI) * 9 * env.aspect - .7, 1.4, 1.4);
      } else if (local > d.period - .6) {
        const k = (local - d.period + .6) / .6;
        ctx.globalAlpha = .3 + k * .4;
        ctx.beginPath(); ctx.ellipse(d.x, d.y + k * 1.5, .8 + k * 1.2, (.8 + k * 1.6) * env.aspect, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }
  function paintLight(canvas, lamp) {
    const c = canvas.getContext('2d'), w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h); c.globalCompositeOperation='lighter';
    glow(c,lamp.x,lamp.y,230,220,[[0,'#fff3bc99'],[.08,'#f7c06455'],[.3,'#ca842d25'],[1,'#ba791b00']]);
    // Soft angular falloff across each shaft prevents hard triangular edges.
    c.save(); c.translate(lamp.x,lamp.y);
    for(let shaft=0;shaft<3;shaft++) {
      const direction=[.37,.64,-.2][shaft];
      for(let i=0;i<32;i++) {
        const t=(i-15.5)/15.5;
        c.save();c.rotate(direction+t*.14);
        const beam=c.createLinearGradient(0,10,0,580);
        const alpha=(1-t*t)*.013;
        beam.addColorStop(0,'rgba(255,201,99,0)');
        beam.addColorStop(.15,`rgba(255,201,99,${alpha})`);
        beam.addColorStop(.65,`rgba(233,161,48,${alpha*.7})`);
        beam.addColorStop(1,'rgba(211,144,39,0)');
        shape(c,[[-3,10],[3,10],[42,580],[-42,580]],beam);c.restore();
      }
    }
    c.restore();
    glow(c,360,490,430,250,[[0,'#f8a82e40'],[.5,'#b77b2009'],[1,'#aa6b1700']]);
    c.globalCompositeOperation='source-over';
  }
  const surfaces = new Map();
  function surface(id, radius, rocky) {
    const key = `${id}:${radius}:${rocky}`;
    if(surfaces.has(key)) return surfaces.get(key);
    const canvas=document.createElement('canvas'); canvas.width=canvas.height=Math.ceil(radius*2.6);
    const c=canvas.getContext('2d'), rand=random(724+id*137), size=canvas.width;
    for(let i=0;i<420;i++) {
      const x=rand()*size,y=rand()*size,s=.3+rand()*1.7;
      c.fillStyle=rand()>.55 ? (rocky?'#ddd0ad30':'#fff0a955') : (rocky?'#060b0b50':'#46260288');
      c.fillRect(x,y,s,s*.6);
    }
    for(let i=0;i<32;i++) {
      const x=rand()*size,y=rand()*size;
      c.beginPath(); c.moveTo(x,y); c.lineTo(x+rand()*6,y-rand()*5); c.lineTo(x+rand()*9,y+rand()*3);
      c.strokeStyle=rocky?'#111a1755':'#5c370699'; c.lineWidth=.6; c.stroke();
    }
    surfaces.set(key,canvas); return canvas;
  }
  return { paintBackground, paintLight, drawAmbient, surface, bannerTint };
})();
