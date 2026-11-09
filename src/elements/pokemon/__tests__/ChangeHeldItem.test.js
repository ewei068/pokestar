jest.resetModules();
jest.mock("../../../services/pokemon", () => ({ changeHeldItem: jest.fn(), removeHeldItem: jest.fn() }));
jest.mock("../../../hooks/useTrainer", () => jest.fn());
jest.mock("../../../hooks/usePokemon", () => jest.fn());
jest.mock("../../../embeds/pokemonEmbeds", () => ({ buildPokemonEmbed: jest.fn() }));
jest.mock("../../../deact/deact", () => ({
  useState: jest.fn(), useCallback: (callback) => callback,
  useCallbackBinding: jest.fn(), createElement: (element, props) => ({ element, props }),
}));
const deact = require("../../../deact/deact");
const useTrainer = require("../../../hooks/useTrainer");
const usePokemon = require("../../../hooks/usePokemon");
const { changeHeldItem, removeHeldItem } = require("../../../services/pokemon");
const { backpackItems } = require("../../../config/backpackConfig");
const ChangeHeldItem = require("../ChangeHeldItem");

const mockUseTrainer = /** @type {jest.Mock} */ (useTrainer);
const mockUsePokemon = /** @type {jest.Mock} */ (usePokemon);
const mockUseState = jest.mocked(deact.useState);
const mockBindCallback = jest.mocked(deact.useCallbackBinding);
const mockChangeHeldItem = /** @type {jest.Mock} */ (changeHeldItem);
const mockRemoveHeldItem = /** @type {jest.Mock} */ (removeHeldItem);
const ref = /** @type {DeactElement} */ ({});
let callbacks;
let trainerHook;
let pokemonHook;
let setContent;
const user = { id: "owner", username: "Owner", discriminator: "0", avatar: "" };

beforeEach(() => {
  jest.clearAllMocks();
  callbacks = [];
  setContent = jest.fn();
  trainerHook = { trainer: { backpack: {} }, setTrainer: jest.fn(), refreshTrainer: jest.fn() };
  pokemonHook = { pokemon: { _id: "pokemon", name: "Pikachu", speciesId: "25", heldItemId: backpackItems.LEFTOVERS }, setPokemon: jest.fn(), refreshPokemon: jest.fn() };
  mockUseTrainer.mockResolvedValue(trainerHook);
  mockUsePokemon.mockResolvedValue(pokemonHook);
  mockUseState.mockReturnValueOnce([true, jest.fn()]).mockReturnValueOnce([null, setContent]);
  mockBindCallback.mockImplementation((callback) => { callbacks.push(callback); return `callback-${callbacks.length}`; });
});

test.each(["select", "remove"])("%s rejection refreshes both reads and renders the error without a destructuring crash", async (kind) => {
  mockChangeHeldItem.mockResolvedValue({ err: "Refresh first." });
  mockRemoveHeldItem.mockResolvedValue({ err: "Refresh first." });
  const result = await ChangeHeldItem(ref, { user, pokemonId: "pokemon" });
  if (kind === "select") await result.elements[0].props.onItemSelected(backpackItems.CHOICE_BAND);
  else await callbacks[2]();
  expect(trainerHook.refreshTrainer).toHaveBeenCalledTimes(1);
  expect(pokemonHook.refreshPokemon).toHaveBeenCalledTimes(1);
  expect(setContent).toHaveBeenCalledWith("Refresh first.");
  if (kind === "select") expect(changeHeldItem).toHaveBeenCalledWith(user, "pokemon", backpackItems.CHOICE_BAND, backpackItems.LEFTOVERS);
  else expect(removeHeldItem).toHaveBeenCalledWith(user, "pokemon", backpackItems.LEFTOVERS);
});

test("success still applies local trainer/Pokemon state and navigation stays a render callback", async () => {
  const data = { trainer: { backpack: {} }, pokemon: { ...pokemonHook.pokemon, heldItemId: backpackItems.CHOICE_BAND }, changed: true };
  mockChangeHeldItem.mockResolvedValue({ data });
  const result = await ChangeHeldItem(ref, { user, pokemonId: "pokemon" });
  await result.elements[0].props.onItemSelected(backpackItems.CHOICE_BAND);
  expect(trainerHook.setTrainer).toHaveBeenCalledWith(data.trainer);
  expect(pokemonHook.setPokemon).toHaveBeenCalledWith(data.pokemon);
  expect(callbacks[0]()).toBeUndefined();
  expect(callbacks[1]()).toBeUndefined();
  expect(trainerHook.refreshTrainer).not.toHaveBeenCalled();
});
