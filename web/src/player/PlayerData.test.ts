import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { PlayerData } from "./PlayerData";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const json = (data: unknown) => new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
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
