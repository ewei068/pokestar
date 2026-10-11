jest.mock("../trainer", () => ({
  ...jest.requireActual("../trainer"),
  getTrainer: jest.fn(),
  updateTrainer: jest.fn(),
}));

const { getTrainer, updateTrainer } = require("../trainer");
const { battleTowerConfig } = require("../../config/npcConfig");
const { getIdFromTowerStage } = require("../../utils/battleUtils");
const {
  processBattleCompletionRewards,
  applyDurableTowerCompletion,
} = require("../battle");

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

  it("applies a stored tower stage before granting rewards", async () => {
    const trainer = { userId: "player", lastTowerStage: 0 };
    /** @type {jest.Mock} */ (getTrainer).mockResolvedValue({ data: trainer });
    /** @type {jest.Mock} */ (updateTrainer).mockResolvedValue({ data: trainer });
    const battle = {
      winner: "Player",
      teams: { Player: { isNpc: false, userIds: ["player"] } },
      users: { player: { id: "player" } },
      npcId: getIdFromTowerStage(1),
      rewards: null,
    };

    await applyDurableTowerCompletion(
      /** @type {Battle} */ (/** @type {unknown} */ (battle)),
      { stage: 1 },
    );

    expect(trainer.lastTowerStage).toBe(1);
    expect(updateTrainer).toHaveBeenCalledWith(trainer);
    expect(battle.rewards).toEqual(battleTowerConfig[1].rewards);
  });
});
