import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { PokemonSprite } from "./arena/PokemonSprite";
import { StatusVfx } from "./results/StatusVfx";
import { ResultReactions } from "./results/ResultReactions";
import { EventAnnouncement } from "./results/EventAnnouncement";
import type { PlaybackFrame } from "./playback";
import { BattleMotion } from "./BattleMotion";
import { MOVE_MOTION_DURATION_MS, moveMotion } from "./motion";
import { BoardVfx } from "./vfx/BoardVfx";
import { useVfxAssets } from "./vfx/useVfxAssets";
import type { BattleCatalog, BattleEvent, BattleTile, BattleView, PokemonView } from "./types";
import { typeClass, typeName } from "./typeDisplay";
import { StatusLabel } from "./StatusLabel";
import { teamDisplayName } from "./presentation";

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
  resultFrame?: PlaybackFrame;
  reducedMotion?: boolean;
  highlightedId: string | null;
  onChooseTarget: (pokemonId: string, pointerType: string) => void;
  onInspect: (pokemonId: string) => void;
  onHover: (pokemonId: string | null) => void;
};

const percent = (value: number, max = 100) => Math.max(0, Math.min(100, value / Math.max(1, max) * 100));

const PokemonTile = ({ pokemon, catalog, own, active, targetable, primary, inPattern, affected, playback,
  highlighted, stateChanging, onChooseTarget, onInspect, onHover }: {
  pokemon: PokemonView;
  catalog: BattleCatalog;
  own: boolean;
  active: boolean;
  targetable: boolean;
  primary: boolean;
  inPattern: boolean;
  affected: boolean;
  playback: boolean;
  highlighted: boolean;
  stateChanging: boolean;
  onChooseTarget: (pointerType: string) => void;
  onInspect: () => void;
  onHover: (id: string | null) => void;
}) => {
  const pointerType = useRef("mouse");
  const species = catalog.species[pokemon.speciesId];
  const sprite = pokemon.shiny ? species?.shinySprite : species?.sprite;
  const effectIds = Object.keys(pokemon.effectIds || {});
  const buffs = effectIds.filter((id) => catalog.effects[id]?.type === "Buff").length;
  const debuffs = effectIds.filter((id) => catalog.effects[id]?.type === "Debuff").length;
  const otherEffects = effectIds.length - buffs - debuffs;
  return <button type="button" className={`arena-mon ${active ? "is-active" : ""} ${
    targetable ? "is-targetable" : ""} ${primary ? "is-primary" : ""} ${
    inPattern ? "is-in-pattern" : ""} ${affected ? "is-affected" : ""} ${
    highlighted ? "is-event-highlighted" : ""} ${playback ? "is-playback" : ""} ${
    stateChanging ? "is-state-changing" : ""} ${
    pokemon.isFainted ? "is-fainted" : ""}`}
    onPointerDown={event => { pointerType.current = event.pointerType; }}
    onClick={event => targetable ? onChooseTarget(event.detail === 0 ? "keyboard" : pointerType.current) : onInspect()}
    onMouseEnter={() => onHover(pokemon.id)} onMouseLeave={() => onHover(null)}
    onFocus={() => onHover(pokemon.id)} onBlur={() => onHover(null)}
    aria-current={active ? "true" : undefined}
    aria-label={`${pokemon.name}, ${pokemon.hp} of ${pokemon.maxHp} HP, ${Math.round(pokemon.combatReadiness)} percent combat readiness${active ? ", current turn" : ""}${pokemon.isFainted ? ", fainted" : ""}${
      targetable ? ", use selected move" : ", inspect"}${pokemon.status?.statusId ? `, ${pokemon.status.statusId}` : ""}`}>
    <span className="arena-mon-head"><strong>{pokemon.name}</strong><small>Lv {pokemon.level}</small></span>
    <span className="arena-type-cues"><span className="arena-type-dots">{[pokemon.type1, pokemon.type2].filter((type) => type !== null && type !== undefined)
        .map((type) => <span className={`arena-type-dot ${typeClass(type, catalog)}`} key={type}>{typeName(type, catalog)}</span>)}</span></span>
    <span className="arena-sprite"><PokemonSprite src={sprite} flipped={own} /></span>
    <span className="arena-mon-cues">
      {pokemon.status?.statusId && <StatusLabel className="arena-status-cue" statusId={pokemon.status.statusId} />}
      <span className="arena-effect-counters">
        {buffs > 0 && <span className="arena-effect-count is-buff" title={`${buffs} buffs`}>↑{buffs}</span>}
        {debuffs > 0 && <span className="arena-effect-count is-debuff" title={`${debuffs} debuffs`}>↓{debuffs}</span>}
        {otherEffects > 0 && <span className="arena-effect-count" title={`${otherEffects} other effects`}>✧{otherEffects}</span>}
      </span>
    </span>
    {active && <span className="arena-turn-marker" aria-hidden="true">▶ TURN</span>}
    <span className="arena-mon-bars"><span className="arena-stat-line"><span aria-hidden="true">♥</span>
      <span className="arena-meter arena-hp"><i style={{ width: `${percent(pokemon.hp, pokemon.maxHp)}%` }} /></span>
      <small>{pokemon.hp}/{pokemon.maxHp}</small></span>
      <span className="arena-stat-line"><span aria-hidden="true">⚡</span>
        <span className="arena-meter arena-cr"><i style={{ width: `${percent(pokemon.combatReadiness)}%` }} /></span>
        <small>{Math.round(pokemon.combatReadiness)}%</small></span></span>
  </button>;
};

