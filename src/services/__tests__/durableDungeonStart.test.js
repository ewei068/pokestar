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

const { dungeonConfig } = require("../../config/npcConfig");
const { createMockTrainer } = require("../../__testing__/mocks/trainer");
const { captureBattleSetup } = require("../../battle/persistence/battleRecord");
const { getTrainer } = require("../trainer");
const { validatePartyForBattle } = require("../party");
const { getState } = require("../state");
const { getDurableBattleService } = require("../durableBattle");
const { renderBattle } = require("../../battle/discord/durableBattleMessages");
const { buildDungeonSend } = require("../battle");

describe("dungeon durable start", () => {
  it("stores generated future phases before the first turn", async () => {
    const [dungeonId, dungeon] = Object.entries(dungeonConfig).find(
      ([, data]) => data.name === "Mind Temple",
    );
    const difficulty = Object.keys(dungeon.difficulties)[0];
    const state = { dungeonId, difficulty };
    const trainer = createMockTrainer();
    /** @type {jest.Mock} */ (getState).mockReturnValue(state);
    /** @type {jest.Mock} */ (getTrainer).mockResolvedValue({ data: trainer.trainer });
    /** @type {jest.Mock} */ (validatePartyForBattle).mockResolvedValue({ data: trainer.party.pokemons });
    const service = { start: jest.fn().mockResolvedValue({ battleId: "dungeon-1" }) };
    /** @type {jest.Mock} */ (getDurableBattleService).mockResolvedValue(service);
    /** @type {jest.Mock} */ (renderBattle).mockResolvedValue({ content: "Current dungeon" });

    const result = await buildDungeonSend({
      stateId: "menu",
      user: trainer.trainer.user,
      view: "battle",
    });

    expect(result).toEqual({ send: { content: "Current dungeon" }, err: null });
    const { battle, mode } = service.start.mock.calls[0][0];
    expect(mode).toEqual({ type: "dungeon", dungeonId, difficulty });
    expect(battle.hasStarted).toBe(false);
    const setup = captureBattleSetup(battle);
    expect(Object.values(setup.phaseQueues)[0]).toHaveLength(
      dungeon.difficulties[difficulty].phases.length - 1,
    );
    expect(state.durableBattleId).toBe("dungeon-1");
    expect(state.battle).toBeUndefined();
    expect(renderBattle).toHaveBeenCalledWith(
      service,
      "dungeon-1",
      trainer.trainer.userId,
    );
  });
});
