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
  it("does not award per-click rewards for Mongo-backed or stale battle controls", async () => {
    confirm.mockResolvedValue({ skipInteractionRewards: true });
    await handleEvent({
      customId: JSON.stringify({ eventName: eventNames.BATTLE_TARGET_CONFIRM }),
      user: { id: "player" },
    });
    expect(confirm).toHaveBeenCalled();
    expect(addExpAndMoney).not.toHaveBeenCalled();
  });
  it("retains configured rewards for legacy battle interactions", async () => {
    confirm.mockResolvedValue({ skipInteractionRewards: false });
    await handleEvent({
      customId: JSON.stringify({ eventName: eventNames.BATTLE_TARGET_CONFIRM }),
      user: { id: "player" },
    });
    expect(addExpAndMoney).toHaveBeenCalledWith({ id: "player" }, 10, 25);
  });
});
