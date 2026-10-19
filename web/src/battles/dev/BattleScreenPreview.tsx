/** Development-only stories render the production screen without HTTP or game writes. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { cuesForStory, defaultExcerptStart, isMoveCue, maxExcerptStart, timingForFrame, useAudioStudy } from "./audioStudy";
import type { StudyCue, StudyGeneration } from "./audioStudy";
import { isAudioStory, isMoveAudioStory } from "./audioStories";
import "./story.css";

const requestedStory = new URLSearchParams(window.location.search).get("story");
const initialLabSelection = readVfxLabSelection(new URLSearchParams(window.location.search));
const responseFor = (story: BattleStory): BattleResponse => ({
  ...story.battle, found: true, stateId: `story:${story.battle.revision}`, updates: [],
});

/** Exercise the actual playback module, including event application and reconciliation. */
const StoryScreen = ({ story, studyPlaying, generation, excerptStart, playCue }: {
  story: BattleStory; studyPlaying: boolean; generation: StudyGeneration;
  excerptStart: number;
  playCue: (cue: StudyCue, offset: number, delayMs: number, maxSeconds?: number) => () => void;
}) => {
  const playback = useBattlePlayback(story.catalog, responseFor(story));
  const [selectedMoveId, selectMove] = useState(story.selectedMoveId);
  const [inspectedPokemonId, inspectPokemon] = useState(story.inspectedPokemonId);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (isAudioStory(story.id) && !studyPlaying) return;
    const events = story.sequence?.events || (story.playing ? [story.playing.event] : []);
    if (!story.sequence && !story.playing) return;
    const revision = story.battle.revision + 1;
    playback.receive({ ...responseFor(story), revision, stateId: `story:${revision}`,
      view: story.sequence?.finalView || (story.playing ? applyEventView(story.battle.view, story.playing.event) : story.battle.view),
      updates: [{ revision, action: { action: "skipTurn" }, events, log: [] }] });
  }, [story, studyPlaying, playback.receive]);
  useEffect(() => {
    if (!isAudioStory(story.id) || !studyPlaying ||
      !playback.playing || playback.waitingForArt) return;
    const timing = timingForFrame(playback.playing, generation, playback.reducedMotion, story.catalog);
    if (!timing) return;
    const offset = isMoveCue(timing.cue) ? excerptStart : 0;
    let stop: (() => void) | undefined;
    // Defer once so StrictMode's development effect probe cannot leave a duplicate cue playing.
    const timer = window.setTimeout(() => { stop = playCue(timing.cue, offset, timing.delayMs, timing.maxSeconds); }, 0);
    return () => { window.clearTimeout(timer); stop?.(); };
  }, [story.id, studyPlaying, playback.playing?.id, playback.waitingForArt, playback.reducedMotion,
    generation, excerptStart, playCue]);
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
  const [studyPlaying, setStudyPlaying] = useState(false);
  const [generation, setGeneration] = useState<StudyGeneration>(5);
  const [excerptStart, setExcerptStart] = useState(() => defaultExcerptStart(story.id, 5));
  const playRequest = useRef(0);
  const audio = useAudioStudy();
  const playStudyCue = useCallback((cue: StudyCue, offset: number, delayMs: number, maxSeconds?: number) =>
    audio.play(cue, offset, delayMs, maxSeconds), [audio.play]);
  const changeLabSelection = (next: VfxLabSelection) => {
    playRequest.current++;
    setLabSelection(next);
    setStory(makeBattleStory("vfx", next));
    setReplayKey(current => current + 1);
    window.history.replaceState(null, "", vfxLabUrl(next));
  };
  const playStudy = async () => {
    const request = ++playRequest.current;
    audio.stop();
    if (!await audio.prepare(cuesForStory(story.id, generation))) return;
    if (request !== playRequest.current) return;
    setStudyPlaying(true);
    setReplayKey((current) => current + 1);
  };
  const playSelect = async () => {
    if (await audio.prepare(["select"])) audio.play("select");
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
      {isAudioStory(story.id) && <fieldset className="battle-audio-study"><legend>Local audio study</legend>
        {isMoveAudioStory(story.id) && <><label>Generation<select value={generation} onChange={(event) => {
          playRequest.current++;
          audio.stop();
          setStudyPlaying(false);
          const next = Number(event.target.value) as StudyGeneration;
          setGeneration(next);
          setExcerptStart(defaultExcerptStart(story.id, next));
          setReplayKey((current) => current + 1);
        }}><option value={4}>Gen 4</option><option value={5}>Gen 5</option></select></label>
        <label>Move start <input type="range" min="0" max={maxExcerptStart(story.id, generation)}
          step="0.05" value={excerptStart} onChange={(event) => {
            playRequest.current++;
            audio.stop();
            setStudyPlaying(false);
            setExcerptStart(Number(event.target.value));
            setReplayKey((current) => current + 1);
          }} />{excerptStart.toFixed(2)}s</label></>}
        <label>SFX volume<input type="range" min="0" max="1" step="0.05" value={audio.volume}
          onChange={(event) => audio.setVolume(Number(event.target.value))} /></label>
        <label><input type="checkbox" checked={audio.muted}
          onChange={(event) => audio.setMuted(event.target.checked)} />Mute</label>
        <button type="button" disabled={audio.loading} onClick={() => { void playSelect(); }}>Play select</button>
        <button type="button" disabled={audio.loading} onClick={() => { void playStudy(); }}>
          {audio.loading ? "Loading sounds…" : "Play action"}</button>
        <small>{isMoveAudioStory(story.id)
          ? "Move audio starts after the Pokémon reaches position; results follow their reached battle frames."
          : "Status and stat sounds start with their result reaction. Cure and effect removal are quiet in this study."}</small>
        {audio.error && <span role="alert">{audio.error}</span>}
      </fieldset>}
      {!isAudioStory(story.id) && (story.playing || story.sequence) && <button type="button" onClick={() => {
        setReplayKey((current) => current + 1);
      }}>Replay action</button>}
    </section>
    <StoryScreen key={`${story.id}-${replayKey}`} story={story} studyPlaying={studyPlaying}
      generation={generation} excerptStart={excerptStart}
      playCue={playStudyCue} />
  </div>;
};
