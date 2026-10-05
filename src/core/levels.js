function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
const names = [
  "Sunset Creek",
  "Copper Hollow",
  "Old Pine Quarry",
  "Emerald Basin",
  "Dusty Ridge",
  "Moonstone Cavern",
  "Diamond Gulch",
  "Lost Prospector",
  "Kings beneath the Hill",
  "The Golden Heart",
  "Amber Crossing",
  "Silverroot Tunnel",
  "Jade Falls",
  "Crimson Chasm",
  "Sapphire Springs",
  "Obsidian Reach",
  "Opal Observatory",
  "Thunderstone Pit",
  "Frostbite Vein",
  "The Sunken Treasury",
  "Dragonbone Depths",
  "Starlight Shaft",
  "Royal Amethyst",
  "Emberfall Mine",
  "Crystal Labyrinth",
  "The Forgotten Vault",
  "Phoenix Hollow",
  "Celestial Quarry",
  "Midas Descent",
  "The Eternal Fortune",
  "Aurora Passage",
  "Garnet Gorge",
  "The Brass Citadel",
  "Silversong Cavern",
  "Ruby Eclipse",
  "Titanstone Tunnel",
  "The Hidden Dynasty",
  "Prismatic Depths",
  "Cinder Crown",
  "The Platinum Gate",
  "Astral Rift",
  "Black Pearl Basin",
  "The Gilded Abyss",
  "Diamond Tempest",
  "Sovereign Shaft",
  "The Ancient Hoard",
  "Infinity Vein",
  "Dawnfire Vault",
  "The Last Bonanza",
  "Crown of the Earth",
  "Beyond the Crown",
  "Topaz Terrace",
  "Whispering Granite",
  "The Jade Stairway",
  "Mercury Hollow",
  "Scarlet Geode",
  "The Buried Beacon",
  "Lapis Landing",
  "Stormglass Cavern",
  "The Sapphire Throne",
  "Quartz Frontier",
  "Verdant Fault",
  "The Bronze Cathedral",
  "Moonfire Basin",
  "Tourmaline Trail",
  "The Silent Foundry",
  "Sunstone Summit",
  "Echoing Onyx",
  "The Hidden Horizon",
  "Treasury of Tides",
  "Peridot Passage",
  "The Copper Constellation",
  "Fallen Star Quarry",
  "Rosegold Ravine",
  "The Marble Monolith",
  "Twilight Agate",
  "The Hollow Mountain",
  "Golden Mirage",
  "The Velvet Vein",
  "Citadel of Crystals",
  "The Deepward Road",
  "Cobalt Cathedral",
  "The Emerald Engine",
  "Radiant Ruins",
  "The Diamond Delta",
  "Fireopal Fortress",
  "The Argent Archive",
  "Midnight Malachite",
  "The Splintered Sun",
  "Palace of Pyrite",
  "The Worldroot Well",
  "Heavenstone Hollow",
  "The Ruby Reliquary",
  "Everglow Excavation",
  "The Sovereign Seam",
  "Stardust Sanctuary",
  "The Boundless Bonanza",
  "Fortune’s Final Frontier",
  "The Hundredth Door",
  "Heart of a Hundred Mines",
];
const targetRhythm = [0.94, 0.98, 1.02, 1.06, 1.12];
export const LEVELS = freeze(
  names.map((name, index) => {
    const baseline = 550 + 4200 * (1 - Math.exp(-index / 35));
    return { name, target: Math.round((baseline * targetRhythm[index % 5]) / 25) * 25 };
  }),
);
export const TYPES = freeze({
  small: { radius: 16, value: 100, weight: 1.1, color: "#eabc52" },
  gold: { radius: 28, value: 350, weight: 2.3, color: "#edbc50" },
  large: { radius: 43, value: 900, weight: 4.4, color: "#f2c45e" },
  rock: { radius: 34, value: 20, weight: 3.8, color: "#6e7166" },
  diamond: { radius: 14, value: 600, weight: 0.8, color: "#b3efeb" },
  gem: { radius: 18, value: 300, weight: 1, color: "#95bdaa" },
  bag: { radius: 22, value: 350, weight: 1.05, color: "#c8a071" },
  tnt: { radius: 25, value: 0, weight: 1, color: "#ba4938" },
  pig: { radius: 26, value: 25, weight: 0.6, speed: 65, color: "#a0846a" },
  diamondPig: { radius: 32, value: 575, weight: 1.1, speed: 150, color: "#9d7968" },
});
export const GEM_TYPES = freeze(["diamond", "gem", "diamondPig"]);
export const GOLD_TYPES = freeze(["small", "gold", "large"]);
export const isGem = (type) => GEM_TYPES.includes(type);
export const isGold = (type) => GOLD_TYPES.includes(type);
export const SPAWN_COUNTS = freeze({
  2: [
    { small: 3, gold: 3, large: 2, diamond: 1, gem: 2, bag: 1, rock: 2 }, // 1–10
    { small: 3, gold: 4, large: 3, diamond: 2, gem: 2, bag: 1, rock: 3 }, // 11–40
    { small: 2, gold: 4, large: 3, diamond: 3, gem: 3, bag: 1, rock: 3 }, // 41–100
  ],
  3: [
    { small: 4, gold: 3, large: 2, diamond: 1, gem: 1, bag: 1, rock: 4 }, // 1–10
    { small: 3, gold: 4, large: 2, diamond: 2, gem: 2, bag: 1, rock: 5 }, // 11–40
    { small: 3, gold: 3, large: 2, diamond: 3, gem: 2, bag: 2, rock: 6 }, // 41–100
  ],
});
export const DIFFICULTY_RHYTHM = freeze([-0.025, -0.0125, 0, 0.0125, 0.025]);
export const RULES = freeze({
  width: 1100,
  height: 580,
  origin: { x: 550, y: 132 },
  roundSeconds: 60,
  physicsStep: 1 / 120,
  frameCap: 0.1,
  objectAspect: 1,
  blastRadius: 120,
  diamondBonus: 1.5,
  strengthBonus: 1.5,
  dynamiteCapacity: 3,
  reelPower: 300,
  restLength: 23,
  maxLength: 1200,
  emptyClawWeight: 0.65,
  dropSpeed: 540,
  swingRate: 1.6,
  swingAmplitude: 1.16,
  catchPadding: 8,
  magnetReach: 24,
});
