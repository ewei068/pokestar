import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { createElement } from "react";
import { JSDOM } from "jsdom";
import { BattleGrid } from "./BattleGrid";
import { MovePanel } from "./MovePanel";
import { makeBattleStory } from "./dev/battleStories";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/" });
Object.defineProperty(globalThis, "window", { configurable: true, value: dom.window });
Object.defineProperty(globalThis, "document", { configurable: true, value: dom.window.document });
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });
Object.defineProperty(globalThis, "HTMLElement", { configurable: true, value: dom.window.HTMLElement });

const { cleanup, render } = await import("@testing-library/react");
const userEvent = (await import("@testing-library/user-event")).default;
afterEach(cleanup);

describe("battle controls", () => {
  it("selects a move and reselects it to exit targeting", async () => {
    const { battle, catalog } = makeBattleStory("ready");
    const selected: (string | null)[] = [];
    const props = {
      view: battle.view, availableActions: battle.availableActions, isMyTurn: true,
      catalog, selectedMoveId: null as string | null, preview: null,
      busy: false, collapsed: false, onToggleCollapsed: () => {},
      onSelectMove: (moveId: string | null) => selected.push(moveId),
      onHoverMove: () => {}, onSkip: () => {},
    };
    const user = userEvent.setup({ document: dom.window.document });
    const page = render(createElement(MovePanel, props));
    await user.click(page.getByRole("button", { name: /Eruption/ }));
    page.rerender(createElement(MovePanel, { ...props, selectedMoveId: "eruption" }));
    await user.click(page.getByRole("button", { name: /Eruption/ }));
    assert.deepEqual(selected, ["eruption", null]);
  });

  it("routes legal target clicks to action and other Pokémon clicks to inspection", async () => {
    const { battle, catalog } = makeBattleStory("ready");
    const chosen: string[] = [];
    const inspected: string[] = [];
    const user = userEvent.setup({ document: dom.window.document });
    const page = render(createElement(BattleGrid, {
      view: battle.view, ownTeamNames: battle.myTeamNames, catalog,
      targetIds: ["Rival Team-94"], primaryTargetId: null,
      patternTiles: [], affectedIds: [], playback: false, highlightedId: null,
      onChooseTarget: (id: string) => chosen.push(id),
      onInspect: (id: string) => inspected.push(id), onHover: () => {},
    }));
    await user.click(page.getByRole("button", { name: /Gengar.*use selected move/ }));
    await user.click(page.getByRole("button", { name: /Typhlosion.*inspect/ }));
    assert.deepEqual(chosen, ["Rival Team-94"]);
    assert.deepEqual(inspected, ["Star Team-157"]);
  });

  it("places Normal VFX on occupied and empty executed tiles", () => {
    Object.defineProperty(dom.window, "matchMedia", { configurable: true,
      value: () => ({ matches: false }) });
    const { battle, catalog, playing } = makeBattleStory("motion-giga-impact");
    const page = render(createElement(BattleGrid, {
      view: battle.view, ownTeamNames: battle.myTeamNames, catalog,
      targetIds: [], primaryTargetId: playing?.event.primaryTargetId || null,
      patternTiles: playing?.event.patternTiles || [], affectedIds: playing?.event.targetIds || [],
      playback: true, motionEvent: playing?.event, highlightedId: null,
      onChooseTarget: () => {}, onInspect: () => {}, onHover: () => {},
    }));
    const canvas = page.container.querySelector('.arena-board-vfx[data-vfx-type="normal"][data-vfx-kind="physical"]');
    assert.ok(canvas);
    const tiles = JSON.parse(canvas.getAttribute('data-vfx-targets') || '[]');
    assert.equal(tiles.length, 2);
    assert.ok(tiles.some((tile: {teamName: string; position: number}) => tile.teamName === 'Rival Team' && tile.position === 6));
  });
});
