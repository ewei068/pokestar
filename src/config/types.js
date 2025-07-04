/** @typedef {import("./pokemonConfig").PokemonTypeEnum} PokemonTypeEnum */
/** @typedef {import("./pokemonConfig").GrowthRateEnum} GrowthRateEnum */
/** @typedef {import("./pokemonConfig").NatureEnum} NatureEnum  */
/** @typedef {import("./pokemonConfig").RarityEnum} RarityEnum  */
/** @typedef {import("./pokemonConfig").StatIndexEnum} StatIndexEnum */
/** @typedef {import("./equipmentConfig").EquipmentModifierSlotEnum} EquipmentModifierSlotEnum */
/** @typedef {import("./equipmentConfig").EquipmentModifierTypeEnum} EquipmentModifierTypeEnum */
/** @typedef {import("./equipmentConfig").EquipmentTypeEnum} EquipmentTypeEnum */
/** @typedef {import("./equipmentConfig").EquipmentModifierEnum} EquipmentModifierEnum */
/** @typedef {import("./pokemonConfig").PokemonIdEnum} PokemonIdEnum */
/** @typedef {import("./locationConfig").LocationEnum} LocationEnum */
/** @typedef {import("./npcConfig").NpcEnum} NpcEnum */
/** @typedef {import("./npcConfig").DungeonEnum} DungeonEnum */
/** @typedef {import("./npcConfig").RaidEnum} RaidEnum */
/** @typedef {import("./npcConfig").RaidConfigData} RaidConfigData */
/** @typedef {import("./npcConfig").NpcDifficultyEnum} NpcDifficultyEnum  */
/** @typedef {import("./backpackConfig").BackpackItemEnum} BackpackItemEnum */
/** @typedef {import("./backpackConfig").BackpackCategoryEnum} BackpackCategoryEnum */
/** @typedef {import("./backpackConfig").CraftableItemData} CraftableItemData */
/** @typedef {import("./backpackConfig").CraftableItemEnum} CraftableItemEnum */
/** @typedef {import("./shopConfig").ShopItemEnum} ShopItemEnum */
/** @typedef {import("./shopConfig").ShopCategoryEnum} ShopCategoryEnum */
/** @typedef {import("./commandConfig").CommandCategoryEnum} CommandCategoryEnum */
/** @typedef {import("./commandConfig").CommandEnum} CommandEnum */
/** @typedef {import("./helpConfig").EventData} EventData */
/** @typedef {import("./gachaConfig").BannerData} BannerData */
/** @typedef {import("./trainerConfig").UserSettingsEnum} UserSettingsEnum */
/** @typedef {import("./trainerConfig").UserSettingsData} UserSettingsData */
/** @typedef {import("./questConfig").TutorialStageEnum} TutorialStageEnum */
/** @typedef {import("./questConfig").TutorialStageData} TutorialStageData */
/** @typedef {import("./questConfig").QuestConfig} QuestConfig */
/** @typedef {import("./questConfig").DailyQuestConfig} DailyQuestConfig */
/** @typedef {import("./questConfig").AchievementConfig} AchievementConfig */
/** @typedef {import("./questConfig").DailyQuestEnum} DailyQuestEnum */
/** @typedef {import("./questConfig").AchievementEnum} AchievementEnum */

/**
 * @template {UserSettingsEnum} T
 * @typedef {import("./trainerConfig").UserSettingsOptions<T>} UserSettingsOptions
 */
/**
 * @template {TrainerEventEnum} T
 * @typedef {import("./questConfig").QuestEventListenerCallback<T>} QuestEventListenerCallback
 */

/**
 * @typedef {"eviolite" | "testTag"} PokemonTag
 * @typedef {{
 *  name: string,
 *  emoji: string,
 *  description: string,
 *  type: Array<PokemonTypeEnum>,
 *  baseStats: Array<number>,
 *  sprite: string,
 *  shinySprite: string,
 *  evolution?: Array<{
 *    level: number,
 *    id: any // TODO,
 *  }>,
 *  baseSpeciesId?: string,
 *  formSpeciesIds?: string[],
 *  abilities: {
 *    [key: number | string]: number // TODO?
 *  },
 *  moveIds: Array<MoveIdEnum>,
 *  battleEligible: boolean,
 *  rarity: RarityEnum,
 *  growthRate: GrowthRateEnum,
 *  noGacha?: boolean,
 *  mythicConfig?: any,
 *  unobtainable?: boolean
 *  tags?: PokemonTag[]
 * }} PokemonConfigData
 */
