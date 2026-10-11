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

describe("durable Discord battle actions", () => {
  it("submits an action and refreshes stale components to the latest revision", async () => {
    const store = new BattleStore(new MemoryBattleCollection());
    const service = new BattleService(store, {
      npcAction: () => ({ action: "skipTurn" }),
    });
    getDurableBattleService.mockResolvedValue(service);
    const { battle } = createMockBattle();
    const started = await service.start({ battle });
    const userId = battle.userIds.find((id) => !battle.isNpc(id));
    const interaction = {
      id: "discord-interaction-1",
      user: { id: userId },
      update: jest.fn().mockResolvedValue(undefined),
    };
    const data = {
      eventName: eventNames.DURABLE_BATTLE_SKIP,
      b: battle.id,
      r: started.revision,
    };

    await durableBattle(interaction, data);

    const current = await store.get(battle.id);
    expect(current.revision).toBeGreaterThan(started.revision);
    expect(interaction.update).toHaveBeenCalledWith(
      expect.objectContaining({ embeds: expect.any(Array) }),
    );

    const staleInteraction = {
      ...interaction,
      id: "discord-interaction-2",
      update: jest.fn().mockResolvedValue(undefined),
    };
    await durableBattle(staleInteraction, data);

    expect((await store.get(battle.id)).revision).toBe(current.revision);
    expect(staleInteraction.update.mock.calls[0][0].content).toContain(
      "Action was not accepted (stale_revision)",
    );
  });
});
