const { buildPokemonInfoSend } = require("../../services/pokemon");

const pokemonActionButton = async (interaction, data) => {
  const { action } = data;

  const { send, err } = await buildPokemonInfoSend({
    user: interaction.user,
    pokemonId: data.id,
    action,
  });
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = pokemonActionButton;
