import { BattleGrid } from "./BattleGrid";
import { highlightedPokemonId } from "./eventText";
import { MovePanel } from "./MovePanel";
import type { BattleCatalog } from "./types";
import type { BattleSession } from "./useBattleSession";

export const BattleScreen = ({ catalog, session }: {
  catalog: BattleCatalog;
  session: BattleSession;
}) => {
  const {
    battle, loading, busy, error, notice, selectedMoveId, inspectedPokemonId,
    playing, history, refresh, selectMove, inspectPokemon, targetPokemon, skipTurn,
  } = session;
  const versionMatches = !battle || battle.rulesetVersion === catalog.rulesetVersion;

  if (loading && !battle) return <main className="page-shell"><p>Loading battle…</p></main>;
  if (!battle) return (
    <main className="page-shell">
      <a className="back-link" href={import.meta.env.BASE_URL}>← Battles</a>
      <p role="alert">{error || "Battle unavailable."}</p>
      <button type="button" onClick={() => { void refresh(); }}>Retry</button>
    </main>
  );

  const selected = battle.availableActions.moves.find((option) => option.moveId === selectedMoveId);
  const targetIds = selected?.targetPokemonIds || [];
  const displayView = playing ? playing.view : battle.view;

  const inspected = displayView.pokemon[
    inspectedPokemonId || displayView.activePokemonId || ""
  ];

  return (
    <main className="page-shell battle-page">
      <div className="page-toolbar">
        <a className="back-link" href={import.meta.env.BASE_URL}>← Battles</a>
        <span className="revision">Battle {battle.battleId.slice(0, 8)} · Revision {battle.revision}</span>
      </div>
      <div className="battle-header">
        <div><p className="eyebrow">{battle.mode.type || "Battle"}</p><h1>Turn {displayView.turn}</h1></div>
        <span className={`status-pill ${battle.status}`}>{battle.status}</span>
      </div>
      {battle.status === "completed" && <p className="notice">{battle.view.winner || "A team"} won. This result is read-only.</p>}
      {battle.completionStatus === "processing" && <p className="notice">Battle rewards are being processed.</p>}
      {battle.completionStatus === "failed" && <p className="notice">Reward processing needs review. The battle result is saved.</p>}
      {!versionMatches && <p role="alert" className="error">Battle display data changed. Reload the page before acting.</p>}
      {error && <p role="alert" className="error">{error}</p>}
      {notice && <p role="status" className="notice">{notice}</p>}
      <div className="event-banner" aria-live="polite">{playing?.text || (battle.isMyTurn ? "Choose an action." : "Waiting for the next action…")}</div>
      <BattleGrid view={displayView} ownTeamNames={battle.myTeamNames} catalog={catalog}
        targetIds={busy || playing || !versionMatches ? [] : targetIds}
        highlightedId={highlightedPokemonId(playing?.event)}
        onInspect={inspectPokemon}
        onTarget={targetPokemon} />
      {inspected && <section className="detail-panel" aria-label="Pokémon details">
        <div><p className="eyebrow">Pokémon details</p><h2>{inspected.name} · Lv. {inspected.level}</h2>
          <p className="quiet">{[inspected.type1, inspected.type2].filter(Boolean).join(" / ")} · {
            inspected.hp}/{inspected.maxHp} HP · {inspected.status?.statusId || "No status"}</p></div>
        <div className="detail-tags">
          {Object.keys(inspected.effectIds).map((id) => <span key={id}>{catalog.effects[id]?.name || id}</span>)}
          {inspected.abilityId && <span>Ability: {catalog.abilities[inspected.abilityId]?.name || inspected.abilityId}</span>}
          {inspected.heldItemId && <span>Item: {catalog.heldItems[inspected.heldItemId]?.name || inspected.heldItemId}</span>}
          {inspected.moveIds && <span>Moves: {Object.keys(inspected.moveIds)
            .map((id) => catalog.moves[id]?.name || id).join(", ")}</span>}
        </div>
      </section>}
      <div className="battle-lower">
        <MovePanel view={displayView} availableActions={battle.availableActions} isMyTurn={battle.isMyTurn}
          catalog={catalog} selectedMoveId={selectedMoveId}
          busy={busy || !!playing || !versionMatches} onSelectMove={selectMove}
          onSkip={skipTurn} />
        <section className="history-panel">
          <h2>Recent actions</h2>
          {history.length === 0 ? <p className="quiet">New actions will appear here.</p> : (
            <ol>{[...history].reverse().map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}</ol>
          )}
        </section>
      </div>
    </main>
  );
};
