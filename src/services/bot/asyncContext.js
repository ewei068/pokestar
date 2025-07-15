const { AsyncLocalStorage } = require("node:async_hooks");

const asyncLocalStorage = new AsyncLocalStorage();

/**
 * @typedef {{
 *  user?: CompactUser,
 *  completedQuest?: {
 *   questId: QuestEnum,
 *   questType: QuestTypeEnum,
 *  }
 * }} AsyncContextStore
 */

const DEFAULT_STORE = {};

const runWithContext = (fn, store = DEFAULT_STORE) =>
  asyncLocalStorage.run(store, fn);

/**
 * @returns {AsyncContextStore}
 */
const getAsyncContext = () => asyncLocalStorage.getStore() || DEFAULT_STORE;

module.exports = { runWithContext, getAsyncContext };
