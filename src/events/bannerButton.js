const { buildBannerSend } = require("../services/gacha");
const { getState } = require("../services/state");
const { buildGachaInfoString } = require("../embeds/pokemonEmbeds");

const bannerButton = async (interaction, data) => {
    // get state
    const state = getState(data.stateId);
    if (!state) {
        await interaction.update({ 
            components: [] 
        });
        return { err: "This interaction has expired." };
    }

    // if data has userId component, verify interaction was done by that user
    if (state.userId && interaction.user.id !== state.userId) {
        return { err: "This interaction was not initiated by you." };
    }

    const pokeballId = data.pokeballId;
    // if pokeball selected, set pokeballId
    if (pokeballId !== undefined) {
        state.pokeballId = pokeballId;
        const { send, err } = await buildBannerSend({
            stateId: data.stateId,
            user: interaction.user,
        });
        if (err) {
            return { err: err };
        }
        await interaction.update(send);
    } else {
        // else, info selected and display info
        const infoString = buildGachaInfoString();
        await interaction.reply({
            content: infoString,
            ephemeral: true
        });
    }
}

module.exports = bannerButton;