/** Development-only stories render the production screen without HTTP or game writes. */
import { useEffect, useMemo, useState } from "react";
import { BattleScreen } from "../BattleScreen";
import { applyEventView } from '../results/events';
import { useBattlePlayback } from "../useBattlePlayback";
import type { BattleSession } from "../useBattleSession";
import type { BattleResponse } from "../types";
import type { BattleStory } from "./battleStories";
import { makeBattleStory } from "./battleStories";
import { storyGroups } from "./storyDefinitions";
import { readVfxLabSelection, vfxLabKinds, vfxLabPatterns, vfxLabTypes, vfxLabUrl } from "./vfxLab";
import type { VfxLabSelection, VfxLabType, VfxLabPattern } from "./vfxLab";
import { standardVfxTypes } from "../vfx/types";
import type { VfxKind } from "../vfx/types";
import "./story.css";
import { ArenaPrototype, arenaPrototypeEnabled } from "./arena-prototype/ArenaPrototype";

const requestedStory = new URLSearchParams(window.location.search).get("story");
const initialLabSelection = readVfxLabSelection(new URLSearchParams(window.location.search));
const responseFor = (story: BattleStory): BattleResponse => ({
  ...story.battle, found: true, stateId: `story:${story.battle.revision}`, updates: [],
});

/** Exercise the actual playback module, including event application and reconciliation. */
const StoryScreen = ({ story }: { story: BattleStory }) => {
  const playback = useBattlePlayback(story.catalog, responseFor(story));
  const [selectedMoveId, selectMove] = useState(story.selectedMoveId);
  const [inspectedPokemonId, inspectPokemon] = useState(story.inspectedPokemonId);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    const events = story.sequence?.events || (story.playing ? [story.playing.event] : []);
    if (!story.sequence && !story.playing) return;
    const revision = story.battle.revision + 1;
    playback.receive({ ...responseFor(story), revision, stateId: `story:${revision}`,
      view: story.sequence?.finalView || (story.playing ? applyEventView(story.battle.view, story.playing.event) : story.battle.view),
      updates: [{ revision, action: { action: "skipTurn" }, events, log: [] }] });
  }, [story, playback.receive]);
  const seedHistory = useMemo(() => story.history.map((text, index) => ({ id: `story:${index}`,
    revision: story.id === 'result-long-log' ? Math.floor(index / 8) + 1 : story.battle.revision,
    turn: story.id === 'result-long-log' ? Math.floor(index / 8) + 1 : story.battle.view.turn, text })), [story]);
  const history = useMemo(() => [...seedHistory, ...playback.history], [seedHistory, playback.history]);
  const battle = playback.battle!;
  const session: BattleSession = {
    battle, loading: false, busy: false, error: null, notice,
    selectedMoveId, inspectedPokemonId, playing: playback.playing,
    history,
    skipPlayback: playback.skipPlayback, waitingForArt: playback.waitingForArt, reducedMotion: playback.reducedMotion,
    refresh: async () => {}, selectMove, inspectPokemon,
    targetPokemon: id => {
      if (playback.playing) return;
      const choice = battle.availableActions.moves.find(move => move.moveId === selectedMoveId);
      const preview = choice?.targetPreviews?.find(entry => entry.primaryTargetPokemonId === id);
      if (!preview) return;
      selectMove(null);
      const revision = battle.revision + 1;
      playback.receive({ ...responseFor(story), revision, stateId: `story:${revision}`, view: battle.view,
        updates: [{ revision, action: { action: "useMove", moveId: selectedMoveId!, targetPokemonId: id }, log: [],
          events: [{ type: "moveStarted", sequence: 0, pokemonId: battle.view.activePokemonId || undefined,
            moveId: selectedMoveId || undefined, primaryTargetId: id,
            targetIds: preview.affectedPokemonIds, patternTiles: preview.patternTiles }] }] });
      setNotice("Development story: no action was sent.");
    },
    skipTurn: () => setNotice("Development story: no action was sent."),
  };
  const appendResult = () => {
    const revision = battle.revision + 1, view = structuredClone(battle.view);
    const events = ['Rival Team-94', 'Rival Team-59', 'Rival Team-350'].map((pokemonId, sequence) => {
      const previousHp = view.pokemon[pokemonId].hp;
      view.pokemon[pokemonId].hp = Math.max(0, previousHp - 1);
      return { type: 'hpChanged', sequence, pokemonId, previousHp, hp: view.pokemon[pokemonId].hp,
        amount: view.pokemon[pokemonId].hp - previousHp };
    });
    playback.receive({ ...responseFor(story), revision, stateId: `story:${revision}`, view,
      updates: [{ revision, action: { action: 'skipTurn' }, events, log: [] }] });
  };
  return <>
    {story.id === 'result-long-log' && <div className="battle-story-toolbar">
      <button type="button" disabled={!!playback.playing} onClick={appendResult}>Simulate another result</button>
    </div>}
    <BattleScreen catalog={story.catalog} session={session} />
  </>;
};

