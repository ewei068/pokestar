module.exports._typesOnly = true;

// TODO: organize this lol

/**
 * @template T
 * @typedef {T[keyof T]} Enum<T>
 */

/**
 * @typedef {Object} CompactUser
 * @property {string} id
 * @property {string} username
 * @property {string?} discriminator
 * @property {string} avatar
 */

/**
 * @typedef {Object} UserVotingInfo
 * @property {number} lastVoted
 * @property {number} streak
 * @property {number} rewards
 */

/**
 * @typedef {Object} UserTradeInfo
 * @property {number} money
 * @property {Array<string>} pokemonIds
 */

/**
 * @typedef {Object} PartyInfo
 * @property {Array<string?>} pokemonIds
 * @property {number} rows
 * @property {number} cols
 */

/**
 * @typedef {Object} Trainer
 *
 * Discord user info
 * @property {string} userId
 * @property {CompactUser} user
 * @property {UserVotingInfo} voting
 *
 * Basic trainer info
 * @property {number} level
 * @property {number} exp
 * @property {number} money
 * @property {Object} backpack
 * @property {Object} locations
 * @property {UserTradeInfo} trade
 *
 * Rewards and time-gated stuff
 * @property {number} lastDaily
 * @property {boolean} claimedDaily
 * @property {Object} purchasedShopItemsToday
 * @property {Array<number>} claimedLevelRewards
 * @property {Object} defeatedNPCsToday
 * @property {Object} defeatedNPCs
 * @property {number} lastTowerStage
 *
 * Party info
 * @property {PartyInfo} party
 * @property {Object<number, PartyInfo>} savedParties
 *
 * Banner
 * @property {number} beginnerRolls
 * @property {Object} banners
 *
 * Mythic Pokemon
 * @property {boolean} hasCelebi
 * @property {boolean} usedTimeTravel
 */

/**
 * @typedef {Object} Guild
 * @property {string} guildId
 * @property {number} lastCommand
 * @property {boolean} spawnDisabled
 * @property {Array<string>} spawnDisabledChannels
 */

/**
 * @template T
 * @typedef {import('mongodb').Collection & T} MongoCollection
 */
