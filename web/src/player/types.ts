import type { TrainerProfile } from "../trainer/types";

export type PokemonSummary = {
  id: string; speciesId: string; speciesName: string; name: string; level: number;
  shiny: boolean; rarity: string; types: string[]; combatPower: number; ivPercent: number;
  inParty: boolean; spriteUrl: string | null; battleEligible: boolean;
};
export type OwnedMove = {
  id: string; name: string; type: string; damageType: string; power?: number;
  accuracy?: number; cooldown?: number; description: string;
};
export type PokemonDetail = PokemonSummary & {
  stats: number[]; ivs: number[]; evs: number[];
  nature: { name: string; raisedStat: number | null; loweredStat: number | null };
  moves: OwnedMove[]; ability: { name: string; description: string } | null;
  heldItem: { name: string; description: string } | null;
  exp: { current: number; required: number } | null;
};
export type PartyTarget = { kind: "add" | "replace" | "swap" | "move" | "disabled"; reason?: string };
export type Party = {
  rows: number; cols: number; capacity: number; slots: (PokemonSummary | null)[];
  targets: Record<string, PartyTarget[]>;
};
export type CollectionQuery = {
  page: number; pageSize: number; search: string; sort: "name" | "cp" | "iv" | "recent" | "level";
  order: "asc" | "desc"; rarity?: string; type?: string; shiny?: boolean; inParty?: boolean; minIv?: number;
};
export type CollectionPage = { items: PokemonSummary[]; page: number; pageSize: number; total: number; totalPages: number };
export type BagItem = {
  id: string; name: string; description: string; category: string; categoryName: string;
  quantity: number; icon: string | null;
};
export type PlayerEnvelope = { discordUserId: string; trainer?: TrainerProfile | null };
export type PlayerResult = PlayerEnvelope & Partial<CollectionPage> & { pokemon?: PokemonDetail; party?: Party; battleId?: string };
export type TrainingGains = { exp: number; evs: number[] };
export type TrainingLocation = {
  id: string; name: string; emoji: string; level: number; owned: boolean;
  nextGains: TrainingGains; canTrain: boolean;
};
export type TrainingContext = { pokemon: PokemonDetail; locations: TrainingLocation[] };
export type TrainingResult = PlayerEnvelope & TrainingContext & {
  trained: boolean; gains: TrainingGains; warning?: string;
};
export type NpcSpecies = { id: string; name: string; spriteUrl: string | null; ace: boolean };
export type NpcDifficulty = { id: string; name: string; minLevel: number; maxLevel: number; count: number;
  species: NpcSpecies[]; dailyClaimed: boolean; rewards: { name: string; quantity: number; icon: string | null }[] };
export type NpcEncounter = { id: string; name: string; displayName: string; spriteUrl: string | null; catchphrase: string;
  minLevel: number; maxLevel: number; difficulties: NpcDifficulty[] };
export type ModeReward = { kind: "money"; quantity: number; label: string } | { kind: "item"; id: string; name: string; quantity: number; icon: string | null };
export type ModeSpecies = { id: string; name: string; spriteUrl: string | null; boss: boolean };
export type DungeonDifficulty = { id: string; name: string; minLevel: number; maxLevel: number; species: ModeSpecies[]; rewards: ModeReward[] };
export type DungeonEncounter = { id: string; name: string; displayName: string; description: string; spriteUrl: string | null;
  subtitle: { icon: string; text: string } | null; difficulties: DungeonDifficulty[] };
export type TowerFloor = { stage: number; npcName: string; spriteUrl: string | null; difficultyName: string;
  minLevel: number; maxLevel: number; species: ModeSpecies[]; rewards: ModeReward[] };
export type PlayerOperation = { kind: "npc.start"; npcId: string; difficulty: string }
  | { kind: "dungeon.start"; dungeonId: string; difficulty: string } | { kind: "tower.start"; stage: number }
  | { kind: "collection"; query: CollectionQuery } |
  { kind: "inspect"; pokemonId: string } |
  { kind: "party.place"; pokemonId: string; index: number; expectedOccupant: string | null } |
  { kind: "party.remove"; index: number; expectedOccupant: string };
