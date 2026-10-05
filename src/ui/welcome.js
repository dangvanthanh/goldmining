import { byId } from "./dom.js";
import { validSave } from "../core/save.js";
// Welcome overlay: New, Continue (with its saved-game probe), Settings and Field guide.
// `signal` aborts the listeners; `isDisposed` ignores late async results after teardown.
export function createWelcome({
  document = globalThis.document,
  storage,
  command,
  dialogs,
  effects,
  settings,
  signal,
  isDisposed,
}) {
  const $ = byId(document);
  function on(id, handler) {
    $(id).addEventListener(
      "click",
      (event) => {
        if (!isDisposed()) handler(event);
      },
      { signal },
    );
  }
  on("welcome-new", () => {
    $("welcome-overlay").hidden = true;
    command("newExpedition");
  });
  on("welcome-continue", async () => {
    if ($("welcome-continue").disabled) return;
    $("welcome-continue").disabled = true;
    $("welcome-new").disabled = true;
    $("welcome-continue").setAttribute("aria-busy", "true");
    let loaded = false;
    try {
      const data = await storage.load();
      if (isDisposed()) return;
      if (data) {
        if (command("restore", data) === false) throw new Error("Invalid or unsupported save data");
        loaded = true;
      }
    } catch (error) {
      if (!isDisposed()) {
        console.warn("Gold Mining save could not be loaded:", error);
        effects.notify("Could not continue this expedition. Try again or start a new game.");
      }
    }
    if (isDisposed()) return;
    $("welcome-continue").removeAttribute("aria-busy");
    $("welcome-new").disabled = false;
    $("welcome-continue").disabled = false;
    $("welcome-overlay").hidden = loaded;
    if (loaded) dialogs.focus();
    else dialogs.welcome();
  });
  on("welcome-settings", settings.open);
  on("welcome-guide", dialogs.guide);
  storage
    .peek()
    .then((data) => {
      if (isDisposed()) return;
      const available = validSave(data);
      $("welcome-continue").disabled = !available;
      $("welcome-continue").title = available
        ? "Resume your saved expedition"
        : "Start a new game to save an expedition";
    })
    .catch(() => {
      if (isDisposed()) return;
      $("welcome-continue").disabled = true;
      $("welcome-continue").title = "Saved progress is unavailable in this browser";
    });
}
