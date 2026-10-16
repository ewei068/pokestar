import { eventText } from './eventText';
import { applyEventView, eventCue } from './results/events';
import type { EventCue } from './results/events';
import { transitionDuration, viewChanges } from './results/transitions';
import type { ViewChanges } from './results/transitions';
import { resultAnimationConfig as config } from './results/config';
import { MOVE_MOTION_DURATION_MS } from './motion';
import type { BattleCatalog, BattleDisplay, BattleEvent, BattleResponse, BattleView } from './types';

export type PlaybackFrame = {
  id: string; revision: number; stage: 'event' | 'transition';
  event: BattleEvent; view: BattleView; text: string | null; cue: EventCue | null;
  changes: ViewChanges; durationMs: number;
};
export type BattleLogEntry = { id: string; revision: number; turn: number; text: string };
export type PlaybackState = { battle: BattleDisplay | null; queue: PlaybackFrame[]; history: BattleLogEntry[] };
export const emptyPlayback = (): PlaybackState => ({ battle: null, queue: [], history: [] });

/** Plan observations from the preceding canonical view, never the received final view. */
const newPlaybackFrames = (previous: BattleDisplay, response: BattleResponse, catalog: BattleCatalog): PlaybackFrame[] => {
  const frames: PlaybackFrame[] = [];
  let view = previous.view;
  const transition = (next: BattleView, event: BattleEvent, revision: number, id: string) => {
    if (JSON.stringify(view) === JSON.stringify(next)) return;
    const changes = viewChanges(view, next);
    frames.push({ id, revision, stage: 'transition', event, view: next, changes,
      text: null, cue: null, durationMs: transitionDuration(changes) });
    view = next;
  };
  for (const update of response.updates.filter(item => item.revision > previous.revision)) {
    const canonical = update.view || response.view;
    update.events.forEach((event, index) => {
      const id = `${response.battleId}:${update.revision}:${event.sequence}`;
      // A final turn announcement describes the canonical state prepared for that turn.
      if (event.type === 'turnStarted' && index === update.events.length - 1)
        transition(canonical, { type: 'reconciled', sequence: -1 }, update.revision, `${id}:reconcile`);
      const text = eventText(event, view, catalog), cue = eventCue(event, view, catalog);
      if (cue) frames.push({ id, revision: update.revision, stage: 'event', event, view,
        text, cue, changes: viewChanges(view, view),
        durationMs: event.type === 'moveStarted' ? MOVE_MOTION_DURATION_MS : config.text.durationMs });
      transition(applyEventView(view, event), event, update.revision, `${id}:transition`);
    });
    transition(canonical, { type: 'reconciled', sequence: -1 }, update.revision,
      `${response.battleId}:${update.revision}:reconcile`);
  }
  return frames;
};

export type PlaybackAction =
  | { type: 'receive'; response: BattleResponse; catalog: BattleCatalog }
  | { type: 'begin'; id: string }
  | { type: 'advance'; id: string }
  | { type: 'skip' };

/** One seam for transport, stories and tests: receive, begin, advance or skip. */
export const reducePlayback = (state: PlaybackState, action: PlaybackAction): PlaybackState => {
  if (action.type === 'receive') {
    const response = action.response, previous = state.battle;
    if (previous && response.battleId === previous.battleId && response.revision < previous.revision) return state;
    const battle: BattleDisplay = {
      battleId: response.battleId, rulesetVersion: response.rulesetVersion,
      revision: response.revision, status: response.status, completionStatus: response.completionStatus,
      mode: response.mode, myTeamNames: response.myTeamNames, isMyTurn: response.isMyTurn,
      view: response.view, availableActions: response.availableActions,
    };
    if (!previous || previous.battleId !== battle.battleId || previous.rulesetVersion !== battle.rulesetVersion)
      return { battle, queue: [], history: [] };
    if (battle.revision === previous.revision) return { ...state, battle };
    const updates = response.updates.filter(update => update.revision > previous.revision);
    // A missing action boundary is a resync, not a license to guess intermediate state.
    if (!updates.length || updates[updates.length - 1].revision !== response.revision ||
      updates.some((update, i) => update.revision !== previous.revision + i + 1))
      return { ...state, battle, queue: [] };
    return { ...state, battle, queue: [...state.queue, ...newPlaybackFrames(previous, response, action.catalog)] };
  }
  if (action.type === 'skip') return { ...state, queue: [] };
  const frame = state.queue[0];
  if (!frame || frame.id !== action.id) return state;
  if (action.type === 'advance') return { ...state, queue: state.queue.slice(1) };
  if (!frame.text || state.history.some(entry => entry.id === frame.id)) return state;
  return { ...state, history: [...state.history, { id: frame.id, revision: frame.revision,
    turn: frame.view.turn, text: frame.text }].slice(-config.history.maxEntries) };
};

export const frameDuration = (frame: PlaybackFrame, reducedMotion: boolean) => !reducedMotion
  ? frame.durationMs : frame.stage === 'transition' ? config.reducedMotion.transitionMs : config.reducedMotion.eventMs;
