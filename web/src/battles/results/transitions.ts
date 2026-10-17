import type { BattleView } from '../types';
import { resultAnimationConfig as config } from './config';

export type StatusChange = { pokemonId: string; statusId: string; removed: boolean };
export type EffectChange = { pokemonId: string; effectId: string; removed: boolean };
export type ViewChanges = { meters: string[]; damaged: string[]; healed: string[]; cues: string[]; fainted: string[]; revived: string[]; weather: boolean; statuses: StatusChange[]; effects: EffectChange[] };
export const viewChanges = (before: BattleView, after: BattleView): ViewChanges => {
  const changes: ViewChanges = { meters: [], damaged: [], healed: [], cues: [], fainted: [], revived: [], statuses: [], effects: [], weather: JSON.stringify(before.weather) !== JSON.stringify(after.weather) };
  for (const [id, next] of Object.entries(after.pokemon)) {
    const previous = before.pokemon[id]; if (!previous) continue;
    if (next.hp < previous.hp) changes.damaged.push(id);
    if (next.hp > previous.hp) changes.healed.push(id);
    if (previous.hp !== next.hp || previous.maxHp !== next.maxHp || previous.combatReadiness !== next.combatReadiness) changes.meters.push(id);
    if (JSON.stringify(previous.status) !== JSON.stringify(next.status) || Object.entries(next.effectIds).some(([id, state]) => JSON.stringify(previous.effectIds[id]) !== JSON.stringify(state))) changes.cues.push(id);
    const beforeStatus = previous.status?.statusId, afterStatus = next.status?.statusId;
    if (beforeStatus !== afterStatus) {
      if (beforeStatus) changes.statuses.push({ pokemonId: id, statusId: beforeStatus, removed: true });
      if (afterStatus) changes.statuses.push({ pokemonId: id, statusId: afterStatus, removed: false });
    }
    for (const effectId of Object.keys(previous.effectIds))
      if (!(effectId in next.effectIds)) changes.effects.push({ pokemonId: id, effectId, removed: true });
    for (const effectId of Object.keys(next.effectIds))
      if (!(effectId in previous.effectIds)) changes.effects.push({ pokemonId: id, effectId, removed: false });
    if (!previous.isFainted && next.isFainted) changes.fainted.push(id);
    if (previous.isFainted && !next.isFainted) changes.revived.push(id);
  }
  return changes;
};
export const transitionDuration = (changes: ViewChanges) => Math.max(
  changes.statuses.some(change => !change.removed) ? config.reactions.status.durationMs : 0,
  changes.statuses.some(change => change.removed) ? config.reactions.status.clearMs : 0,
  changes.effects.some(change => !change.removed) ? config.reactions.effect.durationMs : 0,
  changes.damaged.length ? config.reactions.damage.durationMs : 0,
  changes.healed.length ? config.reactions.heal.durationMs : 0,
  changes.fainted.length ? config.reactions.faint.durationMs : 0,
  changes.meters.length ? config.transition.meterMs : 0,
  changes.cues.length || changes.weather ? config.transition.cueMs : 0,
  changes.fainted.length || changes.revived.length ? config.transition.faintMs : 0,
);
