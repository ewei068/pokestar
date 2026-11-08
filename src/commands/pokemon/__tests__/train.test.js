const { slash, message } = require("../train");
const { trainOwnedPokemon } = require("../../../services/training");
const { createMockPokemon } = require("../../../__testing__/mocks/pokemon");

jest.mock("../../../services/training", () => ({ trainOwnedPokemon: jest.fn() }));
const mockTrain = /** @type {jest.Mock} */ (trainOwnedPokemon);
const user = { id: "owner" };
beforeEach(() => {
  jest.clearAllMocks();
  mockTrain.mockResolvedValue({ pokemon: createMockPokemon({ level: 51 }), previousLevel: 50, trained: true,
    gains: { exp: 35, evs: [0, 0, 0, 0, 0, 0] } });
});

test("slash defaults to Home, preserves level-up text and leaves participation to handler", async () => {
  const interaction = { user, options: { getString: (key) => key === "pokemonid" ? "pokemon-id" : null }, reply: jest.fn() };
  await slash(interaction);
  expect(mockTrain).toHaveBeenCalledWith(user, "pokemon-id", "0", { stopWhenComplete: false, refreshIdentity: true });
  expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining("35 exp"));
  expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining("leveled up to **level 51**"));
  expect(mockTrain).toHaveBeenCalledTimes(1);
});

test("message default and explicit Berry location preserve signed EV result", async () => {
  const send = jest.fn();
  await message({ author: user, content: "!train pokemon-id", channel: { send } });
  expect(mockTrain).toHaveBeenLastCalledWith(user, "pokemon-id", "0", expect.any(Object));
  mockTrain.mockResolvedValue({ pokemon: createMockPokemon({ level: 100 }), previousLevel: 100, trained: true,
    gains: { exp: 140, evs: [-2, 0, 0, 0, 0, 0] } });
  await message({ author: user, content: "!train pokemon-id berryFarm", channel: { send } });
  expect(mockTrain).toHaveBeenLastCalledWith(user, "pokemon-id", "8", expect.any(Object));
  expect(send).toHaveBeenLastCalledWith(expect.stringContaining("-2 HP"));
  expect(send.mock.calls[1][0]).not.toContain("leveled up");
});

test("rejections return the command error and saved warnings remain visible", async () => {
  const send = jest.fn();
  mockTrain.mockRejectedValue(new Error("Pokemon not owned by you."));
  await expect(message({ author: user, content: "!train pokemon-id gym", channel: { send } })).resolves.toEqual({ err: "Pokemon not owned by you." });
  expect(send).toHaveBeenLastCalledWith("Pokemon not owned by you.");
  mockTrain.mockResolvedValue({ pokemon: createMockPokemon(), previousLevel: 50, trained: true,
    gains: { exp: 35, evs: [0, 0, 0, 0, 0, 0] }, warning: "Training saved, but quest progress could not be confirmed." });
  await message({ author: user, content: "!train pokemon-id", channel: { send } });
  expect(send).toHaveBeenLastCalledWith(expect.stringContaining("Training saved"));
});
