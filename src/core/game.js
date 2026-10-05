import { LEVELS, RULES, isGem, isGold } from "./levels.js";
import { makeMap } from "./map.js";
import { buySupplies, catchValue, settleMine, suppliesOf } from "./economy.js";
import { decodeSave, encodeSave } from "./save.js";

// One expedition owns all mutable rules. Seconds enter advance(); command clocks are ms.
export function createGame({ map = makeMap } = {}) {
  const {
    width: W,
    height: H,
    origin,
    blastRadius,
    reelPower,
    roundSeconds,
    restLength,
    emptyClawWeight,
    dropSpeed,
    swingRate,
    swingAmplitude,
    catchPadding,
    magnetReach,
    strengthBonus,
    objectAspect,
  } = RULES;
  // Every mutable rule field lives here; `state` is its read-only view.
  const s = {
    mapVersion: 3,
    level: 0,
    bank: 0,
    haul: 0,
    time: roundSeconds,
    phase: "ready",
    objects: [],
    angle: 0,
    swing: -0.8,
    length: restLength,
    hookState: "swing",
    caught: null,
    dynamite: 0,
    strength: false,
    book: false,
    sound: true,
    magnet: false,
    magnetArmed: false,
    revealUntil: 0,
    reelSpeed: 0,
    deadline: 0,
    goalMet: false,
    lastSecond: roundSeconds,
    hitStop: 0,
    reelClick: 0,
  };
  let events = [],
    clock = 0;
  const proxies = new WeakMap();
  const deny = () => {
    throw new TypeError("Game state is read-only");
  };
  function readonly(value) {
    if (!value || typeof value !== "object") return value;
    if (!proxies.has(value))
      proxies.set(
        value,
        new Proxy(value, {
          get: (target, key) => readonly(Reflect.get(target, key)),
          set: deny,
          deleteProperty: deny,
          defineProperty: deny,
          setPrototypeOf: deny,
          preventExtensions: deny,
          getOwnPropertyDescriptor(target, key) {
            const d = Reflect.getOwnPropertyDescriptor(target, key);
            if (d && "value" in d && d.configurable) d.value = readonly(d.value);
            return d;
          },
        }),
      );
    return proxies.get(value);
  }
  const state = {};
  for (const key of Object.keys(s))
    Object.defineProperty(state, key, { enumerable: true, get: () => readonly(s[key]) });
  Object.defineProperty(state, "supplies", {
    enumerable: true,
    get: () => Object.freeze(suppliesOf(s)),
  });
  Object.freeze(state);
  const board = (index, version) => structuredClone(map(index, version));
  s.objects = board(0, s.mapVersion);
  const emit = (type, data = {}) => events.push({ type, now: clock, ...structuredClone(data) });
  const progress = () => emit("progress", { save: encodeSave(state, clock) });
  function batch(now, work) {
    if (!Number.isFinite(now)) return [];
    clock = now;
    events = [];
    work();
    return events;
  }
  const hookPosition = () => ({
    x: origin.x + Math.sin(s.angle) * s.length,
    y: origin.y + Math.cos(s.angle) * s.length,
  });
  function movePigs(list, remaining) {
    for (const obj of list) {
      if (!obj.speed || obj.taken) continue;
      const left = 40 + obj.radius,
        span = W - 2 * left;
      const distance = (obj.startX - left + (roundSeconds - remaining) * obj.speed) % (2 * span);
      obj.x = left + (distance < span ? distance : 2 * span - distance);
      obj.direction = distance < span ? 1 : -1;
    }
  }
  function startLevel() {
    s.objects = board(s.level, s.mapVersion);
    s.haul = 0;
    s.time = roundSeconds;
    s.swing = -0.8;
    s.angle = 0;
    s.length = restLength;
    s.caught = null;
    s.hookState = "swing";
    s.magnetArmed = false;
    s.revealUntil = 0;
    s.reelSpeed = 0;
    s.reelClick = 0;
    s.phase = "playing";
    s.deadline = clock + roundSeconds * 1000;
    s.goalMet = s.bank >= LEVELS[s.level].target;
    s.lastSecond = roundSeconds;
    s.hitStop = 0;
    emit("level", { level: s.level, goal: LEVELS[s.level].target, goalMet: s.goalMet });
    progress();
  }
  function finishLevel() {
    if (s.phase !== "playing") return;
    ({
      phase: s.phase,
      bank: s.bank,
      haul: s.haul,
      time: s.time,
      strength: s.strength,
      book: s.book,
    } = settleMine({
      phase: s.phase,
      level: s.level,
      bank: s.bank,
      haul: s.haul,
      time: s.time,
      strength: s.strength,
      book: s.book,
    }));
    emit("result", {
      phase: s.phase,
      level: s.level,
      bank: s.bank,
      haul: s.haul,
      goal: LEVELS[s.level].target,
    });
    progress();
  }
  function checkGoal() {
    if (s.goalMet || s.bank + s.haul < LEVELS[s.level].target) return;
    s.goalMet = true;
    emit("goal", { level: s.level, target: LEVELS[s.level].target });
  }
  function detonate(barrel) {
    const pending = [barrel];
    barrel.taken = true;
    while (pending.length) {
      const source = pending.pop();
      emit("blast-source", { pos: { x: source.x, y: source.y }, radius: source.radius });
      for (const obj of s.objects) {
        if (obj.taken || Math.hypot(obj.x - source.x, obj.y - source.y) > blastRadius + obj.radius)
          continue;
        obj.taken = true;
        if (obj.type === "tnt") pending.push(obj);
      }
    }
    emit("blast", { pos: { x: barrel.x, y: barrel.y }, radius: barrel.radius, kind: "tnt" });
    s.caught = null;
    s.hookState = "back";
    s.hitStop = 0.1;
    progress();
  }
  function swingHook(dt) {
    s.swing += dt * swingRate;
    s.angle = Math.sin(s.swing) * swingAmplitude;
  }
  function extendHook(dt) {
    s.length += dropSpeed * dt;
    emit("travel", { distance: -dropSpeed * dt });
    const p = hookPosition();
    s.caught =
      s.objects.findLast(
        (o) =>
          !o.taken &&
          Math.hypot(o.x - p.x, (o.y - p.y) / objectAspect) <
            o.radius + catchPadding + (s.magnetArmed && isGold(o.type) ? magnetReach : 0),
      ) || null;
    if (s.caught?.type === "tnt") detonate(s.caught);
    else if (s.caught) {
      s.caught.taken = true;
      s.hookState = "back";
      const kind = s.caught.type === "rock" ? "stone" : "gold",
        gem = isGem(s.caught.type);
      emit("catch", {
        pos: p,
        radius: s.caught.radius,
        kind,
        gem,
        objectType: s.caught.type,
        weight: s.caught.weight,
      });
      if (s.caught.type === "large" || gem) s.hitStop = 0.07;
    } else if (p.x < 20 || p.x > W - 20 || p.y > H - 30) {
      s.hookState = "back";
      emit("wall", { pos: p });
    }
  }
  // Returns "finished" when the last object has been banked and the mine is over.
  function reelHook(dt) {
    const targetSpeed =
      (reelPower * (s.strength ? strengthBonus : 1)) /
      (s.caught ? s.caught.weight : emptyClawWeight);
    s.reelSpeed += (targetSpeed - s.reelSpeed) * (1 - Math.exp(-dt * (s.caught ? 4 : 12)));
    s.length -= s.reelSpeed * dt;
    emit("travel", { distance: s.reelSpeed * dt });
    s.reelClick += s.reelSpeed * dt;
    if (s.reelClick > 28) {
      s.reelClick = 0;
      emit("ratchet", { weight: s.caught ? s.caught.weight : emptyClawWeight });
    }
    if (s.length <= restLength) {
      s.length = restLength;
      s.hookState = "swing";
      s.magnetArmed = false;
      if (s.caught) {
        const value = catchValue(s.caught, s.book);
        s.haul += value;
        emit("reward", {
          value,
          radius: s.caught.radius,
          objectType: s.caught.type,
          gem: isGem(s.caught.type),
        });
        s.caught = null;
        checkGoal();
        progress();
      }
      if (s.objects.every((o) => o.taken)) {
        finishLevel();
        return "finished";
      }
    }
  }
  const HOOK_STEPS = { swing: swingHook, out: extendHook, back: reelHook };
  function update(dt, now) {
    if (s.phase !== "playing") return;
    s.time = Math.max(0, Math.min(roundSeconds, (s.deadline - now) / 1000));
    if (!s.time) {
      finishLevel();
      return;
    }
    const second = Math.ceil(s.time);
    if (second !== s.lastSecond) {
      s.lastSecond = second;
      if (second <= 10) emit("tick", { second });
    }
    movePigs(s.objects, s.time);
    if (HOOK_STEPS[s.hookState](dt) === "finished") return;
    // Ordered after impact/reward events: newly emitted debris gets this same substep.
    emit("step", { elapsed: dt });
  }
  function restore(save, now = 0) {
    if (!Number.isFinite(now)) return false;
    let decoded, next;
    try {
      decoded = decodeSave(save, map);
      if (!decoded) return false;
      next = board(decoded.level, decoded.mapVersion);
      movePigs(next, decoded.time);
      next.forEach((o) => {
        o.taken = decoded.taken.includes(o.id);
      });
    } catch {
      return false;
    }
    return batch(now, () => {
      ({
        mapVersion: s.mapVersion,
        level: s.level,
        bank: s.bank,
        haul: s.haul,
        time: s.time,
        phase: s.phase,
        angle: s.angle,
        swing: s.swing,
        length: s.length,
        hookState: s.hookState,
        dynamite: s.dynamite,
        strength: s.strength,
        book: s.book,
        sound: s.sound,
        magnet: s.magnet,
        magnetArmed: s.magnetArmed,
      } = decoded);
      s.objects = next;
      s.caught = decoded.caughtId === null ? null : s.objects[decoded.caughtId];
      s.goalMet = s.bank + s.haul >= LEVELS[s.level].target;
      s.lastSecond = Math.ceil(s.time);
      s.reelSpeed = 0;
      s.reelClick = 0;
      s.hitStop = 0;
      s.revealUntil = 0;
      s.deadline = 0;
      emit("restore", { level: s.level, phase: s.phase });
    });
  }
  return Object.freeze({
    state,
    restore,
    snapshot: (now = 0) => encodeSave(state, now),
    newExpedition: (now = 0) =>
      batch(now, () => {
        s.mapVersion = 3;
        s.level = 0;
        s.bank = 0;
        s.dynamite = 0;
        s.strength = false;
        s.book = false;
        s.magnet = false;
        startLevel();
      }),
    retry: (now = 0) =>
      batch(now, () => {
        if (s.phase === "lost") startLevel();
      }),
    nextMine: (now = 0) =>
      batch(now, () => {
        if (s.phase === "shop" && s.level < LEVELS.length - 1) {
          s.level++;
          startLevel();
        }
      }),
    drop: (now = 0) =>
      batch(now, () => {
        if (s.phase !== "playing" || s.hookState !== "swing") return;
        if (clock >= s.deadline) {
          finishLevel();
          return;
        }
        s.hookState = "out";
        s.reelSpeed = 0;
        if (s.magnetArmed) s.magnet = false;
        emit("drop");
        progress();
      }),
    blastCatch: (now = 0) =>
      batch(now, () => {
        if (s.phase !== "playing" || !s.caught || !s.dynamite) return;
        if (clock >= s.deadline) {
          finishLevel();
          return;
        }
        const pos = hookPosition(),
          radius = s.caught.radius;
        s.caught = null;
        s.dynamite--;
        emit("blast", { pos, radius, kind: "dynamite" });
        progress();
      }),
    toggleMagnet: (now = 0) =>
      batch(now, () => {
        if (s.phase !== "playing" || !s.magnet || s.hookState !== "swing") return;
        s.magnetArmed = !s.magnetArmed;
        emit("magnet", { armed: s.magnetArmed });
        progress();
      }),
    reveal: (now = 0) =>
      batch(now, () => {
        if (s.phase === "playing" && s.book) {
          s.revealUntil = clock + 6000;
          emit("reveal");
        }
      }),
    pause: (now = 0) =>
      batch(now, () => {
        if (s.phase !== "playing") return;
        s.time = Math.max(0, (s.deadline - clock) / 1000);
        if (!s.time) {
          finishLevel();
          return;
        }
        s.phase = "paused";
        emit("paused");
        progress();
      }),
    resume: (now = 0) =>
      batch(now, () => {
        if (s.phase === "paused") {
          s.phase = "playing";
          s.deadline = clock + s.time * 1000;
          emit("resumed");
          progress();
        }
      }),
    buy: (item, now = 0) =>
      batch(now, () => {
        const bought = buySupplies(
          { phase: s.phase, level: s.level, bank: s.bank, supplies: suppliesOf(s) },
          item,
        );
        if (!bought) return;
        s.bank = bought.bank;
        Object.assign(s, bought.supplies);
        emit("purchase", { item });
        progress();
      }),
    setSound: (enabled, now = 0) =>
      batch(now, () => {
        if (typeof enabled !== "boolean" || enabled === s.sound) return;
        s.sound = enabled;
        emit("sound", { enabled });
        progress();
      }),
    advance: (elapsed, now = 0) =>
      batch(now, () => {
        if (!Number.isFinite(elapsed) || elapsed < 0) return;
        elapsed = Math.min(elapsed, RULES.frameCap);
        if (s.phase === "playing" && clock >= s.deadline) finishLevel();
        if (s.hitStop > 0) s.hitStop -= elapsed;
        else {
          let remaining = elapsed;
          while (remaining > 0) {
            const step = Math.min(remaining, RULES.physicsStep);
            update(step, clock);
            remaining -= step;
          }
        }
      }),
  });
}
