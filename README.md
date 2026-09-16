# Gold Mining

A browser game with local progress saving through Dexie.js and IndexedDB. Serve this directory for reliable browser storage:

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000. No install or build step is required. Every texture is painted at runtime on Canvas 2D: `cavern-art.js` draws the rock, strata, gold veins, and lantern light, and `game.js` draws the rig, objects, and effects. No external assets are downloaded, and the UI uses system fonts (Georgia/Arial) so it works fully offline.

## Controls

- **Down arrow / Space / Drop hook / tap the mine:** launch the automatically swinging hook.
- **D / Dynamite:** destroy the object currently being reeled in. Requires a purchased charge.
- **Magnetic claw:** click its button below the mine to arm it while the claw is swinging, then launch. That launch grabs small, medium, and large gold from up to 24 pixels further away and consumes the charge.
- **Diamond book / Strength drink:** the field buttons show what you carry. Clicking the book reveals every treasure's payout for six seconds; the 1.5× diamond bonus and the doubled pulling speed apply for the whole mine without any click.
- **P / Escape / Pause:** pause or resume. Switching browser tabs automatically pauses.
- **Sound:** enable optional synthesized effects.

Every mine has a 60-second limit. Only treasure returned to the winch before time expires counts. Larger gold and rocks take longer to retrieve. Clearing every object also ends the round.

**TNT barrels:** red barrels marked TNT, each with a lit fuse, are scattered among the treasure. Mines 1–4 contain one; another is added every four mines, up to six. Touching a barrel with the hook detonates it underground immediately and returns the hook empty. Each explosion destroys objects touching its 120-pixel blast radius, including gold, rocks, gems, diamonds, and mystery bags. Nearby TNT triggers chain reactions. Destroyed items award no points; banked money and purchased dynamite are unaffected.

**Pigs:** animated pigs patrol horizontally at a fixed depth, turn at the mine edges, and stop moving when hooked. Regular pigs move at 65 pixels/second, pull as quickly as diamonds, and pay just $10—even in deeper mines. Patrol counts are rolled per mine: 0–1 pig in mines 1–5, 0–2 in mines 6–10, and 0–3 from mine 11 on. The roll is seeded by the mine, so a level always loads the same guard detail.

**Diamond-mouth pigs:** from mine 10, a faster pig (150 pixels/second) carries a visible sparkling diamond, with 0–1 per mine; from mine 20, 0–2. Each pays $10 plus the current mine's full diamond value. The diamond book adds 50% to only the diamond portion, rounded to whole dollars. TNT destroys either pig without awarding points. Patrols freeze while paused and restore from the saved timer; existing treasure and barrel IDs are preserved.

Your available money must meet the level goal. On success, that goal is deducted; the surplus carries into the shop and counts toward the next goal. Shop purchases spend that surplus. Prices scale with the upcoming mine's goal (see Economy below). Dynamite persists until used, with purchases limited to three held charges; strength drinks (double retrieval speed) and diamond books (1.5× diamond value) last for the next mine. Retry restores the current mine and its starting cash, without refunding dynamite already used.

## Saved progress

Dexie 4.0.11 is bundled locally in `vendor/` with its Apache-2.0 license; saving does not require a CDN or account. One expedition is stored in the `GoldMining` IndexedDB database.

- Autosaves every second during play, after treasure delivery, purchases, dynamite use, level transitions, and pause/resume.
- Restores the mine, collected objects, in-flight hook/catch, remaining time, money, supplies (including a packed magnetic claw and whether it was armed), and sound preference. Reloaded active games open paused; shop, loss, and victory screens reopen as they were.
- Starting a new expedition after victory replaces the previous save.
- Hiding or leaving the page attempts a final save. Abrupt termination can lose progress since the last completed write; browser shutdown writes are not guaranteed.
- Saves belong to this browser profile and site origin (including port). Clearing site data deletes them; private browsing may discard them. Use one game tab at a time; simultaneous tabs can overwrite each other’s progress.
- If storage is unavailable or save data is invalid, a warning appears and gameplay remains available. Existing invalid data is not overwritten. Clear this site's IndexedDB data to reset it.

Direct `file://` storage behavior varies between browsers. Prefer the local server above.

## The expedition

