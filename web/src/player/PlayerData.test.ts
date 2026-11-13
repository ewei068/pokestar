import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { PlayerData } from "./PlayerData";
import type { PokemonDetail, PokemonEquipmentContext, PokemonEquipmentResult } from "./types";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
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
  data.client.setQueryData(data.bag().queryKey, [{ id: "7", quantity: 3, name: "Mint", description: "Changes nature.", category: "1", categoryName: "Materials", icon: null }]);
  data.client.setQueryData(data.npcs().queryKey, []);
  globalThis.fetch = async (url, init) => {
    if (init?.method !== "POST") return json({ discordUserId: "alice", ...context });
    assert.match(String(url), /\/pokemon\/one\/nature$/);
    assert.deepEqual(JSON.parse(String(init.body)), { natureId: "3", expectedNatureId: "0" });
    return json({ discordUserId: "alice", ...context, pokemon: { ...pokemon, nature: { ...pokemon.nature, id: "3", name: "Adamant" } }, mintQuantity: 2, items: [{ id: "7", quantity: 2, name: "Mint", description: "Changes nature.", category: "1", categoryName: "Materials", icon: null }], changed: true });
  };
  await data.client.fetchQuery(data.build("one"));
  const result = await data.changeNature("one", "3", "0");
  assert.equal(result.mintQuantity, 2);
  assert.equal(data.client.getQueryData<PokemonDetail>(data.pokemon("one").queryKey)?.nature.name, "Adamant");
  assert.deepEqual(data.client.getQueryData(data.bag().queryKey), [{ id: "7", quantity: 2, name: "Mint", description: "Changes nature.", category: "1", categoryName: "Materials", icon: null }]);
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
  data.client.setQueryData(data.bag().queryKey, [{ id: "h211", quantity: 2, name: "Leftovers", description: "Restores HP.", category: "3", categoryName: "Held Items", icon: null }]);
  finish(json({ discordUserId: "alice", pokemon: pokemonFixture, natures: [], heldItems: [], mintQuantity: 3, mintCost: 1, items: [], changed: true }));
  await assert.rejects(change, /context_closed/);
  assert.equal(data.client.getQueryState(data.bag().queryKey)?.isInvalidated, true);
  assert.equal(data.client.getQueryData(data.pokemon("one").queryKey), undefined);
  assert.equal(data.needsBuildRefresh, false);
});

it("a definitive removed-target rejection does not lock changes to other Pokemon", async t => {
  const data = new PlayerData("alice", null, () => {}); t.after(() => data.dispose());
  globalThis.fetch = async () => json({ error: "pokemon_not_found" }, 404);
  await assert.rejects(data.changeNature("removed", "3", "0"));
  assert.equal(data.needsBuildRefresh, false);
  let submitted = false;
  globalThis.fetch = async () => { submitted = true; return json({ discordUserId: "alice", pokemon: pokemonFixture,
    natures: [], heldItems: [], mintQuantity: 2, mintCost: 1, items: [], changed: true }); };
  await data.changeNature("owned", "3", "0");
  assert.equal(submitted, true);
});

it("explicit refresh reconciles an uncertain target that was subsequently removed", async t => {
  const data = new PlayerData("alice", null, () => {}); t.after(() => data.dispose());
  globalThis.fetch = async () => { throw new TypeError("response lost"); };
  await assert.rejects(data.changeNature("removed", "3", "0"));
  assert.equal(data.needsBuildRefresh, true);
  let posts = 0;
  globalThis.fetch = async (url, options) => {
    if (options?.method === "POST") posts += 1;
    if (String(url).includes("/removed/")) return json({ error: "pokemon_not_found" }, 404);
    if (String(url).endsWith("/bag")) return json({ discordUserId: "alice", items: [] });
    return json({ discordUserId: "alice", pokemon: pokemonFixture, natures: [], heldItems: [], mintQuantity: 2, mintCost: 1, items: [], changed: true });
  };
  await data.refreshBuild("owned");
  assert.equal(data.needsBuildRefresh, false);
  assert.equal(posts, 0);
  await data.changeNature("owned", "3", "0");
  assert.equal(posts, 1);
});

