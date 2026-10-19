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
import { moveEventFootprint, targetPreviewFor } from "./presentation";
import type { BattleCatalog, BattleView } from "./types";
import type { BattleSession } from "./useBattleSession";
import type { BattleAudio } from "./audio/useBattleAudio";
import "./battle-ui.css";

const ReadinessRail = ({ view, catalog, ownTeams }: {
  view: BattleView; catalog: BattleCatalog; ownTeams: string[];
}) => <section className="arena-readiness" aria-label="Combat readiness">
  <div><strong>⚡ Combat readiness</strong><small>Speed also affects turn order</small></div>
  <div className="arena-readiness-line">{Object.values(view.pokemon)
    .filter((entry) => !entry.isFainted)
    .sort((a, b) => b.combatReadiness - a.combatReadiness)
    .slice(0, 12).map((entry) => {
      const species = catalog.species[entry.speciesId];
      const sprite = entry.shiny ? species?.shinySprite : species?.sprite;
      return <span className={ownTeams.includes(entry.teamName) ? "is-own" : "is-enemy"} key={entry.id}
        title={`${entry.name}: ${Math.round(entry.combatReadiness)}% readiness`}>
        {sprite ? <img src={sprite} alt="" loading="lazy" /> : <span aria-hidden="true">⚡</span>}
        <small>{Math.round(entry.combatReadiness)}</small></span>;
    })}</div>
</section>;

export const BattleScreen = ({ catalog, session, audio }: {
  catalog: BattleCatalog;
  session: BattleSession;
  audio?: BattleAudio;
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

  const versionMatches = battle.rulesetVersion === catalog.rulesetVersion;
  const displayView = playing ? (waitingForArt ? playing.previousView : playing.view) : battle.view;
  const selected = battle.availableActions.moves.find((option) => option.moveId === selectedMoveId);
  const canChoose = !busy && !playing && versionMatches && battle.status === "active";
  const targetIds = canChoose ? selected?.targetPokemonIds || [] : [];
  const previewId = hoveredPokemonId && targetIds.includes(hoveredPokemonId) ? hoveredPokemonId : null;
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
    setHoveredPokemonId(null);
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
  const chooseTarget = (id: string) => {
    if (!canChoose || !targetIds.includes(id)) return;
    setHoveredMoveId(null);
    setDetail(null);
    setInspectorFocus("pokemon");
    inspectPokemon(id);
    targetPokemon(id);
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
      <span>Battle {battle.battleId.slice(0, 8)} · Revision {playing?.revision ?? battle.revision}</span>
      {audio?.available && <div className="arena-sound-controls" aria-label="Sound effects">
        <strong>SFX</strong>
        <label>Volume <input aria-label="SFX volume" type="range" min="0" max="1" step="0.05"
          value={audio.volume} onChange={(event) => audio.setVolume(Number(event.target.value))} /></label>
        <label><input type="checkbox" checked={audio.muted}
          onChange={(event) => audio.setMuted(event.target.checked)} />Mute</label>
      </div>}</div>
    {audio?.error && <p role="alert" className="error">{audio.error}</p>}
    <div className="arena-title"><div><small>{battle.mode.type || "Battle"} · TURN {displayView.turn}</small>
      <h1>{ownNames.join(" & ") || "Your team"} <em>vs</em> {rivalNames.join(" & ") || "Opponents"}</h1></div>
      {displayView.weather?.weatherId && <div className={`arena-weather ${playing?.changes.weather ? "is-state-changing" : ""}`} title="Battle weather">
        {weatherIcon[displayView.weather.weatherId] || "◌"}
        <span>{displayView.weather.weatherId}<small>{displayView.weather.duration} turns</small></span></div>}
    </div>
    {displayView.ended && <p className="notice">{displayView.winner ? `${displayView.winner} won.` : "The battle ended in a draw."} This result is read-only.</p>}
    {!playing && battle.completionStatus === "processing" && <p className="notice">Battle rewards are being processed.</p>}
    {!playing && battle.completionStatus === "failed" && <p className="notice">Reward processing needs review. The battle result is saved.</p>}
    {!versionMatches && <p role="alert" className="error">Battle display data changed. Reload the page before acting.</p>}
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
      <ReadinessRail view={displayView} catalog={catalog} ownTeams={battle.myTeamNames} />
    </div><aside className="arena-sidebar">
      <MovePanel view={displayView} availableActions={battle.availableActions} isMyTurn={!playing && battle.isMyTurn} playback={!!playing}
        catalog={catalog} selectedMoveId={selectedMoveId}
        preview={targetPreview} busy={!canChoose} submitting={busy} collapsed={trayCollapsed}
        onToggleCollapsed={() => setTrayCollapsed((current) => !current)}
        onSelectMove={chooseMove} onHoverMove={setHoveredMoveId} onSkip={skipTurn} />
      <BattleInspector pokemon={inspected} moveId={inspectorMoveId} detail={detail}
        catalog={catalog} onOpenDetail={(next) => { setHoveredMoveId(null); setDetail(next); }}
        onBack={() => setDetail(null)} />
    </aside></div>
  </main></div>;
};
