import type { BattleCatalog } from '../types';

/** Effect gain uses the catalog category; removals have no VFX. */
export const effectDirection = (effectId: string, catalog: BattleCatalog): 'buff' | 'debuff' | 'neutral' => {
  const type = catalog.effects[effectId]?.type;
  return type === 'Buff' ? 'buff' : type === 'Debuff' ? 'debuff' : 'neutral';
};
