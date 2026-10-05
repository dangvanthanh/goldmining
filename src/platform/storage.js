export function createStorage({ db, onError = () => {} } = {}) {
  if (!db) {
    db = new globalThis.Dexie("GoldMining");
    db.version(1).stores({ saves: "id" });
  }
  let queue = Promise.resolve(),
    closed = false,
    ending;
  return Object.freeze({
    save(snapshot) {
      if (closed || !snapshot) return queue;
      const copy = structuredClone(snapshot);
      queue = queue
        .then(() => db.saves.put(copy))
        .catch((error) => {
          if (!closed) onError(error);
        });
      return queue;
    },
    async load() {
      await queue;
      if (closed) return null;
      return db.saves.get("expedition");
    },
    async peek() {
      if (closed) return null;
      return db.saves.get("expedition");
    },
    flush: () => queue,
    destroy() {
      if (!ending) {
        closed = true;
        ending = queue.finally(() => db.close());
      }
      return ending;
    },
  });
}
