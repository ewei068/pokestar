import type { CSSProperties, PointerEventHandler } from "react";
import type { Party } from "../player/types";
import { PokemonSprite } from "../battles/arena/PokemonSprite";

export const partyTargets = (party: Party, id: string) => party.targets[id] || (party.slots.some(member => member?.id === id) ? undefined : party.targets.new);

export type PartyViewProps = {
  party: Party; selectedId: string | null; placingId: string | null;
  readOnly?: boolean;
  pending: boolean; mode: "move" | "remove" | null;
  onSlot: (index: number) => void;
  onPointerDown?: PointerEventHandler<HTMLButtonElement>;
};
/** Engine slot identity stays unchanged when CSS rotates the formation on phones. */
export function PartyView({ party, selectedId, placingId, pending, mode, onSlot, onPointerDown, readOnly = false }: PartyViewProps) {
  return <div className="collection-formation" style={{ "--rows": party.rows, "--cols": party.cols } as CSSProperties}>
    {party.slots.map((pokemon, index) => {
      const target = placingId ? partyTargets(party, placingId)?.[index] : undefined;
      const disabled = (readOnly && !pokemon) || pending || (placingId ? !target || target.kind === "disabled" : mode ? !pokemon : false);
      const reason = placingId ? target?.reason || (!target ? "Refresh to check this position." : "") : "";
      return <button key={index} type="button" data-slot={index} data-pokemon={pokemon?.id} data-origin="party"
        className={`collection-slot ${placingId ? disabled ? "is-invalid" : "is-eligible" : ""}`}
        style={{ "--row": Math.floor(index / party.cols), "--col": index % party.cols } as CSSProperties}
        aria-label={`Position ${index + 1}, ${pokemon?.name || "empty"}${reason ? `, ${reason}` : ""}`}
        aria-pressed={pokemon?.id === selectedId} aria-disabled={disabled} title={reason || pokemon?.name}
        onClick={() => { if (!disabled) onSlot(index); }} onPointerDown={pending ? undefined : onPointerDown}>
        {pokemon ? <><span className="collection-slot-name">{pokemon.name}</span><small>Lv. {pokemon.level}</small>
          <span className="collection-party-sprite"><PokemonSprite src={pokemon.spriteUrl || undefined} flipped /></span>
          {!readOnly && <span className="collection-drag-handle" aria-hidden="true">⠿</span>}</> : <span className="collection-empty-slot">{readOnly ? "—" : "+"}</span>}
        <span className="collection-slot-number">{index + 1}</span>
      </button>;
    })}
  </div>;
}
