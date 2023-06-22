const { pokemonConfig } = require("../../config/pokemonConfig");
const { buildPokemonInfoSend } = require("../../services/pokemon");

const pokemonActionButton = async (interaction, data) => {
    const action = data.action;

    const { send, err } = await buildPokemonInfoSend({
        user: interaction.user,
        pokemonId: data.id,
        action: action
    })
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = pokemonActionButton;