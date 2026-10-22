import type { BattleCatalog, PokemonView } from "./types";
import { typeClass, typeName } from "./typeDisplay";
import { StatusLabel } from "./StatusLabel";

export type InspectDetail = { category: string; name: string; description: string; duration?: number };

type Props = {
  pokemon: PokemonView | null;
  moveId: string | null;
  detail: InspectDetail | null;
  catalog: BattleCatalog;
  teamLabel?: string;
  onOpenDetail: (detail: InspectDetail) => void;
  onBack: () => void;
};

const percent = (value: number, max = 100) => Math.max(0, Math.min(100, value / Math.max(1, max) * 100));

const ClockIcon = () => <svg className="arena-fact-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
  <circle cx="8" cy="8" r="6" /><path d="M8 4v4l3 2" />
</svg>;
const turns = (count: number) => `${count} ${count === 1 ? "turn" : "turns"}`;

export const BattleInspector = ({ pokemon, moveId, detail, catalog, teamLabel, onOpenDetail, onBack }: Props) => {
  const move = moveId ? catalog.moves[moveId] : null;
  const species = pokemon ? catalog.species[pokemon.speciesId] : null;
  const sprite = pokemon?.shiny ? species?.shinySprite : species?.sprite;
  const statusId = pokemon?.status?.statusId;
  return <section className="arena-inspector" aria-label="Battle inspector">
    <div className="arena-section-heading"><h2>Inspect</h2><span aria-hidden="true">ⓘ</span></div>
    {detail ? <div className="arena-detail-page">
      <button type="button" className="arena-inspector-back" onClick={onBack}>← Back</button>
      <small>{detail.category}</small>
      <div className="arena-inspector-title"><h3>{detail.name}</h3>
        {detail.duration !== undefined && <span className="arena-duration" aria-label="Remaining duration"><ClockIcon />{turns(detail.duration)}</span>}</div>
      <p>{detail.description}</p>
    </div> : move ? <>
      <div className="arena-inspector-title"><h3>{move.name || moveId}</h3>
        <span className={`arena-type-label ${typeClass(move.type, catalog)}`}>{typeName(move.type, catalog)}</span></div>
      <dl className="arena-inspector-facts" aria-label="Move details">
        <div><dt><span aria-hidden="true">{move.damageType === "Physical" ? "⚔" : move.damageType === "Special" ? "✦" : "◌"}</span> Category</dt>
          <dd>{move.damageType === "Physical" || move.damageType === "Special" ? move.damageType : "Status"}</dd></div>
        <div><dt><span aria-hidden="true">✹</span> Power</dt><dd>{move.power ?? "—"}</dd></div>
        <div><dt><span aria-hidden="true">◎</span> Accuracy</dt><dd>{move.accuracy ?? "—"}</dd></div>
        <div><dt><ClockIcon /> Cooldown</dt><dd>{move.cooldown === undefined ? "—" : turns(move.cooldown)}</dd></div>
      </dl>
      <p>{move.description || "No description available."}</p>
    </> : pokemon ? <>
      <div className="arena-inspector-pokemon">{sprite && <img src={sprite} alt="" loading="lazy" />}
        <div className="arena-inspector-identity"><div className="arena-inspector-title">
          {statusId && <StatusLabel statusId={statusId}
            onClick={() => onOpenDetail({ category: "Status", name: catalog.statuses?.[statusId]?.name || statusId,
              description: catalog.statuses?.[statusId]?.description || "Active battle status." })} />}
          <h3>{pokemon.name}</h3></div><small>Lv {pokemon.level} · {teamLabel || pokemon.teamName}</small>
          <div className="arena-inspector-types">{[pokemon.type1, pokemon.type2].filter((type) => type !== null && type !== undefined)
            .map((type) => <span className={`arena-type-label ${typeClass(type, catalog)}`} key={type}>{typeName(type, catalog)}</span>)}</div>
        </div></div>
      {(pokemon.abilityId || pokemon.heldItemId) && <div className="arena-inspector-traits">
        {pokemon.abilityId && <div><span>Ability</span><button type="button" className="is-ability"
          aria-label={`Ability: ${catalog.abilities[pokemon.abilityId]?.name || pokemon.abilityId}`}
          onClick={() => onOpenDetail({ category: "Ability",
            name: catalog.abilities[pokemon.abilityId!]?.name || pokemon.abilityId!,
            description: catalog.abilities[pokemon.abilityId!]?.description || "No description available." })}>
          <span aria-hidden="true">✦</span> {catalog.abilities[pokemon.abilityId]?.name || pokemon.abilityId}</button></div>}
        {pokemon.heldItemId && <div><span>Held item</span><button type="button" className="is-item"
          aria-label={`Held item: ${catalog.heldItems[pokemon.heldItemId]?.name || pokemon.heldItemId}`}
          onClick={() => onOpenDetail({ category: "Held item",
            name: catalog.heldItems[pokemon.heldItemId!]?.name || pokemon.heldItemId!,
            description: catalog.heldItems[pokemon.heldItemId!]?.description || "No description available." })}>
          <span aria-hidden="true">◇</span> {catalog.heldItems[pokemon.heldItemId]?.name || pokemon.heldItemId}</button></div>}
      </div>}
      <div className="arena-inspector-bars"><span>♥ HP <strong>{pokemon.hp}/{pokemon.maxHp}</strong></span>
        <span className="arena-meter arena-hp"><i style={{ width: `${percent(pokemon.hp, pokemon.maxHp)}%` }} /></span>
        <span>⚡ Readiness <strong>{Math.round(pokemon.combatReadiness)}%</strong></span>
        <span className="arena-meter arena-cr"><i style={{ width: `${percent(pokemon.combatReadiness)}%` }} /></span></div>
      <div className="arena-inspector-tags">
        {Object.entries(pokemon.effectIds || {}).map(([id, state]) => {
          const effect = catalog.effects[id];
          const category = effect?.type || "Effect";
          return <button type="button" key={id} className={`is-effect is-${category.toLowerCase()}`}
            onClick={() => onOpenDetail({ category, name: effect?.name || id,
              description: effect?.description || "Active battle effect.", duration: state.duration })}>
            {category === "Buff" ? "↑" : category === "Debuff" ? "↓" : "✧"} {effect?.name || id}{state.duration === undefined ? "" : ` · ${state.duration}`}</button>;
        })}
      </div>
    </> : <p className="arena-muted">Choose a Pokémon or move to inspect it.</p>}
  </section>;
};
