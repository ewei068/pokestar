jest.mock("../trainer", () => ({
  ...jest.requireActual("../trainer"),
  getTrainerFromId: jest.fn(),
}));

const { raidConfig } = require("../../config/npcConfig");
const { getTrainerFromId } = require("../trainer");
const { onRaidWin } = require("../raid");

describe("durable raid completion", () => {
  it("keeps a failed reward batch available for reconciliation", async () => {
    const [raidId, raidData] = Object.entries(raidConfig)[0];
    const difficulty = Object.keys(raidData.difficulties)[0];
    /** @type {jest.Mock} */ (getTrainerFromId).mockResolvedValue({
      err: "database unavailable",
    });
    const raid = {
      raidId,
      difficulty,
      userId: "owner",
      participants: { owner: 20 },
      boss: { stats: [100] },
    };

    await expect(onRaidWin(raid, { strict: true })).rejects.toThrow(
      "Failed raid rewards for owner",
    );
  });
});