const equipmentData = (onAccountChanged = () => {}) => {
  const data = new PlayerData("alice", null, onAccountChanged);
  data.client.setDefaultOptions({ queries: { ...data.client.getDefaultOptions().queries, gcTime: 0 } });
  data.client.removeQueries({ queryKey: data.trainer().queryKey });
  data.activate();
  return data;
};
const equipmentContext: PokemonEquipmentContext = {
  pokemon: pokemonFixture, money: 5000,
  trainer: { displayName: "Alice", avatarUrl: null, level: 5, money: 5000, exp: null },
  pieces: [{ id: "powerBracer", level: 4, expectedEquipment: { level: 4,
    slots: { primary: { modifier: "baseAtk", quality: 75 } } },
    slots: [{ id: "primary", modifier: "baseAtk", quality: 75, value: 9, nextValue: 11 }],
    upgradeCost: { money: 1000, shards: 5 } }],
  materials: [{ id: "6", name: "Willpower Shard", description: "Equipment material", category: "1", categoryName: "Materials", quantity: 12, icon: "willpower-shard.png" }],
  catalog: { maxLevel: 10, moneyPerShard: 200, rerollCost: { money: 1000, shards: 5 },
    types: [{ id: "powerBracer", name: "Power Bracer", icon: "power-bracer.png", primaryStat: 1, materialId: "6", slots: { primary: ["baseAtk"] } }],
    slots: [{ id: "primary", name: "Primary", scalesWithLevel: true }],
    modifiers: [{ id: "baseAtk", name: "Base Atk", description: "Base Attack", type: "base", stat: 1, min: 1.5, max: 2.5 }] },
};
const equipmentResult = (warning?: string): PokemonEquipmentResult => ({ ...equipmentContext,
  discordUserId: "alice", money: 4000, trainer: { ...equipmentContext.trainer, money: 4000 },
  items: [{ ...equipmentContext.materials[0], quantity: 7 }], materials: [{ ...equipmentContext.materials[0], quantity: 7 }], changed: true,
  change: { kind: "reroll", equipmentType: "powerBracer", slotId: "primary", previousEquipment: equipmentContext.pieces[0].expectedEquipment },
  ...(warning ? { warning } : {}) });

it("equipment reads are actor-scoped and install canonical detail and current money without a write", async t => {
  const data = equipmentData(); t.after(() => data.dispose());
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /\/player\/pokemon\/one\/equipment$/);
    assert.notEqual(options?.method, "POST");
    assert.equal((options?.headers as Record<string, string>)["X-Player-Id"], "alice");
    return json({ discordUserId: "alice", ...equipmentContext });
  };
  const context = await data.client.fetchQuery(data.equipment("one"));
  assert.deepEqual(context.pieces, equipmentContext.pieces);
  assert.deepEqual(data.client.getQueryData(data.pokemon("one").queryKey), pokemonFixture);
  assert.deepEqual(data.client.getQueryData(data.trainer().queryKey), equipmentContext.trainer);
  let accountChanges = 0;
  const other = equipmentData(() => { accountChanges++; }); t.after(() => other.dispose());
  globalThis.fetch = async () => json({ discordUserId: "bob", ...equipmentContext });
  await assert.rejects(other.client.fetchQuery(other.equipment("one")), /account_changed/);
  assert.equal(accountChanges, 1);
  assert.equal(other.client.getQueryData(other.pokemon("one").queryKey), undefined);
});

