import type { BattleStory } from './battleStories';
import type { BattleEvent } from '../types';
import { own, rival } from './baseBattleFixture';

export const makeResultStory = (story: BattleStory): BattleStory => {
  const initial = story.battle.view;
  const target = `${rival}-94`, ally = `${own}-448`, actor = `${own}-157`;
  let finalView = structuredClone(initial);
  const events: Omit<BattleEvent, 'sequence'>[] = [];
  switch (story.id) {
    case 'result-miss':
      events.push({ type: 'targetMissed', pokemonId: actor, targetPokemonId: target, moveId: 'm33' }); break;
    case 'result-status-burn':
    case 'result-status-paralysis':
    case 'result-status-freeze':
    case 'result-status-poison':
    case 'result-status-toxic':
    case 'result-status-sleep': {
      const statusId = ({ burn: 'Burn', paralysis: 'Paralysis', freeze: 'Freeze', poison: 'Poison', toxic: 'Badly Poison', sleep: 'Sleep' })[story.id.split('-').pop()!]!;
      events.push({ type: 'statusApplied', pokemonId: target, statusId }, { type: 'statusRemoved', pokemonId: target, statusId });
      finalView.pokemon[target].status = { statusId: null, turns: 0 }; break;
    }
    case 'result-effect-buff':
    case 'result-effect-debuff':
    case 'result-effect-neutral': {
      const effectId = story.id === 'result-effect-buff' ? 'focus' : story.id === 'result-effect-debuff' ? 'weakness' : 'neutral-study';
      story.catalog.effects['neutral-study'] = { name: 'Marked', type: 'Other', description: 'A neutral battle marker.' };
      delete initial.pokemon[ally].effectIds[effectId]; delete finalView.pokemon[ally].effectIds[effectId];
      events.push({ type: 'effectApplied', pokemonId: ally, effectId, duration: 3 }, { type: 'effectRemoved', pokemonId: ally, effectId });
      story.inspectedPokemonId = ally; break;
    }
    case 'result-reaction-reconcile':
      finalView.pokemon[target].status = { statusId: 'Paralysis', turns: 2 };
      finalView.pokemon[ally].effectIds.focus = { duration: 3 };
      finalView.pokemon[`${own}-149`].effectIds.weakness = { duration: 2 }; break;
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
    case 'result-batch-damage':
    case 'result-batch-faint': {
      const targets = [target, `${rival}-59`, `${rival}-350`];
      for (const id of targets) {
        const hp = story.id === 'result-batch-faint' ? 0 : initial.pokemon[id].hp - 30;
        events.push({ type: 'hpChanged', pokemonId: id, sourcePokemonId: actor,
          previousHp: initial.pokemon[id].hp, hp, amount: hp - initial.pokemon[id].hp });
        finalView.pokemon[id].hp = hp;
        // A faint is an ordering barrier; later targets must wait for it.
        if (story.id === 'result-batch-faint') {
          events.push({ type: 'pokemonFainted', pokemonId: id, sourcePokemonId: actor });
          finalView.pokemon[id].isFainted = true;
        }
      }
      break;
    }
    case 'result-batch-heal':
    case 'result-batch-readiness':
    case 'result-batch-effects':
    case 'result-batch-misses': {
      const ids = [ally, `${own}-149`, `${own}-282`];
      for (const id of ids) {
        if (story.id === 'result-batch-heal') {
          const hp = Math.min(initial.pokemon[id].maxHp, initial.pokemon[id].hp + 20);
          events.push({ type: 'hpChanged', pokemonId: id, sourcePokemonId: actor, hp, amount: hp - initial.pokemon[id].hp });
          finalView.pokemon[id].hp = hp;
        } else if (story.id === 'result-batch-readiness') {
          const combatReadiness = initial.pokemon[id].combatReadiness + 20;
          events.push({ type: 'combatReadinessChanged', pokemonId: id, combatReadiness, amount: 20 });
          finalView.pokemon[id].combatReadiness = combatReadiness;
        } else if (story.id === 'result-batch-effects') {
          events.push({ type: 'effectApplied', pokemonId: id, effectId: 'focus', duration: 3 });
          finalView.pokemon[id].effectIds.focus = { duration: 3 };
        } else {
          events.push({ type: 'targetMissed', pokemonId: actor, targetPokemonId: id, moveId: 'm47' });
        }
      }
      if (story.id === 'result-batch-effects') {
        for (const id of ids) {
          events.push({ type: 'effectRemoved', pokemonId: id, effectId: 'focus' });
          delete finalView.pokemon[id].effectIds.focus;
        }
        for (const id of ids) events.push({ type: 'statusApplied', pokemonId: id, statusId: 'Sleep' });
        for (const id of ids) events.push({ type: 'statusRemoved', pokemonId: id, statusId: 'Sleep' });
        for (const id of ids) finalView.pokemon[id].status = { statusId: null, turns: 0 };
      }
      break;
    }
    case 'result-long-log': {
      story.battle.revision = 2500;
      story.history = Array.from({ length: 20000 }, (_, index) =>
        `Event ${index + 1}: ${index % 7 === 0 ? 'A long event describing several different Pokémon and their status effects, deliberately wrapping on narrow screens to exercise dynamic row measurement.' : 'Typhlosion used Tackle.'}`);
      events.push({ type: 'hpChanged', pokemonId: target, hp: 73, amount: -42 });
      finalView.pokemon[target].hp = 73;
      break;
    }
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
