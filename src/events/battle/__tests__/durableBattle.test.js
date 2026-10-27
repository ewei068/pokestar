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

describe("continue-battle controls", () => {
  it.each([eventNames.DURABLE_BATTLE_PICK, eventNames.DURABLE_BATTLE_PAGE])(
    "does not replace another trainer's battle list for %s",
    async (eventName) => {
      getDurableBattleService.mockClear();
      const interaction = { user: { id: "other" }, update: jest.fn() };
      const result = await durableBattle(interaction, {
        eventName,
        u: "owner",
        p: 1,
      });
      expect(result.err).toContain("/continue-battle");
      expect(interaction.update).not.toHaveBeenCalled();
      expect(getDurableBattleService).not.toHaveBeenCalled();
    },
  );
  it("opens the selected battle with the existing battle controls", async () => {
    const service = new BattleService(
      new BattleStore(new MemoryBattleCollection()),
    );
    getDurableBattleService.mockResolvedValue(service);
    const { battle } = createMockBattle();
    await service.start({ battle });
    const userId = battle.userIds.find((id) => !battle.isNpc(id));
    const act = jest.spyOn(service, "act");
    const interaction = {
      user: { id: userId },
      values: [battle.id],
      update: jest.fn(),
    };
    const result = await durableBattle(interaction, {
      eventName: eventNames.DURABLE_BATTLE_PICK,
      u: userId,
    });
    expect(result).toBeNull();
    const send = interaction.update.mock.calls[0][0];
    expect(send.embeds).not.toHaveLength(0);
    expect(
      JSON.parse(send.components[1].components[0].data.custom_id).eventName,
    ).toBe(eventNames.BATTLE_MOVE_SELECT);
    expect(act).not.toHaveBeenCalled();
  });
  it("renders the requested page with controls owned by the same trainer", async () => {
    const service = {
      listActive: jest.fn().mockResolvedValue(
        Array.from({ length: 26 }, (_, index) => ({
          battleId: `battle-${index}`,
          updatedAt: 26 - index,
          mode: { type: "PvE" },
          view: { turn: 1, teams: {} },
        })),
      ),
    };
    getDurableBattleService.mockResolvedValue(service);
    const interaction = { user: { id: "owner" }, update: jest.fn() };
    const result = await durableBattle(interaction, {
      eventName: eventNames.DURABLE_BATTLE_PAGE,
      u: "owner",
      p: 1,
    });
    expect(result).toBeNull();
    expect(service.listActive).toHaveBeenCalledWith("owner");
    const send = interaction.update.mock.calls[0][0];
    expect(send.content).toBe("Your ongoing battles (26) · Page 2/2");
    const picker = send.components[0].components[0].toJSON();
    expect(picker.options.map((option) => option.value)).toEqual(["battle-25"]);
    expect(JSON.parse(picker.custom_id)).toEqual({
      eventName: eventNames.DURABLE_BATTLE_PICK,
      u: "owner",
    });
    const buttons = send.components[1].components.map((button) => button.toJSON());
    expect(JSON.parse(buttons[0].custom_id)).toEqual({
      eventName: eventNames.DURABLE_BATTLE_PAGE,
      p: 0,
      u: "owner",
    });
    expect(buttons[0].disabled).toBe(false);
    expect(buttons[1].disabled).toBe(true);
  });
});
