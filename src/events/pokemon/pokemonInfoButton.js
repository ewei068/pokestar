const { pokemonConfig } = require("../../config/pokemonConfig");
const { buildPokemonInfoSend } = require("../../services/pokemon");

const pokemonInfoButton = async (interaction, data) => {
    const tab = data.tab;

    const { send, err } = await buildPokemonInfoSend({
        user: interaction.user,
        pokemonId: data.id,
        tab: tab
    })
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = pokemonInfoButton;