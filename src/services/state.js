/**
 * @file
 * @author Elvis Wei
 *
 * state.js the base state logic for holding information for the current state of the user's interactions with the bot.
 */
const shortid = require("shortid");

const states = {};
const ttls = {};

const handleTimeout = (stateId) => {
  // check if state exists
  if (!(stateId in states)) {
    return;
  }

  const now = Date.now();
  const ttl = ttls[stateId];
  if (now - ttl.lastCalled > ttl.ttl * 1000) {
    delete states[stateId];
    delete ttls[stateId];
  } else {
    setTimeout(() => {
      handleTimeout(stateId);
    }, ttl.ttl * 1000 - (now - ttl.lastCalled));
  }
};

const setState = (state, ttl = 60, stateIdOverride = undefined) => {
  // generate random state UUID
  const stateId = stateIdOverride || shortid.generate();
  // add state to states object
  states[stateId] = state;

  // set refreshable ttl (seconds) to delete state
  if (ttl) {
    ttls[stateId] = {
      ttl,
      lastCalled: Date.now(),
    };
    handleTimeout(stateId);
  }

  // return state UUID
  return stateId;
};

const updateState = (stateId, state) => {
  // check if state exists
  if (stateId in states) {
    // update state
    states[stateId] = state;
    // update lastCalled time
    ttls[stateId].lastCalled = Date.now();
  }
};

const getState = (stateId, refresh = true) => {
  // check if state exists
  if (stateId in states) {
    if (refresh) {
      // update lastCalled time
      ttls[stateId].lastCalled = Date.now();
    }
    // return state
    return states[stateId];
  }
  return null;
};

const getOrCreateState = (stateId, { refresh = true, ttl = 60 } = {}) => {
  let state = getState(stateId, refresh);
  if (!state) {
    state = {};
    setState(state, ttl, stateId);
  }
  return state;
};

const deleteState = (stateId) => {
  // check if state exists
  if (stateId in states) {
    // delete state
    delete states[stateId];
    delete ttls[stateId];
  }
};

const getStateCount = () => Object.keys(states).length;

const setTtl = (stateId, ttl) => {
  // check if state exists
  if (stateId in states && stateId in ttls) {
    // update ttl
    ttls[stateId].ttl = ttl;
  }
};

module.exports = {
  setState,
  getState,
  getOrCreateState,
  updateState,
  deleteState,
  getStateCount,
  setTtl,
};
