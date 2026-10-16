import type { BattleStory } from './battleStories';
import type { BattleEvent } from '../types';
import { own, rival } from './baseBattleFixture';

export const makeResultStory = (story: BattleStory): BattleStory => {
  const initial = story.battle.view;
  const target = `${rival}-94`, ally = `${own}-448`, actor = `${own}-157`;
  let finalView = structuredClone(initial);
  const events: Omit<BattleEvent, 'sequence'>[] = [];
  switch (story.id) {
    case 'result-damage':
      events.push({ type: 'hpChanged', pokemonId: target, sourcePokemonId: actor, previousHp: 115, hp: 73, amount: -42 });
      finalView.pokemon[target].hp = 73; break;
    case 'result-heal':
      events.push({ type: 'hpChanged', pokemonId: ally, previousHp: 126, hp: 162, amount: 36 });
      finalView.pokemon[ally].hp = 162; break;
    case 'result-shield':
      events.push({ type: 'shieldChanged', pokemonId: ally, amount: -40, shield: 0 },
        { type: 'effectRemoved', pokemonId: ally, effectId: 'shield' });
      initial.pokemon[ally].effectIds.shield = { duration: 2 };
      delete finalView.pokemon[ally].effectIds.shield; break;
    case 'result-status':
      events.push({ type: 'statusApplied', pokemonId: target, statusId: 'Burn' },
        { type: 'effectApplied', pokemonId: ally, effectId: 'focus', duration: 3 },
        { type: 'statusRemoved', pokemonId: target, statusId: 'Burn' });
      finalView.pokemon[target].status = { statusId: null, turns: 0 };
      finalView.pokemon[ally].effectIds.focus = { duration: 3 }; break;
    case 'result-revive':
      initial.pokemon[ally].hp = 0; initial.pokemon[ally].isFainted = true;
      events.push({ type: 'pokemonRevived', pokemonId: ally, sourcePokemonId: actor, hp: 100 });
      finalView.pokemon[ally].hp = 100; finalView.pokemon[ally].isFainted = false; break;
    case 'result-announcement':
      events.push({ type: 'phaseStarted' }); break;
    case 'result-missing-target':
      events.push({ type: 'hpChanged', pokemonId: 'departed-pokemon', hp: 0, amount: -20 }); break;
    case 'result-weather':
      events.push({ type: 'weatherChanged', previousWeatherId: 'Sun', weatherId: 'Rain', duration: 12 });
      finalView.weather = { weatherId: 'Rain', duration: 12 }; break;
    case 'result-readiness':
      events.push({ type: 'combatReadinessChanged', pokemonId: ally, amount: 20, previousCombatReadiness: 72, combatReadiness: 92 });
      finalView.pokemon[ally].combatReadiness = 92; break;
    case 'result-reconcile':
      // No observations: all supported differences animate at the canonical action boundary.
      finalView.pokemon[target].hp = 70; finalView.pokemon[ally].combatReadiness = 95;
      finalView.pokemon[ally].effectIds.shield = { duration: 1 };
      finalView.weather.duration = 2; break;
    case 'result-sequence':
      events.push({ type: 'actionStarted', pokemonId: actor, action: 'useMove' },
        { type: 'moveStarted', pokemonId: actor, moveId: 'm33', moveType: 'normal', damageType: 'Physical',
          primaryTargetId: target, targetIds: [target], patternTiles: [{ teamName: rival, position: 1 }] },
        { type: 'hpChanged', pokemonId: target, sourcePokemonId: actor, previousHp: 115, hp: 0, amount: -115 },
        { type: 'pokemonFainted', pokemonId: target, sourcePokemonId: actor },
        { type: 'moveCompleted', pokemonId: actor, moveId: 'm33' },
        { type: 'turnStarted', pokemonId: `${rival}-59`, turn: initial.turn + 1 });
      finalView.pokemon[target].hp = 0; finalView.pokemon[target].isFainted = true;
      finalView.turn += 1; finalView.activePokemonId = `${rival}-59`;
      finalView.pokemon[actor].combatReadiness = 30; finalView.pokemon[`${rival}-59`].combatReadiness = 100;
      break;
    default: return story;
  }
  story.sequence = { events: events.map((event, sequence) => ({ ...event, sequence })), finalView };
  return story;
};
