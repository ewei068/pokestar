const { isDeepStrictEqual } = require("node:util");
const {
  findDocuments,
  insertDocument,
  updateDocument,
} = require("../../database/mongoHandler");
const { trainerFields } = require("../../config/trainerConfig");
const { getTrainer, getTrainerFromId } = require("../trainer");

const ORIGINAL_SETTINGS_DEFAULT = structuredClone(trainerFields.settings.default);

const NOW = new Date("2026-10-30T12:00:00Z");
const USER = {
  id: "trainer-user",
  username: "Trainer",
  discriminator: "1234",
  avatar: "old-avatar",
};

/**
 * @param {DefaultFieldConfig<Trainer>} config
 * @returns {Record<string, any>}
 */
const getDefaults = (config) => {
  const defaults = {};
  for (const [field, entry] of Object.entries(config)) {
    if (entry.default !== undefined) {
      defaults[field] = structuredClone(entry.default);
    }
    if (entry.config) {
      defaults[field] = { ...defaults[field], ...getDefaults(entry.config) };
    }
  }
  return defaults;
};

/**
 * @param {Record<string, any>} overrides
 * @returns {Record<string, any>}
 */
const makeTrainer = (overrides = {}) => ({
  ...getDefaults(trainerFields),
  _id: "stored-trainer",
  userId: USER.id,
  user: { ...USER },
  lastCorrected: NOW.getTime(),
  ...overrides,
});

/**
 * @param {object} object
 * @param {string} path
 */
const readPath = (object, path) =>
  path.split(".").reduce((value, key) => value?.[key], object);

/**
 * @param {object} object
 * @param {string} path
 * @param {any} value
 */
const writePath = (object, path, value) => {
  const keys = path.split(".");
  const lastKey = keys.pop();
  let target = object;
  for (const key of keys) {
    target[key] ??= {};
    target = target[key];
  }
  target[lastKey] = structuredClone(value);
};

