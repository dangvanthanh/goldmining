# Gold Mining

A standalone, offline-friendly Canvas 2D game: 100 seeded mines, a swinging claw, 60-second rounds, a supplies shop, and local expedition saves. **Classic** (default) is vintage prairie and copper earth. **Cavern** is cinematic blue-black rock and amber lantern light; **Sky** is a serene airborne realm of ivory floating islands, mossy arch ruins, luminous waterfalls and a turquoise cloud sea, inspired by [Sky: Children of the Light](https://www.thatskygame.com/). Each theme has a distinct environment and palette. Local hand-painted environments and transparent material/character sprites combine with native Canvas lighting and system fonts. Procedural artwork remains available if image loading fails. No game engine or runtime art service.

## Run

```sh
npm run serve
# Open http://localhost:8000
```

Alternatively: `python3 -m http.server 8000`. No install or production build is needed. Serve the directory rather than opening `index.html` through `file://`, which has inconsistent storage behavior.

## Controls

- **Down / Space / tap the field:** launch the automatically swinging claw. Wait until it returns before launching again.
- **D / dynamite button:** destroy your current catch without scoring. Requires a charge.
- **P / Escape / pause button:** pause or resume. Switching away from the tab also pauses.
- **Settings:** stop the clock while you change sound, music, shake/vibration, or art. Closing settings resumes only if settings paused an active game; after switching tabs, the expedition remains paused.
- **Diamond book / Values button:** reveal treasure payouts for six seconds. Its diamond bonus is automatic; pressing the button is not required to activate it.
- **Magnetic claw:** arm while the claw is swinging, then launch. It widens gold capture by 24 field units for one launch and consumes the upgrade. Press again before launching to stow it.
- **Strength drink:** its pulling-speed bonus is automatic for the current mine; the field button explains the effect.

Only treasure returned to the winch before time expires scores. Gold and rocks drag the reel; diamonds are light and valuable. Clear every object to end a round early. Meet the target to proceed; miss it to retry the same seeded mine. Retry restores the mine's starting cash but does not refund consumed dynamite or magnetic claws.

Keyboard focus stays inside the active dialog. Gameplay shortcuts do not interfere with settings controls. Touch buttons are at least 44×44 CSS pixels. The playable field uses one uniform scale, so resizing does not change collision, spacing, blast distances, or saved positions. Art fills the surrounding viewport. Stationary targets stay clear of the score plaque and gear controls. Landscape provides larger targets on phones; portrait still shows the whole field. Value labels and score popups retain a readable minimum font size; revealed prices avoid overlap and use leaders to identify their treasure.

Your device's **reduced-motion preference** disables shake and vibration, freezes clouds, birds, water drips, and decorative glints, reduces particles/flashes, and removes score tweens. The shake slider also controls vibration intensity. Music is optional, independent of sound effects, and disabled by default. A saved music preference starts playback on the next New game or Resume gesture, respecting browser autoplay restrictions.

## Visual presentation

The prospector has local painted **normal, pulling, surprised, happy, and worried** expressions, shared by the actual gantry operator and welcome/result illustrations, with cached procedural fallback. Gameplay has only one operator—no duplicate floating close-up or caption plaque. Textured ore, emeralds, sacks, pigs and machinery share the environments' material direction. Pigs become wide-eyed when caught. A compact shaded-brass HUD shows haul, target progress and time, with separate 44-pixel controls and four tool slots.

Earned catches drive impact rings, a short claw trail, readable reward popups, warm environmental pulses, and a cart that fills from the actual haul. There are no visual-only multipliers or invented rewards. Trails/rings expire even while paused and are disabled for reduced motion; decorative dust/pollen freezes too. Shop cards adapt to narrow phones and short landscape screens; names/descriptions replace large tool illustrations when space is tight.

`src/art/constants.js` centralizes Canvas visual timing, palettes, scenery, size/count caps, and responsive tuning; `style.css` owns the native UI material variables. `src/art/scene-assets.js` loads 18 local WebP assets (2,169,624 bytes total) once; backgrounds are cached, and sprite images are reused. PNGs in `assets/aaa/` are editable generation sources, not requested at runtime. Classic retains separate sky/earth depth planes. Sky uses one continuous shelf-anchored image with a dedicated tall-screen composition, native drifting wisps/white birds/waterfall highlights, and no buried-object shadows. Its procedural fallback also depicts floating ivory islands over open blue air. Ordered core events drive owned presentation effects; `src/art/prospector.js` shares the character artwork. These effects are ephemeral and never enter saved progress or collision calculations. The HUD and modal scrollports reserve the top **8%** of the viewport for clear composition—not an integration with an external widget.

## Economy and difficulty

A completed mine's target is deducted from your available money. Only the surplus carries into the shop; purchases spend that surplus, and unspent cash counts toward the next target. Keeping cash is a valid alternative to buying gear.

Targets follow five-mine recovery/build/challenge cycles, not a strictly increasing table. With zero-based mine index `i`:

```text
baseline = 550 + 4200 × (1 − exp(−i / 35))
rhythm   = [0.94, 0.98, 1.02, 1.06, 1.12][i % 5]
target   = round(baseline × rhythm / 25) × 25
```

Examples: mine 1 **$525**, mine 5 **$1,125**, mine 6 **$1,050**, mine 10 **$1,675**, and mine 100 **$5,050**. Check the in-game HUD and shop for the authoritative target.

New games use layout version 3. Gold-heavy and gem-heavy maps alternate, with more blocking rocks and moving targets in later bands. Stationary treasure is normalized to a fixed budget: the required share rises from roughly 58% in the opening mine toward roughly 81% in the finale, varying with each five-mine cycle. This is a value budget, **not proof that every route is equally easy within a minute**. Values are rounded to whole dollars after normalization.

| Treasure    |    Pre-scaling value | Pulling weight |
| ----------- | -------------------: | -------------: |
| Small gold  |                  100 |            1.1 |
| Medium gold |                  350 |            2.3 |
| Large gold  |                  900 |            4.4 |
| Diamond     |                  600 |            0.8 |
| Gem         |                  300 |            1.0 |
| Mystery bag |        Seeded 75–625 |           1.05 |
| Rock        | Flat $20, not scaled |            3.8 |

### Hazards

- **TNT:** touching a barrel detonates it underground, returns an empty claw, and destroys objects touching its 120-field-unit blast radius. Nearby barrels chain-react; destroyed treasure earns nothing. New layouts introduce TNT at mine 4, with a second barrel attempted on five-mine finales from mine 15. Safe placement can omit a hazard if no suitable position is found.
- **Pigs:** from mine 11, new layouts attempt one ordinary pig and one diamond-bearing pig. They patrol horizontally at 65 and 150 field units/second respectively, freeze while paused, and stop moving when caught. Ordinary pigs pay a flat $25. Diamond-bearing pigs pay $25 plus a scaled diamond portion; a book multiplies only that portion. Moving rewards are extra, not part of the stationary treasure budget.

Older saved layouts retain their historical hazard rules, object IDs, and placements.

### Supplies

Prices use the **upcoming** mine's target, rounded upward to $25 steps, with these minimums:

| Supply         | Price                       | Effect / limit                                                |
| -------------- | --------------------------- | ------------------------------------------------------------- |
| Dynamite       | 5% of target, at least $100 | Destroy a catch; carry at most 3 purchased charges            |
| Strength drink | 12%, at least $150          | 1.5× pulling speed for the next mine                          |
| Diamond book   | 12%, at least $150          | 1.5× diamond value for the next mine; reveal values on demand |
| Magnetic claw  | 6%, at least $75            | Carry one; widen gold capture for one armed launch            |

Dynamite and unspent magnetic claws carry forward. Strength and books expire after a successful mine. Legacy dynamite packs above three remain usable but cannot buy more until below the cap.

## Saved progress

Dexie 4.0.11 is bundled in `vendor/` with its Apache-2.0 license. One expedition lives in the `GoldMining` IndexedDB database.

- Autosaves every second during play and after catches, purchases, gear use, pause/resume, and transitions. Writes are serialized so an older snapshot cannot overwrite a newer one.
- Restores the mine, removed objects, in-flight hook/catch, timer, cash, gear, and expedition sound preference. Active games reopen paused; shops, losses, and victory screens restore their corresponding state.
- Art, music, and shake preferences use localStorage. **Classic** is the default when no valid art preference exists. Explicit Classic/Cavern/Sky choices persist; a saved `classic` now selects the new Classic provider rather than being redirected to Sky. Existing Sky and Cavern preferences are not overwritten.
- Legacy map versions 1 and 2 remain accepted. Historical mine-10/30/50 victory saves reopen the next shop without deducting the completed target again.
- Starting a new expedition explicitly replaces the previous save. Invalid saves are rejected without being rewritten by Continue.
- Saves belong to the browser profile and site origin, including port. Clearing site data deletes them; private browsing may discard them. Use one game tab at a time—simultaneous tabs can overwrite progress.
- Storage errors produce a warning, not a gameplay lock. Page hide attempts a final save, but abrupt termination or browser shutdown may lose the latest unfinished write.

## Verification

**NEVER write unit tests in this project.** The policy in `AGENTS.md` supersedes historical plans and specifications. The unit-test directory, fixtures, baseline recorder, and `npm test` script have been removed; do not recreate them or add unit-test frameworks/dependencies.

```sh
npm run check      # Syntax across owned modules and scripts
npm run smoke      # Unmodified browser integration; Node 22+ and Chrome/Chromium
node scripts/visual-parity.cjs --verify  # Local authored/fallback RGBA references
```

The browser check uses Node's standard library and Chromium's DevTools protocol. It starts an ephemeral localhost server and an isolated temporary browser profile, then cleans both up. It does not touch your normal browser saves. Set `CHROME_BIN` if your browser is installed in a nonstandard location:

```sh
CHROME_BIN=/path/to/chromium npm run smoke
SMOKE_SHOTS=/tmp/goldmining-shots npm run smoke  # Optional screenshots
```

The smoke server serves production files **byte-for-byte**, with no source rewriting or response overrides. Its separate `scripts/smoke-driver.js` imports the already-running `app`, uses normal commands and validated saves, and observes DOM/Canvas output; the game never imports this fixture. Checks cover boot, timer formatting, exact scores, three retries, modal clock/input/focus, reduced motion, HUD cadence, a real isolated diamond launch, catch save/reload, synthesized effects and saved music startup, gear consumption, upgraded payouts, purchases, transitions, all 100 seeded maps' viewport geometry, real touch input, all three art styles at phone/landscape/ultrawide sizes, readable non-overlapping value labels, HUD clearance across all 100 maps at each viewport, moving pig label bounds, legacy saves/art preferences, and final victory/restart. Additional visual checks cover painted opening artwork, real catch/reward expression changes, exact result-card figures, capped/expiring/reduced-motion effects, actual rendered cart filling, the top-eight-percent inset, character/treasure clearance, and desktop/small-phone shop actions without scrolling. Classic checks also verify fresh/invalid preference defaults, persistence of every theme, distinct rendered backgrounds, and unchanged catch/cash/object state while switching styles. Smoke screenshots support manual visual review. The separate parity gate compares 18 decoded-RGBA references at DPR 1, reduced motion and a pinned zero clock (three themes × three viewports × authored/fallback). Migration captures live in ignored `.dream-loop/architecture/baseline/visual/`; a clean checkout must deliberately establish its own local reference with `--record` before visual `--verify`. Existing visual references refuse overwrite unless `--record --replace` is explicit. Do not re-record to make a regression pass. Browser checks also cover three destroy/remount cycles and persisted AudioContext-failure handling. Pure simulation, TNT-chain behavior, seeded-map consistency, and save compatibility require focused manual verification; the removed unit tests and fixtures no longer provide those checks.

`window.render_game_to_text()` returns valid JSON with phase/modal, art, cash/target/timer, field-to-viewport transform, hook/catch, supplies, and object positions/removal state. Coordinates are field units, top-left origin, x right and y down. It is read-only and does not expose progress mutation.

## Native module architecture

The page loads vendored Dexie and a single native module entry, `src/main.js`. There is no bundler, compilation, framework, install requirement, or production build.

| Layer           | Ownership                                                                            |
| --------------- | ------------------------------------------------------------------------------------ |
| `src/core/`     | Pure levels/maps/economy/save codec and explicitly clocked `createGame()` simulation |
| `src/render/`   | Facets, Canvas fit/geometry, shapes, rig, object painters, effects and renderer      |
| `src/art/`      | Per-instance image loader, constants, shared Canvas helpers (`canvas.js`), three environments and prospector |
| `src/audio/`    | Lazy effects/music/context, event-to-sound table and fade cleanup                    |
| `src/ui/`       | HUD, dialogs/guide, settings, welcome flow, notices, native input/focus/inert behavior |
| `src/platform/` | Serialized copied save writes and guarded preference access                          |
| `src/inspect.js`| Read-only JSON snapshot behind `window.render_game_to_text()`                       |
| `src/main.js`   | Command allow-list, event routing, frame loop and app lifetime                       |

`createGame({map})` owns mutable state; `.state` is a cached deeply read-only view. Core methods return ordered copied event records. Commands take `now` in milliseconds; `advance(elapsed,now)` takes elapsed **seconds**, preserving the 0.1-second cap and 1/120-second steps. `snapshot(now)` returns a detached SaveV1; `restore(save,now)` returns `false` or events, without partial mutation. Importing any non-entry module is safe without browser globals.

Data shapes: `LEVELS` is a frozen array of `{name, target}`; `game.state.supplies` is a frozen `{dynamite, strength, book, magnet, magnetArmed}` view (the flat fields remain, and SaveV1 is unchanged); gem/gold object classes come from `isGem`/`isGold` in `core/levels.js`, and tuning numbers such as hook rest length, drop speed and swing amplitude live in `RULES`.

Event routing: `main.js` queues each batch of core events (re-entrancy safe) and, for every event, calls `effects.consume` (visual effects handler map), `audio.handle` (event-to-sound table), `noticeFor` (toast text) and a small map of app reactions (dialogs, saving, music). `dialogs.showFor(phase)` chooses pause, shop or result. Renderers read one per-draw `{state, fx, view}` record instead of copying state fields.

For integration, `const {app,createApp} = await import('/src/main.js')` returns the existing app. `app.command(name,payload,now)`, `setArt`, `renderer`, `effects`, `audio`, `storage` and read-only `inspect()` are explicit interfaces. `createApp({document,clock,storage,preferences,createAudioContext,map})` supports owned replacements; default clock is `{now,requestFrame,cancelFrame}`. Destroy the existing app before remounting the same DOM. `await app.destroy()` is idempotent: it aborts listeners, disconnects observers, cancels frames/score/repaint/fades, ignores late image/save/UI callbacks, closes audio, and flushes then closes its storage. Retrying a mine does not remount or duplicate resources. No production mutation hooks or EventBus shim remain.

Storage stays `GoldMining` / schema 1 / `saves` / `expedition` / SaveV1, with `gm-art`, `gm-music`, `gm-shake` unchanged. Historical completion notes below name the former root paths; those sources have migrated into `src/`, not remained as alternate entry points. Sky artwork/CSS and all other pending visual edits were preserved.

### Code-smell refactoring — 2026-10-05

Implemented [the plan](docs/plan/2026-10-05-code-smell-refactoring.md) without changing gameplay, visuals, saves or controls: named constants and level records, one state record in the core, event handler maps, hook/map/object/rig/background methods split by responsibility, shared Canvas/DOM helpers and a smaller `createApp`. Verified by syntax checks, 54 browser smoke checks, 24 exact-pixel captures and unchanged map/price/simulation fingerprints. `npm run serve` (Python) can reset connections intermittently when the browser loads the modules; reload if the page is blank. Self-reviewed only; physical-device, Safari/Firefox, audio-mix and balance checks remain manual.

### Manual acceptance

- Play early, middle, and late mines without upgrades, then compare strength/book routes and purchases. Human balance and strategy still need playtesting; a smoke check is not a winnability guarantee.
- Aim around rocks, detonate adjacent TNT barrels and confirm chained destruction earns no gold, intercept both pigs, and compare the same mine before/after rotating the device.
- Retry the same mine to check seeded positions and values, check the documented targets/prices, and exercise legacy saves, in-flight catches, invalid Continue data, purchases, and final victory.
- Use an actual touchscreen and keyboard; check tiny diamonds, value labels, dialog scrolling, focus rings, and 44-pixel controls.
- Listen to the sound mix and optional music on speakers/headphones; browser synthesis checks do not establish audibility or a pleasing mix.
- Block IndexedDB, reopen the browser on the same origin, and check saves on Safari/Firefox and private browsing.
- Verify reduced motion and mobile safe-area positioning on physical devices. The game is standalone: there is no Play.fun widget/SDK; the visual eight-percent inset is not a guarantee of clearance for an actual embedding bar, and the spatial aiming field does not provide a nonvisual gameplay mode.
