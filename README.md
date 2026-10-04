# Gold Mining

A standalone, offline-friendly Canvas 2D game: 100 seeded mines, a swinging claw, 60-second rounds, a supplies shop, and local expedition saves. **Classic** (default) is vintage prairie and copper earth—not Sky's alpine forest. **Cavern** is cinematic blue-black rock and amber lantern light; **Sky** is a sunlit mountain expedition. Local hand-painted environments and transparent material/character sprites combine with native Canvas lighting and system fonts. Procedural artwork remains available if image loading fails. No game engine or runtime art service.

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

`Constants.js` centralizes Canvas visual timing, palettes, scenery, size/count caps, and responsive tuning; `style.css` owns the native UI material variables. `scene-assets.js` loads 17 local WebP assets (~2.37 MB total) once; backgrounds are cached, and sprite images are reused. PNGs in `assets/aaa/` are editable generation sources, not requested at runtime. Daylight sky/earth use separate depth planes so a tall portrait sky does not magnify the soil. `EventBus.js` uses native `EventTarget` signals (`ENTRANCE`, `CATCH`, `REWARD`, `BLAST`, `RESULT`); `prospector-art.js` shares the character artwork. These effects are ephemeral and never enter saved progress or collision calculations. The HUD and modal scrollports reserve the top **8%** of the viewport for clear composition—not an integration with an external widget.

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

| Treasure | Pre-scaling value | Pulling weight |
| --- | ---: | ---: |
| Small gold | 100 | 1.1 |
| Medium gold | 350 | 2.3 |
| Large gold | 900 | 4.4 |
| Diamond | 600 | 0.8 |
| Gem | 300 | 1.0 |
| Mystery bag | Seeded 75–625 | 1.05 |
| Rock | Flat $20, not scaled | 3.8 |

### Hazards

- **TNT:** touching a barrel detonates it underground, returns an empty claw, and destroys objects touching its 120-field-unit blast radius. Nearby barrels chain-react; destroyed treasure earns nothing. New layouts introduce TNT at mine 4, with a second barrel attempted on five-mine finales from mine 15. Safe placement can omit a hazard if no suitable position is found.
- **Pigs:** from mine 11, new layouts attempt one ordinary pig and one diamond-bearing pig. They patrol horizontally at 65 and 150 field units/second respectively, freeze while paused, and stop moving when caught. Ordinary pigs pay a flat $25. Diamond-bearing pigs pay $25 plus a scaled diamond portion; a book multiplies only that portion. Moving rewards are extra, not part of the stationary treasure budget.

Older saved layouts retain their historical hazard rules, object IDs, and placements.

### Supplies

Prices use the **upcoming** mine's target, rounded upward to $25 steps, with these minimums:

| Supply | Price | Effect / limit |
| --- | --- | --- |
| Dynamite | 5% of target, at least $100 | Destroy a catch; carry at most 3 purchased charges |
| Strength drink | 12%, at least $150 | 1.5× pulling speed for the next mine |
| Diamond book | 12%, at least $150 | 1.5× diamond value for the next mine; reveal values on demand |
| Magnetic claw | 6%, at least $75 | Carry one; widen gold capture for one armed launch |

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

```sh
npm run check      # JavaScript syntax; no dependencies
npm run smoke      # Real browser integration checks; Node 22+ and Chrome/Chromium
```

The browser check uses Node's standard library and Chromium's DevTools protocol. It starts an ephemeral localhost server and an isolated temporary browser profile, then cleans both up. It does not touch your normal browser saves. Set `CHROME_BIN` if your browser is installed in a nonstandard location:

```sh
CHROME_BIN=/path/to/chromium npm run smoke
SMOKE_SHOTS=/tmp/goldmining-shots npm run smoke  # Optional screenshots
```

