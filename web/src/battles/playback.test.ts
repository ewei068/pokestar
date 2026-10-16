import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { emptyPlayback, frameDuration, reducePlayback } from './playback';
import type { PlaybackState } from './playback';
import { resultAnimationConfig as config } from './results/config';
import { makeBattleStory } from './dev/battleStories';
import type { BattleResponse } from './types';

const story = makeBattleStory('result-sequence'), catalog = story.catalog;
const initial: BattleResponse = { ...story.battle, found: true, stateId: 's17', updates: [] };
const next: BattleResponse = { ...initial, revision: 18, stateId: 's18', view: story.sequence!.finalView,
  updates: [{ revision: 18, action: { action: 'useMove', moveId: 'm33', targetPokemonId: 'Rival Team-94' },
    events: story.sequence!.events, log: [] }] };
const receive = (state: PlaybackState, response: BattleResponse) => reducePlayback(state, { type: 'receive', response, catalog });
const advance = (state: PlaybackState) => reducePlayback(state, { type: 'advance', id: state.queue[0].id });
const subject = 'Rival Team-94';

describe('battle playback', () => {
  it('opens or reconnects at canonical state without historical playback', () => {
    const state = receive(emptyPlayback(), next);
    assert.equal(state.battle?.view.pokemon[subject].hp, 0);
    assert.equal(state.queue.length, 0);
    assert.equal(state.history.length, 0);
  });

  it('holds prior HP through the move, then starts damage text and HP together before fainting', () => {
    let state = receive(receive(emptyPlayback(), initial), next);
    assert.equal(state.battle?.view.pokemon[subject].isFainted, true); // Latest state is already received.
    assert.equal(state.queue[0].event.type, 'moveStarted'); // Silent action marker adds no delay.
    assert.equal(state.queue[0].view.pokemon[subject].hp, 115);
    assert.equal(state.history.length, 0);
    state = reducePlayback(state, { type: 'begin', id: state.queue[0].id });
    assert.deepEqual(state.history.map(entry => entry.text), ['Typhlosion used Tackle.']);
    state = advance(state);
    assert.equal(state.queue[0].event.type, 'hpChanged');
    assert.equal(state.queue[0].stage, 'event');
    assert.equal(state.queue[0].announcements.length, 1);
    assert.equal(state.queue[0].view.pokemon[subject].hp, 0);
    assert.deepEqual(state.queue[0].changes.damaged, [subject]);
    assert.equal(state.queue[0].durationMs, Math.max(config.text.durationMs, config.transition.meterMs, config.reactions.damage.durationMs));
    assert.equal(state.queue[0].view.pokemon[subject].isFainted, false);
    state = advance(state);
    assert.equal(state.queue[0].event.type, 'pokemonFainted');
    assert.equal(state.queue[0].view.pokemon[subject].isFainted, true);
    assert.deepEqual(state.queue[0].changes.fainted, [subject]);
    // The latest view and original fixture remain immutable.
    assert.equal(initial.view.pokemon[subject].hp, 115);
  });

  it('reconciles unobserved changes before announcing the next turn', () => {
    let state = receive(receive(emptyPlayback(), initial), next);
    while (state.queue[0].event.type !== 'turnStarted') state = advance(state);
    assert.deepEqual(state.queue[0].view, next.view);
    assert.equal(state.queue[0].view.activePokemonId, 'Rival Team-59');
    while (state.queue.length) state = advance(state);
    assert.deepEqual(state.battle?.view, next.view);
  });

  it('queues canonical differences even without events and settles without another turn', () => {
    const end = { ...next, view: { ...next.view, ended: true, winner: 'Star Team' },
      updates: [{ ...next.updates[0], events: [] }] };
    const state = receive(receive(emptyPlayback(), initial), end);
    assert.equal(state.queue.length, 1);
    assert.equal(state.queue[0].stage, 'transition');
    assert.ok(state.queue[0].durationMs > 0);
    assert.equal(state.queue[0].view.ended, true);
    assert.equal(advance(state).queue.length, 0);
  });

  it('appends new revisions during playback without replacing the active frame or leaking log text', () => {
    const pending = receive(receive(emptyPlayback(), initial), next), first = pending.queue[0];
    const later = { ...next, stateId: 's19', revision: 19,
      view: { ...next.view, turn: 14 }, updates: [{ revision: 19, action: { action: 'skipTurn' as const },
        events: [{ type: 'actionStarted', sequence: 0, pokemonId: 'Rival Team-59', action: 'skipTurn' }], log: [] }] };
    let state = receive(pending, later);
    assert.equal(state.queue[0], first);
    assert.equal(state.history.length, 0);
    assert.ok(state.queue.length > pending.queue.length);
    const count = state.queue.length;
    state = receive(state, later);
    assert.equal(state.queue.length, count);
    assert.equal(receive(state, initial), state); // Older response cannot rewind presentation.
    state = reducePlayback(state, { type: 'begin', id: first.id });
    state = reducePlayback(state, { type: 'begin', id: first.id });
    assert.equal(state.history.length, 1);
    state = reducePlayback(state, { type: 'skip' });
    assert.equal(state.queue.length, 0);
    assert.equal(state.battle?.revision, 19);
    assert.equal(reducePlayback(state, { type: 'advance', id: first.id }), state);
  });

  it('preserves individual canonical action views when player and NPC updates arrive together', () => {
    const actor = 'Star Team-157';
    const finalView = structuredClone(next.view);
    finalView.pokemon[actor].hp = 160;
    finalView.turn = 14;
    const batch: BattleResponse = { ...next, revision: 19, view: finalView, updates: [
      { ...next.updates[0], view: next.view },
      { revision: 19, action: { action: 'useMove', moveId: 'm33', targetPokemonId: actor }, log: [], events: [
        { type: 'hpChanged', sequence: 0, pokemonId: actor, hp: 160, amount: -8 },
      ] },
    ] };
    const state = receive(receive(emptyPlayback(), initial), batch);
    const npcDamage = state.queue.find(frame => frame.revision === 19 && frame.stage === 'event');
    assert.equal(npcDamage?.view.pokemon[actor].hp, 160);
    assert.equal(npcDamage?.view.pokemon[subject].isFainted, true);
    assert.equal(state.queue[0].view.pokemon[subject].hp, 115);
    assert.equal(state.queue[state.queue.length - 1].view.pokemon[actor].hp, 160);
  });

  it('resynchronizes on missing revisions and ignores obsolete animation completions', () => {
    const state = receive(receive(emptyPlayback(), initial), next);
    assert.equal(reducePlayback(state, { type: 'advance', id: 'obsolete' }), state);
    const gap = receive(state, { ...next, revision: 20, updates: [] });
    assert.equal(gap.queue.length, 0);
    assert.equal(gap.battle?.revision, 20);
    const frame = state.queue[0];
    assert.equal(frameDuration(frame, false), 1500);
    assert.ok(frameDuration(frame, true) < frameDuration(frame, false));
  });
});
