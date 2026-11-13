import type { ReactNode } from "react";
import type { PokemonUpgradeRoute } from "../navigation/routes";

/** The host owns Pokemon context and return navigation; each feature owns its lifetime. */
export function PokemonUpgradeWorkspace({ pokemonId, title, onBack, feature = "train", onFeatureChange, children }: {
  pokemonId: string; title: string; onBack: () => void; children: ReactNode;
  feature?: PokemonUpgradeRoute["feature"]; onFeatureChange?: (feature: PokemonUpgradeRoute["feature"]) => void;
}) {
  return <section className="pokemon-upgrade-workspace" data-owned-pokemon={pokemonId} aria-label={`${title} Pokémon`}>
    <button className="ui-button ui-button--inline upgrade-back" onClick={onBack}>‹ Pokémon</button>
    <h1 tabIndex={-1}>{title}</h1>
    {onFeatureChange && <div className="pokemon-upgrade-tabs" role="tablist" aria-label="Pokémon upgrades">
      {(["train", "build", "equipment"] as const).map(tab => <button key={tab} className="ui-button" role="tab"
        aria-selected={feature === tab} onClick={() => onFeatureChange(tab)}>{tab === "train" ? "Train" : tab === "build" ? "Item & nature" : "Equipment"}</button>)}
    </div>}
    <section role="tabpanel" aria-label={title}>{children}</section>
  </section>;
}