it("an identical paid reroll installs its response and invalidates only affected Pokemon caches", async t => {
  const data = equipmentData(); t.after(() => data.dispose());
  const affected = [data.build("one").queryKey, data.training("one").queryKey,
    data.collection(query).queryKey, data.party().queryKey];
  for (const key of affected) data.client.setQueryData<unknown>(key, { cached: true });
  data.client.setQueryData(data.npcs().queryKey, []);
  const result = equipmentResult();
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /\/pokemon\/one\/equipment\/reroll$/);
    assert.deepEqual(JSON.parse(String(options?.body)), { equipmentType: "powerBracer", slotId: "primary",
      expectedEquipment: equipmentContext.pieces[0].expectedEquipment });
    return json(result);
  };
  assert.deepEqual(await data.rerollEquipment("one", "powerBracer", "primary", equipmentContext.pieces[0].expectedEquipment), result);
  assert.deepEqual(data.client.getQueryData(data.equipment("one").queryKey), result);
  assert.deepEqual(data.client.getQueryData(data.bag().queryKey), result.items);
  assert.equal(data.client.getQueryData<{ money: number }>(data.trainer().queryKey)?.money, 4000);
  for (const key of affected) assert.equal(data.client.getQueryState(key)?.isInvalidated, true);
  assert.equal(data.client.getQueryState(data.npcs().queryKey)?.isInvalidated, false);
});

it("equipment writes cancel late old reads and stay exclusive with nature, held items and training", async t => {
  const data = equipmentData(); t.after(() => data.dispose());
  let finishRead!: (response: Response) => void;
  let finishWrite!: (response: Response) => void;
  let posts = 0;
  globalThis.fetch = async (_url, options) => options?.method === "POST"
    ? (posts++, new Promise(resolve => { finishWrite = resolve; }))
    : new Promise(resolve => { finishRead = resolve; });
  const oldRead = data.client.fetchQuery(data.equipment("one")).catch(() => undefined);
  await new Promise(resolve => setTimeout(resolve, 0));
  const change = data.upgradeEquipment("one", "powerBracer", equipmentContext.pieces[0].expectedEquipment);
  await new Promise(resolve => setTimeout(resolve, 0));
  await assert.rejects(data.changeNature("one", "3", "0"), /interaction_pending/);
  await assert.rejects(data.changeHeldItem("one", null, "h211"), /interaction_pending/);
  await assert.rejects(data.train("one", "0"), /interaction_pending/);
  await assert.rejects(data.rerollEquipment("one", "powerBracer", "primary", equipmentContext.pieces[0].expectedEquipment), /interaction_pending/);
  finishWrite(json(equipmentResult()));
  await change;
  finishRead(json({ discordUserId: "alice", ...equipmentContext }));
  await oldRead;
  assert.equal(posts, 1);
  assert.equal(data.client.getQueryData<PokemonEquipmentContext>(data.equipment("one").queryKey)?.money, 4000);
  assert.equal(data.client.getQueryData<{ money: number }>(data.trainer().queryKey)?.money, 4000);
});

it("a departed equipment response invalidates caches without installing old feature data", async t => {
  const data = equipmentData(); t.after(() => data.dispose());
  let current = true;
  let finish!: (response: Response) => void;
  globalThis.fetch = async () => new Promise(resolve => { finish = resolve; });
  const queued = data.upgradeEquipment("one", "powerBracer", equipmentContext.pieces[0].expectedEquipment, () => current);
  current = false;
  await assert.rejects(queued, /context_closed/);
  assert.equal(typeof finish, "undefined");
  current = true;
  const submitted = data.rerollEquipment("one", "powerBracer", "primary", equipmentContext.pieces[0].expectedEquipment, () => current);
  await new Promise(resolve => setTimeout(resolve, 0));
  data.client.setQueryData(data.equipment("one").queryKey, equipmentContext);
  data.client.setQueryData(data.bag().queryKey, equipmentContext.materials);
  current = false;
  finish(json(equipmentResult()));
  await assert.rejects(submitted, /context_closed/);
  assert.equal(data.client.getQueryState(data.equipment("one").queryKey)?.isInvalidated, true);
  assert.deepEqual(data.client.getQueryData(data.equipment("one").queryKey), equipmentContext);
  assert.equal(data.client.getQueryData(data.pokemon("one").queryKey), undefined);
});

