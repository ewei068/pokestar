import type { BattleCatalog, BattleEvent, BattleView } from './types';
import { teamDisplayName } from './presentation';

export type EventCue = { label: string; subjectId: string | null; tone: 'neutral' | 'damage' | 'heal' | 'status' | 'buff' | 'debuff' };
type Context = { event: BattleEvent; name: string; target: string; move: string; effect: string; effectType?: string; species: string; winner: string };
type Copy = string | ((context: Context) => string);
type Definition = {
  narration: Copy; label?: Copy; subject?: 'pokemon' | 'target' | 'field';
  tone?: EventCue['tone'] | ((context: Context) => EventCue['tone']);
  batch?: (event: BattleEvent) => string | null;
};
const sign = (event: BattleEvent) => Number(event.amount) < 0 ? 'loss' : 'gain';
const amount = (event: BattleEvent) => Math.abs(Number(event.amount) || 0);
const numericTone = ({ event }: Context) => Number(event.amount) < 0 ? 'damage' as const : 'heal' as const;
const signed = (event: BattleEvent) => `${Number(event.amount) < 0 ? '−' : '+'}${amount(event)}`;

const statusPhrases: Record<string, { applied: string; removed: string; label: string; cured: string }> = {
  Burn: { applied: 'was burned!', removed: 'was cured of its burn!', label: 'Burned', cured: 'Burn cured' },
  Freeze: { applied: 'was frozen solid!', removed: 'thawed out!', label: 'Frozen', cured: 'Thawed out' },
  Paralysis: { applied: 'is paralyzed! It may be unable to move!', removed: 'was cured of its paralysis!', label: 'Paralyzed', cured: 'Paralysis cured' },
  Poison: { applied: 'was poisoned!', removed: 'was cured of its poison!', label: 'Poisoned', cured: 'Poison cured' },
  'Badly Poison': { applied: 'was badly poisoned!', removed: 'was cured of its poison!', label: 'Badly poisoned', cured: 'Poison cured' },
  Sleep: { applied: 'fell asleep!', removed: 'woke up!', label: 'Asleep', cured: 'Woke up' },
};
const weatherPhrases: Record<string, { started: string; ended: string }> = {
  Sun: { started: 'The sunlight turned harsh!', ended: 'The sunlight faded.' },
  Rain: { started: 'It started to rain!', ended: 'The rain stopped.' },
  Sandstorm: { started: 'A sandstorm kicked up!', ended: 'The sandstorm subsided.' },
  Hail: { started: 'It started to hail!', ended: 'The hail stopped.' },
};

