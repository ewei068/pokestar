const { buildPokemonInfoSend } = require("../../services/pokemon");

const pokemonInfoButton = async (interaction, data) => {
  const { tab } = data;

  const { send, err } = await buildPokemonInfoSend({
    user: interaction.user,
    pokemonId: data.id,
    tab,
  });
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = pokemonInfoButton;