it("equipment response loss is never replayed and refresh requires all current reads before clearing the hold", async t => {
  const data = equipmentData(); t.after(() => data.dispose());
  let posts = 0;
  globalThis.fetch = async () => { posts++; throw new TypeError("response lost"); };
  await assert.rejects(data.rerollEquipment("one", "powerBracer", "primary", equipmentContext.pieces[0].expectedEquipment), /response lost/);
  await assert.rejects(data.changeNature("two", "3", "0"), /build_refresh_required/);
  assert.equal(posts, 1);
  const reads: string[] = [];
  let finishTrainer!: (response: Response) => void;
  globalThis.fetch = async (url, options) => {
    assert.notEqual(options?.method, "POST"); reads.push(String(url));
    if (String(url).endsWith("/trainer")) return new Promise(resolve => { finishTrainer = resolve; });
    if (String(url).endsWith("/bag")) return json({ discordUserId: "alice", items: [] });
    return json({ discordUserId: "alice", ...equipmentContext, natures: [], heldItems: [], mintQuantity: 3, mintCost: 1 });
  };
  const refresh = data.refreshBuild("two");
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(data.needsBuildRefresh, true);
  for (const target of ["one", "two"]) for (const kind of ["build", "equipment"]) {
    assert.ok(reads.some(path => path.endsWith(`/pokemon/${target}/${kind}`)));
  }
  finishTrainer(json({ discordUserId: "alice", trainer: equipmentContext.trainer }));
  await refresh;
  assert.equal(data.needsBuildRefresh, false);
  assert.equal(posts, 1);
});

it("failed or departed equipment refresh cannot release uncertainty; authoritative absence can", async t => {
  const data = equipmentData(); t.after(() => data.dispose());
  globalThis.fetch = async () => { throw new TypeError("response lost"); };
  await assert.rejects(data.upgradeEquipment("one", "powerBracer", equipmentContext.pieces[0].expectedEquipment));
  globalThis.fetch = async url => String(url).endsWith("/equipment")
    ? json({ error: "read_unavailable" }, 503)
    : json({ discordUserId: "alice", ...equipmentContext, items: [] });
  await assert.rejects(data.refreshBuild("one"));
  assert.equal(data.needsBuildRefresh, true);
  let current = true;
  const finishes: ((response: Response) => void)[] = [];
  globalThis.fetch = async () => new Promise(resolve => { finishes.push(resolve); });
  const departed = data.refreshBuild("one", () => current);
  await new Promise(resolve => setTimeout(resolve, 0));
  current = false;
  // Dispose cancels all pending read promises; it must not restore this account.
  data.dispose();
  for (const finish of finishes) finish(json({ discordUserId: "alice", ...equipmentContext, items: [] }));
  await assert.rejects(departed);
  assert.equal(data.needsBuildRefresh, true);
  assert.equal(data.client.getQueryCache().getAll().length, 0);
  const absent = equipmentData(); t.after(() => absent.dispose());
  globalThis.fetch = async () => { throw new TypeError("response lost"); };
  await assert.rejects(absent.upgradeEquipment("one", "powerBracer", equipmentContext.pieces[0].expectedEquipment));
  globalThis.fetch = async url => String(url).includes("/pokemon/one/")
    ? json({ error: "pokemon_not_found" }, 404)
    : json({ discordUserId: "alice", trainer: equipmentContext.trainer, items: [] });
  await absent.refreshBuild("one");
  assert.equal(absent.needsBuildRefresh, false);
});

