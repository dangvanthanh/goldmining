'use strict';
// Five local painted expressions with cached procedural fallback; no per-frame paths.
window.ProspectorArt = (() => {
  const sprites = new Map();
  function sprite(mood, theme) {
    const key = theme + ':' + mood;
    if (sprites.has(key)) return sprites.get(key);
    const p = VisualConstants.palettes[theme], c = document.createElement('canvas');
    c.width = 400; c.height = 480;
    const g = c.getContext('2d');
    g.lineCap = g.lineJoin = 'round';
    function oval(x, y, rx, ry, fill, stroke = p.outline, width = 5) {
      g.beginPath(); g.ellipse(x,y,rx,ry,0,0,Math.PI*2); g.fillStyle=fill; g.fill();
      if(stroke) { g.strokeStyle=stroke; g.lineWidth=width; g.stroke(); }
    }
    function path(points, fill, stroke = p.outline, width = 5) {
      g.beginPath(); points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y)); g.closePath();
      g.fillStyle=fill; g.fill(); g.strokeStyle=stroke; g.lineWidth=width; g.stroke();
    }
    function line(points, color, width) {
      g.beginPath(); points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
      g.strokeStyle=color; g.lineWidth=width; g.stroke();
    }
    // Broad shoulders, work gloves, heavy boots and an unmistakable pickaxe.
    oval(200,447,128,15,p.outline,null); g.globalAlpha=.95;
    path([[119,338],[185,338],[181,429],[135,429]],p.coatShade);
    path([[212,338],[272,338],[265,429],[220,429]],p.coatShade);
    oval(150,431,39,15,p.outline); oval(245,431,39,15,p.outline);
    path([[110,251],[157,230],[246,230],[289,252],[279,351],[120,351]],p.coat);
    path([[155,244],[174,242],[183,351],[159,351]],p.helmet);
    path([[231,242],[249,245],[241,351],[218,351]],p.helmet);
    path([[100,258],[126,263],[110,337],[74,326]],p.coatShade);
    path([[279,258],[303,266],[323,326],[290,339]],p.coatShade);
    oval(87,329,20,23,p.skin); oval(308,330,21,23,p.skin);
    line([[288,409],[316,257]],p.outline,19);
    line([[288,409],[316,257]],p.helmet,10);
    path([[265,250],[301,231],[329,233],[366,263],[331,252],[302,249]],p.steel);
    oval(200,163,78,94,p.skin);
    oval(147,169,14,21,p.skin); oval(253,169,14,21,p.skin);
    // Round cream beard and a large moustache make the same silhouette readable at 300px.
    path([[139,188],[154,180],[200,195],[246,180],[261,188],[250,230],[229,256],[200,271],[169,256],[149,230]],p.beard);
    oval(165,174,17,10,p.cheek,null); oval(236,174,17,10,p.cheek,null);
    const surprised=mood==='surprised', worried=mood==='worried', pulling=mood==='pulling';
    for(const x of [173,227]) {
      oval(x,148,13,surprised?20:pulling?9:15,p.lamp);
      oval(x+(worried?-2:2),151,5,surprised?9:7,p.outline,null);
      oval(x+3,145,2.5,3,p.lamp,null);
    }
    line([[154,124],[177, worried?115:pulling?130:119]],p.outline,8);
    line([[223,worried?115:pulling?130:119],[246,124]],p.outline,8);
    oval(200,176,16,14,p.skin); line([[193,180],[205,184]],p.cheek,3);
    if(surprised) oval(200,218,13,18,p.outline);
    else {
      g.beginPath(); g.moveTo(180,215);
      g.quadraticCurveTo(200,worried?198:mood==='happy'?248:pulling?218:230,220,215);
      g.strokeStyle=p.outline; g.lineWidth=6; g.stroke();
      if(mood==='happy'||pulling) line([[185,216],[215,216]],p.lamp,5);
    }
    oval(179,198,23,9,p.beard); oval(221,198,23,9,p.beard);
    // Varnished helmet, metal band, and a headlamp — not an abstract face icon.
    path([[124,101],[139,58],[166,40],[230,40],[261,58],[277,101]],p.helmet);
    path([[143,84],[151,61],[174,48],[218,48],[235,63],[243,85]],p.helmetLight,p.helmet,3);
    oval(200,101,86,13,p.helmet); line([[131,107],[269,107]],p.outline,5);
    oval(205,77,21,21,p.steel); oval(205,77,14,14,p.lamp);
    oval(201,72,6,6,p.helmetLight,null);
    sprites.set(key,c); return c;
  }
  function draw(ctx,x,y,height,mood,theme) {
    const image=window.SceneAssets?.sprites[mood] || sprite(mood,theme), width=height*image.width/image.height;
    ctx.drawImage(image,x-width/2,y,width,height);
  }
  function head(ctx,x,y,r,mood,theme) {
    ctx.drawImage(sprite(mood,theme),112,30,176,244,x-r,y-r,r*2,r*2.77);
  }
  function paint(canvas,mood,theme) {
    if(!canvas) return;
    canvas.dataset.expression=mood;
    const ctx=canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height);
    draw(ctx,canvas.width/2,0,canvas.height,mood,theme);
  }
  return {draw,head,paint};
})();
