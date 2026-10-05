const THEMES = ["classic", "sky", "cavern"];
export function createPreferences({ storage } = {}) {
  const store = () => storage ?? globalThis.localStorage;
  const read = (key) => {
    try {
      return store().getItem(key);
    } catch {
      return null;
    }
  };
  const write = (key, value) => {
    try {
      store().setItem(key, value);
    } catch {}
  };
  return Object.freeze({
    art: () => {
      const value = read("gm-art");
      return THEMES.includes(value) ? value : "classic";
    },
    music: () => read("gm-music") === "1",
    shake: () => {
      const value = read("gm-shake"),
        number = Number(value);
      return value !== null && Number.isFinite(number) && number >= 0 && number <= 1 ? number : 1;
    },
    setArt: (value) => {
      if (THEMES.includes(value)) write("gm-art", value);
    },
    setMusic: (value) => write("gm-music", value ? "1" : "0"),
    setShake: (value) => write("gm-shake", String(value)),
  });
}
