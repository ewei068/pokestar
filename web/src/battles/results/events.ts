import type { BattleEvent, BattleView, PokemonView } from '../types';

/** Apply supplied observations and the move-use readiness reset. Other consequences wait for reconciliation. */
export const applyEventView = (view: BattleView, event: BattleEvent): BattleView => {
  if (event.type === 'weatherChanged') return { ...view, weather: { weatherId: event.weatherId ?? null, duration: event.duration ?? 0 } };
  if (event.type === 'battleEnded') return { ...view, ended: true, winner: event.winner ?? null };
  if (event.type === 'turnStarted') return { ...view, turn: event.turn ?? view.turn, activePokemonId: event.pokemonId ?? view.activePokemonId };
  const pokemon = event.pokemonId ? view.pokemon[event.pokemonId] : undefined;
  if (!pokemon) return view;
  let patch: Partial<PokemonView>;
  switch (event.type) {
    // The engine spends readiness before emitting moveStarted, independently of move outcomes.
    case 'moveStarted': patch = { combatReadiness: 0 }; break;
    case 'hpChanged': if (event.hp === undefined) return view; patch = { hp: event.hp }; break;
    case 'pokemonFainted': patch = { hp: 0, isFainted: true }; break;
    case 'pokemonRevived': if (event.hp === undefined) return view; patch = { hp: event.hp, isFainted: false }; break;
    case 'statusApplied': patch = { status: { statusId: event.statusId, ...(event.turns === undefined ? {} : { turns: event.turns }) } }; break;
    case 'statusRemoved': patch = { status: { statusId: null, turns: 0 } }; break;
    case 'effectApplied': if (!event.effectId) return view; patch = { effectIds: { ...pokemon.effectIds, [event.effectId]: { duration: event.duration } } }; break;
    case 'effectRemoved': {
      if (!event.effectId) return view;
      const effects = { ...pokemon.effectIds }; delete effects[event.effectId]; patch = { effectIds: effects }; break;
    }
    case 'pokemonMoved': if (event.position === undefined || !event.teamName) return view; patch = { teamName: event.teamName, position: event.position }; break;
    case 'pokemonTransformed': if (!event.speciesId) return view; patch = { speciesId: event.speciesId }; break;
    case 'combatReadinessChanged': if (event.combatReadiness === undefined) return view; patch = { combatReadiness: event.combatReadiness }; break;
    default: return view;
  }
  return { ...view, pokemon: { ...view.pokemon, [pokemon.id]: { ...pokemon, ...patch } } };
};
