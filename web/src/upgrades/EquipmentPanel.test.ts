import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { createElement } from "react";
import { JSDOM } from "jsdom";
import type { PokemonEquipmentContext } from "../player/types";
import { EquipmentPanel } from "./EquipmentPanel";
const dom = new JSDOM("<!doctype html><html><body></body></html>");
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, navigator: dom.window.navigator,
  HTMLElement: dom.window.HTMLElement, Element: dom.window.Element })) Object.defineProperty(globalThis, key, { configurable: true, value });
const { render, cleanup, fireEvent } = await import("@testing-library/react");
afterEach(cleanup);
const context: PokemonEquipmentContext = {
  pokemon: { id: "one", name: "Pikachu", speciesId: "25", speciesName: "Pikachu", level: 20, shiny: false, rarity: "Rare", types: ["Electric"],
    combatPower: 1, ivPercent: 90, inParty: true, spriteUrl: null, battleEligible: true, stats: [], ivs: [], evs: [],
    nature: { id: "0", name: "Hardy", raisedStat: null, loweredStat: null }, moves: [], ability: null, heldItem: null, heldItemId: null, exp: null },
  money: 2000, trainer: { level: 1, money: 2000, displayName: "Trainer", avatarUrl: null, exp: null },
  materials: [{ id: "4", name: "Emotion Shard", quantity: 10, description: "", category: "material", categoryName: "Materials", icon: "emotion-shard.png" }],
  catalog: { maxLevel: 10, moneyPerShard: 200, rerollCost: { money: 1000, shards: 5 },
    types: [{ id: "weight", name: "Power Weight", icon: "power-weight.png", primaryStat: 0, materialId: "4", slots: { primary: ["base"], secondary: ["percent", "flat"] } }],
    slots: [{ id: "primary", name: "Primary", scalesWithLevel: true }, { id: "secondary", name: "Secondary", scalesWithLevel: true }],
    modifiers: [{ id: "base", name: "Base HP", description: "Base HP", type: "base", stat: 0, min: 1, max: 2.5 },
      { id: "percent", name: "% HP", description: "% HP", type: "percent", stat: 0, min: 2, max: 4 },
      { id: "flat", name: "Flat HP", description: "Flat HP", type: "flat", stat: 0, min: 5, max: 10 }] },
  pieces: [{ id: "weight", level: 1, expectedEquipment: { level: 1, slots: { primary: { modifier: "base", quality: 75 }, secondary: { modifier: "percent", quality: 65 } } },
    slots: [{ id: "primary", modifier: "base", quality: 75, value: 2, nextValue: 4 }, { id: "secondary", modifier: "percent", quality: 65, value: 3, nextValue: 7 }], upgradeCost: { money: 400, shards: 2 } }],
};
const props = { context, loading: false, pending: false, refreshing: false, error: null, onRefresh() {}, onUpgrade(_type: string) {}, onReroll(_type: string, _slot: string) {} };
it("shows unknown previews only for the selected reroll, preserving a fixed modifier; selections and cancel spend nothing", () => {
  let spends = 0;
  const view = render(createElement(EquipmentPanel, { ...props, onReroll() { spends++; } }));
  fireEvent.click(view.getByRole("button", { name: "Reroll" }));
  let row = view.getByRole("row", { name: /Primary/ });
  assert.match(row.textContent || "", /Base HP/);
  assert.equal(row.querySelectorAll(".equipment-next").length, 2);
  fireEvent.change(view.getByLabelText("Stat slot"), { target: { value: "secondary" } });
  row = view.getByRole("row", { name: /Secondary/ });
  assert.equal(row.querySelectorAll(".equipment-next").length, 3);
  assert.equal(view.queryByText(/result can be worse/), null);
  assert.equal(spends, 0);
  fireEvent.click(view.getByRole("button", { name: "Cancel" }));
  assert.equal(spends, 0);
  fireEvent.click(view.getByRole("button", { name: "Reroll" }));
  fireEvent.click(view.getByRole("button", { name: "Confirm reroll" }));
  assert.equal(spends, 1);
});
it("disables spending for shortage, pending and maximum upgrade, while allowing capped rerolls", () => {
  const view = render(createElement(EquipmentPanel, { ...props, context: { ...context, money: 0 } }));
  assert.equal((view.getByRole("button", { name: "Upgrade level" }) as HTMLButtonElement).disabled, true);
  view.rerender(createElement(EquipmentPanel, { ...props, pending: true }));
  assert.equal((view.getByRole("button", { name: "Upgrade level" }) as HTMLButtonElement).disabled, true);
  view.rerender(createElement(EquipmentPanel, { ...props, context: { ...context, pieces: [{ ...context.pieces[0], level: 10, upgradeCost: null }] } }));
  assert.ok(view.getByRole("button", { name: "Level 10 reached" }));
  fireEvent.click(view.getByRole("button", { name: "Reroll" }));
  assert.equal((view.getByRole("button", { name: "Confirm reroll" }) as HTMLButtonElement).disabled, false);
});
it("opens a transparent guide without spending and restores trigger focus when closed", () => {
  const view = render(createElement(EquipmentPanel, props));
  const trigger = view.getByRole("button", { name: "Equipment guide" });
  trigger.focus(); fireEvent.click(trigger);
  assert.ok(view.getByRole("dialog", { name: "Equipment guide" }));
  fireEvent.change(view.getByLabelText(/Quality/), { target: { value: "100" } });
  fireEvent.change(view.getByLabelText(/Equipment level/), { target: { value: "10" } });
  assert.match(view.getByRole("status").textContent || "", /25/);
  fireEvent.click(view.getByRole("button", { name: "Close guide" }));
  assert.equal(view.queryByRole("dialog"), null);
  assert.equal(document.activeElement, trigger);
});
