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
 * @property {number} lastCorrected
 * @property {boolean} claimedDaily
 * @property {object} purchasedShopItemsToday
 * @property {Array<number>} claimedLevelRewards
 * @property {object} defeatedNPCsToday
 * @property {object} defeatedNPCs
 * @property {number} lastTowerStage
 *
 * Party info
 * @property {PartyInfo} party
 * @property {{[key: string]: PartyInfo}} savedParties
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
 * @typedef {object} Equipment
 * @property {number} level
 * @property {{
 *  [key in EquipmentModifierSlotEnum]: {
 *   modifier: EquipmentModifierEnum,
 *   quality: number
 *  }
 * }} slots
 */

/**
 * @typedef {{
 *  [key in EquipmentTypeEnum]: Equipment
 * }} EquipmentSet
 */

/**
 * TODO: organize
 * @typedef {object} Pokemon
 * @property {string} userId
 * @property {PokemonIdEnum} speciesId
 * @property {string} name
 * @property {number} level
 * @property {number} exp
 * @property {[number, number, number, number, number, number]} evs
 * @property {[number, number, number, number, number, number]} ivs
 * @property {[number, number, number, number, number, number]} stats
 * @property {number} combatPower
 * @property {NatureEnum} natureId
 * @property {AbilityIdEnum | string | number} abilityId
 * @property {string} item
 * @property {MoveIdEnum[]} moveIds
 * @property {boolean} shiny
 * @property {number} dateAcquired
 * @property {number} ivTotal
 * @property {string} originalOwner
 * @property {RarityEnum} rarity
 * @property {EquipmentSet} equipments
 * @property {boolean} locked
 * @property {boolean} battleEligible
 */

/**
 * @template T
 * @typedef {import('mongodb').Collection & T} MongoCollection
 */
