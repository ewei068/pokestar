import { useState } from "react";
import type { PokemonDetail } from "../player/types";
import { CollectionArtwork } from "./CollectionArtwork";
import { MoveInspection } from "../components/MoveInspection";

export const TypeBadge = ({ type }: { type: string }) => <span className="collection-type" data-type={type}>{type}</span>;
export function PokemonInspection({ pokemon, inParty, pending, onAdd }: {
  pokemon: PokemonDetail; inParty: boolean; pending: boolean; onAdd: () => void;
}) {
  const [tab, setTab] = useState("stats");
  return <div className="collection-inspection">
    <div className="collection-identity"><CollectionArtwork src={pokemon.spriteUrl} />
      <div><h3>{pokemon.name}</h3><p>Lv. {pokemon.level} · {pokemon.rarity}{pokemon.shiny ? " · Shiny" : ""}</p>
        <div>{pokemon.types.map(type => <TypeBadge key={type} type={type} />)}</div></div></div>
    <div className="collection-inspect-summary"><span>CP {pokemon.combatPower.toLocaleString()}</span><span>IV {pokemon.ivPercent}%</span><span>{inParty ? "In party" : "In collection"}</span></div>
    <div className="collection-inspect-actions">{!inParty && <button className="collection-primary" disabled={pending} onClick={onAdd}>Add to party</button>}
      <button disabled title="Training is coming later.">Train · Later</button></div>
    {pokemon.exp && <label className="collection-exp">EXP {pokemon.exp.current} / {pokemon.exp.required}<progress value={pokemon.exp.current} max={Math.max(1, pokemon.exp.required)} /></label>}
    <div className="collection-inspect-tabs">{["stats", "moves", "about"].map(value => <button key={value} aria-pressed={tab === value} onClick={() => setTab(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div>
    {tab === "stats" && <div className="collection-inspect-section"><p>Nature: {pokemon.nature.name}</p><table><thead><tr><th>Stat</th><th>Total</th><th>IV</th><th>EV</th></tr></thead><tbody>
      {["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"].map((name, i) => {
        const raised = pokemon.nature.raisedStat === i && pokemon.nature.loweredStat !== i;
        const lowered = pokemon.nature.loweredStat === i && pokemon.nature.raisedStat !== i;
        return <tr key={name} className={raised ? "is-raised" : lowered ? "is-lowered" : ""}><th>{name}{raised ? " +" : lowered ? " −" : ""}</th><td>{pokemon.stats[i] ?? "—"}</td><td>{pokemon.ivs[i] ?? "—"}</td><td>{pokemon.evs[i] ?? "—"}</td></tr>;
      })}</tbody></table></div>}
    {tab === "moves" && <div className="collection-inspect-section">{pokemon.moves.map(move => <article key={move.id}><MoveInspection move={move} typeBadge={<TypeBadge type={move.type} />} /></article>)}{!pokemon.moves.length && <p>No moves.</p>}</div>}
    {tab === "about" && <div className="collection-inspect-section"><h3>Ability · {pokemon.ability?.name || "None"}</h3><p>{pokemon.ability?.description}</p><h3>Held item · {pokemon.heldItem?.name || "None"}</h3><p>{pokemon.heldItem?.description}</p><p>{pokemon.speciesName}</p><small>ID: {pokemon.id}</small></div>}
  </div>;
}
