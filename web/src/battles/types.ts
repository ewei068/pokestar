export type PokemonView = {
  id: string;
  speciesId: string;
  name: string;
  shiny: boolean;
  hp: number;
  maxHp: number;
  level: number;
  isFainted: boolean;
  combatReadiness: number;
  position: number;
  teamName: string;
  type1: string;
  type2?: string | null;
  status: { statusId?: string | null; turns?: number };
  effectIds: Record<string, { duration?: number }>;
  moveIds?: Record<string, { cooldown: number; disabledCounter: number }>;
  abilityId?: string;
  heldItemId?: string | null;
};

export type BattleView = {
  battleId: string;
  ended: boolean;
  winner: string | null;
  turn: number;
  activePokemonId: string | null;
  weather: { weatherId?: string | null; duration: number };
  teams: Record<string, { rows: number; cols: number }>;
  pokemon: Record<string, PokemonView>;
};

export type BattleEvent = {
  type: string;
  sequence: number;
  action?: string;
  pokemonId?: string;
  sourcePokemonId?: string | null;
  targetPokemonId?: string;
  moveId?: string;
  patternTiles?: BattleTile[];
  amount?: number;
  hp?: number;
  statusId?: string;
  effectId?: string;
  winner?: string;
};

export type BattleTile = { teamName: string; position: number };

export type TargetPreview = {
  primaryTargetPokemonId: string;
  targetPattern: string;
  random: boolean;
  patternTiles: BattleTile[];
  affectedPokemonIds: string[];
  emptyTileTargets: BattleTile[];
};

export type BattleAction = { action: "skipTurn" } | {
  action: "useMove";
  moveId: string;
  targetPokemonId: string;
};

export type BattleUpdate = {
  revision: number;
  action: BattleAction;
  events: BattleEvent[];
  log: string[];
  view?: BattleView;
};

export type BattleResponse = {
  found: true;
  battleId: string;
  stateId: string;
  rulesetVersion: number;
  revision: number;
  status: string;
  completionStatus: string;
  mode: { type?: string };
  myTeamNames: string[];
  isMyTurn: boolean;
  view: BattleView;
  availableActions: {
    canSkip: boolean;
    moves: { moveId: string; targetPokemonIds: string[]; targetPreviews?: TargetPreview[] }[];
  };
  updates: BattleUpdate[];
  accepted?: boolean;
  duplicate?: boolean;
  reason?: string;
};

/** The participant projection the screen needs; transport metadata stays in the session. */
export type BattleDisplay = Pick<BattleResponse,
  "battleId" | "rulesetVersion" | "revision" | "status" | "completionStatus" |
  "mode" | "myTeamNames" | "isMyTurn" | "view" | "availableActions">;

export type BattleSummary = {
  battleId: string;
  revision: number;
  mode: { type?: string };
  turn: number;
  updatedAt: string;
  expiresAt: string;
};

export type BattleCatalog = {
  rulesetVersion: number;
  species: Record<string, {
    name: string;
    type: string[];
    sprite: string;
    shinySprite: string;
  }>;
  moves: Record<string, {
    name: string;
    type: string;
    power?: number;
    accuracy?: number;
    cooldown?: number;
    damageType?: string;
    targetPattern?: string;
    description?: string;
  }>;
  effects: Record<string, { name?: string; description?: string }>;
  abilities: Record<string, { name?: string; description?: string }>;
  heldItems: Record<string, { name?: string; description?: string }>;
};
