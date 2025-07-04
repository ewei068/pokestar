/**
 * @template {TrainerEventEnum} K
 * @typedef {(args: TrainerEventArgs<K>) => Promise<any> | any} TrainerEventListenerCallback
 */

const eventListeners =
  /** @type {Record<TrainerEventEnum, TrainerEventListenerCallback<TrainerEventEnum>[]>} */ ({});

/**
 * @template {TrainerEventEnum} K
 * @param {K} eventName
 * @param {TrainerEventListenerCallback<K>} listener
 */
const registerTrainerEventListener = (eventName, listener) => {
  eventListeners[eventName] = eventListeners[eventName] || [];
  eventListeners[eventName].push(listener);
};

/**
 * @template {TrainerEventEnum} K
 * @param {K} eventName
 * @param {TrainerEventArgs<K>} args
 */
const emitTrainerEvent = async (eventName, args) => {
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
 * @template {TrainerEventEnum} K
 * @param {K[]} eventNames
 * @param {TrainerEventArgs<K>} args
 */
const batchEmitTrainerEvents = async (eventNames, args) => {
  const promises = [];
  eventNames.forEach((eventName) => {
    promises.push(emitTrainerEvent(eventName, args));
  });
  return await Promise.all(promises);
};

module.exports = {
  registerTrainerEventListener,
  emitTrainerEvent,
  batchEmitTrainerEvents,
};