it("a warning after departure holds other build writes until refresh and disposal suppresses late results", async t => {
  const data = equipmentData(); t.after(() => data.dispose());
  let current = true;
  let finish!: (response: Response) => void;
  globalThis.fetch = async () => new Promise(resolve => { finish = resolve; });
  const changed = data.upgradeEquipment("one", "powerBracer", equipmentContext.pieces[0].expectedEquipment, () => current);
  await new Promise(resolve => setTimeout(resolve, 0));
  current = false;
  finish(json(equipmentResult("Equipment saved, but quest progress could not be confirmed.")));
  await assert.rejects(changed, /context_closed/);
  assert.equal(data.needsBuildRefresh, true);
  await assert.rejects(data.changeHeldItem("two", null, "h211"), /build_refresh_required/);
  const disposed = equipmentData(); t.after(() => disposed.dispose());
  const late = disposed.upgradeEquipment("one", "powerBracer", equipmentContext.pieces[0].expectedEquipment);
  await new Promise(resolve => setTimeout(resolve, 0));
  disposed.dispose(); finish(json(equipmentResult()));
  await assert.rejects(late, /session_closed/);
  assert.equal(disposed.client.getQueryCache().getAll().length, 0);
});

it("nature/held changes and every submitted training settlement invalidate equipment previews", async t => {
  const data = equipmentData(); t.after(() => data.dispose());
  const keys = [data.equipment("one").queryKey, data.build("one").queryKey];
  for (const key of keys) data.client.setQueryData<unknown>(key, { cached: true });
  globalThis.fetch = async () => json({ discordUserId: "alice", pokemon: pokemonFixture, items: [], natures: [], heldItems: [], changed: true });
  await data.changeHeldItem("one", null, "h211");
  assert.equal(data.client.getQueryState(data.equipment("one").queryKey)?.isInvalidated, true);
  for (const key of keys) data.client.setQueryData<unknown>(key, { cached: true });
  globalThis.fetch = async () => json({ discordUserId: "alice", pokemon: pokemonFixture, locations: [], trained: true, gains: { exp: 2, evs: [] } });
  await data.train("one", "0");
  for (const key of keys) assert.equal(data.client.getQueryState(key)?.isInvalidated, true);
  for (const key of keys) data.client.setQueryData<unknown>(key, { cached: true });
  globalThis.fetch = async () => { throw new TypeError("training response lost"); };
  await assert.rejects(data.train("one", "0"));
  for (const key of keys) assert.equal(data.client.getQueryState(key)?.isInvalidated, true);
});

it("refreshes a replacement active equipment observer when the departed purchase settles", async t => {
  const { QueryObserver } = await import("@tanstack/react-query");
  const data = equipmentData(); t.after(() => data.dispose());
  data.client.setQueryData(data.equipment("one").queryKey, equipmentContext);
  let current = true, reads = 0, posts = 0;
  let finish!: (response: Response) => void;
  const saved = equipmentResult();
  globalThis.fetch = async (_url, options) => {
    if (options?.method === "POST") { posts++; return new Promise(resolve => { finish = resolve; }); }
    reads++; return json(saved);
  };
  const change = data.upgradeEquipment("one", "powerBracer", equipmentContext.pieces[0].expectedEquipment, () => current);
  await new Promise(resolve => setTimeout(resolve, 0));
  current = false;
  // The fixture uses gcTime: 0; restore the cached view before subscribing.
  data.client.setQueryData(data.equipment("one").queryKey, equipmentContext);
  const replacement = new QueryObserver(data.client, { ...data.equipment("one"), staleTime: Infinity });
  const unsubscribe = replacement.subscribe(() => {}); t.after(unsubscribe);
  assert.equal(reads, 0);
  finish(json(saved));
  await assert.rejects(change, /context_closed/);
  assert.equal(posts, 1);
  assert.equal(reads, 1);
  assert.equal(replacement.getCurrentResult().data?.money, saved.money);
  assert.deepEqual(replacement.getCurrentResult().data?.pieces, saved.pieces);
});
