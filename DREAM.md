# Dream Loop

Act as a premium game designer. Build a complete, highly-polished HTML5 2D Gold Miner game.

[PHASE 1: DREAM TARGET]
Generate an ultra-polished, highly cinematic concept art screenshot of a subterranean gold-mining cavern before writing code.

- Visual Theme: Grim, atmospheric underground mine shaft illuminated by a single glowing lantern on the miner's cart.
- Style Reference: "Spelunky 2" or "SteamWorld Dig" but with a realistic, high-fidelity aesthetic.
- Details for Image Gen: Volumetric light beams from the lantern, detailed cracked stone textures, shimmering veins of raw gold reflecting light, dusty atmospheric particles, and a heavy, textured steel claw hook.

[PHASE 2: BUILD CONSTRAINTS (HTML5 CANVAS)]
Build the game using pure JavaScript and a single 2D HTML5 Canvas element.

- Performance: Must run rock-solid at >60fps with a requestAnimationFrame loop.
- Asset Rule: Do not download external assets. Generate all AAA textures, glowing gold shaders, rocky surfaces, and dirt backdrops procedurally using canvas gradients, noise patterns, and mathematical functions.

[PHASE 3: POLISH & CRITIC CRITERIA]
The AI Critic must reject iterations until the live canvas rendering matches the atmospheric fidelity of the Phase 1 dreamed screenshot. Specifically evaluate and enforce:

1. Juicy Hook Physics: The mining claw must sway realistically using a smooth pendulum sine wave. When launched, draw a detailed, segmented steel chain or tension rope (not a single flat line). On reel-in, apply inertia—heavy gold slows the reel significantly and causes the rope to tauten/vibrate.
2. Shimmer & Lighting: Gold nuggets must have a pulsing glow effect using radial canvas gradients and 'lighter' globalCompositeOperation. The background should feature a vignette (darkened edges) to simulate depth.
3. Particle Debris: When the claw strikes an object, emit a burst of stone fragments or sparkling gold dust that obeys gravity, drops down, and fades out over time (alpha decay).
4. Visual Juice: Add a violent screen shake when a massive gold nugget is successfully hauled into the cart, accompanied by floating text "+$500" that drifts upward and fades out.

[PHASE 4: UI LAYER – CINEMATIC HUD]
Top-left panel (wooden / metallic plaque style):
- Current Score: large bold gold text with subtle metallic shine + number roll-up animation when gold is banked
- Target Score: smaller text underneath, with a thin progress bar that fills from left to right in gold as the player approaches the target
- Small hourglass icon + remaining time (turns red and pulses when under 15 seconds)

Top-right:
- Settings gear icon (opens a small modal)
  - Sound On/Off toggle
  - Music On/Off toggle
  - Vibration / Screen shake intensity
- Any other global options live only inside Settings (no floating “Sound off” button)

Bottom-right action bar (horizontal row of item buttons):
- Dynamite (shows remaining charges, e.g. “3”)
- Strength Drink / Power Potion
- Magnet / Claw Upgrade
- Binoculars / Reveal
- (leave space for 1–2 more future items)

Each action button:
- Clear icon + remaining count badge
- Disabled (greyed + locked) when count = 0
- Press feedback: slight scale bounce + short particle burst
- Keyboard shortcuts optional (1–4 or Q/E)

Visual style note:
- Match the grim subterranean theme of the main game (not the bright cartoon style of the second screenshot)
- Use dark metal / wood frames with gold accents so the HUD feels premium and integrated with the lantern-lit cavern

[GAMEPLAY CONTROLS & CONTENT]

- Controls: Press DOWN arrow or Click to launch the swaying claw.
- Scene: Miner cart anchored at the top center. The subterranean field below is populated with procedurally generated rocks (worthless/heavy), small shiny gold nuggets (fast reel), massive raw gold chunks (slow reel), and ticking TNT barrels (explosive blast radius if touched).
- Interface: Clean, cinematic UI overlaid on the canvas tracking Target Score, Current Score, and a 60-second Countdown Timer.

Do not ask questions. Execute the loops until the critic verifies a stunning, AAA-polished presentation. Go!
