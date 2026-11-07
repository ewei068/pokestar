import assert from "node:assert/strict";
import { it } from "node:test";
import { resolveItemUse } from "./itemUse";

const held = ["h134", "h135", "h187", "h193", "h197", "h200", "h207", "h208", "h211", "h230", "h242", "h247", "h248", "h249", "h250", "h252", "h264", "h274", "h581", "h583", "h590", "h1178"];

it("sends every ball to Catch, a Mint to nature, and held items to Equip", () => {
  for (const id of ["0", "1", "2", "3", "future-ball"]) assert.equal(resolveItemUse(id, "0")?.label, "Catch");
  assert.equal(resolveItemUse("7", "1")?.label, "Change nature");
  for (const id of [...held, "future-held"]) assert.equal(resolveItemUse(id, "3")?.label, "Equip");
  for (const id of ["4", "5", "6", "9"]) assert.equal(resolveItemUse(id, "1"), null);
  assert.equal(resolveItemUse("8", "2"), null);
});
