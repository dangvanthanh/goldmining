'use strict';
// Local decoded art only. Providers retain their procedural fallback on load failure.
window.SceneAssets = (() => {
  const backgrounds = {}, sprites = {};
  const names = ['gold', 'rock', 'diamond', 'gem', 'bag', 'tnt', 'pig', 'cart', 'winch', 'normal', 'pulling', 'surprised', 'happy', 'worried'];
  function load(name, target) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => { target[name] = image; resolve(true); };
      image.onerror = () => resolve(false);
      image.src = `assets/aaa/${name}.webp`;
    });
  }
  const ready = Promise.all([
    ...['classic', 'sky', 'cavern'].map(name => load(name, backgrounds)),
    ...names.map(name => load(name, sprites))
  ]);
  function paintBackground(theme, canvas, view) {
    const image = backgrounds[theme];
    if (!image) return false;
    const c = canvas.getContext('2d'), { left = 0, right = 1100, top = 0, bottom = 580 } = view;
    const width = right - left, height = bottom - top;
    if (theme === 'cavern') {
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
      c.drawImage(image, left + (width - w) / 2, top + (height - h) / 2, w, h);
    } else {
      const ground = 142, horizon = VisualConstants.authored.horizon[theme];
      // Separate depth planes: a tall portrait sky must not magnify the soil texture.
      const skyline = image.naturalHeight * horizon;
      for (const [sy, sh, dy, dh] of [[0,skyline,top,ground-top],[skyline,image.naturalHeight-skyline,ground,bottom-ground]]) {
        if(dh<=0) continue;
        const scale=Math.max(width/image.naturalWidth,dh/sh), w=image.naturalWidth*scale, h=sh*scale;
        c.save(); c.beginPath(); c.rect(left,dy,width,dh); c.clip();
        c.drawImage(image,0,sy,image.naturalWidth,sh,left+(width-w)/2,dy,w,h);
        c.restore();
      }
    }
    return true;
  }
  function ambient(ctx, now, env, theme) {
    const cfg = VisualConstants.authored, t = now / 1000;
    const view = env.view || { left: 0, right: 1100, top: 0, bottom: 580 };
    ctx.save(); ctx.fillStyle = theme === 'cavern' ? '#ffe1a1' : '#fff2cc';
    for (let i = 0; i < cfg.motes; i++) {
      const x = view.left + (i * 137 + t * cfg.drift) % (view.right - view.left);
      const y = view.top + ((i * 83) % 580) / 580 * (view.bottom - view.top) + Math.sin(t * .5 + i) * 4;
      ctx.globalAlpha = cfg.moteAlpha * (.6 + Math.sin(t + i) * .4);
      const size = cfg.motePx / (env.scale || 1);
      ctx.fillRect(x, y, size, size);
    }
    ctx.restore();
  }
  return { backgrounds, sprites, ready, paintBackground, ambient };
})();
