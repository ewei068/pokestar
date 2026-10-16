import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { batchEvents } from './batching';
import { makeBattleStory } from '../dev/battleStories';
import type { BattleEvent } from '../types';
import { emptyPlayback, reducePlayback } from '../playback';

const { battle, catalog } = makeBattleStory('ready');
const a = 'Star Team-448', b = 'Star Team-149';
const event = (type: string, pokemonId: string, extra: Partial<BattleEvent> = {}): BattleEvent => ({ type, pokemonId, sequence: 0, ...extra });

describe('result batches', () => {
  it('batches distinct targets for matching HP/readiness direction and effect/status identity', () => {
    for (const [type, fields] of [
      ['hpChanged', { amount: -10 }], ['hpChanged', { amount: 10 }],
      ['combatReadinessChanged', { amount: -10 }], ['combatReadinessChanged', { amount: 10 }],
      ['effectApplied', { effectId: 'focus' }], ['effectRemoved', { effectId: 'focus' }],
      ['statusApplied', { statusId: 'Sleep' }], ['statusRemoved', { statusId: 'Sleep' }],
      ['shieldChanged', { amount: -10 }],
    ] as const) {
      assert.equal(batchEvents([event(type, a, fields), event(type, b, fields)], battle.view).length, 1);
    }
    assert.equal(batchEvents([
      event('targetMissed', a, { targetPokemonId: a, moveId: 'm47' }),
      event('targetMissed', a, { targetPokemonId: b, moveId: 'm47' }),
    ], battle.view).length, 1);
  });
  it('keeps directions, identities, repeated hits, missing targets and structural barriers separate', () => {
    for (const pair of [
      [event('hpChanged', a, { amount: -10 }), event('hpChanged', b, { amount: 10 })],
      [event('combatReadinessChanged', a, { amount: -10 }), event('combatReadinessChanged', b, { amount: 10 })],
      [event('effectApplied', a, { effectId: 'focus' }), event('effectApplied', b, { effectId: 'shield' })],
      [event('statusApplied', a, { statusId: 'Sleep' }), event('statusApplied', b, { statusId: 'Burn' })],
      [event('hpChanged', a, { amount: -10 }), event('hpChanged', a, { amount: -10 })],
      [event('hpChanged', a, { amount: -10 }), event('hpChanged', 'missing', { amount: -10 })],
    ]) assert.equal(batchEvents(pair, battle.view).length, 2);
    for (const barrier of ['pokemonFainted', 'pokemonRevived', 'moveCompleted', 'phaseStarted', 'turnStarted']) {
      const events = [event('hpChanged', a, { amount: -10 }), event(barrier, a), event('hpChanged', b, { amount: -10 })];
      const batches = batchEvents(events, battle.view);
      assert.equal(batches.length, 3);
      assert.deepEqual(batches.flat(), events);
    }
  });
  it('starts all labels and state changes together, and logs each occurrence once in server order', () => {
    const story = makeBattleStory('result-batch-damage');
    const initial = { ...story.battle, found: true as const, stateId: 's17', updates: [] };
    let state = reducePlayback(emptyPlayback(), { type: 'receive', response: initial, catalog });
    state = reducePlayback(state, { type: 'receive', catalog, response: { ...initial, revision: 18,
      view: story.sequence!.finalView, updates: [{ revision: 18, action: { action: 'skipTurn' }, events: story.sequence!.events, log: [] }] } });
    const frame = state.queue[0];
    assert.equal(frame.announcements.length, 3);
    assert.equal(frame.view.pokemon['Rival Team-94'].hp, 85);
    assert.equal(frame.changes.damaged.length, 3);
    state = reducePlayback(state, { type: 'begin', id: frame.id });
    state = reducePlayback(state, { type: 'begin', id: frame.id });
    assert.deepEqual(state.history.map(item => item.text), [
      'Gengar lost 30 HP.', 'Arcanine lost 30 HP.', 'Milotic lost 30 HP.',
    ]);
    assert.equal(frame.stage, 'event');
    assert.ok(frame.durationMs >= 820);
  });
  it('retains all reached entries beyond the previous cap and does not rescan history for deduplication', () => {
    const story = makeBattleStory('result-damage');
    const initial = { ...story.battle, found: true as const, stateId: 's17', updates: [] };
    let state = reducePlayback(emptyPlayback(), { type: 'receive', response: initial, catalog });
    for (let revision = 18; revision < 218; revision++) {
      state = reducePlayback(state, { type: 'receive', catalog, response: { ...initial, revision, updates: [
        { revision, action: { action: 'skipTurn' }, events: [{ type: 'actionStarted', sequence: 0, action: 'skipTurn', pokemonId: a }], log: [] },
      ] } });
      const id = state.queue[0].id;
      state = reducePlayback(state, { type: 'begin', id });
      state = reducePlayback(state, { type: 'begin', id });
      state = reducePlayback(state, { type: 'advance', id });
    }
    assert.equal(state.history.length, 200);
    assert.equal(state.history[0].revision, 18);
    assert.equal(state.history[199].revision, 217);
  });
});
