const { getState } = require("../../../services/state");
const { buildEquipmentUpgradeSend } = require("../../../services/pokemon");
const { upgradeEquipmentLevel, rerollStatSlot } = require("../../../services/pokemonEquipment");
const { emitTrainerEvent } = require("../../../services/trainer");
const equipmentUpgrade = require("../equipmentUpgrade");

jest.mock("../../../services/state", () => ({ getState: jest.fn() }));
jest.mock("../../../services/pokemon", () => ({ buildEquipmentUpgradeSend: jest.fn(), getPokemon: jest.fn() }));
jest.mock("../../../services/pokemonEquipment", () => ({ upgradeEquipmentLevel: jest.fn(), rerollStatSlot: jest.fn() }));
jest.mock("../../../services/trainer", () => ({ getTrainer: jest.fn(async () => ({ data: {} })), emitTrainerEvent: jest.fn() }));
const mockGetState = jest.mocked(getState);
const mockBuild = jest.mocked(buildEquipmentUpgradeSend);
const mockUpgrade = /** @type {jest.Mock} */ (upgradeEquipmentLevel);
const mockReroll = /** @type {jest.Mock} */ (rerollStatSlot);
const piece = { level: 4, slots: { primary: { modifier: "baseDef", quality: 75 } } };
let state;
let interaction;

beforeEach(() => {
  jest.clearAllMocks();
  state = { userId: "owner", pokemonId: "012345678901234567890123", equipmentType: "powerBelt", button: "upgrade", slotId: "primary",
    expectedEquipmentType: "powerBelt", expectedEquipment: structuredClone(piece) };
  interaction = { user: { id: "owner" }, update: jest.fn(), followUp: jest.fn() };
  mockGetState.mockReturnValue(state);
  const result = { data: { trainer: {}, pokemon: { equipments: { powerBelt: { ...piece, level: 5 } } },
    previousEquipment: piece, equipmentType: "powerBelt", changed: true } };
  mockUpgrade.mockResolvedValue(result);
  mockReroll.mockResolvedValue(result);
  mockBuild.mockResolvedValue({ send: { embeds: [], components: [] }, err: null });
});

test("expired, foreign and invalid interactions never submit a spend", async () => {
  mockGetState.mockReturnValueOnce(null);
  expect((await equipmentUpgrade(interaction, { stateId: "state" })).err).toMatch(/expired/);
  state.userId = "other";
  expect((await equipmentUpgrade(interaction, { stateId: "state" })).err).toMatch(/not initiated/);
  state.userId = "owner";
  state.button = "unknown";
  expect((await equipmentUpgrade(interaction, { stateId: "state" })).err).toMatch(/Invalid button/);
  expect(mockUpgrade).not.toHaveBeenCalled();
  expect(mockReroll).not.toHaveBeenCalled();
});

test("upgrade submits the displayed expectation and advances it after one saved result", async () => {
  const expected = structuredClone(state.expectedEquipment);
  expect(await equipmentUpgrade(interaction, { stateId: "state" })).toBeUndefined();
  expect(mockUpgrade).toHaveBeenCalledWith(interaction.user, state.pokemonId, state.equipmentType, expected);
  expect(state.expectedEquipment.level).toBe(5);
  expect(interaction.followUp).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true, content: expect.stringContaining("level 5") }));
  expect(emitTrainerEvent).not.toHaveBeenCalled();
});

test("a confirmation without its reviewed piece never submits", async () => {
  delete state.expectedEquipment;
  expect((await equipmentUpgrade(interaction, { stateId: "state" })).err).toMatch(/expired/);
  expect(mockUpgrade).not.toHaveBeenCalled();
  expect(mockReroll).not.toHaveBeenCalled();
});

test("reroll submits the selected slot without emitting duplicate progression", async () => {
  state.button = "slot";
  await equipmentUpgrade(interaction, { stateId: "state" });
  expect(mockReroll).toHaveBeenCalledWith(interaction.user, state.pokemonId, "powerBelt", "primary", piece);
  expect(mockUpgrade).not.toHaveBeenCalled();
  expect(emitTrainerEvent).not.toHaveBeenCalled();
  expect(interaction.followUp).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining("Base Def") }));
});

test.each(["equipment_changed", "equipment_uncertain"])("%s rejection never advances the snapshot or rebuilds/replays", async code => {
  mockUpgrade.mockResolvedValue({ err: "Refresh before trying again.", code, status: code === "equipment_changed" ? 409 : 503 });
  expect(await equipmentUpgrade(interaction, { stateId: "state" })).toEqual({ err: "Refresh before trying again." });
  expect(state.expectedEquipment).toEqual(piece);
  expect(mockBuild).not.toHaveBeenCalled();
  expect(mockUpgrade).toHaveBeenCalledTimes(1);
});

test("quest warning is shown with the confirmed result and never invokes the operation again", async () => {
  mockUpgrade.mockResolvedValue({ ...await mockUpgrade(), warning: "Equipment saved, but quest progress could not be confirmed." });
  mockUpgrade.mockClear();
  await equipmentUpgrade(interaction, { stateId: "state" });
  expect(interaction.followUp).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining("quest progress") }));
  expect(mockUpgrade).toHaveBeenCalledTimes(1);
});

test.each(["error", "throw"])("post-save preview %s keeps success distinct from mutation failure", async failure => {
  if (failure === "error") mockBuild.mockResolvedValue({ err: "Could not load Pokemon." });
  else mockBuild.mockRejectedValue(new Error("read unavailable"));
  expect(await equipmentUpgrade(interaction, { stateId: "state" })).toBeUndefined();
  expect(mockUpgrade).toHaveBeenCalledTimes(1);
  expect(state.expectedEquipment.level).toBe(5);
  expect(interaction.update).toHaveBeenCalledWith({ components: [] });
  expect(interaction.followUp).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining("Refresh") }));
});
