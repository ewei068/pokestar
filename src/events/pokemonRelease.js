const { getTrainer } = require("../services/trainer");
const { releasePokemons } = require("../services/pokemon");
const { getState, deleteState } = require("../services/state");

const pokemonRelease = async (interaction, data) => {
    // get state
    const state = getState(data.stateId);
    if (!state) {
        await interaction.update({ 
            content: "This interaction has expired.",
            components: [] 
        });
        return { err: "This interaction has expired." };
    }

    // if data has userId component, verify interaction was done by that user
    if (state.userId && interaction.user.id !== state.userId) {
        return { err: "This interaction was not initiated by you." };
    }
    if (!data.yes) {
        await interaction.update({ 
            content: "Pokemon release cancelled.", 
            components: []
        });
        deleteState(data.stateId);
        return;
    }

    const trainer = await getTrainer(interaction.user);
    if (trainer.err) {
        return { err: trainer.err };
    }

    const releaseResult = await releasePokemons(trainer.data, state.pokemonIds);
    if (releaseResult.err) {
        return { err: releaseResult.err };
    } 

    await interaction.update({ 
        content: "Pokemon released.",  
        components: [] 
    });
    deleteState(data.stateId);
}

module.exports = pokemonRelease;