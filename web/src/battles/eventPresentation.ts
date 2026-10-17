import type { BattleCatalog, BattleEvent, BattleView } from './types';

export type EventCue = { label: string; subjectId: string | null; tone: 'neutral' | 'damage' | 'heal' | 'status' | 'buff' | 'debuff' };
type Context = { event: BattleEvent; name: string; target: string; move: string; effect: string; effectType?: string; species: string };
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

/** Client copy and presentation semantics. Server events remain plain facts, not UI strings. */
export const eventPresentationCatalog: Record<string, Definition> = {
  actionStarted: { narration: ({ name }) => `${name} skipped its turn.`, label: 'Turn skipped' },
  turnStarted: { narration: ({ name }) => `${name}'s turn began.`, label: 'Turn began' },
  moveStarted: { narration: ({ name, move }) => `${name} used ${move}.`, label: ({ move }) => move },
  actionBlocked: { narration: ({ name }) => `${name} could not use its move.`, label: 'Move blocked' },
  targetMissed: { narration: ({ target }) => `${target} avoided the attack.`, label: 'Miss', subject: 'target',
    batch: event => `miss:${event.pokemonId}:${event.moveId}` },
  hpChanged: { narration: ({ name, event }) => `${name} ${Number(event.amount) < 0 ? 'lost' : 'gained'} ${amount(event)} HP.`,
    label: ({ event }) => `${signed(event)} HP`, tone: numericTone,
    batch: event => event.amount ? `hp:${sign(event)}:${event.sourcePokemonId || ''}` : null },
  shieldChanged: { narration: ({ name, event }) => `${name} lost ${amount(event)} shield.`,
    label: ({ event }) => `−${amount(event)} Shield`, tone: 'damage', batch: () => 'shieldLoss' },
  pokemonFainted: { narration: ({ name }) => `${name} fainted.`, label: 'Fainted', tone: 'damage' },
  pokemonRevived: { narration: ({ name }) => `${name} returned to battle.`, label: 'Revived', tone: 'heal' },
  statusApplied: { narration: ({ name, event }) => `${name} is now ${event.statusId || 'affected'}.`,
    label: ({ event }) => event.statusId || 'Status applied', tone: 'status', batch: event => event.statusId || null },
  statusRemoved: { narration: ({ name, event }) => `${name} recovered from ${event.statusId || 'its status'}.`,
    label: ({ event }) => `${event.statusId || 'Status'} cured`, tone: 'heal', batch: event => event.statusId || null },
  effectApplied: { narration: ({ name, effect }) => `${name} gained ${effect}.`, label: ({ effect }) => effect,
    tone: ({ effectType }) => effectType === 'Buff' ? 'buff' : effectType === 'Debuff' ? 'debuff' : 'neutral', batch: event => event.effectId || null },
  effectRemoved: { narration: ({ name, effect }) => `${name} lost ${effect}.`, label: ({ effect }) => `${effect} ended`,
    batch: event => event.effectId || null },
  combatReadinessChanged: { narration: ({ name, event }) => `${name} ${Number(event.amount) < 0 ? 'lost' : 'gained'} ${Math.round(amount(event))}% readiness.`,
    label: ({ event }) => `${Number(event.amount) < 0 ? '−' : '+'}${Math.round(amount(event))}% readiness`, tone: numericTone,
    batch: event => event.amount ? `readiness:${sign(event)}` : null },
  pokemonMoved: { narration: ({ name, event }) => `${name} moved to position ${event.position}.`, label: 'Repositioned' },
  pokemonTransformed: { narration: ({ name, species }) => `${name} transformed into ${species}.`, label: 'Transformed' },
  weatherChanged: { narration: ({ event }) => event.weatherId ? `${event.weatherId} ${event.previousWeatherId === event.weatherId ? 'intensified' : 'began'}.` : 'The weather cleared.', subject: 'field' },
  phaseStarted: { narration: 'A new battle phase began.', subject: 'field' },
  battleEnded: { narration: ({ event }) => event.winner ? `${event.winner} won the battle.` : 'The battle ended.', subject: 'field' },
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
