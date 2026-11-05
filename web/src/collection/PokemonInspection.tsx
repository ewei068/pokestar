import { useState } from "react";
import type { PokemonDetail, PokemonSummary } from "../player/types";
import { CollectionArtwork } from "./CollectionArtwork";
import { TypeBadge } from "../components/TypeBadge";
import { MoveInspection } from "../components/MoveInspection";

export function PokemonInspection({ pokemon, inParty, pending, onAdd, loading }: {
  pokemon: PokemonSummary | PokemonDetail; loading?: boolean; inParty: boolean; pending: boolean; onAdd: () => void;
}) {
  const detail = "stats" in pokemon ? pokemon : undefined;
  const [tab, setTab] = useState("stats");
  return <div className="collection-inspection">
    <div className="collection-identity"><CollectionArtwork src={pokemon.spriteUrl} />
      <div><h3>{pokemon.name}</h3><p>Lv. {pokemon.level} · {pokemon.rarity}{pokemon.shiny ? " · Shiny" : ""}</p>
        <div className="ui-badge-list">{pokemon.types.map(type => <TypeBadge key={type} type={type} />)}</div></div></div>
    <div className="collection-inspect-summary"><span>CP {pokemon.combatPower.toLocaleString()}</span><span>IV {pokemon.ivPercent}%</span><span>{inParty ? "In party" : "In collection"}</span></div>
    <div className="collection-inspect-actions">{!inParty && <button className="ui-button ui-button--primary collection-primary" disabled={pending} onClick={onAdd}>Add to party</button>}
      <button disabled title="Training is coming later.">Train · Later</button></div>
    <label className="collection-exp" style={{ visibility: detail?.exp ? "visible" : "hidden" }} aria-hidden={!detail?.exp}>EXP {detail?.exp?.current ?? "—"} / {detail?.exp?.required ?? "—"}<progress value={detail?.exp?.current || 0} max={Math.max(1, detail?.exp?.required || 1)} /></label>
    <div className="collection-inspect-tabs">{["stats", "moves", "about"].map(value => <button key={value} aria-pressed={tab === value} onClick={() => setTab(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div>
    <p className="collection-detail-status" role="status">{detail ? "" : loading ? "Loading details…" : "Details unavailable. Refresh to try again."}</p>
    {tab === "stats" && <div className="collection-inspect-section"><p>Nature: {detail?.nature.name || "—"}</p><table><thead><tr><th>Stat</th><th>Total</th><th>IV</th><th>EV</th></tr></thead><tbody>
      {["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"].map((name, i) => {
        const raised = detail?.nature.raisedStat === i && detail?.nature.loweredStat !== i;
        const lowered = detail?.nature.loweredStat === i && detail?.nature.raisedStat !== i;
        return <tr key={name} className={raised ? "is-raised" : lowered ? "is-lowered" : ""}><th>{name}{raised ? " +" : lowered ? " −" : ""}</th><td>{detail?.stats[i] ?? "—"}</td><td>{detail?.ivs[i] ?? "—"}</td><td>{detail?.evs[i] ?? "—"}</td></tr>;
      })}</tbody></table></div>}
    {tab === "moves" && <div className="collection-inspect-section">{(detail?.moves || []).map(move => <article key={move.id}><MoveInspection move={move} type={move.type} /></article>)}{detail && !detail.moves.length && <p>No moves.</p>}</div>}
    {tab === "about" && <div className="collection-inspect-section"><h3>Ability</h3><span className="ui-badge" data-kind="ability">{detail ? detail.ability?.name || "None" : "—"}</span><p>{detail?.ability?.description}</p><h3>Held item</h3><span className="ui-badge" data-kind="item">{detail ? detail.heldItem?.name || "None" : "—"}</span><p>{detail?.heldItem?.description}</p><p>{pokemon.speciesName}</p><small>ID: {pokemon.id}</small></div>}
  </div>;
}
