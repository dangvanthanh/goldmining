import { byId } from "./ui/dom.js";
import { createGame } from "./core/game.js";
import { RULES } from "./core/levels.js";
import { VisualConstants } from "./art/constants.js";
import { createSceneAssets } from "./art/scene-assets.js";
import { createProspectorArt } from "./art/prospector.js";
import { createClassicArt } from "./art/classic.js";
import { createSkyArt } from "./art/sky.js";
import { createCavernArt } from "./art/cavern.js";
import { createRenderer } from "./render/renderer.js";
import { createEffects } from "./render/effects.js";
import { createAudio } from "./audio/index.js";
import { createHud } from "./ui/hud.js";
import { createDialogs } from "./ui/dialogs.js";
import { createSettings } from "./ui/settings.js";
import { createInput } from "./ui/input.js";
import { createStorage } from "./platform/storage.js";
import { createPreferences } from "./platform/preferences.js";
import { createWelcome } from "./ui/welcome.js";
import { noticeFor } from "./ui/notices.js";
import { inspect as inspectGame } from "./inspect.js";

const PAYLOAD_COMMANDS = new Set(["buy", "restore", "setSound", "advance"]);
const COMMANDS = new Set([
  ...PAYLOAD_COMMANDS,
  "newExpedition",
  "retry",
  "nextMine",
  "drop",
  "blastCatch",
  "toggleMagnet",
  "reveal",
  "pause",
  "resume",
]);

