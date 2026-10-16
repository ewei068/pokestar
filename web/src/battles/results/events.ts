import { eventText, highlightedPokemonId } from '../eventText';
import type { BattleCatalog, BattleEvent, BattleView, PokemonView } from '../types';

export type EventCue = { label: string; subjectId: string | null; tone: 'neutral' | 'damage' | 'heal' | 'status' };

/** A custom event treatment can replace this cue without changing state progression. */
export const eventCue = (event: BattleEvent, view: BattleView, catalog: BattleCatalog): EventCue | null => {
  const text = eventText(event, view, catalog);
  if (!text) return null;
  const fieldEvent = ['phaseStarted', 'battleEnded', 'weatherChanged'].includes(event.type);
  const subjectId = fieldEvent ? null : highlightedPokemonId(event);
  let label = text, tone: EventCue['tone'] = 'neutral';
  switch (event.type) {
    case 'hpChanged': label = `${Number(event.amount) < 0 ? '−' : '+'}${Math.abs(event.amount || 0)} HP`; tone = Number(event.amount) < 0 ? 'damage' : 'heal'; break;
    case 'shieldChanged': label = `−${Math.abs(event.amount || 0)} Shield`; tone = 'damage'; break;
    case 'targetMissed': label = 'Miss'; break;
    case 'pokemonFainted': label = 'Fainted'; tone = 'damage'; break;
    case 'pokemonRevived': label = 'Revived'; tone = 'heal'; break;
    case 'actionBlocked': label = 'Move blocked'; break;
    case 'statusApplied': label = event.statusId || 'Status applied'; tone = 'status'; break;
    case 'statusRemoved': label = `${event.statusId || 'Status'} cured`; tone = 'heal'; break;
    case 'effectApplied': label = catalog.effects[event.effectId || '']?.name || event.effectId || 'Effect gained'; tone = 'status'; break;
    case 'effectRemoved': label = `${catalog.effects[event.effectId || '']?.name || event.effectId || 'Effect'} ended`; break;
    case 'combatReadinessChanged': label = `${Number(event.amount) < 0 ? '−' : '+'}${Math.round(Math.abs(event.amount || 0))}% readiness`; tone = Number(event.amount) < 0 ? 'damage' : 'heal'; break;
    case 'pokemonMoved': label = 'Repositioned'; break;
    case 'pokemonTransformed': label = 'Transformed'; break;
    case 'turnStarted': label = 'Turn began'; break;
    case 'actionStarted': label = 'Turn skipped'; break;
    case 'moveStarted': label = catalog.moves[event.moveId || '']?.name || 'Used a move'; break;
  }
  // A removed/replaced Pokémon cannot be anchored safely; preserve full narration centrally.
  return { label: subjectId && !view.pokemon[subjectId] ? text : label, subjectId, tone };
};

/** Apply supplied observations only. Missing rule consequences wait for reconciliation. */
export const applyEventView = (view: BattleView, event: BattleEvent): BattleView => {
  if (event.type === 'weatherChanged') return { ...view, weather: { weatherId: event.weatherId ?? null, duration: event.duration ?? 0 } };
  if (event.type === 'battleEnded') return { ...view, ended: true, winner: event.winner ?? null };
  if (event.type === 'turnStarted') return { ...view, turn: event.turn ?? view.turn, activePokemonId: event.pokemonId ?? view.activePokemonId };
  const pokemon = event.pokemonId ? view.pokemon[event.pokemonId] : undefined;
  if (!pokemon) return view;
  let patch: Partial<PokemonView>;
  switch (event.type) {
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
