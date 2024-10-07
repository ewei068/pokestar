/* eslint-disable no-param-reassign */
const { v4: uuidv4 } = require("uuid");
const { getOrSetDefault } = require("../../utils/utils");

class BattleEventHandler {
  // event name => listenerIds
  // eventNames;
  // listenerId => listener
  // eventListeners;

  constructor() {
    this.eventNames = {};
    this.eventListeners = {};
  }

  registerListener(eventName, listener) {
    // generate listener UUID
    const listenerId = uuidv4();

    getOrSetDefault(this.eventNames, eventName, new Set()).add(listenerId);
    this.eventListeners[listenerId] = listener;
    // add listenerId and eventName to listener.initialargs
    listener.initialArgs = {
      listenerId,
      eventName,
      ...listener.initialArgs,
    };
    listener.eventName = eventName;

    return listenerId;
  }

  unregisterListener(listenerId) {
    const listener = this.eventListeners[listenerId];
    if (listener) {
      const { eventName } = listener.eventName;
      const listenerIds = this.eventNames[eventName];
      if (listenerIds) {
        listenerIds.delete(listenerId);
      }
      delete this.eventListeners[listenerId];
    }
  }

  emit(eventName, args) {
    const listenerIds = this.eventNames[eventName];
    if (listenerIds) {
      for (const listenerId of listenerIds) {
        const listener = this.eventListeners[listenerId];
        if (listener) {
          // migration harness
          if (listener.isNewListener) {
            listener.execute({
              ...(args || {}),
              eventName,
            });
          } else {
            listener.execute(listener.initialArgs, args);
          }
        }
      }
    }
  }
}

module.exports = {
  BattleEventHandler,
};
