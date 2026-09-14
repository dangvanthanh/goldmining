'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('mine'), ctx = canvas.getContext('2d');
  const W = 1100, H = 580, origin = { x: 550, y: 132 };
  const levels = [
    ['Sunset Creek', 650, 0], ['Copper Hollow', 1000, 1], ['Old Pine Quarry', 1400, 2],
    ['Emerald Basin', 1800, 3], ['Dusty Ridge', 2200, 4], ['Moonstone Cavern', 2600, 5],
    ['Diamond Gulch', 3000, 6], ['Lost Prospector', 3400, 7], ['Kings beneath the Hill', 3900, 8],
    ['The Golden Heart', 4500, 9], ['Amber Crossing', 5000, 10], ['Silverroot Tunnel', 5500, 11],
    ['Jade Falls', 6000, 12], ['Crimson Chasm', 6500, 13], ['Sapphire Springs', 7000, 14],
    ['Obsidian Reach', 7500, 15], ['Opal Observatory', 8000, 16], ['Thunderstone Pit', 8500, 17],
    ['Frostbite Vein', 9000, 18], ['The Sunken Treasury', 9500, 19], ['Dragonbone Depths', 10000, 20],
    ['Starlight Shaft', 10500, 21], ['Royal Amethyst', 11000, 22], ['Emberfall Mine', 11500, 23],
    ['Crystal Labyrinth', 12000, 24], ['The Forgotten Vault', 12500, 25], ['Phoenix Hollow', 13000, 26],
    ['Celestial Quarry', 13500, 27], ['Midas Descent', 14000, 28], ['The Eternal Fortune', 14500, 29],
    ['Aurora Passage', 15000, 30], ['Garnet Gorge', 15500, 31], ['The Brass Citadel', 16000, 32],
    ['Silversong Cavern', 16500, 33], ['Ruby Eclipse', 17000, 34], ['Titanstone Tunnel', 17500, 35],
    ['The Hidden Dynasty', 18000, 36], ['Prismatic Depths', 18500, 37], ['Cinder Crown', 19000, 38],
    ['The Platinum Gate', 19500, 39], ['Astral Rift', 20000, 40], ['Black Pearl Basin', 20500, 41],
    ['The Gilded Abyss', 21000, 42], ['Diamond Tempest', 21500, 43], ['Sovereign Shaft', 22000, 44],
    ['The Ancient Hoard', 22500, 45], ['Infinity Vein', 23000, 46], ['Dawnfire Vault', 23500, 47],
    ['The Last Bonanza', 24000, 48], ['Crown of the Earth', 24500, 49],
    ['Beyond the Crown', 25000, 50], ['Topaz Terrace', 25500, 51], ['Whispering Granite', 26000, 52],
    ['The Jade Stairway', 26500, 53], ['Mercury Hollow', 27000, 54], ['Scarlet Geode', 27500, 55],
    ['The Buried Beacon', 28000, 56], ['Lapis Landing', 28500, 57], ['Stormglass Cavern', 29000, 58],
    ['The Sapphire Throne', 29500, 59], ['Quartz Frontier', 30000, 60], ['Verdant Fault', 30500, 61],
    ['The Bronze Cathedral', 31000, 62], ['Moonfire Basin', 31500, 63], ['Tourmaline Trail', 32000, 64],
    ['The Silent Foundry', 32500, 65], ['Sunstone Summit', 33000, 66], ['Echoing Onyx', 33500, 67],
    ['The Hidden Horizon', 34000, 68], ['Treasury of Tides', 34500, 69], ['Peridot Passage', 35000, 70],
    ['The Copper Constellation', 35500, 71], ['Fallen Star Quarry', 36000, 72], ['Rosegold Ravine', 36500, 73],
    ['The Marble Monolith', 37000, 74], ['Twilight Agate', 37500, 75], ['The Hollow Mountain', 38000, 76],
    ['Golden Mirage', 38500, 77], ['The Velvet Vein', 39000, 78], ['Citadel of Crystals', 39500, 79],
    ['The Deepward Road', 40000, 80], ['Cobalt Cathedral', 40500, 81], ['The Emerald Engine', 41000, 82],
    ['Radiant Ruins', 41500, 83], ['The Diamond Delta', 42000, 84], ['Fireopal Fortress', 42500, 85],
    ['The Argent Archive', 43000, 86], ['Midnight Malachite', 43500, 87], ['The Splintered Sun', 44000, 88],
    ['Palace of Pyrite', 44500, 89], ['The Worldroot Well', 45000, 90], ['Heavenstone Hollow', 45500, 91],
    ['The Ruby Reliquary', 46000, 92], ['Everglow Excavation', 46500, 93], ['The Sovereign Seam', 47000, 94],
    ['Stardust Sanctuary', 47500, 95], ['The Boundless Bonanza', 48000, 96], ['Fortune’s Final Frontier', 48500, 97],
    ['The Hundredth Door', 49000, 98], ['Heart of a Hundred Mines', 49500, 99]
  ];
  const types = {
    small: { radius: 17, value: 140, weight: 1.3, color: '#eabc52' },
    gold: { radius: 29, value: 350, weight: 2.4, color: '#edbc50' },
    large: { radius: 43, value: 800, weight: 4, color: '#f2c45e' },
    rock: { radius: 34, value: 15, weight: 6, color: '#848477' },
    diamond: { radius: 16, value: 700, weight: .7, color: '#b3efeb' },
    gem: { radius: 19, value: 300, weight: .9, color: '#95bdaa' },
    bag: { radius: 22, value: 0, weight: 1, color: '#c8a071' },
    tnt: { radius: 25, value: 0, weight: 1, color: '#ba4938' },
    pig: { radius: 26, value: 10, weight: .7, speed: 65, color: '#e6a08c' },
    diamondPig: { radius: 32, value: 710, weight: .7, speed: 110, color: '#d98d83' }
  };
  const blastRadius = 120, diamondBonus = 1.5, dynamiteCapacity = 3;
  let level = 0, bank = 0, haul = 0, time = 60, phase = 'ready', objects = [];
  let angle = 0, swing = 0, length = 23, hookState = 'swing', caught = null;
  let dynamite = 0, strength = false, book = false, sound = false, audio;
  let lastFrame = 0, deadline = 0, toastUntil = 0, particles = [], popups = [];
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
      taken: objects.filter(o => o.taken).map(o => o.id), dynamite, strength, book, sound
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
    // Require 24% of stationary treasure in the tutorial, rising to 52% by mine 20.
    // Pigs are optional upside; goals never depend on catching a moving diamond.
    const targetShare = .24 + .28 * Math.min(index / 19, 1);
    const treasure = map.filter(obj => obj.type !== 'rock');
    const richness = levels[index][1] / (targetShare * treasure.reduce((sum, obj) => sum + obj.value, 0));
    treasure.forEach(obj => { obj.value = Math.round(obj.value * richness); });
    // Append hazards after placing treasure so existing saves retain their object IDs and positions.
    const count = Math.min(6, 1 + Math.floor(index / 4));
    const hazards = Array(count).fill('tnt');
    hazards.push(...Array(Math.min(3, 1 + Math.floor(index / 5))).fill('pig'));
    if (index >= 9) hazards.push(...Array(index >= 19 ? 2 : 1).fill('diamondPig'));
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
    $('haul').textContent = money(bank + haul);
    $('goal').textContent = money(levels[level][1]);
    $('progress').style.width = Math.min(100, (bank + haul) / levels[level][1] * 100) + '%';
    $('timer').textContent = '00:' + String(Math.ceil(time)).padStart(2, '0');
    if (time === 60) $('timer').textContent = '01:00';
    $('timer').classList.toggle('urgent', time <= 10);
    $('level-number').textContent = String(level + 1).padStart(2, '0');
    $('level-total').textContent = '/ ' + levels.length;
    $('expedition-summary').textContent = levels.length + ' stops. One legendary voyage.';
    $('location').textContent = String(level + 1).padStart(2, '0') + ' — ' + levels[level][0].toUpperCase();
    $('dynamite-count').textContent = dynamite;
    $('drop').disabled = phase !== 'playing' || hookState !== 'swing';
    $('dynamite').disabled = phase !== 'playing' || !caught || dynamite === 0;
    $('pause').disabled = !['playing', 'paused'].includes(phase);
  }
  function startLevel() {
    objects = makeMap(level); haul = 0; time = 60; swing = -.8; angle = 0;
    length = 23; caught = null; hookState = 'swing'; particles = []; popups = [];
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
      showDialog(`<span class="badge">ANOTHER SHOT AT THE LOOT</span><h2>Chin up, captain!</h2><p>You brought in ${money(bank + haul)} of ${money(levels[level][1])}.<br>Try a new angle. Diamonds are light and valuable.</p><button class="primary" id="retry">Hunt again ↻</button>`);
      $('retry').onclick = startLevel;
    } else {
      showDialog(`<span class="badge">${levels.length} STOPS. ONE LEGEND.</span><h2>Yo-ho! What a haul!</h2><p>You conquered all ${levels.length} mines with ${money(bank)} left in your pocket.<br>The Jolly Hook crew salutes you.</p><button class="primary" id="restart">A new expedition ↗</button>`);
      $('restart').onclick = () => { level = 0; bank = 0; dynamite = 0; strength = false; book = false; startLevel(); };
    }
  }
  function supplyPrices(index) {
    const goal = levels[index][1];
    // Scale sinks with the upcoming mine, rounded to readable $25 price steps.
    return {
      dynamite: Math.max(100, Math.ceil(goal * .035 / 25) * 25),
      strength: Math.max(200, Math.ceil(goal * .12 / 25) * 25),
      book: Math.max(300, Math.ceil(goal * .18 / 25) * 25)
    };
  }
  function renderShop() {
    const prices = supplyPrices(level + 1);
    showDialog(`<span class="badge">MINE ${String(level + 1).padStart(2, '0')} COMPLETE · PIRATE TRADING POST</span><h2>Stock up, shipmate.</h2><p>Goal paid. Your surplus: <strong>${money(bank)}</strong><br>Next mine: ${levels[level + 1][0]} · Goal ${money(levels[level + 1][1])}</p><div class="shop-items"><button class="shop-item" id="buy-dynamite" ${bank < prices.dynamite || dynamite >= dynamiteCapacity ? 'disabled' : ''}><span class="item-icon" aria-hidden="true">🧨</span><strong>Dynamite</strong><small>Destroy your catch<br>${dynamite}/${dynamiteCapacity} in your pack</small><span>${dynamite >= dynamiteCapacity ? 'Pack full' : money(prices.dynamite)}</span></button><button class="shop-item" id="buy-strength" ${bank < prices.strength || strength ? 'disabled' : ''}><span class="item-icon" aria-hidden="true">⚡</span><strong>Strength drink</strong><small>2× pulling speed<br>Next mine only</small><span>${strength ? 'Packed ✓' : money(prices.strength)}</span></button><button class="shop-item" id="buy-book" ${bank < prices.book || book ? 'disabled' : ''}><span class="item-icon" aria-hidden="true">📘</span><strong>Diamond book</strong><small>${diamondBonus}× diamond value<br>Next mine only</small><span>${book ? 'Packed ✓' : money(prices.book)}</span></button></div><p>Supplies cost part of your next goal. Save cash, or invest in a better haul.</p><button class="primary" id="next">On to mine ${level + 2} →</button>`);
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
      || (item === 'strength' && strength) || (item === 'book' && book)) return;
    bank -= prices[item];
    if (item === 'dynamite') dynamite++;
    if (item === 'strength') strength = true;
    if (item === 'book') book = true;
    tone(540); renderShop(); updateHUD(); saveProgress();
  }
  function drop() {
    if (phase !== 'playing' || hookState !== 'swing') return;
    if (performance.now() >= deadline) { finishLevel(); return; }
    hookState = 'out'; tone(230, .08); updateHUD();
  }
  const hookPosition = () => ({ x: origin.x + Math.sin(angle) * length, y: origin.y + Math.cos(angle) * length });
  function burst(pos) {
    for (let i = 0; i < 32; i++) {
      const direction = Math.random() * Math.PI * 2, speed = 80 + Math.random() * 180;
      particles.push({ x: pos.x, y: pos.y, vx: Math.cos(direction) * speed, vy: Math.sin(direction) * speed, life: .7 });
    }
  }
  function detonate(barrel) {
    const pending = [barrel];
    barrel.taken = true;
    while (pending.length) {
      const source = pending.pop();
      burst(source);
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
    burst(pos);
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
    showDialog('<span class="badge">TAKE A BREATHER</span><h2>At ease, captain.</h2><p>Your loot is safe and the clock is stopped. Ready when you are.</p><button class="primary" id="resume">Back to the hunt →</button>');
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
      caught = objects.findLast(o => !o.taken && Math.hypot(o.x - p.x, o.y - p.y) < o.radius + 8) || null;
      if (caught?.type === 'tnt') detonate(caught);
      else if (caught) { caught.taken = true; hookState = 'back'; tone(320, .08); }
      else if (p.x < 20 || p.x > W - 20 || p.y > H - 30) hookState = 'back';
    } else {
      length -= 360 * (strength ? 2 : 1) / (caught ? caught.weight : .65) * dt;
      if (length <= 23) {
        length = 23; hookState = 'swing';
        if (caught) {
          const value = caught.type === 'diamondPig'
            ? 10 + Math.round((caught.value - 10) * (book ? diamondBonus : 1))
            : Math.round(caught.value * (caught.type === 'diamond' && book ? diamondBonus : 1));
          haul += value;
          popups.push({ text: '+' + money(value), x: 550, y: 90, life: 1.4 });
          if (caught.type === 'bag') notify('Mystery bag! You found ' + money(value) + '.');
          if (caught.type === 'diamondPig') notify('Diamond-mouth pig! ' + money(value) + ' secured.');
          tone(caught.type === 'rock' ? 180 : 780, .15); caught = null;
          saveProgress();
        }
        if (objects.every(o => o.taken)) { finishLevel(); return; }
      }
    }
    particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 250 * dt; p.life -= dt; });
    particles = particles.filter(p => p.life > 0);
    popups.forEach(p => { p.y -= 24 * dt; p.life -= dt; }); popups = popups.filter(p => p.life > 0);
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
    ctx.save(); ctx.translate(x, y); ctx.rotate(obj.rotation);
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
      ellipse(-7, -5, 13, 7, '#f8c3b1');
      ellipse(-2, 9, 13, 6, '#efb09b');
      ellipse(12, -2, 13, 13, obj.color);
      polygon([[5,-11],[3,-22],[12,-18],[16,-11]], '#f3b6a6', '#bd7b70');
      polygon([[7,-13],[6,-19],[12,-16]], '#dc8d87');
      ellipse(22, 1, 7, 5.5, '#ffc9b9');
      ellipse(21, 1, 1.1, 1.7, '#a75e5b');
      ellipse(25, 1, 1.1, 1.7, '#a75e5b');
      ellipse(11, 3, 4, 2.5, '#ed9290');
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
      ctx.fillStyle = '#fff0c5'; ctx.fillRect(-r*.58, -r*.2, r*1.16, r*.5);
      ctx.strokeStyle = '#71352a'; ctx.lineWidth = 1; ctx.strokeRect(-r*.58, -r*.2, r*1.16, r*.5);
      ctx.fillStyle = '#782d25'; ctx.font = '900 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('TNT', 0, r*.19);
    } else if (obj.type === 'bag') {
      polygon([[-9,-18],[-13,-27],[0,-23],[12,-27],[8,-16]], '#e0be8a');
      ctx.beginPath(); ctx.moveTo(-8,-15); ctx.bezierCurveTo(-31,9,-24,25,0,24); ctx.bezierCurveTo(26,23,29,8,8,-15); ctx.closePath(); ctx.fillStyle = '#bc905e';ctx.fill();
      line([[-10,-15],[11,-15]], '#634c33', 4);
      ctx.fillStyle = '#f4d5a2';ctx.font='bold 24px Georgia';ctx.textAlign='center';ctx.fillText('?',0,14);
    } else {
      polygon([[-r,-r*.1],[-r*.7,-r*.7],[-r*.1,-r],[r*.7,-r*.6],[r,r*.2],[r*.4,r*.8],[-r*.5,r*.7]],obj.color, obj.type === 'rock' ? '#61665d' : '#b27d30');
      polygon([[-r,-r*.1],[-r*.7,-r*.7],[-r*.1,-r],[r*.2,-r*.4],[-r*.3,r*.1]],obj.type === 'rock' ? '#a0a293' : '#ffe091');
      polygon([[-r*.5,r*.7],[-r*.3,r*.1],[r*.3,-r*.1],[r,r*.2],[r*.4,r*.8]], obj.type === 'rock' ? '#71786c' : '#c89537');
      if(obj.type !== 'rock') line([[-r*.55,-r*.38],[-r*.38,-r*.58]], '#fff0bd', 3);
    }
    ctx.restore();
  }
  // Paint the landscape once; the moving hook and treasures use the foreground canvas.
  const background = document.createElement('canvas'); background.width = W; background.height = H;
  function paintBackground() {
    const c = background.getContext('2d');
    c.fillStyle='#91d6da';c.fillRect(0,0,W,150);
    c.fillStyle='#fff0bb';c.beginPath();c.arc(866,37,32,0,Math.PI*2);c.fill();
    function hills(points,color){c.beginPath();c.moveTo(0,150);points.forEach(p=>c.lineTo(...p));c.lineTo(W,150);c.fillStyle=color;c.fill();}
    c.fillStyle='#46a9b7';c.fillRect(0,87,W,63);
    hills([[0,117],[75,85],[130,105],[180,120],[800,122],[950,74],[1020,98],[1100,115]],'#388c86');
    c.strokeStyle='#b7ebe2';c.lineWidth=2;
    for(let x=15;x<W;x+=95){c.beginPath();c.moveTo(x,116);c.quadraticCurveTo(x+18,111,x+37,116);c.stroke();}
    for(const [x,y,s] of [[62,76,1],[99,83,.8],[974,64,1.3],[1026,85,.9],[210,94,.7]]){
      c.strokeStyle='#96704b';c.lineWidth=7*s;c.beginPath();c.moveTo(x+9,y+55*s);c.quadraticCurveTo(x-4,y+24*s,x,y+9);c.stroke();
      c.fillStyle='#28796c';
      for(const direction of [-1,1])for(let j=0;j<3;j++){c.beginPath();c.moveTo(x,y+9);c.quadraticCurveTo(x+direction*23*s,y-17+j*13,x+direction*(35-j*5)*s,y+14+j*8);c.quadraticCurveTo(x+direction*13*s,y+5+j*5,x,y+9);c.fill();}
    }
    c.fillStyle='#f2d598';c.fillRect(0,134,W,14);c.fillStyle='#cba86b';c.fillRect(0,148,W,9);
    c.fillStyle='#27565d';c.fillRect(0,157,W,H);
    hills([[0,166],[130,178],[265,163],[430,185],[600,167],[770,183],[990,164],[1100,174]],'#568080');
    c.fillStyle='#27565d';c.fillRect(0,188,W,H);
    for(let i=0;i<4;i++){c.beginPath();c.moveTo(0,230+i*98);for(let x=0;x<=W;x+=50)c.lineTo(x,230+i*98+Math.sin(x*.013+i*3)*12);c.lineTo(W,H);c.lineTo(0,H);c.fillStyle=['#244f58','#204953','#1d424e','#193b47'][i];c.fill();}
    const rand=random(41);for(let i=0;i<500;i++){const x=rand()*W,y=170+rand()*410;c.fillStyle=rand()>.5?'#a08a5426':'#181d1838';c.fillRect(x,y,1+rand()*4,1+rand()*2);}
    // A small pennant marks the captain’s beach camp.
    c.fillStyle='#765334';c.fillRect(704,49,4,89);
    c.fillStyle='#c95145';c.beginPath();c.moveTo(708,49);c.lineTo(756,59);c.lineTo(708,75);c.fill();
    c.fillStyle='#fff0d3';c.font='bold 17px Georgia';c.fillText('×',719,66);
    // Timber supports and a little supply crate on the ridge.
    c.fillStyle='#7c613d';c.fillRect(382,110,43,29);c.strokeStyle='#b0945a';c.lineWidth=3;c.strokeRect(382,110,43,29);c.beginPath();c.moveTo(383,111);c.lineTo(424,138);c.stroke();
  }
  function drawMiner() {
    line([[493,132],[507,95],[590,95],[608,132]], '#5a4931', 8);
    line([[502,130],[601,130]], '#ad8649', 6);
    ellipse(551,128,29,7,'#29302044');
    // The captain keeps the same winch and hook position as the original miner.
    line([[540,97],[534,121],[522,123]],'#394b48',10);line([[563,97],[572,120],[583,121]],'#394b48',10);
    polygon([[532,65],[560,62],[573,93],[563,106],[535,103],[525,91]],'#c95145');
    polygon([[537,79],[562,78],[565,104],[536,104]],'#52665b');
    line([[531,70],[516,83],[537,90]],'#ddb186',9);line([[563,69],[580,84],[567,92]],'#ddb186',9);
    ellipse(548,53,19,21,'#d5a780');
    polygon([[530,53],[540,60],[558,60],[565,52],[561,73],[548,80],[534,69]],'#e8e1c8');
    ellipse(544,54,3,4,'#584631');ellipse(558,54,3,4,'#584631');ellipse(552,60,5,4,'#d79d73');
    line([[532,48],[562,56]],'#263c43',2);ellipse(558,54,5,5,'#263c43');
    polygon([[518,40],[526,20],[538,26],[550,15],[564,26],[575,20],[580,40]],'#243c48','#efc571');
    line([[520,42],[578,42]],'#efc571',4);
    ellipse(549,30,4,4,'#fff0d3');line([[544,36],[554,36]],'#fff0d3',2);
    ellipse(550,108,17,17,'#534a35');ellipse(550,108,11,11,'#b59a5f');ellipse(550,108,5,5,'#514b35');
    line([[550,108],[568,108],[568,99]],'#534a35',4);
  }
  function draw(now) {
    ctx.clearRect(0,0,W,H);ctx.drawImage(background,0,0);drawMiner();
    objects.forEach(o=>{if(!o.taken)drawObject(o);});
    const p=hookPosition();
    line([[origin.x,112],[origin.x,origin.y],[p.x,p.y]],'#151c1877',4);
    line([[origin.x,112],[origin.x,origin.y],[p.x,p.y]],'#c5b58b',2);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-angle);
    line([[-10,3],[-13,13],[-5,19],[0,12],[5,19],[13,13],[10,3]],'#d1cbb0',3);
    ellipse(0,0,4,4,'#a7ab98');ctx.restore();
    if(caught)drawObject(caught,p.x,p.y+caught.radius*.65);
    particles.forEach(p=>{ctx.globalAlpha=p.life/.7;ctx.fillStyle='#ffc565';ctx.fillRect(p.x,p.y,5,5);});ctx.globalAlpha=1;
    popups.forEach(p=>{ctx.globalAlpha=Math.min(1,p.life);ctx.font='bold 25px Georgia';ctx.textAlign='center';ctx.fillStyle='#fff0b0';ctx.strokeStyle='#3c432d';ctx.lineWidth=3;ctx.strokeText(p.text,p.x,p.y);ctx.fillText(p.text,p.x,p.y);});ctx.globalAlpha=1;
    $('toast').classList.toggle('visible',now<toastUntil);
  }
  function frame(now) {
    const elapsed = Math.min((now-lastFrame)/1000 || 0, .1);lastFrame=now;
    // Small physics steps keep a fast hook from tunneling through tiny diamonds.
    let remaining=elapsed;while(remaining>0){const step=Math.min(remaining,1/120);update(step,now);remaining-=step;}
    if (phase === 'playing' && now - lastSave >= 1000) saveProgress();
    draw(now);requestAnimationFrame(frame);
  }
  function updateSound(){ $('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'Disable sound':'Enable sound'); }
  $('sound').onclick=()=>{sound=!sound;updateSound();if(sound)tone();saveProgress();};
  $('drop').onclick=drop;$('dynamite').onclick=explode;$('pause').onclick=pause;
  const shell = $('game-shell'), fullscreenButton = $('fullscreen');
  fullscreenButton.hidden = !document.fullscreenEnabled || !shell.requestFullscreen;
  fullscreenButton.onclick = async () => {
    try {
      if (document.fullscreenElement === shell) await document.exitFullscreen();
      else await shell.requestFullscreen();
    } catch { notify('Fullscreen is unavailable. Please try again.'); }
  };
  document.addEventListener('fullscreenchange', () => {
    const active = document.fullscreenElement === shell;
    fullscreenButton.setAttribute('aria-pressed', String(active));
    fullscreenButton.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
    fullscreenButton.innerHTML = active ? '⛶ <span>Exit fullscreen</span>' : '⛶ <span>Fullscreen</span>';
  });
  canvas.addEventListener('pointerdown',event=>{event.preventDefault();canvas.focus({preventScroll:true});drop();});
  document.addEventListener('keydown',event=>{
    if(event.key==='Tab'&&!$('overlay').hidden){const buttons=[...$('dialog').querySelectorAll('button:not(:disabled)')];const first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}return;}
    if(event.repeat)return;
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
    showDialog('<span class="badge">ALL ABOARD THE JOLLY HOOK</span><h2>Treasure awaits, captain!</h2><p>One swinging hook. Sixty seconds. A sea of buried loot.<br>Reach the treasure goal to continue your voyage through ' + levels.length + ' mines.</p><div class="instructions"><span>↓ / Space to drop</span><span>D for dynamite</span><span>Tap to play</span></div><button class="primary" id="start">Let’s find treasure →</button>');
    $('start').onclick=startLevel;
  });
  requestAnimationFrame(frame);
})();
