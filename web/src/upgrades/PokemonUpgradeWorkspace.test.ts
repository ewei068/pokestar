import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { createElement, useEffect } from "react";
import { JSDOM } from "jsdom";
import { PokemonUpgradeWorkspace } from "./PokemonUpgradeWorkspace";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement })) {
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
const { render, cleanup, fireEvent } = await import("@testing-library/react");
afterEach(cleanup);

it("keeps Pokemon/return ownership while a feature panel is replaced", () => {
  let departed = 0, returned = 0;
  function ActiveFeature() {
    useEffect(() => () => { departed++; }, []);
    return createElement("p", {}, "Active feature");
  }
  const props = { pokemonId: "one", title: "Train", onBack() { returned++; } };
  const view = render(createElement(PokemonUpgradeWorkspace, { ...props, children: createElement(ActiveFeature) }));
  assert.equal(view.container.querySelector("[data-owned-pokemon]")?.getAttribute("data-owned-pokemon"), "one");
  assert.equal(view.queryByRole("tab"), null);
  view.rerender(createElement(PokemonUpgradeWorkspace, { ...props, title: "Another upgrade", children: createElement("p", {}, "Replacement feature") }));
  assert.equal(departed, 1);
  assert.ok(view.getByText("Replacement feature"));
  fireEvent.click(view.getByRole("button", { name: "‹ Pokémon" }));
  assert.equal(returned, 1);
});
