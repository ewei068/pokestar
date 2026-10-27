import { typeName } from "../typeDisplay";
import type { BattleCatalog } from "../types";

export const standardVfxTypes = [
  "normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost",
  "steel", "fire", "water", "grass", "electric", "psychic", "ice", "dragon",
  "dark", "fairy",
] as const;

export type VfxType = typeof standardVfxTypes[number];
export type VfxKind = "physical" | "special" | "status";

const standardTypeSet: ReadonlySet<string> = new Set(standardVfxTypes);

/** Unknown, Shadow, Stellar, and future engine types intentionally use Normal art. */
export const resolveVfxType = (value: string | number, catalog: BattleCatalog): VfxType => {
  const name = typeName(value, catalog).toLowerCase();
  return standardTypeSet.has(name) ? name as VfxType : "normal";
};

export const vfxPalette: Record<VfxType, { main: string; light: string; dark: string }> = {
  normal: { main: "#6a8793", light: "#fff8db", dark: "#455768" },
  fighting: { main: "#b14339", light: "#ffd8a3", dark: "#853d43" },
  flying: { main: "#437ba8", light: "#eefaff", dark: "#3d6d9f" },
  poison: { main: "#8b4da9", light: "#e5c9f3", dark: "#643f84" },
  ground: { main: "#926133", light: "#f7d5a1", dark: "#6c4c36" },
  rock: { main: "#796147", light: "#ede0c8", dark: "#61564e" },
  bug: { main: "#59853d", light: "#e7f2ab", dark: "#466d44" },
  ghost: { main: "#665187", light: "#ded6f4", dark: "#4a496f" },
  steel: { main: "#547b8a", light: "#f1fbff", dark: "#4f6577" },
  fire: { main: "#e86d3c", light: "#ffda69", dark: "#a94439" },
  water: { main: "#357ea9", light: "#dcf6ff", dark: "#376a9b" },
  grass: { main: "#3e8d55", light: "#dff5a1", dark: "#317a63" },
  electric: { main: "#aa7a0c", light: "#fff3a0", dark: "#74541c" },
  psychic: { main: "#cf6c9b", light: "#ffe0ef", dark: "#9b4b86" },
  ice: { main: "#3d8ca5", light: "#efffff", dark: "#4a8cae" },
  dragon: { main: "#716cc1", light: "#d9d4ff", dark: "#4c519b" },
  dark: { main: "#55536e", light: "#b9b5d5", dark: "#2e344e" },
  fairy: { main: "#b4598d", light: "#ffe8f6", dark: "#a75893" },
};
