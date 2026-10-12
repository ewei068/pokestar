import { useState } from "react";
import type { BattleCatalog, BattleView, PokemonView } from "./types";

type Props = {
  view: BattleView;
  ownTeamNames: string[];
  catalog: BattleCatalog;
  targetIds: string[];
  highlightedId: string | null;
  onTarget: (pokemonId: string) => void;
  onInspect: (pokemonId: string) => void;
};

const PokemonTile = ({ pokemon, catalog, active, own, targetable, highlighted, onTarget, onInspect }: {
  pokemon: PokemonView;
  catalog: BattleCatalog;
  active: boolean;
  own: boolean;
  targetable: boolean;
  highlighted: boolean;
  onTarget: () => void;
  onInspect: () => void;
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const species = catalog.species[pokemon.speciesId];
  const sprite = pokemon.shiny ? species?.shinySprite : species?.sprite;
  return (
    <button
      type="button"
      className={`pokemon-tile ${active ? "active" : ""} ${own ? "own" : ""} ${
        targetable ? "targetable" : ""
      } ${highlighted ? "highlighted" : ""} ${pokemon.isFainted ? "fainted" : ""}`}
      onClick={targetable ? onTarget : onInspect}
      onMouseEnter={onInspect}
      onFocus={onInspect}
      aria-label={`${pokemon.name}, ${pokemon.hp} of ${pokemon.maxHp} HP${
        targetable ? ", choose target" : ", view details"
      }`}
    >
      <span className="pokemon-tile-top">
        <span>{pokemon.name}</span>
        <span>Lv. {pokemon.level}</span>
      </span>
      <span className="pokemon-icon">
        {sprite && !imageFailed ? (
          <img src={sprite} alt="" loading="lazy" onError={() => setImageFailed(true)} />
        ) : <span aria-hidden="true">?</span>}
      </span>
      <span className="hp-track" aria-hidden="true">
        <span style={{ width: `${Math.max(0, Math.min(100,
          (pokemon.hp / Math.max(1, pokemon.maxHp)) * 100))}%` }} />
      </span>
      <span className="pokemon-tile-bottom">
        <span>{pokemon.hp}/{pokemon.maxHp} HP</span>
        <span>{pokemon.status?.statusId || (pokemon.shiny ? "✦ Shiny" : "")}</span>
      </span>
    </button>
  );
};

export const BattleGrid = ({ view, ownTeamNames, catalog, targetIds, highlightedId, onTarget, onInspect }: Props) => (
  <div className="battle-arena">
    {Object.entries(view.teams).map(([teamName, dimensions]) => {
      const own = ownTeamNames.includes(teamName);
      const pokemonByPosition = new Map(Object.values(view.pokemon)
        .filter((pokemon) => pokemon.teamName === teamName)
        .map((pokemon) => [pokemon.position, pokemon]));
      return (
        <section className={`team-panel ${own ? "player-team" : "opponent-team"}`} key={teamName}>
          <header className="team-heading">
            <h2>{teamName}</h2>
            <span>{own ? "Your team" : "Opponent"}</span>
          </header>
          <div className="tile-grid" style={{ gridTemplateColumns: `repeat(${dimensions.cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: dimensions.rows * dimensions.cols }, (_, index) => {
              const pokemon = pokemonByPosition.get(index + 1);
              return pokemon ? (
                <PokemonTile
                  key={pokemon.id}
                  pokemon={pokemon}
                  catalog={catalog}
                  active={pokemon.id === view.activePokemonId}
                  own={own}
                  targetable={targetIds.includes(pokemon.id)}
                  highlighted={pokemon.id === highlightedId}
                  onTarget={() => onTarget(pokemon.id)}
                  onInspect={() => onInspect(pokemon.id)}
                />
              ) : <div className="empty-tile" aria-hidden="true" key={index} />;
            })}
          </div>
        </section>
      );
    })}
  </div>
);
