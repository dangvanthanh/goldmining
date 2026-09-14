# Gold Mining

A browser game with local progress saving through Dexie.js and IndexedDB. Serve this directory for reliable browser storage:

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000. No install or build step is required. Google Fonts is optional; system fonts work offline.

## Controls

- **Down arrow / Space / Drop hook / tap the mine:** launch the automatically swinging hook.
- **D / Dynamite:** destroy the object currently being reeled in. Requires a purchased charge.
- **P / Escape / Pause:** pause or resume. Switching browser tabs automatically pauses.
- **Sound:** enable optional synthesized effects.

Every mine has a 60-second limit. Only treasure returned to the winch before time expires counts. Larger gold and rocks take longer to retrieve. Clearing every object also ends the round.

**TNT barrels:** red barrels marked TNT are scattered among the treasure. Mines 1–4 contain one; another is added every four mines, up to six. Touching a barrel with the hook detonates it underground immediately and returns the hook empty. Each explosion destroys objects touching its 120-pixel blast radius, including gold, rocks, gems, diamonds, and mystery bags. Nearby TNT triggers chain reactions. Destroyed items award no points; banked money and purchased dynamite are unaffected.

**Pigs:** animated pink pigs patrol horizontally at a fixed depth, turn at the mine edges, and stop moving when hooked. Regular pigs move at 65 pixels/second, pull as quickly as diamonds, and pay just $10—even in deeper mines. Mines 1–5 have one, mines 6–10 have two, and later mines have three.

**Diamond-mouth pigs:** from mine 10, a faster pig (110 pixels/second) carries a visible sparkling diamond; from mine 20, there are two. Each pays $10 plus the current mine's full diamond value. The diamond book adds 50% to only the diamond portion, rounded to whole dollars. TNT destroys either pig without awarding points. Patrols freeze while paused and restore from the saved timer; existing treasure and barrel IDs are preserved.

Your available money must meet the level goal. On success, that goal is deducted; the surplus carries into the shop and counts toward the next goal. Shop purchases spend that surplus. Prices scale with the upcoming mine's goal (see Economy below). Dynamite persists until used, with purchases limited to three held charges; strength drinks (double retrieval speed) and diamond books (1.5× diamond value) last for the next mine. Retry restores the current mine and its starting cash, without refunding dynamite already used.

## Saved progress

Dexie 4.0.11 is bundled locally in `vendor/` with its Apache-2.0 license; saving does not require a CDN or account. One expedition is stored in the `GoldMining` IndexedDB database.

- Autosaves every second during play, after treasure delivery, purchases, dynamite use, level transitions, and pause/resume.
- Restores the mine, collected objects, in-flight hook/catch, remaining time, money, supplies, and sound preference. Reloaded active games open paused; shop, loss, and victory screens reopen as they were.
- Starting a new expedition after victory replaces the previous save.
- Hiding or leaving the page attempts a final save. Abrupt termination can lose progress since the last completed write; browser shutdown writes are not guaranteed.
- Saves belong to this browser profile and site origin (including port). Clearing site data deletes them; private browsing may discard them. Use one game tab at a time; simultaneous tabs can overwrite each other’s progress.
- If storage is unavailable or save data is invalid, a warning appears and gameplay remains available. Existing invalid data is not overwritten. Clear this site's IndexedDB data to reset it.

Direct `file://` storage behavior varies between browsers. Prefer the local server above.

## The expedition

