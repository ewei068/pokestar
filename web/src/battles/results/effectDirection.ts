import type { BattleCatalog } from '../types';

/** Direction describes the consequence: removing a debuff is an improvement. */
export const effectDirection = (effectId: string, removed: boolean, catalog: BattleCatalog): 'buff' | 'debuff' | 'neutral' => {
  const type = catalog.effects[effectId]?.type;
  if (type !== 'Buff' && type !== 'Debuff') return 'neutral';
  return (type === 'Buff') !== removed ? 'buff' : 'debuff';
};
