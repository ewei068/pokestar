/**
 * @template {GameEventEnum} K
 * @typedef {(args: GameEventArgs<K>) => Promise<any> | any} GameEventListenerCallback
 */

const eventListeners =
  /** @type {Record<GameEventEnum, GameEventListenerCallback<GameEventEnum>[]>} */ ({});

/**
 * @template {GameEventEnum} K
 * @param {K} eventName
 * @param {GameEventListenerCallback<K>} listener
 */
const registerGameEventListener = (eventName, listener) => {
  eventListeners[eventName] = eventListeners[eventName] || [];
  eventListeners[eventName].push(listener);
};

/**
 * @template {GameEventEnum} K
 * @param {K} eventName
 * @param {GameEventArgs<K>} args
 */
const emitGameEvent = async (eventName, args) => {
  if (!eventListeners[eventName]) return;
  const promises = [];
  eventListeners[eventName].forEach((listener) =>
    promises.push(
      listener({
        ...args,
        eventName,
      })
    )
  );
  return await Promise.all(promises);
};

/**
 * @template {GameEventEnum} K
 * @param {K[]} eventNames
 * @param {GameEventArgs<K>} args
 */
const batchEmitGameEvents = async (eventNames, args) => {
  const promises = [];
  eventNames.forEach((eventName) => {
    promises.push(emitGameEvent(eventName, args));
  });
  return await Promise.all(promises);
};

module.exports = {
  registerGameEventListener,
  emitGameEvent,
  batchEmitGameEvents,
};
