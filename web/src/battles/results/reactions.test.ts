import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { makeBattleStory } from '../dev/battleStories';
import { viewChanges, transitionDuration } from './transitions';
import { resultAnimationConfig as config } from './config';
import { effectDirection } from './effectDirection';

describe('status and effect reactions', () => {
  it('keeps status identity and effect additions/removals for canonical reconciliation', () => {
    const { battle } = makeBattleStory('ready'), before = battle.view, after = structuredClone(before);
    const id = 'Star Team-448';
    before.pokemon[id].status = { statusId: 'Burn', turns: 2 };
    after.pokemon[id].status = { statusId: 'Paralysis', turns: 3 };
    delete after.pokemon[id].effectIds.shield;
    after.pokemon[id].effectIds.weakness = { duration: 2 };
    const changes = viewChanges(before, after);
    assert.deepEqual(changes.statuses, [
      { pokemonId: id, statusId: 'Burn', removed: true },
      { pokemonId: id, statusId: 'Paralysis', removed: false },
    ]);
    assert.deepEqual(changes.effects, [
      { pokemonId: id, effectId: 'shield', removed: true },
      { pokemonId: id, effectId: 'weakness', removed: false },
    ]);
    assert.equal(transitionDuration(changes), config.reactions.status.durationMs);
    assert.equal(before.pokemon[id].effectIds.weakness, undefined);
  });
  it('does not replay reactions for duration ticks or refreshes with the same identity', () => {
    const { battle } = makeBattleStory('ready'), after = structuredClone(battle.view);
    after.pokemon['Star Team-448'].effectIds.shield.duration = 1;
    after.pokemon['Star Team-131'].status.turns = 1;
    const changes = viewChanges(battle.view, after);
    assert.deepEqual(changes.statuses, []); assert.deepEqual(changes.effects, []);
    assert.equal(changes.cues.length, 2);
    assert.equal(transitionDuration(changes), config.transition.cueMs);
  });
  it('reverses the consequence for removals and handles uncategorized effects neutrally', () => {
    const { catalog } = makeBattleStory('ready');
    assert.equal(effectDirection('focus', false, catalog), 'buff');
    assert.equal(effectDirection('focus', true, catalog), 'debuff');
    assert.equal(effectDirection('weakness', false, catalog), 'debuff');
    assert.equal(effectDirection('weakness', true, catalog), 'buff');
    assert.equal(effectDirection('unknown', false, catalog), 'neutral');
    assert.equal(effectDirection('unknown', true, catalog), 'neutral');
  });
  it('maps every engine status to a reusable Status recipe', () => {
    assert.deepEqual(['Burn', 'Freeze', 'Paralysis', 'Poison', 'Sleep', 'Badly Poison']
      .map(id => config.reactions.status.types[id]), ['fire', 'ice', 'electric', 'poison', 'psychic', 'poison']);
    assert.equal(config.reactions.status.fallbackType, 'normal');
  });
});
