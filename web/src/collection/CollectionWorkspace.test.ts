import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { createElement } from "react";
import { JSDOM } from "jsdom";
import { CollectionWorkspace, type CollectionWorkspaceProps } from "./CollectionWorkspace";
import type { PokemonDetail, Party, PlayerOperation } from "../player/types";
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/" });
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement })) Object.defineProperty(globalThis, key, { configurable: true, value });
const { render, cleanup, fireEvent } = await import("@testing-library/react");
afterEach(cleanup);
const pokemon: PokemonDetail = { id: "new-pokemon", speciesId: "25", speciesName: "Pikachu", name: "Pikachu", level: 25, shiny: false, rarity: "Rare", types: ["Electric"], combatPower: 1234, ivPercent: 90, inParty: false, spriteUrl: null, battleEligible: true, stats: [50,60,40,55,45,80], ivs: [31,31,31,31,31,31], evs: [0,0,0,0,0,0], nature: { name: "Adamant", raisedStat: 1, loweredStat: 3 }, ability: null, heldItem: null, exp: null, moves: [{ id: "tackle", name: "Tackle", type: "Normal", damageType: "Physical", power: 40, accuracy: 100, cooldown: 0, description: "A tackle." }] };
const member = { ...pokemon, id: "member", name: "Eevee", inParty: true };
const party: Party = { rows: 2, cols: 2, capacity: 1, slots: [member,null,null,null], targets: { new: [{ kind: "replace" }, { kind: "disabled", reason: "Party full" }, { kind: "disabled", reason: "Party full" }, { kind: "disabled", reason: "Party full" }], member: [{ kind: "disabled" }, { kind: "move" }, { kind: "move" }, { kind: "move" }] } };
function page(overrides: Partial<CollectionWorkspaceProps> = {}) {
  const operations: PlayerOperation[] = [], inspections: string[] = [];
  const props: CollectionWorkspaceProps = { collection: { items: [pokemon], page: 1, pageSize: 20, total: 1, totalPages: 1 }, party, pokemon, selectedId: pokemon.id, query: { page: 1, pageSize: 20, search: "", sort: "name", order: "asc" }, onQueryChange() {}, onInspect: id => inspections.push(id), onOperation: op => operations.push(op), pending: false, loading: false, error: null, onRefresh() {}, ...overrides };
  return { ...render(createElement(CollectionWorkspace, props)), operations, inspections, props };
}
describe("collection workspace", () => {
  it("opens inspection on taps and party on Add, and obeys new-candidate targets", () => {
    const view = page();
    fireEvent.click(view.getByRole("button", { name: /^Inspect Pikachu/ }));
    assert.deepEqual(view.inspections, [pokemon.id]);
    assert.ok(view.container.querySelector(".collection-inspect-panel.is-open"));
    fireEvent.click(view.getByRole("button", { name: "Add to party" }));
    assert.equal(view.container.querySelector(".collection-inspect-panel.is-open"), null);
    assert.ok(view.container.querySelector(".collection-party-panel.is-open"));
    const empty = view.getByRole("button", { name: /Position 2/ });
    assert.equal(empty.getAttribute("aria-disabled"), "true");
    fireEvent.click(empty); assert.equal(view.operations.length, 0);
    fireEvent.click(view.getByRole("button", { name: /Position 1/ }));
    assert.deepEqual(view.operations, [{ kind: "party.place", pokemonId: pokemon.id, index: 0, expectedOccupant: member.id }]);
  });
  it("supports variable geometry and manage move/remove tap alternatives", () => {
    const view = page();
    assert.equal(view.container.querySelectorAll("[data-slot]").length, 4);
    assert.equal((view.container.querySelector(".collection-formation") as HTMLElement).style.getPropertyValue("--rows"), "2");
    fireEvent.click(view.getByRole("button", { name: "Manage" }));
    fireEvent.click(view.getByRole("button", { name: "Move / Swap" }));
    fireEvent.click(view.getByRole("button", { name: /Position 1/ }));
    fireEvent.click(view.getByRole("button", { name: /Position 2/ }));
    assert.deepEqual(view.operations[0], { kind: "party.place", pokemonId: member.id, index: 1, expectedOccupant: null });
    fireEvent.click(view.getByRole("button", { name: "Manage" }));
    fireEvent.click(view.getByRole("button", { name: "Remove from party" }));
    fireEvent.click(view.getByRole("button", { name: /Position 1/ }));
    assert.deepEqual(view.operations[1], { kind: "party.remove", index: 0, expectedOccupant: member.id });
  });
  it("keeps party edits out of member inspection and renders nature signs/shared moves", () => {
    const view = page({ pokemon: member, selectedId: member.id });
    assert.equal(view.queryByRole("button", { name: "Add to party" }), null);
    assert.equal(view.queryByRole("button", { name: "Remove from party" }), null);
    assert.ok(view.getByText("Attack +")); assert.ok(view.getByText("Sp. Atk −"));
    assert.equal((view.getByRole("button", { name: "Train · Later" }) as HTMLButtonElement).disabled, true);
    fireEvent.click(view.getByRole("button", { name: "Moves" }));
    assert.ok(view.getByRole("heading", { name: "Tackle" })); assert.ok(view.getByText("0 turns"));
  });
  it("changes labels locally and filters/page through explicit queries", () => {
    const queries: unknown[] = [];
    const view = page({ collection: { items: [pokemon], page: 1, pageSize: 20, total: 25, totalPages: 2 }, onQueryChange: (query, explicit) => queries.push({ query, explicit }) });
    fireEvent.change(view.getByLabelText("Tile labels"), { target: { value: "iv" } });
    assert.equal(view.container.querySelector(".collection-tile-label")?.textContent, "90%"); assert.equal(queries.length, 0);
    fireEvent.click(view.getByRole("button", { name: "Filter" }));
    fireEvent.change(view.getByLabelText("Rarity"), { target: { value: "Epic" } });
    assert.deepEqual(queries[0], { query: { ...view.props.query, rarity: "Epic" }, explicit: true });
    fireEvent.click(view.getByRole("button", { name: "Next page" }));
    assert.deepEqual(queries[1], { query: { ...view.props.query, page: 2 }, explicit: true });
  });
  it("blocks duplicate actions during pending and preserves uncertain error wording", () => {
    const view = page({ pending: true, error: "The action may have completed. Refresh to check." });
    fireEvent.click(view.getByRole("button", { name: /^Inspect Pikachu/ })); fireEvent.click(view.getByRole("button", { name: /Position 1/ }));
    assert.equal(view.inspections.length, 0); assert.equal(view.operations.length, 0);
    assert.match(view.getByRole("alert").textContent || "", /may have completed/);
  });
  it("places with pointer drag and removes by dropping a member onto collection", () => {
    const view = page();
    const pointer = (target: Element, kind: string, x: number, y: number) => {
      const event = new dom.window.MouseEvent(kind, { bubbles: true, button: 0, clientX: x, clientY: y });
      Object.defineProperty(event, "pointerType", { value: "mouse" });
      fireEvent(target, event);
    };
    const tile = view.getByRole("button", { name: /^Inspect Pikachu/ });
    const occupied = view.getByRole("button", { name: /Position 1/ });
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: () => occupied });
    pointer(tile, "pointerdown", 10, 10); pointer(tile, "pointermove", 80, 80); pointer(tile, "pointerup", 80, 80);
    assert.deepEqual(view.operations[0], { kind: "party.place", pokemonId: pokemon.id, index: 0, expectedOccupant: member.id });
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: () => view.container.querySelector(".collection-list-panel") });
    pointer(occupied, "pointerdown", 10, 10); pointer(occupied, "pointermove", 80, 80); pointer(occupied, "pointerup", 80, 80);
    assert.deepEqual(view.operations[1], { kind: "party.remove", index: 0, expectedOccupant: member.id });
  });
  it("sizes complete rows to the viewport without an explicit rewarded query", () => {
    const original = dom.window.HTMLElement.prototype.getBoundingClientRect;
    dom.window.HTMLElement.prototype.getBoundingClientRect = function () {
      return this.classList.contains("collection-grid-scroll") ? { width: 336, height: 353 } as DOMRect : original.call(this);
    };
    class Observer { observe() {} disconnect() {} }
    Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, value: Observer });
    try {
      const queries: unknown[] = [];
      const view = page({ onQueryChange: (query, explicit) => queries.push({ query, explicit }) });
      assert.equal(queries.length, 0); // 5 columns × 4 rows already matches pageSize 20.
      fireEvent.change(view.getByLabelText("Tile labels"), { target: { value: "none" } });
      assert.deepEqual(queries[0], { query: { ...view.props.query, page: 1, pageSize: 25 }, explicit: false });
    } finally {
      dom.window.HTMLElement.prototype.getBoundingClientRect = original;
      Reflect.deleteProperty(globalThis, "ResizeObserver");
    }
  });
  it("keeps a newly selected detail in loading state instead of claiming it disappeared", () => {
    const view = page({ pokemon: undefined, detailLoading: true });
    assert.ok(view.getByText("Loading Pokémon…"));
    assert.equal(view.queryByText(/may no longer/), null);
  });

});