| Mine | Name | Goal |
| --- | --- | ---: |
| 1 | Sunset Creek | $600 |
| 2 | Copper Hollow | $675 |
| 3 | Old Pine Quarry | $750 |
| 4 | Emerald Basin | $850 |
| 5 | Dusty Ridge | $950 |
| 6 | Moonstone Cavern | $1,050 |
| 7 | Diamond Gulch | $1,150 |
| 8 | Lost Prospector | $1,250 |
| 9 | Kings beneath the Hill | $1,350 |
| 10 | The Golden Heart | $1,450 |
| 11 | Amber Crossing | $1,550 |
| 12 | Silverroot Tunnel | $1,650 |
| 13 | Jade Falls | $1,775 |
| 14 | Crimson Chasm | $1,900 |
| 15 | Sapphire Springs | $2,025 |
| 16 | Obsidian Reach | $2,150 |
| 17 | Opal Observatory | $2,275 |
| 18 | Thunderstone Pit | $2,400 |
| 19 | Frostbite Vein | $2,525 |
| 20 | The Sunken Treasury | $2,650 |
| 21 | Dragonbone Depths | $2,775 |
| 22 | Starlight Shaft | $2,900 |
| 23 | Royal Amethyst | $3,025 |
| 24 | Emberfall Mine | $3,150 |
| 25 | Crystal Labyrinth | $3,275 |
| 26 | The Forgotten Vault | $3,400 |
| 27 | Phoenix Hollow | $3,525 |
| 28 | Celestial Quarry | $3,650 |
| 29 | Midas Descent | $3,775 |
| 30 | The Eternal Fortune | $3,900 |
| 31 | Aurora Passage | $4,050 |
| 32 | Garnet Gorge | $4,200 |
| 33 | The Brass Citadel | $4,350 |
| 34 | Silversong Cavern | $4,500 |
| 35 | Ruby Eclipse | $4,650 |
| 36 | Titanstone Tunnel | $4,800 |
| 37 | The Hidden Dynasty | $4,950 |
| 38 | Prismatic Depths | $5,100 |
| 39 | Cinder Crown | $5,250 |
| 40 | The Platinum Gate | $5,400 |
| 41 | Astral Rift | $5,550 |
| 42 | Black Pearl Basin | $5,700 |
| 43 | The Gilded Abyss | $5,850 |
| 44 | Diamond Tempest | $6,000 |
| 45 | Sovereign Shaft | $6,150 |
| 46 | The Ancient Hoard | $6,300 |
| 47 | Infinity Vein | $6,450 |
| 48 | Dawnfire Vault | $6,600 |
| 49 | The Last Bonanza | $6,750 |
| 50 | Crown of the Earth | $6,900 |
| 51 | Beyond the Crown | $7,050 |
| 52 | Topaz Terrace | $7,200 |
| 53 | Whispering Granite | $7,350 |
| 54 | The Jade Stairway | $7,500 |
| 55 | Mercury Hollow | $7,650 |
| 56 | Scarlet Geode | $7,800 |
| 57 | The Buried Beacon | $7,950 |
| 58 | Lapis Landing | $8,100 |
| 59 | Stormglass Cavern | $8,250 |
| 60 | The Sapphire Throne | $8,400 |
| 61 | Quartz Frontier | $8,550 |
| 62 | Verdant Fault | $8,700 |
| 63 | The Bronze Cathedral | $8,850 |
| 64 | Moonfire Basin | $9,000 |
| 65 | Tourmaline Trail | $9,150 |
| 66 | The Silent Foundry | $9,300 |
| 67 | Sunstone Summit | $9,450 |
| 68 | Echoing Onyx | $9,600 |
| 69 | The Hidden Horizon | $9,750 |
| 70 | Treasury of Tides | $9,900 |
| 71 | Peridot Passage | $10,050 |
| 72 | The Copper Constellation | $10,200 |
| 73 | Fallen Star Quarry | $10,350 |
| 74 | Rosegold Ravine | $10,500 |
| 75 | The Marble Monolith | $10,650 |
| 76 | Twilight Agate | $10,800 |
| 77 | The Hollow Mountain | $10,950 |
| 78 | Golden Mirage | $11,100 |
| 79 | The Velvet Vein | $11,250 |
| 80 | Citadel of Crystals | $11,400 |
| 81 | The Deepward Road | $11,550 |
| 82 | Cobalt Cathedral | $11,700 |
| 83 | The Emerald Engine | $11,850 |
| 84 | Radiant Ruins | $12,000 |
| 85 | The Diamond Delta | $12,150 |
| 86 | Fireopal Fortress | $12,300 |
| 87 | The Argent Archive | $12,450 |
| 88 | Midnight Malachite | $12,600 |
| 89 | The Splintered Sun | $12,750 |
| 90 | Palace of Pyrite | $12,900 |
| 91 | The Worldroot Well | $13,050 |
| 92 | Heavenstone Hollow | $13,200 |
| 93 | The Ruby Reliquary | $13,350 |
| 94 | Everglow Excavation | $13,500 |
| 95 | The Sovereign Seam | $13,650 |
| 96 | Stardust Sanctuary | $13,800 |
| 97 | The Boundless Bonanza | $13,950 |
| 98 | Fortune’s Final Frontier | $14,100 |
| 99 | The Hundredth Door | $14,250 |
| 100 | Heart of a Hundred Mines | $14,400 |

