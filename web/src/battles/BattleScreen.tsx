import { useState } from "react";
import { BattleGrid } from "./BattleGrid";
import { BattleInspector } from "./BattleInspector";
import type { InspectDetail } from "./BattleInspector";
import { highlightedPokemonId } from "./eventText";
import { MovePanel } from "./MovePanel";
import { moveEventFootprint, targetPreviewFor } from "./presentation";
import type { BattleCatalog, BattleView } from "./types";
import type { BattleSession } from "./useBattleSession";
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

export const BattleScreen = ({ catalog, session }: {
  catalog: BattleCatalog;
  session: BattleSession;
}) => {
  const {
    battle, loading, busy, error, notice, selectedMoveId, inspectedPokemonId,
    playing, history, refresh, selectMove, inspectPokemon, targetPokemon, skipTurn,
  } = session;
  const [hoveredPokemonId, setHoveredPokemonId] = useState<string | null>(null);
  const [hoveredMoveId, setHoveredMoveId] = useState<string | null>(null);
  const [inspectorFocus, setInspectorFocus] = useState<"pokemon" | "move">("pokemon");
  const [detail, setDetail] = useState<InspectDetail | null>(null);
  const [trayCollapsed, setTrayCollapsed] = useState(false);

  if (loading && !battle) return <div className="battle-surface"><main className="page-shell"><p>Loading battle…</p></main></div>;
  if (!battle) return <div className="battle-surface"><main className="page-shell">
    <a className="back-link" href={import.meta.env.BASE_URL}>← Battles</a>
    <p role="alert">{error || "Battle unavailable."}</p>
    <button type="button" onClick={() => { void refresh(); }}>Retry</button>
  </main></div>;

  const versionMatches = battle.rulesetVersion === catalog.rulesetVersion;
  const displayView = playing ? playing.view : battle.view;
  const selected = battle.availableActions.moves.find((option) => option.moveId === selectedMoveId);
  const canChoose = !busy && !playing && versionMatches && battle.status === "active";
  const targetIds = canChoose ? selected?.targetPokemonIds || [] : [];
  const previewId = hoveredPokemonId && targetIds.includes(hoveredPokemonId) ? hoveredPokemonId : null;
  const targetPreview = canChoose ? targetPreviewFor(displayView, selected, previewId) : null;
  const event = playing?.event;
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

  return <div className="battle-surface"><main className="page-shell arena-page">
    <div className="arena-toolbar"><a className="back-link" href={import.meta.env.BASE_URL}>← Battles</a>
      <span>Battle {battle.battleId.slice(0, 8)} · Revision {battle.revision}</span></div>
    <div className="arena-title"><div><small>{battle.mode.type || "Battle"} · TURN {displayView.turn}</small>
      <h1>{ownNames.join(" & ") || "Your team"} <em>vs</em> {rivalNames.join(" & ") || "Opponents"}</h1></div>
      {displayView.weather?.weatherId && <div className="arena-weather" title="Battle weather">
        {weatherIcon[displayView.weather.weatherId] || "◌"}
        <span>{displayView.weather.weatherId}<small>{displayView.weather.duration} turns</small></span></div>}
    </div>
    {battle.status === "completed" && <p className="notice">{battle.view.winner || "A team"} won. This result is read-only.</p>}
    {battle.completionStatus === "processing" && <p className="notice">Battle rewards are being processed.</p>}
    {battle.completionStatus === "failed" && <p className="notice">Reward processing needs review. The battle result is saved.</p>}
    {!versionMatches && <p role="alert" className="error">Battle display data changed. Reload the page before acting.</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {notice && <p role="status" className="notice">{notice}</p>}
    <div className="arena-layout"><div className="arena-primary">
      <BattleGrid view={displayView} ownTeamNames={battle.myTeamNames} catalog={catalog}
        targetIds={targetIds} primaryTargetId={primaryTargetId} patternTiles={patternTiles}
        affectedIds={affectedIds} playback={!!eventFootprint} highlightedId={highlightedPokemonId(event)}
        onChooseTarget={chooseTarget} onInspect={inspect} onHover={setHoveredPokemonId} />
      <div className="arena-event" aria-live="polite"><span aria-hidden="true">✦</span>
        <strong>{playing?.text || (targetPreview ? `Pattern reaches ${targetPreview.affectedPokemonIds.length} Pokémon and ${
            targetPreview.emptyTileTargets.length} empty tiles${targetPreview.random ? "; final target is random" : ""}.`
          : battle.isMyTurn ? "Choose an action." : "Waiting for the next action…")}</strong>
        <small>Turn {displayView.turn}</small></div>
      <section className="arena-history"><div className="arena-section-heading"><h2>Recent actions</h2></div>
        {history.length === 0 ? <p className="arena-muted">New actions will appear here.</p>
          : <ol>{[...history].reverse().map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}</ol>}
      </section>
      <ReadinessRail view={displayView} catalog={catalog} ownTeams={battle.myTeamNames} />
    </div><aside className="arena-sidebar">
      <MovePanel view={displayView} availableActions={battle.availableActions} isMyTurn={battle.isMyTurn}
        catalog={catalog} selectedMoveId={selectedMoveId}
        preview={targetPreview} busy={!canChoose} collapsed={trayCollapsed}
        onToggleCollapsed={() => setTrayCollapsed((current) => !current)}
        onSelectMove={chooseMove} onHoverMove={setHoveredMoveId} onSkip={skipTurn} />
      <BattleInspector pokemon={inspected} moveId={inspectorMoveId} detail={detail}
        catalog={catalog} onOpenDetail={(next) => { setHoveredMoveId(null); setDetail(next); }}
        onBack={() => setDetail(null)} />
    </aside></div>
  </main></div>;
};
