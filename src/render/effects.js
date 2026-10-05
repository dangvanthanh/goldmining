import { VisualConstants, FEEL } from "../art/constants.js";
import { LEVELS, RULES, isGem } from "../core/levels.js";
import { hookPosition } from "./geometry.js";
import { money } from "../ui/format.js";
export function expression(state, fx, now) {
  const { phase, caught, time } = state;
  const { reactionUntil, reaction } = fx;
  if (phase === "lost") return "worried";
  if (phase === "won" || phase === "shop") return "happy";
  if (now < reactionUntil) return reaction;
  if (caught)
    return isGem(caught.type) ? "surprised" : caught.type === "rock" ? "worried" : "pulling";
  return time <= 10 && phase === "playing" ? "worried" : "normal";
}
export function createEffects({
  constants: visual = VisualConstants,
  calm,
  clock,
  random = Math.random,
  getState = () => ({ level: 0, bank: 0, haul: 0 }),
  onScore = () => {},
  onToast = () => {},
  onReward = () => {},
  shakeScale = 1,
} = {}) {
  const reward = visual.reward;
  let disposed = false;
  let particles = [],
    popups = [],
    shakeMag = 0,
    shakeTime = 0,
    crankAngle = 0,
    flash = null,
    banner = null,
    reaction = "normal",
    reactionUntil = 0,
    pulseUntil = 0,
    entranceAt = 0,
    trailAt = 0,
    rings = [],
    trail = [],
    toastUntil = 0,
    shownScore = 0,
    scoreTarget = 0,
    scoreAnim = 0;
  function flashScreen(rgb, alpha) {
    flash = { rgb, a: alpha * (calm.matches ? 0.35 : 1) };
  }
  function showBanner(kicker, title, detail) {
    banner = { kicker, title, detail, start: clock.now() };
  }
  function burst(pos, kind = "stone") {
    const shiny = kind === "gold" || kind === "fire",
      count = Math.round(
        (kind === "fire" ? 46 : shiny ? 26 : 20) * (calm.matches ? FEEL.calmParticleRatio : 1),
      );
    for (let i = 0; i < count && particles.length < FEEL.maxParticles; i++) {
      const direction = random() * Math.PI * 2,
        speed = (shiny ? 70 : 90) + random() * (shiny ? 190 : 230);
      const life = (shiny ? 0.85 : 1.15) * (0.55 + random() * 0.75);
      particles.push({
        x: pos.x,
        y: pos.y,
        vx: Math.cos(direction) * speed,
        vy: Math.sin(direction) * speed - (shiny ? 60 : 0),
        life,
        max: life,
        kind,
        rot: random() * 6.283,
        spin: (random() - 0.5) * 12,
        size: shiny ? 2 + random() * 2.6 : 2.6 + random() * 4.4,
      });
    }
    if (kind === "fire")
      for (let i = 0; i < 12; i++)
        burst({ x: pos.x + random() * 30 - 15, y: pos.y + random() * 30 - 15 }, "gold");
  }
  function shake(amount) {
    if (calm.matches) return;
    const scaled = amount * shakeScale;
    if (scaled < 1) return;
    shakeMag = Math.max(shakeMag, scaled);
    shakeTime = 0.4;
    globalThis.navigator?.vibrate?.(Math.min(40, Math.round(scaled * 0.4)));
  }
  function notify(text) {
    onToast(text);
    toastUntil = clock.now() + 2500;
  }
  function rollScore(target, immediate = false) {
    if (disposed) return;
    if (target === scoreTarget && !immediate) return;
    scoreTarget = target;
    clock.cancelFrame(scoreAnim);
    if (immediate || calm.matches) {
      shownScore = target;
      onScore(target);
      return;
    }
    const from = shownScore,
      start = clock.now();
    const step = (now) => {
      if (disposed) return;
      const t = Math.max(0, Math.min(1, (now - start) / FEEL.scoreMs));
      shownScore = t < 1 ? Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3))) : target;
      onScore(shownScore);
      if (t < 1) scoreAnim = clock.requestFrame(step);
    };
    scoreAnim = clock.requestFrame(step);
  }
  function react(kind, detail, now) {
    reaction =
      kind === "reward"
        ? "happy"
        : kind === "blast"
          ? "surprised"
          : detail.gem
            ? "surprised"
            : detail.kind === "stone"
              ? "worried"
              : "pulling";
    reactionUntil = now + visual.expressionMs;
    if (kind === "reward") pulseUntil = now + visual.pulseMs;
    if (!calm.matches) {
      rings.push({
        x: detail.pos.x,
        y: detail.pos.y,
        radius: detail.radius,
        start: now,
        gem: detail.gem,
      });
      rings = rings.slice(-visual.maxRings);
    }
  }
  function clearResult() {
    banner = null;
    rings = [];
    trail = [];
  }
  function resetPresentation(now, entrance = false) {
    shakeMag = 0;
    shakeTime = 0;
    particles = [];
    popups = [];
    crankAngle = 0;
    flash = null;
    reactionUntil = 0;
    pulseUntil = 0;
    rings = [];
    trail = [];
    trailAt = 0;
    banner = null;
    if (entrance) entranceAt = now;
  }
  function effectsStep(dt) {
    if (shakeTime > 0) {
      shakeTime -= dt;
      if (shakeTime <= 0) {
        shakeTime = 0;
        shakeMag = 0;
      }
    }
    for (const p of particles) {
      const gravity = p.kind === "stone" ? 620 : 150;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += gravity * dt;
      p.vx *= 1 - 1.1 * dt;
      p.rot += p.spin * dt;
      p.life -= dt;
    }
    particles = particles.filter((p) => p.life > 0);
    popups.forEach((p) => {
      p.y -= 30 * dt;
      p.life -= dt;
    });
    popups = popups.filter((p) => p.life > 0);
  }
  const handlers = {
    level(e, now) {
      const { level, bank } = getState();
      resetPresentation(now, true);
      showBanner(
        `MINE ${String(level + 1).padStart(2, "0")} OF ${LEVELS.length}`,
        LEVELS[level].name,
        `Target ${money(e.goal)} · ${e.goalMet ? "your surplus already covers it" : `${RULES.roundSeconds} seconds on the clock`}`,
      );
      rollScore(bank, true);
    },
    restore: (_e, now) => resetPresentation(now),
    result: () => clearResult(),
    purchase: () => clearResult(),
    travel(e) {
      crankAngle += e.distance * 0.045;
    },
    step: (e) => effectsStep(e.elapsed),
    catch(e, now) {
      react("catch", e, now);
      burst(e.pos, e.kind);
      shake(e.objectType === "large" || e.objectType === "diamondPig" ? 7 : 3);
      if (e.objectType === "diamond" || e.objectType === "diamondPig")
        flashScreen("200,255,250", 0.16);
    },
    wall: (e) => burst(e.pos),
    "blast-source"(e) {
      burst(e.pos, "fire");
      shake(20);
    },
    blast(e, now) {
      if (e.kind === "dynamite") {
        burst(e.pos, "fire");
        shake(12);
      }
      react("blast", e, now);
      flashScreen("255,190,110", e.kind === "tnt" ? 0.55 : 0.3);
    },
    reward(e, now) {
      react("reward", { ...e, pos: reward.anchor }, now);
      if (!calm.matches) onReward();
      if (e.value >= reward.hugeValue) flashScreen("255,214,120", 0.14);
      popups.push({
        text: "+" + money(e.value),
        x: reward.popup.x,
        y: reward.popup.y,
        life: 1.6,
      });
      burst(reward.winch, e.value >= reward.bigValue ? "fire" : "gold");
      shake(e.value >= reward.hugeValue ? 16 : e.value >= reward.bigValue ? 11 : 5);
    },
    goal() {
      showBanner("TARGET MET", "Strike it rich!", "Every extra dollar carries to the next mine");
      burst(reward.anchor, "fire");
    },
  };
  function consume(e) {
    if (disposed) return;
    handlers[e.type]?.(e, e.now ?? clock.now());
  }
  const state = Object.freeze({
    get particles() {
      return particles;
    },
    get popups() {
      return popups;
    },
    get shakeMag() {
      return shakeMag;
    },
    get shakeTime() {
      return shakeTime;
    },
    get crankAngle() {
      return crankAngle;
    },
    get flash() {
      return flash;
    },
    get banner() {
      return banner;
    },
    get reaction() {
      return reaction;
    },
    get reactionUntil() {
      return reactionUntil;
    },
    get pulseUntil() {
      return pulseUntil;
    },
    get entranceAt() {
      return entranceAt;
    },
    get trailAt() {
      return trailAt;
    },
    get rings() {
      return rings;
    },
    get trail() {
      return trail;
    },
    get toastUntil() {
      return toastUntil;
    },
    get shownScore() {
      return shownScore;
    },
  });
  return {
    state,
    consume,
    rollScore,
    notify,
    shake,
    burst,
    setShake(value) {
      shakeScale = value;
    },
    beginFrame(elapsed) {
      if (!disposed && flash && (flash.a -= elapsed * 2.4) <= 0) flash = null;
    },
    finishFrame(state, now) {
      if (disposed) return;
      const { phase, hookState } = state,
        p = hookPosition(state);
      if (banner && (now - banner.start) / 1000 > 1.9 + 0.5) banner = null;
      if (calm.matches) {
        rings = [];
        trail = [];
        return;
      }
      rings = rings.filter((ring) => now - ring.start < visual.ringMs);
      trail = trail.filter((point) => now - point.start < visual.trailMs);
      if (phase === "playing" && hookState !== "swing" && now - trailAt >= visual.trailIntervalMs) {
        trailAt = now;
        trail.push({ x: p.x, y: p.y, start: now });
        trail = trail.slice(-visual.maxTrail);
      }
    },
    clearMotion() {
      shakeMag = 0;
      shakeTime = 0;
      flash = null;
      rings = [];
      trail = [];
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      clock.cancelFrame(scoreAnim);
      particles = [];
      popups = [];
      rings = [];
      trail = [];
    },
  };
}
