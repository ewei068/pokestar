jest.mock("../../../services/trainer", () => ({
  getTrainerFromId: jest.fn().mockResolvedValue({ data: { settings: {} } }),
}));

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

const { getTrainerFromId } = require("../../../services/trainer");
const { buildBattleEmbed } = require("../../../embeds/battleEmbeds");
const { restoreBattle } = require("../../persistence/battleRecord");

describe("durable Discord battle messages", () => {
  it("shows a participant's current battle and keeps component IDs within Discord's limit", async () => {
    const service = new BattleService(
      new BattleStore(new MemoryBattleCollection()),
    );
    const { battle } = createMockBattle();
    const started = await service.start({ battle, mode: { type: "pve" } });
    const userId = battle.userIds.find((id) => !battle.isNpc(id));

    const list = await renderBattleList(service, userId);
    expect(list.content).toContain("1");
    expect(list.components).toHaveLength(1);
    const opened = await renderBattle(service, battle.id, userId);
    expect(opened.embeds).toHaveLength(1);
    expect(opened.content).not.toContain(battle.id);
    expect(opened.content).not.toContain("Revision");
    expect(
      opened.components[0].components.map((button) => button.data.label),
    ).toEqual(["Teams", "Moves", "Refresh"]);
    for (const row of opened.components) {
      for (const component of row.components) {
        expect(
          /** @type {any} */ (component.data).custom_id.length,
        ).toBeLessThanOrEqual(100);
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
    const selectors = targets.components
      .flatMap((row) => row.components)
      .filter((component) => component.data.type === 3);
    expect(selectors.map((selector) => selector.data.placeholder)).toEqual([
      "Select a move",
      "Select a target",
    ]);
    expect(
      selectors[0].options.find((option) => option.data.value === moveId).data
        .default,
    ).toBe(true);
    expect(
      selectors[0].options.find((option) => option.data.value === moveId).data
        .emoji,
    ).toBeDefined();
    const targetId = battle.getEligibleTargets(source, moveId)[0].id;
    const confirmed = await renderTargetSelection(
      service,
      battle.id,
      userId,
      started.revision,
      moveId,
      targetId,
    );
    expect(
      confirmed.components
        .flatMap((row) => row.components)
        .some((component) => component.data.label === "Confirm"),
    ).toBe(true);
    expect(confirmed.components.length).toBeLessThanOrEqual(5);
    for (const row of confirmed.components)
      for (const component of row.components) {
        expect(component.data.custom_id.length).toBeLessThanOrEqual(100);
      }
    expect((await service.store.get(battle.id)).revision).toBe(
      started.revision,
    );
    expect((await renderBattle(service, battle.id, "stranger")).embeds).toEqual(
      [],
    );
  });

  it("uses the player's mobile display preference and safely refreshes stale selections", async () => {
    getTrainerFromId.mockResolvedValueOnce({
      data: { settings: { deviceType: "mobile" } },
    });
    const service = new BattleService(
      new BattleStore(new MemoryBattleCollection()),
    );
    const { battle } = createMockBattle();
    const started = await service.start({ battle });
    const restored = restoreBattle(await service.store.get(battle.id));
    const { userId } = restored.activePokemon;
    const send = await renderBattle(service, battle.id, userId);
    expect(send.embeds[0].toJSON()).toEqual(
      buildBattleEmbed(restored, { isMobile: true }).toJSON(),
    );
    const stale = await renderTargetSelection(
      service,
      battle.id,
      userId,
      started.revision - 1,
      "m33",
      "missing",
    );
    expect(
      stale.components
        .flatMap((row) => row.components)
        .filter((component) => component.data.type === 3),
    ).toHaveLength(1);
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

    expect(
      /** @type {any} */ (first.components[0].components[0]).options,
    ).toHaveLength(25);
    expect(
      /** @type {any} */ (second.components[0].components[0]).options,
    ).toHaveLength(2);
    expect(second.content).toContain("Page 2/2");
  });
});