The smoke server injects controlled scenarios into its **in-memory** copy of `game.js`; those mutation helpers are never shipped in the game. Checks cover boot, timer formatting, exact scores, three retries, modal clock/input/focus, reduced motion, HUD cadence, a real isolated diamond launch, catch save/reload, synthesized effects and saved music startup, TNT chains, gear consumption, upgraded payouts, purchases, transitions, all 100 deterministic maps, real touch input, all three art styles at phone/landscape/ultrawide sizes, readable non-overlapping value labels, HUD clearance across all 100 maps at each viewport, moving pig label bounds, legacy saves/art preferences, and final victory/restart. Additional visual checks cover painted opening artwork, real catch/reward expression changes, exact result-card figures, capped/expiring/reduced-motion effects, actual rendered cart filling, the top-eight-percent inset, character/treasure clearance, and desktop/small-phone shop actions without scrolling. Classic checks also verify fresh/invalid preference defaults, persistence of every theme, distinct rendered backgrounds, and unchanged catch/cash/object state while switching styles. Screenshots support manual visual review; they are not golden-image regression assertions.

`window.render_game_to_text()` returns valid JSON with phase/modal, art, cash/target/timer, field-to-viewport transform, hook/catch, supplies, and object positions/removal state. Coordinates are field units, top-left origin, x right and y down. It is read-only and does not expose progress mutation.

### Completion notes — 2026-10-02

- `npm run check`, `git diff --check`, and all **29 browser smoke checks** passed on macOS Chrome with Node 26.8.2; no runtime/storage errors were reported.
- A separate read-only comparison against the original game verified all **300 maps** (100 mines × layout versions 1–3), including IDs, positions, radii, values, weights, and targets. The Sky rename and then-current Classic→Sky migration were preserved in that pass; the migration is superseded by the new Classic provider below.
- Reviewed screenshots for both themes at 320×568, 393×851, 844×390, and 2560×850. No build step, dependencies, or game engine were added.
- Physical-device touch/vibration, audible mixing, Safari/Firefox behavior, storage-denied operation, and human difficulty acceptance remain manual. No Play.fun integration or nonvisual gameplay was added.

### Visual-pass completion notes — 2026-10-02

- Approved visual-only direction: stronger prospector/entrance, earned rewards, distinct result cards, compact shop, smooth entry transitions, larger labels, and safe UI inset. Preserved gameplay parameters, scoring/conditions, controls, save schema, and seeded generation.
- Before/after: tiny/static miner → expressive procedural portraits; tiny rewards → screen-readable popups/trails/rings; always-full cart → actual haul loading; paragraph-only result → explicit earned/target/shortfall cards; scrolling shop → compact responsive cards; edge-hugging HUD → top-eight-percent inset.
- Validation: JavaScript syntax, whitespace, **36 Chrome smoke checks**, and both themes at 320×568, 393×851, 844×390, and 2560×850. Browser checks include every mine's treasure clearance from the HUD and decorative portrait. Visual captures are in `/tmp/goldmining-visual-audit` (before) and `/tmp/goldmining-visual-after` (after).
- No new dependencies, external assets, physics/scoring changes, or commits. Self-reviewed; no independent reviewer tool is available. Physical-device/Safari/Firefox/audio/balance acceptance remains pending. Silent-clip conversion is a human design judgment, not proven by browser checks.

### Classic-theme completion notes — 2026-10-03

- Added `classic-art.js` and wired its script/provider/default/picker in `index.html` and `game.js`. Classic is original procedural artwork: pastel blue sky, simple drifting clouds, quiet earthen bands, bold outlined gold/rocks, and flat cream/brown controls. No original-game assets, copied sprites, or traced image paths were used. The supplied Fandom reference returned HTTP 403; this is an inspired look, not a claimed pixel replica.
- Supporting changes: Classic scenery/ore/character palettes in `Constants.js`, shared daylight controls and Classic overrides in `style.css`, syntax/server/coverage updates in `package.json` and `smoke-check.cjs`, and this README. The existing Sky/Cavern providers and character-expression code were reused without modification.
- Classic is the fresh-profile and invalid-preference fallback. Saved Classic now resolves to Classic; valid Sky/Cavern preferences remain respected. Maps, scoring, controls, collisions, timing, saves and reduced-motion behavior are unchanged.
- Screenshot self-review caught a fixture clicking the inert HUD behind a modal; fixed it to switch only through an actually open settings dialog and assert the selected theme. A focused browser probe then reproduced small-phone settings horizontal overflow (311px scroll width in a 305px scrollport); flexible panel/range minimum widths fixed it. All three themes now check actual settings width and small-phone shop action visibility.
- Verification: syntax and whitespace checks; **44 Chrome smoke checks**, including all three themes at 320×568, 393×851, 844×390, and 2560×850, plus 100-map HUD/portrait clearance at each combination. Captures: `/tmp/goldmining-classic`. No runtime/storage warnings, dependencies, external art assets, or commits. Physical-device/cross-browser/audio/balance acceptance remains manual.

