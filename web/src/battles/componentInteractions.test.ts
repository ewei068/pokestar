import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { createElement, useState } from "react";
import { JSDOM } from "jsdom";
import { BattleGrid } from "./BattleGrid";
import { MovePanel } from "./MovePanel";
import { BattleInspector } from "./BattleInspector";
import { StatusLabel } from "./StatusLabel";
import { makeBattleStory } from "./dev/battleStories";
import { useTargetConfirmation } from "./useTargetConfirmation";
import { targetPreviewFor } from "./presentation";

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
  it("replaces the move list with an explicit Cancel action while targeting", async () => {
    const { battle, catalog } = makeBattleStory("ready");
    let selected: string | null = "eruption";
    const page = render(createElement(MovePanel, {
      view: battle.view, availableActions: battle.availableActions, isMyTurn: true,
      catalog, selectedMoveId: selected, preview: null, busy: false, collapsed: false,
      onToggleCollapsed() {}, onSelectMove: id => { selected = id; }, onHoverMove() {}, onSkip() {},
    }));
    assert.equal(page.queryByRole('button', { name: /Flamethrower/ }), null);
    await userEvent.setup({ document: dom.window.document }).click(page.getByRole('button', { name: 'Cancel' }));
    assert.equal(selected, null);
  });

  it("offers Skip only when it is the participant's sole legal action", () => {
    const { battle, catalog } = makeBattleStory("ready");
    const props = {
      view: battle.view, availableActions: battle.availableActions, isMyTurn: true,
      catalog, selectedMoveId: null, preview: null, busy: false, collapsed: false,
      onToggleCollapsed() {}, onSelectMove() {}, onHoverMove() {}, onSkip() {},
    };
    const page = render(createElement(MovePanel, props));
    assert.equal(page.queryByRole('button', { name: /Skip$/ }), null);
    page.rerender(createElement(MovePanel, { ...props, availableActions: { canSkip: true, moves: [] } }));
    assert.ok(page.getByRole('button', { name: /Skip$/ }));
    page.rerender(createElement(MovePanel, { ...props, isMyTurn: false,
      availableActions: { canSkip: false, moves: [] } }));
    assert.equal(page.queryByRole('button', { name: /Skip$/ }), null);
  });

  it("keeps status, ability, item and effect duration individually inspectable", async () => {
    const { battle, catalog } = makeBattleStory("ready");
    const pokemon = battle.view.pokemon[battle.view.activePokemonId!];
    pokemon.status = { statusId: 'Badly Poison' };
    pokemon.effectIds = { shield: { duration: 2 } };
    const opened: { category: string; name: string; description: string; duration?: number }[] = [];
    const user = userEvent.setup({ document: dom.window.document });
    const props = { pokemon, moveId: null, detail: null, catalog,
      onOpenDetail: (detail: typeof opened[number]) => opened.push(detail), onBack() {} };
    const page = render(createElement(BattleInspector, props));
    assert.equal(page.getByRole('button', { name: 'Status: Badly Poison' }).textContent, 'TOX');
    await user.click(page.getByRole('button', { name: 'Ability: Blaze' }));
    await user.click(page.getByRole('button', { name: 'Held item: Charcoal' }));
    await user.click(page.getByRole('button', { name: /Shielded/ }));
    assert.deepEqual(opened.map(d => d.category), ['Ability', 'Held item', 'Buff']);
    assert.equal(opened[2].description, catalog.effects.shield.description);
    assert.equal(opened[2].duration, 2);
    page.rerender(createElement(BattleInspector, { ...props, detail: opened[2] }));
    assert.ok(page.getByText('2 turns'));
    await user.click(page.getByRole('button', { name: '← Back' }));
  });

  it('shares three-letter status identity between noninteractive board cues and inspect buttons', () => {
    const page = render(createElement(StatusLabel, { statusId: 'Badly Poison' }));
    for (const [statusId, abbreviation] of [['Badly Poison', 'TOX'], ['Poison', 'PSN'], ['Paralysis', 'PAR'],
      ['Burn', 'BRN'], ['Sleep', 'SLP'], ['Freeze', 'FRZ']]) {
      page.rerender(createElement(StatusLabel, { statusId }));
      const cue = page.getByLabelText(`Status: ${statusId}`);
      assert.equal(cue.tagName, 'SPAN');
      assert.equal(cue.textContent, abbreviation);
      assert.equal(cue.getAttribute('data-status'), abbreviation);
      page.rerender(createElement(StatusLabel, { statusId, onClick() {} }));
      assert.equal(page.getByRole('button', { name: `Status: ${statusId}` }).textContent, abbreviation);
    }
  });

  it('uses participant display names without changing target tile identity', () => {
    const { battle, catalog } = makeBattleStory('dense');
    const page = render(createElement(BattleGrid, {
      view: battle.view, ownTeamNames: battle.myTeamNames, catalog,
      targetIds: [], primaryTargetId: null, patternTiles: [], affectedIds: [],
      playback: false, highlightedId: null, onChooseTarget() {}, onInspect() {}, onHover() {},
    }));
    assert.ok(page.getByRole('region', { name: 'You formation' }));
    assert.ok(page.getByRole('region', { name: 'Palmer formation' }));
    assert.ok(page.container.querySelector('[data-team-name="Rival Team"]'));
    assert.equal(page.container.querySelector('button button'), null);
    assert.equal(page.container.querySelector('.arena-mon [data-status="TOX"]')?.textContent, 'TOX');
  });

  it("shows move facts before the description with type beside the title", () => {
    const { catalog } = makeBattleStory("ready");
    catalog.moves.sunnyday.cooldown = 3;
    const page = render(createElement(BattleInspector, {
      pokemon: null, moveId: 'sunnyday', detail: null, catalog, onOpenDetail() {}, onBack() {},
    }));
    const facts = page.getByLabelText('Move details');
    assert.match(facts.textContent!, /Category.*Status.*Power.*—.*Accuracy.*100.*Cooldown.*3 turns/);
    assert.equal(page.queryByText('Single'), null);
    assert.ok(facts.compareDocumentPosition(page.getByText(catalog.moves.sunnyday.description!)) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("selects a move and cancels it to exit targeting", async () => {
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
    await user.click(page.getByRole("button", { name: 'Cancel' }));
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
    assert.equal(page.container.querySelector('.arena-command-foot [aria-live]')?.textContent?.trim(), 'Waiting for the result…');
    assert.equal(page.getByRole('button', { name: 'Cancel' }).hasAttribute('disabled'), true);
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

describe('tap target confirmation', () => {
  const story = makeBattleStory('ready');
  const Targeting = ({ revision = 1, enabled = true, submit, inspect = () => {} }: {
    revision?: number; enabled?: boolean; submit: (id: string) => void; inspect?: (id: string) => void;
  }) => {
    const [moveId, selectMove] = useState<string | null>('eruption');
    const choice = story.battle.availableActions.moves.find(move => move.moveId === moveId);
    const targetIds = enabled ? choice?.targetPokemonIds || [] : [];
    const confirmation = useTargetConfirmation(enabled && moveId ? `${revision}:${moveId}` : null, targetIds, submit);
    const preview = targetPreviewFor(story.battle.view, choice, confirmation.pendingTargetId);
    return createElement('div', {},
      createElement(BattleGrid, { view: story.battle.view, ownTeamNames: story.battle.myTeamNames,
        catalog: story.catalog, targetIds, primaryTargetId: confirmation.pendingTargetId,
        patternTiles: preview?.patternTiles || [], affectedIds: preview?.affectedPokemonIds || [],
        playback: false, highlightedId: null, onChooseTarget: confirmation.choose,
        onInspect: inspect, onHover() {} }),
      createElement(MovePanel, { view: story.battle.view, availableActions: story.battle.availableActions,
        catalog: story.catalog, isMyTurn: true, selectedMoveId: moveId, preview, busy: !enabled,
        collapsed: false, onToggleCollapsed() {}, onSelectMove: id => { confirmation.clear(); selectMove(id); },
        onHoverMove() {}, onSkip() {}, confirming: !!confirmation.pendingTargetId, onConfirm: confirmation.confirm }));
  };

  it('pins a touch preview including empty tiles, allows retargeting and confirms once', async () => {
    const submitted: string[] = [];
    const user = userEvent.setup({ document: dom.window.document });
    const page = render(createElement(Targeting, { submit: id => submitted.push(id) }));
    await user.pointer({ keys: '[TouchA]', target: page.getByRole('button', { name: /^Gengar,/ }) });
    assert.deepEqual(submitted, []);
    assert.ok(page.getByRole('button', { name: 'Confirm' }));
    assert.equal(page.container.querySelectorAll('.is-pattern-cell').length, 8);
    assert.ok(page.container.querySelector('.arena-empty.is-affected'));
    await user.pointer({ keys: '[TouchA]', target: page.getByRole('button', { name: /^Arcanine,/ }) });
    assert.equal(page.container.querySelector('.is-primary')?.getAttribute('aria-label')?.startsWith('Arcanine,'), true);
    assert.deepEqual(submitted, []);
    const confirm = page.getByRole('button', { name: 'Confirm' });
    const { act, fireEvent } = await import('@testing-library/react');
    act(() => { fireEvent.click(confirm); fireEvent.click(confirm); });
    assert.deepEqual(submitted, ['Rival Team-59']);
  });

  it('cancels a staged target and restores Pokémon inspection', async () => {
    const submitted: string[] = [], inspected: string[] = [];
    const user = userEvent.setup({ document: dom.window.document });
    const page = render(createElement(Targeting, { submit: id => submitted.push(id), inspect: id => inspected.push(id) }));
    await user.pointer({ keys: '[TouchA]', target: page.getByRole('button', { name: /^Gengar,/ }) });
    await user.click(page.getByRole('button', { name: 'Cancel' }));
    assert.equal(page.queryByRole('button', { name: 'Confirm' }), null);
    assert.equal(page.container.querySelector('.is-primary'), null);
    await user.pointer({ keys: '[TouchA]', target: page.getByRole('button', { name: /^Gengar,/ }) });
    assert.deepEqual(submitted, []);
    assert.deepEqual(inspected, ['Rival Team-94']);
  });

  it('uses the move when the same primary target is tapped again', async () => {
    const submitted: string[] = [];
    const user = userEvent.setup({ document: dom.window.document });
    const page = render(createElement(Targeting, { submit: id => submitted.push(id) }));
    const target = page.getByRole('button', { name: /^Gengar,/ });
    await user.pointer({ keys: '[TouchA]', target });
    assert.deepEqual(submitted, []);
    await user.pointer({ keys: '[TouchA]', target });
    assert.deepEqual(submitted, ['Rival Team-94']);
    assert.equal(page.queryByRole('button', { name: 'Confirm' }), null);
  });

  it('requires confirmation for pen input, but submits mouse and keyboard choices directly', async () => {
    const submitted: string[] = [];
    const user = userEvent.setup({ document: dom.window.document });
    const page = render(createElement(Targeting, { submit: id => submitted.push(id) }));
    const target = page.getByRole('button', { name: /^Gengar,/ });
    // user-event supports mouse/touch; supply the native pen pointer event at the DOM boundary.
    const { fireEvent } = await import('@testing-library/react');
    const pen = new dom.window.Event('pointerdown', { bubbles: true });
    Object.defineProperty(pen, 'pointerType', { value: 'pen' });
    fireEvent(target, pen);
    fireEvent.click(target, { detail: 1 });
    assert.deepEqual(submitted, []);
    assert.ok(page.getByRole('button', { name: 'Confirm' }));
    await user.click(target);
    assert.deepEqual(submitted, ['Rival Team-94']);
    assert.equal(page.queryByRole('button', { name: 'Confirm' }), null);
    target.focus();
    await user.keyboard('{Enter}');
    assert.deepEqual(submitted, ['Rival Team-94', 'Rival Team-94']);
  });

  it('invalidates a preview when the turn changes or actions become unavailable', async () => {
    const submitted: string[] = [];
    const props = { submit: (id: string) => submitted.push(id) };
    const user = userEvent.setup({ document: dom.window.document });
    const page = render(createElement(Targeting, props));
    const tap = () => user.pointer({ keys: '[TouchA]', target: page.getByRole('button', { name: /^Gengar,/ }) });
    await tap();
    page.rerender(createElement(Targeting, { ...props, revision: 2 }));
    assert.equal(page.queryByRole('button', { name: 'Confirm' }), null);
    assert.equal(page.container.querySelector('.is-primary'), null);
    await tap();
    page.rerender(createElement(Targeting, { ...props, revision: 2, enabled: false }));
    assert.equal(page.queryByRole('button', { name: 'Confirm' }), null);
    page.rerender(createElement(Targeting, { ...props, revision: 2 }));
    assert.equal(page.queryByRole('button', { name: 'Confirm' }), null);
    assert.deepEqual(submitted, []);
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
      { id: 'a', revision: 18, turn: 12, text: 'Typhlosion used Tackle!' },
      { id: 'b', revision: 18, turn: 12, text: 'Gengar took 42 damage!' },
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
