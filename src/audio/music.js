export function createMusic({ context, enabled = false, onFailure = () => {} }) {
  let music = enabled,
    musicNodes = null,
    audio,
    disposed = false;
  const timers = new Set(),
    stopping = new Set();
  function updateMusic() {
    if (music && musicNodes) {
      audio.resume();
      return;
    }
    if (music) {
      try {
        audio = context();
        audio.resume();
        const master = audio.createGain();
        master.gain.value = 0;
        master.connect(audio.destination);
        const filter = audio.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 320;
        filter.connect(master);
        const oscs = [55, 82.5, 110].map((f) => {
          const osc = audio.createOscillator(),
            gain = audio.createGain();
          osc.type = "triangle";
          osc.frequency.value = f;
          gain.gain.value = 0.18;
          osc.connect(gain);
          gain.connect(filter);
          osc.start();
          return osc;
        });
        const lfo = audio.createOscillator(),
          lfoGain = audio.createGain();
        lfo.frequency.value = 0.09;
        lfoGain.gain.value = 0.05;
        lfo.connect(lfoGain);
        lfoGain.connect(master.gain);
        lfo.start();
        master.gain.linearRampToValueAtTime(0.16, audio.currentTime + 1.2);
        musicNodes = { master, oscs: [...oscs, lfo] };
      } catch {
        music = false;
        onFailure();
      }
    } else if (musicNodes) {
      musicNodes.master.gain.linearRampToValueAtTime(0, audio.currentTime + 0.5);
      const nodes = musicNodes;
      musicNodes = null;
      const timer = setTimeout(() => {
        stopping.delete(nodes);
        timers.delete(timer);
        nodes.oscs.forEach((o) => {
          try {
            o.stop();
          } catch {}
        });
      }, 600);
      timers.add(timer);
      stopping.add(nodes);
    }
  }
  return {
    setEnabled(value) {
      if (disposed) return;
      music = value;
      updateMusic();
    },
    resume() {
      if (!disposed && music) updateMusic();
    },
    get enabled() {
      return music;
    },
    get active() {
      return Boolean(musicNodes);
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      for (const t of timers) clearTimeout(t);
      for (const n of [...stopping, ...(musicNodes ? [musicNodes] : [])])
        for (const osc of n.oscs)
          try {
            osc.stop();
          } catch {}
      timers.clear();
      stopping.clear();
      musicNodes = null;
    },
  };
}
