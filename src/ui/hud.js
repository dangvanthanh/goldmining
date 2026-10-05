import { byId } from "./dom.js";
import { LEVELS } from "../core/levels.js";
import { money } from "./format.js";
export function createHud({ document = globalThis.document, getState, effects }) {
  const $ = byId(document),
    rollScore = effects.rollScore;
  let hudKey = "";
  function updateHUD(state) {
    const { level, bank, haul, time, phase, hookState, caught } = state;
    const { dynamite, strength, book, magnet, magnetArmed } = state.supplies;
    const key = [
      level,
      bank,
      haul,
      Math.ceil(time),
      phase,
      hookState,
      caught?.id,
      dynamite,
      strength,
      book,
      magnet,
      magnetArmed,
    ].join("|");
    if (key === hudKey) return;
    hudKey = key;
    rollScore(bank + haul);
    $("goal").textContent = money(LEVELS[level].target);
    const progress = Math.min(100, ((bank + haul) / LEVELS[level].target) * 100);
    $("progress").style.width = progress + "%";
    $("target-progress").setAttribute("aria-valuenow", Math.round(progress));
    $("target-progress").setAttribute(
      "aria-valuetext",
      `${money(bank + haul)} of ${money(LEVELS[level].target)} target`,
    );
    document.querySelector(".plaque").dataset.target = progress >= 100 ? "met" : "mining";
    $("mine-number").textContent = `${String(level + 1).padStart(2, "0")} / ${LEVELS.length}`;
    const seconds = Math.max(0, Math.ceil(time));
    $("timer").textContent =
      String(Math.floor(seconds / 60)).padStart(2, "0") +
      ":" +
      String(seconds % 60).padStart(2, "0");
    $("timer").classList.toggle("urgent", time <= 15);
    $("location").textContent =
      String(level + 1).padStart(2, "0") + " — " + LEVELS[level].name.toUpperCase();
    $("dynamite-count").textContent = dynamite;
    $("strength-count").textContent = strength ? 1 : 0;
    $("book-count").textContent = book ? 1 : 0;
    $("strength-item").disabled = phase !== "playing" || !strength;
    $("book-item").disabled = phase !== "playing" || !book;
    $("magnet-count").textContent = magnet ? 1 : 0;
    $("magnet-item").disabled = phase !== "playing" || !magnet || hookState !== "swing";
    $("magnet-item").classList.toggle("armed", magnetArmed);
    $("magnet-item").setAttribute("aria-pressed", String(magnetArmed));
    $("dynamite").setAttribute(
      "aria-label",
      `Dynamite: ${dynamite} charges. Destroy current catch.`,
    );
    $("dynamite").disabled = phase !== "playing" || !caught || dynamite === 0;
    $("pause").disabled = !["playing", "paused"].includes(phase);
  }
  return {
    render(state = getState()) {
      updateHUD(state);
    },
    score(value) {
      $("haul").textContent = money(value);
    },
    toast(text) {
      $("toast").textContent = text;
    },
    draw(now) {
      $("toast").classList.toggle("visible", now < effects.state.toastUntil);
    },
  };
}
