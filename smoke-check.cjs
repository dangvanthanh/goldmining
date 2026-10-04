'use strict';
// Real Chromium + real Canvas/IndexedDB. Node 22+; no npm dependencies.
const assert = require('node:assert/strict');
const { readFileSync, mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync } = require('node:fs');
const { createServer } = require('node:http');
const { spawn } = require('node:child_process');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

const browser = process.env.CHROME_BIN || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'
].find(existsSync);
if (!browser) throw new Error('Set CHROME_BIN to a Chrome/Chromium executable.');
const files = new Map(['index.html', 'style.css', 'game.js', 'cavern-art.js', 'sky-art.js', 'classic-art.js', 'Constants.js', 'EventBus.js', 'scene-assets.js', 'prospector-art.js', 'vendor/dexie.min.js']
  .map(name => [name, readFileSync(join(__dirname, name), 'utf8')]));
for (const name of ['classic','sky','cavern','gold','rock','diamond','gem','bag','tnt','pig','cart','winch','normal','pulling','surprised','happy','worried']) {
  const path = `assets/aaa/${name}.webp`;
  files.set(path, readFileSync(join(__dirname, path)));
}
// Inspection/seeding exists only in this server's in-memory response, never in the shipped game.
files.set('game.js', 'window.__hudWrites = 0;\n' + files.get('game.js')
  .replace('function updateHUD() {', 'function updateHUD() { window.__hudWrites++;')
  .replace(/\n\}\)\(\);\s*$/, `
  window.__smoke = {
    state: () => ({ phase, time, bank, haul, shownScore, length, hookState, caught: caught?.id ?? null,
      shakeMag, objectAspect, fit, level, taken: objects.filter(o => o.taken).map(o => o.id) }),
    credit: n => { haul = n; updateHUD(); },
    expire: () => { deadline = performance.now() - 1; },
    catch: type => { caught = objects.find(o => !o.taken && o.type === type); caught.taken = true; hookState = 'back'; length = 180; updateHUD(); },
    launchAt: (type, keepAnother=false) => { const obj = objects.find(o => !o.taken && o.type === type); objects.forEach(o => { o.taken = o !== obj; }); if(keepAnother) objects.find(o=>o!==obj && Math.abs(Math.atan2(o.x-origin.x,o.y-origin.y)-Math.atan2(obj.x-origin.x,obj.y-origin.y))>.4).taken=false; angle = Math.atan2(obj.x - origin.x, obj.y - origin.y); drop(); return obj.id; },
    sounds: () => { for (const fn of Object.values(SFX)) fn(1); return Object.keys(SFX); },
    musicState: () => ({ enabled: music, active: Boolean(musicNodes), context: audio?.state }),
    pigsAtEdge: edge => { let count=0; for(const o of objects) if(o.speed) { o.x=edge==='left'?o.radius+40:W-o.radius-40; o.direction=edge==='left'?-1:1; count++; } return count; },
    effects: () => ({ particles: particles.length, crankAngle, reelClick }),
    presentation: () => ({ rings:rings.length, trail:trail.length, portrait:portraitBox }),
    backgroundPixels: () => [[120,240],[220,370],[870,450]].flatMap(([x,y])=>[...background.getContext('2d').getImageData(Math.round(fit.ox+x*fit.sx),Math.round(fit.oy+y*fit.sy),1,1).data]),
    cartGold: () => { const r={x:Math.floor(fit.ox+646*fit.sx),y:Math.floor(fit.oy+70*fit.sy),width:Math.ceil(134*fit.sx),height:Math.ceil(23*fit.sy)},d=ctx.getImageData(r.x,r.y,r.width,r.height).data; let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>140&&d[i+1]>100&&d[i+2]<130)n++;return n; },
    revealed: () => { const labels = [], fill = ctx.fillText; ctx.fillText = function(text, ...args) { const m = this.measureText(text), t = this.getTransform(), pad = this.lineWidth / 2; labels.push({text, font:this.font, box:{x:t.e+(args[0]-m.actualBoundingBoxLeft-pad)*t.a,y:t.f+(args[1]-m.actualBoundingBoxAscent-pad)*t.d,width:(m.actualBoundingBoxLeft+m.actualBoundingBoxRight+2*pad)*t.a,height:(m.actualBoundingBoxAscent+m.actualBoundingBoxDescent+2*pad)*t.d}}); return fill.call(this, text, ...args); }; try { draw(performance.now()); } finally { ctx.fillText = fill; } return labels; },
    blast: () => { objects = [300, 410, 520].map((x, id) => ({...types.tnt, type:'tnt', id, x, y:350, taken:false, rotation:0})); objects.push({...types.rock, type:'rock', id:3, x:315, y:400, taken:false, rotation:0}, {...types.diamond, type:'diamond', id:4, x:800, y:500, taken:false, rotation:0}); detonate(objects[0]); return objects.map(o=>o.taken); },
    gear: () => { dynamite = 2; strength = true; book = true; magnet = true; updateHUD(); },
    mine: index => { level = index; bank = 0; startLevel(); },
    rig: (a, l, mode) => {
      const previous = { angle, length, hookState, crankAngle, caught }, chain = drawChain, claw = drawClaw, oval = ellipse;
      let cable, eye, grip, handle, operator;
      const painted = window.ProspectorArt.draw;
      window.ProspectorArt.draw = (...args) => {
        const [,x,y,height,mood] = args, image = SceneAssets.sprites[mood];
        if (image) {
          operator = { image, x, y, height, transform: ctx.getTransform() };
          // Source-art landmark: the forward glove is at 90.5% width / 42.4% height.
          grip = { x: x + .405 * height * image.width / image.height, y: y + .424 * height };
        }
        return painted(...args);
      };
      angle = a; length = l; hookState = mode; crankAngle = a;
      caught = mode === 'back' ? objects.find(o => o.type === 'rock') : null;
      ellipse = (x,y,rx,ry,...args) => {
        if (rx===4.5 && ry===4.5) handle = {x,y};
        if (rx===4.5 && ry===3.5 || rx===4 && ry===3) grip = {x,y};
        return oval(x,y,rx,ry,...args);
      };
      drawChain = (from, to, ...args) => { cable = { from, to }; return chain(from, to, ...args); };
      drawClaw = (...args) => {
        const arc = ctx.arc;
        ctx.arc = function(x, y, r, ...rest) {
          if (x === 0 && y === -13 && r === 3) {
            const t = this.getTransform();
            eye = { x: (t.e + t.c * (y - r) - fit.ox) / fit.sx, y: (t.f + t.d * (y - r) - fit.oy) / fit.sy };
          }
          return arc.call(this, x, y, r, ...rest);
        };
        try { return claw(...args); } finally { ctx.arc = arc; }
      };
      try {
        draw(performance.now());
        let gloveError;
        if (operator) {
          const { image, x, y, height, transform } = operator, width = height * image.width / image.height;
          const reference = document.createElement('canvas'); reference.width = canvas.width; reference.height = canvas.height;
          const c = reference.getContext('2d'); c.setTransform(transform); c.drawImage(image,x-width/2,y,width,height);
          // Independently measured landmarks inside the painted forward glove, not a renderer helper.
          const points = [[.89,.409],[.91,.419],[.92,.43]];
          gloveError = Math.max(...points.map(([u,v]) => {
            const px = Math.round(transform.e + (x-width/2+u*width)*transform.a), py = Math.round(transform.f+(y+v*height)*transform.d);
            const actual = ctx.getImageData(px,py,1,1).data, expected = c.getImageData(px,py,1,1).data;
            return Math.max(...[0,1,2].map(i=>Math.abs(actual[i]-expected[i])));
          }));
        }
        return { cable, eye, grip, handle, gloveError, operatorFeet: operator ? operator.y + operator.height : null };
      }
      finally { ({ angle, length, hookState, crankAngle, caught } = previous); drawChain = chain; drawClaw = claw; ellipse = oval; window.ProspectorArt.draw = painted; }
    },
    shake, makeMap, saveProgress, validSave
  };
})();`));
const server = createServer((req, res) => {
  const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!files.has(name)) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', name.endsWith('.webp') ? 'image/webp' : name.endsWith('.html') ? 'text/html' : name.endsWith('.css') ? 'text/css' : 'text/javascript');
  res.end(files.get(name));
});
let child, socket, failures = 0, sequence = 0;
const profile = mkdtempSync(join(tmpdir(), 'goldmining-smoke-')), pending = new Map(), errors = [];
const shots = process.env.SMOKE_SHOTS;
if (shots) mkdirSync(shots, { recursive: true });
const timeout = setTimeout(() => { console.error('Smoke check timed out.'); child?.kill(); process.exitCode = 1; socket?.close(); server.close(); }, 120000);
async function check(name, fn) {
  try { await fn(); console.log('PASS', name); }
  catch (error) { failures++; console.error('FAIL', name, '—', error.message); }
}
function send(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timed out`)); }, 5000);
    pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const out = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (out.exceptionDetails) throw new Error(out.exceptionDetails.exception?.description || out.exceptionDetails.text);
  return out.result.value;
}
async function click(id) {
  const point = await evaluate(`(() => { let el = document.getElementById(${JSON.stringify(id)}); if (el.matches('input[type="radio"]')) el = el.closest('label'); el.scrollIntoView({block:'center'}); const r = el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
}
const state = () => evaluate('__smoke.state()');
async function key(key, code = key, modifiers = 0) {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, modifiers, windowsVirtualKeyCode: key === 'Tab' ? 9 : key === ' ' ? 32 : key === 'ArrowDown' ? 40 : 0 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, modifiers });
}
async function waitFor(expression) {
  for (let i = 0; i < 80; i++) { if (await evaluate(expression)) return; await delay(50); }
  throw new Error(`Never reached: ${expression}`);
}
async function screenshot(name) {
  if (!shots) return;
  const { data } = await send('Page.captureScreenshot'); writeFileSync(join(shots, name + '.png'), Buffer.from(data, 'base64'));
}
(async () => {
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    child = spawn(browser, ['--headless=new', '--no-sandbox', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
    const endpoint = await new Promise((resolve, reject) => {
      child.once('error', reject); child.once('exit', code => reject(new Error(`Browser exited: ${code}`)));
      let log = ''; child.stderr.on('data', chunk => { log += chunk; const match = log.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) resolve(new URL(match[1])); });
    });
    const targets = await (await fetch(`http://${endpoint.host}/json/list`)).json();
    socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
    socket.addEventListener('message', event => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
      if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) errors.push(msg.params.args.map(a => a.value || a.description).join(' '));
      const task = pending.get(msg.id); if (!task) return;
      pending.delete(msg.id); clearTimeout(task.timer);
      if (msg.error) task.reject(new Error(msg.error.message)); else task.resolve(msg.result);
    });
    await send('Runtime.enable'); await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 580, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/` });
    await waitFor('Boolean(window.__smoke)');
    await check('boot and JSON inspection', async () => {
      const s = await evaluate('JSON.parse(render_game_to_text())'); assert.equal(s.phase, 'ready'); assert.equal(s.objects.length, 16);
    });
    await check('authored scene art decodes with transparent ore and five miner expressions', async () => {
      assert.equal(await evaluate('Boolean(window.SceneAssets)'),true);
      await evaluate('SceneAssets.ready');
      const sprites=await evaluate(`Object.fromEntries(Object.entries(SceneAssets.sprites).map(([k,v])=>[k,[v.naturalWidth,v.naturalHeight]]))`);
      for(const key of ['gold','rock','diamond','gem','bag','tnt','pig','cart','winch','normal','pulling','surprised','happy','worried']) assert.ok(sprites[key]?.[0]>100 && sprites[key]?.[1]>100,key);
      assert.equal(await evaluate(`(()=>{const c=document.createElement('canvas');c.width=c.height=1;const ctx=c.getContext('2d');ctx.drawImage(SceneAssets.sprites.gold,0,0);return ctx.getImageData(0,0,1,1).data[3]})()`),0,'Ore sprites must have a real transparent background');
    });
    await check('fresh profiles use Classic by default', async () => {
      assert.equal(await evaluate('JSON.parse(render_game_to_text()).art'),'classic');
      assert.equal(await evaluate("document.getElementById('art-classic')?.checked"),true);
      await screenshot('classic-welcome');
    });
    await check('welcome has a visible procedural prospector, not an empty ornament', async () => {
      const hero = await evaluate(`(() => { const c=document.querySelector('#welcome-overlay .prospector-portrait'); if(!c) return null; const r=c.getBoundingClientRect(), p=c.getContext('2d').getImageData(0,0,c.width,c.height).data; return {width:r.width,height:r.height,painted:Array.from(p).filter((v,i)=>i%4===3&&v>0).length}; })()`);
      assert.ok(hero && hero.width >= 100 && hero.height >= 80 && hero.painted > 1000, 'Opening needs a painted, readable prospector');
    });
    await check('welcome and guide focus', async () => {
      await evaluate("document.getElementById('welcome-settings').focus()"); await key('Tab');
      assert.equal(await evaluate('document.activeElement.id'), 'welcome-new');
      await click('welcome-guide'); await click('guide-back');
      assert.equal(await evaluate("document.getElementById('overlay').hidden"), true);
    });
    await check('opening panel fits desktop without scrolling', async () => {
      const box=await evaluate(`(() => {const e=document.getElementById('welcome-overlay'),p=e.querySelector('.welcome-panel').getBoundingClientRect();return {scroll:e.scrollHeight,height:e.clientHeight,top:p.top,bottom:p.bottom};})()`);
      assert.ok(box.scroll<=box.height && box.bottom<=580,JSON.stringify(box));
    });
    await click('welcome-new');
    await check('inventory presents four meaningful slots, not an empty placeholder', async () => {
      assert.equal(await evaluate("document.querySelectorAll('.action-bar .action-item').length"),4);
      assert.equal(await evaluate("document.querySelector('.action-slot')!==null"),false);
    });
    await check('operator keeps its natural painted glove while holding the crank', async () => {
      await click('settings'); await click('art-classic'); await click('settings-close');
      await evaluate('SceneAssets.ready');
      for (const [a,mode] of [[0,'swing'],[-1.05,'out'],[1.05,'back']]) {
        const rig = await evaluate(`__smoke.rig(${a},180,${JSON.stringify(mode)})`);
        assert.ok(rig.gloveError < 24, `The live crank must not cut out or paint over the authored glove (RGB error ${rig.gloveError})`);
        assert.ok(Math.abs(rig.operatorFeet - 132) < .01, 'The cranking pose must stay planted on the catwalk, not bob through it');
      }
    });
    await check('winch cable stays attached to its pivot and claw eye through swing, drop and reel', async () => {
      try {
        for (const [width,height] of [[1100,580],[393,851],[844,390]]) {
          await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }); await delay(180);
          for (const theme of ['classic','sky','cavern']) {
            await click('settings'); await click('art-'+theme); await click('settings-close');
            for (const [a,l,mode] of [[0,23,'swing'],[-Math.PI/3,23,'swing'],[Math.PI/3,180,'out'],[-Math.PI/3,420,'back']]) {
              const { cable, eye, grip, handle } = await evaluate(`__smoke.rig(${a},${l},${JSON.stringify(mode)})`);
              assert.deepEqual(cable.from, {x:550,y:132}, 'Cable must leave the fixed guide, not a point above its swing pivot');
              assert.ok(eye && Math.hypot(cable.to.x-eye.x,cable.to.y-eye.y)<.001, 'Cable must terminate on the rendered eye, not inside the claw');
              assert.ok(grip && handle && Math.hypot(grip.x-handle.x,grip.y-handle.y)<.001, 'The miner must hold the crank throughout its turn');
            }
          }
        }
      } finally {
        await send('Emulation.setDeviceMetricsOverride', { width:1100,height:580,deviceScaleFactor:1,mobile:false }); await delay(180);
        await click('settings'); await click('art-classic'); await click('settings-close'); await evaluate('__smoke.mine(0)');
      }
    });
    await check('HUD communicates target met accessibly and reverses on retry', async () => {
      await evaluate('__smoke.credit(600)');
      assert.equal(await evaluate("document.querySelector('.plaque').dataset.target"),'met');
      assert.equal(await evaluate("document.getElementById('target-progress').getAttribute('aria-valuetext')"),'$600 of $525 target');
      await evaluate('__smoke.credit(0)');
      assert.equal(await evaluate("document.querySelector('.plaque').dataset.target"),'mining');
      assert.equal(await evaluate("document.getElementById('mine-number').textContent"),'01 / 100');
    });
    await check('first-second HUD refresh formats one minute, not 00:60', async () => {
      await delay(80); await evaluate('__smoke.credit(1)');
      try { assert.equal(await evaluate("document.getElementById('timer').textContent"), '01:00'); }
      finally { await evaluate('__smoke.credit(0)'); }
    });
    await check('score settles exactly and retries clear it', async () => {
      await evaluate('__smoke.credit(525)'); await delay(900);
      assert.equal(await evaluate("document.getElementById('haul').textContent"), '$525');
      for (let i = 0; i < 3; i++) {
        await evaluate('__smoke.credit(20); __smoke.expire()'); await waitFor("__smoke.state().phase === 'lost'");
        await click('retry'); await delay(600); const s = await state();
        assert.equal(s.haul, 0); assert.equal(s.shownScore, 0); assert.equal(s.caught, null); assert.deepEqual(s.taken, []);
      }
    });
    await check('settings freezes clock, blocks shortcuts, traps focus', async () => {
      await click('settings'); const before = await state(); await delay(700);
      assert.equal((await state()).time, before.time);
      await evaluate("document.getElementById('sound-toggle').focus()"); await key(' ', 'Space'); await key('ArrowDown'); await key('p', 'KeyP');
      assert.equal((await state()).hookState, 'swing'); assert.equal(await evaluate("document.getElementById('overlay').hidden"), true);
      await evaluate("document.getElementById('settings-close').focus()"); await key('Tab');
      assert.equal(await evaluate('document.activeElement.id'), 'sound-toggle');
      await screenshot('classic-settings');
      await click('settings-close'); assert.equal((await state()).phase, 'playing');
    });
    await check('reduced motion disables shake and settles score immediately', async () => {
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }); await delay(50);
      await evaluate('__smoke.shake(12); __smoke.credit(100)'); assert.equal((await state()).shakeMag, 0); assert.equal((await state()).shownScore, 100);
      await send('Emulation.setEmulatedMedia', { features: [] }); await evaluate('__smoke.credit(0)');
    });
    await check('HUD writes at most once per animation frame during idle', async () => {
      const counts = await evaluate(`new Promise(resolve => { const before = __hudWrites; let frames = 0; const tick = () => { if (++frames < 20) requestAnimationFrame(tick); else resolve({frames, writes: __hudWrites - before}); }; requestAnimationFrame(tick); })`);
      assert.ok(counts.writes <= counts.frames + 1, JSON.stringify(counts));
    });
    await check('visual trails and rings are capped, expire paused, and respect reduced motion', async () => {
      try {
        await evaluate("__smoke.mine(0); __smoke.launchAt('diamond',true)"); await delay(180);
        let fx=await evaluate('__smoke.presentation()'); assert.ok(fx.trail>0&&fx.trail<=9);
        await evaluate('for(let i=0;i<10;i++) __smoke.blast()');
        fx=await evaluate('__smoke.presentation()'); assert.ok(fx.rings>0&&fx.rings<=6);
        await click('pause'); await delay(850); fx=await evaluate('__smoke.presentation()'); assert.equal(fx.rings,0); assert.equal(fx.trail,0);
        await click('resume');
        await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]}); await delay(60);
        await evaluate('__smoke.mine(0); __smoke.blast()'); await delay(80);
        fx=await evaluate('__smoke.presentation()'); assert.equal(fx.rings,0); assert.equal(fx.trail,0);
      } finally { await send('Emulation.setEmulatedMedia',{features:[]}); await evaluate('__smoke.mine(0)'); }
    });
    await check('cart visibly fills from actual haul, not an always-full decoration', async () => {
      await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
      try {
        await evaluate('__smoke.mine(0)'); await delay(100); const empty=await evaluate('__smoke.cartGold()');
        await evaluate('__smoke.credit(525)'); await delay(100); const filled=await evaluate('__smoke.cartGold()');
        assert.ok(filled>empty+100,JSON.stringify({empty,filled}));
      } finally { await send('Emulation.setEmulatedMedia',{features:[]}); await evaluate('__smoke.mine(0)'); }
    });
    await check('Classic is an original distinct painted provider, not a Sky alias', async () => {
      assert.equal(await evaluate('typeof window.ClassicArt'),'object');
      await click('settings'); await click('art-classic'); await click('settings-close'); await delay(200);
      const classic=await evaluate('__smoke.backgroundPixels()');
      await click('settings'); await click('art-sky'); await click('settings-close'); await delay(200);
      const sky=await evaluate('__smoke.backgroundPixels()');
      assert.notDeepEqual(classic,sky); assert.ok(classic.some((v,i)=>i%4!==3&&v>0));
      await click('settings'); await click('art-classic'); await click('settings-close');
    });
    await check('theme switching preserves current catch, cash and object IDs', async () => {
      await evaluate("__smoke.mine(0); __smoke.catch('small')"); await click('settings');
      assert.equal(await evaluate("document.getElementById('settings-overlay').hidden"),false);
      const before=await state(), ids=await evaluate('JSON.parse(render_game_to_text()).objects.map(o=>o.id)');
      try {
        for(const theme of ['cavern','sky','classic']) {
          await click('art-'+theme);
          assert.equal(await evaluate('document.documentElement.dataset.art'),theme);
          const after=await state();
          for(const k of ['bank','haul','caught','length','hookState','phase','time','taken']) assert.deepEqual(after[k],before[k],k+' changed on '+theme);
          assert.deepEqual(await evaluate('JSON.parse(render_game_to_text()).objects.map(o=>o.id)'),ids);
        }
      } finally { await click('settings-close'); await evaluate('__smoke.mine(0)'); }
    });
    await check('catch survives reload and scores once', async () => {
      await evaluate("__smoke.catch('small'); document.getElementById('pause').click()"); const before = await state();
      await evaluate('__smoke.saveProgress()'); await send('Page.reload'); await waitFor("Boolean(window.__smoke) && !document.getElementById('welcome-continue').disabled");
      await click('welcome-continue'); await waitFor("__smoke.state().phase === 'paused'"); const after = await state();
      assert.equal(after.caught, before.caught); assert.equal(after.length, before.length); assert.equal(after.time, before.time);
      await click('resume'); await waitFor('__smoke.state().haul > 0'); const haul = (await state()).haul; await delay(700); assert.equal((await state()).haul, haul);
    });
    await check('isolated diamond launch does not tunnel through its target', async () => {
      await evaluate('__smoke.mine(0)');
      try {
        const id = await evaluate("__smoke.launchAt('diamond')");
        await waitFor("__smoke.state().hookState === 'back'"); assert.equal((await state()).caught, id);
        await waitFor("__smoke.state().hookState === 'swing'");
      } finally { await evaluate('__smoke.mine(0)'); }
    });
    await check('all synthesized effects run without errors', async () => {
      const names = await evaluate('__smoke.sounds()'); assert.ok(names.includes('boom') && names.includes('bank') && names.includes('drop'));
    });
    await check('dynamite and magnetic claw consume one charge', async () => {
      await evaluate('__smoke.gear()'); await click('magnet-item'); await evaluate("document.getElementById('mine').focus()"); await key('ArrowDown');
      assert.equal(await evaluate("document.getElementById('magnet-count').textContent"), '0');
      await evaluate("__smoke.catch('rock')"); await click('dynamite'); await click('dynamite');
      assert.equal(await evaluate("document.getElementById('dynamite-count').textContent"), '1'); assert.equal((await state()).caught, null);
    });
    await check('TNT chains destroy nearby objects, not distant treasure or cash', async () => {
      const before = await state(), removed = await evaluate('__smoke.blast()'), after = await state();
      assert.deepEqual(removed, [true,true,true,true,false]); assert.equal(after.haul, before.haul); assert.equal(after.bank, before.bank);
      const effects = await evaluate('__smoke.effects()'); assert.ok(effects.particles > 0 && effects.particles <= 180);
      await evaluate('__smoke.mine(0)');
    });
    await check('book reveal matches actual diamond and pig payouts', async () => {
      await evaluate('__smoke.mine(10); __smoke.gear()');
      try {
        const values = await evaluate("__smoke.makeMap(10).filter(o=>['diamond','diamondPig'].includes(o.type)).map(o=>({type:o.type,value:o.value}))");
        let haul = 0;
        for (const {type, value} of values.filter((o,i,a)=>a.findIndex(x=>x.type===o.type)===i)) {
          const expected = type === 'diamondPig' ? 25 + Math.round((value-25)*1.5) : Math.round(value*1.5);
          const inspected = await evaluate(`JSON.parse(render_game_to_text()).objects.find(o=>o.type===${JSON.stringify(type)}).value`);
          assert.equal(inspected, expected);
          await click('book-item'); const labels = await evaluate('__smoke.revealed()');
          assert.ok(labels.some(l=>l.text==='$'+expected.toLocaleString('en-US')));
          await evaluate(`__smoke.catch(${JSON.stringify(type)})`); haul += expected;
          await waitFor(`__smoke.state().haul === ${haul}`);
        }
      } finally { await evaluate('__smoke.mine(0)'); }
    });
    await check('earned rewards change the prospector expression without changing payouts', async () => {
      await evaluate('__smoke.mine(0)');
      await evaluate("__smoke.launchAt('diamond',true)"); await waitFor("__smoke.state().hookState === 'back'");
      assert.equal(await evaluate('document.getElementById("mine").dataset.expression'), 'surprised');
      await waitFor('__smoke.state().haul > 0');
      assert.equal(await evaluate('document.getElementById("mine").dataset.expression'), 'happy');
      const total=(await state()).haul; await delay(550); assert.equal((await state()).haul,total);
      await evaluate('__smoke.mine(0)');
    });
    await check('results show exact earned and target figures in distinct cards', async () => {
      await evaluate('__smoke.credit(176); __smoke.expire()'); await waitFor("__smoke.state().phase === 'lost'");
      const result=await evaluate(`({kind:document.getElementById('dialog').dataset.scene, amounts:[...document.querySelectorAll('.result-stat dd')].map(e=>e.textContent), expression:document.querySelector('#dialog .prospector-portrait')?.dataset.expression})`);
      assert.equal(result.kind,'lost'); assert.deepEqual(result.amounts,['$176','$525','$349']); assert.equal(result.expression,'worried');
      await screenshot('classic-loss');
      await click('retry');
    });
    await check('shop primary action fits desktop without scrolling', async () => {
      await evaluate('__smoke.credit(2000); __smoke.expire()'); await waitFor("__smoke.state().phase === 'shop'"); await delay(250);
      const bounds=await evaluate(`(() => {const r=document.getElementById('next').getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:innerHeight};})()`);
      assert.ok(bounds.top>=bounds.height*.08 && bounds.bottom<=bounds.height,'Next mine must fit the safe viewport');
      const scroll=await evaluate("({height:document.getElementById('overlay').clientHeight,scroll:document.getElementById('overlay').scrollHeight})");
      assert.ok(scroll.scroll<=scroll.height,'Desktop shop must fit its scrollport: '+JSON.stringify(scroll));
      await screenshot('classic-shop-desktop');
      await click('next'); await evaluate('__smoke.mine(0)');
    });
    await check('landscape shop fits its scrollport with a visible primary action', async () => {
      await send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:false});
      await waitFor("Math.abs(document.getElementById('settings').getBoundingClientRect().top-32)<1");
      try {
        await evaluate('__smoke.mine(0); __smoke.credit(2000); __smoke.expire()');
        await waitFor("__smoke.state().phase==='shop'"); await delay(250);
        const box=await evaluate(`(()=>{const e=document.getElementById('overlay'),r=document.getElementById('next').getBoundingClientRect();return {height:e.clientHeight,scroll:e.scrollHeight,top:r.top,bottom:r.bottom};})()`);
        assert.ok(box.scroll<=box.height && box.top>=32 && box.bottom<=390,JSON.stringify(box));
        await screenshot('classic-shop-landscape');
      } finally {
        await send('Emulation.setDeviceMetricsOverride',{width:1100,height:580,deviceScaleFactor:1,mobile:false});
        await waitFor("Math.abs(document.getElementById('settings').getBoundingClientRect().top-47)<1");
        await evaluate('__smoke.mine(0)');
      }
    });
    await check('shop purchase and mine transition persist', async () => {
      await evaluate('__smoke.credit(2000); __smoke.expire()'); await waitFor("__smoke.state().phase === 'shop'");
      const before = (await state()).bank; await click('buy-dynamite'); const after = (await state()).bank; assert.equal(before - after, 100);
      await evaluate('__smoke.saveProgress()'); await send('Page.reload'); await waitFor("Boolean(window.__smoke) && !document.getElementById('welcome-continue').disabled");
      await click('welcome-continue'); await waitFor("__smoke.state().phase === 'shop'"); assert.equal((await state()).bank, after);
      await click('next'); assert.equal((await state()).level, 1); assert.equal((await state()).phase, 'playing');
    });
    await check('all 100 maps are deterministic, reachable, non-overlapping', async () => {
      const issues = await evaluate(`(() => { const issues = []; for (let i = 0; i < 100; i++) { const m = __smoke.makeMap(i); if (JSON.stringify(m) !== JSON.stringify(__smoke.makeMap(i))) issues.push('seed '+i); for (const a of m.filter(o=>!o.speed)) { if (Math.abs(Math.atan2(a.x-550,a.y-132)) > 1.16) issues.push('reach '+i); for (const b of m.filter(o=>!o.speed)) if (a.id<b.id && Math.hypot(a.x-b.x,(a.y-b.y)/__smoke.state().objectAspect)<a.radius+b.radius) issues.push('overlap '+i); } } return issues; })()`);
      assert.deepEqual(issues, []);
    });
    await check('touch launches the claw through the actual canvas hit target', async () => {
      await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
      await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{x:550,y:300}] });
      await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      assert.equal((await state()).hookState, 'out'); await evaluate('__smoke.mine(1)');
    });
    await evaluate('__smoke.mine(40)');
    for (const art of ['classic', 'cavern', 'sky']) for (const [width, height] of [[320, 568], [393, 851], [844, 390], [2560, 850]]) {
      await check(`${art} ${width}×${height}: stable geometry and readable controls`, async () => {
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile: false });
        await waitFor(`Math.abs(document.getElementById('settings').getBoundingClientRect().top-Math.ceil(${height}*.08))<1`);
        await click('settings'); await click(`art-${art}`);
        const settingsFit=await evaluate("({height:document.getElementById('settings-overlay').clientHeight,scroll:document.getElementById('settings-overlay').scrollHeight})");
        await click('settings-close'); await delay(250);
        assert.ok(settingsFit.scroll<=settingsFit.height,'Settings must fit the responsive scrollport: '+JSON.stringify(settingsFit));
        assert.equal((await state()).objectAspect, 1);
        const ui = await evaluate(`({ overflow: document.documentElement.scrollWidth>innerWidth, controls: ['pause','settings','dynamite','book-item','magnet-item'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {id,width:r.width,height:r.height}}) })`);
        assert.equal(ui.overflow, false); for (const r of ui.controls) assert.ok(r.width>=44 && r.height>=44, JSON.stringify(r));
        const portrait=await evaluate('__smoke.presentation().portrait');
        assert.equal(portrait,null,'Only the actual gantry operator should appear during gameplay');
        const instrument=await evaluate("document.querySelector('.plaque').getBoundingClientRect().height");
        assert.ok(instrument<=82,'HUD must be a restrained instrument strip, not a giant card: '+instrument);
        const safe=await evaluate(`['.plaque','.hud-top-right'].map(s=>document.querySelector(s).getBoundingClientRect().top)`);
        for(const top of safe) assert.ok(top>=height*.08-1,'Top HUD must clear the top eight percent');
        const plaqueOverflow=await evaluate(`(() => {const p=document.querySelector('.plaque').getBoundingClientRect();return [...document.querySelectorAll('.plaque .plaque-row,.plaque .hud-label,.plaque .timer-wrap,.plaque .progress')].filter(e=>{const r=e.getBoundingClientRect();return r.bottom>p.bottom+1||r.right>p.right+1;}).map(e=>e.className);})()`);
        assert.deepEqual(plaqueOverflow,[],'Score plaque content must stay inside its frame');
        const blocked = await evaluate(`(() => { const c=document.getElementById('mine'), f=__smoke.state().fit, rect=c.getBoundingClientRect(), k=rect.width/c.width, ui=[...document.querySelectorAll('.plaque,.action-bar,.hud-top-right,.hud-hint')].map(el=>({name:el.className,r:el.getBoundingClientRect()})), issues=[]; const p=__smoke.presentation().portrait; if(p)ui.push({name:'prospector',r:{left:p.x-p.height*.42,right:p.x+p.height*.42,top:p.y-3,bottom:p.y+p.height+3}}); for(let i=0;i<100;i++) for(const o of __smoke.makeMap(i).filter(o=>!o.speed)) { const x=rect.left+(o.x*f.sx+f.ox)*k,y=rect.top+(o.y*f.sy+f.oy)*k,r=o.radius*f.sx*k; for(const u of ui) if(Math.hypot(x-Math.max(u.r.left,Math.min(x,u.r.right)),y-Math.max(u.r.top,Math.min(y,u.r.bottom)))<r) issues.push({mine:i+1,id:o.id,type:o.type,ui:u.name}); } return issues; })()`);
        assert.equal(blocked.length,0,JSON.stringify(blocked.slice(0,6)));
        await evaluate('__smoke.gear()'); await click('book-item');
        const labels = await evaluate('__smoke.revealed()'), scale = await evaluate('__smoke.state().fit.sx * document.getElementById("mine").clientWidth / document.getElementById("mine").width');
        const prices = labels.filter(l => /^\$[\d,]+$/.test(l.text)); assert.ok(prices.length > 0);
        for (const label of prices) assert.ok(parseFloat(label.font.match(/[\d.]+px/)[0]) * scale >= 11.9, label.font);
        for (let i=0;i<prices.length;i++) for(let j=i+1;j<prices.length;j++) { const a=prices[i].box,b=prices[j].box; assert.ok(a.x+a.width<=b.x || b.x+b.width<=a.x || a.y+a.height<=b.y || b.y+b.height<=a.y, prices[i].text+' overlaps '+prices[j].text); }
        await screenshot(`${art}-${width}x${height}`);
      });
    }
    await check('small-phone shop keeps Next visible without scrolling', async () => {
      await send('Emulation.setDeviceMetricsOverride',{width:320,height:568,deviceScaleFactor:2,mobile:false});
      await waitFor("Math.abs(document.getElementById('settings').getBoundingClientRect().top-568*.08)<1");
      try {
        for(const theme of ['classic','cavern','sky']) {
          await evaluate('__smoke.mine(0)'); await click('settings');
          assert.equal(await evaluate("document.getElementById('settings-overlay').hidden"),false);
          await click('art-'+theme); assert.equal(await evaluate('document.documentElement.dataset.art'),theme);
          const settings=await evaluate(`(()=>{const e=document.getElementById('settings-overlay'),p=e.querySelector('.settings-panel');return {width:e.clientWidth,scroll:e.scrollWidth,panel:p.getBoundingClientRect().width};})()`);
          assert.ok(settings.scroll<=settings.width,theme+': settings overflow '+JSON.stringify(settings));
          const settingsFit=await evaluate(`(()=>{const e=document.getElementById('settings-overlay'),h=document.getElementById('settings-title').getBoundingClientRect();return {height:e.clientHeight,scroll:e.scrollHeight,heading:h.top,overlay:e.getBoundingClientRect().top};})()`);
          assert.ok(settingsFit.scroll<=settingsFit.height && settingsFit.heading>=settingsFit.overlay,theme+': small-phone settings must fit without hiding the heading '+JSON.stringify(settingsFit));
          await screenshot(theme+'-settings-320x568'); await click('settings-close');
          await evaluate('__smoke.credit(2000); __smoke.expire()'); await waitFor("__smoke.state().phase === 'shop'"); await delay(300);
          const bounds=await evaluate(`(() => {const r=document.getElementById('next').getBoundingClientRect();return {top:r.top,bottom:r.bottom};})()`);
          assert.ok(bounds.top>=568*.08 && bounds.bottom<=568,theme+': '+JSON.stringify(bounds));
          await screenshot(theme+'-shop-320x568');
        }
      } finally {
        if (!await evaluate("document.getElementById('settings-overlay').hidden")) await click('settings-close');
        await evaluate('__smoke.mine(40); __smoke.gear()');
      }
    });
    await check('moving pig value labels stay inside both phone edges', async () => {
      await send('Emulation.setDeviceMetricsOverride', {width:320,height:568,deviceScaleFactor:2,mobile:false}); await delay(180);
      await click('book-item');
      for(const edge of ['left','right']) {
        const scene=await evaluate(`({pigs:__smoke.pigsAtEdge('${edge}'),labels:__smoke.revealed()})`);
        assert.equal(scene.pigs, 2);
        const prices=scene.labels.filter(row=>/^\$[\d,]+$/.test(row.text));
        assert.ok(prices.length > 0);
        for(const price of prices) assert.ok(price.box.x>=0 && price.box.x+price.box.width<=640, edge+' edge clips '+price.text);
      }
    });
    await check('saved music starts on New and Continue/Resume gestures', async () => {
      await evaluate("localStorage.setItem('gm-music','1')"); await send('Page.reload'); await waitFor('Boolean(window.__smoke)');
      try {
        await click('welcome-new'); assert.equal(await evaluate('__smoke.musicState().active'), true);
        await click('pause'); await evaluate('__smoke.saveProgress()'); await send('Page.reload');
        await waitFor("Boolean(window.__smoke) && !document.getElementById('welcome-continue').disabled");
        await click('welcome-continue'); await waitFor("__smoke.state().phase === 'paused'"); await click('resume');
        await waitFor("__smoke.musicState().context === 'running'"); assert.equal(await evaluate('__smoke.musicState().active'), true);
      } finally { await click('settings'); await click('music-toggle'); await click('settings-close'); }
    });
    await check('saved themes persist and invalid/missing preferences fall back to Classic', async () => {
      for(const preference of ['cavern','sky','classic','invalid','constructor','__proto__',null]) {
        await evaluate(preference===null ? "localStorage.removeItem('gm-art')" : `localStorage.setItem('gm-art',${JSON.stringify(preference)})`);
        await send('Page.reload'); await waitFor('Boolean(window.__smoke)');
        const want=['cavern','sky','classic'].includes(preference)?preference:'classic';
        assert.equal(await evaluate('JSON.parse(render_game_to_text()).art'),want);
        assert.equal(await evaluate(`document.getElementById('art-${want}')?.checked`),true);
      }
    });
    await check('legacy layouts and saved Classic art remain usable', async () => {
      await evaluate("localStorage.setItem('gm-art', 'classic')");
      await send('Page.reload'); await waitFor('Boolean(window.__smoke)');
      assert.equal(await evaluate('document.documentElement.dataset.art'), 'classic');
      assert.equal(await evaluate("document.getElementById('art-classic').checked"), true);
      for (const mapVersion of [1, 2, 3]) {
        const valid = await evaluate(`__smoke.validSave({version:1,mapVersion:${mapVersion},level:0,bank:0,haul:0,dynamite:0,strength:false,book:false,sound:true,time:60,angle:0,swing:0,length:23,hookState:'swing',taken:[],caughtId:null,phase:'paused'})`);
        assert.equal(valid, true);
      }
    });
    await check('final victory and a new expedition reset supplies', async () => {
      await click('welcome-new'); await evaluate('__smoke.mine(99); __smoke.gear(); __smoke.credit(6000); __smoke.expire()');
      await waitFor("__smoke.state().phase === 'won'");
      assert.ok(await evaluate("document.getElementById('restart').textContent.length > 0"));
      await screenshot('victory'); await click('restart'); const s = await state();
      assert.equal(s.level, 0); assert.equal(s.bank, 0); assert.equal(s.haul, 0); assert.equal(s.caught, null);
      assert.equal(await evaluate("JSON.parse(render_game_to_text()).supplies.dynamite"), 0);
    });
    await check('local-art failure retains three procedural themes and working controls', async () => {
      await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
      await send('Network.setBlockedURLs',{urls:['*assets/aaa/*']});
      await send('Page.reload'); await waitFor('Boolean(window.__smoke)'); await evaluate('SceneAssets.ready');
      assert.equal(await evaluate('Object.keys(SceneAssets.backgrounds).length + Object.keys(SceneAssets.sprites).length'),0);
      await click('welcome-new'); const samples=[];
      for(const theme of ['classic','sky','cavern']) {
        await click('settings'); await click('art-'+theme); await click('settings-close');
        assert.equal(await evaluate('document.documentElement.dataset.art'),theme);
        samples.push(JSON.stringify(await evaluate('__smoke.backgroundPixels()')));
      }
      assert.equal(new Set(samples).size,3,'Each procedural fallback must remain distinct');
      for (const a of [0,Math.PI/3,-Math.PI/3]) {
        const { cable, eye, grip, handle } = await evaluate(`__smoke.rig(${a},180,'back')`);
        assert.deepEqual(cable.from,{x:550,y:132});
        assert.ok(grip.x > 500 && grip.y > 80, 'The shorter fallback operator must hold the crank forward of its face, not beside its helmet');
        assert.ok(Math.hypot(cable.to.x-eye.x,cable.to.y-eye.y)<.001);
        assert.ok(Math.hypot(grip.x-handle.x,grip.y-handle.y)<.001);
      }
      await waitFor("__smoke.state().phase==='playing'"); await key('ArrowDown','ArrowDown');
      assert.equal((await state()).hookState,'out'); await screenshot('art-failure-fallback');
      await send('Network.setBlockedURLs',{urls:[]}); await send('Network.setCacheDisabled',{cacheDisabled:false});
    });
    await check('no runtime/storage errors', async () => assert.deepEqual(errors, []));
    console.log(`\n${failures ? failures + ' smoke checks failed' : 'All smoke checks passed'}.`); process.exitCode = failures ? 1 : 0;
  } finally {
    clearTimeout(timeout); for (const task of pending.values()) clearTimeout(task.timer);
    // Don't let headless Chrome/keep-alive connections stall a finished check run.
    socket?.close(); child?.kill('SIGKILL'); child?.stderr.destroy();
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
