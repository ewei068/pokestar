import type { BattleView } from '../types';
import { resultAnimationConfig as config } from './config';

export type ViewChanges = { meters: string[]; damaged: string[]; healed: string[]; cues: string[]; fainted: string[]; revived: string[]; weather: boolean };
export const viewChanges = (before: BattleView, after: BattleView): ViewChanges => {
  const changes: ViewChanges = { meters: [], damaged: [], healed: [], cues: [], fainted: [], revived: [], weather: JSON.stringify(before.weather) !== JSON.stringify(after.weather) };
  for (const [id, next] of Object.entries(after.pokemon)) {
    const previous = before.pokemon[id]; if (!previous) continue;
    if (next.hp < previous.hp) changes.damaged.push(id);
    if (next.hp > previous.hp) changes.healed.push(id);
    if (previous.hp !== next.hp || previous.maxHp !== next.maxHp || previous.combatReadiness !== next.combatReadiness) changes.meters.push(id);
    if (JSON.stringify(previous.status) !== JSON.stringify(next.status) || JSON.stringify(previous.effectIds) !== JSON.stringify(next.effectIds)) changes.cues.push(id);
    if (!previous.isFainted && next.isFainted) changes.fainted.push(id);
    if (previous.isFainted && !next.isFainted) changes.revived.push(id);
  }
  return changes;
};
export const transitionDuration = (changes: ViewChanges) => Math.max(
  changes.damaged.length ? config.reactions.damage.durationMs : 0,
  changes.healed.length ? config.reactions.heal.durationMs : 0,
  changes.fainted.length ? config.reactions.faint.durationMs : 0,
  changes.meters.length ? config.transition.meterMs : 0,
  changes.cues.length || changes.weather ? config.transition.cueMs : 0,
  changes.fainted.length || changes.revived.length ? config.transition.faintMs : 0,
);
