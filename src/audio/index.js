import { createSoundEffects } from "./effects.js";
import { createMusic } from "./music.js";
import { VisualConstants } from "../art/constants.js";
// Sound for each core event: [effect name, argument]. Absent types are silent.
const SOUNDS = {
  drop: () => ["drop"],
  catch: (e) => [e.objectType === "rock" ? "thud" : e.gem ? "sparkle" : "clink"],
  tick: () => ["tick"],
  ratchet: (e) => ["ratchet", e.weight],
  wall: () => ["wall"],
  blast: () => ["boom"],
  reward: (e) => [
    e.objectType === "rock" ? "thud" : "bank",
    e.value >= VisualConstants.reward.bigValue,
  ],
  goal: () => ["goal"],
  result: (e) => [e.phase === "lost" ? "fail" : "goal"],
  purchase: () => ["buy"],
  magnet: () => ["ui"],
  reveal: () => ["sparkle"],
};
export function createAudio({
  enabled = () => true,
  music = false,
  createContext = () => new (globalThis.AudioContext || globalThis.webkitAudioContext)(),
  onSoundFailure = () => {},
  onMusicFailure = () => {},
} = {}) {
  let context,
    disposed = false,
    ending;
  const getContext = () => {
    if (disposed) throw new Error("Audio disposed");
    return (context ??= createContext());
  };
  const effects = createSoundEffects({ context: getContext, enabled, onFailure: onSoundFailure });
  const ambient = createMusic({ context: getContext, enabled: music, onFailure: onMusicFailure });
  return {
    play: effects.play,
    handle(event) {
      const sound = SOUNDS[event.type]?.(event);
      if (sound) effects.play(...sound);
    },
    names: effects.names,
    setMusic: ambient.setEnabled,
    resumeMusic: ambient.resume,
    resume() {
      if (!disposed && context) context.resume();
    },
    get state() {
      return { enabled: ambient.enabled, active: ambient.active, context: context?.state };
    },
    destroy() {
      if (!ending) {
        disposed = true;
        ambient.destroy();
        effects.destroy();
        ending = context?.close() ?? Promise.resolve();
      }
      return ending;
    },
  };
}
