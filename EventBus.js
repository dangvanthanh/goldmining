'use strict';
// Native, visual-only signals: no listeners are allowed to mutate gameplay.
window.VisualEvents = Object.freeze({
  ENTRANCE: 'visual:entrance', CATCH: 'visual:catch', REWARD: 'visual:reward',
  BLAST: 'visual:blast', RESULT: 'visual:result'
});
window.VisualBus = new EventTarget();
