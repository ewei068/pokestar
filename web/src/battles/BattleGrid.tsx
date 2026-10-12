import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { BattleMotion } from "./BattleMotion";
import { MOVE_MOTION_DURATION_MS, moveMotion } from "./motion";
import type { BattleCatalog, BattleEvent, BattleTile, BattleView, PokemonView } from "./types";
import { typeClass, typeName } from "./typeDisplay";

type Props = {
  view: BattleView;
  ownTeamNames: string[];
  catalog: BattleCatalog;
  targetIds: string[];
  primaryTargetId: string | null;
  patternTiles: BattleTile[];
  affectedIds: string[];
  playback: boolean;
  motionEvent?: BattleEvent;
  highlightedId: string | null;
  onChooseTarget: (pokemonId: string) => void;
  onInspect: (pokemonId: string) => void;
  onHover: (pokemonId: string | null) => void;
};

const percent = (value: number, max = 100) => Math.max(0, Math.min(100, value / Math.max(1, max) * 100));

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
      targetable ? ", use selected move" : ", inspect"}`}>
    <span className="arena-mon-head"><strong>{pokemon.name}</strong><small>Lv {pokemon.level}</small></span>
    <span className="arena-mon-main"><span className="arena-sprite">{
      sprite && !imageFailed ? <img src={sprite} alt="" loading="lazy" onError={() => setImageFailed(true)} />
        : <span aria-hidden="true">?</span>
    }</span><span className="arena-mon-cues">
      <span className="arena-type-dots">{[pokemon.type1, pokemon.type2].filter((type) => type !== null && type !== undefined)
        .map((type) => <i className={`arena-type-dot ${typeClass(type, catalog)}`} key={type} title={typeName(type, catalog)} />)}</span>
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
  patternTiles, affectedIds, playback, motionEvent, highlightedId, onChooseTarget, onInspect, onHover }: Props) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const motion = moveMotion(motionEvent, catalog);
  const targetSet = new Set(targetIds);
  const affectedSet = new Set(affectedIds);
  const tileSet = new Set(patternTiles.map((tile) => `${tile.teamName}:${tile.position}`));
  return <div className="arena-board" ref={boardRef}
    style={{ "--move-duration": `${MOVE_MOTION_DURATION_MS}ms` } as CSSProperties}>
    {[...Object.entries(view.teams)]
      .sort(([left], [right]) => Number(ownTeamNames.includes(right)) - Number(ownTeamNames.includes(left)))
      .map(([teamName, dimensions]) => {
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
            return <div className={`arena-cell ${inPattern ? "is-pattern-cell" : ""}`} style={cellStyle}
              key={position} data-team-name={teamName} data-position={position}>
              {entry ? <PokemonTile pokemon={entry} catalog={catalog}
                active={entry.id === view.activePokemonId} targetable={targetSet.has(entry.id)}
                primary={entry.id === primaryTargetId} inPattern={inPattern}
                playback={playback && inPattern && !motion?.normalVfx}
                affected={affectedSet.has(entry.id)} highlighted={entry.id === highlightedId}
                onChooseTarget={() => onChooseTarget(entry.id)} onInspect={() => onInspect(entry.id)}
                onHover={onHover} />
                : <span className={`arena-empty ${inPattern ? "is-affected" : ""} ${
                  playback && inPattern && !motion?.normalVfx ? "is-playback" : ""}`} aria-hidden="true" />}
              {inPattern && motion?.normalVfx && <NormalTileVfx kind={motion.kind} />}
            </div>;
          })}
        </div>
      </section>;
    })}
    <span className="arena-versus" aria-hidden="true">VS</span>
    {motionEvent && <BattleMotion boardRef={boardRef} view={view} catalog={catalog} event={motionEvent} />}
  </div>;
};

const NormalTileVfx = ({ kind }: { kind: "physical" | "special" | "status" }) =>
  <svg className={`arena-normal-vfx is-${kind}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    {kind === "physical" ? <g className="arena-normal-impact">
      <path d="M14 28 36 41 M8 55 33 55 M18 82 39 65 M83 18 65 38 M92 51 68 52 M81 82 64 65" />
      <path d="M28 14 43 39 M64 11 57 35 M87 69 66 59 M39 89 47 68" />
    </g> : kind === "special" ? <g className="arena-normal-energy">
      <circle cx="50" cy="50" r="21" /><circle cx="50" cy="50" r="34" />
      <path d="M51 18 C84 21 91 60 66 75 C43 90 16 66 28 43 C36 29 59 30 65 47" />
    </g> : <g className="arena-normal-pulse">
      <circle cx="50" cy="50" r="17" /><circle cx="50" cy="50" r="29" />
      <path d="M50 11 54 20 50 29 46 20Z M85 50 77 54 69 50 77 46Z M50 88 46 79 50 71 54 79Z M15 50 23 46 31 50 23 54Z" />
    </g>}
  </svg>;
