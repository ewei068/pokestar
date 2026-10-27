jest.mock("../../config/eventConfig", () => {
  const original = jest.requireActual("../../config/eventConfig");
  return {
    eventNames: original.eventNames,
    eventConfig: {
      [original.eventNames.BATTLE_TARGET_CONFIRM]:
        original.eventConfig[original.eventNames.BATTLE_TARGET_CONFIRM],
    },
  };
});
jest.mock("../../events/battle/battleTargetConfirm", () => jest.fn());
jest.mock("../../services/trainer", () => ({
  ...jest.requireActual("../../services/trainer"),
  addExpAndMoney: jest.fn().mockResolvedValue({}),
}));
jest.mock("../../services/misc", () => ({
  ...jest.requireActual("../../services/misc"),
  getPreInteractionUpsellData: jest.fn().mockResolvedValue({}),
  sendUpsells: jest.fn().mockResolvedValue(undefined),
}));
const confirm = require("../../events/battle/battleTargetConfirm");
const { addExpAndMoney } = require("../../services/trainer");
const { handleEvent } = require("../eventHandler");
const { eventNames } = require("../../config/eventConfig");

describe("battle interaction reward policy", () => {
  beforeEach(() => jest.clearAllMocks());
  it.each([
    ["Mongo-backed", "durable-battle-current-revision"],
    ["stale", "durable-battle-old-revision"],
    ["legacy", "legacy-battle"],
  ])(
    "awards configured rewards for successful %s battle interactions",
    async (_, stateId) => {
      confirm.mockResolvedValue(undefined);
      const data = { eventName: eventNames.BATTLE_TARGET_CONFIRM, stateId };
      const interaction = {
        customId: JSON.stringify(data),
        user: { id: "player" },
      };
      await handleEvent(interaction);
      expect(confirm).toHaveBeenCalledWith(interaction, data, undefined);
      expect(addExpAndMoney).toHaveBeenCalledTimes(1);
      expect(addExpAndMoney).toHaveBeenCalledWith({ id: "player" }, 10, 25);
    },
  );
  it("does not award rewards when a battle interaction returns an error", async () => {
    confirm.mockResolvedValue({ err: "It's not your turn." });
    const interaction = {
      customId: JSON.stringify({ eventName: eventNames.BATTLE_TARGET_CONFIRM }),
      user: { id: "player" },
      reply: jest.fn().mockResolvedValue(undefined),
    };
    await handleEvent(interaction);
    expect(interaction.reply).toHaveBeenCalledWith({
      content: "It's not your turn.",
      ephemeral: true,
    });
    expect(addExpAndMoney).not.toHaveBeenCalled();
  });
});
