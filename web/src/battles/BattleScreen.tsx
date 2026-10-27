import { useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { transitionDuration } from "./results/transitions";
import { BattleLog } from "./results/BattleLog";
import { effectColors, resultAnimationConfig } from "./results/config";
import { BattleGrid } from "./BattleGrid";
import { BattleInspector } from "./BattleInspector";
import type { InspectDetail } from "./BattleInspector";
import { highlightedPokemonId } from "./eventPresentation";
import { MovePanel } from "./MovePanel";
import { battleCopy } from "./copy";
import { moveEventFootprint, targetPreviewFor, teamDisplayName } from "./presentation";
import { useTargetConfirmation } from "./useTargetConfirmation";
import type { BattleCatalog } from "./types";
import type { BattleSession } from "./useBattleSession";
import type { BattleAudio } from "./audio/useBattleAudio";
import type { BattleMusic } from "./audio/useBattleMusic";
import "./battle-ui.css";

export const BattleScreen = ({ catalog, session, audio, music }: {
  catalog: BattleCatalog;
  session: BattleSession;
  audio?: BattleAudio;
  music?: BattleMusic;
}) => {
  const {
    battle, loading, busy, error, notice, selectedMoveId, inspectedPokemonId,
    playing, history, skipPlayback, waitingForArt, reducedMotion, refresh, selectMove, inspectPokemon, targetPokemon, skipTurn,
  } = session;
  const [hoveredPokemonId, setHoveredPokemonId] = useState<string | null>(null);
  const [hoveredMoveId, setHoveredMoveId] = useState<string | null>(null);
  const [inspectorFocus, setInspectorFocus] = useState<"pokemon" | "move">("pokemon");
  const [detail, setDetail] = useState<InspectDetail | null>(null);
  const [trayCollapsed, setTrayCollapsed] = useState(false);
  const versionMatches = battle?.rulesetVersion === catalog.rulesetVersion;
  const selected = battle?.availableActions.moves.find((option) => option.moveId === selectedMoveId);
  const canChoose = !!battle && battle.isMyTurn && !busy && !playing && versionMatches && battle.status === "active";
  const targetIds = canChoose ? selected?.targetPokemonIds || [] : [];
  const targetingScope = canChoose && selected ? JSON.stringify([
    battle.battleId, battle.revision, battle.view.activePokemonId, selectedMoveId,
  ]) : null;
  const confirmation = useTargetConfirmation(targetingScope, targetIds, targetPokemon);
  const playInteraction = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    if (target.closest?.("button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), summary"))
      void audio?.playSelect();
  };

  if (loading && !battle) return <div className="battle-surface"><main className="page-shell"><p>Loading battle…</p></main></div>;
  if (!battle) return <div className="battle-surface" onClickCapture={playInteraction}><main className="page-shell">
    <a className="back-link" href={import.meta.env.BASE_URL}>← Battles</a>
    <p role="alert">{error || "Battle unavailable."}</p>
    <button type="button" onClick={() => { void refresh(); }}>Retry</button>
  </main></div>;

  const displayView = playing ? (waitingForArt ? playing.previousView : playing.view) : battle.view;
  const previewId = confirmation.pendingTargetId || (hoveredPokemonId && targetIds.includes(hoveredPokemonId) ? hoveredPokemonId : null);
  const targetPreview = canChoose ? targetPreviewFor(displayView, selected, previewId) : null;
  const event = playing?.stage === "event" && !waitingForArt ? playing.event : undefined;
  const eventFootprint = moveEventFootprint(displayView, event);
  const patternTiles = eventFootprint?.patternTiles || targetPreview?.patternTiles || [];
  const affectedIds = eventFootprint?.affectedPokemonIds || targetPreview?.affectedPokemonIds || [];
  const primaryTargetId = eventFootprint
    ? eventFootprint.primaryTargetPokemonId : targetPreview?.primaryTargetPokemonId || null;
  const inspected = displayView.pokemon[
    hoveredPokemonId || inspectedPokemonId || displayView.activePokemonId || ""
  ] || null;
  const inspectorMoveId = hoveredPokemonId ? null
    : hoveredMoveId || (inspectorFocus === "move" ? selectedMoveId : null);
  const teamNames = Object.keys(displayView.teams);
  const ownNames = teamNames.filter((name) => battle.myTeamNames.includes(name));
  const rivalNames = teamNames.filter((name) => !battle.myTeamNames.includes(name));
  const weatherIcon: Record<string, string> = { Sun: "☀", Rain: "☂", Sandstorm: "◌", Hail: "❄" };

  const chooseMove = (moveId: string | null) => {
    confirmation.clear();
    setHoveredPokemonId(null);
    setHoveredMoveId(null);
    setDetail(null);
    setInspectorFocus(moveId ? "move" : "pokemon");
    selectMove(moveId);
  };
  const inspect = (id: string) => {
    setHoveredMoveId(null);
    setDetail(null);
    setInspectorFocus("pokemon");
    inspectPokemon(id);
  };
  const chooseTarget = (id: string, pointerType: string) => {
    if (!canChoose || !targetIds.includes(id)) return;
    setHoveredMoveId(null);
    setDetail(null);
    setInspectorFocus("pokemon");
    inspectPokemon(id);
    confirmation.choose(id, pointerType);
  };
  return <div className="battle-surface" onClickCapture={playInteraction}
    data-playback-stage={playing?.stage || "idle"}
    data-playback-event={playing?.event.type || ""} style={{
    "--state-duration": `${!reducedMotion && playing ? transitionDuration(playing.changes) : 0}ms`,
    "--state-easing": resultAnimationConfig.transition.easing,
    ...Object.fromEntries(Object.entries(effectColors).flatMap(([kind, colors]) => [
      [`--arena-${kind}-color`, colors.main], [`--arena-${kind}-background`, colors.light], [`--arena-${kind}-border`, colors.border],
    ])),
  } as CSSProperties}><main className="page-shell arena-page">
    <div className="arena-toolbar"><a className="back-link" href={import.meta.env.BASE_URL}>← Battles</a>
      <span className="arena-debug">Debug · Battle {battle.battleId.slice(0, 8)} · Revision {playing?.revision ?? battle.revision}</span>
      {music?.showControls && music.trackTitle && <div className="arena-music-control">
        <span title={music.trackTitle}>♫ {music.trackTitle}</span>
        <button type="button" onClick={() => { void music.toggle(); }}>
          {music.playing ? "Pause music" : "Play music"}</button>
      </div>}</div>
    {audio?.error && <p role="alert" className="error">{audio.error}</p>}
    {music?.error && <p role="alert" className="error">{music.error}</p>}
    <div className="arena-title"><div><small>{battle.mode.type || "Battle"} · TURN {displayView.turn}</small>
      <h1>{ownNames.map(name => teamDisplayName(displayView, name)).join(" & ") || "Your team"} <span className="arena-versus">VS</span> {rivalNames.map(name => teamDisplayName(displayView, name)).join(" & ") || "Opponents"}</h1></div>
      {displayView.weather?.weatherId && <div className={`arena-weather ${playing?.changes.weather ? "is-state-changing" : ""}`} title="Battle weather">
        {weatherIcon[displayView.weather.weatherId] || "◌"}
        <span>{displayView.weather.weatherId}<small>{displayView.weather.duration} {displayView.weather.duration === 1 ? "turn" : "turns"}</small></span></div>}
    </div>
    {displayView.ended && <p className="notice">{displayView.winner ? `${teamDisplayName(displayView, displayView.winner)} won the battle!` : "The battle ended in a draw."} {battleCopy.battleEnded}</p>}
    {!playing && battle.completionStatus === "processing" && <p className="notice">{battleCopy.rewardsPending}</p>}
    {!playing && battle.completionStatus === "failed" && <p className="notice">{battleCopy.rewardsFailed}</p>}
    {!versionMatches && <p role="alert" className="error">{battleCopy.battleOutdated}</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {notice && <p role="status" className="notice">{notice}</p>}
    <div className="arena-layout"><div className="arena-primary">
      <BattleGrid view={displayView} ownTeamNames={battle.myTeamNames} catalog={catalog}
        targetIds={targetIds} primaryTargetId={primaryTargetId} patternTiles={patternTiles}
        affectedIds={affectedIds} playback={!!eventFootprint} motionEvent={event?.type === "moveStarted" ? event : undefined}
        resultFrame={waitingForArt ? undefined : playing || undefined} reducedMotion={reducedMotion}
        highlightedId={highlightedPokemonId(event)}
        onChooseTarget={chooseTarget} onInspect={inspect} onHover={setHoveredPokemonId} />
      <BattleLog entries={history} playing={!!playing} onSkip={() => { audio?.stopAll(); skipPlayback(); }} />
    </div><aside className="arena-sidebar">
      <MovePanel view={displayView} availableActions={battle.availableActions} isMyTurn={!playing && battle.isMyTurn} playback={!!playing}
        catalog={catalog} selectedMoveId={selectedMoveId}
        preview={targetPreview} busy={!canChoose} submitting={busy} collapsed={trayCollapsed}
        onToggleCollapsed={() => setTrayCollapsed((current) => !current)}
        confirming={!!confirmation.pendingTargetId} onConfirm={confirmation.confirm}
        onSelectMove={chooseMove} onHoverMove={setHoveredMoveId} onSkip={skipTurn} />
      <BattleInspector pokemon={inspected} moveId={inspectorMoveId} detail={detail}
        teamLabel={inspected ? teamDisplayName(displayView, inspected.teamName) : undefined}
        catalog={catalog} onOpenDetail={(next) => { setHoveredMoveId(null); setDetail(next); }}
        onBack={() => setDetail(null)} />
    </aside></div>
  </main></div>;
};
