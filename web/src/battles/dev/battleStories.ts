import type { PlaybackFrame } from "../playback";
import type { BattleCatalog, BattleDisplay, BattleView, PokemonView, TargetPreview } from "../types";

export const storyDefinitions = [
  { id: "ready", title: "Ready to act", description: "An ordinary turn with two dense formations." },
  { id: "area-target", title: "Area target", description: "Eruption is selected; hover a rival to inspect its full footprint." },
  { id: "effects", title: "Status and effects", description: "Statuses, buffs, debuffs, ability, and item details compete for space." },
  { id: "waiting", title: "Waiting for NPC", description: "The opponent has the turn and actions are unavailable." },
  { id: "playback", title: "Move playback", description: "A resolved area move lights occupied and empty tiles." },
  { id: "motion-tackle", title: "Tackle", description: "Normal physical single target: charge, strike, return." },
  { id: "motion-giga-impact", title: "Giga Impact", description: "Normal physical column: one charge, VFX on both tiles." },
  { id: "motion-hyper-beam", title: "Hyper Beam", description: "Normal special column: move into the target lane, affect both tiles." },
  { id: "motion-soft-boiled", title: "Soft-Boiled", description: "Normal status single ally: move into the ally's lane." },
  { id: "motion-sing", title: "Sing", description: "Normal status row: the same neutral VFX reaches occupied and empty tiles." },
  { id: "motion-recover", title: "Recover", description: "Self target: stay put while the user's tile receives VFX." },
  { id: "completed", title: "Completed result", description: "A finished battle is readable without action controls." },
  { id: "dense", title: "Dense and missing art", description: "Full formations, long names, mixed cues, and an absent sprite." },
] as const;

export type BattleStory = {
  id: string;
  title: string;
  description: string;
  catalog: BattleCatalog;
  battle: BattleDisplay;
  selectedMoveId: string | null;
  inspectedPokemonId: string | null;
  playing: PlaybackFrame | null;
  history: string[];
};

