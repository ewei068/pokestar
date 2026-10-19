import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyPlayback, reducePlayback } from "../playback";
import type { BattleResponse } from "../types";
import { makeBattleStory } from "../dev/battleStories";
import { soundsForFrame } from "./soundCues";

const framesFor = (id: string) => {
  const story = makeBattleStory(id);
  const initial: BattleResponse = { ...story.battle, found: true, stateId: "start", updates: [] };
  const start = reducePlayback(emptyPlayback(), { type: "receive", response: initial, catalog: story.catalog });
  const revision = story.battle.revision + 1;
  const response: BattleResponse = { ...initial, revision, stateId: "next",
    view: story.sequence!.finalView,
    updates: [{ revision, action: { action: "skipTurn" }, events: story.sequence!.events, log: [] }] };
  return { frames: reducePlayback(start, { type: "receive", response, catalog: story.catalog }).queue,
    catalog: story.catalog };
};

describe("real battle sound mapping", () => {
  it("plays one move cue for an area action and one hit for its batched damage", () => {
    const { frames, catalog } = framesFor("audio-rock-slide");
    assert.deepEqual(frames.flatMap(frame => soundsForFrame(frame, catalog).map(cue => cue.key)),
      ["move:rock:physical", "hit"]);
    assert.equal(soundsForFrame(frames[0], catalog)[0].delayMs, 550);
    assert.equal(soundsForFrame(frames[0], catalog, true)[0].delayMs, 0);
    const damage = frames[1];
    const simultaneous = { ...damage, announcements: [...damage.announcements,
      { ...damage.announcements[0], event: { ...damage.announcements[0].event, amount: 5 } }] };
    assert.deepEqual(soundsForFrame(simultaneous, catalog).map(cue => cue.key), ["hit", "restore"]);
  });

  it("keeps hit, faint, healing, statuses, and stat changes on their reached result frames", () => {
    const cases = {
      "audio-tackle": ["move:normal:physical", "hit", "faint"],
      "audio-recover": ["move:normal:status", "restore"],
      "audio-status-burn": ["status-burn"],
      "audio-status-freeze": ["status-freeze"],
      "audio-status-paralysis": ["status-paralysis"],
      "audio-status-poison": ["status-poison"],
      "audio-status-toxic": ["status-badly-poison"],
      "audio-status-sleep": ["status-sleep"],
      "audio-effect-buff": ["stat-up"],
      "audio-effect-neutral": ["stat-up"],
      "audio-effect-debuff": ["stat-down"],
    } as const;
    for (const [storyId, expected] of Object.entries(cases)) {
      const { frames, catalog } = framesFor(storyId);
      assert.deepEqual(frames.flatMap(frame => soundsForFrame(frame, catalog).map(cue => cue.key)), expected, storyId);
    }
  });
});
