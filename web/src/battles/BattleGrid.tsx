import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { BattleCatalog, BattleTile, BattleView, PokemonView } from "./types";

type Props = {
  view: BattleView;
  ownTeamNames: string[];
  catalog: BattleCatalog;
  targetIds: string[];
  primaryTargetId: string | null;
  patternTiles: BattleTile[];
  affectedIds: string[];
  playback: boolean;
  highlightedId: string | null;
  onChooseTarget: (pokemonId: string) => void;
  onInspect: (pokemonId: string) => void;
  onHover: (pokemonId: string | null) => void;
};

const percent = (value: number, max = 100) => Math.max(0, Math.min(100, value / Math.max(1, max) * 100));
const typeClass = (type: string) => `arena-type-${type.toLowerCase().replace(/[^a-z]/g, "")}`;

const PokemonTile = ({ pokemon, catalog, active, targetable, primary, inPattern, affected, playback,
  highlighted, onChooseTarget, onInspect, onHover }: {
  pokemon: PokemonView;
  catalog: BattleCatalog;
  active: boolean;
  targetable: boolean;
  primary: boolean;
  inPattern: boolean;
  affected: boolean;
  playback: boolean;
  highlighted: boolean;
  onChooseTarget: () => void;
  onInspect: () => void;
  onHover: (id: string | null) => void;
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const species = catalog.species[pokemon.speciesId];
  const sprite = pokemon.shiny ? species?.shinySprite : species?.sprite;
  useEffect(() => setImageFailed(false), [sprite]);
  const effectIds = Object.keys(pokemon.effectIds || {});
  const buffs = effectIds.filter((id) => catalog.effects[id]?.type === "Buff").length;
  const debuffs = effectIds.filter((id) => catalog.effects[id]?.type === "Debuff").length;
  const otherEffects = effectIds.length - buffs - debuffs;
  return <button type="button" className={`arena-mon ${active ? "is-active" : ""} ${
    targetable ? "is-targetable" : ""} ${primary ? "is-primary" : ""} ${
    inPattern ? "is-in-pattern" : ""} ${affected ? "is-affected" : ""} ${
    highlighted ? "is-event-highlighted" : ""} ${playback ? "is-playback" : ""} ${
    pokemon.isFainted ? "is-fainted" : ""}`}
    onClick={targetable ? onChooseTarget : onInspect}
    onMouseEnter={() => onHover(pokemon.id)} onMouseLeave={() => onHover(null)}
    onFocus={() => onHover(pokemon.id)} onBlur={() => onHover(null)}
    aria-label={`${pokemon.name}, ${pokemon.hp} of ${pokemon.maxHp} HP, ${Math.round(pokemon.combatReadiness)} percent combat readiness${
      targetable ? ", preview target" : ", inspect"}`}>
    <span className="arena-mon-head"><strong>{pokemon.name}</strong><small>Lv {pokemon.level}</small></span>
    <span className="arena-mon-main"><span className="arena-sprite">{
      sprite && !imageFailed ? <img src={sprite} alt="" loading="lazy" onError={() => setImageFailed(true)} />
        : <span aria-hidden="true">?</span>
    }</span><span className="arena-mon-cues">
      <span className="arena-type-dots">{[pokemon.type1, pokemon.type2].filter(Boolean)
        .map((type) => <i className={`arena-type-dot ${typeClass(String(type))}`} key={type} title={String(type)} />)}</span>
      {pokemon.status?.statusId && <span className="arena-status-cue">{pokemon.status.statusId}</span>}
      <span className="arena-effect-counters">
        {buffs > 0 && <span className="arena-effect-count is-buff" title={`${buffs} buffs`}>↑{buffs}</span>}
        {debuffs > 0 && <span className="arena-effect-count is-debuff" title={`${debuffs} debuffs`}>↓{debuffs}</span>}
        {otherEffects > 0 && <span className="arena-effect-count" title={`${otherEffects} other effects`}>✧{otherEffects}</span>}
      </span>
    </span></span>
    <span className="arena-mon-bars"><span className="arena-stat-line"><span aria-hidden="true">♥</span>
      <span className="arena-meter arena-hp"><i style={{ width: `${percent(pokemon.hp, pokemon.maxHp)}%` }} /></span>
      <small>{pokemon.hp}/{pokemon.maxHp}</small></span>
      <span className="arena-stat-line"><span aria-hidden="true">⚡</span>
        <span className="arena-meter arena-cr"><i style={{ width: `${percent(pokemon.combatReadiness)}%` }} /></span>
        <small>{Math.round(pokemon.combatReadiness)}%</small></span></span>
  </button>;
};

export const BattleGrid = ({ view, ownTeamNames, catalog, targetIds, primaryTargetId,
  patternTiles, affectedIds, playback, highlightedId, onChooseTarget, onInspect, onHover }: Props) => {
  const targetSet = new Set(targetIds);
  const affectedSet = new Set(affectedIds);
  const tileSet = new Set(patternTiles.map((tile) => `${tile.teamName}:${tile.position}`));
  return <div className="arena-board">
    {Object.entries(view.teams).map(([teamName, dimensions]) => {
      const own = ownTeamNames.includes(teamName);
      const pokemonByPosition = new Map(Object.values(view.pokemon)
        .filter((entry) => entry.teamName === teamName)
        .map((entry) => [entry.position, entry]));
      return <section className={`arena-team ${own ? "is-own" : "is-enemy"}`} key={teamName}
        aria-label={`${teamName} formation`}>
        <div className="arena-team-heading"><h2>{teamName}</h2>
          <span className="arena-front-desktop">{own ? "YOU · FRONT →" : "← FRONT · RIVAL"}</span>
          <span className="arena-front-mobile">{own ? "FRONT ↑ · YOU" : "RIVAL · FRONT ↓"}</span></div>
        <div className="arena-grid" style={{ "--rows": dimensions.rows, "--cols": dimensions.cols } as CSSProperties}>
          {Array.from({ length: dimensions.rows * dimensions.cols }, (_, index) => {
            const row = Math.floor(index / dimensions.cols);
            const col = index % dimensions.cols;
            const position = index + 1;
            const entry = pokemonByPosition.get(position);
            const inPattern = tileSet.has(`${teamName}:${position}`);
            const cellStyle = {
              "--face-col": own ? dimensions.rows - row : row + 1,
              "--face-row": col + 1,
              "--vertical-col": col + 1,
              "--vertical-row": own ? row + 1 : dimensions.rows - row,
            } as CSSProperties;
            return <div className={`arena-cell ${inPattern ? "is-pattern-cell" : ""}`} style={cellStyle} key={position}>
              {entry ? <PokemonTile pokemon={entry} catalog={catalog}
                active={entry.id === view.activePokemonId} targetable={targetSet.has(entry.id)}
                primary={entry.id === primaryTargetId} inPattern={inPattern} playback={playback && inPattern}
                affected={affectedSet.has(entry.id)} highlighted={entry.id === highlightedId}
                onChooseTarget={() => onChooseTarget(entry.id)} onInspect={() => onInspect(entry.id)}
                onHover={onHover} />
                : <span className={`arena-empty ${inPattern ? "is-affected" : ""} ${
                  playback && inPattern ? "is-playback" : ""}`} aria-hidden="true" />}
            </div>;
          })}
        </div>
      </section>;
    })}
    <span className="arena-versus" aria-hidden="true">VS</span>
  </div>;
};
