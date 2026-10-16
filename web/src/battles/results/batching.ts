import { eventBatchKey, highlightedPokemonId } from '../eventPresentation';
import type { BattleEvent, BattleView } from '../types';

/** Only consecutive compatible observations on distinct, present subjects may share a stage. */
export const batchEvents = (events: BattleEvent[], view: BattleView): BattleEvent[][] => {
  const batches: BattleEvent[][] = [];
  let key: string | null = null;
  let subjects = new Set<string>();
  for (const event of events) {
    const subject = highlightedPokemonId(event);
    const pokemon = subject ? view.pokemon[subject] : undefined;
    const party = pokemon ? view.teams[pokemon.teamName] : undefined;
    const onField = pokemon && party && pokemon.position >= 1 && pokemon.position <= party.rows * party.cols;
    const nextKey = onField ? eventBatchKey(event) : null;
    if (nextKey && nextKey === key && subject && !subjects.has(subject)) {
      batches[batches.length - 1].push(event); subjects.add(subject);
    } else {
      batches.push([event]); key = nextKey; subjects = new Set(subject ? [subject] : []);
    }
  }
  return batches;
};
