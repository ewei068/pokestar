import { useId } from "react";
import { CollectionArtwork } from "../collection/CollectionArtwork";
import { TypeBadge } from "../components/TypeBadge";
import type { PokemonBuildContext } from "../player/types";
import { NatureEditor } from "./NatureEditor";

export type ItemNaturePanelProps = {
  context: PokemonBuildContext | undefined;
  natureId: string;
  onNatureChange: (id: string) => void;
  onChangeNature: () => void;
  onHeldItemChange: (id: string | null) => void;
  pending: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
};
export function ItemNaturePanel({ context, natureId, onNatureChange, onChangeNature, onHeldItemChange,
  pending, loading, refreshing, error, onRefresh }: ItemNaturePanelProps) {
  const itemId = useId();
  const refresh = <button className="ui-button" disabled={pending || refreshing} onClick={onRefresh}>Refresh Pokémon &amp; Bag</button>;
  if (!context) return <section className="ui-panel build-state" aria-busy={loading}>
    <h2>{loading ? "Loading Pokémon…" : "Item & nature unavailable."}</h2>
    {error && <p role="alert">{error}</p>}{!loading && refresh}
  </section>;
  const disabled = pending || refreshing || Boolean(error);
  const { pokemon, heldItems } = context;
  const owned = heldItems.filter(item => item.quantity > 0);
  const selected = context.natures.find(nature => nature.id === natureId);
  const sameNature = natureId === pokemon.nature.id;
  const noMint = context.mintQuantity < context.mintCost;
  return <div className="item-nature ui-controls">
    {error && <div className="build-notice" role="alert"><p>{error}</p>{refresh}</div>}
    {pending && <p role="status">Saving…</p>}
    <div className="ui-panel build-identity"><CollectionArtwork src={pokemon.spriteUrl} />
      <div><h2>{pokemon.name}</h2><p>Lv. {pokemon.level} · {pokemon.speciesName}{pokemon.inParty ? " · In party" : ""}</p>
        <div className="ui-badge-list">{pokemon.types.map(type => <TypeBadge key={type} type={type} />)}</div></div></div>
    <div className="item-nature-layout">
      <section className="ui-panel build-card" aria-label="Held item"><header className="ui-panel-heading"><h2>Held item</h2></header>
        <div className="build-card-body"><p className="build-current-label">Holding</p><h3>{pokemon.heldItem?.name || "None"}</h3>
          <p className="build-effect">{pokemon.heldItem?.description || "This Pokémon isn’t holding an item."}</p>
          {owned.length ? <><label className="build-field" htmlFor={itemId}>Give from Bag</label>
            <select id={itemId} value="" disabled={disabled} onChange={event => { if (event.target.value) onHeldItemChange(event.target.value); }}>
              <option value="">Choose an item…</option>{owned.map(item => <option key={item.id} value={item.id} disabled={item.id === pokemon.heldItemId}>
                {item.name} · Owned: {item.quantity}{item.id === pokemon.heldItemId ? " · Holding" : ""}
              </option>)}</select></> : <p>No spare held items in your Bag.</p>}
          <div className="build-actions"><button className="ui-button" disabled={disabled || pokemon.heldItemId === null}
            onClick={() => onHeldItemChange(null)}>Remove</button></div>
        </div>
      </section>
      <section className="ui-panel build-card" aria-label="Nature"><header className="ui-panel-heading"><h2>Nature</h2></header>
        <div className="build-card-body"><NatureEditor context={context} natureId={natureId} onNatureChange={onNatureChange} disabled={disabled}>
          <div className="build-cost"><span>{context.mintCost} Mint{context.mintCost === 1 ? "" : "s"}</span><small>Owned: {context.mintQuantity}</small></div>
          {noMint ? <p>You need a Mint to change nature.</p> : sameNature ? <p>This is already the current nature.</p> : null}
          <div className="build-actions"><button className="ui-button ui-button--primary" onClick={onChangeNature}
            disabled={disabled || !selected || sameNature || noMint}>Change nature</button></div>
        </NatureEditor></div>
      </section>
    </div>
  </div>;
}
