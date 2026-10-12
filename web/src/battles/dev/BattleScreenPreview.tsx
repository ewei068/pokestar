/** Development-only stories render the production screen without HTTP or game writes. */
import { useEffect, useRef, useState } from "react";
import { BattleScreen } from "../BattleScreen";
import { playbackDuration } from "../motion";
import type { PlaybackFrame } from "../playback";
import type { BattleSession } from "../useBattleSession";
import { makeBattleStory, storyDefinitions } from "./battleStories";
import "./story.css";

const requestedStory = new URLSearchParams(window.location.search).get("story");
const story = makeBattleStory(requestedStory);

export const BattleScreenPreview = () => {
  const [selectedMoveId, selectMove] = useState<string | null>(story.selectedMoveId);
  const [inspectedPokemonId, inspectPokemon] = useState<string | null>(story.inspectedPokemonId);
  const [playing, setPlaying] = useState<PlaybackFrame | null>(story.playing);
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(story.history);
  const [replayKey, setReplayKey] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach(window.clearTimeout); }, []);
  useEffect(() => {
    if (!story.playing) return;
    const timer = window.setTimeout(() => setPlaying(null), playbackDuration(story.playing!.event));
    return () => window.clearTimeout(timer);
  }, [replayKey]);

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
      timers.current.push(window.setTimeout(() => setPlaying(story.playing), playbackDuration(event)));
    },
    skipTurn: () => setNotice("Development story: no action was sent."),
  };

  return <div className="battle-story-page">
    <section className="battle-story-toolbar" aria-label="Battle story controls">
      <div><strong>Battle UI stories</strong><span>Development data · no server actions</span></div>
      <nav aria-label="Story scenarios">{storyDefinitions.map((definition) =>
        <a key={definition.id} href={`?previewBattle=1&story=${definition.id}`}
          aria-current={story.id === definition.id ? "page" : undefined}>{definition.title}</a>)}</nav>
      <p>{story.description}</p>
      {requestedStory && requestedStory !== story.id && <p role="status">Unknown story; showing {story.title}.</p>}
      {story.playing && <button type="button" onClick={() => {
        setPlaying(story.playing);
        setReplayKey((current) => current + 1);
      }}>Replay action</button>}
    </section>
    <BattleScreen key={`${story.id}-${replayKey}`} catalog={story.catalog} session={session} />
  </div>;
};
