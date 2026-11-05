import { QueryClient, queryOptions } from "@tanstack/react-query";
import { ApiError, request } from "../http";
import type { BattleSummary } from "../battles/types";
import type { TrainerProfile } from "../trainer/types";
import type { CollectionPage, CollectionQuery, DungeonEncounter, Party, NpcEncounter, PlayerEnvelope, PlayerOperation, PlayerResult, PokemonDetail, TowerFloor } from "./types";

/** One authenticated account's in-memory server data. Battle sessions remain separate. */
export class PlayerData {
  readonly client = new QueryClient({ defaultOptions: {
    queries: { staleTime: 10000, gcTime: 5 * 60000, refetchOnWindowFocus: true,
      refetchOnReconnect: true, retry: (count, error) => count < 1 && !(error instanceof ApiError) },
    mutations: { retry: false, networkMode: "always" },
  } });
  private epoch = 0;
  private closed = false;
  private busy = false;
  readonly prefix: readonly string[];

  constructor(readonly userId: string, private initialTrainer: TrainerProfile | null, private onAccountChanged: () => void) {
    this.prefix = ["player", userId];
    this.activate();
  }

  activate() {
    this.closed = false;
    if (!this.client.getQueryState([...this.prefix, "trainer"])) {
      this.client.setQueryData([...this.prefix, "trainer"], this.initialTrainer);
    }
  }

  dispose() {
    this.closed = true;
    this.epoch++;
    this.client.clear();
  }

  private async read<T extends PlayerEnvelope>(path: string, signal: AbortSignal): Promise<T> {
    const epoch = this.epoch;
    const result = await this.send<T>(path, { signal });
    if (this.closed || epoch !== this.epoch) throw new Error("session_closed");
    return result;
  }

  private async send<T extends PlayerEnvelope>(path: string, options: RequestInit = {}): Promise<T> {
    try {
      const result = await request<T>(path, { ...options, headers: { "X-Player-Id": this.userId } });
      if (result.discordUserId !== this.userId) throw new ApiError(409, "account_changed");
      return result;
    } catch (error) {
      if (!this.closed && error instanceof ApiError && (error.status === 401 || error.code === "account_changed")) this.onAccountChanged();
      throw error;
    }
  }

  trainer() {
    return queryOptions({ queryKey: [...this.prefix, "trainer"], refetchInterval: 30000,
      queryFn: async ({ signal }) => (await this.read<PlayerEnvelope>("/player/trainer", signal)).trainer ?? null });
  }

  collection(query: CollectionQuery) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== "") params.set(key, String(value));
    return queryOptions({ queryKey: [...this.prefix, "collection", query], refetchInterval: 15000,
      queryFn: async ({ signal }): Promise<CollectionPage> => this.read<CollectionPage & PlayerEnvelope>(`/player/collection?${params}`, signal) });
  }

  pokemon(id: string) {
    return queryOptions({ queryKey: [...this.prefix, "pokemon", id], refetchInterval: 15000,
      queryFn: async ({ signal }) => (await this.read<PlayerEnvelope & { pokemon: PokemonDetail }>(`/player/pokemon/${encodeURIComponent(id)}`, signal)).pokemon });
  }

  party() {
    return queryOptions({ queryKey: [...this.prefix, "party"], refetchInterval: 15000,
      queryFn: async ({ signal }) => (await this.read<PlayerEnvelope & { party: Party }>("/player/party", signal)).party });
  }

  npcs() {
    return queryOptions({ queryKey: [...this.prefix, "npcs"], refetchInterval: 15000,
      queryFn: async ({ signal }) => (await this.read<PlayerEnvelope & { npcs: NpcEncounter[] }>("/player/npcs", signal)).npcs });
  }

  dungeons() {
    return queryOptions({ queryKey: [...this.prefix, "dungeons"], refetchInterval: 15000,
      queryFn: async ({ signal }) => (await this.read<PlayerEnvelope & { dungeons?: DungeonEncounter[] }>("/player/dungeons", signal)).dungeons || [] });
  }

  tower() {
    return queryOptions({ queryKey: [...this.prefix, "tower"], refetchInterval: 15000,
      queryFn: async ({ signal }) => {
        const body = await this.read<PlayerEnvelope & { floors?: TowerFloor[]; lastTowerStage?: number }>("/player/tower", signal);
        return { floors: body.floors || [], lastTowerStage: body.lastTowerStage || 0 };
      } });
  }

  battles() {
    return queryOptions({ queryKey: [...this.prefix, "battles"], refetchInterval: 15000,
      queryFn: async ({ signal }) => (await this.read<PlayerEnvelope & { battles: BattleSummary[] }>("/player/battles", signal)).battles });
  }

  async refresh() {
    if (this.closed) return;
    await this.client.cancelQueries({ queryKey: this.prefix });
    await this.client.invalidateQueries({ queryKey: this.prefix });
  }

  /** Never replay a mutation after a timeout; reconcile through ungranted reads. */
  async perform(operation: PlayerOperation): Promise<PlayerResult> {
    if (this.closed) throw new Error("session_closed");
    if (this.busy) throw new Error("interaction_pending");
    this.busy = true;
    const epoch = this.epoch;
    try {
      await this.client.cancelQueries({ queryKey: this.prefix });
      if (this.closed || epoch !== this.epoch) throw new Error("session_closed");
      const result = await this.send<PlayerResult>("/player/interactions", { method: "POST", body: JSON.stringify(operation) });
      if (this.closed || epoch !== this.epoch) throw new Error("session_closed");
      await this.client.cancelQueries({ queryKey: this.prefix });
      const battleStart = operation.kind === "npc.start" || operation.kind === "dungeon.start" || operation.kind === "tower.start";
      const affected = (operation.kind === "party.place" || operation.kind === "party.remove" || battleStart) ? [this.prefix] : [
        this.trainer().queryKey,
        operation.kind === "inspect" ? this.pokemon(operation.pokemonId).queryKey : this.collection(operation.query).queryKey,
      ];
      await Promise.all(affected.map(queryKey => this.client.invalidateQueries({ queryKey, refetchType: "none" })));
      if (this.closed || epoch !== this.epoch) throw new Error("session_closed");
      if (result.trainer !== undefined) this.client.setQueryData(this.trainer().queryKey, result.trainer);
      if (operation.kind === "collection" && result.items && result.page !== undefined && result.pageSize !== undefined && result.total !== undefined && result.totalPages !== undefined) {
        this.client.setQueryData(this.collection(operation.query).queryKey, { items: result.items, page: result.page,
          pageSize: result.pageSize, total: result.total, totalPages: result.totalPages });
      }
      if (operation.kind === "inspect" && result.pokemon) this.client.setQueryData(this.pokemon(operation.pokemonId).queryKey, result.pokemon);
      if (result.party) this.client.setQueryData(this.party().queryKey, result.party);
      return result;
    } catch (error) {
      if (!this.closed && epoch === this.epoch) {
        if (operation.kind === "npc.start" || operation.kind === "dungeon.start" || operation.kind === "tower.start") void this.refresh();
        else await this.refresh();
      }
      throw error;
    } finally {
      this.busy = false;
      if (!this.closed && epoch === this.epoch) void this.client.refetchQueries({ queryKey: this.prefix, type: "active", stale: true });
    }
  }
}