/** Client copy and presentation semantics. Server events remain plain facts, not UI strings. */
export const eventPresentationCatalog: Record<string, Definition> = {
  actionStarted: { narration: ({ name }) => `${name} skipped its turn.`, label: 'Turn skipped' },
  turnStarted: { narration: ({ name }) => `It's ${name}'s turn!`, label: 'Turn started' },
  moveStarted: { narration: ({ name, move }) => `${name} used ${move}!`, label: ({ move }) => move },
  actionBlocked: { narration: ({ name }) => `${name} couldn't use its move!`, label: 'Move blocked' },
  targetMissed: { narration: ({ target }) => `${target} avoided the attack!`, label: 'Miss', subject: 'target',
    batch: event => `miss:${event.pokemonId}:${event.moveId}` },
  hpChanged: { narration: ({ name, event }) => Number(event.amount) < 0
    ? `${name} took ${amount(event)} damage!` : `${name} healed ${amount(event)} HP!`,
    label: ({ event }) => `${signed(event)} HP`, tone: numericTone,
    batch: event => event.amount ? `hp:${sign(event)}:${event.sourcePokemonId || ''}` : null },
  shieldChanged: { narration: ({ name, event }) => `${name} took ${amount(event)} shield damage!`,
    label: ({ event }) => `−${amount(event)} Shield`, tone: 'damage', batch: () => 'shieldLoss' },
  pokemonFainted: { narration: ({ name }) => `${name} fainted!`, label: 'Fainted', tone: 'damage' },
  pokemonRevived: { narration: ({ name }) => `${name} was revived!`, label: 'Revived', tone: 'heal' },
  statusApplied: { narration: ({ name, event }) => `${name} ${statusPhrases[event.statusId || '']?.applied || `was affected by ${event.statusId || 'a status condition'}!`}`,
    label: ({ event }) => statusPhrases[event.statusId || '']?.label || event.statusId || 'Status applied',
    tone: 'status', batch: event => event.statusId || null },
  statusRemoved: { narration: ({ name, event }) => `${name} ${statusPhrases[event.statusId || '']?.removed || `recovered from ${event.statusId || 'its status condition'}!`}`,
    label: ({ event }) => statusPhrases[event.statusId || '']?.cured || `${event.statusId || 'Status'} cured`,
    tone: 'heal', batch: event => event.statusId || null },
  effectApplied: { narration: ({ name, effect }) => `${name} gained ${effect}!`, label: ({ effect }) => effect,
    tone: ({ effectType }) => effectType === 'Buff' ? 'buff' : effectType === 'Debuff' ? 'debuff' : 'neutral', batch: event => event.effectId || null },
  effectRemoved: { narration: ({ name, effect }) => `${name} lost ${effect}!`, label: ({ effect }) => `${effect} ended`,
    batch: event => event.effectId || null },
  combatReadinessChanged: { narration: ({ name, event }) => `${name} ${Number(event.amount) < 0 ? 'lost' : 'gained'} ${Math.round(amount(event))}% combat readiness!`,
    label: ({ event }) => `${Number(event.amount) < 0 ? '−' : '+'}${Math.round(amount(event))}% readiness`, tone: numericTone,
    batch: event => event.amount ? `readiness:${sign(event)}` : null },
  pokemonMoved: { narration: ({ name, event }) => `${name} moved to position ${event.position}!`, label: 'Repositioned' },
  pokemonTransformed: { narration: ({ name, species }) => `${name} transformed into ${species}!`, label: 'Transformed' },
  weatherChanged: { narration: ({ event }) => {
    if (!event.weatherId) return weatherPhrases[event.previousWeatherId || '']?.ended || 'The weather cleared up!';
    if (event.previousWeatherId === event.weatherId) return 'The weather intensified!';
    return weatherPhrases[event.weatherId]?.started || `${event.weatherId} began.`;
  }, subject: 'field' },
  phaseStarted: { narration: 'New phase!', subject: 'field' },
  battleEnded: { narration: ({ event, winner }) => event.winner ? `${winner} won the battle!` : 'The battle ended.', subject: 'field' },
};

export const highlightedPokemonId = (event?: BattleEvent): string | null => {
  if (!event) return null;
  const subject = eventPresentationCatalog[event.type]?.subject;
  return subject === 'field' ? null : subject === 'target' ? event.targetPokemonId || null : event.pokemonId || null;
};
export const eventBatchKey = (event: BattleEvent): string | null => {
  const key = eventPresentationCatalog[event.type]?.batch?.(event);
  return key ? `${event.type}:${key}` : null;
};
export const presentEvent = (event: BattleEvent, view: BattleView, catalog: BattleCatalog): { text: string; cue: EventCue } | null => {
  if (event.type === 'actionStarted' && event.action !== 'skipTurn') return null;
  const definition = eventPresentationCatalog[event.type];
  if (!definition) return null;
  const pokemonName = (id?: string) => (id && view.pokemon[id]?.name) || 'A Pokémon';
  const context: Context = { event, name: pokemonName(event.pokemonId), target: pokemonName(event.targetPokemonId),
    winner: event.winner ? teamDisplayName(view, event.winner) : '',
    move: catalog.moves[event.moveId || '']?.name || 'a move',
    effectType: catalog.effects[event.effectId || '']?.type,
    effect: catalog.effects[event.effectId || '']?.name || event.effectId || 'an effect',
    species: catalog.species[event.speciesId || '']?.name || 'another Pokémon' };
  const resolve = (copy: Copy) => typeof copy === 'function' ? copy(context) : copy;
  const text = resolve(definition.narration);
  const subjectId = highlightedPokemonId(event);
  return { text, cue: { subjectId, label: subjectId && !view.pokemon[subjectId] ? text : resolve(definition.label || definition.narration),
    tone: typeof definition.tone === 'function' ? definition.tone(context) : definition.tone || 'neutral' } };
};
