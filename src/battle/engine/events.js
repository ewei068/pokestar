const { v4: uuidv4 } = require("uuid");
const { getOrSetDefault } = require("../../utils/utils");

class BattleEventHandler {
  // event name => listenerIds
  eventNames;
  // listenerId => listener
  eventListeners;

  constructor() {
    this.eventNames = {};
    this.eventListeners = {};
  }

  registerListener(eventName, listener) {
    // generate listener UUID
    const listenerId = uuidv4();

    getOrSetDefault(this.eventNames, eventName, {})[listenerId] = listener;
    this.eventListeners[listenerId] = listener;
    // add listenerId and eventName to listener.initialargs
    // eslint-disable-next-line no-param-reassign
    listener.initialArgs = {
      listenerId,
      eventName,
      ...listener.initialArgs,
    };

    return listenerId;
  }

  unregisterListener(listenerId) {
    const listener = this.eventListeners[listenerId];
    if (listener) {
      const { eventName } = listener.initialArgs;
      const listenerIds = this.eventNames[eventName];
      if (listenerIds) {
        delete listenerIds[listenerId];
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
          listener.execute(listener.initialArgs, args);
        }
      }
    }
  }
}

module.exports = {
  BattleEventHandler,
};
