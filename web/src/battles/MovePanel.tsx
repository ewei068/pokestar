import type { BattleCatalog, BattleDisplay, TargetPreview } from "./types";
import { typeClass, typeName } from "./typeDisplay";

type Props = {
  view: BattleDisplay["view"];
  availableActions: BattleDisplay["availableActions"];
  isMyTurn: boolean;
  playback?: boolean;
  catalog: BattleCatalog;
  selectedMoveId: string | null;
  preview: TargetPreview | null;
  busy: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelectMove: (moveId: string | null) => void;
  onHoverMove: (moveId: string | null) => void;
  onSkip: () => void;
};

const moveKind = (damageType?: string) => damageType === "Physical" ? "⚔ PHY"
  : damageType === "Special" ? "✦ SPEC" : "◌ STATUS";

export const MovePanel = ({ view, availableActions, isMyTurn, catalog, selectedMoveId,
  preview, busy, playback, collapsed, onToggleCollapsed, onSelectMove,
  onHoverMove, onSkip }: Props) => {
  const active = view.activePokemonId ? view.pokemon[view.activePokemonId] : null;
  const moves = active?.moveIds || {};
  return <section className={`arena-commands ${collapsed ? "is-collapsed" : ""} ${isMyTurn ? "" : "is-waiting"}`} aria-label="Battle actions">
    <div className="arena-commands-heading"><div><h2>{playback ? "Battle playback" : "Choose an action"}</h2>
      <span>{playback ? "Playing battle events…" : isMyTurn ? `${active?.name || "Pokémon"}'s turn` : "Waiting for another turn"}</span></div>
      <button type="button" className="arena-collapse" aria-expanded={!collapsed}
        aria-controls="arena-command-body" onClick={onToggleCollapsed}>
        {collapsed ? "↑ Expand" : "↓ Collapse"}
      </button></div>
    <div id="arena-command-body" className="arena-command-body">
      {isMyTurn && Object.keys(moves).length > 0 ? <div className="arena-move-grid">
        {Object.entries(moves).map(([moveId, state]) => {
          const move = catalog.moves[moveId];
          const legal = availableActions.moves.find((option) => option.moveId === moveId);
          return <button type="button" key={moveId}
            className={`arena-move ${selectedMoveId === moveId ? "is-selected" : ""}`}
            disabled={!legal || busy} title={move?.description || ""}
            onClick={() => onSelectMove(selectedMoveId === moveId ? null : moveId)}
            onMouseEnter={() => onHoverMove(moveId)} onMouseLeave={() => onHoverMove(null)}
            onFocus={() => onHoverMove(moveId)} onBlur={() => onHoverMove(null)}>
            <span className="arena-move-name"><i className={`arena-type-dot ${typeClass(move?.type, catalog)}`} />
              <strong>{move?.name || moveId}</strong></span>
            <span className="arena-move-meta"><span className={`arena-type-label ${typeClass(move?.type, catalog)}`}>{move ? typeName(move.type, catalog) : "Move"}</span>
              <small>{state.cooldown > 0 ? `CD ${state.cooldown}` : state.disabledCounter > 0 ? "DISABLED" : moveKind(move?.damageType)}</small></span>
          </button>;
        })}
      </div> : <p className="arena-muted">{isMyTurn ? "No usable moves this turn." : "You can inspect the board while the battle continues."}</p>}
      <div className="arena-command-foot"><span aria-live="polite">{
        playback ? "Actions unlock when playback finishes" : preview
          ? `${preview.affectedPokemonIds.length} possible Pokémon · ${preview.emptyTileTargets.length} empty tiles${preview.random ? " · random result" : ""} · Click to use`
          : selectedMoveId ? "Click a highlighted target to use; click the move again to cancel"
            : "Select a move to see targets"
      }</span><div>
        <button type="button" className="arena-skip" disabled={!availableActions.canSkip || busy} onClick={onSkip}>↷ Skip</button>
      </div></div>
    </div>
  </section>;
};