export const BattleGrid = ({ view, ownTeamNames, catalog, targetIds, primaryTargetId,
  patternTiles, affectedIds, playback, motionEvent, resultFrame, reducedMotion: prefersReducedMotion, highlightedId, onChooseTarget, onInspect, onHover }: Props) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const assetsReady = useVfxAssets();
  const reducedMotion = prefersReducedMotion ?? (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  useLayoutEffect(() => { setStartedAt(motionEvent && assetsReady ? performance.now() : null); }, [motionEvent, assetsReady]);
  const motion = moveMotion(motionEvent, catalog);
  const targetSet = new Set(targetIds);
  const affectedSet = new Set(affectedIds);
  const changedIds = new Set(resultFrame?.changes.cues || []);
  const tileSet = new Set(patternTiles.map((tile) => `${tile.teamName}:${tile.position}`));
  return <div className={`arena-board ${targetIds.length ? "is-targeting" : ""}`} ref={boardRef}
    style={{ "--move-duration": `${MOVE_MOTION_DURATION_MS}ms` } as CSSProperties}>
    {[...Object.entries(view.teams)]
      .sort(([left], [right]) => Number(ownTeamNames.includes(right)) - Number(ownTeamNames.includes(left)))
      .map(([teamName, dimensions]) => {
      const own = ownTeamNames.includes(teamName);
      const pokemonByPosition = new Map(Object.values(view.pokemon)
        .filter((entry) => entry.teamName === teamName)
        .map((entry) => [entry.position, entry]));
      return <section className={`arena-team ${own ? "is-own" : "is-enemy"}`} key={teamName}
        aria-label={`${teamDisplayName(view, teamName)} formation`}>
        <div className="arena-team-heading"><h2>{teamDisplayName(view, teamName)}</h2></div>
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
              {entry ? <PokemonTile pokemon={entry} catalog={catalog} own={own}
                active={entry.id === view.activePokemonId} targetable={targetSet.has(entry.id)}
                primary={entry.id === primaryTargetId} inPattern={inPattern}
                playback={playback && inPattern && !motion?.vfxType} stateChanging={changedIds.has(entry.id)}
                affected={affectedSet.has(entry.id)} highlighted={entry.id === highlightedId}
                onChooseTarget={pointerType => onChooseTarget(entry.id, pointerType)} onInspect={() => onInspect(entry.id)}
                onHover={onHover} />
                : <span className={`arena-empty ${inPattern ? "is-affected" : ""} ${
                  playback && inPattern && !motion?.vfxType ? "is-playback" : ""}`} aria-hidden="true" />}
            </div>;
          })}
        </div>
      </section>;
    })}
    {resultFrame?.stage === "event" && resultFrame.announcements.map(announcement => <EventAnnouncement key={announcement.id}
      boardRef={boardRef} announcement={announcement} view={view} reducedMotion={!!reducedMotion} />)}
    {resultFrame && <ResultReactions key={`${resultFrame.id}:reactions`}
      boardRef={boardRef} frame={resultFrame} view={view} catalog={catalog} reducedMotion={!!reducedMotion} />}
    {resultFrame && !reducedMotion && assetsReady && <StatusVfx key={`${resultFrame.id}:status`}
      boardRef={boardRef} frame={resultFrame} view={view} />}
    {motionEvent && !reducedMotion && startedAt !== null && <BattleMotion boardRef={boardRef} ownTeamNames={ownTeamNames} view={view} catalog={catalog} event={motionEvent} startedAt={startedAt} />}
    {motionEvent && !reducedMotion && motion?.vfxType && startedAt !== null && <BoardVfx boardRef={boardRef}
      event={motionEvent} view={view} tiles={patternTiles} type={motion.vfxType} kind={motion.kind} startedAt={startedAt} />}
  </div>;
};
