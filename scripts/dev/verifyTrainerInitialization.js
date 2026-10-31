/* eslint-disable global-require, no-console */
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const { spawnSync } = require("node:child_process");
const { MongoClient } = require("mongodb");

const LOCAL_MONGO = "mongodb://127.0.0.1:27017";
const PREFIX = "pokestar_trainer_check_";
const USER_ID = "900000000000000001";
const SESSION_USER_ID = "900000000000000002";
const RESULT = "TRAINER_CHECK_RESULT ";

/**
 * @param {string} database
 * @param {string} stage
 * @param {string=} token
 */
const runChild = async (database, stage, token) => {
  assert.match(database, /^pokestar_trainer_check_[a-f0-9]{16}$/);
  process.env.MONGODB_URL = LOCAL_MONGO;
  const config = require("../../src/config/databaseConfig");
  Object.defineProperty(config, "DB_NAME", { value: database });
  const storage = require("../../src/database/mongoHandler");
  const users = await storage.getCollection(config.collectionNames.USERS);
  let beforeWrite = async () => {};
  const update = storage.updateDocument;
  storage.updateDocument = async (collection, filter, change) => {
    const hook = beforeWrite;
    beforeWrite = async () => {};
    await hook();
    return update(collection, filter, change);
  };
  const { getTrainer, getTrainerFromId } = require("../../src/services/trainer");
  const { trainerFields } = require("../../src/config/trainerConfig");
  const { WebSessionStore } = require("../../src/web/sessionStore");
  const { createBattleApi } = require("../../src/web/battleApi");
  const express = require("express");
  const sessions = new WebSessionStore(await storage.getCollection(config.collectionNames.WEB_SESSIONS));
  const app = express();
  app.use("/api", createBattleApi({ battleService: {}, sessionStore: sessions,
    siteOrigin: "http://localhost:5173", clientId: "verification", clientSecret: "unused",
    redirectUri: "http://localhost/api/auth/discord/callback" }));
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  /** @type {import("node:http").Server} */
  const listener = server;
  const address = listener.address();
  assert.ok(address && typeof address !== "string");
  /** @param {string} sessionToken */
  const readMe = async (sessionToken) => {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/me?userId=untrusted-target`, {
      headers: { Cookie: `pokestar_session=${sessionToken}` },
    });
    assert.equal(response.status, 200);
    return response.json();
  };
  try {
    if (stage === "prepare") {
      await users.createIndex({ userId: 1 }, { unique: true });
      const results = await Promise.all(Array.from({ length: 16 }, (_, i) =>
        getTrainer(i % 2 ? { id: USER_ID } : { id: USER_ID, username: "Leaf", avatar: null })));
      assert.ok(results.every(result => result.data && !result.err));
      assert.equal(await users.countDocuments({ userId: USER_ID }), 1);
      let trainer = await users.findOne({ userId: USER_ID });
      assert.equal(trainer.money, trainerFields.money.default);
      assert.equal(trainer.exp, trainerFields.exp.default);
      assert.deepEqual(trainer.backpack, trainerFields.backpack.default);
      await users.updateOne({ userId: USER_ID }, { $set: {
        money: 1337, exp: 350, level: 3, lastCorrected: 0, dreamCards: 1,
        "party.pokemonIds.0": "owned-pokemon", "user.username": "Leaf",
      } });
      beforeWrite = async () => {
        await users.updateOne({ userId: USER_ID }, { $inc: { money: 24 }, $set: {
          level: 5, exp: 1050, dreamCards: 17, "party.pokemonIds.0": "new-party-member", "user.username": "Updated Leaf",
        } });
      };
      const refreshed = await getTrainerFromId(USER_ID);
      assert.equal(refreshed.err, null);
      trainer = await users.findOne({ userId: USER_ID });
      assert.equal(trainer.money, 1361);
      assert.equal(trainer.exp, 1050);
      assert.equal(trainer.level, 5);
      assert.equal(trainer.dreamCards, 105);
      assert.equal(trainer.user.username, "Updated Leaf");
      assert.equal(trainer.party.pokemonIds[0], "new-party-member");
      const session = await sessions.create(SESSION_USER_ID);
      assert.equal(await users.countDocuments({ userId: SESSION_USER_ID }), 0);
      const me = await readMe(session.token);
      assert.equal(me.discordUserId, SESSION_USER_ID);
      assert.deepEqual(me.trainer, { displayName: "Trainer", avatarUrl: null, level: 1,
        money: 1000, exp: { current: 0, required: 100 } });
      assert.equal(await users.countDocuments({ userId: "untrusted-target" }), 0);
      return { token: session.token };
    }
    assert.equal(stage, "restart");
    const me = await readMe(token);
    assert.equal(me.discordUserId, SESSION_USER_ID);
    assert.equal(me.trainer.money, 1000);
    assert.equal(me.trainer.exp.current, 0);
    const replay = await getTrainer({ id: USER_ID }, false);
    assert.equal(replay.err, null);
    assert.equal(replay.data.money, 1361);
    assert.equal(replay.data.exp, 1050);
    assert.equal(replay.data.user.username, "Updated Leaf");
    assert.equal(replay.data.party.pokemonIds[0], "new-party-member");
    assert.equal(await users.countDocuments({}), 2);
    return { creationRacers: 16, trainers: 2, concurrentRefresh: "preserved",
      sessionAfterProcessRestart: "preserved", repeatBootstrapRewards: "none", targetId: "ignored" };
  } finally {
    listener.closeAllConnections();
    await new Promise(resolve => { listener.close(resolve); });
  }
};

/**
 * @param {string} database
 * @param {string} stage
 * @param {string=} token
 */
const childResult = (database, stage, token = "") => {
  const result = spawnSync(process.execPath, [__filename, "--child", database, stage], {
    encoding: "utf8", timeout: 30000, env: { ...process.env, TRAINER_CHECK_TOKEN: token },
  });
  if (result.status !== 0) throw new Error(`Trainer ${stage} check failed: ${result.stderr || result.error}`);
  const line = result.stdout.split("\n").find(value => value.startsWith(RESULT));
  assert.ok(line, "Child returned no verification result");
  return JSON.parse(line.slice(RESULT.length));
};

const main = async () => {
  if (process.argv[2] === "--child") {
    const result = await runChild(process.argv[3], process.argv[4], process.env.TRAINER_CHECK_TOKEN);
    process.stdout.write(`${RESULT}${JSON.stringify(result)}\n`, () => process.exit(0));
    return;
  }
  const database = `${PREFIX}${randomBytes(8).toString("hex")}`;
  const client = new MongoClient(LOCAL_MONGO, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const prepared = childResult(database, "prepare");
    const result = childResult(database, "restart", prepared.token);
    console.log(JSON.stringify({ ...result, database: "disposable local database; removed after check",
      oauthProvider: "not exercised", discordSurface: "not exercised" }, null, 2));
  } finally {
    await client.db(database).dropDatabase();
    await client.close();
  }
};
main().catch(error => { console.error(error); process.exit(1); });
