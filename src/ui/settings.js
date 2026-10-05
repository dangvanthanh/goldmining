import { byId } from "./dom.js";
export function createSettings({
  document = globalThis.document,
  getState,
  command,
  dialogs,
  effects,
  audio,
  hud,
  preferences,
}) {
  const $ = byId(document),
    abort = new AbortController();
  let settingsWasPlaying = false,
    settingsFocus = null,
    music = preferences.music(),
    shakeScale = preferences.shake();
  const syncModal = dialogs.sync,
    focusGame = dialogs.focus,
    renderPause = dialogs.pause,
    updateHUD = () => hud.render(),
    saveProgress = () => command("save"),
    sfx = audio.play,
    updateMusic = () => audio.setMusic(music);
  function on(target, type, handler, options = {}) {
    target.addEventListener(
      type,
      (event) => {
        if (abort.signal.aborted) return;
        handler(event);
      },
      { ...options, signal: abort.signal },
    );
  }

  function openSettings() {
    settingsFocus = document.activeElement;
    settingsWasPlaying = getState().phase === "playing";
    if (settingsWasPlaying) {
      command("pause", { quiet: true });
      if (getState().phase !== "paused") settingsWasPlaying = false;
    }
    $("settings-overlay").hidden = false;
    syncModal();
    $("settings-close").focus();
  }
  function closeSettings() {
    $("settings-overlay").hidden = true;
    const { phase } = getState();
    if (settingsWasPlaying && phase === "paused" && !document.hidden) command("resume");
    else if (phase === "paused" && $("overlay").hidden) renderPause();
    settingsWasPlaying = false;
    updateHUD();
    saveProgress();
    syncModal();
    if (settingsFocus?.isConnected && !settingsFocus.closest("[inert]") && !settingsFocus.disabled)
      settingsFocus.focus({ preventScroll: true });
    else focusGame();
  }
  $("settings-overlay").hidden = true;
  on($("settings"), "click", openSettings);
  on($("settings-close"), "click", closeSettings);
  on($("settings-overlay"), "pointerdown", (event) => {
    if (event.target === $("settings-overlay")) closeSettings();
  });
  on($("sound-toggle"), "change", () => {
    command("setSound", $("sound-toggle").checked);
    sfx("ui");
    saveProgress();
  });
  on($("music-toggle"), "change", () => {
    music = $("music-toggle").checked;
    try {
      preferences.setMusic(music);
    } catch {}
    updateMusic();
  });
  on($("shake-range"), "input", () => {
    shakeScale = $("shake-range").value / 100;
    try {
      preferences.setShake(shakeScale);
      effects.setShake(shakeScale);
    } catch {}
  });
  $("sound-toggle").checked = getState().sound;
  $("music-toggle").checked = music;
  $("shake-range").value = Math.round(shakeScale * 100);
  return {
    open: openSettings,
    close: closeSettings,
    cancelResume() {
      settingsWasPlaying = false;
    },
    refresh() {
      $("sound-toggle").checked = getState().sound;
      $("music-toggle").checked = audio.state.enabled;
    },
    destroy() {
      abort.abort();
      $("settings-overlay").hidden = true;
    },
  };
}
