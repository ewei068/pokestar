const { v4: uuidv4 } = require("uuid");
const { createMockPokemonParty } = require("./pokemon");

const createMockTrainer = ({
  username = "TestTrainer",
  party = null,
  isNpc = false,
} = {}) => {
  const trainerUserId = uuidv4();

  const trainerParty =
    party || createMockPokemonParty({ userId: trainerUserId });
  for (const pokemon of trainerParty.pokemons) {
    if (pokemon) {
      pokemon.userId = trainerUserId;
    }
  }

  return {
    trainer: {
      userId: trainerUserId,
      user: {
        id: trainerUserId,
        username,
        discriminator: "0",
      },
      isNpc,
    },
    party: trainerParty,
  };
};

module.exports = {
  createMockTrainer,
};
