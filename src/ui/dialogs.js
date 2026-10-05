import { byId } from "./dom.js";
import { LEVELS, RULES } from "../core/levels.js";
import { supplyPrices } from "../core/economy.js";
import { money } from "./format.js";
import { expression as mood } from "../render/effects.js";
export function createDialogs({
  document = globalThis.document,
  canvas,
  constants: visual,
  calm,
  clock,
  getState,
  effects,
  prospector,
  getArt,
  command,
}) {
  const $ = byId(document),
    welcome = $("welcome-overlay"),
    { strengthBonus, diamondBonus, dynamiteCapacity } = RULES;
  const abort = new AbortController();
  let actions = new AbortController();

  const expression = (now) => mood(getState(), effects.state, now),
    startLevel = () => command("retry"),
    pause = () => command("resume"),
    buy = (item) => command("buy", item);
  function on(target, type, handler) {
    target.addEventListener(
      type,
      (event) => {
        if (abort.signal.aborted) return;
        handler(event);
      },
      { signal: actions.signal },
    );
  }
  function activeModal() {
    return ["settings-overlay", "welcome-overlay", "overlay"].map($).find((el) => !el.hidden);
  }
  function syncModal() {
    const modal = activeModal();
    canvas.inert = Boolean(modal);
    canvas.tabIndex = modal ? -1 : 0;
    document.querySelectorAll(".hud").forEach((el) => {
      el.inert = Boolean(modal);
    });
    for (const id of ["settings-overlay", "welcome-overlay", "overlay"])
      $(id).inert = Boolean(modal && $(id) !== modal);
    return modal;
  }
  function focusGame() {
    const modal = syncModal();
    (modal?.querySelector("button:not(:disabled), input:not(:disabled)") || canvas).focus({
      preventScroll: true,
    });
  }
  function showDialog(content) {
    const { phase } = getState(),
      artName = getArt();
    actions.abort();
    actions = new AbortController();
    const entering = $("overlay").hidden || $("dialog").dataset.scene !== phase;
    $("dialog").dataset.scene = phase;
    $("dialog").innerHTML = content;
    for (const portrait of $("dialog").querySelectorAll(".prospector-portrait"))
      prospector.paint(portrait, expression(clock.now()), artName);
    if (entering && !calm.matches)
      $("dialog").animate(
        [
          { opacity: 0.6, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: visual.transitionMs, easing: "ease-out" },
      );
    $("dialog").querySelector("h2").id = "dialog-title";
    $("overlay").hidden = false;
    focusGame();
  }
  function hideDialog() {
    $("overlay").hidden = true;
    focusGame();
  }
  function renderPause() {
    showDialog(
      '<span class="badge">TAKE FIVE</span><h2>At ease, miner.</h2><p>Your haul is safe underground and the clock is stopped. Ready when you are.</p><button class="primary" id="resume">Back to the seam →</button>',
    );
    on($("resume"), "click", pause);
  }
  function renderResult() {
    const { level, bank, haul, phase } = getState();
    const portrait =
      '<canvas class="prospector-portrait result-prospector" width="200" height="240" aria-hidden="true"></canvas>';
    if (phase === "lost") {
      showDialog(
        `${portrait}<span class="badge">ANOTHER SHOT AT THE SEAM</span><h2>Chin up, miner!</h2><dl class="result-stats"><div class="result-stat"><dt>Brought in</dt><dd>${money(bank + haul)}</dd></div><div class="result-stat"><dt>Target</dt><dd>${money(LEVELS[level].target)}</dd></div><div class="result-stat"><dt>To go</dt><dd>${money(LEVELS[level].target - bank - haul)}</dd></div></dl><p>Try a new angle. Diamonds are light and valuable.</p><button class="primary" id="retry">Dig again ↻</button>`,
      );
      on($("retry"), "click", startLevel);
    } else {
      showDialog(
        `${portrait}<span class="badge">${LEVELS.length} SHAFTS. ONE LEGEND.</span><h2>What a haul!</h2><dl class="result-stats"><div class="result-stat"><dt>Mines cleared</dt><dd>${LEVELS.length}</dd></div><div class="result-stat"><dt>Gold to spare</dt><dd>${money(bank)}</dd></div></dl><p>The whole crew salutes you.</p><button class="primary" id="restart">A new expedition ↗</button>`,
      );
      on($("restart"), "click", () => command("newExpedition"));
    }
  }
  function renderShop() {
    const { level, bank } = getState(),
      { dynamite, strength, book, magnet } = getState().supplies;
    const prices = supplyPrices(level + 1);
    showDialog(
      `<span class="badge">MINE ${String(level + 1).padStart(2, "0")} COMPLETE · SUPPLY SHACK</span><h2>Stock up, miner.</h2><p class="shop-summary"><span>Cash to spend <strong>${money(bank)}</strong></span><span>Up next · ${LEVELS[level + 1].name}<b>Target ${money(LEVELS[level + 1].target)}</b></span></p><div class="shop-items"><button class="shop-item" id="buy-dynamite" ${bank < prices.dynamite || dynamite >= dynamiteCapacity ? "disabled" : ""}><span class="item-icon icon-dynamite" aria-hidden="true"></span><strong>Dynamite</strong><small>Destroy your catch<br>${dynamite}/${dynamiteCapacity} in your pack</small><span>${dynamite >= dynamiteCapacity ? "Pack full" : money(prices.dynamite)}</span></button><button class="shop-item" id="buy-strength" ${bank < prices.strength || strength ? "disabled" : ""}><span class="item-icon icon-potion" aria-hidden="true"></span><strong>Strength drink</strong><small>${strengthBonus}× pulling speed<br>Next mine only</small><span>${strength ? "Packed ✓" : money(prices.strength)}</span></button><button class="shop-item" id="buy-book" ${bank < prices.book || book ? "disabled" : ""}><span class="item-icon icon-book" aria-hidden="true"></span><strong>Diamond book</strong><small>${diamondBonus}× diamond value<br>Next mine only</small><span>${book ? "Packed ✓" : money(prices.book)}</span></button></div><p>Supplies cost part of your next goal. Save cash, or invest in a better haul.</p><button class="primary" id="next">On to mine ${level + 2} →</button>`,
    );
    $("dialog")
      .querySelector(".shop-items")
      .insertAdjacentHTML(
        "beforeend",
        `<button class="shop-item" id="buy-magnet" ${bank < prices.magnet || magnet ? "disabled" : ""}><span class="item-icon icon-magnet" aria-hidden="true"></span><strong>Magnetic claw</strong><small>Wider gold capture<br>One launch · arm in the field</small><span>${magnet ? "Packed ✓" : money(prices.magnet)}</span></button>`,
      );
    on($("buy-magnet"), "click", () => buy("magnet"));
    on($("buy-dynamite"), "click", () => buy("dynamite"));
    on($("buy-strength"), "click", () => buy("strength"));
    on($("buy-book"), "click", () => buy("book"));
    on($("next"), "click", () => command("nextMine"));
  }
  function showWelcome() {
    $("overlay").hidden = true;
    welcome.hidden = false;
    focusGame();
  }
  function showGuide() {
    $("welcome-overlay").hidden = true;
    showDialog(`<span class="badge">MINER’S HANDBOOK</span><h2>How to dig</h2>
      <p><strong>Controls.</strong> ↓ / Space or tap the field to drop the claw. D fires dynamite. P or Esc pauses.</p>
      <p><strong>Mines.</strong> Reach the target within 60 seconds; leftover gold carries to the next shaft. Miss the target and you dig the same mine again.</p>
      <p><strong>Pacing.</strong> Every fifth mine is a challenge, followed by a breather. Gold-rich and gem-rich layouts alternate. Rocks pay a little, but treasure is worth your time.</p>
      <p><strong>Supplies shop.</strong> Between mines you spend surplus gold on gear. Prices rise with the next mine’s target:</p>
      <ul class="guide-items">
        <li><strong>Dynamite</strong> — destroys your current catch</li>
        <li><strong>Strength drink</strong> — ${RULES.strengthBonus}× pulling speed for the next mine</li>
        <li><strong>Diamond book</strong> — 1.5× diamond value for the next mine</li>
        <li><strong>Magnetic claw</strong> — wider gold capture; arm it before your next launch</li>
      </ul>
      <p>Diamonds are light and valuable, TNT destroys everything nearby, and mystery bags hold a surprise. Good digging!</p>
      <button class="primary" id="guide-back">Back</button>`);
    on($("guide-back"), "click", showWelcome);
  }
  return {
    guide: showGuide,
    active: activeModal,
    sync: syncModal,
    focus: focusGame,
    hide: hideDialog,
    show: showDialog,
    showFor(phase) {
      const render = { paused: renderPause, shop: renderShop }[phase] ?? renderResult;
      render();
    },
    pause: renderPause,
    result: renderResult,
    shop: renderShop,
    welcome: showWelcome,
    cancelMotion() {
      $("dialog")
        .getAnimations()
        .forEach((a) => a.cancel());
    },
    destroy() {
      abort.abort();
      actions.abort();
      $("dialog")
        .getAnimations()
        .forEach((a) => a.cancel());
      $("dialog").innerHTML = "";
    },
  };
}
