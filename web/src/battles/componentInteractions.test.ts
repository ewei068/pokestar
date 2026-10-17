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

// Layout and virtualization behavior are checked in a real browser.
Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, value: class {
  observe() {} unobserve() {} disconnect() {}
} });
Object.defineProperty(dom.window, "ResizeObserver", { configurable: true, value: globalThis.ResizeObserver });
Object.defineProperty(dom.window.HTMLElement.prototype, "scrollTo", { configurable: true, value() {} });
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

  it("keeps resolving feedback inside the existing command tray", () => {
    const { battle, catalog } = makeBattleStory("ready");
    const page = render(createElement(MovePanel, {
      view: battle.view, availableActions: battle.availableActions, isMyTurn: true,
      catalog, selectedMoveId: "eruption", preview: null, busy: true, submitting: true,
      collapsed: false, onToggleCollapsed() {}, onSelectMove() {}, onHoverMove() {}, onSkip() {},
    }));
    assert.equal(page.container.querySelector('.arena-command-foot [aria-live]')?.textContent?.trim(), 'Resolving this turn…');
    assert.equal(page.getByRole('button', { name: /Eruption/ }).hasAttribute('disabled'), true);
  });

  it("marks the current turn and mirrors only the viewing participant's team", () => {
    const { battle, catalog } = makeBattleStory("ready");
    const page = render(createElement(BattleGrid, {
      view: battle.view, ownTeamNames: ["Rival Team"], catalog,
      targetIds: ["Star Team-157"], primaryTargetId: null, patternTiles: [], affectedIds: [],
      playback: false, highlightedId: null,
      onChooseTarget() {}, onInspect() {}, onHover() {},
    }));
    const teams = page.container.querySelectorAll('.arena-team');
    assert.equal(teams[0].getAttribute('aria-label'), 'Rival Team formation');
    const ownImage = page.getByRole('button', { name: /^Gengar,/ }).querySelector('img')!;
    const rival = page.getByRole('button', { name: /^Typhlosion,/ });
    assert.equal(ownImage.style.scale, '-1 1');
    assert.notEqual(rival.querySelector('img')!.style.scale, '-1 1');
    assert.equal(rival.getAttribute('aria-current'), 'true');
    assert.ok(page.container.querySelector('.arena-board.is-targeting'));
    assert.equal(page.container.querySelectorAll('.arena-turn-marker').length, 1);
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

// Event overlays use production grid geometry; state ordering is covered at the playback seam.
describe('result presentation', () => {
  it('announces damage at its Pokémon alongside the updated HP and reaction layer', async () => {
    const { emptyPlayback, reducePlayback } = await import('./playback');
    const story = makeBattleStory('result-damage');
    const initial = { ...story.battle, found: true as const, stateId: '17', updates: [] };
    const after = { ...initial, revision: 18, stateId: '18', view: story.sequence!.finalView,
      updates: [{ revision: 18, action: { action: 'skipTurn' as const }, events: story.sequence!.events, log: [] }] };
    let state = reducePlayback(emptyPlayback(), { type: 'receive', response: initial, catalog: story.catalog });
    state = reducePlayback(state, { type: 'receive', response: after, catalog: story.catalog });
    const frame = state.queue[0];
    const page = render(createElement(BattleGrid, {
      view: frame.view, ownTeamNames: story.battle.myTeamNames, catalog: story.catalog,
      targetIds: [], primaryTargetId: null, patternTiles: [], affectedIds: [], playback: false,
      highlightedId: null, resultFrame: frame,
      onChooseTarget: () => {}, onInspect: () => {}, onHover: () => {},
    }));
    assert.equal(page.getByRole('status').textContent, '−42 HP');
    assert.ok(page.container.querySelector('.arena-result-reactions'));
    assert.ok(page.getByRole('button', { name: /Gengar, 73 of 175 HP/ }));
  });

  it('exposes the virtual history viewport and a working playback escape', async () => {
    const { BattleLog } = await import('./results/BattleLog');
    let skipped = false;
    const page = render(createElement(BattleLog, { entries: [
      { id: 'a', revision: 18, turn: 12, text: 'Typhlosion used Tackle.' },
      { id: 'b', revision: 18, turn: 12, text: 'Gengar lost 42 HP.' },
      { id: 'c', revision: 19, turn: 13, text: 'Arcanine skipped its turn.' },
    ], playing: true, onSkip: () => { skipped = true; } }));
    assert.ok(page.getByText('3 entries'));
    assert.ok(page.getByRole('list', { name: 'Event history' }));
    await userEvent.setup({ document: dom.window.document }).click(page.getByRole('button', { name: 'Skip animations' }));
    assert.equal(skipped, true);
  });

  it('reuses a status canvas in place and removes both reaction renderers on completion', async () => {
    const { emptyPlayback, reducePlayback } = await import('./playback');
    const story = makeBattleStory('result-status-burn');
    const initial = { ...story.battle, found: true as const, stateId: '17', updates: [] };
    let state = reducePlayback(emptyPlayback(), { type: 'receive', response: initial, catalog: story.catalog });
    state = reducePlayback(state, { type: 'receive', catalog: story.catalog, response: {
      ...initial, revision: 18, stateId: '18', view: story.sequence!.finalView,
      updates: [{ revision: 18, action: { action: 'skipTurn' }, events: story.sequence!.events, log: [] }],
    } });
    const frame = state.queue[0];
    assert.equal(frame.previousView.pokemon['Rival Team-94'].status.statusId, undefined);
    const props = { view: frame.view, catalog: story.catalog, ownTeamNames: story.battle.myTeamNames,
      targetIds: [], primaryTargetId: null, patternTiles: [], affectedIds: [], playback: false,
      highlightedId: null, onChooseTarget() {}, onInspect() {}, onHover() {} };
    const page = render(createElement(BattleGrid, { ...props, resultFrame: frame }));
    assert.ok(page.container.querySelector('.arena-board-vfx[data-vfx-type="fire"][data-vfx-kind="status"]'));
    assert.equal(page.container.querySelector('.arena-motion-actor'), null);
    page.rerender(createElement(BattleGrid, { ...props, view: story.sequence!.finalView }));
    assert.equal(page.container.querySelector('.arena-result-reactions,.arena-board-vfx,.arena-announcement'), null);
  });
});
