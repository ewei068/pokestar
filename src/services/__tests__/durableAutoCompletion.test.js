jest.mock("../../battle/persistence/mongoBattleStore", () => ({
  createMongoBattleStore: jest.fn(),
}));
jest.mock("../battle", () => ({ processDurableBattleCompletion: jest.fn() }));
jest.mock("../battleAuto", () => ({
  getAutoBattleEligibility: jest.fn(),
  chargeAutoBattle: jest.fn(),
  recordAutoBattleUsage: jest.fn(),
}));
const {
  createMongoBattleStore,
} = require("../../battle/persistence/mongoBattleStore");
const {
  getAutoBattleEligibility,
  chargeAutoBattle,
  recordAutoBattleUsage,
} = require("../battleAuto");
const { processDurableBattleCompletion } = require("../battle");
const { getDurableBattleService } = require("../durableBattle");
const { BattleStore } = require("../../battle/persistence/BattleStore");
const {
  MemoryBattleCollection,
} = require("../../__testing__/mocks/battleCollection");
const { createMockBattle } = require("../../__testing__/mocks/battle");
const { createMockPokemonParty } = require("../../__testing__/mocks/pokemon");

beforeEach(() => {
  jest.clearAllMocks();
  getAutoBattleEligibility.mockResolvedValue({ visible: true, enabled: true });
  chargeAutoBattle.mockResolvedValue({ paid: true });
  recordAutoBattleUsage.mockResolvedValue(undefined);
  processDurableBattleCompletion.mockResolvedValue("Rewards granted");
});
const prepare = async () => {
  createMongoBattleStore.mockResolvedValue(
    new BattleStore(new MemoryBattleCollection()),
  );
  const service = await getDurableBattleService();
  service.npcAction = () => ({ action: "skipTurn" });
  service.autoAction = (battle) => ({
    action: "useMove",
    moveId: "m33",
    targetPokemonId: battle.parties.Team2.pokemons[0].id,
  });
  service.yieldAuto = () => Promise.resolve();
  const { battle, team2 } = createMockBattle({
    team1Party: createMockPokemonParty({ size: 1 }),
    team2Party: createMockPokemonParty({ size: 1 }),
  });
  team2.party.pokemons[0].remainingHp = 1;
  battle.parties.Team2.pokemons[0].hp = 1;
  const start = await service.start({ battle, mode: { type: "pve" } });
  const userId = (await service.store.get(battle.id)).participantIds[0];
  return {
    service,
    request: {
      battleId: battle.id,
      userId,
      expectedRevision: start.revision,
      requestId: `auto-${battle.id}`,
    },
  };
};

it("records Auto usage under the production completion claim before rewards, once", async () => {
  const { service, request } = await prepare();
  await service.auto(request);
  await service.auto(request);
  expect(chargeAutoBattle).toHaveBeenCalledTimes(1);
  expect(recordAutoBattleUsage).toHaveBeenCalledTimes(1);
  expect(processDurableBattleCompletion).toHaveBeenCalledTimes(1);
  expect(recordAutoBattleUsage.mock.invocationCallOrder[0]).toBeLessThan(
    processDurableBattleCompletion.mock.invocationCallOrder[0],
  );
  expect((await service.store.get(request.battleId)).completionStatus).toBe(
    "applied",
  );
});

it("does not grant rewards or retry the charge when Auto usage recording fails", async () => {
  const { service, request } = await prepare();
  recordAutoBattleUsage.mockRejectedValue(new Error("quest write failed"));
  await service.auto(request);
  await service.get({ battleId: request.battleId, userId: request.userId });
  expect(chargeAutoBattle).toHaveBeenCalledTimes(1);
  expect(recordAutoBattleUsage).toHaveBeenCalledTimes(1);
  expect(processDurableBattleCompletion).not.toHaveBeenCalled();
  expect((await service.store.get(request.battleId)).completionStatus).toBe(
    "failed",
  );
});
