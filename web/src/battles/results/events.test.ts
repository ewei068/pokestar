import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyEventView, eventCue } from './events';
import { viewChanges, transitionDuration } from './transitions';
import { makeBattleStory } from '../dev/battleStories';

describe('result observations', () => {
  it('uses supplied HP instead of re-running damage arithmetic and leaves fainting to its event', () => {
    const { battle } = makeBattleStory('ready'), view = battle.view;
    const next = applyEventView(view, { type: 'hpChanged', sequence: 0, pokemonId: 'Rival Team-94', amount: -99, hp: 80 });
    assert.equal(next.pokemon['Rival Team-94'].hp, 80);
    assert.equal(next.pokemon['Rival Team-94'].isFainted, false);
    assert.equal(view.pokemon['Rival Team-94'].hp, 115);
  });
  it('does not invent missing state, rule consequences, or departed Pokémon', () => {
    const { battle } = makeBattleStory('ready'), view = battle.view;
    assert.equal(applyEventView(view, { type: 'unknown', sequence: 0 }), view);
    assert.equal(applyEventView(view, { type: 'hpChanged', sequence: 0, pokemonId: 'missing', hp: 0 }), view);
    assert.equal(applyEventView(view, { type: 'hpChanged', sequence: 0, pokemonId: 'Rival Team-94', amount: -5 }), view);
  });
  it('places misses on the defender, uses central announcements for weather, and narrates missing subjects', () => {
    const { battle, catalog } = makeBattleStory('ready');
    assert.equal(eventCue({ type: 'targetMissed', sequence: 0, pokemonId: 'Star Team-157', targetPokemonId: 'Rival Team-94' }, battle.view, catalog)?.subjectId, 'Rival Team-94');
    assert.equal(eventCue({ type: 'weatherChanged', sequence: 0, weatherId: 'Rain' }, battle.view, catalog)?.subjectId, null);
    assert.match(eventCue({ type: 'hpChanged', sequence: 0, pokemonId: 'missing', amount: -5 }, battle.view, catalog)!.label, /A Pokémon lost 5 HP/);
    assert.equal(eventCue({ type: 'moveCompleted', sequence: 0 }, battle.view, catalog), null);
  });
  it('applies visible status, effect, movement and readiness observations without mutating input', () => {
    const { battle } = makeBattleStory('ready');
    let view = battle.view;
    const id = 'Star Team-448';
    for (const event of [
      { type: 'statusApplied', statusId: 'Burn' }, { type: 'effectApplied', effectId: 'focus', duration: 3 },
      { type: 'combatReadinessChanged', combatReadiness: 92 }, { type: 'pokemonMoved', teamName: 'Star Team', position: 7 },
    ]) view = applyEventView(view, { ...event, sequence: 0, pokemonId: id });
    assert.equal(view.pokemon[id].status.statusId, 'Burn');
    assert.equal(view.pokemon[id].effectIds.focus.duration, 3);
    assert.equal(view.pokemon[id].position, 7);
    assert.equal(view.pokemon[id].combatReadiness, 92);
    assert.equal(battle.view.pokemon[id].position, 2);
    view = applyEventView(view, { type: 'statusRemoved', sequence: 1, pokemonId: id });
    view = applyEventView(view, { type: 'effectRemoved', sequence: 2, pokemonId: id, effectId: 'focus' });
    assert.equal(view.pokemon[id].status.statusId, null);
    assert.equal(view.pokemon[id].effectIds.focus, undefined);
  });
  it('detects canonical HP/readiness/duration differences using the same transition path', () => {
    const { battle, sequence } = makeBattleStory('result-reconcile');
    const changes = viewChanges(battle.view, sequence!.finalView);
    assert.deepEqual(new Set(changes.meters), new Set(['Star Team-448', 'Rival Team-94']));
    assert.ok(changes.cues.includes('Star Team-448'));
    assert.ok(transitionDuration(changes) > 0);
    assert.equal(transitionDuration(viewChanges(battle.view, battle.view)), 0);
  });
});
