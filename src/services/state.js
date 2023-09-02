/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * state.js the base state logic for holding information for the current state of the user's interactions with the bot.
*/
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

const getStateCount = () => {
    return Object.keys(states).length;
}

const setTtl = (stateId, ttl) => {
    // check if state exists
    if (stateId in states && stateId in ttls) {
        // update ttl
        ttls[stateId].ttl = ttl;
    }
}

module.exports = {
    setState: setState,
    getState: getState,
    updateState: updateState,
    deleteState: deleteState,
    getStateCount: getStateCount,
    setTtl: setTtl
}