describe("trainer initialization and lifecycle refresh", () => {
  /** @type {Map<string, any>} */
  let trainers;
  /** @type {null | (() => void)} */
  let beforeWrite;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
    jest.clearAllMocks();
    trainers = new Map();
    beforeWrite = null;
    /** @type {jest.Mock} */ (findDocuments).mockImplementation(
      async (_collection, { userId }) =>
        trainers.has(userId) ? [structuredClone(trainers.get(userId))] : [],
    );
    /** @type {jest.Mock} */ (insertDocument).mockImplementation(
      async (_collection, trainer) => {
        if (trainers.has(trainer.userId)) {
          throw Object.assign(new Error("duplicate userId"), {
            code: 11000,
            keyPattern: { userId: 1 },
          });
        }
        const stored = { ...structuredClone(trainer), _id: trainer.userId };
        trainers.set(trainer.userId, stored);
        return { insertedId: stored._id, insertedCount: 1 };
      },
    );
    /** @type {jest.Mock} */ (updateDocument).mockImplementation(
      async (_collection, filter, update) => {
        const hook = beforeWrite;
        beforeWrite = null;
        hook?.();
        const trainer = trainers.get(filter.userId);
        const matches = trainer && Object.entries(filter).every(([path, value]) => {
          const current = readPath(trainer, path);
          if (value && typeof value === "object" && "$exists" in value) {
            return (current !== undefined) === value.$exists;
          }
          return isDeepStrictEqual(structuredClone(current), structuredClone(value));
        });
        if (!matches) {
          return { matchedCount: 0, modifiedCount: 0 };
        }
        const previous = structuredClone(trainer);
        for (const [path, value] of Object.entries(update.$set ?? {})) {
          writePath(trainer, path, value);
        }
        return {
          matchedCount: 1,
          modifiedCount: isDeepStrictEqual(previous, trainer) ? 0 : 1,
        };
      },
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("preserves daily, weekly, regeneration and missing nested default behavior", async () => {
    const trainer = makeTrainer({
      lastCorrected: new Date("2026-10-15T12:00:00Z").getTime(),
      level: 9,
      money: 2345,
      exp: 789,
      claimedDaily: true,
      usedWish: true,
      usedCreation: true,
      usedTimeTravel: true,
      dreamCards: 2,
      purchasedShopItemsToday: { potion: 3 },
      defeatedNPCsToday: { rival: ["normal"] },
      questData: {
        dailyQuests: { daily: { stage: 1, progress: 2 } },
        achievements: { achievement: { stage: 2, progress: 3 } },
      },
      settings: { publicProfile: false },
    });
    trainers.set(USER.id, trainer);

    const result = await getTrainerFromId(USER.id);

    expect(result.err).toBeNull();
    expect(result.data).toMatchObject({
      claimedDaily: false,
      usedWish: false,
      usedCreation: false,
      usedTimeTravel: false,
      dreamCards: 109,
      purchasedShopItemsToday: {},
      defeatedNPCsToday: {},
      questData: {
        dailyQuests: {},
        achievements: trainer.questData.achievements,
      },
      settings: { publicProfile: false, deviceType: "desktop" },
      money: 2345,
      exp: 789,
      lastCorrected: NOW.getTime(),
    });
    expect(result.data).toEqual(trainers.get(USER.id));
  });

  it("does not initialize an arbitrary inspected user ID", async () => {
    expect(await getTrainerFromId("unknown")).toEqual({
      data: null,
      err: "Error finding trainer.",
    });
    expect(trainers.size).toBe(0);
  });

  it("initializes id-only acting users from configured defaults once", async () => {
    const first = await getTrainer({ id: USER.id });
    const stored = trainers.get(USER.id);
    stored.money += 321;
    stored.exp = 50;
    stored.tutorialData.currentTutorialStage = "done";
    stored.party.pokemonIds[0] = "owned-pokemon";
    const second = await getTrainer({ id: USER.id });

    expect(first.err).toBeNull();
    expect(first.data.money).toBe(trainerFields.money.default);
    expect(first.data.party).toEqual(trainerFields.party.default);
    expect(second.err).toBeNull();
    expect(second.data).toEqual(stored);
    expect(second.data).toMatchObject({ money: 1321, exp: 50 });
    expect(second.data.party.pokemonIds[0]).toBe("owned-pokemon");
    expect(second.data.tutorialData.currentTutorialStage).toBe("done");
    expect(trainers.size).toBe(1);
  });

  it("recovers the existing winner of concurrent first-use insertions", async () => {
    const results = await Promise.all([getTrainer(USER), getTrainer(USER)]);

    expect(results.map((result) => result.err)).toEqual([null, null]);
    expect(trainers.size).toBe(1);
    expect(results[0].data).toEqual(trainers.get(USER.id));
    expect(results[1].data).toEqual(trainers.get(USER.id));
    expect(trainers.get(USER.id).money).toBe(trainerFields.money.default);
  });

  it("preserves the concurrent insertion winner's progress", async () => {
    const winner = makeTrainer({ money: 4567, exp: 555, beginnerRolls: 9 });
    /** @type {jest.Mock} */ (insertDocument).mockImplementationOnce(async () => {
      trainers.set(USER.id, winner);
      throw Object.assign(new Error("duplicate userId"), {
        code: 11000,
        keyPattern: { userId: 1 },
      });
    });

    const result = await getTrainer({ id: USER.id });

    expect(result).toEqual({ data: winner, err: null });
    expect(trainers.get(USER.id)).toEqual(winner);
  });

  it("reports nonduplicate insertion failures even if a trainer appears", async () => {
    /** @type {jest.Mock} */ (insertDocument).mockImplementationOnce(async () => {
      trainers.set(USER.id, makeTrainer());
      throw Object.assign(new Error("connection failed"), { code: 91 });
    });

    expect(await getTrainer(USER)).toEqual({
      data: null,
      err: "Error creating trainer.",
    });
  });

  it("keeps omitted profile fields and accepts an explicit trusted avatar removal", async () => {
    trainers.set(USER.id, makeTrainer({ money: 4321, exp: 654 }));

    const idOnly = await getTrainer({ id: USER.id });
    expect(idOnly.data.user).toEqual(USER);
    const partial = await getTrainer({
      id: USER.id,
      username: "New trainer name",
      avatar: null,
    });

    expect(partial.err).toBeNull();
    expect(partial.data.user).toEqual({
      ...USER,
      username: "New trainer name",
      avatar: null,
    });
    expect(partial.data.money).toBe(4321);
    expect(partial.data.exp).toBe(654);
    expect(partial.data).toEqual(trainers.get(USER.id));
  });

  it("preserves the refresh=false profile behavior", async () => {
    trainers.set(USER.id, makeTrainer());

    const result = await getTrainer({ ...USER, username: "Ignored" }, false);

    expect(result.data.user).toEqual(USER);
    expect(trainers.get(USER.id).user).toEqual(USER);
  });

  it("isolates nested defaults between returned trainers and future initialization", async () => {
    const originalParty = structuredClone(trainerFields.party.default);
    const first = await getTrainer(USER);
    first.data.party.pokemonIds[0] = "local-only";
    first.data.savedParties[1].pokemonIds[0] = "local-saved";
    first.data.tutorialData.completedTutorialStages.welcome = true;
    first.data.settings.deviceType = "mobile";
    const second = await getTrainer({ id: "second-user" });

    expect(second.err).toBeNull();
    expect(second.data.party).toEqual(originalParty);
    expect(second.data.savedParties[1].pokemonIds[0]).toBeNull();
    expect(second.data.tutorialData.completedTutorialStages).toEqual({});
    expect(second.data.settings.deviceType).toBe("desktop");
    expect(trainerFields.party.default).toEqual(originalParty);
    expect(trainerFields.settings.default).toEqual(ORIGINAL_SETTINGS_DEFAULT);
    expect(trainers.get(USER.id).party).toEqual(originalParty);
  });

  it("preserves concurrent resources, party, tutorial and profile during refresh", async () => {
    trainers.set(USER.id, makeTrainer({ lastCorrected: 0, claimedDaily: true }));
    beforeWrite = () => {
      const stored = trainers.get(USER.id);
      stored.money = 9876;
      stored.exp = 500;
      stored.party.pokemonIds[0] = "concurrent-pokemon";
      stored.tutorialData.currentTutorialStage = "concurrent-stage";
      stored.user.username = "Concurrent profile";
      stored.questData.achievements.concurrent = { stage: 1, progress: 4 };
    };

    const result = await getTrainerFromId(USER.id);

    expect(result.err).toBeNull();
    expect(result.data).toMatchObject({ money: 9876, exp: 500, claimedDaily: false });
    expect(result.data.party.pokemonIds[0]).toBe("concurrent-pokemon");
    expect(result.data.tutorialData.currentTutorialStage).toBe("concurrent-stage");
    expect(result.data.user.username).toBe("Concurrent profile");
    expect(result.data.questData.achievements.concurrent).toEqual({ stage: 1, progress: 4 });
    expect(result.data).toEqual(trainers.get(USER.id));
  });

  it("recalculates regeneration if a concurrent level/resource change invalidates refresh", async () => {
    trainers.set(USER.id, makeTrainer({ lastCorrected: 0, level: 1, dreamCards: 1 }));
    beforeWrite = () => {
      const stored = trainers.get(USER.id);
      stored.level = 20;
      stored.dreamCards = 2;
    };

    const result = await getTrainerFromId(USER.id);

    expect(result.err).toBeNull();
    expect(result.data.level).toBe(20);
    expect(result.data.dreamCards).toBe(120);
    expect(result.data).toEqual(trainers.get(USER.id));
  });

  it("preserves concurrent sibling updates when filling a nested default", async () => {
    trainers.set(USER.id, makeTrainer({ settings: { publicProfile: false } }));
    beforeWrite = () => {
      trainers.get(USER.id).settings.publicProfile = true;
      trainers.get(USER.id).user.avatar = "concurrent-avatar";
    };

    const result = await getTrainer({ id: USER.id, username: "Updated" });

    expect(result.err).toBeNull();
    expect(result.data.settings).toMatchObject({ publicProfile: true, deviceType: "desktop" });
    expect(result.data.user).toEqual({ ...USER, username: "Updated", avatar: "concurrent-avatar" });
    expect(result.data).toEqual(trainers.get(USER.id));
  });

  it("does not regenerate twice when another refresh wins", async () => {
    trainers.set(USER.id, makeTrainer({
      lastCorrected: NOW.getTime() - 5 * 60 * 1000,
      dreamCards: 10,
    }));
    beforeWrite = () => {
      const stored = trainers.get(USER.id);
      stored.lastCorrected = NOW.getTime();
      stored.dreamCards = 11;
      stored.claimedDaily = true;
    };

    const result = await getTrainerFromId(USER.id);

    expect(result.err).toBeNull();
    expect(result.data.dreamCards).toBe(11);
    expect(result.data.claimedDaily).toBe(true);
    expect(result.data).toEqual(trainers.get(USER.id));
  });

  it("returns a recoverable error when refresh inputs keep changing", async () => {
    trainers.set(USER.id, makeTrainer({ lastCorrected: 0, dreamCards: 1 }));
    const spend = () => {
      trainers.get(USER.id).dreamCards += 1;
      beforeWrite = spend;
    };
    beforeWrite = spend;

    expect(await getTrainerFromId(USER.id)).toEqual({
      data: null,
      err: "Error updating trainer.",
    });
    expect(trainers.get(USER.id).lastCorrected).toBe(0);
    expect(trainers.get(USER.id).dreamCards).toBeGreaterThan(1);
  });

});
