import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { createElement } from "react";
import { JSDOM } from "jsdom";
import { TrainingPanel } from "./TrainingPanel";
import type { TrainingPanelProps } from "./types";
import type { TrainingContext } from "../player/types";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement })) {
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
const { render, cleanup, fireEvent } = await import("@testing-library/react");
afterEach(cleanup);
const context: TrainingContext = {
  pokemon: { id: "one", name: "Pikachu", speciesId: "25", speciesName: "Pikachu", level: 41,
    rarity: "Rare", types: ["Electric"], shiny: false, combatPower: 1200, ivPercent: 90, inParty: true,
    spriteUrl: null, battleEligible: true, stats: [100,90,80,70,60,50], ivs: [31,31,31,31,31,31],
    evs: [0,248,0,0,0,96], nature: { name: "Hardy", raisedStat: null, loweredStat: null },
    moves: [], ability: null, heldItem: null, exp: { current: 198, required: 535 } },
  locations: [
    { id: "0", name: "Home", emoji: "🏠", level: 3, owned: true, nextGains: { exp: 256, evs: [0,0,0,0,0,0] }, canTrain: true },
    { id: "2", name: "Gym", emoji: "🏋️", level: 2, owned: true, nextGains: { exp: 115, evs: [0,4,0,0,0,0] }, canTrain: true },
    { id: "5", name: "School", emoji: "🏫", level: 0, owned: false, nextGains: { exp: 0, evs: [0,0,0,0,0,0] }, canTrain: false },
    { id: "8", name: "Berry Farm", emoji: "🚜", level: 1, owned: true, nextGains: { exp: 204, evs: [0,-10,0,0,0,-10] }, canTrain: true },
  ],
};
function page(overrides: Partial<TrainingPanelProps> = {}) {
  return render(createElement(TrainingPanel, { context, locationId: "2", onLocationChange() {}, onToggle() {},
    running: false, pending: false, totals: { exp: 230, evs: [0,12,0,0,0,0] }, error: null,
    onRefresh() {}, loading: false, refreshing: false, ...overrides }));
}
it("shows projected gains with a quiet idle status and only EXP/EV totals", () => {
  const view = page();
  assert.equal(view.getByRole("status").textContent, "");
  assert.ok(view.getByRole("button", { name: "Train" }));
  assert.ok(view.getByText("+4 Attack EV"));
  assert.equal(view.container.querySelector(".training-totals")?.textContent, "EXP +230EVs +12 Attack");
  assert.equal(view.queryByRole("button", { name: "Change" }), null);
  assert.equal(view.queryByText(/trainings|Ready to train|Training stopped|Trainer \+/), null);
});
it("uses running/pending state for Stop and Training status", () => {
  let toggles = 0;
  const view = page({ running: true, onToggle() { toggles++; } });
  assert.equal(view.getByRole("status").textContent, "Training…");
  fireEvent.click(view.getByRole("button", { name: "Stop" }));
  assert.equal(toggles, 1);
  assert.equal((view.getByRole("combobox") as HTMLSelectElement).disabled, true);
  view.rerender(createElement(TrainingPanel, { context, locationId: "2", onLocationChange() {}, onToggle() {},
    running: false, pending: true, totals: { exp: 0, evs: [0,0,0,0,0,0] }, error: null,
    onRefresh() {}, loading: false, refreshing: false }));
  assert.equal(view.getByRole("status").textContent, "Training…");
  assert.equal((view.getByRole("button", { name: "Stopping…" }) as HTMLButtonElement).disabled, true);
});
it("keeps Home zero selectable and Berry copy and negative gains concise", () => {
  const selected: string[] = [];
  const view = page({ locationId: "0", onLocationChange(id) { selected.push(id); } });
  assert.ok(view.getByText("Fully upgraded, Home provides the most EXP."));
  fireEvent.change(view.getByRole("combobox"), { target: { value: "8" } });
  assert.deepEqual(selected, ["8"]);
  view.unmount();
  const berry = page({ locationId: "8" });
  assert.ok(berry.getByText("Reduces every stat's EVs."));
  assert.ok(berry.getByText("−10 Attack EV"));
  assert.equal(berry.queryByText(/down to zero/), null);
});
