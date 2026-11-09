import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { PlayerData } from "./PlayerData";
import type { PokemonDetail } from "./types";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const json = (data: unknown) => new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
const pokemonFixture: PokemonDetail = {
  id: "one", speciesId: "25", speciesName: "Pikachu", name: "Pikachu", level: 20,
  shiny: false, rarity: "Rare", types: ["Electric"], combatPower: 123, ivPercent: 90,
  inParty: false, spriteUrl: null, battleEligible: true,
  stats: [10, 20, 30, 40, 50, 60], ivs: [1, 1, 1, 1, 1, 1], evs: [0, 0, 0, 0, 0, 0],
  nature: { name: "Hardy", raisedStat: null, loweredStat: null }, moves: [], ability: null, heldItem: null,
  exp: { current: 20, required: 100 },
};
const query = { page: 1, pageSize: 20, search: "", sort: "name", order: "asc" } as const;
it("rejects responses belonging to a different signed-in account", async () => {
  let changes = 0;
  const data = new PlayerData("alice", null, () => { changes++; });
  globalThis.fetch = async () => json({ discordUserId: "bob", items: [] });
  await assert.rejects(data.client.fetchQuery(data.collection(query)), /account_changed/);
  assert.equal(changes, 1);
  assert.equal(data.client.getQueryData(data.collection(query).queryKey), undefined);
  data.dispose();
});
it("does not retry an ambiguous mutation and refreshes stale data", async () => {
  let posts = 0;
  const data = new PlayerData("alice", null, () => {});
  data.client.setQueryData(data.party().queryKey, { rows: 3, cols: 4, capacity: 6, slots: [], targets: {} });
  globalThis.fetch = async (_url, init) => {
    if (init?.method === "POST") { posts++; throw new TypeError("connection lost"); }
    return json({ discordUserId: "alice", party: { rows: 3, cols: 4, capacity: 6, slots: [], targets: {} } });
  };
  await assert.rejects(data.perform({ kind: "party.remove", index: 0, expectedOccupant: "one" }));
  assert.equal(posts, 1);
  assert.equal(data.client.getQueryState(data.party().queryKey)?.isInvalidated, true);
  data.dispose();
});
it("suppresses duplicate submission and never installs a result after disposal", async () => {
  let finish!: (value: Response) => void;
  let posts = 0;
  const data = new PlayerData("alice", null, () => {});
  globalThis.fetch = async () => { posts++; return await new Promise(resolve => { finish = resolve; }); };
  const first = data.perform({ kind: "inspect", pokemonId: "one" });
  await new Promise(resolve => setTimeout(resolve, 0));
  await assert.rejects(data.perform({ kind: "inspect", pokemonId: "one" }), /interaction_pending/);
  data.dispose();
  finish(json({ discordUserId: "alice", pokemon: { id: "one" } }));
  await assert.rejects(first, /session_closed/);
  assert.equal(posts, 1);
  assert.equal(data.client.getQueryCache().getAll().length, 0);
});
it("cancels an old party read before installing the command result", async () => {
  let finish!: (value: Response) => void;
  const data = new PlayerData("alice", null, () => {});
  const before = { rows: 3, cols: 4, capacity: 6, slots: [], targets: {} };
  const after = { ...before, capacity: 5 };
  globalThis.fetch = async (_url, init) => {
    if (init?.method === "POST") return json({ discordUserId: "alice", party: after });
    return await new Promise(resolve => { finish = resolve; });
  };
  const old = data.client.fetchQuery(data.party()).catch(() => undefined);
  await new Promise(resolve => setTimeout(resolve, 0));
  await data.perform({ kind: "party.remove", index: 0, expectedOccupant: "one" });
  finish(json({ discordUserId: "alice", party: before }));
  await old;
  assert.deepEqual(data.client.getQueryData(data.party().queryKey), after);
  data.dispose();
});
it("reads the bag for the signed-in account and rejects a mismatched actor", async () => {
  const calls: string[] = [];
  const data = new PlayerData("alice", null, () => {});
  globalThis.fetch = async (url, init) => {
    assert.notEqual(init?.method, "POST");
    calls.push(String(url));
    return json({ discordUserId: "alice", items: [{ id: "0", quantity: 24 }] });
  };
  assert.deepEqual(await data.client.fetchQuery(data.bag()), [{ id: "0", quantity: 24 }]);
  assert.match(calls[0], /\/player\/bag$/);
  data.dispose();
  let changes = 0;
  const mismatch = new PlayerData("alice", null, () => { changes++; });
  globalThis.fetch = async () => json({ discordUserId: "bob", items: [] });
  await assert.rejects(mismatch.client.fetchQuery(mismatch.bag()), /account_changed/);
  assert.equal(changes, 1);
  mismatch.dispose();
});
it("background reads never use the granted interaction endpoint", async () => {
  const calls: string[] = [];
  const data = new PlayerData("alice", null, () => {});
  globalThis.fetch = async (url, init) => {
    assert.notEqual(init?.method, "POST");
    assert.equal((init?.headers as Record<string, string>)["X-Player-Id"], "alice");
    calls.push(String(url));
    return json({ discordUserId: "alice", items: [], page: 1, pageSize: 20, total: 0, totalPages: 1 });
  };
  await data.client.fetchQuery(data.collection(query));
  assert.equal(calls.length, 1);
  assert.match(calls[0], /\/player\/collection\?/);
  data.dispose();
});

