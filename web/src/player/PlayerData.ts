import { QueryClient, queryOptions } from "@tanstack/react-query";
import { ApiError, request } from "../http";
import type { BattleSummary } from "../battles/types";
import type { TrainerProfile } from "../trainer/types";
import type { BagItem, CollectionPage, CollectionQuery, DungeonEncounter, Party, NpcEncounter, PlayerEnvelope, PlayerOperation, PlayerResult, PokemonDetail, PokemonSummary, PokemonBuildContext, PokemonBuildResult, EquipmentSnapshot, PokemonEquipmentContext, PokemonEquipmentResult, TrainingContext, TrainingResult, TowerFloor } from "./types";

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
  private uncertainBuildId: string | null = null;
  get needsBuildRefresh() { return this.uncertainBuildId !== null; }
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
    if (this.closed || epoch !== this.epoch || signal.aborted) throw new Error("session_closed");
    return result;
  }

  private async send<T extends PlayerEnvelope>(path: string, options: RequestInit = {}): Promise<T> {
    const epoch = this.epoch;
    try {
      const result = await request<T>(path, { ...options, headers: { "X-Player-Id": this.userId } });
      if (result.discordUserId !== this.userId) throw new ApiError(409, "account_changed");
      return result;
    } catch (error) {
      if (!this.closed && epoch === this.epoch && error instanceof ApiError && (error.status === 401 || error.code === "account_changed")) this.onAccountChanged();
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

  training(id: string, isCurrent: () => boolean = () => true) {
    return queryOptions({ queryKey: [...this.prefix, "training", id], retry: false,
      queryFn: async ({ signal }): Promise<TrainingContext> => {
        const result = await this.read<TrainingContext & PlayerEnvelope>(`/player/pokemon/${encodeURIComponent(id)}/training`, signal);
        if (!isCurrent()) throw new Error("context_closed");
        this.installTraining(id, result);
        return { pokemon: result.pokemon, locations: result.locations };
      } });
  }

  private installTraining(id: string, result: TrainingContext & PlayerEnvelope) {
    if (result.trainer !== undefined) this.client.setQueryData(this.trainer().queryKey, result.trainer);
    this.client.setQueryData(this.pokemon(id).queryKey, result.pokemon);
  }

  /** Read current state after an uncertain operation; never replay the write. */
  async refreshTraining(id: string, isCurrent: () => boolean = () => true) {
    if (this.closed) return;
    const epoch = this.epoch;
    await this.client.cancelQueries({ queryKey: this.training(id).queryKey });
    if (this.closed || epoch !== this.epoch || !isCurrent()) return;
    await this.client.fetchQuery({ ...this.training(id, isCurrent), staleTime: 0 });
  }

  /** Reconcile membership and sort order once after a training session. */
  async refreshTrainingSummaries() {
    if (this.closed) return;
    await Promise.all(["collection", "party"].map(kind =>
      this.client.refetchQueries({ queryKey: [...this.prefix, kind], type: "all", stale: true })));
  }

  async train(id: string, locationId: string, isCurrent: () => boolean = () => true): Promise<TrainingResult> {
    if (this.closed) throw new Error("session_closed");
    if (this.busy) throw new Error("interaction_pending");
    this.busy = true;
    const epoch = this.epoch;
    let submitted = false;
    const check = () => {
      if (this.closed || epoch !== this.epoch) throw new Error("session_closed");
      if (!isCurrent()) throw new Error("context_closed");
    };
    try {
      await this.client.cancelQueries({ queryKey: this.prefix });
      check();
      await Promise.all(["collection", "party"].map(kind => this.client.invalidateQueries({
        queryKey: [...this.prefix, kind], refetchType: "none",
      })));
      check();
      submitted = true;
      const result = await this.send<TrainingResult>(`/player/pokemon/${encodeURIComponent(id)}/train`, {
        method: "POST", body: JSON.stringify({ locationId }),
      });
      check();
      await this.client.cancelQueries({ queryKey: this.prefix });
      check();
      this.installTraining(id, result);
      this.client.setQueryData(this.training(id).queryKey, { pokemon: result.pokemon, locations: result.locations });
      const patch = (summary: PokemonSummary) => summary.id === id ? { ...summary, ...result.pokemon } : summary;
      this.client.setQueriesData<CollectionPage>({ queryKey: [...this.prefix, "collection"] }, page =>
        page ? { ...page, items: page.items.map(patch) } : page);
      this.client.setQueriesData<Party>({ queryKey: this.party().queryKey }, party =>
        party ? { ...party, slots: party.slots.map(slot => slot ? patch(slot) : slot) } : party);
      await Promise.all(["collection", "party"].map(kind => this.client.invalidateQueries({
        queryKey: [...this.prefix, kind], refetchType: "none",
      })));
      check();
      return result;
    } finally {
      if (submitted && !this.closed && epoch === this.epoch) {
        const previews = [this.build(id).queryKey, this.equipment(id).queryKey];
        await Promise.all(previews.map(queryKey => this.client.cancelQueries({ queryKey })));
        if (!this.closed && epoch === this.epoch) await Promise.all(previews.map(queryKey =>
          this.client.invalidateQueries({ queryKey, refetchType: "none" })));
      }
      if (submitted && !this.closed && epoch === this.epoch && !isCurrent()) {
        // Departure can finish pre-write reads before the submitted tick settles.
        // Reconcile from fresh reads without installing the departed feature's result.
        const affected = [this.trainer().queryKey, this.pokemon(id).queryKey, this.training(id).queryKey,
          [...this.prefix, "collection"], this.party().queryKey];
        await Promise.all(affected.map(queryKey => this.client.cancelQueries({ queryKey })));
        if (!this.closed && epoch === this.epoch) {
          await Promise.all(affected.map(queryKey => this.client.invalidateQueries({ queryKey })));
        }
      }
      this.busy = false;
    }
  }

  build(id: string, isCurrent: () => boolean = () => true) {
    return queryOptions({ queryKey: [...this.prefix, "build", id], retry: false, refetchInterval: 15000,
      queryFn: async ({ signal }): Promise<PokemonBuildContext> => {
        const result = await this.read<PokemonBuildContext & PlayerEnvelope>(`/player/pokemon/${encodeURIComponent(id)}/build`, signal);
        if (!isCurrent()) throw new Error("context_closed");
        this.client.setQueryData(this.pokemon(id).queryKey, result.pokemon);
        return result;
      } });
  }

  equipment(id: string, isCurrent: () => boolean = () => true) {
    return queryOptions({ queryKey: [...this.prefix, "equipment", id], retry: false, refetchInterval: 15000,
      queryFn: async ({ signal }): Promise<PokemonEquipmentContext> => {
        const result = await this.read<PokemonEquipmentContext & PlayerEnvelope>(`/player/pokemon/${encodeURIComponent(id)}/equipment`, signal);
        if (!isCurrent()) throw new Error("context_closed");
        this.client.setQueryData(this.pokemon(id).queryKey, result.pokemon);
        if (result.trainer !== undefined) this.client.setQueryData(this.trainer().queryKey, result.trainer);
        return result;
      } });
  }

  async refreshBuild(id: string, isCurrent: () => boolean = () => true) {
    if (this.closed) return;
    if (this.busy) throw new Error("interaction_pending");
    const epoch = this.epoch;
    const uncertainId = this.uncertainBuildId;
    const ids = [...new Set([id, ...(this.uncertainBuildId ? [this.uncertainBuildId] : [])])];
    const affected = [...ids.flatMap(value => [this.build(value).queryKey, this.equipment(value).queryKey]),
      this.bag().queryKey, this.trainer().queryKey];
    await Promise.all(affected.map(queryKey => this.client.cancelQueries({ queryKey })));
    if (this.closed || epoch !== this.epoch || !isCurrent()) return;
    const reconcileAbsence = (error: unknown) => {
      // Absence is an authoritative read too; the missing target stays unavailable in its query.
      if (!(error instanceof ApiError && error.status === 404)) throw error;
    };
    await Promise.all([...ids.flatMap(value => [
      this.client.fetchQuery({ ...this.build(value, isCurrent), staleTime: 0 }).catch(reconcileAbsence),
      this.client.fetchQuery({ ...this.equipment(value, isCurrent), staleTime: 0 }).catch(reconcileAbsence),
    ]), this.client.fetchQuery({ ...this.bag(), staleTime: 0 }), this.client.fetchQuery({ ...this.trainer(), staleTime: 0 })]);
    if (!this.closed && epoch === this.epoch && isCurrent() && this.uncertainBuildId === uncertainId) this.uncertainBuildId = null;
  }

  changeNature(id: string, natureId: string, expectedNatureId: string, isCurrent: () => boolean = () => true) {
    return this.changePokemon<PokemonBuildResult>(id, "nature", { natureId, expectedNatureId }, this.build(id).queryKey, isCurrent);
  }

  changeHeldItem(id: string, heldItemId: string | null, expectedHeldItemId: string | null, isCurrent: () => boolean = () => true) {
    return this.changePokemon<PokemonBuildResult>(id, "held-item", { heldItemId, expectedHeldItemId }, this.build(id).queryKey, isCurrent);
  }

  upgradeEquipment(id: string, equipmentType: string, expectedEquipment: EquipmentSnapshot, isCurrent: () => boolean = () => true) {
    return this.changePokemon<PokemonEquipmentResult>(id, "equipment/upgrade", { equipmentType, expectedEquipment }, this.equipment(id).queryKey, isCurrent);
  }

  rerollEquipment(id: string, equipmentType: string, slotId: string, expectedEquipment: EquipmentSnapshot, isCurrent: () => boolean = () => true) {
    return this.changePokemon<PokemonEquipmentResult>(id, "equipment/reroll", { equipmentType, slotId, expectedEquipment }, this.equipment(id).queryKey, isCurrent);
  }

  private async changePokemon<Result extends PlayerEnvelope & { pokemon: PokemonDetail; items: BagItem[]; warning?: string }>(
    id: string, action: "nature" | "held-item" | "equipment/upgrade" | "equipment/reroll", input: object,
    resultKey: readonly unknown[], isCurrent: () => boolean): Promise<Result> {
    if (this.closed) throw new Error("session_closed");
    if (this.busy) throw new Error("interaction_pending");
    if (this.needsBuildRefresh) throw new Error("build_refresh_required");
    this.busy = true;
    const epoch = this.epoch;
    let submitted = false;
    let responseKnown = false;
    const affected = [this.trainer().queryKey, this.pokemon(id).queryKey, this.build(id).queryKey, this.equipment(id).queryKey,
      this.training(id).queryKey, this.bag().queryKey, [...this.prefix, "collection"], this.party().queryKey];
    const check = () => {
      if (this.closed || epoch !== this.epoch) throw new Error("session_closed");
      if (!isCurrent()) throw new Error("context_closed");
    };
    try {
      await Promise.all(affected.map(queryKey => this.client.cancelQueries({ queryKey })));
      check();
      submitted = true;
      const result = await this.send<Result>(`/player/pokemon/${encodeURIComponent(id)}/${action}`, {
        method: "POST", body: JSON.stringify(input),
      });
      responseKnown = true;
      if (result.warning) this.uncertainBuildId = id;
      check();
      await Promise.all(affected.map(queryKey => this.client.cancelQueries({ queryKey })));
      check();
      this.client.setQueryData(this.pokemon(id).queryKey, result.pokemon);
      this.client.setQueryData(resultKey, result);
      this.client.setQueryData(this.bag().queryKey, result.items);
      if (result.trainer !== undefined) this.client.setQueryData(this.trainer().queryKey, result.trainer);
      return result;
    } catch (error) {
      if (submitted && !responseKnown && !this.closed && epoch === this.epoch
        && (!(error instanceof ApiError) || error.status >= 500)) this.uncertainBuildId = id;
      throw error;
    } finally {
      if (submitted && !this.closed && epoch === this.epoch) {
        await Promise.all(affected.map(queryKey => this.client.cancelQueries({ queryKey })));
        if (!this.closed && epoch === this.epoch) await Promise.all(affected.map(queryKey =>
          this.client.invalidateQueries({ queryKey, refetchType: isCurrent() ? "none" : "active" })));
      }
      this.busy = false;
    }
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

  bag() {
    return queryOptions({ queryKey: [...this.prefix, "bag"], refetchInterval: 15000,
      queryFn: async ({ signal }) => (await this.read<PlayerEnvelope & { items?: BagItem[] }>("/player/bag", signal)).items || [] });
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
