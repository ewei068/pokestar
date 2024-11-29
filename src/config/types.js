/** @typedef {import("./pokemonConfig").PokemonTypeEnum} PokemonTypeEnum */
/** @typedef {import("./pokemonConfig").GrowthRateEnum} GrowthRateEnum */
/** @typedef {import("./pokemonConfig").NatureEnum} NatureEnum  */
/** @typedef {import("./pokemonConfig").RarityEnum} RarityEnum  */
/** @typedef {import("./equipmentConfig").EquipmentModifierSlotEnum} EquipmentModifierSlotEnum */
/** @typedef {import("./equipmentConfig").EquipmentModifierTypeEnum} EquipmentModifierTypeEnum */
/** @typedef {import("./equipmentConfig").EquipmentTypeEnum} EquipmentTypeEnum */
/** @typedef {import("./equipmentConfig").EquipmentModifierEnum} EquipmentModifierEnum */
/** @typedef {import("./locationConfig").LocationEnum} LocationEnum */
/** @typedef {import("./npcConfig").NpcEnum} NpcEnum */
/** @typedef {import("./npcConfig").DungeonEnum} DungeonEnum */
/** @typedef {import("./npcConfig").RaidEnum} RaidEnum */
/** @typedef {import("./npcConfig").NpcDifficultyEnum} NpcDifficultyEnum  */
/** @typedef {import("./backpackConfig").BackpackItemEnum} BackpackItemEnum */
/** @typedef {import("./backpackConfig").BackpackCategoryEnum} BackpackCategoryEnum */
/** @typedef {import("./shopConfig").ShopItemEnum} ShopItemEnum */
/** @typedef {import("./shopConfig").ShopCategoryEnum} ShopCategoryEnum */
/** @typedef {import("./commandConfig").CommandCategoryEnum} CommandCategoryEnum */
/** @typedef {import("./commandConfig").CommandEnum} CommandEnum */
/** @typedef {import("./helpConfig").EventData} EventData */
/** @typedef {import("./gachaConfig").BannerData} BannerData */

/**
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
 *    id: any // TODO
 *  }>,
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
 * }} PokemonConfigData
 */
