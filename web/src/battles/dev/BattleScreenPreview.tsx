/** Development-only stories render the production screen without HTTP or game writes. */
import { useEffect, useRef, useState } from "react";
import { BattleScreen } from "../BattleScreen";
import { playbackDuration } from "../motion";
import type { PlaybackFrame } from "../playback";
import type { BattleSession } from "../useBattleSession";
import { makeBattleStory } from "./battleStories";
import { storyGroups } from "./storyDefinitions";
import { readVfxLabSelection, vfxLabKinds, vfxLabPatterns, vfxLabTypes, vfxLabUrl } from "./vfxLab";
import type { VfxLabSelection, VfxLabType, VfxLabPattern } from "./vfxLab";
import { standardVfxTypes } from "../vfx/types";
import type { VfxKind } from "../vfx/types";
import { useVfxAssets } from "../vfx/useVfxAssets";
import "./story.css";

const requestedStory = new URLSearchParams(window.location.search).get("story");
const initialLabSelection = readVfxLabSelection(new URLSearchParams(window.location.search));
export const BattleScreenPreview = () => {
  const [labSelection, setLabSelection] = useState(initialLabSelection);
  const [story, setStory] = useState(() => makeBattleStory(requestedStory, initialLabSelection));
  const [selectedMoveId, selectMove] = useState<string | null>(story.selectedMoveId);
  const [inspectedPokemonId, inspectPokemon] = useState<string | null>(story.inspectedPokemonId);
  const [playing, setPlaying] = useState<PlaybackFrame | null>(story.playing);
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(story.history);
  const [replayKey, setReplayKey] = useState(0);
  const assetsReady = useVfxAssets();
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach(window.clearTimeout); }, []);
  useEffect(() => {
    if (!story.playing || !assetsReady) return;
    const timer = window.setTimeout(() => setPlaying(null), playbackDuration(story.playing.event, window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false));
    return () => window.clearTimeout(timer);
  }, [story, replayKey, assetsReady]);

  const changeLabSelection = (next: VfxLabSelection) => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    const nextStory = makeBattleStory("vfx", next);
    setLabSelection(next);
    setStory(nextStory);
    selectMove(nextStory.selectedMoveId);
    inspectPokemon(nextStory.inspectedPokemonId);
    setPlaying(nextStory.playing);
    setHistory(nextStory.history);
    setNotice(null);
    setReplayKey((current) => current + 1);
    window.history.replaceState(null, "", vfxLabUrl(next));
  };

  const session: BattleSession = {
    battle: story.battle, loading: false, busy: false, error: null, notice,
    selectedMoveId, inspectedPokemonId, playing, history,
    refresh: async () => {}, selectMove, inspectPokemon,
    targetPokemon: (id: string) => {
      const choice = story.battle.availableActions.moves.find((move) => move.moveId === selectedMoveId);
      const preview = choice?.targetPreviews?.find((entry) => entry.primaryTargetPokemonId === id);
      if (!preview) return;
      selectMove(null);
      const text = `${story.battle.view.pokemon[story.battle.view.activePokemonId || ""]?.name || "Pokémon"} used ${
        story.catalog.moves[selectedMoveId || ""]?.name || "a move"}.`;
      const event = { type: "moveStarted", sequence: 0,
        pokemonId: story.battle.view.activePokemonId || undefined, moveId: selectedMoveId || undefined,
        primaryTargetId: id, targetIds: preview.affectedPokemonIds,
        patternTiles: preview.patternTiles };
      setPlaying({ view: story.battle.view, text, event });
      setHistory((current) => [...current, text]);
      setNotice("Development story: no action was sent.");
      timers.current.push(window.setTimeout(() => setPlaying(story.playing), playbackDuration(event, window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false)));
    },
    skipTurn: () => setNotice("Development story: no action was sent."),
  };

  return <div className="battle-story-page">
    <section className="battle-story-toolbar" aria-label="Battle story controls">
      <div><strong>Battle UI stories</strong><span>Development data · no server actions</span></div>
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
      {story.playing && <button type="button" onClick={() => {
        setPlaying(story.playing);
        setReplayKey((current) => current + 1);
      }}>Replay action</button>}
    </section>
    <BattleScreen key={`${story.id}-${replayKey}`} catalog={story.catalog} session={session} />
  </div>;
};
