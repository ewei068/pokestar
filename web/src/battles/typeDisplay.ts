import type { BattleCatalog } from "./types";

// Older catalog responses omit type names; keep their engine IDs readable.
const legacyTypeNames = [
  "Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost",
  "Steel", "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", "Dragon",
  "Dark", "Fairy", "Unknown", "Shadow",
];

export const typeName = (type: string | number | null | undefined, catalog: BattleCatalog): string => {
  if (type === null || type === undefined || type === "") return "Normal";
  const id = typeof type === "number" ? type : Number(type);
  if (Number.isInteger(id) && String(id) === String(type)) {
    return catalog.types?.[id]?.name || legacyTypeNames[id] || `Type ${id}`;
  }
  return String(type);
};

export const typeClass = (type: string | number | null | undefined, catalog: BattleCatalog): string =>
  `arena-type-${typeName(type, catalog).toLowerCase().replace(/[^a-z]/g, "")}`;
