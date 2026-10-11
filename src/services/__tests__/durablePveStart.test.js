jest.mock("../trainer", () => ({
  ...jest.requireActual("../trainer"),
  getTrainer: jest.fn(),
}));
jest.mock("../party", () => ({
  ...jest.requireActual("../party"),
  validatePartyForBattle: jest.fn(),
}));
jest.mock("../state", () => ({
  ...jest.requireActual("../state"),
  getState: jest.fn(),
}));
jest.mock("../durableBattle", () => ({
  getDurableBattleService: jest.fn(),
  isDurableBattleEnabled: jest.fn().mockReturnValue(true),
}));
jest.mock("../../battle/discord/durableBattleMessages", () => ({
  renderBattle: jest.fn(),
}));

const { npcConfig } = require("../../config/npcConfig");
const { createMockTrainer } = require("../../__testing__/mocks/trainer");
const { getTrainer } = require("../trainer");
const { validatePartyForBattle } = require("../party");
const { getState } = require("../state");
const { getDurableBattleService } = require("../durableBattle");
const { renderBattle } = require("../../battle/discord/durableBattleMessages");
const { buildPveSend } = require("../battle");

describe("PvE durable start", () => {
  it("stores the generated setup and opens its battle ID", async () => {
    const [npcId, npcData] = Object.entries(npcConfig)[0];
    const difficulty = Object.keys(npcData.difficulties)[0];
    const state = { npcId, difficulty };
    const trainer = createMockTrainer();
    getState.mockReturnValue(state);
    getTrainer.mockResolvedValue({ data: trainer.trainer });
    validatePartyForBattle.mockResolvedValue({ data: trainer.party.pokemons });
    const service = { start: jest.fn().mockResolvedValue({ battleId: "pve-1" }) };
    getDurableBattleService.mockResolvedValue(service);
    renderBattle.mockResolvedValue({ content: "Current battle" });

    const result = await buildPveSend({
      stateId: "menu",
      user: trainer.trainer.user,
      view: "battle",
    });

    expect(result).toEqual({ send: { content: "Current battle" }, err: null });
    expect(service.start).toHaveBeenCalledWith({
      battle: expect.objectContaining({ hasStarted: false }),
      mode: { type: "pve", npcId, difficulty },
    });
    expect(state.durableBattleId).toBe("pve-1");
    expect(state.battle).toBeUndefined();
    expect(renderBattle).toHaveBeenCalledWith(service, "pve-1", trainer.trainer.userId);
  });
});
