import type { BattleCatalog, BattleDisplay, BattleView, PokemonView, TargetPreview } from "../types";

export const own = "Star Team";
export const rival = "Rival Team";
const sprite = (id: string) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
const speciesRows: [string, string, string, string?][] = [
  ["157", "Typhlosion", "fire"], ["448", "Lucario", "fighting", "steel"],
  ["149", "Dragonite", "dragon", "flying"], ["282", "Gardevoir", "psychic", "fairy"],
  ["131", "Lapras", "water", "ice"], ["197", "Umbreon", "dark"],
  ["94", "Gengar", "ghost", "poison"], ["59", "Arcanine", "fire"],
  ["248", "Tyranitar", "rock", "dark"], ["407", "Roserade", "grass", "poison"],
  ["350", "Milotic", "water"], ["143", "Snorlax", "normal"],
];
export const baseCatalog: BattleCatalog = {
  rulesetVersion: 2,
  species: Object.fromEntries(speciesRows.map(([id, name, first, second]) => [id,
    { name, type: [first, second].filter((type): type is string => !!type), sprite: sprite(id), shinySprite: sprite(id) }])),
  moves: {
    flamethrower: { name: "Flamethrower", type: "fire", power: 90, accuracy: 100, damageType: "Special",
      targetPattern: "Single", description: "A stream of fire that can burn the target." },
    eruption: { name: "Eruption", type: "fire", power: 150, accuracy: 100, damageType: "Special",
      targetPattern: "All", description: "A volcanic burst across the enemy area." },
    quickattack: { name: "Quick Attack", type: "normal", power: 40, accuracy: 100, damageType: "Physical",
      targetPattern: "Single", description: "A sudden physical lunge." },
    sunnyday: { name: "Sunny Day", type: "fire", accuracy: 100, damageType: "Other",
      targetPattern: "Single", description: "Bright sunlight fills the field." },
    m33: { name: "Tackle", type: "normal", power: 55, accuracy: 100, damageType: "Physical",
      targetPattern: "Single", description: "Charge into one target." },
    m416: { name: "Giga Impact", type: "normal", power: 160, accuracy: 90, damageType: "Physical",
      targetPattern: "Column", description: "Charge at a target and its column." },
    m63: { name: "Hyper Beam", type: "normal", power: 160, accuracy: 90, damageType: "Special",
      targetPattern: "Column", description: "A powerful beam across a column." },
    m135: { name: "Soft-Boiled", type: "normal", damageType: "Other",
      targetPattern: "Single", description: "Heal one ally." },
    m47: { name: "Sing", type: "normal", accuracy: 75, damageType: "Other",
      targetPattern: "Row", description: "Put a row of targets to sleep." },
    m105: { name: "Recover", type: "normal", damageType: "Other",
      targetPattern: "Single", description: "Heal the user." },
  },
  effects: {
    shield: { name: "Shielded", type: "Buff", description: "Reduces incoming damage." },
    focus: { name: "Focused", type: "Buff", description: "Improves the next attack." },
    weakness: { name: "Weakened", type: "Debuff", description: "Deals less damage." },
  },
  abilities: { blaze: { name: "Blaze", description: "Strengthens Fire moves when HP is low." } },
  heldItems: { charcoal: { name: "Charcoal", description: "Strengthens Fire moves." } },
  statuses: {
    Burn: { name: "Burn", description: "Takes damage when status ticks and deals less attack damage." },
    Poison: { name: "Poison", description: "Takes damage when status ticks." },
  },
};

export const makePokemon = (id: string, teamName: string, position: number, hp: number,
  maxHp: number, readiness: number, extra: Partial<PokemonView> = {}): PokemonView => {
  const species = baseCatalog.species[id];
  return { id: `${teamName}-${id}`, speciesId: id, name: species.name, shiny: false,
    hp, maxHp, level: 55, isFainted: hp === 0, combatReadiness: readiness,
    position, teamName, type1: species.type[0], type2: species.type[1], status: {}, effectIds: {}, ...extra };
};
const members = [
  makePokemon("157", own, 1, 168, 204, 100, { abilityId: "blaze", heldItemId: "charcoal", moveIds: {
    flamethrower: { cooldown: 0, disabledCounter: 0 }, eruption: { cooldown: 0, disabledCounter: 0 },
    quickattack: { cooldown: 0, disabledCounter: 0 }, sunnyday: { cooldown: 0, disabledCounter: 0 } } }),
  makePokemon("448", own, 2, 126, 180, 72, { effectIds: { shield: { duration: 2 } } }),
  makePokemon("149", own, 3, 190, 220, 61), makePokemon("282", own, 4, 151, 190, 46),
  makePokemon("131", own, 5, 82, 205, 35, { status: { statusId: "Burn", turns: 2 } }),
  makePokemon("197", own, 6, 176, 188, 28),
  makePokemon("94", rival, 1, 115, 175, 89), makePokemon("59", rival, 2, 176, 202, 78),
  makePokemon("248", rival, 3, 224, 244, 59), makePokemon("407", rival, 4, 91, 160, 54),
  makePokemon("350", rival, 5, 178, 220, 42),
];
const pokemon = Object.fromEntries(members.map((entry) => [entry.id, entry]));
export const enemyTargets = members.filter((entry) => entry.teamName === rival).map((entry) => entry.id);

export const previews = (view: BattleView, ids: string[], area: boolean): TargetPreview[] => ids.map((id) => {
  const target = view.pokemon[id];
  const dimensions = view.teams[target.teamName];
  const patternTiles = area ? Array.from({ length: dimensions.rows * dimensions.cols }, (_, index) =>
    ({ teamName: target.teamName, position: index + 1 }))
    : [{ teamName: target.teamName, position: target.position }];
  return { primaryTargetPokemonId: id, targetPattern: area ? "All" : "Single", random: false,
    patternTiles, affectedPokemonIds: area ? ids : [id],
    emptyTileTargets: patternTiles.filter((tile) => !Object.values(view.pokemon).some((entry) =>
      entry.teamName === tile.teamName && entry.position === tile.position)) };
});

const baseView: BattleView = {
  battleId: "preview-battle", ended: false, winner: null, turn: 12,
  activePokemonId: `${own}-157`, weather: { weatherId: "Sun", duration: 3 },
  teams: { [own]: { rows: 2, cols: 4 }, [rival]: { rows: 2, cols: 4 } }, pokemon,
};
export const baseBattle: BattleDisplay = {
  battleId: "preview-battle", rulesetVersion: 2, revision: 17, status: "active", completionStatus: "none",
  mode: { type: "Trainer battle" }, myTeamNames: [own], isMyTurn: true, view: baseView,
  availableActions: { canSkip: true, moves: [
    { moveId: "flamethrower", targetPokemonIds: enemyTargets, targetPreviews: previews(baseView, enemyTargets, false) },
    { moveId: "eruption", targetPokemonIds: enemyTargets, targetPreviews: previews(baseView, enemyTargets, true) },
    { moveId: "quickattack", targetPokemonIds: enemyTargets, targetPreviews: previews(baseView, enemyTargets, false) },
    { moveId: "sunnyday", targetPokemonIds: [`${own}-157`],
      targetPreviews: previews(baseView, [`${own}-157`], false) },
  ] },
};