Maps use distinct fixed seeds, with additional valuables and rocks through mine 10. Mines 11–100 retain mine 10's treasure and rock counts to avoid crowding. The 60-second limit and listed goals remain unchanged.

## Economy and risk versus reward

- **Goal coverage:** stationary treasure is valued so the goal requires 26% of its total in mine 1, 36% by mine 15, 46% by mine 50, and 52% from mine 100 on. That supplies roughly 3.85× the opening goal and 1.92× late goals, allowing missed catches and some TNT losses without requiring a perfect clear. Goals themselves rise gently, from $600 to $14,400 across the 100 mines. This is a value budget, not a guarantee that every layout is equally accessible in 60 seconds.
- **Treasure roles:** pre-scaling value weights are small gold 175 (pulled at weight 1), medium gold 450 (2), large gold 950 (3.6), diamonds 650 (0.8), and gems 325 (0.9). Large gold pays more per catch but retrieves slowly; small diamonds offer fast returns at the cost of harder aiming. The winch now ramps up to speed over roughly a quarter second instead of snapping there, so a heavy catch feels like it drags the reel down. Actual payouts are scaled to the mine's budget and rounded to whole dollars.
- **Mystery bags:** seeded weights range from 100–700 in steps of 100 before the same scaling. They offer uncertain upside, rather than routinely outpaying a diamond. Normalization prevents a poor bag roll from reducing the mine's total treasure budget.
- **Hazards and optional rewards:** rocks stay $15, regular pigs $10, and TNT $0. Diamond-mouth pigs pay the scaled diamond value plus $10, but are excluded from the stationary budget: moving targets offer surplus rather than being required by the budget. More hazards in later mines make protecting treasure and choosing a clear hook path matter.
- **Upgrade opportunity cost:** dynamite costs 3.5% of the next goal (minimum $100), strength 12% (minimum $200), the diamond book 18% (minimum $300), and the magnetic claw 7% (minimum $150), rounded upward to $25 steps. Strength rewards heavy-gold routes; the book gives 50% extra diamond value and rewards multiple precision catches instead of tripling easy late-game money. The claw converts one launch into a wider grab, which pays off when gold sits just past the claw's reach. Keeping cash remains a valid choice.
- **Stockpiling:** at most three dynamite charges may be held when buying; charges still persist across mines. Only one magnetic claw can be carried, and launching consumes it, so it is a per-mine decision rather than an inventory. Legacy saves above the dynamite cap keep their inventory but cannot buy more until below three.
- **Save compatibility:** layouts, IDs, collected/destroyed state, bank, and already-earned haul are preserved. On reload, remaining treasure (including an in-flight catch) uses the revised payouts, and owned books use the revised 1.5× effect; no currency is retroactively removed.

Existing treasure layouts and object IDs remain unchanged for saved-game compatibility; TNT barrels are appended to each map. Destroyed objects and detonated barrels use the existing saved removal state. Patrol counts and positions are now rolled per mine, so a save written by an earlier build can fail validation and is left untouched rather than rewritten. Old level-10, level-30, and level-50 victory saves open the shop for mine 11, mine 31, and mine 51 respectively, preserving surplus without deducting the completed goal again.

## Verification

Completed checks:

