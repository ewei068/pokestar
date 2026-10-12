/** Development-only fixture for reviewing the production battle screen. */
import { useState } from "react";
import { BattleScreen } from "../BattleScreen";
import type { PlaybackFrame } from "../playback";
import type { BattleCatalog, BattleDisplay, PokemonView, TargetPreview } from "../types";
import type { BattleSession } from "../useBattleSession";

const own = "Star Team";
const rival = "Rival Team";
const sprite = (id: string) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
const speciesRows: [string, string, string, string?][] = [
  ["157", "Typhlosion", "fire"], ["448", "Lucario", "fighting", "steel"],
  ["149", "Dragonite", "dragon", "flying"], ["282", "Gardevoir", "psychic", "fairy"],
  ["131", "Lapras", "water", "ice"], ["197", "Umbreon", "dark"],
  ["94", "Gengar", "ghost", "poison"], ["59", "Arcanine", "fire"],
  ["248", "Tyranitar", "rock", "dark"], ["407", "Roserade", "grass", "poison"],
  ["350", "Milotic", "water"],
];
const catalog: BattleCatalog = {
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
  },
  effects: { shield: { name: "Shielded", type: "Buff", description: "Reduces incoming damage." } },
  abilities: { blaze: { name: "Blaze", description: "Strengthens Fire moves when HP is low." } },
  heldItems: { charcoal: { name: "Charcoal", description: "Strengthens Fire moves." } },
  statuses: { Burn: { name: "Burn", description: "Takes damage when status ticks and deals less attack damage." } },
};
const makePokemon = (id: string, teamName: string, position: number, hp: number,
  maxHp: number, readiness: number, extra: Partial<PokemonView> = {}): PokemonView => {
  const species = catalog.species[id];
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
const previews = (ids: string[], area: boolean): TargetPreview[] => ids.map((id) => {
  const target = pokemon[id];
  const patternTiles = area ? Array.from({ length: 8 }, (_, index) => ({ teamName: target.teamName, position: index + 1 }))
    : [{ teamName: target.teamName, position: target.position }];
  return { primaryTargetPokemonId: id, targetPattern: area ? "All" : "Single", random: false,
    patternTiles, affectedPokemonIds: area ? enemyTargets : [id],
    emptyTileTargets: patternTiles.filter((tile) => !members.some((entry) =>
      entry.teamName === tile.teamName && entry.position === tile.position)) };
});
const fixture: BattleDisplay = {
  battleId: "preview-battle", rulesetVersion: 2, revision: 17, status: "active", completionStatus: "none",
  mode: { type: "Trainer battle" }, myTeamNames: [own], isMyTurn: true,
  view: { battleId: "preview-battle", ended: false, winner: null, turn: 12,
    activePokemonId: `${own}-157`, weather: { weatherId: "Sun", duration: 3 },
    teams: { [own]: { rows: 2, cols: 4 }, [rival]: { rows: 2, cols: 4 } }, pokemon },
  availableActions: { canSkip: true, moves: [
    { moveId: "flamethrower", targetPokemonIds: enemyTargets, targetPreviews: previews(enemyTargets, false) },
    { moveId: "eruption", targetPokemonIds: enemyTargets, targetPreviews: previews(enemyTargets, true) },
    { moveId: "quickattack", targetPokemonIds: enemyTargets, targetPreviews: previews(enemyTargets, false) },
    { moveId: "sunnyday", targetPokemonIds: [`${own}-157`], targetPreviews: previews([`${own}-157`], false) },
  ] },
};

export const BattleScreenPreview = () => {
  const [selectedMoveId, selectMove] = useState<string | null>(null);
  const [inspectedPokemonId, inspectPokemon] = useState<string | null>(null);
  const [playing, setPlaying] = useState<PlaybackFrame | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const session: BattleSession = {
    battle: fixture, loading: false, busy: false, error: null, notice,
    selectedMoveId, inspectedPokemonId, playing, history,
    refresh: async () => {}, selectMove, inspectPokemon,
    targetPokemon: (id: string) => {
      const option = fixture.availableActions.moves.find((move) => move.moveId === selectedMoveId);
      const preview = option?.targetPreviews?.find((entry) => entry.primaryTargetPokemonId === id);
      if (!preview) return;
      selectMove(null);
      const text = `${pokemon[`${own}-157`].name} used ${catalog.moves[selectedMoveId || ""]?.name}.`;
      setPlaying({ view: fixture.view, text, event: { type: "moveStarted", sequence: 0,
        pokemonId: `${own}-157`, primaryTargetId: id, targetIds: preview.affectedPokemonIds,
        patternTiles: preview.patternTiles } });
      setHistory((current) => [...current, text]);
      setNotice("Development preview: no action was sent.");
      window.setTimeout(() => setPlaying(null), 900);
    },
    skipTurn: () => setNotice("Development preview: no action was sent."),
  };
  return <BattleScreen catalog={catalog} session={session} />;
};
