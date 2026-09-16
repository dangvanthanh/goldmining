'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('mine'), ctx = canvas.getContext('2d');
  const W = 1100, H = 580, origin = { x: 550, y: 132 };
  let objectAspect = 1;
  new ResizeObserver(([entry]) => { const { width, height } = entry.contentRect; objectAspect = matchMedia('(max-aspect-ratio: 3/4)').matches ? Math.min(1, width * H / (height * W)) : 1; CavernArt.paintLight(cone, { x: LAMP.x, y: origin.y + (LAMP.y - origin.y) * objectAspect }); }).observe(canvas);
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
  const types = {
    small: { radius: 17, value: 175, weight: 1, color: '#eabc52' },
    gold: { radius: 29, value: 450, weight: 2, color: '#edbc50' },
    large: { radius: 43, value: 950, weight: 3.6, color: '#f2c45e' },
    rock: { radius: 34, value: 15, weight: 5.5, color: '#6e7166' },
    diamond: { radius: 16, value: 650, weight: .8, color: '#b3efeb' },
    gem: { radius: 19, value: 325, weight: .9, color: '#95bdaa' },
    bag: { radius: 22, value: 0, weight: 1, color: '#c8a071' },
    tnt: { radius: 25, value: 0, weight: 1, color: '#ba4938' },
    pig: { radius: 26, value: 10, weight: .7, speed: 65, color: '#a0846a' },
    diamondPig: { radius: 32, value: 660, weight: .8, speed: 150, color: '#9d7968' }
  };
  const blastRadius = 120, diamondBonus = 1.5, dynamiteCapacity = 3;
  let level = 0, bank = 0, haul = 0, time = 60, phase = 'ready', objects = [];
  let angle = 0, swing = 0, length = 23, hookState = 'swing', caught = null;
  let dynamite = 0, strength = false, book = false, sound = false, audio;
  let magnet = false, magnetArmed = false, revealUntil = 0, reelSpeed = 0;
  let lastFrame = 0, deadline = 0, toastUntil = 0, particles = [], popups = [], shakeMag = 0, shakeTime = 0;
  const money = n => '$' + n.toLocaleString('en-US');
  let db, saveQueue = Promise.resolve(), lastSave = 0;
  function storageError(error) {
    console.warn('Gold Mining save unavailable:', error);
    notify('Progress could not be saved. Keep this tab open.');
  }
  function saveProgress() {
    if (!db || phase === 'ready') return;
    const snapshot = {
      id: 'expedition', version: 1, level, bank, haul,
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
    const map = makeMap(s.level);
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
      db = new Dexie('GoldMining');
      db.version(1).stores({ saves: 'id' });
      const s = await db.saves.get('expedition');
      if (!s) return false;
      if (!validSave(s)) throw new Error('Invalid or unsupported save data');
      ({ level, bank, haul, time, angle, swing, length, hookState, dynamite, strength, book, sound } = s);
      magnet = s.magnet ?? false; magnetArmed = s.magnetArmed ?? false;
      objects = makeMap(level);
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
      db = null;
      storageError(error);
      return false;
    }
  }
  function random(seed) {
    return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  }
  function makeMap(index) {
    const rand = random(1849 + index * 719);
    // Keep placement and IDs stable; value tuning must not consume extra random numbers.
    const density = Math.min(index, 9);
    const kinds = ['large', 'large', 'gold', 'gold', 'small', 'small', 'diamond', 'gem', 'bag', 'rock', 'rock'];
    for (let i = 0; i < density; i++) kinds.push(i % 2 ? 'large' : 'diamond');
    for (let i = 0; i < Math.floor(density / 2); i++) kinds.push('rock');
    const map = kinds.map((type, id) => {
      const spec = types[type];
      return { type, id, ...spec, x: 0, y: 0, taken: false, rotation: rand() * .6 - .3, value: type === 'bag' ? 100 + Math.floor(rand() * 7) * 100 : spec.value };
    }).reduce((placed, obj) => {
      for (let attempt = 0; attempt < 500; attempt++) {
        obj.x = 85 + rand() * 930;
        obj.y = 220 + rand() * (300 - obj.radius);
        if (placed.every(other => Math.hypot(obj.x - other.x, obj.y - other.y) > obj.radius + other.radius + 18)) break;
      }
      placed.push(obj); return placed;
    }, []);
    // Require 26%, 36%, 46%, then 52% of stationary treasure at mines 1, 15, 50, 100.
    // Pigs remain optional upside; the budget leaves room for missed catches and upgrades.
    const targetShare = .26 + .10 * Math.min(index / 14, 1)
      + .10 * Math.max(0, Math.min((index - 14) / 35, 1))
      + .06 * Math.max(0, Math.min((index - 49) / 50, 1));
    const treasure = map.filter(obj => obj.type !== 'rock');
    const richness = levels[index][1] / (targetShare * treasure.reduce((sum, obj) => sum + obj.value, 0));
    treasure.forEach(obj => { obj.value = Math.round(obj.value * richness); });
    // Append hazards after placing treasure so existing saves retain their object IDs and positions.
    const count = Math.min(6, 1 + Math.floor(index / 4));
    const hazards = Array(count).fill('tnt');
    // Patrol counts are rolled per level, so no two mines load the same guard detail.
    const pigTier = Math.min(3, 1 + Math.floor(index / 5));
    hazards.push(...Array(Math.floor(rand() * (pigTier + 1))).fill('pig'));
    const diamondTier = index < 9 ? 0 : index >= 19 ? 2 : 1;
    hazards.push(...Array(Math.floor(rand() * (diamondTier + 1))).fill('diamondPig'));
    for (const type of hazards) {
      const obj = { type, id: map.length, ...types[type], taken: false, rotation: rand() * .6 - .3 };
      if (type === 'diamondPig') obj.value = 10 + Math.round(types.diamond.value * richness);
      for (let attempt = 0; attempt < 500; attempt++) {
        obj.x = 85 + rand() * 930;
        obj.y = obj.speed ? 205 + rand() * (H - 245 - obj.radius) : 220 + rand() * 275;
        if (map.every(other => Math.hypot(obj.x - other.x, obj.y - other.y) > obj.radius + other.radius + (obj.speed ? 4 : 18))) {
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
  function tone(frequency = 660, duration = .12) {
    if (!sound) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      audio.resume();
      const oscillator = audio.createOscillator(), gain = audio.createGain();
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.08, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
      oscillator.start(); oscillator.stop(audio.currentTime + duration);
    } catch { sound = false; updateSound(); }
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
    hideDialog(); updateHUD(); saveProgress();
  }
  function finishLevel() {
    if (phase !== 'playing') return;
    time = 0;
    const total = bank + haul, goal = levels[level][1];
    if (total < goal) {
      phase = 'lost';
      renderResult();
    } else {
      bank = total - goal; haul = 0; strength = false; book = false;
      if (level === levels.length - 1) {
        phase = 'won';
        renderResult();
      } else { phase = 'shop'; renderShop(); }
      tone(880, .3);
    }
    updateHUD(); saveProgress();
  }
  function renderResult() {
    if (phase === 'lost') {
      showDialog(`<span class="badge">ANOTHER SHOT AT THE SEAM</span><h2>Chin up, miner!</h2><p>You brought in ${money(bank + haul)} of ${money(levels[level][1])}.<br>Try a new angle. Diamonds are light and valuable.</p><button class="primary" id="retry">Dig again ↻</button>`);
      $('retry').onclick = startLevel;
    } else {
      showDialog(`<span class="badge">${levels.length} SHAFTS. ONE LEGEND.</span><h2>What a haul!</h2><p>You worked all ${levels.length} mines and still carry ${money(bank)}.<br>The whole crew salutes you.</p><button class="primary" id="restart">A new expedition ↗</button>`);
      $('restart').onclick = () => { level = 0; bank = 0; dynamite = 0; strength = false; book = false; magnet = false; startLevel(); };
    }
  }
  function supplyPrices(index) {
    const goal = levels[index][1];
    // Scale sinks with the upcoming mine, rounded to readable $25 price steps.
    return {
      dynamite: Math.max(100, Math.ceil(goal * .035 / 25) * 25),
      strength: Math.max(200, Math.ceil(goal * .12 / 25) * 25),
      book: Math.max(300, Math.ceil(goal * .18 / 25) * 25),
      magnet: Math.max(150, Math.ceil(goal * .07 / 25) * 25)
    };
  }
  function renderShop() {
    const prices = supplyPrices(level + 1);
    showDialog(`<span class="badge">MINE ${String(level + 1).padStart(2, '0')} COMPLETE · SUPPLY SHACK</span><h2>Stock up, miner.</h2><p>Target met. Your surplus: <strong>${money(bank)}</strong><br>Next mine: ${levels[level + 1][0]} · Target ${money(levels[level + 1][1])}</p><div class="shop-items"><button class="shop-item" id="buy-dynamite" ${bank < prices.dynamite || dynamite >= dynamiteCapacity ? 'disabled' : ''}><span class="item-icon icon-dynamite" aria-hidden="true"></span><strong>Dynamite</strong><small>Destroy your catch<br>${dynamite}/${dynamiteCapacity} in your pack</small><span>${dynamite >= dynamiteCapacity ? 'Pack full' : money(prices.dynamite)}</span></button><button class="shop-item" id="buy-strength" ${bank < prices.strength || strength ? 'disabled' : ''}><span class="item-icon icon-potion" aria-hidden="true"></span><strong>Strength drink</strong><small>2× pulling speed<br>Next mine only</small><span>${strength ? 'Packed ✓' : money(prices.strength)}</span></button><button class="shop-item" id="buy-book" ${bank < prices.book || book ? 'disabled' : ''}><span class="item-icon icon-book" aria-hidden="true"></span><strong>Diamond book</strong><small>${diamondBonus}× diamond value<br>Next mine only</small><span>${book ? 'Packed ✓' : money(prices.book)}</span></button></div><p>Supplies cost part of your next goal. Save cash, or invest in a better haul.</p><button class="primary" id="next">On to mine ${level + 2} →</button>`);
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
    tone(540); renderShop(); updateHUD(); saveProgress();
  }
  function drop() {
    if (phase !== 'playing' || hookState !== 'swing') return;
    if (performance.now() >= deadline) { finishLevel(); return; }
    hookState = 'out'; reelSpeed = 0;
    if (magnetArmed) magnet = false;
    tone(230, .08); updateHUD(); saveProgress();
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
    tone(70, .35); notify('TNT! Nearby treasure destroyed. No points earned.');
    saveProgress();
  }
  function explode() {
    if (phase !== 'playing' || !caught || !dynamite) return;
    if (performance.now() >= deadline) { finishLevel(); return; }
    const pos = hookPosition();
    burst(pos, 'fire');
    shake(12);
    caught = null; dynamite--; tone(90, .25); notify('Catch destroyed. Back to the good stuff.'); updateHUD(); saveProgress();
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
    movePigs();
    if (hookState === 'swing') { swing += dt * 1.6; angle = Math.sin(swing) * 1.16; }
    else if (hookState === 'out') {
      length += 540 * dt;
      const p = hookPosition();
      // Match paint order when a patrolling pig crosses in front of stationary treasure.
      caught = objects.findLast(o => !o.taken && Math.hypot(o.x - p.x, (o.y - p.y) / objectAspect) < o.radius + 8
        + (magnetArmed && ['small', 'gold', 'large'].includes(o.type) ? 24 : 0)) || null;
      if (caught?.type === 'tnt') detonate(caught);
      else if (caught) {
        caught.taken = true; hookState = 'back'; tone(320, .08);
        const metal = caught.type === 'rock' ? 'stone' : 'gold';
        burst(p, metal);
        shake(caught.type === 'large' || caught.type === 'diamondPig' ? 7 : 3);
      }
      else if (p.x < 20 || p.x > W - 20 || p.y > H - 30) hookState = 'back';
    } else {
      const targetSpeed = 360 * (strength ? 2 : 1) / (caught ? caught.weight : .65);
      // Loaded reels take time to overcome inertia, while an empty claw snaps home.
      reelSpeed += (targetSpeed - reelSpeed) * (1 - Math.exp(-dt * (caught ? 4 : 12)));
      length -= reelSpeed * dt;
      if (length <= 23) {
        length = 23; hookState = 'swing'; magnetArmed = false;
        if (caught) {
          const value = caught.type === 'diamondPig'
            ? 10 + Math.round((caught.value - 10) * (book ? diamondBonus : 1))
            : Math.round(caught.value * (caught.type === 'diamond' && book ? diamondBonus : 1));
          haul += value;
          popups.push({ text: '+' + money(value), x: 700, y: 74, life: 1.6 });
          burst({ x: 550, y: 112 }, value >= 400 ? 'fire' : 'gold');
          shake(value >= 800 ? 16 : value >= 400 ? 11 : 5);
          if (caught.type === 'bag') notify('Mystery bag! You found ' + money(value) + '.');
          if (caught.type === 'diamondPig') notify('Diamond-mouth pig! ' + money(value) + ' secured.');
          tone(caught.type === 'rock' ? 180 : 780, .15); caught = null;
          saveProgress();
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
      ctx.drawImage(CavernArt.surface(obj.id, r, rocky), -r * 1.3, -r * 1.3, r * 2.6, r * 2.6);
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
  CavernArt.paintLight(cone, LAMP);
  function drawGlow(x, y, r, now, spread = 4.6, base = .42) {
    const pulse = .72 + Math.sin(now * .0031 + x * .045 + y * .027) * .28;
    const s = r * spread * (.86 + pulse * .22);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = base * pulse;
    ctx.drawImage(GLOW, x - s / 2, y - s / 2, s, s);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  // Paint the rock once per mine; the moving hook and treasures use the foreground canvas.
  function paintBackground(seed = 0) {
    CavernArt.paintBackground(background, seed, LAMP);
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
      const a = now * .0007 + i * Math.PI / 3;
      line([[550, 106], [550 + Math.cos(a) * 15, 106 + Math.sin(a) * 15]], '#82704e', 2);
    }
    const crank = now * .0025;
    line([[550, 106], [550 + Math.cos(crank) * 20, 106 + Math.sin(crank) * 20]], '#6b5738', 5);
    ellipse(550 + Math.cos(crank) * 20, 106 + Math.sin(crank) * 20, 4.5, 4.5, '#a58b5c');
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
    ctx.globalAlpha=.4; ctx.drawImage(CavernArt.surface(404,60,true),646,94,134,40); ctx.globalAlpha=1;
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
    ctx.beginPath(); ctx.moveTo(482, 86); ctx.quadraticCurveTo(516, 92, 536, 102); ctx.stroke(); // near arm to the crank
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
    line([[488,92],[511,99],[532,102]], '#514c37', 7);
    ellipse(532,102,4,3,'#a38a58');
    line([[453,115],[450,130]], '#25312c', 8);
    line([[476,115],[480,130]], '#30382e', 8);
    line([[449,133],[459,133]], '#121512', 4);
    line([[478,133],[490,133]], '#121512', 4);
    ctx.restore();
    return flicker;
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
    ctx.clearRect(-24, -24, W + 48, H + 48);
    ctx.save();
    const amp = shakeMag * (shakeTime / .4);
    if (amp > .08) ctx.translate(Math.sin(now * .09) * amp, Math.cos(now * .13) * amp * .7);
    ctx.drawImage(background, 0, 0);
    ctx.save(); ctx.translate(origin.x, origin.y); ctx.scale(1, objectAspect); ctx.translate(-origin.x, -origin.y);
    const flicker = drawRig(now); ctx.restore();
    // Light and haze before the treasure so gold sits inside the glow.
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = .7 * flicker;
    ctx.drawImage(cone, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // Dust motes drifting through the beam.
    for (let i = 0; i < 64; i++) {
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
    // Contact shadow: the platform edge swallows the first few pixels of rock.
    const lip = ctx.createLinearGradient(0, 145, 0, 192);
    lip.addColorStop(0, 'rgba(0,0,0,.6)'); lip.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lip; ctx.fillRect(396, 145, 404, 47);
    for (const o of objects) {
      if (o.taken) continue;
      // Ambient occlusion: the rock is darker right around a buried object.
      const ao = ctx.createRadialGradient(o.x, o.y, o.radius * .9, o.x, o.y, o.radius * 2.1);
      ao.addColorStop(0, 'rgba(0,0,0,.3)'); ao.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ao;
      ctx.fillRect(o.x - o.radius * 2.1, o.y - o.radius * 2.1, o.radius * 4.2, o.radius * 4.2);
      if (o.type === 'rock') ctx.globalAlpha = .92;
      if (o.type !== 'rock' && o.type !== 'tnt' && !o.speed) drawGlow(o.x, o.y, o.radius, now, o.type === 'diamond' || o.type === 'gem' ? 3.4 : 3.7, o.type === 'large' ? .24 : .2);
      drawObject(o);
      ctx.globalAlpha = 1;
      if (now < revealUntil && o.value > 0) {
        ctx.font = '600 12px Georgia'; ctx.textAlign = 'center'; ctx.lineWidth = 4;
        ctx.strokeStyle = '#080c0e'; ctx.strokeText(money(o.value), o.x, o.y - o.radius - 10);
        ctx.fillStyle = '#f1ce7e'; ctx.fillText(money(o.value), o.x, o.y - o.radius - 10);
      }
    }
    const p = hookPosition();
    const reel = hookState === 'back' && caught ? Math.min(1, caught.weight / 4) : 0;
    drawChain({ x: origin.x, y: origin.y - 20 * objectAspect }, p, hookState === 'back' ? .6 + reel * 1.6 : 3, now);
    if (caught) drawObject(caught, p.x, p.y + caught.radius * .95 * objectAspect);
    drawClaw(p, now);   // the claw grips from above, so it draws over the catch
    // A faint second pass warms the treasure without obscuring its silhouette.
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = .16 * flicker;
    ctx.drawImage(cone, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    drawParticles();
    for (const pop of popups) {
      const grow = Math.min(1, (1.6 - pop.life) * 6), alpha = Math.min(1, pop.life);
      ctx.save(); ctx.globalAlpha = alpha;
      ctx.translate(pop.x, pop.y); ctx.scale(.6 + grow * .4, .6 + grow * .4);
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
    ctx.drawImage(vignette, 0, 0);
    ctx.restore();
    $('toast').classList.toggle('visible', now < toastUntil);
  }
  function frame(now) {
    const elapsed = Math.min((now-lastFrame)/1000 || 0, .1);lastFrame=now;
    // Small physics steps keep a fast hook from tunneling through tiny diamonds.
    let remaining=elapsed;while(remaining>0){const step=Math.min(remaining,1/120);update(step,now);remaining-=step;}
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
  $('settings-close').onclick = () => { $('settings-overlay').hidden = true; canvas.focus({ preventScroll: true }); };
  $('settings-overlay').addEventListener('pointerdown', event => { if (event.target === $('settings-overlay')) $('settings-close').onclick(); });
  $('sound-toggle').onchange = () => { sound = $('sound-toggle').checked; if (sound) tone(); saveProgress(); };
  $('music-toggle').onchange = () => { music = $('music-toggle').checked; try { localStorage.setItem('gm-music', music ? '1' : '0'); } catch {} updateMusic(); };
  $('shake-range').oninput = () => { shakeScale = $('shake-range').value / 100; try { localStorage.setItem('gm-shake', String(shakeScale)); } catch {} };
  $('sound-toggle').checked = sound;
  $('music-toggle').checked = music;
  $('shake-range').value = Math.round(shakeScale * 100);
  // Press feedback: a gold-dust burst where the finger lands, drawn by the canvas particle system.
  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect(), scale = Math.min(rect.width / canvas.width, rect.height / canvas.height);
    return {
      x: Math.max(0, Math.min(canvas.width, (event.clientX - rect.left - (rect.width - canvas.width * scale) / 2) / scale)),
      y: Math.max(0, Math.min(canvas.height, (event.clientY - rect.top - (rect.height - canvas.height * scale) / 2) / scale))
    };
  }
  for (const button of document.querySelectorAll('.action-item')) {
    button.addEventListener('pointerdown', event => { if (!button.disabled) burst(canvasPoint(event), 'gold'); });
  }
  $('strength-item').onclick = () => notify('Strength active: double pulling speed for this mine.');
  $('book-item').onclick = () => { if (phase === 'playing' && book) { revealUntil = performance.now() + 6000; tone(920); } };
  $('magnet-item').onclick = () => {
    if (phase !== 'playing' || !magnet || hookState !== 'swing') return;
    magnetArmed = !magnetArmed; tone(480); updateHUD(); saveProgress();
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
  showDialog('<span class="badge">CAPTAIN’S LOG</span><h2>Loading your expedition…</h2>');
  loadProgress().then(restored => {
    if (restored) return;
    showDialog('<span class="badge">DOWN THE SHAFT</span><h2>Treasure awaits, miner!</h2><p>One swinging claw. Sixty seconds. A shaft full of buried gold.<br>Reach the target to move on to the next mine.</p><div class="instructions"><span>↓ / Space to drop</span><span>D for dynamite</span><span>Tap to play</span></div><button class="primary" id="start">Let’s dig →</button>');
    $('start').onclick=startLevel;
  });
  requestAnimationFrame(frame);
})();
