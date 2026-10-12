import type { BattleCatalog, BattleEvent, BattleView } from "./types";

const pokemonName = (view: BattleView, id?: string | null) =>
  (id && view.pokemon[id]?.name) || "A Pokémon";

export const eventText = (
  event: BattleEvent,
  view: BattleView,
  catalog: BattleCatalog,
): string | null => {
  const name = pokemonName(view, event.pokemonId);
  switch (event.type) {
    case "actionStarted":
      return event.action === "skipTurn" ? `${name} skipped its turn.` : null;
    case "turnStarted":
      return `${name}'s turn began.`;
    case "moveStarted":
      return `${name} used ${catalog.moves[event.moveId || ""]?.name || "a move"}.`;
    case "actionBlocked":
      return `${name} could not use its move.`;
    case "targetMissed":
      return `${pokemonName(view, event.targetPokemonId)} avoided the attack.`;
    case "hpChanged":
      return `${name} ${Number(event.amount) < 0 ? "lost" : "gained"} ${
        Math.abs(Number(event.amount) || 0)
      } HP.`;
    case "pokemonFainted":
      return `${name} fainted.`;
    case "pokemonRevived":
      return `${name} returned to battle.`;
    case "statusApplied":
      return `${name} is now ${event.statusId || "affected"}.`;
    case "effectApplied":
      return `${name} gained ${catalog.effects[event.effectId || ""]?.name || event.effectId || "an effect"}.`;
    case "effectRemoved":
      return `${name} lost ${catalog.effects[event.effectId || ""]?.name || event.effectId || "an effect"}.`;
    case "phaseStarted":
      return "A new battle phase began.";
    case "battleEnded":
      return event.winner ? `${event.winner} won the battle.` : "The battle ended.";
    default:
      return null;
  }
};

export const highlightedPokemonId = (event?: BattleEvent): string | null =>
  event?.targetPokemonId || event?.pokemonId || null;
