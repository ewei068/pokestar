// TODO: organize this lol

/**
 * @typedef {import("discord.js").User} DiscordUser
 * @typedef {import("discord.js").Guild} DiscordGuild
 */

/**
 * @template T
 * @typedef {T[keyof T]} Enum<T>
 */

/**
 * @template {{[key in string | number]: any}} T
 * @typedef {keyof T extends string | number ? `${keyof T}` : any} Keys<T>
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
 * @typedef {PartialRecord<BackpackCategoryEnum, PartialRecord<BackpackItemEnum, number>>} Backpack
 * @typedef {PartialRecord<BackpackItemEnum, number>} FlattenedBackpack
 */

/**
 * @typedef {{
 *  money?: number,
 *  backpack?: Backpack
 * }} Rewards
 * @typedef {{
 *  money?: number,
 *  backpack?: FlattenedBackpack
 * }} FlattenedRewards
 *
 * These are the same type for now
 * @typedef {Rewards} Cost
 * @typedef {FlattenedRewards} FlattenedCost
 */

/**
 * @typedef {{[K in UserSettingsEnum]: UserSettingsOptions<K>}} UserSettings
 * TODO: fix this type
 * @typedef {{ completedTutorialStages: PartialRecord<string, boolean>, currentTutorialStage: TutorialStageEnum }} UserTutorialData
 * @typedef {{ timesSeen: number, lastSeen: number }} UserUpsellData
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
 * @property {Backpack} backpack
 * @property {PartialRecord<LocationEnum, number>} locations
 * @property {UserTradeInfo} trade
 * @property {UserSettings} settings
 *
 * Rewards and time-gated stuff
 * @property {number} lastCorrected
 * @property {boolean} claimedDaily
 * @property {PartialRecord<ShopItemEnum, number>} purchasedShopItemsToday
 * @property {Array<number>} claimedLevelRewards
 * @property {PartialRecord<NpcEnum | RaidEnum | DungeonEnum | number, NpcDifficultyEnum[]>} defeatedNPCsToday
 * @property {PartialRecord<NpcEnum | RaidEnum | DungeonEnum | number, NpcDifficultyEnum[]>} defeatedNPCs
 * @property {number} lastTowerStage
 * @property {UserTutorialData} tutorialData
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
 * @property {boolean} hasJirachi
 * @property {boolean} hasDarkrai
 * @property {boolean} usedTimeTravel
 * @property {boolean} usedWish
 * @property {number} dreamCards
 *
 * Misc
 * @property {PartialRecord<UpsellEnum, UserUpsellData>} upsellData
 */

/**
 * @typedef {{ mode: "allowlist" | "denylist", channelIds: string[] }} SpawnSettings
 */

/**
 * @typedef {object} GuildData
 * @property {string} guildId
 * @property {number} lastCommand
 * @property {SpawnSettings} spawnSettings
 * @property {number} lastCorrected
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
 * @typedef {[number, number, number, number, number, number]} StatArray
 * @typedef {"hp" | "atk" | "def" | "spa" | "spd" | "spe"} StatId
 * @typedef {"atk" | "def" | "spa" | "spd" | "spe"} StatIdNoHP
 */

/**
 * @typedef {object} Pokemon
 *
 * Basic info
 * @property {string} userId
 * @property {PokemonIdEnum} speciesId
 * @property {string} name
 * @property {number} dateAcquired
 * @property {string} originalOwner
 *
 * Progression
 * @property {number} level
 * @property {number} exp
 *
 * Stats
 * @property {StatArray} evs
 * @property {StatArray} ivs
 * @property {number} ivTotal
 * @property {StatArray} stats
 * @property {number} combatPower
 *
 * Important info (IDK)
 * @property {NatureEnum} natureId
 * @property {AbilityIdEnum | string | number} abilityId
 * @property {HeldItemIdEnum?} heldItemId
 * @property {boolean} shiny
 * @property {MoveIdEnum[]} moveIds
 *
 * Equipment
 * @property {EquipmentSet} equipments
 * @property {string} item Unused currently
 *
 * Other tags
 * @property {RarityEnum} rarity
 * @property {boolean} locked
 * @property {boolean} battleEligible All Pokemon are battle eligible now
 */

/**
 * @template T
 * @typedef {import('mongodb').Collection & T} MongoCollection
 */

/**
 * @template T
 * @typedef {import('mongodb').WithId<T>} WithId
 */

/**
 * @typedef {object} Raid
 * @property {string} userId
 * @property {RaidEnum} raidId
 * @property {string} raidUserId Placeholder user ID for raid enemy
 * @property {string} bossPokemonId Placeholder Pokemon ID for raid boss
 * @property {NpcDifficultyEnum} difficulty
 * @property {Pokemon & {remainingHp: number, _id: string}} boss
 * @property {number} ttl
 * @property {Record<string, number>} participants Map participant user ID to damage dealt
 * @property {string[]} stateIds
 */

/**
 * @template T, U
 * @callback FieldRefreshCallback
 * @param {object} param0
 * @param {T} param0.previousObject
 * @param {U} param0.previousValue
 * @param {Date} param0.lastCorrectedDate
 * @param {number} param0.refreshInterval
 * @returns {U}
 */
/**
 * @template T
 * @typedef {{
 *  type: "string" | "number" | "boolean" | "object" | "array",
 *  default?: any,
 *  refreshInterval?: number
 *  config?: DefaultFieldConfig<T>
 *  refreshCallback?: FieldRefreshCallback<T, any>
 * }} FieldConfigEntry
 */
/**
 * @template T
 * @typedef {Record<string, FieldConfigEntry<T>>} DefaultFieldConfig
 */
