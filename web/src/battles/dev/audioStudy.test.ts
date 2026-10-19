import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyPlayback, reducePlayback } from "../playback";
import type { BattleResponse } from "../types";
import { makeBattleStory } from "./battleStories";
import { cueForFrame, cuesForStory, defaultExcerptStart, timingForFrame } from "./audioStudy";
import type { StudyGeneration } from "./audioStudy";
import { MOVE_APPROACH_MS, MOVE_TOTAL_MS } from "../vfx/timing";

const reachedFrames = (id: string) => {
  const story = makeBattleStory(id);
  const initial: BattleResponse = { ...story.battle, found: true,
    stateId: "story:initial", updates: [] };
  const start = reducePlayback(emptyPlayback(), { type: "receive", response: initial, catalog: story.catalog });
  const revision = story.battle.revision + 1;
  const next: BattleResponse = { ...initial, revision, stateId: `story:${revision}`,
    view: story.sequence!.finalView,
    updates: [{ revision, action: { action: "skipTurn" }, events: story.sequence!.events, log: [] }] };
  const playing = reducePlayback(start, { type: "receive", response: next, catalog: story.catalog });
  return playing.queue;
};
const reachedCues = (id: string, generation: StudyGeneration) => {
  const catalog = makeBattleStory(id).catalog;
  return reachedFrames(id).map((frame) => cueForFrame(frame, generation, catalog)).filter(Boolean);
};

describe("local audio story timing", () => {
  it("assigns one move cue to an area action and one hit cue to its batched damage", () => {
    assert.deepEqual(reachedCues("audio-rock-slide", 4), ["4-rock-slide", "hit"]);
  });

  it("keeps damage, faint, and healing cues on their reached result frames", () => {
    assert.deepEqual(reachedCues("audio-hyper-beam", 5), ["5-hyper-beam", "hit"]);
    assert.deepEqual(reachedCues("audio-tackle", 5), ["5-tackle", "hit", "faint"]);
    assert.deepEqual(reachedCues("audio-recover", 4), ["4-recover", "restore"]);
    assert.deepEqual(cuesForStory("audio-tackle", 5), ["5-tackle", "select", "hit", "faint"]);
  });

  it("holds all Gen 5 moves until approach ends and leaves result cues on their own frames", () => {
    for (const id of ["audio-rock-slide", "audio-hyper-beam", "audio-tackle", "audio-recover"]) {
      const frames = reachedFrames(id);
      const move = timingForFrame(frames[0], 5, false)!;
      assert.ok(move.delayMs >= MOVE_APPROACH_MS, id);
      assert.ok(move.delayMs < MOVE_TOTAL_MS, id);
      assert.equal(move.maxSeconds, (MOVE_TOTAL_MS - move.delayMs) / 1000);
      const result = frames.find((frame) => frame.event.type === "hpChanged")!;
      assert.equal(timingForFrame(result, 5, false)?.delayMs, 0);
      assert.equal(timingForFrame(frames[0], 5, true)?.delayMs, 0);
    }
  });

  it("sets excerpt candidates around the Gen 5 VFX contact beats", () => {
    assert.equal(defaultExcerptStart("audio-rock-slide", 5), 0.55);
    assert.equal(defaultExcerptStart("audio-hyper-beam", 5), 0.65);
    assert.equal(defaultExcerptStart("audio-tackle", 5), 0.25);
    assert.equal(defaultExcerptStart("audio-recover", 5), 0.7);
    assert.equal(defaultExcerptStart("audio-tackle", 4), 0);
  });

  it("plays one application cue for every status, then keeps cures quiet", () => {
    const cases = {
      "audio-status-burn": "status-burn", "audio-status-freeze": "status-freeze",
      "audio-status-paralysis": "status-paralysis", "audio-status-poison": "status-poison",
      "audio-status-toxic": "status-badly-poison", "audio-status-sleep": "status-sleep",
    } as const;
    for (const [story, cue] of Object.entries(cases)) {
      assert.deepEqual(reachedCues(story, 5), [cue], story);
      const frame = reachedFrames(story)[0];
      assert.equal(timingForFrame(frame, 5, false)?.maxSeconds, frame.durationMs / 1000);
    }
  });

  it("shares the raised-stat cue for buff and neutral gains and uses lowered-stat audio for debuffs", () => {
    assert.deepEqual(reachedCues("audio-effect-buff", 5), ["stat-up"]);
    assert.deepEqual(reachedCues("audio-effect-neutral", 5), ["stat-up"]);
    assert.deepEqual(reachedCues("audio-effect-debuff", 5), ["stat-down"]);
  });
});
