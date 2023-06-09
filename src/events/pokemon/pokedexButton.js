const { pokemonConfig } = require("../../config/pokemonConfig");
const { buildPokedexSend } = require("../../services/pokemon");
const { getPokemonOrder } = require("../../utils/pokemonUtils");

const pokedexButton = async (interaction, data) => {
    const allIds = getPokemonOrder();

    // attempt to get page number
    let id = "1";
    if (data.page) {
        const page = data.page;
        if (!page || page < 1 || page > allIds.length) {
            return { err: `Couldn't find page!` };
        }
        id = allIds[page - 1];
    } else if (interaction.values) {
        id = interaction.values[0];
    }

    const tab = data.tab;

    const { send, err } = await buildPokedexSend({
        id: id,
        tab: tab,
        view: "species",
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = pokedexButton;