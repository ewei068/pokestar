const { buildPokedexSend } = require("../../services/pokemon");

const pokedexListButton = async (interaction, data) => {
  // get page number
  const page = data.page || 1;

  const { send, err } = await buildPokedexSend({
    view: "list",
    page,
  });
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = pokedexListButton;
