/** Locate any approved type/category recipe without reading rendering code. */
import type { VfxType, VfxKind } from '../types';
import { arcaneRecipes } from './arcane';
import { elementsRecipes } from './elements';
import { mineralsRecipes } from './minerals';
import { natureRecipes } from './nature';
import { focusedRecipes } from './focused';
import { qualityRecipes } from './quality';
import { fireRecipes } from './fire';

export const tileEffectRecipes = {
  "bug-physical": natureRecipes.bugPhysical,
  "bug-special": natureRecipes.bugSpecial,
  "bug-status": natureRecipes.bugStatus,
  "dark-physical": arcaneRecipes.darkPhysical,
  "dark-special": arcaneRecipes.darkSpecial,
  "dark-status": arcaneRecipes.darkStatus,
  "dragon-physical": arcaneRecipes.dragonPhysical,
  "dragon-special": arcaneRecipes.dragonSpecial,
  "dragon-status": arcaneRecipes.dragonStatus,
  "electric-physical": elementsRecipes.electricPhysical,
  "electric-special": elementsRecipes.electricSpecial,
  "electric-status": elementsRecipes.electricStatus,
  "fairy-physical": arcaneRecipes.fairyPhysical,
  "fairy-special": arcaneRecipes.fairySpecial,
  "fairy-status": qualityRecipes.fairyStatus,
  "fighting-physical": focusedRecipes.fightingPhysical,
  "fighting-special": focusedRecipes.fightingSpecial,
  "fighting-status": focusedRecipes.fightingStatus,
  "fire-physical": elementsRecipes.firePhysical,
  "fire-special": fireRecipes.fireSpecial,
  "fire-status": elementsRecipes.fireStatus,
  "flying-physical": natureRecipes.flyingPhysical,
  "flying-special": natureRecipes.flyingSpecial,
  "flying-status": natureRecipes.flyingStatus,
  "ghost-physical": arcaneRecipes.ghostPhysical,
  "ghost-special": arcaneRecipes.ghostSpecial,
  "ghost-status": arcaneRecipes.ghostStatus,
  "grass-physical": natureRecipes.grassPhysical,
  "grass-special": natureRecipes.grassSpecial,
  "grass-status": natureRecipes.grassStatus,
  "ground-physical": mineralsRecipes.groundPhysical,
  "ground-special": mineralsRecipes.groundSpecial,
  "ground-status": mineralsRecipes.groundStatus,
  "ice-physical": mineralsRecipes.icePhysical,
  "ice-special": mineralsRecipes.iceSpecial,
  "ice-status": mineralsRecipes.iceStatus,
  "normal-physical": qualityRecipes.normalPhysical,
  "normal-special": arcaneRecipes.normalSpecial,
  "normal-status": arcaneRecipes.normalStatus,
  "poison-physical": focusedRecipes.poisonPhysical,
  "poison-special": focusedRecipes.poisonSpecial,
  "poison-status": focusedRecipes.poisonStatus,
  "psychic-physical": arcaneRecipes.psychicPhysical,
  "psychic-special": arcaneRecipes.psychicSpecial,
  "psychic-status": arcaneRecipes.psychicStatus,
  "rock-physical": mineralsRecipes.rockPhysical,
  "rock-special": mineralsRecipes.rockSpecial,
  "rock-status": mineralsRecipes.rockStatus,
  "steel-physical": mineralsRecipes.steelPhysical,
  "steel-special": mineralsRecipes.steelSpecial,
  "steel-status": mineralsRecipes.steelStatus,
  "water-physical": elementsRecipes.waterPhysical,
  "water-special": elementsRecipes.waterSpecial,
  "water-status": elementsRecipes.waterStatus,
} satisfies Record<`${VfxType}-${VfxKind}`, object>;

export type TileEffectId = keyof typeof tileEffectRecipes;
export type TileEffectSettings<K extends TileEffectId> = typeof tileEffectRecipes[K];
