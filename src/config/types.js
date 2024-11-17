/** @typedef {import("./pokemonConfig").PokemonIdEnum} PokemonIdEnum */
/** @typedef {import("./pokemonConfig").PokemonTypeEnum} PokemonTypeEnum */
/** @typedef {import("./pokemonConfig").GrowthRateEnum} GrowthRateEnum */
/** @typedef {import("./pokemonConfig").NatureEnum} NatureEnum  */
/** @typedef {import("./pokemonConfig").RarityEnum} RarityEnum  */
/** @typedef {import("./equipmentConfig").EquipmentModifierSlotEnum} EquipmentModifierSlotEnum */
/** @typedef {import("./equipmentConfig").EquipmentModifierTypeEnum} EquipmentModifierTypeEnum */
/** @typedef {import("./equipmentConfig").EquipmentTypeEnum} EquipmentTypeEnum */
/** @typedef {import("./equipmentConfig").EquipmentModifierEnum} EquipmentModifierEnum */
/** @typedef {import("./locationConfig").LocationEnum} LocationEnum */

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
