/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * pokedexButton.js via the user's interaction calls the creation of the pokedex.
 */
const { buildPokedexSend } = require("../../services/pokemon");
const { getPokemonOrder } = require("../../utils/pokemonUtils");

const pokedexButton = async (interaction, data) => {
  const allIds = getPokemonOrder();

  // attempt to get page number
  let id = "1";
  if (data.page) {
    const { page } = data;
    if (!page || page < 1 || page > allIds.length) {
      return { err: `Couldn't find page!` };
    }
    id = allIds[page - 1];
  } else if (interaction.values) {
    [id] = interaction.values;
  }

  const { tab } = data;

  const { send, err } = await buildPokedexSend({
    id,
    tab,
    view: "species",
  });
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = pokedexButton;
