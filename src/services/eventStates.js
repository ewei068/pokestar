const { v4: uuidv4 } = require('uuid');

const states = {};
const ttls = {};

const cleanup = () => {
    const now = Date.now();
    const toDelete = [];
    for (const stateId in ttls) {
        const ttl = ttls[stateId];
        if (now - ttl.lastCalled > ttl.ttl * 1000) {
            toDelete.push(stateId);
        }
    }

    for (const stateId of toDelete) {
        delete states[stateId];
        delete ttls[stateId];
    }
}

const setState = (state, ttl=60) => {
    // generate random state UUID
    const stateId = uuidv4();
    // add state to states object
    states[stateId] = state;
    
    // set refreshable ttl (seconds) to delete state
    if (ttl) {
        ttls[stateId] = {
            ttl: ttl,
            lastCalled: Date.now()
        }
    }

    cleanup();

    // return state UUID
    return stateId;
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
    deleteState: deleteState
}