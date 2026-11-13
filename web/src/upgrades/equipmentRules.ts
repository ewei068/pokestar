import type { EquipmentCatalog } from "../player/types";

export const equipmentValue = (catalog: EquipmentCatalog, modifier: string, value: number) =>
  `+${value}${catalog.modifiers.find(item => item.id === modifier)?.type === "percent" ? "%" : ""}`;
/** Display-only interpolation for the optional rules calculator and confirmed before values. */
export const equipmentRuleValue = (catalog: EquipmentCatalog, slot: string, modifier: string, quality: number, level: number) => {
  const rule = catalog.modifiers.find(item => item.id === modifier);
  return rule ? Math.round((quality / 100 * (rule.max - rule.min) + rule.min)
    * (catalog.slots.find(item => item.id === slot)?.scalesWithLevel ? level : 1)) : 0;
};
