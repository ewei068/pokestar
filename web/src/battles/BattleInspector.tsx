import type { BattleCatalog, PokemonView } from "./types";
import { typeClass, typeName } from "./typeDisplay";

export type InspectDetail = { category: string; name: string; description: string };

type Props = {
  pokemon: PokemonView | null;
  moveId: string | null;
  detail: InspectDetail | null;
  catalog: BattleCatalog;
  onOpenDetail: (detail: InspectDetail) => void;
  onBack: () => void;
};

const percent = (value: number, max = 100) => Math.max(0, Math.min(100, value / Math.max(1, max) * 100));

export const BattleInspector = ({ pokemon, moveId, detail, catalog, onOpenDetail, onBack }: Props) => {
  const move = moveId ? catalog.moves[moveId] : null;
  const species = pokemon ? catalog.species[pokemon.speciesId] : null;
  const sprite = pokemon?.shiny ? species?.shinySprite : species?.sprite;
  return <section className="arena-inspector" aria-label="Battle inspector">
    <div className="arena-section-heading"><h2>Inspect</h2><span aria-hidden="true">ⓘ</span></div>
    {detail ? <div className="arena-detail-page">
      <button type="button" className="arena-inspector-back" onClick={onBack}>← Back</button>
      <small>{detail.category}</small><h3>{detail.name}</h3><p>{detail.description}</p>
    </div> : move ? <>
      <h3>{move.name || moveId}</h3><p>{move.description || "No description available."}</p>
      <div className="arena-inspector-facts"><span className={`arena-type-label ${typeClass(move.type, catalog)}`}>{typeName(move.type, catalog)}</span>
        <span>{move.damageType || "Status"}</span><span>Power {move.power ?? "—"}</span>
        <span>Accuracy {move.accuracy ?? "—"}</span><span>{move.targetPattern || "Single target"}</span></div>
    </> : pokemon ? <>
      <div className="arena-inspector-pokemon">{sprite && <img src={sprite} alt="" loading="lazy" />}
        <div><h3>{pokemon.name}</h3><small>Lv {pokemon.level} · {pokemon.teamName}</small>
          <div className="arena-inspector-types">{[pokemon.type1, pokemon.type2].filter((type) => type !== null && type !== undefined)
            .map((type) => <span className={`arena-type-label ${typeClass(type, catalog)}`} key={type}>{typeName(type, catalog)}</span>)}</div>
        </div></div>
      <div className="arena-inspector-bars"><span>♥ HP <strong>{pokemon.hp}/{pokemon.maxHp}</strong></span>
        <span className="arena-meter arena-hp"><i style={{ width: `${percent(pokemon.hp, pokemon.maxHp)}%` }} /></span>
        <span>⚡ Readiness <strong>{Math.round(pokemon.combatReadiness)}%</strong></span>
        <span className="arena-meter arena-cr"><i style={{ width: `${percent(pokemon.combatReadiness)}%` }} /></span></div>
      <div className="arena-inspector-tags">
        {pokemon.status?.statusId && <button type="button" className="is-status"
          onClick={() => onOpenDetail({ category: "Status", name: pokemon.status.statusId || "Status",
            description: catalog.statuses?.[pokemon.status.statusId || ""]?.description || "Active battle status." })}>
          ◉ {pokemon.status.statusId}</button>}
        {Object.entries(pokemon.effectIds || {}).map(([id, state]) => {
          const effect = catalog.effects[id];
          const category = effect?.type || "Effect";
          return <button type="button" key={id} className={`is-effect is-${category.toLowerCase()}`}
            onClick={() => onOpenDetail({ category, name: effect?.name || id,
              description: `${effect?.description || "Active battle effect."}${state.duration === undefined ? "" : ` ${state.duration} turns remain.`}` })}>
            ✧ {effect?.name || id}{state.duration === undefined ? "" : ` · ${state.duration}`}</button>;
        })}
        {pokemon.abilityId && <button type="button" className="is-ability"
          onClick={() => onOpenDetail({ category: "Ability",
            name: catalog.abilities[pokemon.abilityId!]?.name || pokemon.abilityId!,
            description: catalog.abilities[pokemon.abilityId!]?.description || "No description available." })}>
          ✦ {catalog.abilities[pokemon.abilityId]?.name || pokemon.abilityId}</button>}
        {pokemon.heldItemId && <button type="button" className="is-item"
          onClick={() => onOpenDetail({ category: "Held item",
            name: catalog.heldItems[pokemon.heldItemId!]?.name || pokemon.heldItemId!,
            description: catalog.heldItems[pokemon.heldItemId!]?.description || "No description available." })}>
          ◇ {catalog.heldItems[pokemon.heldItemId]?.name || pokemon.heldItemId}</button>}
      </div>
    </> : <p className="arena-muted">Choose a Pokémon or move to inspect it.</p>}
  </section>;
};
