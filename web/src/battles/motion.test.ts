import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { motionDestination, moveMotion } from "./motion";
import type { BattleEvent } from "./types";
import { makeBattleStory } from "./dev/battleStories";

const catalog = makeBattleStory("ready").catalog;
const event = (moveId: string, primaryTargetId = "Rival Team-94"): BattleEvent => ({
  type: "moveStarted", sequence: 0, pokemonId: "Star Team-157", primaryTargetId, moveId,
});

describe("move motion", () => {
  it("chooses travel by damage category and Normal VFX by move type", () => {
    assert.deepEqual(moveMotion(event("m33"), catalog),
      { kind: "physical", vfxType: "normal", selfTarget: false });
    assert.deepEqual(moveMotion(event("m63"), catalog),
      { kind: "special", vfxType: "normal", selfTarget: false });
    assert.deepEqual(moveMotion(event("m47"), catalog),
      { kind: "status", vfxType: "normal", selfTarget: false });
    assert.deepEqual(moveMotion(event("m105", "Star Team-157"), catalog),
      { kind: "status", vfxType: "normal", selfTarget: true });
    assert.deepEqual(moveMotion(event("flamethrower"), catalog),
      { kind: "special", vfxType: "fire", selfTarget: false });
    assert.equal(moveMotion({ type: "moveStarted", sequence: 0, damageType: "Physical" }, catalog)?.vfxType,
      null);
  });

  it("uses the executed category and type when a move changes in battle", () => {
    assert.deepEqual(moveMotion({ ...event("flamethrower"), damageType: "Physical", moveType: "Normal" }, catalog),
      { kind: "physical", vfxType: "normal", selfTarget: false });
    assert.equal(moveMotion({ type: "hpChanged", sequence: 1 }, catalog), null);
  });

  it("stops a physical attacker short and aligns ranged attacks to the target lane", () => {
    const start = { x: 10, y: 20 };
    const target = { x: 110, y: 70 };
    const board = { x: 60, y: 45 };
    const size = { width: 40, height: 40 };
    const physical = motionDestination("physical", start, target, board, size, false);
    assert.ok(physical.x > start.x && physical.x < target.x);
    assert.ok(physical.y > start.y && physical.y < target.y);
    assert.deepEqual(motionDestination("special", start, target, board, size, false), { x: 60, y: 70 });
    assert.deepEqual(motionDestination("status", start, target, board, size, true), { x: 110, y: 45 });
  });

});
