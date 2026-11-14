import { useEffect, useRef, useState } from "react";
import { CollectionArtwork } from "../collection/CollectionArtwork";
import { TypeBadge } from "../components/TypeBadge";
import type { PokemonDetail, PokemonTransformationChoice, PokemonTransformationContext, PokemonTransformationResult } from "../player/types";

type Choice = PokemonTransformationChoice;
const stats = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
const number = (value: number) => value.toLocaleString("en-US");
const keyFor = (choice: Choice) => `${choice.kind}:${choice.targetSpeciesId}`;
const levelRequired = (choice: Choice, pokemon: PokemonDetail) =>
  choice.kind === "evolve" && pokemon.level < choice.requiredLevel ? choice.requiredLevel : null;

function PokemonTypes({ pokemon }: { pokemon: PokemonDetail }) {
  return <span className="ui-badge-list">{pokemon.types.map(type => <TypeBadge key={type} type={type} />)}</span>;
}

function Artwork({ pokemon }: { pokemon: PokemonDetail }) {
  return <span className="transformation-art"><CollectionArtwork src={pokemon.spriteUrl} /></span>;
}

function ChoiceList({ choices, pokemon, selection, disabled, onSelect }: {
  choices: Choice[]; pokemon: PokemonDetail; selection: Choice; disabled: boolean; onSelect: (key: string) => void;
}) {
  const kind = choices[0].kind;
  const mixed = choices.some(choice => choice.kind !== kind);
  const heading = mixed ? "Choices" : kind === "evolve" ? "Evolutions" : "Forms";
  return <section className="ui-panel transformation-choices">
    <h2 className="ui-panel-heading">{heading}</h2>
    <div className="transformation-choice-list">{choices.map(choice => {
      const requirement = levelRequired(choice, pokemon);
      return <button type="button" key={keyFor(choice)} aria-pressed={keyFor(choice) === keyFor(selection)}
        disabled={disabled} onClick={() => onSelect(keyFor(choice))}>
        <Artwork pokemon={choice.preview} />
        <span className="transformation-choice-name"><strong>{choice.preview.speciesName}</strong>
          <PokemonTypes pokemon={choice.preview} />
          {requirement && <small>Requires Lv. {requirement}</small>}</span>
        <span className="transformation-choice-arrow" aria-hidden="true">›</span>
      </button>;
    })}</div>
    <div className="ui-controls transformation-mobile-choices">
      <select aria-label={heading} value={keyFor(selection)} disabled={disabled} onChange={event => onSelect(event.target.value)}>
        {choices.map(choice => {
          const requirement = levelRequired(choice, pokemon);
          const name = mixed ? `${choice.kind === "evolve" ? "Evolve into" : "Change to"} ${choice.preview.speciesName}` : choice.preview.speciesName;
          return <option key={keyFor(choice)} value={keyFor(choice)}>
            {requirement ? `${name} · requires Lv. ${requirement}` : name}
          </option>;
        })}
      </select>
    </div>
  </section>;
}

function Stats({ pokemon, preview }: { pokemon: PokemonDetail; preview: PokemonDetail }) {
  return <table className="transformation-stats">
    <thead><tr><th scope="col">Stats</th><th scope="col">Current</th><th scope="col">After</th><th scope="col">Change</th></tr></thead>
    <tbody>{["Combat power", ...stats].map((label, index) => {
      const current = index === 0 ? pokemon.combatPower : pokemon.stats[index - 1];
      const after = index === 0 ? preview.combatPower : preview.stats[index - 1];
      const change = after - current;
      return <tr key={label}><th scope="row">{label}</th><td>{number(current)}</td><td>{number(after)}</td>
        <td className={change > 0 ? "is-gain" : change < 0 ? "is-loss" : undefined}>
          {change === 0 ? <span aria-label="No change">—</span> : `${change > 0 ? "+" : "−"}${number(Math.abs(change))}`}
        </td></tr>;
    })}</tbody>
  </table>;
}