### Dream Loop completion notes — 2026-10-04

- Generated a target from the current game screenshot using the Codex subscription image route. Three inline visual rounds (no subagent tool available): crafted UI, themed scenery, then responsive comparison and refinement. The target is visual direction, not a claimed pixel-perfect replica.
- `index.html` / `game.js` / `style.css`: rounded expedition instruments, consistent SVG pause/settings/hourglass icons, four-slot inventory without an empty placeholder, clearer tool silhouettes, character-caption plaques, location pills, target-met color and accessible monetary progress, compact welcome navigation, and explicit cash/next-target shop summaries.
- `classic-art.js`: pastel sun, layered sage hills, scrub, roots, continuous ochre seams and soft cutaway edges. `sky-art.js`: distant supply shack, rail fence and ridge haze. `cavern-art.js`: cool recesses, muted mineral seams/clusters and a still reflective floor accent. Cloud layers fill portrait/ultrawide scenery as well as the aiming field. All scenery remains procedural and decorative.
- Screenshot review and focused measurements reproduced cramped portrait room, a 552px desktop shop in a 533px scrollport, and 548px landscape settings in a 358px scrollport. Corrected actual caption-space accounting, HUD spacing, inherited shop line heights and compact three-theme settings chips/two-column landscape settings. Desktop, small-phone and landscape settings/shop controls now fit without scrolling. Browser fixtures wait for resize before clicking/measuring the HUD and clean up failed modal checks.
- Verification: JavaScript syntax, whitespace, and **48 Chrome smoke checks**, including all three themes at four viewport sizes, every mine's treasure/HUD clearance, accessible target state, welcome fit, responsive settings fit and shop primary-action visibility. Focused captures additionally cover opening/gameplay/results at five sizes and target-sized comparisons; no runtime/storage warnings. Generated target, baselines, round captures, probes and completion context live in ignored `.dream-loop/`.
- Physics, prices, scoring, controls, map generation and save schema are unchanged. No dependencies, shipped bitmap assets or commits. Self-reviewed only; physical-device, Safari/Firefox, audio and balance acceptance remain manual.

### Cinematic Dream Loop completion notes — 2026-10-04

- This revision supersedes the previous procedural-only presentation above. Locked a new Cavern target at **03:31:39 UTC**, deadline **04:31:39 UTC**. Three inline rounds: authored scenes/character/compact UI; remaining material props/machinery and portrait texture refinement; actual three-theme comparisons, responsive dialog review, and final verification. No subagent tool was available; self-review only.
- Refreshed `game.js`, `index.html`, `style.css`, all three art providers, shared character/constants, and new `scene-assets.js`/`assets/aaa/`. Classic has dry prairie/copper earth, not alpine mountains or forest. Cavern has atmospheric blue/amber depths; Sky has alpine geology. Generated local art is visual direction, not a pixel-perfect target claim. Procedural providers and character remain graceful fallbacks; no runtime image-generation/network service is needed.
- Fresh **50 Chrome smoke checks**, JavaScript syntax, and whitespace checks passed at **04:23:35 UTC**, with no runtime/storage warnings. New checks cover decoded transparent sprites, <=82px HUD, no duplicate gameplay portrait, and all image requests deliberately blocked: three distinct procedural themes and working hook controls remain. Existing map/save/catch/score/economy/focus/reduced-motion regressions remain green.
- Separate actual settings/shop captures and no-scroll measurements pass for all themes at 1100×580, 844×390, 320×568 and 393×851. Reviewed target-size gameplay for every theme, narrow-phone gameplay/shop and landscape settings. Exact source comparisons against the start-of-loop backup confirm `makeMap`, `validSave`, `saveProgress`, `drop`, `update`, `finishLevel` and `detonate` blocks are unchanged.
- Ignored artifacts: `.dream-loop/aaa/baseline`, `before`, `round-1`, `round-2`, `round-3`, `verified`, and logs/context. No dependencies, physics/prices/scoring/control/map/save-schema changes, resets or commits. Physical-device, Safari/Firefox, audio and human balance acceptance remain pending.