| Mine | Name | Goal |
| --- | --- | ---: |
| 1 | Sunset Creek | $650 |
| 2 | Copper Hollow | $1,000 |
| 3 | Old Pine Quarry | $1,400 |
| 4 | Emerald Basin | $1,800 |
| 5 | Dusty Ridge | $2,200 |
| 6 | Moonstone Cavern | $2,600 |
| 7 | Diamond Gulch | $3,000 |
| 8 | Lost Prospector | $3,400 |
| 9 | Kings beneath the Hill | $3,900 |
| 10 | The Golden Heart | $4,500 |
| 11 | Amber Crossing | $5,000 |
| 12 | Silverroot Tunnel | $5,500 |
| 13 | Jade Falls | $6,000 |
| 14 | Crimson Chasm | $6,500 |
| 15 | Sapphire Springs | $7,000 |
| 16 | Obsidian Reach | $7,500 |
| 17 | Opal Observatory | $8,000 |
| 18 | Thunderstone Pit | $8,500 |
| 19 | Frostbite Vein | $9,000 |
| 20 | The Sunken Treasury | $9,500 |
| 21 | Dragonbone Depths | $10,000 |
| 22 | Starlight Shaft | $10,500 |
| 23 | Royal Amethyst | $11,000 |
| 24 | Emberfall Mine | $11,500 |
| 25 | Crystal Labyrinth | $12,000 |
| 26 | The Forgotten Vault | $12,500 |
| 27 | Phoenix Hollow | $13,000 |
| 28 | Celestial Quarry | $13,500 |
| 29 | Midas Descent | $14,000 |
| 30 | The Eternal Fortune | $14,500 |
| 31 | Aurora Passage | $15,000 |
| 32 | Garnet Gorge | $15,500 |
| 33 | The Brass Citadel | $16,000 |
| 34 | Silversong Cavern | $16,500 |
| 35 | Ruby Eclipse | $17,000 |
| 36 | Titanstone Tunnel | $17,500 |
| 37 | The Hidden Dynasty | $18,000 |
| 38 | Prismatic Depths | $18,500 |
| 39 | Cinder Crown | $19,000 |
| 40 | The Platinum Gate | $19,500 |
| 41 | Astral Rift | $20,000 |
| 42 | Black Pearl Basin | $20,500 |
| 43 | The Gilded Abyss | $21,000 |
| 44 | Diamond Tempest | $21,500 |
| 45 | Sovereign Shaft | $22,000 |
| 46 | The Ancient Hoard | $22,500 |
| 47 | Infinity Vein | $23,000 |
| 48 | Dawnfire Vault | $23,500 |
| 49 | The Last Bonanza | $24,000 |
| 50 | Crown of the Earth | $24,500 |
| 51 | Beyond the Crown | $25,000 |
| 52 | Topaz Terrace | $25,500 |
| 53 | Whispering Granite | $26,000 |
| 54 | The Jade Stairway | $26,500 |
| 55 | Mercury Hollow | $27,000 |
| 56 | Scarlet Geode | $27,500 |
| 57 | The Buried Beacon | $28,000 |
| 58 | Lapis Landing | $28,500 |
| 59 | Stormglass Cavern | $29,000 |
| 60 | The Sapphire Throne | $29,500 |
| 61 | Quartz Frontier | $30,000 |
| 62 | Verdant Fault | $30,500 |
| 63 | The Bronze Cathedral | $31,000 |
| 64 | Moonfire Basin | $31,500 |
| 65 | Tourmaline Trail | $32,000 |
| 66 | The Silent Foundry | $32,500 |
| 67 | Sunstone Summit | $33,000 |
| 68 | Echoing Onyx | $33,500 |
| 69 | The Hidden Horizon | $34,000 |
| 70 | Treasury of Tides | $34,500 |
| 71 | Peridot Passage | $35,000 |
| 72 | The Copper Constellation | $35,500 |
| 73 | Fallen Star Quarry | $36,000 |
| 74 | Rosegold Ravine | $36,500 |
| 75 | The Marble Monolith | $37,000 |
| 76 | Twilight Agate | $37,500 |
| 77 | The Hollow Mountain | $38,000 |
| 78 | Golden Mirage | $38,500 |
| 79 | The Velvet Vein | $39,000 |
| 80 | Citadel of Crystals | $39,500 |
| 81 | The Deepward Road | $40,000 |
| 82 | Cobalt Cathedral | $40,500 |
| 83 | The Emerald Engine | $41,000 |
| 84 | Radiant Ruins | $41,500 |
| 85 | The Diamond Delta | $42,000 |
| 86 | Fireopal Fortress | $42,500 |
| 87 | The Argent Archive | $43,000 |
| 88 | Midnight Malachite | $43,500 |
| 89 | The Splintered Sun | $44,000 |
| 90 | Palace of Pyrite | $44,500 |
| 91 | The Worldroot Well | $45,000 |
| 92 | Heavenstone Hollow | $45,500 |
| 93 | The Ruby Reliquary | $46,000 |
| 94 | Everglow Excavation | $46,500 |
| 95 | The Sovereign Seam | $47,000 |
| 96 | Stardust Sanctuary | $47,500 |
| 97 | The Boundless Bonanza | $48,000 |
| 98 | Fortune’s Final Frontier | $48,500 |
| 99 | The Hundredth Door | $49,000 |
| 100 | Heart of a Hundred Mines | $49,500 |

Maps use distinct fixed seeds, with additional valuables and rocks through mine 10. Mines 11–100 retain mine 10's treasure and rock counts to avoid crowding. The 60-second limit and listed goals remain unchanged.

## Economy and risk versus reward

