import type { ReactNode } from "react";

/** The host owns Pokemon context and return navigation; each feature owns its lifetime. */
export function PokemonUpgradeWorkspace({ pokemonId, title, onBack, children }: {
  pokemonId: string; title: string; onBack: () => void; children: ReactNode;
}) {
  return <section className="pokemon-upgrade-workspace" data-owned-pokemon={pokemonId} aria-label={`${title} Pokémon`}>
    <button className="ui-button ui-button--inline upgrade-back" onClick={onBack}>‹ Pokémon</button>
    <h1 tabIndex={-1}>{title}</h1>
    {children}
  </section>;
}
