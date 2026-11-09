const { backpackItemConfig } = require("../config/backpackConfig");
const { collectionNames } = require("../config/databaseConfig");
const { findAndUpdateDocument } = require("../database/mongoHandler");

/**
 * @typedef {object} BackpackChange
 * @property {Record<string, unknown>} filter
 * @property {Record<string, unknown>} afterFilter
 * @property {{$set: Record<string, number>}} update
 * @property {{$set?: Record<string, number>, $unset?: Record<string, string>}} inverse
 */

/**
 * Prepare one exact inventory change and its postvalue-guarded inverse.
 * Missing item paths are distinct from stored zero balances.
 * @param {WithId<Trainer>} trainer
 * @param {Record<string, number>} deltas Trusted, configured item IDs and quantities.
 * @returns {BackpackChange | null}
 */
const prepareBackpackChange = (trainer, deltas) => {
  const filter = { userId: trainer.userId };
  const afterFilter = { userId: trainer.userId };
  const forward = /** @type {Record<string, number>} */ ({});
  const restore = /** @type {Record<string, number>} */ ({});
  const unset = /** @type {Record<string, string>} */ ({});
  for (const [id, delta] of Object.entries(deltas)) {
    const { category } = backpackItemConfig[id];
    const before = trainer.backpack?.[category]?.[id];
    if (before !== undefined && (!Number.isSafeInteger(before) || before < 0)) return null;
    const after = (before ?? 0) + delta;
    if (!Number.isSafeInteger(after) || after < 0) return null;
    const path = `backpack.${category}.${id}`;
    filter[path] = before === undefined ? { $exists: false } : { $eq: before };
    afterFilter[path] = { $eq: after };
    forward[path] = after;
    if (before === undefined) unset[path] = "";
    else restore[path] = before;
  }
  return { filter, update: { $set: forward }, afterFilter,
    inverse: { ...(Object.keys(restore).length ? { $set: restore } : {}),
      ...(Object.keys(unset).length ? { $unset: unset } : {}) } };
};

/**
 * Throws on ambiguous outcomes; callers must not infer that no write occurred.
 * @param {BackpackChange} change
 * @param {boolean=} inverse
 * @returns {Promise<WithId<Trainer> | null>}
 */
const writeBackpackChange = async (change, inverse = false) => {
  const result = await findAndUpdateDocument(collectionNames.USERS,
    inverse ? change.afterFilter : change.filter,
    inverse ? change.inverse : change.update,
    { upsert: false, returnDocument: "after" });
  return /** @type {WithId<Trainer> | null} */ (result.value);
};

module.exports = { prepareBackpackChange, writeBackpackChange };
