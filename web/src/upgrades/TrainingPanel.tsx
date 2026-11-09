import { CollectionArtwork } from "../collection/CollectionArtwork";
import { TypeBadge } from "../components/TypeBadge";
import type { TrainingLocation } from "../player/types";
import type { TrainingPanelProps } from "./types";

const statNames = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
const signed = (value: number) => value > 0 ? `+${value}` : String(value).replace("-", "−");
const reduction = (id: string) => id === "7" || id === "8";
const locationPurpose = (location: TrainingLocation) => location.id === "0" ? "EXP"
  : reduction(location.id) ? "Reduce all EVs" : `${statNames[Number(location.id) - 1]} EVs`;

export function TrainingPanel({ context, locationId, onLocationChange, onToggle, running, pending, interactionPending = false,
  totals, error, onRefresh, loading, refreshing }: TrainingPanelProps) {
  const selected = context?.locations.find(location => location.id === locationId);
  const busy = running || pending;
  if (!context) return <section className="ui-panel training-state" aria-busy={loading}>
    <h2>{loading ? "Loading training…" : "Training unavailable."}</h2>
    {error && <p role="alert">{error}</p>}
    {!loading && <button className="ui-button" onClick={onRefresh} disabled={refreshing}>Refresh Pokémon</button>}
  </section>;
  const { pokemon, locations } = context;
  const next = selected?.nextGains;
  const evTotals = totals.evs.map((value, index) => value ? `${signed(value)} ${statNames[index]}` : "")
    .filter(Boolean).join(", ") || "0";
  const canStart = Boolean(selected?.owned && selected.canTrain && !error && !refreshing && !interactionPending);
  return <>
    {error && <div className="training-notice" role="alert"><p>{error}</p>
      <button className="ui-button" onClick={onRefresh} disabled={busy || refreshing}>Refresh Pokémon</button></div>}
    <div className="training-layout">
      <section className="ui-panel training-locations" aria-label="Training locations">
        <header className="ui-panel-heading training-panel-heading"><h2>Training locations</h2>
          <small>{locations.filter(location => location.owned).length} available</small></header>
        <div className="training-location-list">{locations.map(location => <button key={location.id} type="button"
          className="training-location" aria-pressed={location.id === locationId} disabled={busy || !location.owned}
          onClick={() => onLocationChange(location.id)}>
          <span className="training-location-icon" aria-hidden="true">{location.emoji}</span>
          <span className="training-location-name"><span>{location.name}</span><small>{locationPurpose(location)}</small></span>
          <span className="training-location-level">{!location.owned ? "Not owned" : location.level ? `Lv. ${location.level}` : "Free"}</span>
        </button>)}</div>
        <p className="training-location-foot">More locations and upgrades in Shop.</p>
      </section>
      <section className="ui-panel training-pokemon" aria-label="Train selected Pokémon">
        <div className="training-identity"><CollectionArtwork src={pokemon.spriteUrl} />
          <div><h2>{pokemon.name}</h2><p>Lv. {pokemon.level} · {pokemon.speciesName}{pokemon.inParty ? " · In party" : ""}</p>
            <div className="ui-badge-list">{pokemon.types.map(type => <TypeBadge key={type} type={type} />)}</div></div></div>
        <label className="training-exp">EXP <span>{pokemon.exp
          ? `${pokemon.exp.current.toLocaleString()} / ${pokemon.exp.required.toLocaleString()} to Lv. ${pokemon.level + 1}` : "Maximum level"}</span>
          <progress aria-label="Level progress" value={pokemon.exp?.current ?? 1} max={pokemon.exp?.required || 1} /></label>
        <div className="training-mobile-location"><label htmlFor="training-location">Training location</label>
          <select className="ui-button" id="training-location" value={locationId} onChange={event => onLocationChange(event.target.value)} disabled={busy}>
            {locations.map(location => <option key={location.id} value={location.id} disabled={!location.owned}>
              {location.name} · {!location.owned ? "Not owned" : location.level ? `Lv. ${location.level}` : "Free"}
            </option>)}</select></div>
        {selected && <div className="training-location-summary"><h3>{selected.emoji} {selected.name} <small>· {selected.level ? `Lv. ${selected.level}` : "Free"}</small></h3>
          <p>{selected.id === "0" ? "Fully upgraded, Home provides the most EXP."
            : reduction(selected.id) ? "Reduces every stat's EVs." : `Train ${statNames[Number(selected.id) - 1]} EVs and gain EXP.`}</p>
          <div className="training-next-gains"><span className={`training-gain${pokemon.level >= 100 ? " is-capped" : ""}`}>
            +{next?.exp.toLocaleString() ?? 0} EXP{pokemon.level >= 100 ? " · Lv. 100" : ""}</span>
            {next?.evs.map((value, index) => value !== 0 && <span className={`training-gain${value < 0 ? " is-reducing" : ""}`} key={index}>
              {signed(value)} {statNames[index]} EV</span>)}</div>
        </div>}
        <div className="training-ev-heading"><h3>Effort values</h3><small>{pokemon.evs.reduce((sum, value) => sum + value, 0)} / 510 total · 252 per stat</small></div>
        <table className="training-evs"><thead><tr><th scope="col">Stat</th><th scope="col"><span className="training-sr-only">Allocation</span></th><th scope="col">EVs</th><th scope="col">Next</th></tr></thead>
          <tbody>{statNames.map((name, index) => <tr key={name} className={next?.evs[index] ? "is-affected" : undefined}>
            <th scope="row">{name}</th><td className="training-ev-meter"><progress aria-label={`${name} EV allocation`} value={pokemon.evs[index]} max={252} /></td>
            <td>{pokemon.evs[index]} / 252</td><td className={Number(next?.evs[index]) < 0 ? "is-reducing" : undefined}>{next?.evs[index] ? signed(next.evs[index]) : "—"}</td>
          </tr>)}</tbody></table>
        <footer className="training-controls"><div className="training-action"><button className="ui-button ui-button--primary training-toggle"
          disabled={!running && (pending || !canStart)} onClick={onToggle}>{running ? "Stop" : pending ? "Stopping…" : "Train"}</button>
          <p role="status">{busy ? "Training…" : ""}</p></div>
          <div className="training-totals"><span>EXP <strong>+{totals.exp.toLocaleString()}</strong></span><span>EVs <strong>{evTotals}</strong></span></div></footer>
      </section>
    </div>
  </>;
}
