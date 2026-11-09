export type ItemUseAction = "catch" | "change-nature" | "equip";
export type ItemUse = { action: ItemUseAction; label: string; closed?: string };

const actions: Record<ItemUseAction, ItemUse> = {
  catch: { action: "catch", label: "Catch", closed: "Catch isn't on the web yet. This ball stays in your bag." },
  "change-nature": { action: "change-nature", label: "Change nature" },
  equip: { action: "equip", label: "Equip" },
};

const categoryUse: Record<string, ItemUseAction> = { "0": "catch", "3": "equip" };
const itemUseOverrides: Record<string, ItemUseAction> = { "7": "change-nature" };

/** A category default, unless this item overrides it. No match means no button. */
export const resolveItemUse = (itemId: string, category: string): ItemUse | null => {
  const action = itemUseOverrides[itemId] || categoryUse[category];
  return action ? actions[action] : null;
};