it("does not send a queued interaction after signing out", async () => {
  let requests = 0;
  const data = new PlayerData("alice", null, () => {});
  globalThis.fetch = async () => { requests++; return json({ discordUserId: "alice" }); };
  const pending = data.perform({ kind: "inspect", pokemonId: "one" });
  data.dispose();
  await assert.rejects(pending, /session_closed/);
  assert.equal(requests, 0);
  assert.equal(data.client.getQueryCache().getAll().length, 0);
});
it("inspection leaves collection, party and previously inspected details fresh", async () => {
  const data = new PlayerData("alice", null, () => {});
  const keys = [data.collection(query).queryKey, data.party().queryKey, data.pokemon("previous").queryKey];
  for (const key of keys) data.client.setQueryData<unknown>(key, { id: "cached" });
  globalThis.fetch = async () => json({ discordUserId: "alice", pokemon: { id: "next" } });
  await data.perform({ kind: "inspect", pokemonId: "next" });
  for (const key of keys) assert.equal(data.client.getQueryState(key)?.isInvalidated, false);
  data.dispose();
});
it("starts an ordinary NPC battle and invalidates encounter data", async () => {
  const data = new PlayerData("alice", null, () => {});
  globalThis.fetch = async (_url, init) => {
    assert.deepEqual(JSON.parse(String(init?.body)), { kind: "npc.start", npcId: "blue", difficulty: "easy" });
    return json({ discordUserId: "alice", battleId: "battle-one" });
  };
  const result = await data.perform({ kind: "npc.start", npcId: "blue", difficulty: "easy" });
  assert.equal(result.battleId, "battle-one");
  data.dispose();
});
it("releases a failed start without waiting for background refresh", async () => {
  const data = new PlayerData("alice", null, () => {});
  let posts = 0;
  globalThis.fetch = async (_url, init) => {
    if (init?.method === "POST") { posts++; throw new TypeError("response lost"); }
    return new Promise(() => {});
  };
  await assert.rejects(data.perform({ kind: "npc.start", npcId: "blue", difficulty: "easy" }));
  await assert.rejects(data.perform({ kind: "npc.start", npcId: "blue", difficulty: "easy" }));
  assert.equal(posts, 2);
  data.dispose();
});

it("reads training context without a granted action and caches its detail/profile", async () => {
  const data = new PlayerData("alice", null, () => {});
  const pokemon = { ...pokemonFixture };
  const trainer = { level: 5, money: 90 };
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /\/player\/pokemon\/one\/training$/);
    assert.notEqual(init?.method, "POST");
    return json({ discordUserId: "alice", pokemon, trainer, locations: [{ id: "0" }] });
  };
  const context = await data.client.fetchQuery(data.training("one"));
  assert.deepEqual(context.pokemon, pokemon);
  assert.deepEqual(data.client.getQueryData(data.pokemon("one").queryKey), pokemon);
  assert.deepEqual(data.client.getQueryData(data.trainer().queryKey), trainer);
  data.dispose();
});

