'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('mine'), ctx = canvas.getContext('2d');
  const W = 1100, H = 580, origin = { x: 550, y: 132 };
  // Art providers are interchangeable: paintBackground / paintLight / surface.
  const ART_PROVIDERS = { cavern: 'CavernArt', classic: 'ClassicArt' };
  let artName = 'cavern';
  try { const stored = localStorage.getItem('gm-art'); if (ART_PROVIDERS[stored]) artName = stored; } catch {}
  let art = window[ART_PROVIDERS[artName]];
  document.documentElement.dataset.art = artName;
  // The canvas always fills the viewport: the W×H field is stretched to the screen
  // (fit.sx/sy are device pixels per field unit) and sprites undo the stretch through
  // objectAspect, so treasure stays round and nothing is cropped or letterboxed.
  let objectAspect = 1, fit = { sx: 1, sy: 1, oy: 0 }, repaintTimer = 0, resized = false;
  const PORTRAIT = matchMedia('(max-aspect-ratio: 3/4)');
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // Cap the backing store near 4 MP so full-screen frames stay cheap.
    const dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(4e6 / (rect.width * rect.height)));
    canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
    // Tall phones keep the field between the score plaque and the tool bar; the art fills the rest.
    const top = PORTRAIT.matches ? document.querySelector('.plaque').getBoundingClientRect().bottom - rect.top + 10 : 0;
    const bottom = PORTRAIT.matches ? rect.bottom - document.querySelector('.hud-hint').getBoundingClientRect().top + 6 : 0;
    fit = { sx: canvas.width / W, sy: (rect.height - top - bottom) * dpr / H, oy: top * dpr };
    objectAspect = fit.sx / fit.sy;
    art.paintLight(cone, lampSpot());
    clearTimeout(repaintTimer);
    repaintTimer = setTimeout(() => paintBackground(level), resized ? 150 : 0);
    resized = true;
  }
  new ResizeObserver(resize).observe(canvas);
  const levels = [
    ['Sunset Creek', 600, 0], ['Copper Hollow', 675, 1], ['Old Pine Quarry', 750, 2],
    ['Emerald Basin', 850, 3], ['Dusty Ridge', 950, 4], ['Moonstone Cavern', 1050, 5],
    ['Diamond Gulch', 1150, 6], ['Lost Prospector', 1250, 7], ['Kings beneath the Hill', 1350, 8],
    ['The Golden Heart', 1450, 9], ['Amber Crossing', 1550, 10], ['Silverroot Tunnel', 1650, 11],
    ['Jade Falls', 1775, 12], ['Crimson Chasm', 1900, 13], ['Sapphire Springs', 2025, 14],
    ['Obsidian Reach', 2150, 15], ['Opal Observatory', 2275, 16], ['Thunderstone Pit', 2400, 17],
    ['Frostbite Vein', 2525, 18], ['The Sunken Treasury', 2650, 19], ['Dragonbone Depths', 2775, 20],
    ['Starlight Shaft', 2900, 21], ['Royal Amethyst', 3025, 22], ['Emberfall Mine', 3150, 23],
    ['Crystal Labyrinth', 3275, 24], ['The Forgotten Vault', 3400, 25], ['Phoenix Hollow', 3525, 26],
    ['Celestial Quarry', 3650, 27], ['Midas Descent', 3775, 28], ['The Eternal Fortune', 3900, 29],
    ['Aurora Passage', 4050, 30], ['Garnet Gorge', 4200, 31], ['The Brass Citadel', 4350, 32],
    ['Silversong Cavern', 4500, 33], ['Ruby Eclipse', 4650, 34], ['Titanstone Tunnel', 4800, 35],
    ['The Hidden Dynasty', 4950, 36], ['Prismatic Depths', 5100, 37], ['Cinder Crown', 5250, 38],
    ['The Platinum Gate', 5400, 39], ['Astral Rift', 5550, 40], ['Black Pearl Basin', 5700, 41],
    ['The Gilded Abyss', 5850, 42], ['Diamond Tempest', 6000, 43], ['Sovereign Shaft', 6150, 44],
    ['The Ancient Hoard', 6300, 45], ['Infinity Vein', 6450, 46], ['Dawnfire Vault', 6600, 47],
    ['The Last Bonanza', 6750, 48], ['Crown of the Earth', 6900, 49],
    ['Beyond the Crown', 7050, 50], ['Topaz Terrace', 7200, 51], ['Whispering Granite', 7350, 52],
    ['The Jade Stairway', 7500, 53], ['Mercury Hollow', 7650, 54], ['Scarlet Geode', 7800, 55],
    ['The Buried Beacon', 7950, 56], ['Lapis Landing', 8100, 57], ['Stormglass Cavern', 8250, 58],
    ['The Sapphire Throne', 8400, 59], ['Quartz Frontier', 8550, 60], ['Verdant Fault', 8700, 61],
    ['The Bronze Cathedral', 8850, 62], ['Moonfire Basin', 9000, 63], ['Tourmaline Trail', 9150, 64],
    ['The Silent Foundry', 9300, 65], ['Sunstone Summit', 9450, 66], ['Echoing Onyx', 9600, 67],
    ['The Hidden Horizon', 9750, 68], ['Treasury of Tides', 9900, 69], ['Peridot Passage', 10050, 70],
    ['The Copper Constellation', 10200, 71], ['Fallen Star Quarry', 10350, 72], ['Rosegold Ravine', 10500, 73],
    ['The Marble Monolith', 10650, 74], ['Twilight Agate', 10800, 75], ['The Hollow Mountain', 10950, 76],
    ['Golden Mirage', 11100, 77], ['The Velvet Vein', 11250, 78], ['Citadel of Crystals', 11400, 79],
    ['The Deepward Road', 11550, 80], ['Cobalt Cathedral', 11700, 81], ['The Emerald Engine', 11850, 82],
    ['Radiant Ruins', 12000, 83], ['The Diamond Delta', 12150, 84], ['Fireopal Fortress', 12300, 85],
    ['The Argent Archive', 12450, 86], ['Midnight Malachite', 12600, 87], ['The Splintered Sun', 12750, 88],
    ['Palace of Pyrite', 12900, 89], ['The Worldroot Well', 13050, 90], ['Heavenstone Hollow', 13200, 91],
    ['The Ruby Reliquary', 13350, 92], ['Everglow Excavation', 13500, 93], ['The Sovereign Seam', 13650, 94],
    ['Stardust Sanctuary', 13800, 95], ['The Boundless Bonanza', 13950, 96], ['Fortune’s Final Frontier', 14100, 97],
    ['The Hundredth Door', 14250, 98], ['Heart of a Hundred Mines', 14400, 99]
  ];
  // Recovery → build → build → challenge → finale, with diminishing growth.
  const targetRhythm = [.94, .98, 1.02, 1.06, 1.12];
  const difficultyRhythm = [-.025, -.0125, 0, .0125, .025];
  levels.forEach((entry, index) => {
    const baseline = 550 + 4200 * (1 - Math.exp(-index / 35));
    entry[1] = Math.round(baseline * targetRhythm[index % 5] / 25) * 25;
  });
  // As in the 2003 original: big gold pays but drags, rocks are heavy and nearly
  // worthless, diamonds are light and rich but small. Values are relative; each
  // mine rescales treasure to its target, while rocks keep their flat pittance.
  const types = {
    small: { radius: 16, value: 100, weight: 1.1, color: '#eabc52' },
    gold: { radius: 28, value: 350, weight: 2.3, color: '#edbc50' },
    large: { radius: 43, value: 900, weight: 4.4, color: '#f2c45e' },
    rock: { radius: 34, value: 20, weight: 3.8, color: '#6e7166' },
    diamond: { radius: 14, value: 600, weight: .8, color: '#b3efeb' },
    gem: { radius: 18, value: 300, weight: 1, color: '#95bdaa' },
    bag: { radius: 22, value: 350, weight: 1.05, color: '#c8a071' },
    tnt: { radius: 25, value: 0, weight: 1, color: '#ba4938' },
    pig: { radius: 26, value: 25, weight: .6, speed: 65, color: '#a0846a' },
    diamondPig: { radius: 32, value: 575, weight: 1.1, speed: 150, color: '#9d7968' }
  };
  // Fixed treasure budgets avoid unwinnable low-value random rolls. Layout v3 adds
  // blocking rocks and more boards than one minute can clear, so routes matter.
  const spawnCounts = {
    2: [
      { small: 3, gold: 3, large: 2, diamond: 1, gem: 2, bag: 1, rock: 2 }, // 1–10
      { small: 3, gold: 4, large: 3, diamond: 2, gem: 2, bag: 1, rock: 3 }, // 11–40
      { small: 2, gold: 4, large: 3, diamond: 3, gem: 3, bag: 1, rock: 3 }  // 41–100
    ],
    3: [
      { small: 4, gold: 3, large: 2, diamond: 1, gem: 1, bag: 1, rock: 4 }, // 1–10
      { small: 3, gold: 4, large: 2, diamond: 2, gem: 2, bag: 1, rock: 5 }, // 11–40
      { small: 3, gold: 3, large: 2, diamond: 3, gem: 2, bag: 2, rock: 6 }  // 41–100
    ]
  };
  const blastRadius = 120, diamondBonus = 1.5, strengthBonus = 1.5, dynamiteCapacity = 3, reelPower = 300;
  // v3 boards only place treasure the swinging claw (±1.16 rad) can actually reach.
  const reachable = (x, y, layoutVersion) => layoutVersion < 3 || Math.abs(Math.atan2(x - origin.x, y - origin.y)) < 1.08;
  let mapVersion = 3;
  let level = 0, bank = 0, haul = 0, time = 60, phase = 'ready', objects = [];
  let angle = 0, swing = 0, length = 23, hookState = 'swing', caught = null;
  let dynamite = 0, strength = false, book = false, sound = true, audio;
  let magnet = false, magnetArmed = false, revealUntil = 0, reelSpeed = 0;
  let lastFrame = 0, deadline = 0, toastUntil = 0, particles = [], popups = [], shakeMag = 0, shakeTime = 0;
  // Game feel: crank position, ratchet cadence, hit-stop, screen flash, title card, goal moment.
  let crankAngle = 0, reelClick = 0, hitStop = 0, flash = null, banner = null, goalMet = false, lastSecond = 60;
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const money = n => '$' + n.toLocaleString('en-US');
  // New games and Continue must share storage from the first save onward.
  const db = new Dexie('GoldMining');
  db.version(1).stores({ saves: 'id' });
  let saveQueue = Promise.resolve(), lastSave = 0;
  function storageError(error) {
    console.warn('Gold Mining save unavailable:', error);
    notify('Progress could not be saved. Keep this tab open.');
  }
  function saveProgress() {
    if (phase === 'ready') return;
    const snapshot = {
      id: 'expedition', version: 1, mapVersion, level, bank, haul,
      time: phase === 'playing' ? Math.max(0, (deadline - performance.now()) / 1000) : time,
      phase: phase === 'playing' ? 'paused' : phase,
      angle, swing, length, hookState, caughtId: caught?.id ?? null,
      taken: objects.filter(o => o.taken).map(o => o.id), dynamite, strength, book, sound, magnet, magnetArmed
    };
    // Serialize writes so an older autosave cannot overwrite a purchase or restart.
    saveQueue = saveQueue.then(() => db.saves.put(snapshot)).catch(storageError);
    lastSave = performance.now();
    return saveQueue;
  }
  function validSave(s) {
    if (!s || s.version !== 1 || !Number.isInteger(s.level) || s.level < 0 || s.level >= levels.length) return false;
    if (s.mapVersion !== undefined && ![1, 2, 3].includes(s.mapVersion)) return false;
    const map = makeMap(s.level, s.mapVersion ?? 1);
    return ['paused', 'shop', 'lost', 'won'].includes(s.phase)
      && (s.phase !== 'shop' || s.level < levels.length - 1)
      && (s.phase !== 'won' || s.level === levels.length - 1 || [9, 29, 49].includes(s.level))
      && ['bank', 'haul', 'dynamite'].every(k => Number.isSafeInteger(s[k]) && s[k] >= 0)
      && ['strength', 'book', 'sound'].every(k => typeof s[k] === 'boolean')
      && ['magnet', 'magnetArmed'].every(k => s[k] === undefined || typeof s[k] === 'boolean')
      && Number.isFinite(s.time) && s.time >= 0 && s.time <= 60
      && Number.isFinite(s.angle) && Math.abs(s.angle) <= 1.16
      && Number.isFinite(s.swing) && Number.isFinite(s.length) && s.length >= 23 && s.length <= 1200
      && ['swing', 'out', 'back'].includes(s.hookState)
      && Array.isArray(s.taken) && s.taken.every(id => Number.isInteger(id) && id >= 0 && id < map.length)
      && (s.caughtId === null || (Number.isInteger(s.caughtId) && s.taken.includes(s.caughtId) && map[s.caughtId]?.type !== 'tnt' && s.hookState === 'back'));
  }
  async function loadProgress() {
    try {
      await saveQueue;
      const s = await db.saves.get('expedition');
      if (!s) return false;
      if (!validSave(s)) throw new Error('Invalid or unsupported save data');
      ({ level, bank, haul, time, angle, swing, length, hookState, dynamite, strength, book, sound } = s);
      goalMet = bank + haul >= levels[level][1]; lastSecond = Math.ceil(time);
      mapVersion = s.mapVersion ?? 1;
      magnet = s.magnet ?? false; magnetArmed = s.magnetArmed ?? false;
      objects = makeMap(level);
      paintBackground(level);
      movePigs();
      objects.forEach(o => { o.taken = s.taken.includes(o.id); });
      caught = s.caughtId === null ? null : objects[s.caughtId];
      // Previous expedition finales have already paid their goals.
      phase = s.phase === 'won' && s.level < levels.length - 1 ? 'shop' : s.phase;
      if (phase === 'paused') renderPause();
      else if (phase === 'shop') renderShop();
      else renderResult();
      updateSound(); updateHUD();
      return true;
    } catch (error) {
      console.warn('Gold Mining save could not be loaded:', error);
      notify('Could not continue this expedition. Try again or start a new game.');
      return false;
    }
  }
  function random(seed) {
    return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  }
  function makeMap(index, layoutVersion = mapVersion) {
    const rand = random(1849 + index * 719);
    const kinds = [];
    if (layoutVersion === 1) {
      // Legacy expeditions retain positions, IDs and random draw order.
      const density = Math.min(index, 9);
      kinds.push('large', 'large', 'gold', 'gold', 'small', 'small', 'diamond', 'gem', 'bag', 'rock', 'rock');
      for (let i = 0; i < density; i++) kinds.push(i % 2 ? 'large' : 'diamond');
      for (let i = 0; i < Math.floor(density / 2); i++) kinds.push('rock');
    } else {
      const counts = { ...spawnCounts[layoutVersion][index < 10 ? 0 : index < 40 ? 1 : 2] };
      // Alternate gold-heavy and gem-heavy mines without adding hazards.
      if (index % 2) { counts.large--; counts.gem += 2; }
      for (const [type, count] of Object.entries(counts)) kinds.push(...Array(count).fill(type));
    }
    const map = kinds.map((type, id) => {
      const spec = types[type];
      return { type, id, ...spec, x: 0, y: 0, taken: false, rotation: rand() * .6 - .3, value: type === 'bag' ? Math.round(spec.value * (.2 + rand() * 1.6) / 25) * 25 : spec.value };
    }).reduce((placed, obj) => {
      for (let attempt = 0; attempt < 500; attempt++) {
        obj.x = 85 + rand() * 930;
        obj.y = 220 + rand() * (300 - obj.radius);
        if (reachable(obj.x, obj.y, layoutVersion) && placed.every(other => Math.hypot(obj.x - other.x, obj.y - other.y) > obj.radius + other.radius + 18)) break;
      }
      placed.push(obj); return placed;
    }, []);
    // Legacy boards: 45–50% at mines 1–10, 52–60% at 11–40, 60–68% at 41–100.
    // v3 boards fit a minute's work, so goals ask 60–66%, 68–74%, then 74–78%.
    // Each band ramps gradually while preserving five-mine challenge/recovery cycles.
    const baseShare = layoutVersion < 3
      ? (index < 10 ? .475 : index < 40 ? .545 + .03 * (index - 10) / 29 : .625 + .03 * (index - 40) / 59)
      : (index < 10 ? .6 + .06 * index / 9 : index < 40 ? .68 + .06 * (index - 10) / 29 : .74 + .04 * (index - 40) / 59);
    const targetShare = baseShare + difficultyRhythm[index % 5];
    const treasure = map.filter(obj => obj.type !== 'rock');
    const richness = levels[index][1] / (targetShare * treasure.reduce((sum, obj) => sum + obj.value, 0));
    treasure.forEach(obj => { obj.value = Math.round(obj.value * richness); });
    const hazards = [];
    if (layoutVersion === 1) {
      const count = Math.min(6, 1 + Math.floor(index / 4));
      hazards.push(...Array(count).fill('tnt'));
      const pigTier = Math.min(3, 1 + Math.floor(index / 5));
      hazards.push(...Array(Math.floor(rand() * (pigTier + 1))).fill('pig'));
      const diamondTier = index < 9 ? 0 : index >= 19 ? 2 : 1;
      hazards.push(...Array(Math.floor(rand() * (diamondTier + 1))).fill('diamondPig'));
    } else {
      // Introduce TNT at mine 6 (mine 4 on v3 boards); two only on mid/late finales.
      if (index >= (layoutVersion < 3 ? 5 : 3)) hazards.push('tnt');
      if (index >= 10 && index % 5 === 4) hazards.push('tnt');
      if (index >= 10) hazards.push('pig', 'diamondPig');
    }
    for (const type of hazards) {
      const obj = { type, id: map.length, ...types[type], taken: false, rotation: rand() * .6 - .3 };
      if (type === 'diamondPig') obj.value = types.pig.value + Math.round((types.diamondPig.value - types.pig.value) * richness);
      for (let attempt = 0; attempt < 500; attempt++) {
        obj.x = 85 + rand() * 930;
        obj.y = obj.speed ? 205 + rand() * (H - 245 - obj.radius) : 220 + rand() * 275;
        // New TNT cannot chain-react or destroy stationary treasure from its spawn.
        const safeBlast = layoutVersion === 1 || type !== 'tnt' || map.every(other =>
          Math.hypot(obj.x - other.x, obj.y - other.y) >
          (other.type === 'tnt' ? 2 * blastRadius : blastRadius + other.radius));
        if (safeBlast && reachable(obj.x, obj.y, layoutVersion) && map.every(other => Math.hypot(obj.x - other.x, obj.y - other.y) > obj.radius + other.radius + (obj.speed ? 4 : 18))) {
          if (obj.speed) { obj.startX = obj.x; obj.direction = 1; obj.rotation = 0; }
          map.push(obj); break;
        }
      }
    }
    // Facets are generated once per object so the crystalline shading never flickers.
    map.forEach(obj => {
      const r2 = random(97 + index * 31 + obj.id * 13);
      const stony = obj.type === 'rock', golden = ['large', 'gold', 'small'].includes(obj.type);
      if (golden || stony) {
        // Lumpy silhouette: raw gold and boulders are never regular heptagons.
        obj.outline = Array.from({ length: 10 }, (_, i) => {
          const a = i / 10 * 6.283, lump = i % 3 === 2 ? .8 : 1;
          const rr = obj.radius * (.76 + r2() * .4) * lump;
          return [Math.cos(a) * rr, Math.sin(a) * rr * .92];
        });
      }
      if (stony) {
        // Fissures picked once so boulders read as cracked stone, not grey gems.
        obj.cracks = Array.from({ length: 2 + Math.floor(r2() * 2) }, () => {
          let cx = (r2() - .5) * obj.radius * 1.1, cy = (r2() - .5) * obj.radius * 1.1;
          const pts = [[cx, cy]];
          for (let s = 0, seg = 2 + Math.floor(r2() * 2); s < seg; s++) {
            cx += (r2() - .5) * obj.radius * .8; cy += (r2() - .5) * obj.radius * .7;
            pts.push([cx, cy]);
          }
          return pts;
        });
      }
      if (golden) {
        // Anchor points for twinkling star flares on the facets.
        obj.glints = Array.from({ length: 2 }, () => ({
          x: (r2() - .5) * obj.radius * 1.2, y: (r2() - .5) * obj.radius * 1.2,
          s: obj.radius * (.22 + r2() * .2), phase: r2() * 6.283
        }));
      }
      obj.chunks = Array.from({ length: 3 + Math.floor(r2() * 3) }, () => ({
        pts: Array.from({ length: 6 }, (_, i) => {
          const a = i / 6 * 6.283 + (r2() - .5) * .5, rr = obj.radius * (.34 + r2() * .34);
          return [Math.cos(a) * rr + (r2() - .5) * obj.radius * .5, Math.sin(a) * rr + (r2() - .5) * obj.radius * .4];
        }),
        lit: r2()
      }));
    });
    return map;
  }
  function movePigs() {
    // Derive patrols from the saved level clock; no extra save state or migration needed.
    for (const obj of objects) {
      if (!obj.speed || obj.taken) continue;
      const left = 40 + obj.radius, span = W - 2 * left;
      const distance = (obj.startX - left + (60 - time) * obj.speed) % (2 * span);
      obj.x = left + (distance < span ? distance : 2 * span - distance);
      obj.direction = distance < span ? 1 : -1;
    }
  }
  // --- Procedural sound kit: every effect is synthesized; there are no audio files. ---
  let sfxBus = null, noise = null;
  function soundBus() {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    if (!sfxBus) {
      // A gentle compressor glues overlapping effects and stops clipping on big hauls.
      const glue = audio.createDynamicsCompressor();
      glue.threshold.value = -16; glue.ratio.value = 4; glue.connect(audio.destination);
      sfxBus = audio.createGain(); sfxBus.gain.value = .9; sfxBus.connect(glue);
      noise = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    return sfxBus;
  }
  function voice(type, frequency, delay, duration, volume, glideTo) {
    const bus = soundBus(), t = audio.currentTime + delay;
    const osc = audio.createOscillator(), gain = audio.createGain();
    osc.type = type; osc.frequency.setValueAtTime(frequency, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + duration);
    gain.gain.setValueAtTime(.0001, t); gain.gain.exponentialRampToValueAtTime(volume, t + .006);
    gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
    osc.connect(gain); gain.connect(bus); osc.start(t); osc.stop(t + duration + .02);
  }
  function hiss(filterType, frequency, delay, duration, volume, sweepTo, q = 1) {
    const bus = soundBus(), t = audio.currentTime + delay;
    const src = audio.createBufferSource(), filter = audio.createBiquadFilter(), gain = audio.createGain();
    src.buffer = noise; src.loop = true;
    filter.type = filterType; filter.Q.value = q; filter.frequency.setValueAtTime(frequency, t);
    if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, t + duration);
    gain.gain.setValueAtTime(.0001, t); gain.gain.exponentialRampToValueAtTime(volume, t + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
    src.connect(filter); filter.connect(gain); gain.connect(bus); src.start(t, Math.random() * .5); src.stop(t + duration + .02);
  }
  const SFX = {
    drop: () => { hiss('bandpass', 1800, 0, .3, .12, 420, 1.2); voice('triangle', 240, 0, .08, .08, 110); },
    ratchet: weight => { hiss('highpass', 3200, 0, .025, .05 + Math.min(.05, weight * .012)); voice('square', 900 / Math.max(.8, weight), 0, .018, .018); },
    clink: () => { voice('sine', 1568, 0, .45, .1); voice('sine', 2349, .01, .35, .05); voice('triangle', 784, 0, .2, .05); },
    sparkle: () => [2093, 2637, 3136, 4186].forEach((f, i) => voice('sine', f, i * .045, .35, .06)),
    thud: () => { hiss('lowpass', 500, 0, .22, .22, 90); voice('sine', 110, 0, .25, .2, 45); },
    wall: () => hiss('lowpass', 900, 0, .14, .1, 200),
    bank: big => { voice('triangle', 1318.5, 0, .18, .08); voice('triangle', 1975.5, .07, big ? .55 : .3, .08); if (big) voice('sine', 2637, .14, .5, .045); },
    boom: () => { hiss('lowpass', 2400, 0, 1.1, .5, 60, .7); voice('sine', 70, 0, .7, .45, 30); voice('sawtooth', 140, 0, .25, .07, 40); },
    tick: () => voice('square', 1800, 0, .03, .035),
    goal: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => { voice('triangle', f, i * .09, .5, .08); voice('sine', f * 2, i * .09, .3, .025); }),
    fail: () => [392, 349.23, 293.66].forEach((f, i) => voice('triangle', f, i * .16, .42, .08)),
    buy: () => { voice('square', 1046.5, 0, .06, .035); voice('triangle', 1568, .06, .25, .07); },
    ui: () => voice('triangle', 660, 0, .08, .05)
  };
  function sfx(name, arg) {
    if (!sound) return;
    try { SFX[name](arg); } catch { sound = false; updateSound(); }
  }
  // Juice that must stay gentle for players who ask the OS for reduced motion.
  function flashScreen(rgb, alpha) { flash = { rgb, a: alpha * (calm.matches ? .35 : 1) }; }
  function showBanner(kicker, title, detail) { banner = { kicker, title, detail, start: performance.now() }; }
  function checkGoal() {
    if (goalMet || bank + haul < levels[level][1]) return;
    goalMet = true;
    showBanner('TARGET MET', 'Strike it rich!', 'Every extra dollar carries to the next mine');
    sfx('goal'); burst({ x: 700, y: 92 }, 'fire');
  }
  function notify(text) { $('toast').textContent = text; toastUntil = performance.now() + 2500; }
  function showDialog(content) {
    $('dialog').innerHTML = content;
    $('dialog').querySelector('h2').id = 'dialog-title';
    $('overlay').hidden = false;
    canvas.tabIndex = -1;
    $('dialog').querySelector('button')?.focus();
  }
  function hideDialog() { $('overlay').hidden = true; canvas.tabIndex = 0; canvas.focus({ preventScroll: true }); }
  function updateHUD() {
    rollScore(bank + haul);
    $('goal').textContent = money(levels[level][1]);
    $('progress').style.width = Math.min(100, (bank + haul) / levels[level][1] * 100) + '%';
    $('timer').textContent = '00:' + String(Math.ceil(time)).padStart(2, '0');
    if (time === 60) $('timer').textContent = '01:00';
    $('timer').classList.toggle('urgent', time <= 15);
    $('location').textContent = String(level + 1).padStart(2, '0') + ' — ' + levels[level][0].toUpperCase();
    $('dynamite-count').textContent = dynamite;
    $('strength-count').textContent = strength ? 1 : 0;
    $('book-count').textContent = book ? 1 : 0;
    $('strength-item').disabled = phase !== 'playing' || !strength;
    $('book-item').disabled = phase !== 'playing' || !book;
    $('magnet-count').textContent = magnet ? 1 : 0;
    $('magnet-item').disabled = phase !== 'playing' || !magnet || hookState !== 'swing';
    $('magnet-item').classList.toggle('armed', magnetArmed);
    $('dynamite').disabled = phase !== 'playing' || !caught || dynamite === 0;
    $('pause').disabled = !['playing', 'paused'].includes(phase);
  }
  // Score roll-up: the displayed value chases the real total with an ease-out tween.
  let shownScore = 0, scoreAnim = 0;
  function rollScore(target) {
    if (target === shownScore) return;
    cancelAnimationFrame(scoreAnim);
    const from = shownScore, start = performance.now();
    const step = now => {
      const t = Math.min(1, (now - start) / 500);
      shownScore = t < 1 ? Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3))) : target;
      $('haul').textContent = money(shownScore);
      if (t < 1) scoreAnim = requestAnimationFrame(step);
    };
    scoreAnim = requestAnimationFrame(step);
  }
  function startLevel() {
    objects = makeMap(level); haul = 0; time = 60; swing = -.8; angle = 0; shakeMag = 0; shakeTime = 0;
    paintBackground(level);
    length = 23; caught = null; hookState = 'swing'; particles = []; popups = [];
    magnetArmed = false; revealUntil = 0; reelSpeed = 0;
    phase = 'playing'; deadline = performance.now() + 60000;
    const goal = levels[level][1];
    goalMet = bank >= goal; lastSecond = 60; hitStop = 0; flash = null;
    showBanner(`MINE ${String(level + 1).padStart(2, '0')} OF ${levels.length}`, levels[level][0],
      `Target ${money(goal)} · ${goalMet ? 'your surplus already covers it' : '60 seconds on the clock'}`);
    hideDialog(); updateHUD(); saveProgress();
  }
  function finishLevel() {
    if (phase !== 'playing') return;
    time = 0;
    const total = bank + haul, goal = levels[level][1];
    if (total < goal) {
      phase = 'lost';
      sfx('fail');
      renderResult();
    } else {
      bank = total - goal; haul = 0; strength = false; book = false;
      if (level === levels.length - 1) {
        phase = 'won';
        renderResult();
      } else { phase = 'shop'; renderShop(); }
      sfx('goal');
    }
    updateHUD(); saveProgress();
  }
  function renderResult() {
    if (phase === 'lost') {
      showDialog(`<span class="badge">ANOTHER SHOT AT THE SEAM</span><h2>Chin up, miner!</h2><p>You brought in ${money(bank + haul)} of ${money(levels[level][1])}.<br>Try a new angle. Diamonds are light and valuable.</p><button class="primary" id="retry">Dig again ↻</button>`);
      $('retry').onclick = startLevel;
    } else {
      showDialog(`<span class="badge">${levels.length} SHAFTS. ONE LEGEND.</span><h2>What a haul!</h2><p>You worked all ${levels.length} mines and still carry ${money(bank)}.<br>The whole crew salutes you.</p><button class="primary" id="restart">A new expedition ↗</button>`);
      $('restart').onclick = () => { mapVersion = 3; level = 0; bank = 0; dynamite = 0; strength = false; book = false; magnet = false; startLevel(); };
    }
  }
  function supplyPrices(index) {
    const goal = levels[index][1];
    // Scale sinks with the upcoming mine, rounded to readable $25 price steps.
    return {
      dynamite: Math.max(100, Math.ceil(goal * .05 / 25) * 25),
      strength: Math.max(150, Math.ceil(goal * .12 / 25) * 25),
      book: Math.max(150, Math.ceil(goal * .12 / 25) * 25),
      magnet: Math.max(75, Math.ceil(goal * .06 / 25) * 25)
    };
  }
  function renderShop() {
    const prices = supplyPrices(level + 1);
    showDialog(`<span class="badge">MINE ${String(level + 1).padStart(2, '0')} COMPLETE · SUPPLY SHACK</span><h2>Stock up, miner.</h2><p>Target met. Your surplus: <strong>${money(bank)}</strong><br>Next mine: ${levels[level + 1][0]} · Target ${money(levels[level + 1][1])}</p><div class="shop-items"><button class="shop-item" id="buy-dynamite" ${bank < prices.dynamite || dynamite >= dynamiteCapacity ? 'disabled' : ''}><span class="item-icon icon-dynamite" aria-hidden="true"></span><strong>Dynamite</strong><small>Destroy your catch<br>${dynamite}/${dynamiteCapacity} in your pack</small><span>${dynamite >= dynamiteCapacity ? 'Pack full' : money(prices.dynamite)}</span></button><button class="shop-item" id="buy-strength" ${bank < prices.strength || strength ? 'disabled' : ''}><span class="item-icon icon-potion" aria-hidden="true"></span><strong>Strength drink</strong><small>${strengthBonus}× pulling speed<br>Next mine only</small><span>${strength ? 'Packed ✓' : money(prices.strength)}</span></button><button class="shop-item" id="buy-book" ${bank < prices.book || book ? 'disabled' : ''}><span class="item-icon icon-book" aria-hidden="true"></span><strong>Diamond book</strong><small>${diamondBonus}× diamond value<br>Next mine only</small><span>${book ? 'Packed ✓' : money(prices.book)}</span></button></div><p>Supplies cost part of your next goal. Save cash, or invest in a better haul.</p><button class="primary" id="next">On to mine ${level + 2} →</button>`);
    $('dialog').querySelector('.shop-items').insertAdjacentHTML('beforeend', `<button class="shop-item" id="buy-magnet" ${bank < prices.magnet || magnet ? 'disabled' : ''}><span class="item-icon icon-magnet" aria-hidden="true"></span><strong>Magnetic claw</strong><small>Wider gold capture<br>One launch · arm in the field</small><span>${magnet ? 'Packed ✓' : money(prices.magnet)}</span></button>`);
    $('buy-magnet').onclick = () => buy('magnet');
    $('buy-dynamite').onclick = () => buy('dynamite');
    $('buy-strength').onclick = () => buy('strength');
    $('buy-book').onclick = () => buy('book');
    $('next').onclick = () => { level++; startLevel(); };
  }
  function buy(item) {
    if (phase !== 'shop' || level >= levels.length - 1) return;
    const prices = supplyPrices(level + 1);
    if (!Object.hasOwn(prices, item) || bank < prices[item]
      || (item === 'dynamite' && dynamite >= dynamiteCapacity)
      || (item === 'strength' && strength) || (item === 'book' && book) || (item === 'magnet' && magnet)) return;
    bank -= prices[item];
    if (item === 'dynamite') dynamite++;
    if (item === 'strength') strength = true;
    if (item === 'book') book = true;
    if (item === 'magnet') magnet = true;
    sfx('buy'); renderShop(); updateHUD(); saveProgress();
  }
  function drop() {
    if (phase !== 'playing' || hookState !== 'swing') return;
    if (performance.now() >= deadline) { finishLevel(); return; }
    hookState = 'out'; reelSpeed = 0;
    if (magnetArmed) magnet = false;
    sfx('drop'); updateHUD(); saveProgress();
  }
  const hookPosition = () => ({ x: origin.x + Math.sin(angle) * length, y: origin.y + Math.cos(angle) * length });
  // Debris: chunky stone shards that fall under gravity, gold dust that drifts and glitters.
  function burst(pos, kind = 'stone') {
    const shiny = kind === 'gold' || kind === 'fire', count = kind === 'fire' ? 46 : shiny ? 26 : 20;
    for (let i = 0; i < count; i++) {
      const direction = Math.random() * Math.PI * 2, speed = (shiny ? 70 : 90) + Math.random() * (shiny ? 190 : 230);
      const life = (shiny ? .85 : 1.15) * (.55 + Math.random() * .75);
      particles.push({
        x: pos.x, y: pos.y, vx: Math.cos(direction) * speed, vy: Math.sin(direction) * speed - (shiny ? 60 : 0),
        life, max: life, kind, rot: Math.random() * 6.283, spin: (Math.random() - .5) * 12,
        size: shiny ? 2 + Math.random() * 2.6 : 2.6 + Math.random() * 4.4
      });
    }
    if (kind === 'fire') for (let i = 0; i < 12; i++) burst({ x: pos.x + Math.random() * 30 - 15, y: pos.y + Math.random() * 30 - 15 }, 'gold');
  }
  function shake(amount) {
    const scaled = amount * shakeScale;
    if (scaled < 1) return;
    shakeMag = Math.max(shakeMag, scaled); shakeTime = .4;
    navigator.vibrate?.(Math.min(40, Math.round(amount * .4)));
  }
  function detonate(barrel) {
    const pending = [barrel];
    barrel.taken = true;
    while (pending.length) {
      const source = pending.pop();
      burst(source, 'fire');
      shake(20);
      for (const obj of objects) {
        if (obj.taken || Math.hypot(obj.x - source.x, obj.y - source.y) > blastRadius + obj.radius) continue;
        obj.taken = true;
        if (obj.type === 'tnt') pending.push(obj);
      }
    }
    caught = null; hookState = 'back';
    sfx('boom'); flashScreen('255,190,110', .55); hitStop = .1;
    notify('TNT! Nearby treasure destroyed. No points earned.');
    saveProgress();
  }
  function explode() {
    if (phase !== 'playing' || !caught || !dynamite) return;
    if (performance.now() >= deadline) { finishLevel(); return; }
    const pos = hookPosition();
    burst(pos, 'fire');
    shake(12);
    caught = null; dynamite--; sfx('boom'); flashScreen('255,190,110', .3); notify('Catch destroyed. Back to the good stuff.'); updateHUD(); saveProgress();
  }
  function pause() {
    if (phase === 'playing') {
      time = Math.max(0, (deadline - performance.now()) / 1000);
      if (!time) { finishLevel(); return; }
      phase = 'paused';
      renderPause();
    } else if (phase === 'paused') { phase = 'playing'; deadline = performance.now() + time * 1000; hideDialog(); }
    updateHUD(); saveProgress();
  }
  function renderPause() {
    showDialog('<span class="badge">TAKE FIVE</span><h2>At ease, miner.</h2><p>Your haul is safe underground and the clock is stopped. Ready when you are.</p><button class="primary" id="resume">Back to the seam →</button>');
    $('resume').onclick = pause;
  }
  function update(dt, now) {
    if (phase !== 'playing') return;
    time = Math.max(0, (deadline - now) / 1000);
    if (!time) { finishLevel(); return; }
    const second = Math.ceil(time);   // the last ten seconds tick audibly
    if (second !== lastSecond) { lastSecond = second; if (second <= 10) sfx('tick'); }
    movePigs();
    if (hookState === 'swing') { swing += dt * 1.6; angle = Math.sin(swing) * 1.16; }
    else if (hookState === 'out') {
      length += 540 * dt; crankAngle -= 540 * dt * .045;
      const p = hookPosition();
      // Match paint order when a patrolling pig crosses in front of stationary treasure.
      caught = objects.findLast(o => !o.taken && Math.hypot(o.x - p.x, (o.y - p.y) / objectAspect) < o.radius + 8
        + (magnetArmed && ['small', 'gold', 'large'].includes(o.type) ? 24 : 0)) || null;
      if (caught?.type === 'tnt') detonate(caught);
      else if (caught) {
        caught.taken = true; hookState = 'back';
        const metal = caught.type === 'rock' ? 'stone' : 'gold', gem = ['diamond', 'gem', 'diamondPig'].includes(caught.type);
        sfx(caught.type === 'rock' ? 'thud' : gem ? 'sparkle' : 'clink');
        burst(p, metal);
        shake(caught.type === 'large' || caught.type === 'diamondPig' ? 7 : 3);
        // A beat of hit-stop sells the weight of the prizes worth chasing.
        if (caught.type === 'large' || gem) hitStop = .07;
        if (caught.type === 'diamond' || caught.type === 'diamondPig') flashScreen('200,255,250', .16);
      }
      else if (p.x < 20 || p.x > W - 20 || p.y > H - 30) { hookState = 'back'; sfx('wall'); burst(p); }
    } else {
      const targetSpeed = reelPower * (strength ? strengthBonus : 1) / (caught ? caught.weight : .65);
      // Loaded reels take time to overcome inertia, while an empty claw snaps home.
      reelSpeed += (targetSpeed - reelSpeed) * (1 - Math.exp(-dt * (caught ? 4 : 12)));
      length -= reelSpeed * dt; crankAngle += reelSpeed * dt * .045;
      reelClick += reelSpeed * dt;   // the winch ratchet clicks once per notch of cable
      if (reelClick > 28) { reelClick = 0; sfx('ratchet', caught ? caught.weight : .65); }
      if (length <= 23) {
        length = 23; hookState = 'swing'; magnetArmed = false;
        if (caught) {
          const value = caught.type === 'diamondPig'
            ? types.pig.value + Math.round((caught.value - types.pig.value) * (book ? diamondBonus : 1))
            : Math.round(caught.value * (caught.type === 'diamond' && book ? diamondBonus : 1));
          haul += value;
          if (!calm.matches) $('haul').animate([{ transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1.4)' });
          if (value >= 800) flashScreen('255,214,120', .14);
          popups.push({ text: '+' + money(value), x: 700, y: 74, life: 1.6 });
          burst({ x: 550, y: 112 }, value >= 400 ? 'fire' : 'gold');
          shake(value >= 800 ? 16 : value >= 400 ? 11 : 5);
          if (caught.type === 'bag') notify('Mystery bag! You found ' + money(value) + '.');
          if (caught.type === 'diamondPig') notify('Diamond-mouth pig! ' + money(value) + ' secured.');
          sfx(caught.type === 'rock' ? 'thud' : 'bank', value >= 400); caught = null;
          checkGoal(); saveProgress();
        }
        if (objects.every(o => o.taken)) { finishLevel(); return; }
      }
    }
    if (shakeTime > 0) { shakeTime -= dt; if (shakeTime <= 0) { shakeTime = 0; shakeMag = 0; } }
    for (const p of particles) {
      const gravity = p.kind === 'stone' ? 620 : 150;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += gravity * dt; p.vx *= 1 - 1.1 * dt; p.rot += p.spin * dt; p.life -= dt;
    }
    particles = particles.filter(p => p.life > 0);
    popups.forEach(p => { p.y -= 30 * dt; p.life -= dt; }); popups = popups.filter(p => p.life > 0);
    updateHUD();
  }
  function polygon(points, fill, stroke) {
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }
  function ellipse(x, y, rx, ry, fill) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
  function line(points, color, width = 2) { ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(); }
  function drawObject(obj, x = obj.x, y = obj.y) {
    const r = obj.radius;
    ctx.save(); ctx.translate(x, y); ctx.scale(1, objectAspect); ctx.rotate(obj.rotation);
    ellipse(3, r * .7, r * .9, r * .35, '#171b183a');
    if (obj.speed) {
      ctx.scale(obj.direction, 1);
      const stride = obj.taken ? 0 : Math.sin((60 - time) * obj.speed * .2) * 4;
      line([[-13,10],[-14 + stride,19]], '#d68c7e', 6);
      line([[9,10],[10 - stride,19]], '#d68c7e', 6);
      ellipse(-14 + stride, 20, 4, 2.5, '#925b58');
      ellipse(10 - stride, 20, 4, 2.5, '#925b58');
      ctx.beginPath(); ctx.arc(-22, -4, 4, 0, Math.PI * 1.8);
      ctx.strokeStyle = '#e6a08c'; ctx.lineWidth = 3; ctx.stroke();
      ellipse(-3, 1, 22, 17, obj.color);
      ellipse(-7, -5, 13, 7, '#bcaa88');
      ellipse(-2, 9, 13, 6, '#806957');
      ellipse(12, -2, 13, 13, obj.color);
      polygon([[5,-11],[3,-22],[12,-18],[16,-11]], '#f3b6a6', '#bd7b70');
      polygon([[7,-13],[6,-19],[12,-16]], '#dc8d87');
      ellipse(22, 1, 7, 5.5, '#bca183');
      ellipse(21, 1, 1.1, 1.7, '#a75e5b');
      ellipse(25, 1, 1.1, 1.7, '#a75e5b');
      ellipse(11, 3, 4, 2.5, '#a9826a');
      ellipse(16, -6, 2.8, 3.3, '#352d29');
      ellipse(16.8, -7.2, 1, 1.2, '#fff8eb');
      ctx.beginPath(); ctx.arc(18, 5, 3, .15, Math.PI * .85);
      ctx.strokeStyle = '#a75e5b'; ctx.lineWidth = 1.2; ctx.stroke();
      if (obj.type === 'diamondPig') {
        polygon([[19,5],[23,0],[31,0],[35,5],[27,15]], '#adf4f0', '#4d8e85');
        polygon([[19,5],[27,5],[27,15]], '#62b9bd');
        line([[23,0],[27,5],[31,0]], '#efffff', 1);
        line([[30,-10],[30,-2]], '#efffff', 2);
        line([[26,-6],[34,-6]], '#efffff', 2);
      }
    } else if (obj.type === 'diamond' || obj.type === 'gem') {
      polygon([[-r, -r*.3], [-r*.5, -r], [r*.5, -r], [r, -r*.3], [0, r]], obj.color, '#4d8e85');
      polygon([[-r,-r*.3],[0,-r*.3],[-r*.5,-r]], '#dcfff0');
      polygon([[0,-r*.3],[r,-r*.3],[0,r]], '#5fa99b');
      line([[-r,-r*.3],[r,-r*.3]], '#e2fff0', 1);
      line([[0,-r],[0,-r*.3],[0,r]], '#ddfff4', 1);
      ctx.fillStyle = '#e9fff3'; ctx.fillRect(r+5,-r-4,2,9); ctx.fillRect(r+2,-r-1,8,2);
    } else if (obj.type === 'tnt') {
      const shade = ctx.createLinearGradient(-r*.7, 0, r*.7, 0);
      shade.addColorStop(0, '#762e27'); shade.addColorStop(.3, '#df7050');
      shade.addColorStop(.65, obj.color); shade.addColorStop(1, '#682b26');
      ctx.beginPath(); ctx.moveTo(-r*.58, -r*.65);
      ctx.bezierCurveTo(-r*.8, -r*.3, -r*.8, r*.35, -r*.58, r*.7);
      ctx.quadraticCurveTo(0, r*.95, r*.58, r*.7);
      ctx.bezierCurveTo(r*.8, r*.35, r*.8, -r*.3, r*.58, -r*.65);
      ctx.closePath(); ctx.fillStyle = shade; ctx.fill();
      ctx.strokeStyle = '#432820'; ctx.lineWidth = 2; ctx.stroke();
      line([[-r*.3,-r*.6],[-r*.36,0],[-r*.3,r*.72]], '#7e352b', 1);
      line([[r*.3,-r*.6],[r*.36,0],[r*.3,r*.72]], '#7e352b', 1);
      ellipse(0, -r*.65, r*.58, r*.2, '#ef9666');
      ellipse(0, -r*.65, r*.46, r*.12, '#a54c36');
      line([[-r*.24,-r*.68],[r*.24,-r*.62]], '#e88759', 1);
      line([[-r*.66,-r*.4],[0,-r*.34],[r*.66,-r*.4]], '#423e35', 6);
      line([[-r*.66,-r*.43],[0,-r*.37],[r*.66,-r*.43]], '#c6b88d', 3);
      line([[-r*.66,r*.48],[0,r*.55],[r*.66,r*.48]], '#423e35', 6);
      line([[-r*.66,r*.45],[0,r*.52],[r*.66,r*.45]], '#c6b88d', 3);
      ellipse(-r*.48, -r*.41, 1.3, 1.3, '#fff0c5');
      ellipse(r*.48, r*.49, 1.3, 1.3, '#fff0c5');
      ctx.fillStyle = '#b4a17a'; ctx.fillRect(-r*.58, -r*.2, r*1.16, r*.5);
      ctx.strokeStyle = '#71352a'; ctx.lineWidth = 1; ctx.strokeRect(-r*.58, -r*.2, r*1.16, r*.5);
      ctx.fillStyle = '#782d25'; ctx.font = '900 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('TNT', 0, r*.19);
      line([[3,-r*.76],[7,-r],[13,-r*.95]], '#665736', 2);
      const spark = .5 + Math.sin(performance.now()*.009 + obj.id)*.5;
      drawGlow(13,-r*.95,2,performance.now(),8,.2+spark*.3);
      ellipse(13,-r*.95,1.2,1.2,'#ffe1a0');
    } else if (obj.type === 'bag') {
      polygon([[-9,-18],[-13,-27],[0,-23],[12,-27],[8,-16]], '#e0be8a');
      ctx.beginPath(); ctx.moveTo(-8,-15); ctx.bezierCurveTo(-31,9,-24,25,0,24); ctx.bezierCurveTo(26,23,29,8,8,-15); ctx.closePath(); ctx.fillStyle = '#bc905e';ctx.fill();
      line([[-10,-15],[11,-15]], '#634c33', 4);
      ctx.fillStyle = '#f4d5a2';ctx.font='bold 24px Georgia';ctx.textAlign='center';ctx.fillText('?',0,14);
    } else {
      const pts = obj.outline || [[-r, -r * .1], [-r * .7, -r * .7], [-r * .1, -r], [r * .7, -r * .6], [r, r * .2], [r * .4, r * .8], [-r * .5, r * .7]];
      const rocky = obj.type === 'rock';
      ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.closePath();
      const shade = ctx.createRadialGradient(-r * .35, -r * .5, r * .1, 0, 0, r * 1.55);
      if (rocky) {
        shade.addColorStop(0, '#837b60'); shade.addColorStop(.5, '#4d4b3b'); shade.addColorStop(1, '#1d2521');
      } else {
        shade.addColorStop(0, '#fff2b6'); shade.addColorStop(.2, '#ecb644'); shade.addColorStop(.43, '#966012'); shade.addColorStop(.6, '#432807'); shade.addColorStop(.8, '#b7791b'); shade.addColorStop(1, '#211406');
      }
      ctx.fillStyle = shade; ctx.fill();
      // Rim light: the lantern sits up-centre, so the upper-left edge catches a warm lip.
      const rim = ctx.createLinearGradient(-r * .9, -r * .9, r * .8, r * .8);
      if (rocky) { rim.addColorStop(0, 'rgba(228,222,198,.75)'); rim.addColorStop(.45, 'rgba(120,118,100,.25)'); rim.addColorStop(1, 'rgba(10,12,10,.8)'); }
      else { rim.addColorStop(0, 'rgba(255,244,200,.9)'); rim.addColorStop(.45, 'rgba(200,130,40,.35)'); rim.addColorStop(1, 'rgba(40,20,0,.8)'); }
      ctx.strokeStyle = rim; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.save(); ctx.clip();
      if (rocky && obj.cracks) {   // fissures so boulders read as stone, not grey gems
        ctx.strokeStyle = 'rgba(0,0,0,.38)'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
        for (const crackPath of obj.cracks) {
          ctx.beginPath(); crackPath.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke();
          ctx.strokeStyle = 'rgba(216,206,180,.14)'; ctx.lineWidth = .6; ctx.stroke();
          ctx.strokeStyle = 'rgba(0,0,0,.38)'; ctx.lineWidth = 1.2;
        }
      }
      for (const ch of obj.chunks || []) {   // crystalline facet planes
        ctx.beginPath();
        ch.pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
        ctx.closePath();
        ctx.fillStyle = rocky
          ? (ch.lit > .5 ? 'rgba(228,226,206,.16)' : 'rgba(0,0,0,.2)')
          : (ch.lit > .5 ? 'rgba(255,240,198,.2)' : 'rgba(56,28,0,.2)');
        ctx.fill();
        ctx.strokeStyle = rocky ? 'rgba(0,0,0,.22)' : 'rgba(74,42,4,.24)';
        ctx.lineWidth = 1; ctx.stroke();
      }
      if (!rocky) {
        ctx.globalCompositeOperation = 'lighter';   // specular hit where the lantern lands
        const spec = ctx.createRadialGradient(-r * .45, -r * .55, 0, -r * .45, -r * .55, r * 1.1);
        spec.addColorStop(0, 'rgba(255,246,206,.4)'); spec.addColorStop(.4, 'rgba(255,206,110,.12)'); spec.addColorStop(1, 'rgba(255,160,60,0)');
        ctx.fillStyle = spec; ctx.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4);
        ctx.globalCompositeOperation = 'source-over';
        polygon([[-r * .66, -r * .26], [-r * .5, -r * .62], [-r * .1, -r * .72], [-r * .14, -r * .3]], 'rgba(255,232,154,.3)');
        polygon([[r * .52, r * .08], [r * .78, r * .36], [r * .42, r * .68], [r * .28, r * .28]], 'rgba(245,172,59,.23)');
        polygon([[-r * .9, -r * .06], [-r * .7, -r * .5], [-r * .34, -r * .56], [-r * .44, -r * .2]], 'rgba(255,222,150,.3)');
        // Twinkling star flares: facet glints that catch the lantern as the nugget sits.
        if (obj.glints) {
          ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
          for (const g of obj.glints) {
            const tw = Math.max(0, Math.sin(performance.now() * .0021 + g.phase));
            const gs = g.s * (.4 + tw * .6), a = tw * tw * .85;
            if (a < .04) continue;
            ctx.globalAlpha = a;
            ctx.strokeStyle = '#fff3c8'; ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.moveTo(g.x - gs, g.y); ctx.lineTo(g.x + gs, g.y);
            ctx.moveTo(g.x, g.y - gs); ctx.lineTo(g.x, g.y + gs); ctx.stroke();
            ctx.lineWidth = .7; ctx.globalAlpha = a * .7;
            const dg = gs * .6;
            ctx.beginPath(); ctx.moveTo(g.x - dg, g.y - dg); ctx.lineTo(g.x + dg, g.y + dg);
            ctx.moveTo(g.x - dg, g.y + dg); ctx.lineTo(g.x + dg, g.y - dg); ctx.stroke();
          }
          ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
        }
      } else {
        polygon([[-r * .8, -r * .2], [-r * .55, -r * .62], [0, -r * .8], [-r * .1, -r * .3]], 'rgba(216,214,192,.4)');
      }
      ctx.drawImage(art.surface(obj.id, r, rocky), -r * 1.3, -r * 1.3, r * 2.6, r * 2.6);
      ctx.restore();
      polygon([[-r * .62, r * .42], [-r * .2, r * .62], [r * .44, r * .5], [r * .1, r * .74], [-r * .5, r * .68]], 'rgba(0,0,0,.22)');
    }
    ctx.restore();
  }
  // --- Procedural art kit: every texture, light and glow is generated at runtime. ---
  const LAMP = { x: 612, y: 74 };   // the single lantern that lights the whole shaft
  const GLOW = document.createElement('canvas'); GLOW.width = GLOW.height = 128;
  const cone = document.createElement('canvas'); cone.width = W; cone.height = H;
  const vignette = document.createElement('canvas'); vignette.width = W; vignette.height = H;
  const background = document.createElement('canvas'); background.width = W; background.height = H;
  (function paintGlowSprite() {
    const c = GLOW.getContext('2d'), g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,231,170,1)'); g.addColorStop(.22, 'rgba(255,197,105,.72)');
    g.addColorStop(.55, 'rgba(255,150,55,.2)'); g.addColorStop(1, 'rgba(255,130,40,0)');
    c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  })();
  (function paintVignette() {
    const c = vignette.getContext('2d');
    const g = c.createRadialGradient(LAMP.x, LAMP.y + 60, 90, LAMP.x, LAMP.y + 60, W * .88);
    g.addColorStop(0, 'rgba(3,5,9,0)'); g.addColorStop(.45, 'rgba(3,5,9,.16)');
    g.addColorStop(.78, 'rgba(2,4,7,.55)'); g.addColorStop(1, 'rgba(1,2,4,.96)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const floor = c.createLinearGradient(0, H * .58, 0, H);
    floor.addColorStop(0, 'rgba(2,3,6,0)'); floor.addColorStop(1, 'rgba(1,2,4,.5)');
    c.fillStyle = floor; c.fillRect(0, H * .58, W, H * .42);
  })();
  // The rig is drawn squashed around the pivot, so its lantern moves with objectAspect.
  function lampSpot() { return { x: LAMP.x, y: origin.y + (LAMP.y - origin.y) * objectAspect }; }
  art.paintLight(cone, LAMP);
  // Switching styles repaints the static layers; nothing else depends on the provider.
  function applyArt(name) {
    if (!ART_PROVIDERS[name]) return;
    artName = name; art = window[ART_PROVIDERS[name]];
    document.documentElement.dataset.art = artName;
    try { localStorage.setItem('gm-art', artName); } catch {}
    art.paintLight(cone, lampSpot());
    paintBackground(level);
  }
  function drawGlow(x, y, r, now, spread = 4.6, base = .42, aspect = 1) {
    const pulse = .72 + Math.sin(now * .0031 + x * .045 + y * .027) * .28;
    const s = r * spread * (.86 + pulse * .22);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = base * pulse;
    ctx.drawImage(GLOW, x - s / 2, y - s * aspect / 2, s, s * aspect);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  // Paint the rock once per mine; the moving hook and treasures use the foreground canvas.
  // The backing canvas matches the screen, so baked grain stays crisp at any size.
  // view.top/bottom are the visible field rows beyond 0..H the art must also cover.
  function paintBackground(seed = 0) {
    background.width = canvas.width; background.height = canvas.height;
    background.getContext('2d').setTransform(fit.sx, 0, 0, fit.sy, 0, fit.oy);
    art.paintBackground(background, seed, lampSpot(), { top: -fit.oy / fit.sy, bottom: (canvas.height - fit.oy) / fit.sy, aspect: objectAspect });
  }
  // The rig: timber headframe, winch, ore cart heaped with gold, and the one lantern that lights the shaft.
  function drawRig(now) {
    const flicker = .82 + Math.sin(now * .013) * .06 + Math.sin(now * .041) * .05 + Math.sin(now * .0073) * .05;
    ctx.fillStyle = '#3a2a17';
    ctx.save(); ctx.translate(520, 132); ctx.rotate(-.19); ctx.fillRect(-7, -50, 14, 52); ctx.fillStyle = 'rgba(214,166,96,.3)'; ctx.fillRect(-7, -50, 3, 52); ctx.restore();
    ctx.fillStyle = '#3a2a17';
    ctx.save(); ctx.translate(580, 132); ctx.rotate(.19); ctx.fillRect(-7, -50, 14, 52); ctx.fillStyle = 'rgba(214,166,96,.22)'; ctx.fillRect(4, -50, 3, 52); ctx.restore();
    ctx.fillStyle = '#4a361e'; ctx.fillRect(505, 80, 90, 11);
    ctx.fillStyle = 'rgba(224,176,104,.34)'; ctx.fillRect(505, 80, 90, 2.5);
    line([[520, 96], [580, 96]], '#33260f', 4);
    ellipse(550, 106, 20, 20, '#1f1a13');
    ellipse(550, 106, 16, 16, '#5c4e39');
    ellipse(550, 106, 7, 7, '#14110d');
    for (let i = 0; i < 6; i++) {
      const a = crankAngle * .35 + i * Math.PI / 3;
      line([[550, 106], [550 + Math.cos(a) * 15, 106 + Math.sin(a) * 15]], '#82704e', 2);
    }
    // The crank turns with the cable: forward while reeling, backward as the claw pays out.
    const handleX = 550 + Math.cos(crankAngle) * 13, handleY = 106 + Math.sin(crankAngle) * 13;
    line([[550, 106], [handleX, handleY]], '#6b5738', 5);
    ellipse(handleX, handleY, 4.5, 4.5, '#a58b5c');
    const [elbowX, elbowY, handX, handY] = reach(488, 92, handleX, handleY, 37, 39);
    // Ore cart: rusted steel hopper on iron wheels, heaped past the rim.
    const cart = () => { ctx.beginPath(); ctx.moveTo(646, 94); ctx.lineTo(780, 94); ctx.lineTo(764, 132); ctx.lineTo(662, 132); ctx.closePath(); };
    cart();
    const steel = ctx.createLinearGradient(646, 94, 780, 132);
    steel.addColorStop(0, '#c49a58'); steel.addColorStop(.12, '#655442'); steel.addColorStop(.38, '#333532'); steel.addColorStop(.52, '#777062'); steel.addColorStop(.56, '#3b3932'); steel.addColorStop(.85, '#24231f'); steel.addColorStop(1, '#0c1010');
    ctx.fillStyle = steel; ctx.fill();
    ctx.strokeStyle = '#6f5f4a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); cart(); ctx.clip();
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(646, 120, 134, 14);
    line([[646,95],[780,95]], '#edc47b', 1); line([[650,98],[777,98]], '#171914', 2);
    ctx.globalAlpha=.4; ctx.drawImage(art.surface(404,60,true),646,94,134,40); ctx.globalAlpha=1;
    ctx.restore();
    // Gold heaped over the rim, irregular as it was shovelled in.
    const jitter = n => { const v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); };
    for (let i = 0; i < 13; i++) {
      const gx = 648 + i * 10.5 + jitter(i) * 7, gy = 92 - Math.sin(i * .9) * 6 - jitter(i + 7) * 8;
      const s = .8 + jitter(i + 3) * .55;
      polygon([[gx - 8 * s, gy + 5 * s], [gx - 6 * s, gy - 5 * s], [gx + 2 * s, gy - 9 * s], [gx + 8 * s, gy - 1 * s], [gx + 4 * s, gy + 6 * s]], '#987022', '#4e3516');
      polygon([[gx - 6 * s, gy - 5 * s], [gx + 2 * s, gy - 9 * s], [gx + 1 * s, gy - 2 * s], [gx - 3 * s, gy + 1 * s]], '#dbb662');
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = .22 * flicker;
    ctx.drawImage(GLOW, 662, 46, 130, 110);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    for (const wx of [666, 758]) {
      ellipse(wx, 133, 12, 12, '#0f0d0b'); ellipse(wx, 133, 7, 7, '#3a3128');
      ellipse(wx - 2, 130, 2.2, 2.2, '#9c8867');
    }
    // Riveted reinforcing straps and scored steel panels on the cart.
    for (const x of [669, 707, 751]) {
      line([[x, 98], [x + (713 - x) * .12, 126]], '#89704766', 3);
      for (const y of [101, 123]) { ellipse(x, y, 1.7, 1.7, '#0b100e'); ellipse(x-.4,y-.5,.65,.65,'#b99b62'); }
    }
    for (let i=0;i<15;i++) line([[659+i*7,108+i%4],[669+i*7,107+i%4]], '#b6975522', .6);
    // Lantern post and the single light of the mine.
    line([[622, 94], [622, 80]], '#241d15', 4);
    line([[613, 76], [631, 76]], '#241d15', 3);
    ellipse(LAMP.x, LAMP.y, 12, 14, '#1c1610');
    ellipse(LAMP.x, LAMP.y, 9, 11, 'rgba(255,190,96,' + (.9 * flicker) + ')');
    ellipse(LAMP.x, LAMP.y + 2, 4.5, 5.5, 'rgba(255,246,214,' + flicker + ')');
    ellipse(LAMP.x, LAMP.y - 14, 7, 3, '#544527');
    ellipse(LAMP.x, LAMP.y + 12, 8, 3, '#55401e');
    for (const x of [LAMP.x-7,LAMP.x+7]) line([[x,LAMP.y-10],[x,LAMP.y+11]], '#3a321d', 1.7);
    ctx.beginPath(); ctx.arc(LAMP.x,LAMP.y-16,5,Math.PI,0); ctx.strokeStyle='#96723a'; ctx.lineWidth=1.5; ctx.stroke();
    line([[LAMP.x-5,LAMP.y-8],[LAMP.x-5,LAMP.y+7]], '#fff2b8', 1);
    line([[LAMP.x-8,LAMP.y+12],[LAMP.x+8,LAMP.y+12]], '#d2a44c', 1);
    // The miner: a silhouette rimmed by his own lantern.
    ctx.save();
    ctx.fillStyle = '#05060a'; ctx.strokeStyle = '#05060a'; ctx.lineCap = 'round';
    ctx.lineWidth = 9;                                                                          // far arm
    ctx.beginPath(); ctx.moveTo(480, 88); ctx.lineTo(468, 112); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(482, 86); ctx.lineTo(elbowX, elbowY); ctx.lineTo(handX, handY); ctx.stroke(); // near arm on the crank
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(452, 110); ctx.lineTo(446, 134); ctx.lineTo(460, 134); ctx.lineTo(468, 112); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(470, 112); ctx.lineTo(474, 134); ctx.lineTo(488, 134); ctx.lineTo(490, 110); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(444, 86); ctx.quadraticCurveTo(468, 78, 494, 88);
    ctx.lineTo(488, 114); ctx.quadraticCurveTo(468, 120, 450, 112); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(469, 70, 11, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(452, 68); ctx.quadraticCurveTo(469, 51, 487, 68); ctx.closePath(); ctx.fill();
    ctx.fillRect(450, 66, 39, 3.6);
    ctx.fillStyle = 'rgba(255,238,196,' + (.5 + flicker * .4) + ')';                            // cap lamp
    ctx.beginPath(); ctx.arc(479, 62, 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,188,106,.5)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(486, 68); ctx.quadraticCurveTo(480, 70, 480, 74); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(494, 88); ctx.lineTo(488, 114); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(490, 110); ctx.lineTo(488, 134); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(460, 134); ctx.lineTo(467, 112); ctx.stroke();
    const coat = ctx.createLinearGradient(451,85,492,112);
    coat.addColorStop(0,'#121a19'); coat.addColorStop(1,'#484230');
    polygon([[451,88],[471,84],[488,90],[485,111],[456,111]], coat);
    line([[465,88],[463,109]], '#887343', 2);
    line([[482,89],[479,109]], '#887343', 2);
    polygon([[471,72],[481,70],[481,79],[475,84],[469,78]], '#8f734b');
    polygon([[469,76],[481,76],[478,85],[472,83]], '#a49b7b');
    line([[488,92],[elbowX,elbowY],[handX,handY]], '#514c37', 7);
    ellipse(handX,handY,4,3,'#a38a58');
    line([[453,115],[450,130]], '#25312c', 8);
    line([[476,115],[480,130]], '#30382e', 8);
    line([[449,133],[459,133]], '#121512', 4);
    line([[478,133],[490,133]], '#121512', 4);
    ctx.restore();
    return flicker;
  }
  // Two-bone reach: the elbow bends downward and the hand stops at full stretch.
  function reach(sx, sy, tx, ty, upper, fore) {
    const d = Math.max(1, Math.min(upper + fore - .01, Math.hypot(tx - sx, ty - sy))), base = Math.atan2(ty - sy, tx - sx);
    const bend = Math.acos(Math.max(-1, Math.min(1, (upper * upper + d * d - fore * fore) / (2 * upper * d))));
    return [sx + Math.cos(base + bend) * upper, sy + Math.sin(base + bend) * upper, sx + Math.cos(base) * d, sy + Math.sin(base) * d];
  }
  // A segmented steel chain: every link drawn, bowed and vibrating under load.
  function drawChain(from, to, tension, now) {
    const dx = to.x - from.x, dy = to.y - from.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const links = Math.max(3, Math.min(110, Math.round(dist / 8)));
    const nx = -dy / dist, ny = dx / dist;
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3.4; ctx.stroke();
    for (let i = 1; i <= links; i++) {
      const t = i / links;
      const wobble = Math.sin(t * Math.PI) * (tension + Math.sin(now * .05 + t * 9) * tension * .5);
      const x = from.x + dx * t + nx * wobble, y = from.y + dy * t + ny * wobble;
      const a = Math.atan2(dy, dx) + (i % 2 ? 0 : Math.PI / 2);
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      const rx = 5.2, ry = 3.2;
      ctx.beginPath(); ctx.ellipse(0, .8, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#26231e'; ctx.lineWidth = 2.1; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = i % 3 ? '#6b6659' : '#514d44'; ctx.lineWidth = 1.3; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-.4, -.6, rx * .74, ry * .44, 0, Math.PI, Math.PI * 2);
      ctx.strokeStyle = 'rgba(206,198,172,.55)'; ctx.lineWidth = .7; ctx.stroke();
      ctx.restore();
    }
  }
  function drawClaw(p, now) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1, objectAspect); ctx.rotate(-angle);
    if (magnetArmed) drawGlow(0, 0, 16, now, 5, .25);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = .24;
    ctx.drawImage(GLOW, -50, -50, 100, 100);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    for (const spread of [-1.2, -.44, .44, 1.2]) {
      const a = spread * (caught ? .48 : 1);          // four open prongs
      ctx.save(); ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(-3.4, -3); ctx.quadraticCurveTo(-10, 9, -4.4, 20);
      ctx.quadraticCurveTo(-.4, 23.5, 2.6, 19.5); ctx.quadraticCurveTo(.6, 9, 3.4, -2);
      ctx.closePath();
      const jaw = ctx.createLinearGradient(-4, -3, 3, 21);
      jaw.addColorStop(0, '#9c9686'); jaw.addColorStop(.42, '#5b564d'); jaw.addColorStop(1, '#232019');
      ctx.fillStyle = jaw; ctx.fill();
      ctx.strokeStyle = '#12100d'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-2.6, 1); ctx.quadraticCurveTo(-6.4, 10, -2.6, 18.5);
      ctx.strokeStyle = 'rgba(232,222,196,.72)'; ctx.lineWidth = 1.7; ctx.stroke();
      ctx.restore();
    }
    ellipse(0, -2, 9.5, 8, '#2b271f');
    ellipse(0, -2, 7.5, 6, '#6b6555');
    ellipse(-1.6, -3.4, 3.4, 2.4, '#b8b096');
    ctx.fillStyle = '#3a352c'; ctx.fillRect(-2, -12, 4, 7);
    ctx.beginPath(); ctx.arc(0, -13, 3, Math.PI, 0);
    ctx.strokeStyle = '#6b6555'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
  function drawParticles() {
    for (const p of particles) {
      const fade = Math.max(0, p.life / p.max);
      if (p.kind === 'stone') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = fade * .95;
        ctx.beginPath(); ctx.moveTo(-p.size, -p.size * .4); ctx.lineTo(0, -p.size); ctx.lineTo(p.size, -p.size * .2);
        ctx.lineTo(p.size * .5, p.size); ctx.lineTo(-p.size * .7, p.size * .6); ctx.closePath();
        ctx.fillStyle = '#5a564c'; ctx.fill();
        ctx.fillStyle = 'rgba(206,190,152,.4)';
        ctx.beginPath(); ctx.moveTo(-p.size, -p.size * .4); ctx.lineTo(0, -p.size); ctx.lineTo(p.size * .2, -p.size * .3); ctx.closePath(); ctx.fill();
        ctx.restore();
      } else {
        const s = p.size * (1 + (1 - fade) * 2.6);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = fade * .85;
        ctx.drawImage(GLOW, p.x - s * 2.4, p.y - s * 2.4, s * 4.8, s * 4.8);
        ctx.globalAlpha = fade;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = '#ffe9a8';
        ctx.beginPath(); ctx.moveTo(0, -s * .8); ctx.lineTo(s * .42, 0); ctx.lineTo(0, s * .8); ctx.lineTo(-s * .42, 0);
        ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  function draw(now) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(fit.sx, 0, 0, fit.sy, 0, fit.oy);
    const screen = [0, -fit.oy / fit.sy, W, canvas.height / fit.sy];   // the whole canvas, in field units
    ctx.save();
    const amp = shakeMag * (shakeTime / .4);
    if (amp > .08) ctx.translate(Math.sin(now * .09) * amp, Math.cos(now * .13) * amp * .7);
    ctx.drawImage(background, ...screen);
    art.drawAmbient?.(ctx, now, { aspect: objectAspect });
    // No ctx.filter here: a full-scene filter halved the frame rate.
    ctx.save();
    const litScene = art.lit !== false;
    ctx.save(); ctx.translate(origin.x, origin.y); ctx.scale(1, objectAspect); ctx.translate(-origin.x, -origin.y);
    const flicker = drawRig(now); ctx.restore();
    if (litScene) {
      // Light and haze before the treasure so gold sits inside the glow.
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .7 * flicker;
      ctx.drawImage(cone, 0, 0);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    // Dust motes drifting through the beam.
    for (let i = 0; litScene && i < 64; i++) {
      const t = now * .00004 + i * .137;
      const dx = LAMP.x + Math.sin(i * 2.7 + now * .0004) * (60 + i * 9);
      const dy = LAMP.y + ((t * 900 + i * 63) % (H + 60));
      const near = 1 - Math.min(1, Math.abs(dx - LAMP.x) / 620);
      ctx.globalAlpha = .055 + near * .24 * (.6 + Math.sin(now * .002 + i) * .4);
      ctx.fillStyle = '#ffdca4';
      const size = .45 + (i % 3) * .4;
      ctx.fillRect(dx, dy, size, size);
    }
    ctx.globalAlpha = 1;
    // Contact shadow: the catwalk edge swallows the first few pixels of rock.
    if (litScene) {
      const lip = ctx.createLinearGradient(0, 145, 0, 192);
      lip.addColorStop(0, 'rgba(0,0,0,.6)'); lip.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lip; ctx.fillRect(396, 145, 404, 47);
    }
    for (const o of objects) {
      if (o.taken) continue;
      // Ambient occlusion: the rock is darker right around a buried object.
      ctx.save(); ctx.translate(o.x, o.y); ctx.scale(1, objectAspect);
      const ao = ctx.createRadialGradient(0, 0, o.radius * .9, 0, 0, o.radius * 2.1);
      ao.addColorStop(0, 'rgba(0,0,0,.3)'); ao.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ao;
      ctx.fillRect(-o.radius * 2.1, -o.radius * 2.1, o.radius * 4.2, o.radius * 4.2);
      ctx.restore();
      if (o.type === 'rock') ctx.globalAlpha = .92;
      if (o.type !== 'rock' && o.type !== 'tnt' && !o.speed) drawGlow(o.x, o.y, o.radius, now, o.type === 'diamond' || o.type === 'gem' ? 3.4 : 3.7, o.type === 'large' ? .24 : .2, objectAspect);
      drawObject(o);
      ctx.globalAlpha = 1;
      if (now < revealUntil && o.value > 0) {
        ctx.save(); ctx.translate(o.x, o.y - (o.radius + 10) * objectAspect); ctx.scale(1, objectAspect);
        ctx.font = '600 12px Georgia'; ctx.textAlign = 'center'; ctx.lineWidth = 4;
        ctx.strokeStyle = '#080c0e'; ctx.strokeText(money(o.value), 0, 0);
        ctx.fillStyle = '#f1ce7e'; ctx.fillText(money(o.value), 0, 0);
        ctx.restore();
      }
    }
    const p = hookPosition();
    const reel = hookState === 'back' && caught ? Math.min(1, caught.weight / 4) : 0;
    drawChain({ x: origin.x, y: origin.y - 20 * objectAspect }, p, hookState === 'back' ? .6 + reel * 1.6 : 3, now);
    if (caught) drawObject(caught, p.x, p.y + caught.radius * .95 * objectAspect);
    drawClaw(p, now);   // the claw grips from above, so it draws over the catch
    // A faint second pass warms the treasure without obscuring its silhouette.
    if (litScene) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = .16 * flicker;
      ctx.drawImage(cone, 0, 0);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();   // ends the scene layer
    drawParticles();
    for (const pop of popups) {
      const grow = Math.min(1, (1.6 - pop.life) * 6), alpha = Math.min(1, pop.life);
      ctx.save(); ctx.globalAlpha = alpha;
      ctx.translate(pop.x, pop.y); ctx.scale(.6 + grow * .4, (.6 + grow * .4) * objectAspect);
      ctx.font = '700 32px Fraunces, Georgia, serif'; ctx.textAlign = 'center';
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(GLOW, -70, -55, 140, 110);
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(12,9,4,.9)'; ctx.strokeText(pop.text, 0, 0);
      const grad = ctx.createLinearGradient(0, -22, 0, 8);
      grad.addColorStop(0, '#fff6d2'); grad.addColorStop(.5, '#ffd05e'); grad.addColorStop(1, '#e79a24');
      ctx.fillStyle = grad; ctx.fillText(pop.text, 0, 0);
      ctx.restore();
    }
    if (litScene) ctx.drawImage(vignette, ...screen);
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (flash) { ctx.fillStyle = `rgba(${flash.rgb},${flash.a})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    if (banner) drawBanner(now);
    $('toast').classList.toggle('visible', now < toastUntil);
  }
  // Title cards are drawn in screen pixels so they read the same on phones and monitors.
  function drawBanner(now) {
    const t = (now - banner.start) / 1000, hold = 1.9;
    if (t > hold + .5) { banner = null; return; }
    const enter = 1 - Math.pow(1 - Math.min(1, t / .4), 3), alpha = enter * (1 - Math.max(0, (t - hold) / .5));
    const cw = canvas.width, size = Math.min(cw * .06, canvas.height * .085), cy = fit.oy + H * fit.sy * .42;
    const tint = art.bannerTint || '4,8,10', band = ctx.createLinearGradient(0, 0, cw, 0);
    band.addColorStop(0, `rgba(${tint},0)`); band.addColorStop(.22, `rgba(${tint},.8)`);
    band.addColorStop(.78, `rgba(${tint},.8)`); band.addColorStop(1, `rgba(${tint},0)`);
    const rule = ctx.createLinearGradient(0, 0, cw, 0);
    rule.addColorStop(0, 'rgba(232,197,122,0)'); rule.addColorStop(.5, 'rgba(232,197,122,.9)'); rule.addColorStop(1, 'rgba(232,197,122,0)');
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.fillStyle = band; ctx.fillRect(0, cy - size * 1.4, cw, size * 2.75);
    ctx.fillStyle = rule; const hair = Math.max(1, size * .03);
    ctx.fillRect(0, cy - size * 1.4, cw, hair); ctx.fillRect(0, cy + size * 1.35 - hair, cw, hair);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.round(size * .26)}px Arial, sans-serif`; ctx.letterSpacing = `${Math.round(size * .08)}px`;
    ctx.fillStyle = '#e8c57a'; ctx.fillText(banner.kicker, cw / 2, cy - size * .88);
    ctx.letterSpacing = '0px';
    ctx.font = `700 ${Math.round(size)}px Georgia, serif`;
    const fitWidth = Math.min(1, cw * .9 / ctx.measureText(banner.title).width), grow = calm.matches ? 1 : 1.12 - .12 * enter;
    ctx.save(); ctx.translate(cw / 2, cy); ctx.scale(fitWidth * grow, fitWidth * grow);
    const ink = ctx.createLinearGradient(0, -size * .5, 0, size * .5);
    ink.addColorStop(0, '#fff6d2'); ink.addColorStop(.5, '#ffd05e'); ink.addColorStop(1, '#d98f22');
    ctx.lineWidth = size * .1; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(12,8,3,.9)'; ctx.strokeText(banner.title, 0, 0);
    ctx.fillStyle = ink; ctx.fillText(banner.title, 0, 0);
    ctx.restore();
    ctx.font = `${Math.round(size * .3)}px Arial, sans-serif`; ctx.fillStyle = '#f3e7cf';
    ctx.fillText(banner.detail, cw / 2, cy + size * .86);
    ctx.restore();
  }
  function frame(now) {
    const elapsed = Math.min((now-lastFrame)/1000 || 0, .1);lastFrame=now;
    if (flash && (flash.a -= elapsed * 2.4) <= 0) flash = null;
    // Small physics steps keep a fast hook from tunneling through tiny diamonds.
    if (hitStop > 0) hitStop -= elapsed;
    else {let remaining=elapsed;while(remaining>0){const step=Math.min(remaining,1/120);update(step,now);remaining-=step;}}
    if (phase === 'playing' && now - lastSave >= 1000) saveProgress();
    draw(now);requestAnimationFrame(frame);
  }
  function updateSound(){ $('sound-toggle').checked = sound; }
  // Music is a quiet procedural mine drone; settings persist in localStorage, progress in Dexie.
  let music = false, musicNodes = null, shakeScale = 1;
  try {
    music = localStorage.getItem('gm-music') === '1';
    const setting = localStorage.getItem('gm-shake'), stored = Number(setting);
    if (setting !== null && Number.isFinite(stored) && stored >= 0 && stored <= 1) shakeScale = stored;
  } catch {}
  function updateMusic() {
    if (music && musicNodes) { audio.resume(); return; }
    if (music) {
      try {
        audio ||= new (window.AudioContext || window.webkitAudioContext)();
        audio.resume();
        const master = audio.createGain();
        master.gain.value = 0; master.connect(audio.destination);
        const filter = audio.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 320; filter.connect(master);
        const oscs = [55, 82.5, 110].map(f => {
          const osc = audio.createOscillator(), gain = audio.createGain();
          osc.type = 'triangle'; osc.frequency.value = f; gain.gain.value = .18;
          osc.connect(gain); gain.connect(filter); osc.start();
          return osc;
        });
        const lfo = audio.createOscillator(), lfoGain = audio.createGain();
        lfo.frequency.value = .09; lfoGain.gain.value = .05;
        lfo.connect(lfoGain); lfoGain.connect(master.gain); lfo.start();
        master.gain.linearRampToValueAtTime(.16, audio.currentTime + 1.2);
        musicNodes = { master, oscs: [...oscs, lfo] };
      } catch { music = false; $('music-toggle').checked = false; }
    } else if (musicNodes) {
      musicNodes.master.gain.linearRampToValueAtTime(0, audio.currentTime + .5);
      const nodes = musicNodes; musicNodes = null;
      setTimeout(() => nodes.oscs.forEach(o => { try { o.stop(); } catch {} }), 600);
    }
  }
  $('settings').onclick = () => { $('settings-overlay').hidden = false; $('settings-close').focus(); };
  $('settings-close').onclick = () => { $('settings-overlay').hidden = true; if (!$('welcome-overlay').hidden) $('welcome-new').focus(); else canvas.focus({ preventScroll: true }); };
  $('settings-overlay').addEventListener('pointerdown', event => { if (event.target === $('settings-overlay')) $('settings-close').onclick(); });
  $('sound-toggle').onchange = () => { sound = $('sound-toggle').checked; sfx('ui'); saveProgress(); };
  $('music-toggle').onchange = () => { music = $('music-toggle').checked; try { localStorage.setItem('gm-music', music ? '1' : '0'); } catch {} updateMusic(); };
  $('shake-range').oninput = () => { shakeScale = $('shake-range').value / 100; try { localStorage.setItem('gm-shake', String(shakeScale)); } catch {} };
  $('sound-toggle').checked = sound;
  $('music-toggle').checked = music;
  $('shake-range').value = Math.round(shakeScale * 100);
  for (const radio of document.querySelectorAll('input[name=art]')) {
    radio.checked = radio.value === artName;
    radio.onchange = () => { if (radio.checked) applyArt(radio.value); };
  }
  // Press feedback: a gold-dust burst where the finger lands, drawn by the canvas particle system.
  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect(), dpr = canvas.width / rect.width;
    return { x: (event.clientX - rect.left) * dpr / fit.sx, y: ((event.clientY - rect.top) * dpr - fit.oy) / fit.sy };
  }
  for (const button of document.querySelectorAll('.action-item')) {
    button.addEventListener('pointerdown', event => { if (!button.disabled) burst(canvasPoint(event), 'gold'); });
  }
  $('strength-item').onclick = () => notify(`Strength active: ${strengthBonus}× pulling speed for this mine.`);
  $('book-item').onclick = () => { if (phase === 'playing' && book) { revealUntil = performance.now() + 6000; sfx('sparkle'); } };
  $('magnet-item').onclick = () => {
    if (phase !== 'playing' || !magnet || hookState !== 'swing') return;
    magnetArmed = !magnetArmed; sfx('ui'); updateHUD(); saveProgress();
    notify(magnetArmed ? 'Magnetic claw armed for your next launch.' : 'Magnetic claw stowed.');
  };
  $('dynamite').onclick=explode;$('pause').onclick=pause;
  canvas.addEventListener('pointerdown',event=>{event.preventDefault();canvas.focus({preventScroll:true});if(music&&audio)audio.resume();drop();});
  document.addEventListener('keydown',event=>{
    if(event.key==='Tab'&&!$('overlay').hidden){const buttons=[...$('dialog').querySelectorAll('button:not(:disabled)')];const first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}return;}
    if(event.repeat)return;
    if(event.key==='Escape'&&!$('settings-overlay').hidden){$('settings-close').onclick();return;}
    if(event.key==='Escape'||event.key.toLowerCase()==='p'){pause();return;}
    if(phase!=='playing')return;
    if(event.key==='ArrowDown'||(event.code==='Space'&&document.activeElement.tagName!=='BUTTON')){event.preventDefault();drop();}
    if(event.key.toLowerCase()==='d'){event.preventDefault();explode();}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(phase==='playing')pause();else saveProgress();}});
  window.addEventListener('pagehide',()=>{if(phase==='playing')pause();else saveProgress();});
  paintBackground();objects=makeMap(0);updateHUD();
  const welcome = $('welcome-overlay');
  function showWelcome() { welcome.hidden = false; welcome.querySelector('button:not(:disabled)')?.focus(); }
  // Probe storage so Continue only lights up for a usable expedition.
  db.saves.get('expedition')
    .then(save => {
      const available = validSave(save);
      $('welcome-continue').disabled = !available;
      $('welcome-continue').title = available ? 'Resume your saved expedition' : 'Start a new game to save an expedition';
    })
    .catch(() => {
      $('welcome-continue').disabled = true;
      $('welcome-continue').title = 'Saved progress is unavailable in this browser';
    });
  $('welcome-new').onclick = () => {
    welcome.hidden = true;
    mapVersion = 3; level = 0; bank = 0; dynamite = 0; strength = false; book = false; magnet = false;
    startLevel();
  };
  $('welcome-continue').onclick = async () => {
    if ($('welcome-continue').disabled) return;
    $('welcome-continue').disabled = true;
    $('welcome-new').disabled = true;
    $('welcome-continue').setAttribute('aria-busy', 'true');
    const loaded = await loadProgress();
    $('welcome-continue').removeAttribute('aria-busy');
    $('welcome-new').disabled = false;
    $('welcome-continue').disabled = false;
    welcome.hidden = loaded;
    if (loaded) $('dialog').querySelector('button')?.focus();
    else showWelcome();
  };
  $('welcome-guide').onclick = () => {
    welcome.hidden = true;
    showDialog(`<span class="badge">MINER’S HANDBOOK</span><h2>How to dig</h2>
      <p><strong>Controls.</strong> ↓ / Space or tap the field to drop the claw. D fires dynamite. P or Esc pauses.</p>
      <p><strong>Mines.</strong> Reach the target within 60 seconds; leftover gold carries to the next shaft. Miss the target and you dig the same mine again.</p>
      <p><strong>Pacing.</strong> Every fifth mine is a challenge, followed by a breather. Gold-rich and gem-rich layouts alternate. Rocks pay a little, but treasure is worth your time.</p>
      <p><strong>Supplies shop.</strong> Between mines you spend surplus gold on gear. Prices rise with the next mine’s target:</p>
      <ul class="guide-items">
        <li><strong>Dynamite</strong> — destroys your current catch</li>
        <li><strong>Strength drink</strong> — ${strengthBonus}× pulling speed for the next mine</li>
        <li><strong>Diamond book</strong> — 1.5× diamond value for the next mine</li>
        <li><strong>Magnetic claw</strong> — wider gold capture; arm it before your next launch</li>
      </ul>
      <p>Diamonds are light and valuable, TNT destroys everything nearby, and mystery bags hold a surprise. Good digging!</p>
      <button class="primary" id="guide-back">Back</button>`);
    $('guide-back').onclick = showWelcome;
  };
  $('welcome-settings').onclick = () => { $('settings-overlay').hidden = false; $('settings-close').focus(); };
  showWelcome();
  requestAnimationFrame(frame);
})();