- Full-viewport shell UI: `node --check game.js` passed. The page is now a single `#game-shell` filling the viewport (flex column: dashboard, mine, controls); the topbar, intro, field-guide, and footer were removed, and the fullscreen button and its Fullscreen API wiring were removed with it. The sound toggle lives in the dashboard beside Pause. `updateHUD` no longer writes to the removed level/summary elements. Headless Chromium checks at 1280×800, 1100×580, and 390×720 confirmed the shell fills the viewport exactly, playthrough works, and there are no console errors at ~60fps.
- Canvas presentation pass: procedural lumpy nugget/boulder silhouettes with seeded facets, stone fissures on rocks, twinkling facet glints on gold, and lantern-side gradient rim lighting on gold and rock outlines. Verified live via headless screenshots (light, glow, chain tension, catch popups, gold-dust bursts, screen shake) with no page errors.

- Cavern art module: the generic rock face, strata, gold veins, lantern halo/beam, and per-object stone surfaces moved into the new `cavern-art.js` (`paintBackground`, `paintLight`, `surface`), and the quarter-res bloom pass was deleted. `node --check game.js`, `node --check cavern-art.js`, and `git diff --check` passed. Headless Chromium runs covering the shop, arming and firing the claw, dynamite use, a mid-mine reload, and a 390×844 portrait load reported no page or console errors and no horizontal overflow; in portrait the field is reprojected rather than cropped, and the HUD hint no longer collides with the location label.
- Economy retune: goals now run $600 to $14,400 and stationary treasure covers 26% / 36% / 46% / 52% of a mine's budget at mines 1 / 15 / 50 / 100, which is 3.85×, 2.78×, 2.17×, and 1.92× the goal. Verified by re-deriving the level table and `targetShare` from `game.js`: 100 monotonic goals matching the table above and the stated coverage at those four mines. The 90/100 bot result listed above predates this retune and has not been re-measured.
- Magnetic claw: a live headless run bought dynamite and the claw in the shop, armed the claw in the field, launched (the charge was consumed and the button returned to 0 and disabled), and spent dynamite on a catch with the expected count; no console errors. A pre-magnet save injected into IndexedDB still loads, restoring bank, haul, and timer into the paused dialog with no storage warning. The wider grab radius and the arm glow are captured in screenshots but were not measured in play.
- Patrol rolls: `makeMap` extracted from `game.js` and run over all 100 mines (`.dream-loop/pigs.mjs`) — every map places identically on repeat calls, pig counts stay within 0–1 / 0–2 / 0–3 by tier, no diamond pig appears before mine 10, diamond pigs stay within 0–1 / 0–2, TNT counts match the unchanged formula, and no hazard overlaps treasure or leaves the bounds. Counts spread across 0/1/2/3 pigs as 28/27/20/25 levels and 0/1/2 diamond pigs as 38/37/25 levels, with speeds 65 and 150 pixels/second. Patrolling movement and the faster interception in play remain unverified.

- Economy: `node --check game.js` and `git diff --check` passed. A temporary Node VM comparison verified all 100 deterministic treasure budgets, value roles, integer rewards, diamond-pig payouts, monotonic shop prices, actual purchase deductions, invalid/duplicate/unaffordable purchase rejection, pack limits, revised book scoring, and legacy save acceptance. All 100 layouts, IDs, and radii matched the pre-balance version.
- A simple ray-aiming bot starting each mine with zero bank and no upgrades won 90/100 before and after tuning; all first 20 mines passed after tuning. Remaining failures were mines 23, 25, 35, 57, 75, 79, 82, 84, 85, and 88. This smoke simulation is not a human difficulty benchmark or proof of universal winnability; those layouts need focused playtesting.

- Pigs: syntax and whitespace checks passed. A temporary Node VM check passed across all 100 maps for deterministic spawning, expected pig counts, initial non-overlap, scaled diamond rewards, horizontal bounds/reversal and fixed depth, timer-based position restoration, pause, capture/retrieval, diamond-book scoring, TNT destruction, and legacy save validation. Actual browser animation and persistent reload remain unverified. This covers the pre-roll counts, not the randomised patrols below.

- TNT: `node --check game.js` and `git diff --check` passed. A temporary Node VM check passed for all 100 deterministic, non-overlapping maps and expected barrel counts; hook-triggered detonation, three-barrel chains, nearby treasure destruction, outside-radius survival, empty-hook return state, and unchanged money/dynamite. Browser visuals and TNT save/reload remain unverified.

