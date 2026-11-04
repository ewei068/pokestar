import { Chevron } from "../components/Chevron";
import { TypeBadge } from "../components/TypeBadge";
import type { BattleCatalog, BattleDisplay, TargetPreview } from "./types";
import { typeName } from "./typeDisplay";
import { battleCopy } from "./copy";

type Props = {
  view: BattleDisplay["view"];
  availableActions: BattleDisplay["availableActions"];
  isMyTurn: boolean;
  playback?: boolean;
  catalog: BattleCatalog;
  selectedMoveId: string | null;
  preview: TargetPreview | null;
  busy: boolean;
  submitting?: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelectMove: (moveId: string | null) => void;
  onHoverMove: (moveId: string | null) => void;
  confirming?: boolean;
  onConfirm?: () => void;
  onSkip: () => void;
};

const moveKind = (damageType?: string) => damageType === "Physical" ? "⚔ PHY"
  : damageType === "Special" ? "✦ SPEC" : "◌ STATUS";

export const MovePanel = ({ view, availableActions, isMyTurn, catalog, selectedMoveId,
  preview, busy, submitting, playback, collapsed, onToggleCollapsed, onSelectMove,
  onHoverMove, onSkip, confirming, onConfirm }: Props) => {
  const active = view.activePokemonId ? view.pokemon[view.activePokemonId] : null;
  const moves = active?.moveIds || {};
  const onlySkip = isMyTurn && availableActions.canSkip && availableActions.moves.length === 0;
  const targeting = isMyTurn && !!selectedMoveId && !view.ended && !playback;
  return <section className={`ui-panel arena-commands ${targeting ? "is-targeting" : ""} ${submitting ? "is-submitting" : ""} ${collapsed ? "is-collapsed" : ""} ${isMyTurn ? "" : "is-waiting"}`} aria-label="Battle actions">
    <div className="arena-commands-heading"><div><h2>{playback ? "Battle in progress" : view.ended ? "Battle finished"
      : isMyTurn ? `What will ${active?.name || "your Pokémon"} do?` : "Waiting for the next turn"}</h2>
      <span>{playback ? "Catching up with the battle…" : view.ended ? ""
        : isMyTurn ? "Your turn" : `${active?.name || "Pokémon"}'s turn`}</span></div>
      <button type="button" className="ui-button arena-collapse" aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand battle actions" : "Collapse battle actions"}
        aria-controls="arena-command-body" onClick={onToggleCollapsed}>
        <Chevron up={collapsed} /><span className="arena-collapse-label">{collapsed ? " Expand" : " Collapse"}</span>
      </button></div>
    <div id="arena-command-body" className="arena-command-body">
      {targeting ? <div className="arena-target-actions">
        {confirming && <button type="button" className="ui-button ui-button--primary arena-confirm" disabled={busy} onClick={onConfirm}>Confirm</button>}
        <button type="button" className="ui-button arena-cancel" disabled={busy} onClick={() => onSelectMove(null)}>Cancel</button>
      </div> : isMyTurn && Object.keys(moves).length > 0 ? <div className="arena-move-grid">
        {Object.entries(moves).map(([moveId, state]) => {
          const move = catalog.moves[moveId];
          const legal = availableActions.moves.find((option) => option.moveId === moveId);
          return <button type="button" key={moveId}
            className={`ui-button arena-move ${selectedMoveId === moveId ? "is-selected" : ""}`}
            disabled={!legal || busy} title={move?.description || ""}
            onClick={() => onSelectMove(selectedMoveId === moveId ? null : moveId)}
            onMouseEnter={() => onHoverMove(moveId)} onMouseLeave={() => onHoverMove(null)}
            onFocus={() => onHoverMove(moveId)} onBlur={() => onHoverMove(null)}>
            <span className="arena-move-name"><strong>{move?.name || moveId}</strong></span>
            <span className="arena-move-meta"><TypeBadge type={move ? typeName(move.type, catalog) : "Move"} />
              <small>{state.cooldown > 0 ? `CD ${state.cooldown}` : state.disabledCounter > 0 ? "DISABLED" : moveKind(move?.damageType)}</small></span>
          </button>;
        })}
      </div> : !view.ended && <p className="arena-muted">{isMyTurn ? "No usable moves this turn."
        : "You can inspect the board while the battle continues."}</p>}
      <div className="arena-command-foot"><span aria-live="polite">{
        submitting ? "Waiting for the result…" : playback ? "Wait for the battle to catch up."
          : view.ended ? "Choose a Pokémon to inspect it." : !isMyTurn ? "You can choose a move when it's your turn." : confirming
          ? "Tap this target again or Confirm. Cancel to inspect the board." : preview
          ? battleCopy.chooseTarget
          : onlySkip ? "No usable moves this turn." : selectedMoveId ? battleCopy.targetInstruction(catalog.moves[selectedMoveId]?.damageType)
            : "Choose a move to see its targets"
      }</span>{onlySkip && <div>
        <button type="button" className="ui-button ui-button--small arena-skip" disabled={busy} onClick={onSkip}>↷ Skip</button>
      </div>}</div>
    </div>
  </section>;
};