- **Goal coverage:** stationary treasure is valued so the goal requires 24% of its total in mine 1, increasing linearly to 52% in mine 20 and staying there. This supplies roughly 4.17× the opening goal and 1.92× late goals, allowing missed catches and some TNT losses without requiring a perfect clear. This is a value budget, not a guarantee that every layout is equally accessible in 60 seconds.
- **Treasure roles:** pre-scaling value weights are small gold 140, medium gold 350, large gold 800, diamonds 700, and gems 300. Large gold pays more per catch but retrieves slowly; small diamonds offer fast returns at the cost of harder aiming. Actual payouts are scaled to the mine's budget and rounded to whole dollars.
- **Mystery bags:** seeded weights range from 100–700 in steps of 100 before the same scaling. They offer uncertain upside, rather than routinely outpaying a diamond. Normalization prevents a poor bag roll from reducing the mine's total treasure budget.
- **Hazards and optional rewards:** rocks stay $15, regular pigs $10, and TNT $0. Diamond-mouth pigs pay the scaled diamond value plus $10, but are excluded from the stationary budget: moving targets offer surplus rather than being required by the budget. More hazards in later mines make protecting treasure and choosing a clear hook path matter.
- **Upgrade opportunity cost:** dynamite costs 3.5% of the next goal (minimum $100), strength 12% (minimum $200), and the diamond book 18% (minimum $300), rounded upward to $25 steps. Strength rewards heavy-gold routes; the book gives 50% extra diamond value and rewards multiple precision catches instead of tripling easy late-game money. Keeping cash remains a valid choice.
- **Stockpiling:** at most three dynamite charges may be held when buying; charges still persist across mines. Legacy saves above the cap keep their inventory but cannot buy more until below three.
- **Save compatibility:** layouts, IDs, collected/destroyed state, bank, and already-earned haul are preserved. On reload, remaining treasure (including an in-flight catch) uses the revised payouts, and owned books use the revised 1.5× effect; no currency is retroactively removed.

Existing treasure layouts and object IDs remain unchanged for saved-game compatibility; TNT barrels are appended to each map. Destroyed objects and detonated barrels use the existing saved removal state. Old level-10, level-30, and level-50 victory saves open the shop for mine 11, mine 31, and mine 51 respectively, preserving surplus without deducting the completed goal again.

## Verification

Completed checks:

- Pirate UI refresh: `node --check game.js` and `git diff --check` passed. Headless Chromium checks passed for welcome/start, keyboard drop, mobile tap, pause/resume, saved reload/resume, dialog focus containment, and no horizontal overflow at 320px and 390px. Desktop and mobile screenshots reviewed. Ocean scenery, palm trees, pirate captain, parchment dialogs, and treasure/hazard guidance replace the prospector presentation; maps, economy, and save format are unchanged. Audio, actual-device touch, fullscreen, and all shop/result visual states still need manual review.

- Economy: `node --check game.js` and `git diff --check` passed. A temporary Node VM comparison verified all 100 deterministic treasure budgets, value roles, integer rewards, diamond-pig payouts, monotonic shop prices, actual purchase deductions, invalid/duplicate/unaffordable purchase rejection, pack limits, revised book scoring, and legacy save acceptance. All 100 layouts, IDs, radii, weights, and movement speeds matched the pre-balance version.
- A simple ray-aiming bot starting each mine with zero bank and no upgrades won 90/100 before and after tuning; all first 20 mines passed after tuning. Remaining failures were mines 23, 25, 35, 57, 75, 79, 82, 84, 85, and 88. This smoke simulation is not a human difficulty benchmark or proof of universal winnability; those layouts need focused playtesting.

- Pigs: syntax and whitespace checks passed. A temporary Node VM check passed across all 100 maps for deterministic spawning, expected pig counts, initial non-overlap, scaled diamond rewards, horizontal bounds/reversal and fixed depth, timer-based position restoration, pause, capture/retrieval, diamond-book scoring, TNT destruction, and legacy save validation. Actual browser animation and persistent reload remain unverified.

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
- Use dynamite on a rock; confirm no score is awarded and one charge is consumed.
- Touch a TNT barrel at its edge/corner; confirm immediate underground explosion, visible debris, empty-hook return, and no points or dynamite charge used.
- Detonate nearby barrels; confirm the chain destroys adjacent gold, rocks, diamonds, gems, and bags but leaves distant objects intact.
- Reload after a blast; confirm destroyed treasure/barrels stay gone and the hook resumes empty.
- Destroy the last objects with TNT; confirm the round ends when the empty hook returns.
- Compare early and later mines; confirm barrel counts increase from one to six and treasure remains reachable.
- Watch pigs run and turn at the edges at a fixed depth; pause/resume and reload to check patrol restoration.
- Hook a regular pig, including while it crosses in front of treasure; verify fast retrieval, stopped running, and exactly $10 awarded.
- In mine 10 or later, catch a faster diamond-mouth pig; verify the diamond value plus $10. With a diamond book, only the diamond portion gains 50%, rounded to whole dollars.
- Reload with a pig on the hook; verify it stays caught and pays once after retrieval. Detonate TNT beside pigs; verify they disappear without points.
- Complete mines 10, 30, and 50 and continue to mines 11, 31, and 51; complete mine 100 and start a fresh expedition.
- Load old level-10, level-30, and level-50 victory saves; confirm the shop opens with the same surplus.
- Check mobile portrait layout, keyboard focus, dialog focus containment, and sound toggle.
- Reload while retrieving treasure; confirm the same catch, money, and remaining time restore paused.
- Buy supplies and reload in the shop; confirm purchases and deductions persist without duplication.
- Close and reopen the browser on the same origin; resume the saved expedition.
- Block IndexedDB; confirm the warning appears and the game still runs.

The graphics use native Canvas 2D. UI, controls, and shop use semantic HTML. The spatial aiming playfield is visual; a nonvisual gameplay mode is not included.
