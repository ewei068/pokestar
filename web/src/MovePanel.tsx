import type { BattleCatalog, BattleResponse } from "./types";

type Props = {
  battle: BattleResponse;
  catalog: BattleCatalog;
  selectedMoveId: string | null;
  busy: boolean;
  onSelectMove: (moveId: string | null) => void;
  onSkip: () => void;
};

export const MovePanel = ({ battle, catalog, selectedMoveId, busy, onSelectMove, onSkip }: Props) => {
  const active = battle.view.activePokemonId
    ? battle.view.pokemon[battle.view.activePokemonId] : null;
  const moves = active?.moveIds || {};
  return (
    <section className="action-panel" aria-label="Battle actions">
      <div className="action-heading">
        <h2>Actions</h2>
        <span>{battle.isMyTurn ? `${active?.name || "Pokémon"}'s turn` : "Waiting for another turn"}</span>
      </div>
      {battle.isMyTurn && Object.keys(moves).length > 0 ? (
        <div className="move-list">
          {Object.entries(moves).map(([moveId, state]) => {
            const move = catalog.moves[moveId];
            const legal = battle.availableActions.moves.find((option) => option.moveId === moveId);
            return (
              <button
                type="button"
                key={moveId}
                className={`move-button ${selectedMoveId === moveId ? "selected" : ""}`}
                disabled={!legal || busy}
                onClick={() => onSelectMove(selectedMoveId === moveId ? null : moveId)}
                title={move?.description || ""}
              >
                <span className="move-primary"><strong>{move?.name || moveId}</strong><span>{move?.type || "Move"}</span></span>
                <span className="move-secondary">
                  {state.cooldown > 0 ? `Cooldown ${state.cooldown}`
                    : state.disabledCounter > 0 ? "Disabled"
                      : `${legal?.targetPokemonIds.length || 0} targets`}
                </span>
              </button>
            );
          })}
        </div>
      ) : <p className="quiet">{battle.isMyTurn ? "No usable moves this turn." : "You can review the board while the battle continues."}</p>}
      {selectedMoveId && <p className="selection-hint">Choose a highlighted Pokémon on the board.</p>}
      <button type="button" className="skip-button" disabled={!battle.availableActions.canSkip || busy} onClick={onSkip}>
        Skip turn
      </button>
    </section>
  );
};
