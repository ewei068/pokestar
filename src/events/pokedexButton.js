const { pokemonConfig } = require("../config/pokemonConfig");
const { buildPokedexSend } = require("../services/pokemon");

const pokedexButton = async (interaction, data) => {
    const allIds = Object.keys(pokemonConfig);

    // attempt to get page number
    const page = data.page;
    if (!page || page < 1 || page > allIds.length) {
        return { err: `Couldn't find page!` };
    }
    const id = allIds[page - 1];

    const tab = data.tab;

    const { send, err } = await buildPokedexSend({
        id: id,
        tab: tab
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = pokedexButton;