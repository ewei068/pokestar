const shortid = require('shortid');
const { logger } = require('../log');


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
        logger.warn(`State ${stateId} timed out!`);
    } else {
        setTimeout(() => {
            handleTimeout(stateId);
        }, ttl.ttl * 1000 - (now - ttl.lastCalled));
    }
}


const setState = (state, ttl=60) => {
    // generate random state UUID
    const stateId = shortid.generate();
    // add state to states object
    states[stateId] = state;
    
    // set refreshable ttl (seconds) to delete state
    if (ttl) {
        ttls[stateId] = {
            ttl: ttl,
            lastCalled: Date.now()
        }
        handleTimeout(stateId);
    }

    // return state UUID
    return stateId;
}

const updateState = (stateId, state) => {
    // check if state exists
    if (stateId in states) {
        // update state
        states[stateId] = state;
        // update lastCalled time
        ttls[stateId].lastCalled = Date.now();
    }
}

const getState = (stateId) => {
    // check if state exists
    if (stateId in states) {
        // update lastCalled time
        ttls[stateId].lastCalled = Date.now();
        // return state
        return states[stateId];
    } else {
        return null;
    }
}

const deleteState = (stateId) => {
    // check if state exists
    if (stateId in states) {
        // delete state
        delete states[stateId];
        delete ttls[stateId];
    }
}

module.exports = {
    setState: setState,
    getState: getState,
    updateState: updateState,
    deleteState: deleteState
}