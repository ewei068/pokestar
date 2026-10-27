jest.mock("../trainer", () => ({ getTrainerFromId: jest.fn() }));
const { getTrainerFromId } = require("../trainer");
const { findAndUpdateDocument } = require("../../database/mongoHandler");
const { collectionNames } = require("../../config/databaseConfig");
const { userSettingsConfig } = require("../../config/trainerConfig");
const { getAutoBattleEligibility, chargeAutoBattle } = require("../battleAuto");

beforeEach(() => jest.clearAllMocks());

it("computes eligibility from current unlocks/balance instead of the battle-start flags", async () => {
  getTrainerFromId.mockResolvedValue({
    data: { hasDarkrai: false, dreamCards: 100 },
  });
  expect(
    await getAutoBattleEligibility({ userId: "player", cost: 2 }),
  ).toMatchObject({ visible: false, enabled: false });
  getTrainerFromId.mockResolvedValue({
    data: { hasDarkrai: true, dreamCards: 1 },
  });
  expect(await getAutoBattleEligibility({ userId: "player", cost: 2 })).toEqual(
    { visible: true, enabled: false, reason: "insufficient_dream_cards" },
  );
  getTrainerFromId.mockResolvedValue({
    data: { hasDarkrai: true, dreamCards: 3 },
  });
  expect(await getAutoBattleEligibility({ userId: "player", cost: 2 })).toEqual(
    { visible: true, enabled: true, reason: null },
  );
});

it("debits only a currently unlocked account with sufficient funds, without upsert or whole-trainer writes", async () => {
  findAndUpdateDocument.mockResolvedValue({ value: { dreamCards: 1 } });
  expect(await chargeAutoBattle({ userId: "player", cost: 2 })).toEqual({
    paid: true,
    reason: null,
  });
  expect(findAndUpdateDocument).toHaveBeenCalledWith(
    collectionNames.USERS,
    { userId: "player", hasDarkrai: true, dreamCards: { $gte: 2 } },
    { $inc: { dreamCards: -2 } },
    { upsert: false, returnDocument: "after" },
  );
  findAndUpdateDocument.mockResolvedValue({ value: null });
  expect(await chargeAutoBattle({ userId: "player", cost: 2 })).toEqual({
    paid: false,
    reason: "auto_payment_failed",
  });
});

it("does not turn an ambiguous database error into a safe-to-retry payment rejection", async () => {
  findAndUpdateDocument.mockRejectedValue(new Error("connection lost"));
  await expect(chargeAutoBattle({ userId: "player", cost: 2 })).rejects.toThrow(
    "connection lost",
  );
});

it("removes the obsolete Instant Auto setting from the settings menu", () => {
  expect(userSettingsConfig).not.toHaveProperty("instantAutoBattle");
});
