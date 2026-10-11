jest.mock("../trainer", () => ({
  ...jest.requireActual("../trainer"),
  getTrainer: jest.fn(),
}));

const { getTrainer } = require("../trainer");
const { processBattleCompletionRewards } = require("../battle");

describe("battle completion boundary", () => {
  it("propagates a reward read failure in strict mode", async () => {
    /** @type {jest.Mock} */ (getTrainer).mockResolvedValue({
      err: "database unavailable",
    });
    const battle = {
      winner: null,
      users: { player: { id: "player", username: "Player" } },
      isNpc: () => false,
      isPvp: false,
      npcType: "pve",
    };

    await expect(
      processBattleCompletionRewards(
        /** @type {Battle} */ (/** @type {unknown} */ (battle)),
        { strict: true },
      ),
    ).rejects.toThrow("Failed to get trainer player");
  });

  it("refuses callback-backed completion in strict mode", async () => {
    await expect(
      processBattleCompletionRewards(
        /** @type {Battle} */ (/** @type {unknown} */ ({ winCallback: () => {} })),
        { strict: true },
      ),
    ).rejects.toThrow("Callback-backed completion needs a durable mode handler");
  });
});