it("training patches matching summaries, preserves page membership and marks them stale without reads", async () => {
  const data = new PlayerData("alice", null, () => {});
  const before = { ...pokemonFixture };
  const other = { ...pokemonFixture, id: "two", level: 60 };
  const pokemon = { ...before, level: 21 };
  const page = { items: [before, other], page: 1, pageSize: 20, total: 2, totalPages: 1 };
  data.client.setQueryData(data.collection(query).queryKey, page);
  data.client.setQueryData(data.party().queryKey, { slots: [null, before], targets: {}, rows: 1, cols: 2, capacity: 2 });
  let requests = 0;
  globalThis.fetch = async (url, init) => {
    requests++;
    assert.match(String(url), /\/player\/pokemon\/one\/train$/);
    assert.deepEqual(JSON.parse(String(init?.body)), { locationId: "0" });
    return json({ discordUserId: "alice", pokemon, locations: [], trained: true, gains: { exp: 7, evs: [0, -2, 0, 0, 0, 0] } });
  };
  await data.train("one", "0");
  assert.equal(requests, 1);
  assert.deepEqual(data.client.getQueryData(data.collection(query).queryKey), { ...page, items: [pokemon, other] });
  assert.equal(data.client.getQueryState(data.collection(query).queryKey)?.isInvalidated, true);
  assert.equal(data.client.getQueryState(data.party().queryKey)?.isInvalidated, true);
  assert.equal(data.client.getQueryState(data.training("one").queryKey)?.isInvalidated, false);
  data.dispose();
});

it("training shares the interaction write gate and ignores an obsolete feature response", async () => {
  const data = new PlayerData("alice", null, () => {});
  let finish!: (response: Response) => void;
  let current = true;
  globalThis.fetch = async () => new Promise(resolve => { finish = resolve; });
  const tick = data.train("one", "0", () => current);
  await new Promise(resolve => setTimeout(resolve, 0));
  await assert.rejects(data.perform({ kind: "inspect", pokemonId: "one" }), /interaction_pending/);
  await assert.rejects(data.train("one", "0"), /interaction_pending/);
  current = false;
  finish(json({ discordUserId: "alice", pokemon: pokemonFixture, locations: [], gains: { exp: 9, evs: [] }, trained: true }));
  await assert.rejects(tick, /context_closed/);
  assert.equal(data.client.getQueryData(data.pokemon("one").queryKey), undefined);
  data.dispose();
});

it("a delayed training read cannot replace an accepted training response", async () => {
  const data = new PlayerData("alice", null, () => {});
  let finish!: (response: Response) => void;
  globalThis.fetch = async (_url, init) => init?.method === "POST"
    ? json({ discordUserId: "alice", pokemon: { ...pokemonFixture, level: 21 }, locations: [], trained: true, gains: { exp: 3, evs: [] } })
    : new Promise(resolve => { finish = resolve; });
  const read = data.client.fetchQuery(data.training("one")).catch(() => undefined);
  await new Promise(resolve => setTimeout(resolve, 0));
  await data.train("one", "0");
  finish(json({ discordUserId: "alice", pokemon: { ...pokemonFixture }, locations: [] }));
  await read;
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(data.client.getQueryData<{ pokemon: { level: number } }>(data.training("one").queryKey)?.pokemon.level, 21);
  assert.equal(data.client.getQueryData<{ level: number }>(data.pokemon("one").queryKey)?.level, 21);
  data.dispose();
});

it("does not retry a lost training response or replace its last confirmed snapshot", async () => {
  const data = new PlayerData("alice", null, () => {});
  data.client.setQueryData(data.pokemon("one").queryKey, { ...pokemonFixture });
  let posts = 0;
  globalThis.fetch = async (_url, init) => {
    assert.equal(init?.method, "POST");
    posts++;
    throw new TypeError("response lost");
  };
  await assert.rejects(data.train("one", "0"), /response lost/);
  assert.equal(posts, 1);
  assert.deepEqual(data.client.getQueryData(data.pokemon("one").queryKey), { ...pokemonFixture });
  data.dispose();
});

