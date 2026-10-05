import { RULES } from "../core/levels.js";
import { FEEL } from "../art/constants.js";
import { expression as mood } from "./effects.js";
import { hookPosition as position } from "./geometry.js";
import { createShapes } from "./shapes.js";
import { createRig } from "./rig.js";
import { createObjectPainter } from "./objects.js";
import { catchValue as valueOf } from "../core/economy.js";
import { money } from "../ui/format.js";
export function createRenderer({
  canvas,
  assets,
  prospector,
  providers,
  constants: visual,
  calm,
  clock,
  getState,
  getEffects,
  initialArt = "classic",
}) {
  const ctx = canvas.getContext("2d"),
    { width: W, height: H, origin, objectAspect } = RULES;
  let disposed = false,
    artName = initialArt,
    art = providers[artName],
    fit = { sx: 1, sy: 1, ox: 0, oy: 0 },
    repaintTimer,
    resized = false,
    portraitBox = null,
    portraitKey = "";
  const PORTRAIT = matchMedia("(max-aspect-ratio: 3/4)"),
    cssScale = () => (fit.sx * canvas.clientWidth) / canvas.width,
    LAMP = { x: 612, y: 74 };
  const shapes = createShapes(ctx),
    { line, drawGlow, GLOW } = shapes,
    cone = document.createElement("canvas"),
    vignette = document.createElement("canvas"),
    background = document.createElement("canvas");
  cone.width = W;
  cone.height = H;
  vignette.width = W;
  vignette.height = H;
  background.width = W;
  background.height = H;
  (function paintVignette() {
    const c = vignette.getContext("2d");
    const g = c.createRadialGradient(LAMP.x, LAMP.y + 60, 90, LAMP.x, LAMP.y + 60, W * 0.88);
    g.addColorStop(0, "rgba(3,5,9,0)");
    g.addColorStop(0.45, "rgba(3,5,9,.16)");
    g.addColorStop(0.78, "rgba(2,4,7,.55)");
    g.addColorStop(1, "rgba(1,2,4,.96)");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    const floor = c.createLinearGradient(0, H * 0.58, 0, H);
    floor.addColorStop(0, "rgba(2,3,6,0)");
    floor.addColorStop(1, "rgba(1,2,4,.5)");
    c.fillStyle = floor;
    c.fillRect(0, H * 0.58, W, H * 0.42);
  })();
  // One record per draw: the state, effects and view the drawing helpers read.
  let frame;
  const view = () => ({ art, artName, cssScale, fit });
  function beginFrame(state, fx) {
    frame = { state, fx, view: view() };
  }
  const rig = createRig({
      ctx,
      assets,
      prospector,
      constants: visual,
      calm,
      clock,
      shapes,
      LAMP,
    }),
    ore = createObjectPainter({ ctx, assets, constants: visual, calm, clock, shapes });
  const hookPosition = () => position(frame.state),
    expression = (now) => mood(frame.state, frame.fx, now),
    catchValue = (obj) => valueOf(obj, frame.state.book);
  const drawRig = (now) => rig.draw(frame, now),
    drawChain = rig.chain,
    drawClaw = rig.claw,
    drawObject = (obj, x = obj.x, y = obj.y) => ore.draw(obj, frame.state, frame.view, x, y);
  function resize() {
    if (disposed) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    document.documentElement.style.setProperty(
      "--safe-top",
      Math.ceil(rect.height * visual.safeTopRatio) + "px",
    );
    // Cap the backing store near 4 MP so full-screen frames stay cheap.
    const dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(4e6 / (rect.width * rect.height)));
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    // Keep targets clear of controls: the plaque sits above phones, beside wide fields.
    const plaque = document.querySelector(".plaque").getBoundingClientRect(),
      gap = FEEL.viewportGapPx;
    const top = PORTRAIT.matches
      ? plaque.bottom - rect.top + gap
      : rect.height * visual.safeTopRatio;
    const left = 0;
    const bottom =
      rect.bottom -
      Math.min(
        document.querySelector(".hud-hint").getBoundingClientRect().top,
        document.querySelector(".action-bar").getBoundingClientRect().top,
      ) +
      gap;
    const width = Math.max(1, rect.width - left),
      height = Math.max(1, rect.height - top - bottom);
    const scale = Math.min((width * dpr) / W, (height * dpr) / H);
    fit = {
      sx: scale,
      sy: scale,
      ox: (width * dpr - W * scale) / 2,
      oy: top * dpr + (height * dpr - H * scale) / 2,
    };
    // The real operator belongs on the gantry, never duplicated over the scenery.
    portraitBox = null;
    art.paintLight(cone, lampSpot());
    clearTimeout(repaintTimer);
    repaintTimer = setTimeout(() => paintBackground(frame.state.level), resized ? 150 : 0);
    resized = true;
  }
  function lampSpot() {
    return { x: LAMP.x, y: origin.y + (LAMP.y - origin.y) * objectAspect };
  }
  function paintBackground(seed = 0) {
    if (disposed) return;
    background.width = canvas.width;
    background.height = canvas.height;
    background.getContext("2d").setTransform(fit.sx, 0, 0, fit.sy, fit.ox, fit.oy);
    art.paintBackground(
      background,
      seed,
      {
        left: -fit.ox / fit.sx,
        right: (canvas.width - fit.ox) / fit.sx,
        top: -fit.oy / fit.sy,
        bottom: (canvas.height - fit.oy) / fit.sy,
        aspect: objectAspect,
      },
      lampSpot(),
    );
  }
  function drawParticles() {
    for (const p of frame.fx.particles) {
      const fade = Math.max(0, p.life / p.max);
      if (p.kind === "stone") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = fade * 0.95;
        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size * 0.4);
        ctx.lineTo(0, -p.size);
        ctx.lineTo(p.size, -p.size * 0.2);
        ctx.lineTo(p.size * 0.5, p.size);
        ctx.lineTo(-p.size * 0.7, p.size * 0.6);
        ctx.closePath();
        ctx.fillStyle = "#5a564c";
        ctx.fill();
        ctx.fillStyle = "rgba(206,190,152,.4)";
        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size * 0.4);
        ctx.lineTo(0, -p.size);
        ctx.lineTo(p.size * 0.2, -p.size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        const s =
          Math.max(p.size, calm.matches ? 0 : visual.minParticlePx / cssScale()) *
          (1 + (1 - fade) * 2.6);
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = fade * 0.85;
        ctx.drawImage(GLOW, p.x - s * 2.4, p.y - s * 2.4, s * 4.8, s * 4.8);
        ctx.globalAlpha = fade;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = "#ffe9a8";
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.8);
        ctx.lineTo(s * 0.42, 0);
        ctx.lineTo(0, s * 0.8);
        ctx.lineTo(-s * 0.42, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  function labelMetrics() {
    return { valueFont: FEEL.valueFontPx / cssScale(), labelGap: FEEL.labelGapPx / cssScale() };
  }
  // Soft cone of lantern light over the scene (additive).
  function drawCone(alpha) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha;
    ctx.drawImage(cone, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  // Dust motes drifting through the beam.
  function drawDust(now, litScene) {
    const ambientNow = calm.matches ? 0 : now;
    for (let i = 0; litScene && i < 64; i++) {
      const t = ambientNow * 0.00004 + i * 0.137;
      const dx = LAMP.x + Math.sin(i * 2.7 + ambientNow * 0.0004) * (60 + i * 9);
      const dy = LAMP.y + ((t * 900 + i * 63) % (H + 60));
      const near = 1 - Math.min(1, Math.abs(dx - LAMP.x) / 620);
      ctx.globalAlpha = 0.055 + near * 0.24 * (0.6 + Math.sin(ambientNow * 0.002 + i) * 0.4);
      ctx.fillStyle = "#ffdca4";
      const size = 0.45 + (i % 3) * 0.4;
      ctx.fillRect(dx, dy, size, size);
    }
    ctx.globalAlpha = 1;
  }
  // Contact shadow: the catwalk edge swallows the first few pixels of rock.
  function drawContactShadow() {
    const lip = ctx.createLinearGradient(0, 145, 0, 192);
    lip.addColorStop(0, "rgba(0,0,0,.6)");
    lip.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = lip;
    ctx.fillRect(396, 145, 404, 47);
  }
  // Treasure with buried-object shadows and glow; returns the price labels to place.
  function drawObjects(now, litScene) {
    const valueLabels = [],
      { valueFont, labelGap } = labelMetrics();
    for (const o of frame.state.objects) {
      if (o.taken) continue;
      // Buried objects occlude soil; airborne Sky treasure casts no ground shadow.
      if (artName !== "sky") {
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.scale(1, objectAspect);
        const ao = ctx.createRadialGradient(0, 0, o.radius * 0.9, 0, 0, o.radius * 2.1);
        ao.addColorStop(0, "rgba(0,0,0,.3)");
        ao.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = ao;
        ctx.fillRect(-o.radius * 2.1, -o.radius * 2.1, o.radius * 4.2, o.radius * 4.2);
        ctx.restore();
      }
      if (o.type === "rock") ctx.globalAlpha = 0.92;
      if (litScene && o.type !== "rock" && o.type !== "tnt" && !o.speed)
        drawGlow(o.x, o.y, o.radius, now, {
          spread: o.type === "diamond" || o.type === "gem" ? 3.4 : 3.7,
          base: o.type === "large" ? 0.24 : 0.2,
          aspect: objectAspect,
        });
      drawObject(o);
      ctx.globalAlpha = 1;
      if (now < frame.state.revealUntil && o.value > 0) {
        const text = money(catchValue(o));
        ctx.save();
        ctx.font = `600 ${valueFont}px Arial, sans-serif`;
        const label = {
          text,
          x: o.x,
          y: o.y - o.radius - 10,
          anchorY: o.y - o.radius,
          width: ctx.measureText(text).width + labelGap * 2,
        };
        ctx.restore();
        const height = valueFont + labelGap * 2;
        // ponytail: O(n²) packing for a few dozen labels; spatial bins if maps grow much denser.
        while (
          valueLabels.some(
            (other) =>
              Math.abs(other.x - label.x) < (other.width + label.width) / 2 &&
              Math.abs(other.y - label.y) < height,
          )
        )
          label.y -= height;
        valueLabels.push(label);
      }
    }
    return valueLabels;
  }
  // Labels sit above all sprites; shifted prices retain a leader to their treasure.
  function drawValueLabels(valueLabels) {
    const { valueFont, labelGap } = labelMetrics();
    ctx.save();
    ctx.font = `600 ${valueFont}px Arial, sans-serif`;
    ctx.textAlign = "center";
    for (const label of valueLabels) {
      if (label.y < label.anchorY - 10)
        line(
          [
            [label.x, label.anchorY],
            [label.x, label.y + labelGap],
          ],
          "#f1ce7e",
          1 / cssScale(),
        );
    }
    for (const label of valueLabels) {
      ctx.lineWidth = 4 / cssScale();
      ctx.strokeStyle = "#080c0e";
      ctx.strokeText(label.text, label.x, label.y);
      ctx.fillStyle = "#f1ce7e";
      ctx.fillText(label.text, label.x, label.y);
    }
    ctx.restore();
  }
  // Hook cable, the catch and the claw.
  function drawHook(now) {
    const p = hookPosition();
    const reel =
      frame.state.hookState === "back" && frame.state.caught
        ? Math.min(1, frame.state.caught.weight / 4)
        : 0;
    const eyeTop = visual.rig.eyeY - visual.rig.eyeRadius;
    drawChain(
      origin,
      {
        x: p.x + Math.sin(frame.state.angle) * eyeTop,
        y: p.y + Math.cos(frame.state.angle) * eyeTop * objectAspect,
      },
      frame.state.hookState === "back" ? 0.6 + reel * 1.6 : 3,
      calm.matches ? 0 : now,
    );
    if (frame.state.caught)
      drawObject(frame.state.caught, p.x, p.y + frame.state.caught.radius * 0.95 * objectAspect);
    drawClaw(p, now); // the claw grips from above, so it draws over the catch
    drawSpectacle(now);
  }
  function drawPopups() {
    for (const pop of frame.fx.popups) {
      const grow = Math.min(1, (1.6 - pop.life) * 6),
        alpha = Math.min(1, pop.life);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(pop.x, pop.y);
      ctx.scale(0.6 + grow * 0.4, (0.6 + grow * 0.4) * objectAspect);
      ctx.font = `700 ${Math.max(32, visual.rewardFontPx / cssScale())}px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(GLOW, -70, -55, 140, 110);
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(12,9,4,.9)";
      ctx.strokeText(pop.text, 0, 0);
      const grad = ctx.createLinearGradient(0, -22, 0, 8);
      grad.addColorStop(0, "#fff6d2");
      grad.addColorStop(0.5, "#ffd05e");
      grad.addColorStop(1, "#e79a24");
      ctx.fillStyle = grad;
      ctx.fillText(pop.text, 0, 0);
      ctx.restore();
    }
  }
  function draw(now) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(fit.sx, 0, 0, fit.sy, fit.ox, fit.oy);
    const screen = [
      -fit.ox / fit.sx,
      -fit.oy / fit.sy,
      canvas.width / fit.sx,
      canvas.height / fit.sy,
    ]; // the whole canvas, in field units
    ctx.save();
    const amp = frame.fx.shakeMag * (frame.fx.shakeTime / 0.4);
    if (amp > 0.08) ctx.translate(Math.sin(now * 0.09) * amp, Math.cos(now * 0.13) * amp * 0.7);
    ctx.drawImage(background, ...screen);
    art.drawAmbient?.(ctx, calm.matches ? 0 : now, {
      aspect: objectAspect,
      scale: cssScale(),
      view: {
        left: screen[0],
        top: screen[1],
        right: screen[0] + screen[2],
        bottom: screen[1] + screen[3],
      },
      pulse: Math.max(0, (frame.fx.pulseUntil - now) / visual.pulseMs),
      entrance: calm.matches ? 0 : Math.max(0, 1 - (now - frame.fx.entranceAt) / visual.entranceMs),
    });
    // No ctx.filter here: a full-scene filter halved the frame rate.
    ctx.save();
    const litScene = art.lit !== false;
    ctx.save();
    ctx.translate(origin.x, origin.y);
    ctx.scale(1, objectAspect);
    ctx.translate(-origin.x, -origin.y);
    const flicker = drawRig(now);
    ctx.restore();
    if (litScene) drawCone(0.7 * flicker); // light and haze before the treasure so gold sits inside the glow
    drawDust(now, litScene);
    if (litScene) drawContactShadow();
    drawValueLabels(drawObjects(now, litScene));
    drawHook(now);
    if (litScene) drawCone(0.16 * flicker); // a faint second pass warms the treasure
    ctx.restore(); // ends the scene layer
    drawParticles();
    drawPopups();
    if (litScene) {
      ctx.globalAlpha = assets?.backgrounds.cavern ? visual.authored.vignetteAlpha : 1;
      ctx.drawImage(vignette, ...screen);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (frame.fx.flash) {
      ctx.fillStyle = `rgba(${frame.fx.flash.rgb},${frame.fx.flash.a})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    drawProspector(now);
    if (frame.fx.banner) drawBanner(now);
  }
  function drawSpectacle(now) {
    const palette = visual.palettes[artName],
      scale = cssScale();
    if (calm.matches) return;
    ctx.save();
    ctx.lineCap = "round";
    for (let i = 1; i < frame.fx.trail.length; i++) {
      ctx.globalAlpha = visual.trailAlpha * (1 - (now - frame.fx.trail[i].start) / visual.trailMs);
      line(
        [
          [frame.fx.trail[i - 1].x, frame.fx.trail[i - 1].y],
          [frame.fx.trail[i].x, frame.fx.trail[i].y],
        ],
        palette.gold,
        visual.clawOutlinePx / scale,
      );
    }

    for (const ring of frame.fx.rings) {
      const t = (now - ring.start) / visual.ringMs;
      ctx.globalAlpha = (1 - t) * visual.ringAlpha;
      ctx.strokeStyle = ring.gem ? palette.gem : palette.gold;
      ctx.lineWidth = visual.clawOutlinePx / scale;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius * (1 + t), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawProspector(now) {
    const mood = expression(now),
      key = artName + ":" + mood;
    if (key !== portraitKey) {
      portraitKey = key;
      canvas.dataset.expression = mood;
      for (const portrait of document.querySelectorAll(".prospector-portrait"))
        prospector.paint(portrait, mood, artName);
    }
  }
  function drawBanner(now) {
    const t = (now - frame.fx.banner.start) / 1000,
      hold = 1.9;
    if (t > hold + 0.5) {
      return;
    }
    const enter = 1 - Math.pow(1 - Math.min(1, t / 0.4), 3),
      alpha = enter * (1 - Math.max(0, (t - hold) / 0.5));
    const cw = canvas.width,
      dpr = cw / canvas.clientWidth,
      size = Math.min(cw * FEEL.bannerWidthRatio, canvas.height * 0.085),
      cy = fit.oy + H * fit.sy * 0.42;
    const tint = art.bannerTint || "4,8,10",
      band = ctx.createLinearGradient(0, 0, cw, 0);
    band.addColorStop(0, `rgba(${tint},0)`);
    band.addColorStop(0.22, `rgba(${tint},.8)`);
    band.addColorStop(0.78, `rgba(${tint},.8)`);
    band.addColorStop(1, `rgba(${tint},0)`);
    const rule = ctx.createLinearGradient(0, 0, cw, 0);
    rule.addColorStop(0, "rgba(232,197,122,0)");
    rule.addColorStop(0.5, "rgba(232,197,122,.9)");
    rule.addColorStop(1, "rgba(232,197,122,0)");
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = band;
    ctx.fillRect(0, cy - size * 1.4, cw, size * 2.75);
    ctx.fillStyle = rule;
    const hair = Math.max(1, size * 0.03);
    ctx.fillRect(0, cy - size * 1.4, cw, hair);
    ctx.fillRect(0, cy + size * 1.35 - hair, cw, hair);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${Math.max(FEEL.bannerKickerPx * dpr, Math.round(size * 0.26))}px Arial, sans-serif`;
    ctx.letterSpacing = `${Math.round(size * 0.08)}px`;
    ctx.fillStyle = "#e8c57a";
    ctx.fillText(frame.fx.banner.kicker, cw / 2, cy - size * 0.88);
    ctx.letterSpacing = "0px";
    ctx.font = `500 ${Math.round(size)}px Georgia, serif`;
    const fitWidth = Math.min(1, (cw * 0.9) / ctx.measureText(frame.fx.banner.title).width),
      grow = calm.matches ? 1 : 1.12 - 0.12 * enter;
    ctx.save();
    ctx.translate(cw / 2, cy);
    ctx.scale(fitWidth * grow, fitWidth * grow);
    const ink = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.5);
    ink.addColorStop(0, "#fff3d5");
    ink.addColorStop(0.5, "#ead4a0");
    ink.addColorStop(1, "#c4a06a");
    ctx.shadowColor = "#090807cc";
    ctx.shadowBlur = 5 * dpr;
    ctx.shadowOffsetY = 2 * dpr;
    ctx.fillStyle = ink;
    ctx.fillText(frame.fx.banner.title, 0, 0);
    ctx.restore();
    ctx.font = `${Math.max(FEEL.valueFontPx * dpr, Math.round(size * 0.3))}px Arial, sans-serif`;
    ctx.fillStyle = "#f3e7cf";
    ctx.fillText(frame.fx.banner.detail, cw / 2, cy + size * 0.86, cw * 0.92);
    ctx.restore();
  }
  function setArt(name) {
    if (!Object.hasOwn(providers, name) || disposed) return false;
    artName = name;
    art = providers[name];
    document.documentElement.dataset.art = name;
    portraitKey = "";
    resize();
    clearTimeout(repaintTimer);
    paintBackground(getState().level);
    return true;
  }
  function paint() {
    beginFrame(getState(), getEffects());
    paintBackground(getState().level);
  }
  const abort = new AbortController(),
    observer = new ResizeObserver(resize);
  window.addEventListener("resize", resize, { signal: abort.signal });
  PORTRAIT.addEventListener("change", resize, { signal: abort.signal });
  observer.observe(canvas);
  beginFrame(getState(), getEffects());
  resize();
  art.paintLight(cone, LAMP);
  paintBackground(frame.state.level);
  assets.ready.then(() => {
    if (disposed) return;
    paint();
    portraitKey = "";
    drawProspector(clock.now());
  });
  return {
    canvas,
    ctx,
    background,
    resize,
    setArt,
    paintBackground: paint,
    geometry(state = getState(), fx = getEffects(), now = clock.now()) {
      return rig.geometry({ state, fx, view: view() }, now);
    },
    draw(state, fx, now) {
      if (disposed) return;
      beginFrame(state, fx);
      draw(now);
    },
    toField(event) {
      const rect = canvas.getBoundingClientRect(),
        dpr = canvas.width / rect.width;
      return {
        x: ((event.clientX - rect.left) * dpr - fit.ox) / fit.sx,
        y: ((event.clientY - rect.top) * dpr - fit.oy) / fit.sy,
      };
    },
    get fit() {
      return fit;
    },
    get artName() {
      return artName;
    },
    get portraitBox() {
      return portraitBox;
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      abort.abort();
      observer.disconnect();
      clearTimeout(repaintTimer);
    },
  };
}