export function createApp({
  document = globalThis.document,
  map,
  storage: suppliedStorage,
  preferences: suppliedPreferences,
  createAudioContext,
  clock: suppliedClock = {},
} = {}) {
  const clock = {
    now: () => performance.now(),
    requestFrame: (fn) => requestAnimationFrame(fn),
    cancelFrame: (id) => cancelAnimationFrame(id),
    ...suppliedClock,
  };
  const game = createGame(map ? { map } : {}),
    getState = () => game.state,
    preferences = suppliedPreferences ?? createPreferences();
  const $ = byId(document),
    canvas = $("mine"),
    calm = matchMedia("(prefers-reduced-motion: reduce)"),
    abort = new AbortController(),
    animations = new Set();
  let disposed = false,
    ending,
    frameId = 0,
    lastFrame = clock.now(),
    lastSave = 0,
    hud,
    renderer,
    dialogs,
    settings;
  const assets = createSceneAssets({ constants: VisualConstants });
  const prospector = createProspectorArt({ constants: VisualConstants, assets });
  const providers = {
    classic: createClassicArt({ constants: VisualConstants, assets }),
    sky: createSkyArt({ constants: VisualConstants, assets }),
    cavern: createCavernArt({ constants: VisualConstants, assets }),
  };
  const effects = createEffects({
    constants: VisualConstants,
    calm,
    clock,
    getState,
    shakeScale: preferences.shake(),
    onScore: (value) => hud?.score(value),
    onToast: (text) => hud?.toast(text),
    onReward: animateHaul,
  });
  const audio = createAudio({
    createContext: createAudioContext,
    enabled: () => game.state.sound,
    music: preferences.music(),
    onSoundFailure: () => command("setSound", false),
    onMusicFailure: () => {
      if (!disposed) settings?.refresh();
    },
  });
  const storage =
    suppliedStorage ??
    createStorage({
      onError: (error) => {
        if (!disposed) {
          console.warn("Gold Mining save unavailable:", error);
          effects.notify("Progress could not be saved. Keep this tab open.");
        }
      },
    });
  hud = createHud({ document, getState, effects });
  renderer = createRenderer({
    canvas,
    assets,
    prospector,
    providers,
    constants: VisualConstants,
    calm,
    clock,
    getState,
    getEffects: () => effects.state,
    initialArt: preferences.art(),
  });
  dialogs = createDialogs({
    document,
    canvas,
    constants: VisualConstants,
    calm,
    clock,
    getState,
    effects,
    prospector,
    getArt: () => renderer.artName,
    command,
  });
  settings = createSettings({
    document,
    getState,
    command,
    dialogs,
    effects,
    audio,
    hud,
    preferences,
  });
  const input = createInput({
    document,
    canvas,
    getState,
    command,
    dialogs,
    settings,
    effects,
    audio,
    renderer,
    calm,
    setArt,
  });
  const root = document.documentElement;
  for (const [name, value] of Object.entries({
    "--visual-portrait-height": VisualConstants.portraitUiHeightPx + "px",
    "--visual-entry-ms": VisualConstants.entranceMs + "ms",
    "--visual-pulse-ms": VisualConstants.pulseMs + "ms",
    "--classic-paper": VisualConstants.classic.uiPaper,
    "--classic-line": VisualConstants.classic.uiLine,
    "--classic-soil": VisualConstants.classic.soil[0],
  }))
    root.style.setProperty(name, value);
  root.dataset.art = renderer.artName;
  function animateHaul() {
    const a = $("haul").animate([{ transform: "scale(1.2)" }, { transform: "scale(1)" }], {
      duration: 380,
      easing: "cubic-bezier(.2,.9,.3,1.4)",
    });
    animations.add(a);
    a.finished.then(
      () => animations.delete(a),
      () => animations.delete(a),
    );
  }
  function setArt(name) {
    if (disposed || !renderer.setArt(name)) return false;
    preferences.setArt(name);
    for (const radio of document.querySelectorAll("input[name=art]"))
      radio.checked = radio.value === name;
    return true;
  }
  function save(snapshot = game.snapshot(clock.now()), now = clock.now()) {
    if (!snapshot || disposed) return;
    lastSave = now;
    return storage.save(snapshot);
  }
  const pending = [];
  let routing = false;
  // Reactions owned by the app shell; effects, audio and notices handle the rest of each event.
  const handlers = {
    level() {
      renderer.paintBackground();
      dialogs.hide();
      if (audio.state.enabled) audio.resumeMusic();
    },
    restore(e) {
      renderer.paintBackground();
      dialogs.showFor(e.phase);
      settings.refresh();
    },
    result: (e) => dialogs.showFor(e.phase),
    purchase: () => dialogs.shop(),
    paused(_e, quiet) {
      if (!quiet) dialogs.pause();
    },
    resumed() {
      dialogs.hide();
      if (audio.state.enabled) audio.resumeMusic();
    },
    sound: () => settings.refresh(),
    progress: (e) => save(e.save, e.now),
  };
  function route(events, quiet = false) {
    pending.push(...events.map((event) => ({ event, quiet })));
    if (routing) return;
    routing = true;
    try {
      while (pending.length) {
        const { event: e, quiet } = pending.shift();
        effects.consume(e);
        audio.handle(e);
        const notice = noticeFor(e);
        if (notice) effects.notify(notice);
        handlers[e.type]?.(e, quiet);
      }
    } finally {
      routing = false;
    }
  }
  function command(name, payload, now = clock.now()) {
    if (disposed) return name === "restore" ? false : [];
    if (name === "save") return save();
    if (!COMMANDS.has(name)) return [];
    const events = PAYLOAD_COMMANDS.has(name) ? game[name](payload, now) : game[name](now);
    if (events === false) return false;
    route(events, Boolean(payload?.quiet));
    if (
      (name === "advance" && game.state.phase === "playing") ||
      events.some((e) => !["travel", "step"].includes(e.type))
    )
      hud.render();
    return events;
  }
  function frame(now) {
    if (disposed) return;
    const elapsed = Math.min((now - lastFrame) / 1000 || 0, RULES.frameCap);
    lastFrame = now;
    effects.beginFrame(elapsed);
    command("advance", elapsed, now);
    if (game.state.phase === "playing" && now - lastSave >= 1000) save();
    effects.finishFrame(game.state, now);
    renderer.draw(game.state, effects.state, now);
    hud.draw(now);
    frameId = clock.requestFrame(frame);
  }
  const inspect = () => inspectGame({ game, renderer, dialogs, effects, canvas }),
    previousInspector = window.render_game_to_text,
    inspector = () => JSON.stringify(inspect());
  createWelcome({
    document,
    storage,
    command,
    dialogs,
    effects,
    settings,
    signal: abort.signal,
    isDisposed: () => disposed,
  });
  window.render_game_to_text = inspector;
  effects.rollScore(0, true);
  hud.render();
  dialogs.welcome();
  frameId = clock.requestFrame(frame);
  return Object.freeze({
    game,
    command,
    assets,
    providers,
    constants: VisualConstants,
    clock,
    renderer,
    effects,
    audio,
    dialogs,
    settings,
    storage,
    inspect,
    setArt,
    get art() {
      return renderer.artName;
    },
    destroy() {
      if (!ending) {
        disposed = true;
        abort.abort();
        for (const a of animations) a.cancel();
        animations.clear();
        if (window.render_game_to_text === inspector) {
          if (previousInspector === undefined) delete window.render_game_to_text;
          else window.render_game_to_text = previousInspector;
        }
        clock.cancelFrame(frameId);
        input.destroy();
        settings.destroy();
        dialogs.destroy();
        renderer.destroy();
        effects.destroy();
        assets.destroy();
        ending = Promise.all([audio.destroy(), storage.destroy()]);
      }
      return ending;
    },
  });
}
export const app = createApp();
