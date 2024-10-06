module.exports._typesOnly = true;

// TODO: organize this lol

/**
 * @template T
 * @typedef {T[keyof T]} Enum<T>
 */

/**
 * @template T
 * @typedef {keyof T} Keys<T>
 */

/**
 * @template {string | number | symbol} T
 * @template U
 * @typedef {{ [K in T]?: U; }} PartialRecord
 */

/**
 * @typedef {object} CompactUser
 * @property {string} id
 * @property {string} username
 * @property {string?} discriminator
 * @property {string} avatar
 */

/**
 * @typedef {object} UserVotingInfo
 * @property {number} lastVoted
 * @property {number} streak
 * @property {number} rewards
 */

/**
 * @typedef {object} UserTradeInfo
 * @property {number} money
 * @property {Array<string>} pokemonIds
 */

/**
 * @typedef {object} PartyInfo
 * @property {Array<string?>} pokemonIds
 * @property {number} rows
 * @property {number} cols
 */

/**
 * @typedef {object} Trainer
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
 * @property {object} backpack
 * @property {object} locations
 * @property {UserTradeInfo} trade
 *
 * Rewards and time-gated stuff
 * @property {number} lastDaily
 * @property {boolean} claimedDaily
 * @property {object} purchasedShopItemsToday
 * @property {Array<number>} claimedLevelRewards
 * @property {object} defeatedNPCsToday
 * @property {object} defeatedNPCs
 * @property {number} lastTowerStage
 *
 * Party info
 * @property {PartyInfo} party
 * @property {Object<number, PartyInfo>} savedParties
 *
 * Banner
 * @property {number} beginnerRolls
 * @property {object} banners
 *
 * Mythic Pokemon
 * @property {boolean} hasCelebi
 * @property {boolean} usedTimeTravel
 */

/**
 * @typedef {object} Guild
 * @property {string} guildId
 * @property {number} lastCommand
 * @property {boolean} spawnDisabled
 * @property {Array<string>} spawnDisabledChannels
 */

/**
 * @template T
 * @typedef {import('mongodb').Collection & T} MongoCollection
 */
