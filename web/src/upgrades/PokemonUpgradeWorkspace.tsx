import type { ReactNode } from "react";
import { PageBack } from "../navigation/PageBack";
import { pokemonUpgradeTabs, type PokemonUpgradeRoute } from "../navigation/routes";

/** The host owns Pokemon context and return navigation; each feature owns its lifetime. */
export function PokemonUpgradeWorkspace({ pokemonId, title, onBack, feature = "train", onFeatureChange, children }: {
  pokemonId: string; title: string; onBack: () => void; children: ReactNode;
  feature?: PokemonUpgradeRoute["feature"]; onFeatureChange?: (feature: PokemonUpgradeRoute["feature"]) => void;
}) {
  return <section className="pokemon-upgrade-workspace" data-owned-pokemon={pokemonId} aria-label={`${title} Pokémon`}>
    <PageBack label="Pokémon" className="upgrade-back" onBack={onBack} />
    <h1 tabIndex={-1}>{title}</h1>
    {onFeatureChange && <div className="pokemon-upgrade-tabs" role="tablist" aria-label="Pokémon upgrades">
      {(Object.keys(pokemonUpgradeTabs) as PokemonUpgradeRoute["feature"][]).map(tab => <button key={tab} className="ui-button" role="tab"
        aria-selected={feature === tab} onClick={() => onFeatureChange(tab)}>{pokemonUpgradeTabs[tab]}</button>)}
    </div>}
    <section role="tabpanel" aria-label={title}>{children}</section>
  </section>;
}
