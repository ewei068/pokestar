jest.mock("../../../services/durableBattle", () => ({
  getDurableBattleService: jest.fn(),
  isDurableBattleEnabled: jest.fn().mockReturnValue(true),
}));
jest.mock("../../../battle/discord/durableBattleMessages", () => ({
  renderBattle: jest.fn(),
}));
jest.mock("../../../services/party", () => ({
  validatePartyForBattle: jest.fn(),
}));
jest.mock("../../../services/state", () => ({
  getState: jest.fn(),
}));
jest.mock("../../../services/trainer", () => ({
  getTrainer: jest.fn(),
}));
jest.mock("../../../services/battle", () => ({
  getStartTurnSend: jest.fn(),
}));

const {
  getDurableBattleService,
  isDurableBattleEnabled,
} = require("../../../services/durableBattle");
const { getStartTurnSend } = require("../../../services/battle");
const { renderBattle } = require("../../../battle/discord/durableBattleMessages");
const { validatePartyForBattle } = require("../../../services/party");
const { getState } = require("../../../services/state");
const { getTrainer } = require("../../../services/trainer");
const pvpAccept = require("../pvpAccept");

describe("PvP durable acceptance", () => {
  it("starts once and reopens the same stored battle after another accept", async () => {
    /** @type {jest.Mock} */ (isDurableBattleEnabled).mockReturnValue(true);
    const battle = { addTeam: jest.fn(), addTrainer: jest.fn() };
    const state = { battle, userId: "challenger", opponentUserId: "opponent" };
    const service = { start: jest.fn().mockResolvedValue({ battleId: "battle-1" }) };
    /** @type {jest.Mock} */ (getState).mockReturnValue(state);
    /** @type {jest.Mock} */ (getDurableBattleService).mockResolvedValue(service);
    /** @type {jest.Mock} */ (getTrainer).mockResolvedValue({ data: { userId: "opponent" } });
    /** @type {jest.Mock} */ (validatePartyForBattle).mockResolvedValue({ data: [{ _id: "pokemon" }] });
    /** @type {jest.Mock} */ (renderBattle).mockResolvedValue({ content: "Current battle" });
    const interaction = {
      user: { id: "opponent" },
      update: jest.fn(),
    };

    await pvpAccept(interaction, { stateId: "challenge" });
    await pvpAccept(interaction, { stateId: "challenge" });

    expect(service.start).toHaveBeenCalledTimes(1);
    expect(service.start).toHaveBeenCalledWith({ battle, mode: { type: "pvp" } });
    expect(state.durableBattleId).toBe("battle-1");
    expect(state.battle).toBeNull();
    expect(renderBattle).toHaveBeenCalledTimes(2);
    expect(renderBattle).toHaveBeenCalledWith(service, "battle-1", "opponent");
    expect(interaction.update).toHaveBeenCalledWith({ content: "Current battle" });
  });

  it("keeps the existing in-memory flow when durable battles are disabled", async () => {
    /** @type {jest.Mock} */ (isDurableBattleEnabled).mockReturnValue(false);
    /** @type {jest.Mock} */ (getDurableBattleService).mockClear();
    const battle = {
      hasStarted: false,
      addTeam: jest.fn(),
      addTrainer: jest.fn(),
      start: jest.fn(),
    };
    /** @type {jest.Mock} */ (getState).mockReturnValue({ battle, userId: "challenger" });
    /** @type {jest.Mock} */ (getTrainer).mockResolvedValue({ data: { userId: "opponent" } });
    /** @type {jest.Mock} */ (validatePartyForBattle).mockResolvedValue({ data: [{ _id: "pokemon" }] });
    /** @type {jest.Mock} */ (getStartTurnSend).mockResolvedValue({ content: "Legacy battle" });
    const interaction = { user: { id: "opponent" }, update: jest.fn() };

    await pvpAccept(interaction, { stateId: "challenge" });

    expect(battle.start).toHaveBeenCalledTimes(1);
    expect(getDurableBattleService).not.toHaveBeenCalled();
    expect(interaction.update).toHaveBeenCalledWith({ content: "Legacy battle" });
  });
});