export const BattleScreenPreview = () => {
  const [labSelection, setLabSelection] = useState(initialLabSelection);
  const [story, setStory] = useState(() => makeBattleStory(requestedStory, initialLabSelection));
  const [replayKey, setReplayKey] = useState(0);
  const changeLabSelection = (next: VfxLabSelection) => {
    setLabSelection(next);
    setStory(makeBattleStory("vfx", next));
    setReplayKey(current => current + 1);
    const url = new URL(vfxLabUrl(next), window.location.href);
    if (arenaPrototypeEnabled) {
      url.searchParams.set('arenaPrototype', '1');
      url.searchParams.set('variant', new URLSearchParams(window.location.search).get('variant') || 'A');
    }
    window.history.replaceState(null, "", url);
  };

  const content = <div className="battle-story-page">
    <section className="battle-story-toolbar" aria-label="Battle story controls">
      <div><strong>Battle UI stories</strong><span>Development data · no server actions</span></div>
      {arenaPrototypeEnabled && <label className="arena-prototype-scenario">Scenario <select aria-label="Arena prototype scenario" value={story.id} onChange={event => {
        const url = new URL(window.location.href); url.searchParams.set('story', event.target.value); window.location.assign(url.href);
      }}>{storyGroups.map(group => <optgroup key={group.title} label={group.title}>{group.stories.map(definition =>
        <option key={definition.id} value={definition.id}>{definition.title}</option>)}</optgroup>)}</select></label>}
      <nav aria-label="Story scenarios">{storyGroups.map((group) =>
        <div className="battle-story-nav-group" key={group.title}><strong>{group.title}</strong>
          <span>{group.stories.map((definition) =>
            <a key={definition.id} href={`?previewBattle=1&story=${definition.id}`}
              aria-current={story.id === definition.id ? "page" : undefined}>{definition.title}</a>)}</span>
        </div>)}</nav>
      <p>{story.description}</p>
      {requestedStory && requestedStory !== story.id && <p role="status">Unknown story; showing {story.title}.</p>}
      {story.id === "vfx" && <fieldset className="battle-vfx-lab"><legend>VFX matrix</legend>
        <label>Type<select value={labSelection.type} onChange={(event) =>
          changeLabSelection({ ...labSelection, type: event.target.value as VfxLabType })}>
          {vfxLabTypes.map((type) => <option value={type} key={type}>{type}</option>)}
        </select></label>
        <label>Action<select value={labSelection.kind} onChange={(event) =>
          changeLabSelection({ ...labSelection, kind: event.target.value as VfxKind })}>
          {vfxLabKinds.map((kind) => <option value={kind} key={kind}>{kind}</option>)}
        </select></label>
        <label>Area<select value={labSelection.pattern} onChange={(event) =>
          changeLabSelection({ ...labSelection, pattern: event.target.value as VfxLabPattern })}>
          {vfxLabPatterns.map((pattern) => <option value={pattern} key={pattern}>{pattern}</option>)}
        </select></label>
        {!standardVfxTypes.some((type) => type === labSelection.type) &&
          <small>Uses Normal VFX until this type receives its own art.</small>}
        <small>Uses the same VFX renderer as live battles.</small>
      </fieldset>}
      {(story.playing || story.sequence) && <button type="button" onClick={() => {
        setReplayKey((current) => current + 1);
      }}>Replay action</button>}
    </section>
    <StoryScreen key={`${story.id}-${replayKey}`} story={story} />
  </div>;
  return arenaPrototypeEnabled ? <ArenaPrototype>{content}</ArenaPrototype> : content;
};
