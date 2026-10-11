const { createMockBattle } = require("../../../__testing__/mocks/battle");
const {
  MemoryBattleCollection,
} = require("../../../__testing__/mocks/battleCollection");
const { BattleStore } = require("../../persistence/BattleStore");
const { BattleService } = require("../../service/BattleService");
const {
  renderBattleList,
  renderBattle,
  renderTargetSelection,
} = require("../durableBattleMessages");

describe("durable Discord battle messages", () => {
  it("shows a participant's current battle and keeps component IDs within Discord's limit", async () => {
    const service = new BattleService(new BattleStore(new MemoryBattleCollection()));
    const { battle } = createMockBattle();
    const started = await service.start({ battle, mode: { type: "pve" } });
    const userId = battle.userIds.find((id) => !battle.isNpc(id));

    const list = await renderBattleList(service, userId);
    expect(list.content).toContain("1");
    expect(list.components).toHaveLength(1);
    const opened = await renderBattle(service, battle.id, userId);
    expect(opened.embeds).toHaveLength(1);
    expect(opened.content).toContain(battle.id);
    for (const row of opened.components) {
      for (const component of row.components) {
        expect(/** @type {any} */ (component.data).custom_id.length).toBeLessThanOrEqual(100);
      }
    }

    const source = battle.activePokemon;
    const moveId = Object.keys(source.moveIds).find(
      (id) =>
        battle.getEligibleTargets(source, /** @type {MoveIdEnum} */ (id))
          .length > 0,
    );
    const targets = await renderTargetSelection(
      service,
      battle.id,
      userId,
      started.revision,
      moveId,
    );
    expect(/** @type {any} */ (targets.components[0].components[0].data).custom_id.length).toBeLessThanOrEqual(100);
    expect((await renderBattle(service, battle.id, "stranger")).embeds).toEqual([]);
  });

  it("pages all ongoing battles", async () => {
    const service = {
      listActive: jest.fn().mockResolvedValue(
        Array.from({ length: 27 }, (_, index) => ({
          battleId: `battle-${index}`,
          mode: { type: "pve" },
          view: { turn: index },
          updatedAt: new Date(2026, 0, index + 1),
        })),
      ),
    };

    const first = await renderBattleList(service, "user", 0);
    const second = await renderBattleList(service, "user", 1);

    expect(/** @type {any} */ (first.components[0].components[0]).options).toHaveLength(25);
    expect(/** @type {any} */ (second.components[0].components[0]).options).toHaveLength(2);
    expect(second.content).toContain("Page 2/2");
  });
});