- `node --check game.js` passed.
- A headless Node VM check with DOM/Canvas stubs passed: all ten maps have non-overlapping treasure and enough available value; hook collision/retrieval, scoring, surplus, shop deductions, duplicate-purchase protection, timeout/retry, and final victory work.
- Save/load checks passed using the bundled Dexie with an in-memory IndexedDB implementation: mid-catch reload, paused timer, scoring after resume, shop purchases, next-mine restoration, loss/retry, victory/restart, invalid-data rejection, and storage-unavailable fallback. Verification dependencies were installed only in a temporary directory.
- The 100-mine expansion passed syntax and headless checks for unique names, deterministic, non-overlapping, in-bounds maps with sufficient treasure and increasing goals; all 100 level transitions and saves; legacy level-10/30/50 victory migration; and level-100 HUD, victory restoration/restart.
- Actual browser rendering, persistent storage across browser restarts, touch interaction, audio, and difficulty balance remain unverified.

Manual browser checklist:

- Start a mine; verify the hook swings without directional input.
- Drop using the keyboard, button, and touchscreen; verify repeated drops cannot interrupt a retrieval.
- Compare a rock's slow return with a diamond's quick return.
- Pause/resume and switch tabs; confirm the countdown is preserved.
- Let time expire below the goal; retry the same map with starting cash restored.
- Meet the goal and finish the round; confirm only surplus remains in the shop.
- Buy each supply; confirm displayed prices match deductions and grow with the next goal, with disabled unaffordable/duplicate purchases and correct next-mine effects. Verify a fourth dynamite purchase is blocked.
- Play mines 1, 10, 20, 50, and 100 with no upgrades; compare heavy-gold and precision-diamond strategies, then repeat with strength or a book and assess whether the purchase earns back its cost.
- Focus playtests on mines 23, 25, 35, 57, 75, 79, 82, 84, 85, and 88; assess clear hook routes, pig interference, TNT losses, and whether the 60-second target is fair.
- Buy the magnetic claw; arm it and confirm the button lights up, that launching consumes it, and that gold just outside normal reach is pulled in.
- Click the diamond book in the field; confirm payouts appear above each object for six seconds and fade out.
- Load the mine on a tall phone; confirm the whole field is visible without cropping and the claw grabs what it appears to touch.
- Use dynamite on a rock; confirm no score is awarded and one charge is consumed.
- Touch a TNT barrel at its edge/corner; confirm immediate underground explosion, visible debris, empty-hook return, and no points or dynamite charge used.
- Detonate nearby barrels; confirm the chain destroys adjacent gold, rocks, diamonds, gems, and bags but leaves distant objects intact.
- Reload after a blast; confirm destroyed treasure/barrels stay gone and the hook resumes empty.
- Destroy the last objects with TNT; confirm the round ends when the empty hook returns.
- Compare early and later mines; confirm barrel counts increase from one to six and treasure remains reachable.
- Watch pigs run and turn at the edges at a fixed depth; pause/resume and reload to check patrol restoration. Confirm the mix varies between neighbouring mines.
- Hook a regular pig, including while it crosses in front of treasure; verify fast retrieval, stopped running, and exactly $10 awarded.
- In mine 10 or later, catch a faster diamond-mouth pig; verify the diamond value plus $10 and that it outruns the plain pigs. With a diamond book, only the diamond portion gains 50%, rounded to whole dollars.
- Reload with a pig on the hook; verify it stays caught and pays once after retrieval. Detonate TNT beside pigs; verify they disappear without points.
- Complete mines 10, 30, and 50 and continue to mines 11, 31, and 51; complete mine 100 and start a fresh expedition.
- Load old level-10, level-30, and level-50 victory saves; confirm the shop opens with the same surplus.
- Check mobile portrait layout, keyboard focus, dialog focus containment, and sound toggle.
- Reload while retrieving treasure; confirm the same catch, money, and remaining time restore paused.
- Buy supplies and reload in the shop; confirm purchases and deductions persist without duplication.
- Close and reopen the browser on the same origin; resume the saved expedition.
- Block IndexedDB; confirm the warning appears and the game still runs.

The graphics use native Canvas 2D, with all cavern rock, light, and object surfaces generated procedurally in `cavern-art.js` and no downloaded assets. UI, controls, and shop use semantic HTML. The page renders as one full-viewport game shell (dashboard HUD above the canvas, action controls below); there is no separate topbar, intro, field-guide, footer, or fullscreen mode. In portrait viewports the field keeps every object in frame by reprojecting it vertically instead of cropping. The spatial aiming playfield is visual; a nonvisual gameplay mode is not included.