it("never installs a training result or starts a queued write after account disposal", async () => {
  const data = new PlayerData("alice", null, () => {});
  let requests = 0;
  let finish!: (response: Response) => void;
  globalThis.fetch = async () => { requests++; return new Promise(resolve => { finish = resolve; }); };
  const training = data.train("one", "0");
  await new Promise(resolve => setTimeout(resolve, 0));
  data.dispose();
  finish(json({ discordUserId: "alice", pokemon: pokemonFixture, locations: [], trained: true, gains: { exp: 2, evs: [] } }));
  await assert.rejects(training, /session_closed/);
  await assert.rejects(data.train("one", "0"), /session_closed/);
  assert.equal(requests, 1);
  assert.equal(data.client.getQueryCache().getAll().length, 0);
});

it("reconciles stale summaries once after training without reading unrelated account data", async () => {
  const data = new PlayerData("alice", null, () => {});
  const page = { items: [{ ...pokemonFixture }], page: 1, pageSize: 20, total: 1, totalPages: 1 };
  data.client.setQueryData(data.collection(query).queryKey, page);
  data.client.setQueryData(data.party().queryKey, { slots: [], targets: {}, rows: 1, cols: 1, capacity: 1 });
  const reads: string[] = [];
  globalThis.fetch = async (url, init) => {
    if (init?.method === "POST") return json({ discordUserId: "alice", pokemon: { ...pokemonFixture, level: 21 }, locations: [], trained: true, gains: { exp: 2, evs: [] } });
    reads.push(String(url));
    return json(String(url).includes("/collection?") ? { discordUserId: "alice", ...page }
      : { discordUserId: "alice", party: { slots: [], targets: {}, rows: 1, cols: 1, capacity: 1 } });
  };
  await data.client.fetchQuery({ ...data.collection(query), staleTime: 0 });
  await data.client.fetchQuery({ ...data.party(), staleTime: 0 });
  reads.length = 0;
  await data.train("one", "0");
  assert.equal(reads.length, 0);
  await data.refreshTrainingSummaries();
  assert.equal(reads.length, 2);
  assert.ok(reads.every(url => url.includes("/collection?") || url.endsWith("/party")));
  await data.refreshTrainingSummaries();
  assert.equal(reads.length, 2);
  data.dispose();
});

it("reconciles fresh pre-write caches when a submitted tick settles after leaving Train", async t => {
  const data = new PlayerData("alice", null, () => {});
  t.after(() => data.dispose());
  const page = { items: [{ ...pokemonFixture }], page: 1, pageSize: 20, total: 1, totalPages: 1 };
  const party = { slots: [{ ...pokemonFixture }], targets: {}, rows: 1, cols: 1, capacity: 1 };
  let current = true;
  let finish!: (response: Response) => void;
  let level = 20;
  const reads: string[] = [];
  globalThis.fetch = async (url, init) => {
    if (init?.method === "POST") return new Promise(resolve => { finish = resolve; });
    reads.push(String(url));
    if (String(url).includes("/collection?")) return json({ discordUserId: "alice", ...page, items: [{ ...pokemonFixture, level }] });
    if (String(url).endsWith("/party")) return json({ discordUserId: "alice", party: { ...party, slots: [{ ...pokemonFixture, level }] } });
    return json({ discordUserId: "alice", pokemon: { ...pokemonFixture, level }, locations: [] });
  };
  await data.client.fetchQuery(data.training("one"));
  const tick = data.train("one", "0", () => current);
  await new Promise(resolve => setTimeout(resolve, 0));
  current = false;
  await data.client.fetchQuery({ ...data.collection(query), staleTime: 0 });
  await data.client.fetchQuery({ ...data.party(), staleTime: 0 });
  assert.equal(data.client.getQueryState(data.collection(query).queryKey)?.isInvalidated, false);
  level = 21;
  finish(json({ discordUserId: "alice", pokemon: { ...pokemonFixture, level }, locations: [], trained: true, gains: { exp: 9, evs: [] } }));
  await assert.rejects(tick, /context_closed/);
  await data.refreshTrainingSummaries();
  assert.equal(reads.filter(url => url.includes("/collection?")).length, 2);
  assert.equal(data.client.getQueryData<{ items: PokemonDetail[] }>(data.collection(query).queryKey)?.items[0].level, 21);
  assert.equal(data.client.getQueryState(data.training("one").queryKey)?.isInvalidated, true);
  assert.equal((await data.client.fetchQuery(data.training("one"))).pokemon.level, 21);
  data.dispose();
});