function Preview({ pokemon, choice, money, disabled, confirming, onConfirm }: {
  pokemon: PokemonDetail; choice: Choice; money: number; disabled: boolean; confirming: boolean; onConfirm: () => void;
}) {
  const { preview } = choice;
  const sameMoves = pokemon.moves.length === preview.moves.length && pokemon.moves.every((move, i) => move.id === preview.moves[i].id);
  const ability = pokemon.ability?.name;
  const nextAbility = preview.ability?.name;
  const requirement = levelRequired(choice, pokemon);
  const shortfall = choice.cost - money;
  const label = choice.kind === "evolve" ? "Evolve" : "Change form";
  const busyLabel = choice.kind === "evolve" ? "Evolving…" : "Changing form…";
  return <section className="ui-panel transformation-preview" aria-labelledby="transformation-preview-heading">
    <h2 className="ui-panel-heading" id="transformation-preview-heading">Preview</h2>
    <div className="transformation-preview-body">
      <div className="transformation-identity">
        <Artwork pokemon={preview} />
        <div><h3>{preview.speciesName}</h3><PokemonTypes pokemon={preview} />
          {(ability || nextAbility) && <p>{ability || "None"}
            {ability !== nextAbility && <> → <strong>{nextAbility || "None"}</strong></>}</p>}
        </div>
      </div>
      <Stats pokemon={pokemon} preview={preview} />
      <details key={keyFor(choice)} className="transformation-moves">
        <summary>{sameMoves ? "Moves stay the same" : "Move changes"}</summary>
        <div>
          <section aria-label={sameMoves ? "Moves" : "Current moves"}><span>{sameMoves ? "Moves" : "Current"}</span>
            <ul>{pokemon.moves.map(move => <li key={move.id}>{move.name}</li>)}</ul></section>
          {!sameMoves && <section aria-label="Moves after the change"><span>After</span>
            <ul>{preview.moves.map(move => <li key={move.id}>{move.name}</li>)}</ul></section>}
        </div>
      </details>
      {pokemon.battleEligible !== preview.battleEligible && <p className="transformation-eligibility">
        {preview.battleEligible ? "Can join battles after this change." : "This Pokémon can’t join battles after this change."}</p>}
      <div className="transformation-confirm">
        <div id="transformation-terms">
          {choice.kind === "form" ? <><p>Cost <strong>{number(choice.cost)} money</strong></p>
            <p>Balance {number(money)}</p>
            {shortfall > 0 && <p className="is-loss">You need {number(shortfall)} more money.</p>}</>
            : requirement ? <p className="is-loss">Reach Lv. {requirement} to evolve.</p>
              : <><p>No cost</p><p>Evolution can’t be undone.</p></>}
        </div>
        <button type="button" className="ui-button ui-button--primary" aria-describedby="transformation-terms"
          disabled={disabled || Boolean(requirement) || shortfall > 0} onClick={onConfirm}>{confirming ? busyLabel : label}</button>
      </div>
    </div>
  </section>;
}

export function TransformationPanel({ context, money, loading, pending, confirming, refreshing, error, result, onConfirm, onRefresh }: {
  context: PokemonTransformationContext | undefined; money: number; loading: boolean; pending: boolean; confirming: boolean;
  refreshing: boolean; error: { text: string; refresh: boolean } | null; result?: PokemonTransformationResult["change"];
  onConfirm: (choice: Choice, expectedVersion: string) => void; onRefresh: () => void;
}) {
  const [selection, setSelection] = useState<{ speciesId: string; key: string }>();
  const feedback = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (result || error) feedback.current?.focus();
  }, [result, error?.text]);
  const pokemon = context?.pokemon;
  const selected = context?.choices.find(choice => selection && selection.speciesId === pokemon?.speciesId && selection.key === keyFor(choice))
    ?? context?.choices[0];
  const busy = pending || refreshing;
  const disabled = busy || Boolean(error?.refresh);
  const message = result && (result.kind === "evolve"
    ? `${result.previousName} evolved into ${result.targetName}!`
    : `${result.previousName} changed form to ${result.targetName}!`);
  return <>
    {pokemon && <section className="ui-panel transformation-current transformation-identity" aria-label="Current Pokémon">
      <Artwork pokemon={pokemon} />
      <div><h2>{pokemon.name}</h2><p>{pokemon.name !== pokemon.speciesName && `${pokemon.speciesName} · `}Lv. {pokemon.level}</p>
        <PokemonTypes pokemon={pokemon} /></div>
      <div className="transformation-power"><small>Combat power</small><strong>{number(pokemon.combatPower)}</strong></div>
    </section>}
    {(error || result) && <div className={`transformation-feedback${error ? "" : " is-success"}`} ref={feedback} tabIndex={-1}>
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error.text}</p>}
      {error?.refresh && <button type="button" className="ui-button" disabled={busy} onClick={onRefresh}>
        {refreshing ? "Refreshing…" : context ? "Refresh Pokémon & money" : "Try again"}
      </button>}
    </div>}
    {confirming && <p className="transformation-sr-only" role="status">{selected?.kind === "evolve" ? "Evolving…" : "Changing form…"}</p>}
    {context && pokemon && selected ? <div className="transformation-layout">
      <ChoiceList choices={context.choices} pokemon={pokemon} selection={selected}
        disabled={disabled} onSelect={key => setSelection({ speciesId: pokemon.speciesId, key })} />
      <Preview pokemon={pokemon} choice={selected} money={money} disabled={disabled} confirming={confirming}
        onConfirm={() => onConfirm(selected, context.expectedVersion)} />
    </div> : context && pokemon ? <section className="ui-panel transformation-empty">
      <h2>No evolutions or forms</h2><p>{pokemon.speciesName} has no available evolutions or alternate forms.</p>
    </section> : loading && !error ? <p className="ui-panel transformation-empty" role="status">Loading Pokémon…</p> : null}
  </>;
}
