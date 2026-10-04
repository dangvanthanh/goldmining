'use strict';
// Original procedural retro arcade look. No source-game images, sprites or traced paths.
// Matches the other providers; scenery is baked once, clouds animate independently.
window.ClassicArt = (() => {
  const cfg = VisualConstants.classic, palette = VisualConstants.palettes.classic;
  const lit = false, bannerTint = cfg.bannerTint;
  function random(seed) {
    return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  }
  function shape(c, points, fill, stroke) {
    c.beginPath(); points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.closePath();
    c.fillStyle=fill; c.fill();
    if(stroke) { c.strokeStyle=stroke; c.lineWidth=1; c.stroke(); }
  }
  function paintBackground(canvas, seed, lamp, view = {top:0,bottom:cfg.height}) {
    if (window.SceneAssets?.paintBackground('classic', canvas, view)) return;
    const c=canvas.getContext('2d'), {top,bottom,left=0,right=cfg.width}=view;
    const width=right-left, rand=random(cfg.seed+seed*977);
    const sky=c.createLinearGradient(0,top,0,cfg.ground);
    sky.addColorStop(0,cfg.sky); sky.addColorStop(1,cfg.skyHaze);
    c.fillStyle=sky; c.fillRect(left,top,width,cfg.ground-top);
    // A quiet, flat sun and sage hills keep Classic distinct from Sky's alpine scene.
    const halo=c.createRadialGradient(cfg.sunX,cfg.sunY,cfg.sunRadius,cfg.sunX,cfg.sunY,cfg.sunRadius*5);
    halo.addColorStop(0,cfg.sunHalo); halo.addColorStop(1,'#fff5c300');
    c.fillStyle=halo; c.fillRect(cfg.sunX-cfg.sunRadius*5,cfg.sunY-cfg.sunRadius*5,cfg.sunRadius*10,cfg.sunRadius*10);
    c.beginPath(); c.arc(cfg.sunX,cfg.sunY,cfg.sunRadius,0,Math.PI*2); c.fillStyle=cfg.sun; c.fill();
    for(let layer=0;layer<cfg.hills.length;layer++) {
      const ridge=[];
      for(let x=left;x<right;x+=24) ridge.push([x,cfg.ground-34+layer*13+Math.sin(x*.005+layer)*12]);
      ridge.push([right,cfg.ground-34+layer*13+Math.sin(right*.005+layer)*12]);
      shape(c,[[left,cfg.ground],...ridge,[right,cfg.ground]],cfg.hills[layer]);
    }
    // Small scrub silhouettes belong to the surface, never the treasure field.
    for(let x=left+28;x<right;x+=cfg.plantSpacing+rand()*cfg.plantSpacing) {
      if(x>420&&x<830) continue;
      const y=cfg.ground-10+Math.sin(x*.005+2)*12, size=4+rand()*5;
      shape(c,[[x-size,y],[x-size*.3,y-size],[x,y-size*.55],[x+size*.5,y-size*1.3],[x+size,y]],cfg.plant);
      shape(c,[[x,y],[x+size*.5,y-size*1.3],[x+size,y]],cfg.plantLight);
    }
    const soil=c.createLinearGradient(0,cfg.ground,0,Math.max(bottom,cfg.height));
    cfg.soil.forEach((color,i)=>soil.addColorStop(i/(cfg.soil.length-1),color));
    c.fillStyle=soil; c.fillRect(left,cfg.ground,width,bottom-cfg.ground);
    // Broad hand-drawn seams continue into the spare space on tall screens.
    for(let y=cfg.ground+54,row=0;y<bottom;y+=cfg.seamSpacing,row++) {
      const ridge=[];
      for(let x=left;x<right;x+=32) ridge.push([x,y+Math.sin(x*.007+row*.8)*cfg.seamWave]);
      ridge.push([right,y+Math.sin(right*.007+row*.8)*cfg.seamWave]);
      shape(c,[...ridge,...ridge.map(([x,yy])=>[x,yy+13]).reverse()],cfg.seamShade);
      c.beginPath(); ridge.forEach(([x,yy],i)=>i?c.lineTo(x,yy):c.moveTo(x,yy));
      c.strokeStyle=cfg.seamLight; c.lineWidth=2; c.stroke();
    }
    c.fillStyle=cfg.soilEdge; c.fillRect(left,cfg.ground,width,7);
    c.fillStyle=cfg.turf; c.fillRect(left,cfg.ground-5,width,5);
    c.fillStyle=cfg.turfLight; c.fillRect(left,cfg.ground-5,width,2);
    // Roots end just below the grass lip; the ore retains a clean silhouette.
    for(let x=left+35;x<right;x+=cfg.plantSpacing*2) {
      const length=9+rand()*13;
      c.beginPath(); c.moveTo(x,cfg.ground+7); c.quadraticCurveTo(x-4,cfg.ground+length*.7,x+2,cfg.ground+length);
      c.strokeStyle=cfg.soilEdge; c.lineWidth=.8; c.stroke();
    }
    for(let i=0;i<cfg.grainCount;i++) {
      const x=left+rand()*width,y=cfg.ground+12+rand()*(bottom-cfg.ground-12);
      c.fillStyle=cfg.grain; c.fillRect(x,y,1+rand()*2,1);
    }
    for(let i=0;i<cfg.pebbleCount;i++) {
      const x=left+rand()*width,y=cfg.ground+20+rand()*(bottom-cfg.ground-20),r=2+rand()*4;
      shape(c,[[x-r,y],[x-r*.4,y-r*.5],[x+r*.7,y-r*.4],[x+r,y+r*.3],[x-r*.2,y+r*.4]],cfg.pebble);
    }
    for(const side of [-1,1]) {
      const edge=side<0?left:right, fade=side<0?left+120:right-120;
      const shade=c.createLinearGradient(edge,0,fade,0);
      shade.addColorStop(0,cfg.edgeShade); shade.addColorStop(1,'#50311900');
      c.fillStyle=shade; c.fillRect(side<0?left:right-120,cfg.ground,120,bottom-cfg.ground);
    }
  }
  let cloud=null;
  function cloudImage() {
    if(cloud) return cloud;
    cloud=document.createElement('canvas'); cloud.width=160; cloud.height=80;
    const c=cloud.getContext('2d');
    for(const [x,y,r] of [[33,44,18],[59,30,25],[86,33,28],[115,45,20]]) {
      c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fillStyle=cfg.cloudShade; c.fill();
      c.beginPath(); c.arc(x,y-3,r-2,0,Math.PI*2); c.fillStyle=cfg.cloud; c.fill();
    }
    return cloud;
  }
  function drawAmbient(ctx,now,env) {
    if (window.SceneAssets?.backgrounds.classic) { window.SceneAssets.ambient(ctx,now,env,'classic'); return; }
    const image=cloudImage(),t=now/1000;
    ctx.save();
    const view=env.view||{left:0,right:cfg.width,top:0};
    const cycle=Math.max(cfg.cloudCycle,view.right-view.left+260);
    for(let i=0;i<cfg.cloudCount;i++) {
      const x=view.left+(i*cycle/cfg.cloudCount+t*cfg.cloudSpeed*(1+i*.2))%cycle-130;
      const size=cfg.cloudSize*(1+(i%2)*.2);
      const y=Math.min(22+(i%3)*20,view.top+(cfg.ground-view.top)*(.3+i*.14));
      ctx.drawImage(image,x,y,size*2,size*env.aspect);
    }
    const pulse=Math.max(env.pulse||0,env.entrance||0);
    if(pulse) {
      const glow=ctx.createRadialGradient(700,92,0,700,92,170);
      glow.addColorStop(0,`rgba(${palette.glow},${VisualConstants.pulseAlpha*pulse})`);
      glow.addColorStop(1,`rgba(${palette.glow},0)`);
      ctx.fillStyle=glow; ctx.fillRect(530,-78,340,340);
    }
    ctx.restore();
  }
  function paintLight() {} // Broad daylight; no cavern cone or vignette.
  const surfaces=new Map();
  function surface(id,radius,rocky) {
    const key=`${id}:${radius}:${rocky}`;
    if(surfaces.has(key)) return surfaces.get(key);
    const canvas=document.createElement('canvas'); canvas.width=canvas.height=Math.ceil(radius*2.6);
    const c=canvas.getContext('2d'),rand=random(cfg.seed+id*137);
    c.fillStyle=cfg.grain;
    for(let i=0;i<cfg.pebbleCount;i++) c.fillRect(rand()*canvas.width,rand()*canvas.height,2,1);
    surfaces.set(key,canvas); return canvas;
  }
  return {paintBackground,paintLight,drawAmbient,surface,lit,get flatOre() { return !window.SceneAssets?.backgrounds.classic; },bannerTint};
})();
