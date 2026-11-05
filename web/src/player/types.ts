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
export type PlayerEnvelope = { discordUserId: string; trainer?: TrainerProfile | null };
export type PlayerResult = PlayerEnvelope & Partial<CollectionPage> & { pokemon?: PokemonDetail; party?: Party; battleId?: string };
export type NpcSpecies = { id: string; name: string; spriteUrl: string | null; ace: boolean };
export type NpcDifficulty = { id: string; name: string; minLevel: number; maxLevel: number; count: number;
  species: NpcSpecies[]; dailyClaimed: boolean; rewards: { name: string; quantity: number; icon: string | null }[] };
export type NpcEncounter = { id: string; name: string; displayName: string; spriteUrl: string | null; catchphrase: string;
  minLevel: number; maxLevel: number; difficulties: NpcDifficulty[] };
export type DungeonEncounter = { id: string; name: string; displayName: string; difficulties: { id: string; name: string }[] };
export type TowerFloor = { stage: number };
export type PlayerOperation = { kind: "npc.start"; npcId: string; difficulty: string } | { kind: "collection"; query: CollectionQuery } |
  { kind: "inspect"; pokemonId: string } |
  { kind: "party.place"; pokemonId: string; index: number; expectedOccupant: string | null } |
  { kind: "party.remove"; index: number; expectedOccupant: string };
