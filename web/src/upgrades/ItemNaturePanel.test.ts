import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { createElement } from "react";
import { JSDOM } from "jsdom";
import { ItemNaturePanel, type ItemNaturePanelProps } from "./ItemNaturePanel";
import type { PokemonBuildContext } from "../player/types";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement })) {
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
const { render, cleanup, fireEvent } = await import("@testing-library/react");
afterEach(cleanup);
const context: PokemonBuildContext = {
  pokemon: { id: "one", speciesId: "25", speciesName: "Pikachu", name: "A very long Pokémon nickname for a small screen", level: 20,
    shiny: false, rarity: "Rare", types: ["Electric"], combatPower: 123, ivPercent: 90, inParty: true,
    spriteUrl: null, battleEligible: true, stats: [10,20,30,40,50,60], ivs: [], evs: [],
    nature: { id: "0", name: "Hardy", raisedStat: null, loweredStat: null }, moves: [], ability: null,
    heldItem: { name: "Leftovers", description: "Restores HP." }, heldItemId: "h1", exp: null },
  natures: [{ id: "0", name: "Hardy", raisedStat: null, loweredStat: null, stats: [10,20,30,40,50,60] },
    { id: "6", name: "Docile", raisedStat: null, loweredStat: null, stats: [10,20,30,40,50,60] }],
  heldItems: [{ id: "h1", name: "Leftovers", description: "Restores HP.", category: "held", categoryName: "Held Items", quantity: 1, icon: null }],
  mintQuantity: 1, mintCost: 1,
};
const props: ItemNaturePanelProps = { context, natureId: "0", onNatureChange() {}, onChangeNature() {}, onHeldItemChange() {},
  pending: false, loading: false, refreshing: false, error: null, onRefresh() {} };
it("allows a distinct neutral nature and direct removal but disables current choices", () => {
  const changes: (string | null)[] = [];
  const view = render(createElement(ItemNaturePanel, { ...props, onHeldItemChange: id => changes.push(id) }));
  assert.equal((view.getByRole("button", { name: "Change nature" }) as HTMLButtonElement).disabled, true);
  assert.equal((view.getByRole("option", { name: /Leftovers · Owned: 1 · Holding/ }) as HTMLOptionElement).disabled, true);
  fireEvent.click(view.getByRole("button", { name: "Remove" }));
  assert.deepEqual(changes, [null]);
  assert.equal(view.getAllByRole("row").length, 7);
  view.rerender(createElement(ItemNaturePanel, { ...props, natureId: "6" }));
  assert.equal((view.getByRole("button", { name: "Change nature" }) as HTMLButtonElement).disabled, false);
});
it("missing Mint and an empty held slot cannot submit; shows inline stock and recovery", () => {
  const view = render(createElement(ItemNaturePanel, { ...props, natureId: "6", context: { ...context,
    mintQuantity: 0, heldItems: [], pokemon: { ...context.pokemon, heldItemId: null, heldItem: null } } }));
  assert.equal((view.getByRole("button", { name: "Change nature" }) as HTMLButtonElement).disabled, true);
  assert.equal((view.getByRole("button", { name: "Remove" }) as HTMLButtonElement).disabled, true);
  assert.ok(view.getByText("Owned: 0"));
  assert.ok(view.getByText("No spare held items in your Bag."));
  view.rerender(createElement(ItemNaturePanel, { ...props, error: "Refresh before choosing again." }));
  assert.ok(view.getByRole("alert"));
  assert.ok(view.getByRole("button", { name: "Refresh Pokémon & Bag" }));
  assert.equal((view.getByRole("button", { name: "Remove" }) as HTMLButtonElement).disabled, true);
});
