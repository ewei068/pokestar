jest.mock("../../../services/trainer", () => ({
  getTrainerFromId: jest.fn(),
  getTrainer: jest.fn(),
}));
jest.mock("../../../services/durableBattle", () => ({
  getDurableBattleService: jest.fn(),
}));
const { getTrainerFromId } = require("../../../services/trainer");
const { getDurableBattleService } = require("../../../services/durableBattle");
const { createMockBattle } = require("../../../__testing__/mocks/battle");
const {
  createMockPokemonParty,
} = require("../../../__testing__/mocks/pokemon");
const {
  MemoryBattleCollection,
} = require("../../../__testing__/mocks/battleCollection");
const { BattleStore } = require("../../../battle/persistence/BattleStore");
const { BattleService } = require("../../../battle/service/BattleService");
const { getAutoBattleEligibility } = require("../../../services/battleAuto");
const {
  renderBattle,
} = require("../../../battle/discord/durableBattleMessages");
const battleInfo = require("../battleInfo");

const autoButton = (send) =>
  send.components
    .flatMap((row) => row.components)
    .find((c) => c.data.label?.endsWith("Auto"));
const prepare = async () => {
  const autoCharge = jest.fn().mockResolvedValue({ paid: true });
  const onCompleted = jest.fn().mockResolvedValue("Rewards once");
  const store = new BattleStore(new MemoryBattleCollection());
  const service = new BattleService(store, {
    autoEligibility: getAutoBattleEligibility,
    autoCharge,
    onCompleted,
    npcAction: () => ({ action: "skipTurn" }),
    autoAction: (battle) => ({
      action: "useMove",
      moveId: "m33",
      targetPokemonId: battle.parties.Team2.pokemons[0].id,
    }),
    yieldAuto: () => Promise.resolve(),
  });
  getDurableBattleService.mockResolvedValue(service);
  const { battle, team2 } = createMockBattle({
    team1Party: createMockPokemonParty({ size: 1 }),
    team2Party: createMockPokemonParty({ size: 1 }),
  });
  team2.party.pokemons[0].remainingHp = 1;
  battle.parties.Team2.pokemons[0].hp = 1;
  battle.initialParams.autoBattleCost = 2;
  await service.start({ battle });
  const userId = (await store.get(battle.id)).participantIds[0];
  return {
    store,
    service,
    battleId: battle.id,
    userId,
    autoCharge,
    onCompleted,
  };
};
beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  getTrainerFromId.mockResolvedValue({
    data: { hasDarkrai: true, dreamCards: 3, settings: {} },
  });
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

it("shows current eligibility despite false stored flags, defers before simulation/payment, and sends one final result", async () => {
  const { store, service, battleId, userId, autoCharge, onCompleted } =
    await prepare();
  const send = await renderBattle(service, battleId, userId);
  const auto = autoButton(send);
  expect(auto.data.label).toBe("x2 Auto");
  expect(auto.data.disabled).toBe(false);
  const interaction = {
    id: "discord-auto",
    user: { id: userId },
    message: send,
    update: jest.fn(),
    deferUpdate: jest.fn(),
    editReply: jest.fn(),
  };
  autoCharge.mockImplementation(async () => {
    expect(interaction.deferUpdate).toHaveBeenCalledTimes(1);
    expect(interaction.editReply).not.toHaveBeenCalled();
    return { paid: true };
  });
  await battleInfo(interaction, JSON.parse(auto.data.custom_id));
  expect(interaction.update).not.toHaveBeenCalled();
  expect(interaction.editReply).toHaveBeenCalledTimes(1);
  expect(interaction.editReply.mock.calls[0][0].content).toContain(
    "Rewards once",
  );
  expect((await store.get(battleId)).status).toBe("completed");
  expect(onCompleted).toHaveBeenCalledTimes(1);
});

it("keeps Auto visible but disabled when the latest balance becomes insufficient", async () => {
  const { service, battleId, userId } = await prepare();
  const before = await renderBattle(service, battleId, userId);
  expect(autoButton(before).data.disabled).toBe(false);
  getTrainerFromId.mockResolvedValue({
    data: { hasDarkrai: true, dreamCards: 0, settings: {} },
  });
  expect(
    autoButton(await renderBattle(service, battleId, userId)).data.disabled,
  ).toBe(true);
});
