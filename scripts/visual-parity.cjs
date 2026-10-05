"use strict";
const { withBrowser } = require("./browser.cjs");
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require("node:fs");
const { join } = require("node:path");
const assert = require("node:assert/strict");
const base = join(process.cwd(), ".dream-loop/architecture/baseline/visual");
const pixelHash = async (browser, png) =>
  browser.evaluate(
    `(async()=>{const blob=await(await fetch('data:image/png;base64,${png.toString("base64")}')).blob();const image=await createImageBitmap(blob);const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const bytes=ctx.getImageData(0,0,c.width,c.height).data;return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');})()`,
  );
async function run(record) {
  if (!record && !existsSync(join(base, "manifest.json")))
    throw Error(
      "Visual baseline missing: archived migration captures are local. Use --record only for a deliberate new baseline.",
    );
  if (record && existsSync(join(base, "manifest.json")) && !process.argv.includes("--replace"))
    throw Error(
      "Visual baseline already exists. Review the intended change before --record --replace.",
    );
  const hashes = {};
  await withBrowser(
    {
      reducedMotion: true,
      initScript: `const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(()=>fn(0));Object.defineProperty(performance,'now',{value:()=>0});`,
    },
    async (b) => {
      await b.send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      });
      await b.waitFor("import('/src/main.js').then(m=>Boolean(m.app))");
      await b.evaluate("import('/src/main.js').then(m=>m.app.assets.ready)");
      for (const fallback of [false, true]) {
        if (fallback) {
          await b.send("Network.enable");
          await b.send("Network.setCacheDisabled", { cacheDisabled: true });
          await b.send("Network.setBlockedURLs", { urls: ["*assets/aaa/*"] });
          await b.send("Page.reload");
          await b.waitFor("import('/src/main.js').then(m=>Boolean(m.app))");
          await b.evaluate("import('/src/main.js').then(m=>m.app.assets.ready)");
        }
        for (const [width, height, level, tag] of [
          [1100, 580, 0, ""],
          [393, 851, 0, ""],
          [844, 390, 0, ""],
          [1100, 580, 11, "-hazards"],
        ])
          for (const theme of ["classic", "sky", "cavern"]) {
            await b.send("Emulation.setDeviceMetricsOverride", {
              width,
              height,
              deviceScaleFactor: 1,
              mobile: false,
            });
            await b.delay(500);
            await b.evaluate(
              `(async()=>{const {app}=await import('/src/main.js');app.setArt(${JSON.stringify(theme)});app.command('newExpedition',undefined,0);const s=app.game.snapshot(0);Object.assign(s,{level:${level},mapVersion:3,bank:0,haul:0,time:60,phase:'paused',angle:0,swing:-.8,length:23,hookState:'swing',caughtId:null,taken:[],dynamite:0,strength:false,book:false,magnet:false,magnetArmed:false});app.command('restore',s,0);document.getElementById('welcome-overlay').hidden=true;app.dialogs.hide();app.renderer.resize();app.renderer.draw(app.game.state,app.effects.state,0);})()`,
            );
            await b.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 0, y: 0 });
            await b.delay(40);
            const name = `${fallback ? "fallback" : "authored"}-${theme}${tag}-${width}x${height}`;
            const a = await b.capture(),
              hash = await pixelHash(b, a),
              again = await pixelHash(b, await b.capture());
            assert.equal(hash, again, "Unstable capture " + name);
            hashes[name] = hash;
            if (record) {
              mkdirSync(base, { recursive: true });
              writeFileSync(join(base, name + ".png"), a);
            } else {
              const ref = readFileSync(join(base, name + ".png"));
              assert.equal(hash, await pixelHash(b, ref), "Pixel mismatch " + name);
            }
            console.log("PASS visual", name);
          }
      }
      assert.deepEqual(b.errors, []);
    },
  );
  if (record)
    writeFileSync(
      join(base, "manifest.json"),
      JSON.stringify({ dpr: 1, reducedMotion: true, clock: 0, hashes }, null, 2) + "\n",
    );
}
if (require.main === module)
  run(process.argv.includes("--record")).catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
module.exports = { run };
