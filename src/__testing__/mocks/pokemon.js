const { v4: uuidv4 } = require("uuid");
const { pokemonConfig } = require("../../config/pokemonConfig");
const { pokemonIdEnum } = require("../../enums/pokemonEnums");

const createMockPokemon = ({
  speciesId = pokemonIdEnum.BULBASAUR,
  level = 50,
  userId = null,
  moveIds = null,
  abilityId = null,
  heldItemId = null,
  position = null,
} = {}) => {
  const speciesData = pokemonConfig[speciesId];
  if (!speciesData) {
    throw new Error(`Invalid species ID: ${speciesId}`);
  }

  const pokemonMoveIds = moveIds ||
    speciesData.moveIds?.slice(0, 4) || ["m1", "m1", "m1", "m1"];
  const pokemonAbilityId =
    abilityId || Object.keys(speciesData.abilities || {})[0] || "1";

  return {
    _id: uuidv4(),
    speciesId,
    userId: userId || uuidv4(),
    name: speciesData.name,
    level,
    exp: 0,
    ivs: [31, 31, 31, 31, 31, 31],
    evs: [0, 0, 0, 0, 0, 0],
    natureId: "1",
    moveIds: pokemonMoveIds,
    abilityId: pokemonAbilityId,
    heldItemId,
    equipments: {},
    shiny: false,
    locked: false,
    battleEligible: true,
    position,
  };
};

const createMockPokemonParty = ({
  size = 2,
  rows = 3,
  cols = 4,
  speciesIds = null,
  userId = null,
} = {}) => {
  const partyUserId = userId || uuidv4();
  const defaultSpecies = [
    pokemonIdEnum.BULBASAUR,
    pokemonIdEnum.CHARMANDER,
    pokemonIdEnum.SQUIRTLE,
    pokemonIdEnum.PIKACHU,
    pokemonIdEnum.EEVEE,
    pokemonIdEnum.JIGGLYPUFF,
  ];

  const pokemons = Array(rows * cols).fill(null);
  for (let i = 0; i < Math.min(size, rows * cols); i += 1) {
    const speciesId =
      speciesIds?.[i] || defaultSpecies[i % defaultSpecies.length];
    pokemons[i] = createMockPokemon({
      speciesId,
      userId: partyUserId,
      position: i + 1,
    });
  }

  return {
    pokemons,
    rows,
    cols,
  };
};

module.exports = {
  createMockPokemon,
  createMockPokemonParty,
};
