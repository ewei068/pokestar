jest.mock("../../../services/trainer", () => ({
  getTrainerFromId: jest.fn().mockResolvedValue({ data: { settings: {} } }),
}));
const { createMockBattle } = require("../../../__testing__/mocks/battle");
const {
  MemoryBattleCollection,
} = require("../../../__testing__/mocks/battleCollection");
const { BattleStore } = require("../../persistence/BattleStore");
const { BattleService } = require("../../service/BattleService");
const { renderBattleList, renderBattle } = require("../durableBattleMessages");
const { getTrainerFromId } = require("../../../services/trainer");
const { buildBattleEmbed } = require("../../../embeds/battleEmbeds");
const { restoreBattle } = require("../../persistence/battleRecord");
const { eventNames } = require("../../../config/eventConfig");

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe("Discord continuation entry points", () => {
  it("opens the original battle renderer/events without exposing diagnostic IDs", async () => {
    const service = new BattleService(
      new BattleStore(new MemoryBattleCollection()),
    );
    const { battle } = createMockBattle();
    await service.start({ battle, mode: { type: "pve" } });
    const userId = battle.userIds.find((id) => !battle.isNpc(id));
    const opened = await renderBattle(service, battle.id, userId);
    expect(opened.content).not.toContain(battle.id);
    expect(opened.content).not.toContain("Revision");
    expect(opened.components[0].components.map((c) => c.data.label)).toEqual([
      "Teams",
      "Moves",
      "Refresh",
    ]);
    expect(
      JSON.parse(opened.components[1].components[0].data.custom_id).eventName,
    ).toBe(eventNames.BATTLE_MOVE_SELECT);
    for (const row of opened.components)
      for (const c of row.components)
        expect(c.toJSON().custom_id.length).toBeLessThanOrEqual(100);
    expect((await renderBattle(service, battle.id, "stranger")).embeds).toEqual(
      [],
    );
  });
  it("uses mobile formatting in the shared renderer", async () => {
    getTrainerFromId.mockResolvedValueOnce({
      data: { settings: { deviceType: "mobile" } },
    });
    const service = new BattleService(
      new BattleStore(new MemoryBattleCollection()),
    );
    const { battle } = createMockBattle();
    await service.start({ battle });
    const restored = restoreBattle(await service.store.get(battle.id));
    const send = await renderBattle(
      service,
      battle.id,
      restored.activePokemon.userId,
    );
    expect(send.embeds[0].toJSON()).toEqual(
      buildBattleEmbed(restored, { isMobile: true }).toJSON(),
    );
  });
  it("pages ongoing battles with readable descriptions", async () => {
    const service = {
      listActive: jest.fn().mockResolvedValue(
        Array.from({ length: 27 }, (_, index) => ({
          battleId: `battle-${index}`,
          mode: { type: "pve" },
          view: { turn: index, teams: { Player: {}, NPC: {} } },
          updatedAt: new Date(2026, 0, index + 1),
        })),
      ),
    };
    const first = await renderBattleList(service, "user", 0);
    const second = await renderBattleList(service, "user", 1);
    expect(first.components[0].components[0].options).toHaveLength(25);
    expect(second.components[0].components[0].options).toHaveLength(2);
    expect(second.components[0].components[0].options[0].data.description).toBe(
      "Player vs NPC",
    );
    expect(second.content).toContain("Page 2/2");
  });
});
