jest.mock("../../../services/trainer", () => ({
  getTrainerFromId: jest.fn().mockResolvedValue({ data: { settings: {} } }),
}));
jest.mock("../../../services/durableBattle", () => ({
  getDurableBattleService: jest.fn(),
}));
const { getDurableBattleService } = require("../../../services/durableBattle");
const { createMockBattle } = require("../../../__testing__/mocks/battle");
const {
  MemoryBattleCollection,
} = require("../../../__testing__/mocks/battleCollection");
const { BattleStore } = require("../../../battle/persistence/BattleStore");
const { BattleService } = require("../../../battle/service/BattleService");
const { eventNames } = require("../../../config/eventConfig");
const durableBattle = require("../durableBattle");

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe("old durable controls", () => {
  it("does not replace a public battle picker when another trainer presses it", async () => {
    getDurableBattleService.mockClear();
    const interaction = { user: { id: "other" }, update: jest.fn() };
    const result = await durableBattle(interaction, { eventName: eventNames.DURABLE_BATTLE_PAGE, u: "owner", p: 1 });
    expect(result.err).toContain("/continue-battle");
    expect(interaction.update).not.toHaveBeenCalled();
    expect(getDurableBattleService).not.toHaveBeenCalled();
  });
  it("upgrades posted controls to the existing battle UI without executing their old selection", async () => {
    const service = new BattleService(
      new BattleStore(new MemoryBattleCollection()),
    );
    getDurableBattleService.mockResolvedValue(service);
    const { battle } = createMockBattle();
    await service.start({ battle });
    const userId = battle.userIds.find((id) => !battle.isNpc(id));
    const act = jest.spyOn(service, "act");
    for (const name of [
      eventNames.DURABLE_BATTLE_MOVE,
      eventNames.DURABLE_BATTLE_TARGET,
      eventNames.DURABLE_BATTLE_CONFIRM,
      eventNames.DURABLE_BATTLE_INFO,
      eventNames.DURABLE_BATTLE_SKIP,
    ]) {
      const interaction = {
        user: { id: userId },
        values: ["old-selection"],
        update: jest.fn(),
      };
      await durableBattle(interaction, { eventName: name, b: battle.id, r: 0 });
      const send = interaction.update.mock.calls[0][0];
      expect(send.content).toContain("Battle controls updated");
      expect(
        JSON.parse(send.components[1].components[0].data.custom_id).eventName,
      ).toBe(eventNames.BATTLE_MOVE_SELECT);
    }
    expect(act).not.toHaveBeenCalled();
  });
});