const own = "Star Team";
const rival = "Rival Team";
const sprite = (id: string) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
const speciesRows: [string, string, string, string?][] = [
  ["157", "Typhlosion", "fire"], ["448", "Lucario", "fighting", "steel"],
  ["149", "Dragonite", "dragon", "flying"], ["282", "Gardevoir", "psychic", "fairy"],
  ["131", "Lapras", "water", "ice"], ["197", "Umbreon", "dark"],
  ["94", "Gengar", "ghost", "poison"], ["59", "Arcanine", "fire"],
  ["248", "Tyranitar", "rock", "dark"], ["407", "Roserade", "grass", "poison"],
  ["350", "Milotic", "water"], ["143", "Snorlax", "normal"],
];
const baseCatalog: BattleCatalog = {
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

const makePokemon = (id: string, teamName: string, position: number, hp: number,
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
const enemyTargets = members.filter((entry) => entry.teamName === rival).map((entry) => entry.id);

const previews = (view: BattleView, ids: string[], area: boolean): TargetPreview[] => ids.map((id) => {
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
const baseBattle: BattleDisplay = {
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

const motionStories: Record<string, { moveId: string; targetId: string; pattern: "Single" | "Row" | "Column" }> = {
  "motion-tackle": { moveId: "m33", targetId: `${rival}-94`, pattern: "Single" },
  "motion-giga-impact": { moveId: "m416", targetId: `${rival}-59`, pattern: "Column" },
  "motion-hyper-beam": { moveId: "m63", targetId: `${rival}-248`, pattern: "Column" },
  "motion-soft-boiled": { moveId: "m135", targetId: `${own}-448`, pattern: "Single" },
  "motion-sing": { moveId: "m47", targetId: `${rival}-350`, pattern: "Row" },
  "motion-recover": { moveId: "m105", targetId: `${own}-157`, pattern: "Single" },
};

const motionFootprint = (view: BattleView, targetId: string, pattern: "Single" | "Row" | "Column") => {
  const target = view.pokemon[targetId];
  const dimensions = view.teams[target.teamName];
  const targetRow = Math.floor((target.position - 1) / dimensions.cols);
  const targetCol = (target.position - 1) % dimensions.cols;
  const patternTiles = Array.from({ length: dimensions.rows * dimensions.cols }, (_, index) => index + 1)
    .filter((position) => pattern === "Single" ? position === target.position
      : pattern === "Row" ? Math.floor((position - 1) / dimensions.cols) === targetRow
        : (position - 1) % dimensions.cols === targetCol)
    .map((position) => ({ teamName: target.teamName, position }));
  const affectedPokemonIds = Object.values(view.pokemon).filter((entry) => patternTiles.some((tile) =>
    tile.teamName === entry.teamName && tile.position === entry.position)).map((entry) => entry.id);
  return { primaryTargetPokemonId: targetId, targetPattern: pattern, random: false,
    patternTiles, affectedPokemonIds,
    emptyTileTargets: patternTiles.filter((tile) => !Object.values(view.pokemon).some((entry) =>
      entry.teamName === tile.teamName && entry.position === tile.position)) };
};

export const makeBattleStory = (requestedId: string | null): BattleStory => {
  const definition = storyDefinitions.find((item) => item.id === requestedId) || storyDefinitions[0];
  const catalog = structuredClone(baseCatalog);
  const battle = structuredClone(baseBattle);
  const story: BattleStory = {
    ...definition, catalog, battle, selectedMoveId: null, inspectedPokemonId: null,
    playing: null, history: [],
  };

  const motionStory = motionStories[definition.id];
  if (motionStory) {
    const { moveId, targetId, pattern } = motionStory;
    const move = catalog.moves[moveId];
    const footprint = motionFootprint(battle.view, targetId, pattern);
    battle.availableActions = { canSkip: false, moves: [{ moveId, targetPokemonIds: [targetId],
      targetPreviews: [footprint] }] };
    battle.isMyTurn = false;
    const text = `${battle.view.pokemon[battle.view.activePokemonId || ""]?.name || "Pokémon"} used ${move.name}.`;
    story.playing = { view: battle.view, text, event: {
      type: "moveStarted", sequence: 0, pokemonId: battle.view.activePokemonId || undefined,
      moveId, moveType: String(move.type), damageType: move.damageType,
      primaryTargetId: targetId, targetIds: footprint.affectedPokemonIds,
      patternTiles: footprint.patternTiles,
    } };
    story.history = [text];
    return story;
  }

  switch (definition.id) {
    case "area-target":
      story.selectedMoveId = "eruption";
      story.inspectedPokemonId = enemyTargets[0];
      break;
    case "effects":
      battle.view.pokemon[`${own}-448`].effectIds = {
        shield: { duration: 2 }, focus: { duration: 1 }, weakness: { duration: 3 },
      };
      battle.view.pokemon[`${rival}-94`].status = { statusId: "Poison", turns: 2 };
      story.inspectedPokemonId = `${own}-448`;
      break;
    case "waiting":
      battle.isMyTurn = false;
      battle.view.activePokemonId = `${rival}-94`;
      battle.availableActions = { canSkip: false, moves: [] };
      story.history = ["Typhlosion used Flamethrower.", "Gengar is preparing its turn."];
      break;
    case "playback": {
      battle.isMyTurn = false;
      battle.availableActions = { canSkip: false, moves: [] };
      const footprint = previews(battle.view, enemyTargets, true)[0];
      const text = "Typhlosion used Eruption.";
      story.playing = { view: battle.view, text, event: {
        type: "moveStarted", sequence: 0, pokemonId: `${own}-157`, moveId: "eruption",
        primaryTargetId: footprint.primaryTargetPokemonId,
        targetIds: footprint.affectedPokemonIds, patternTiles: footprint.patternTiles,
      } };
      story.history = [text];
      break;
    }
    case "completed":
      battle.status = "completed";
      battle.completionStatus = "completed";
      battle.isMyTurn = false;
      battle.availableActions = { canSkip: false, moves: [] };
      battle.view.ended = true;
      battle.view.winner = own;
      battle.view.activePokemonId = null;
      Object.values(battle.view.pokemon).filter((entry) => entry.teamName === rival).forEach((entry) => {
        entry.hp = 0;
        entry.isFainted = true;
      });
      story.history = ["The rival team fainted.", `${own} won the battle.`];
      break;
    case "dense": {
      battle.view.pokemon[`${own}-157`].name = "Typhlosion of the Endless Horizon";
      battle.view.pokemon[`${rival}-248`].name = "Tyranitar with a Remarkably Long Name";
      for (const [id, team, position] of [
        ["143", own, 7], ["350", own, 8], ["157", rival, 6],
        ["131", rival, 7], ["143", rival, 8],
      ] as const) {
        const entry = makePokemon(id, team, position, 160, 200, 40);
        battle.view.pokemon[entry.id] = entry;
      }
      battle.view.pokemon[`${own}-143`].effectIds = { focus: { duration: 1 }, weakness: { duration: 3 } };
      battle.view.pokemon[`${rival}-143`].status = { statusId: "Poison", turns: 2 };
      catalog.species["350"].sprite = "";
      catalog.species["350"].shinySprite = "";
      const targets = Object.values(battle.view.pokemon).filter((entry) => entry.teamName === rival).map((entry) => entry.id);
      battle.availableActions.moves = battle.availableActions.moves.map((choice) => choice.moveId === "sunnyday" ? choice
        : { ...choice, targetPokemonIds: targets,
          targetPreviews: previews(battle.view, targets, choice.moveId === "eruption") });
      break;
    }
  }
  return story;
};
