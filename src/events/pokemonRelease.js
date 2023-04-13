const { getTrainer } = require("../services/trainer");
const { releasePokemons } = require("../services/pokemon");
const { getState, deleteState } = require("../services/state");

const pokemonRelease = async (interaction, data) => {
    // get state
    const state = getState(data.stateId);
    if (!state) {
        return;
    }

    // if data has userId component, verify interaction was done by that user
    if (state.userId && interaction.user.id !== state.userId) {
        return;
    }
    if (!data.yes) {
        await interaction.update({ content: "Pokemon release cancelled.", embeds: [], components: []});
        deleteState(data.stateId);
        return;
    }

    const trainer = await getTrainer(interaction.user);
    if (trainer.err) {
        return;
    }

    const releaseResult = await releasePokemons(trainer.data, state.pokemonIds);
    if (releaseResult.err) {
        return;
    } 

    await interaction.update({ content: "Pokemon released.", embeds: [], components: [] });
    deleteState(data.stateId);
}

module.exports = pokemonRelease;