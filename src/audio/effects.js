export function createSoundEffects({ context, enabled, onFailure }) {
  let audio,
    sfxBus = null,
    noise = null,
    disposed = false;
  function soundBus() {
    audio = context();
    if (audio.state === "suspended") audio.resume();
    if (!sfxBus) {
      // A gentle compressor glues overlapping effects and stops clipping on big hauls.
      const glue = audio.createDynamicsCompressor();
      glue.threshold.value = -16;
      glue.ratio.value = 4;
      glue.connect(audio.destination);
      sfxBus = audio.createGain();
      sfxBus.gain.value = 0.9;
      sfxBus.connect(glue);
      noise = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    return sfxBus;
  }
  function voice(type, frequency, delay, duration, volume, glideTo) {
    const bus = soundBus(),
      t = audio.currentTime + delay;
    const osc = audio.createOscillator(),
      gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(bus);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }
  function hiss({ type: filterType, frequency, delay = 0, duration, volume, sweepTo, q = 1 }) {
    const bus = soundBus(),
      t = audio.currentTime + delay;
    const src = audio.createBufferSource(),
      filter = audio.createBiquadFilter(),
      gain = audio.createGain();
    src.buffer = noise;
    src.loop = true;
    filter.type = filterType;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(frequency, t);
    if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + duration + 0.02);
  }
  const SFX = {
    drop: () => {
      hiss({
        type: "bandpass",
        frequency: 1800,
        duration: 0.3,
        volume: 0.12,
        sweepTo: 420,
        q: 1.2,
      });
      voice("triangle", 240, 0, 0.08, 0.08, 110);
    },
    ratchet: (weight) => {
      hiss({
        type: "highpass",
        frequency: 3200,
        duration: 0.025,
        volume: 0.05 + Math.min(0.05, weight * 0.012),
      });
      voice("square", 900 / Math.max(0.8, weight), 0, 0.018, 0.018);
    },
    clink: () => {
      voice("sine", 1568, 0, 0.45, 0.1);
      voice("sine", 2349, 0.01, 0.35, 0.05);
      voice("triangle", 784, 0, 0.2, 0.05);
    },
    sparkle: () =>
      [2093, 2637, 3136, 4186].forEach((f, i) => voice("sine", f, i * 0.045, 0.35, 0.06)),
    thud: () => {
      hiss({ type: "lowpass", frequency: 500, duration: 0.22, volume: 0.22, sweepTo: 90 });
      voice("sine", 110, 0, 0.25, 0.2, 45);
    },
    wall: () =>
      hiss({ type: "lowpass", frequency: 900, duration: 0.14, volume: 0.1, sweepTo: 200 }),
    bank: (big) => {
      voice("triangle", 1318.5, 0, 0.18, 0.08);
      voice("triangle", 1975.5, 0.07, big ? 0.55 : 0.3, 0.08);
      if (big) voice("sine", 2637, 0.14, 0.5, 0.045);
    },
    boom: () => {
      hiss({ type: "lowpass", frequency: 2400, duration: 1.1, volume: 0.5, sweepTo: 60, q: 0.7 });
      voice("sine", 70, 0, 0.7, 0.45, 30);
      voice("sawtooth", 140, 0, 0.25, 0.07, 40);
    },
    tick: () => voice("square", 1800, 0, 0.03, 0.035),
    goal: () =>
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        voice("triangle", f, i * 0.09, 0.5, 0.08);
        voice("sine", f * 2, i * 0.09, 0.3, 0.025);
      }),
    fail: () => [392, 349.23, 293.66].forEach((f, i) => voice("triangle", f, i * 0.16, 0.42, 0.08)),
    buy: () => {
      voice("square", 1046.5, 0, 0.06, 0.035);
      voice("triangle", 1568, 0.06, 0.25, 0.07);
    },
    ui: () => voice("triangle", 660, 0, 0.08, 0.05),
  };
  function play(name, arg) {
    if (disposed || !enabled()) return;
    try {
      SFX[name](arg);
    } catch {
      onFailure();
    }
  }
  return {
    play,
    names: Object.freeze(Object.keys(SFX)),
    destroy() {
      disposed = true;
      sfxBus?.disconnect();
      sfxBus = null;
      noise = null;
    },
  };
}
