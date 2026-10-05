import { byId } from "./dom.js";
import { RULES } from "../core/levels.js";
export function createInput({
  document = globalThis.document,
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
}) {
  const $ = byId(document),
    abort = new AbortController(),
    { strengthBonus } = RULES;
  const drop = () => command("drop"),
    explode = () => command("blastCatch"),
    pause = () => command(getState().phase === "paused" ? "resume" : "pause"),
    saveProgress = () => command("save");
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

  for (const radio of document.querySelectorAll("input[name=art]")) {
    radio.checked = radio.value === renderer.artName;
    on(radio, "change", () => {
      if (radio.checked) setArt(radio.value);
    });
  }
  on(calm, "change", () => {
    if (!calm.matches) return;
    effects.clearMotion();
    dialogs.cancelMotion();
    const { bank, haul } = getState();
    effects.rollScore(bank + haul, true);
  });
  for (const button of document.querySelectorAll(".action-item")) {
    on(button, "pointerdown", (event) => {
      if (!button.disabled) effects.burst(renderer.toField(event), "gold");
    });
  }
  on($("strength-item"), "click", () =>
    effects.notify(`Strength active: ${strengthBonus}× pulling speed for this mine.`),
  );
  on($("book-item"), "click", () => command("reveal"));
  on($("magnet-item"), "click", () => command("toggleMagnet"));
  on($("dynamite"), "click", explode);
  on($("pause"), "click", pause);
  on(canvas, "pointerdown", (event) => {
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    if (audio.state.enabled) audio.resume();
    drop();
  });
  on(document, "keydown", (event) => {
    const modal = dialogs.active(),
      { phase } = getState();
    if (modal) {
      if (event.key === "Tab") {
        const controls = [
          ...modal.querySelectorAll('button:not(:disabled), input:not(:disabled), [tabindex="0"]'),
        ];
        const first = controls[0],
          last = controls.at(-1),
          focused = document.activeElement;
        if (!modal.contains(focused) || (event.shiftKey ? focused === first : focused === last)) {
          event.preventDefault();
          (event.shiftKey ? last : first)?.focus();
        }
      } else if (event.key === "Escape" && !event.repeat) {
        event.preventDefault();
        if (modal === $("settings-overlay")) settings.close();
        else if (modal === $("overlay") && phase === "paused") pause();
        else if (modal === $("overlay")) $("guide-back")?.click();
      } else if (
        modal === $("overlay") &&
        phase === "paused" &&
        event.key.toLowerCase() === "p" &&
        !event.repeat
      )
        pause();
      return;
    }
    if (
      event.repeat ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.target.closest("input,select,textarea,[contenteditable]")
    )
      return;
    if (event.key === "Escape" || event.key.toLowerCase() === "p") {
      pause();
      return;
    }
    if (phase !== "playing") return;
    if (event.key === "ArrowDown" || (event.code === "Space" && !event.target.closest("button"))) {
      event.preventDefault();
      drop();
    }
    if (event.key.toLowerCase() === "d") {
      event.preventDefault();
      explode();
    }
  });
  on(document, "visibilitychange", () => {
    if (document.hidden) {
      settings.cancelResume();
      if (getState().phase === "playing") pause();
      else saveProgress();
    }
  });
  on(window, "pagehide", () => {
    settings.cancelResume();
    if (getState().phase === "playing") pause();
    else saveProgress();
  });
  return {
    destroy() {
      abort.abort();
    },
  };
}