### Hook connection completion notes — 2026-10-04

- `game.js` / `Constants.js`: replaced oversized segmented links with a continuous shaded steel cable. It leaves the fixed swing pivot through a catwalk opening and ends on the rotated claw eye. A feed guide and belt-driven side crank connect the winch to the miner; the live hand stays on the handle instead of adding a disconnected arm over the painted glove.
- `smoke-check.cjs`: a failing-before-fix browser regression now checks cable/eye and hand/crank attachment during swing, drop and loaded reeling across all three themes, desktop, portrait and landscape; procedural fallback attachment is also checked. Headless cleanup now closes keep-alive connections and terminates its own browser reliably.
- Verification: **51 Chrome smoke checks**, JavaScript syntax and whitespace checks passed; no runtime/storage errors. Before/after and fallback captures are in ignored `.dream-loop/hook-fix/`. Exact source comparison confirms pre-render gameplay logic and the frame/input/save tail are unchanged. No dependencies, new art assets or commits; physical-device and Safari/Firefox acceptance remain manual.

### Approved hook-connection refinement — 2026-10-04

- Supersedes the stretched-arm/belt presentation in the previous hook notes. Generated an approved connection target and a transparent replacement winch using **codex-subscription / gpt-image-2**. Three inline visual rounds; no subagent tool was available. The target is visual direction, not a claimed pixel-perfect match.
- `game.js` / `Constants.js`: preserve the complete painted bent arms and gloves, fit a forged offset crank behind the hands, mount its bearing/compact gear on the actual winch frame, and run the same continuous shaded cable from the drum through the guide to the claw eye. A short ratchet stroke keeps the operator's boots planted. The smaller procedural fallback gets its own appropriately positioned grip and shorter arm, clear of its face.
- `assets/aaa/winch.webp`: refined local machinery; editable generation source `assets/aaa/winch-connected.png`. The loader still requests the same 17 WebPs, now **2,373,534 bytes** total; no added runtime requests, service or dependency.
- `smoke-check.cjs`: actual Canvas glove-pixel comparison failed before removing the cutout/flat arm; planted-feet and fallback face-clearance checks also failed before their fixes. Fresh syntax/whitespace and **52 Chrome smoke checks** passed at **06:40 UTC**, with no runtime/storage errors. Exact source comparison confirms all pre-rig gameplay logic and the cable/claw/frame/input/save tail are unchanged; art-loading paths and contract are unchanged.
- Actual swing/drop/loaded-reel captures cover Classic, Sky and Cavern at 1100×580, 844×390, 320×568 and 393×851. Visually reviewed enlarged Classic/Cavern rigs, Sky desktop, Cavern phone, Classic landscape, and blocked-art fallback. Artifacts/backups/logs/context: ignored `.dream-loop/connection-v2/`. No commits, physics, score, controls, maps, prices or save-schema changes. Self-review only; physical-device and Safari/Firefox acceptance remain manual.

### Manual acceptance

- Play early, middle, and late mines without upgrades, then compare strength/book routes and purchases. Human balance and strategy still need playtesting; a smoke check is not a winnability guarantee.
- Aim around rocks, detonate TNT, intercept both pigs, and compare the same mine before/after rotating the device.
- Use an actual touchscreen and keyboard; check tiny diamonds, value labels, dialog scrolling, focus rings, and 44-pixel controls.
- Listen to the sound mix and optional music on speakers/headphones; browser synthesis checks do not establish audibility or a pleasing mix.
- Block IndexedDB, reopen the browser on the same origin, and check saves on Safari/Firefox and private browsing.
- Verify reduced motion and mobile safe-area positioning on physical devices. The game is standalone: there is no Play.fun widget/SDK; the visual eight-percent inset is not a guarantee of clearance for an actual embedding bar, and the spatial aiming field does not provide a nonvisual gameplay mode.
