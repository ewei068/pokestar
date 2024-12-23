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
    if (!listenerIds) {
      return;
    }
    for (const listenerId of listenerIds) {
      const listener = this.eventListeners[listenerId];
      if (!listener) {
        continue;
      }
      const fullArgs = {
        ...(args || {}),
        eventName,
      };
      // migration harness
      if (listener.isNewListener) {
        if (
          !listener.conditionCallback ||
          listener.conditionCallback(fullArgs)
        ) {
          listener.execute(fullArgs);
          // updates args with new values
          // TODO: do immutable event handling... someday
          // Sorry for the hack folks this is too much for me to fix ATM
          for (const key in args || {}) {
            args[key] = fullArgs[key];
          }
        }
      } else {
        listener.execute(listener.initialArgs, args);
      }
    }
  }
}

module.exports = {
  BattleEventHandler,
};
