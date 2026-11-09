jest.resetModules();
jest.mock("../../services/state", () => ({ getState: jest.fn() }));
jest.mock("../../services/pokemonNature", () => ({ changePokemonNature: jest.fn() }));
jest.mock("../../services/trainer", () => ({ getTrainer: jest.fn(), updateTrainer: jest.fn() }));
const { getState } = require("../../services/state");
const { changePokemonNature } = require("../../services/pokemonNature");
const trainer = require("../../services/trainer");
const natureConfirm = require("../natureConfirm");

const mockGetState = jest.mocked(getState);
const mockChangeNature = /** @type {jest.Mock} */ (changePokemonNature);
const interaction = { user: { id: "owner" }, update: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  mockGetState.mockReturnValue({ userId: "owner", pokemonId: "pokemon", natureId: "3", expectedNatureId: 0 });
  mockChangeNature.mockResolvedValue({ data: { changed: true, trainer: {}, pokemon: { name: "Pikachu", natureId: "3" } } });
});

test("expired or foreign state never reaches domain writes or rewards", async () => {
  mockGetState.mockReturnValueOnce(null);
  expect(await natureConfirm(interaction, { stateId: "state" })).toEqual({ err: "This interaction has expired." });
  expect(interaction.update).toHaveBeenCalledWith({ components: [] });
  mockGetState.mockReturnValueOnce({ userId: "other" });
  expect(await natureConfirm(interaction, { stateId: "state" })).toEqual({ err: "This interaction was not initiated by you." });
  expect(changePokemonNature).not.toHaveBeenCalled();
  expect(trainer.updateTrainer).not.toHaveBeenCalled();
});

test("confirmation invokes the shared nature domain operation once with the observed original ID", async () => {
  await natureConfirm(interaction, { stateId: "state" });
  expect(changePokemonNature).toHaveBeenCalledTimes(1);
  expect(changePokemonNature).toHaveBeenCalledWith(interaction.user, "pokemon", "3", 0);
  expect(interaction.update).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining("Changed Pikachu's nature to Adamant for 1"), components: [] }));
  expect(trainer.getTrainer).not.toHaveBeenCalled();
  expect(trainer.updateTrainer).not.toHaveBeenCalled();
});

test("domain rejection remains a top-level error for the existing non-grant handler path", async () => {
  mockChangeNature.mockResolvedValue({ err: "Refresh first.", code: "configuration_uncertain", status: 503 });
  expect(await natureConfirm(interaction, { stateId: "state" })).toEqual({ err: "Refresh first." });
  expect(interaction.update).not.toHaveBeenCalled();
});

test("a current-nature noop retains the old Discord rejection copy without claiming a Mint cost", async () => {
  mockChangeNature.mockResolvedValue({ data: { changed: false, trainer: {}, pokemon: { name: "Pikachu" } } });
  expect(await natureConfirm(interaction, { stateId: "state" })).toEqual({ err: "This pokemon already has this nature." });
  expect(interaction.update).not.toHaveBeenCalled();
});