it("build mutations use domain routes and reconcile Bag/detail while leaving unrelated catalogs fresh", async t => {
  const data = new PlayerData("alice", null, () => {}); t.after(() => data.dispose());
  const pokemon = { ...pokemonFixture, nature: { ...pokemonFixture.nature, id: "0" }, heldItemId: null };
  const context = { pokemon, natures: [], heldItems: [], mintQuantity: 3, mintCost: 1 };
  data.client.setQueryData(data.bag().queryKey, [{ id: "7", quantity: 3 }]);
  data.client.setQueryData(data.npcs().queryKey, []);
  globalThis.fetch = async (url, init) => {
    if (init?.method !== "POST") return json({ discordUserId: "alice", ...context });
    assert.match(String(url), /\/pokemon\/one\/nature$/);
    assert.deepEqual(JSON.parse(String(init.body)), { natureId: "3", expectedNatureId: "0" });
    return json({ discordUserId: "alice", ...context, pokemon: { ...pokemon, nature: { ...pokemon.nature, id: "3", name: "Adamant" } }, mintQuantity: 2, items: [{ id: "7", quantity: 2 }], changed: true });
  };
  await data.client.fetchQuery(data.build("one"));
  const result = await data.changeNature("one", "3", "0");
  assert.equal(result.mintQuantity, 2);
  assert.equal(data.client.getQueryData<PokemonDetail>(data.pokemon("one").queryKey)?.nature.name, "Adamant");
  assert.deepEqual(data.client.getQueryData(data.bag().queryKey), [{ id: "7", quantity: 2 }]);
  assert.equal(data.client.getQueryState(data.npcs().queryKey)?.isInvalidated, false);
});

it("unknown build changes cannot be replayed by reopening and explicit refresh clears the hold", async t => {
  const data = new PlayerData("alice", null, () => {}); t.after(() => data.dispose());
  let posts = 0;
  const context = { pokemon: pokemonFixture, natures: [], heldItems: [], mintQuantity: 3, mintCost: 1 };
  globalThis.fetch = async (_url, init) => {
    if (init?.method === "POST") { posts++; throw new TypeError("response lost"); }
    return json({ discordUserId: "alice", ...context, items: [] });
  };
  await assert.rejects(data.changeHeldItem("one", "h197", null), /response lost/);
  await assert.rejects(data.changeNature("two", "3", "0"), /build_refresh_required/);
  assert.equal(posts, 1);
  assert.equal(data.needsBuildRefresh, true);
  await data.refreshBuild("one");
  assert.equal(data.needsBuildRefresh, false);
  assert.equal(posts, 1);
});

it("a departed build request settles into invalidation without installing old feature data", async t => {
  const data = new PlayerData("alice", null, () => {}); t.after(() => data.dispose());
  let finish!: (response: Response) => void;
  let current = true;
  globalThis.fetch = async () => new Promise(resolve => { finish = resolve; });
  const change = data.changeHeldItem("one", null, "h211", () => current);
  await new Promise(resolve => setTimeout(resolve, 0));
  await assert.rejects(data.train("one", "0"), /interaction_pending/);
  current = false;
  data.client.setQueryData(data.bag().queryKey, [{ id: "h211", quantity: 2 }]);
  finish(json({ discordUserId: "alice", pokemon: pokemonFixture, natures: [], heldItems: [], mintQuantity: 3, mintCost: 1, items: [], changed: true }));
  await assert.rejects(change, /context_closed/);
  assert.equal(data.client.getQueryState(data.bag().queryKey)?.isInvalidated, true);
  assert.equal(data.client.getQueryData(data.pokemon("one").queryKey), undefined);
  assert.equal(data.needsBuildRefresh, false);
});
