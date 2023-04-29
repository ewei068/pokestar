const { getState } = require("../services/state");
const { buildBattleInfoActionRow } = require("../components/battleInfoActionRow");
const { buildBattleMovesetEmbed, buildBattleTeamEmbed } = require("../embeds/battleEmbeds");

const battleInfo = async (interaction, data) => {
    // get state
    const state = getState(data.stateId);
    if (!state) {
        await interaction.update({ 
            components: [] 
        });
        return { err: "This interaction has expired." };
    }

    // get battle
    const battle = state.battle;
    if (!battle) {
        return { err: "No battle data." };
    }
    const pokemon = battle.activePokemon;

    // make sure it's the player's turn
    if (battle.activePokemon.userId !== interaction.user.id) {
        return { err: "It's not your turn." };
    }

    // if data has teamId component, display pokemon on that team
    if (data.teamName) {
        // get team pokemon embed
        const teamPokemonEmbed = buildBattleTeamEmbed(battle, data.teamName);
        interaction.message.embeds[1] = teamPokemonEmbed;

        // rebuild component
        const infoRow = buildBattleInfoActionRow(battle, data.stateId, data.teamName);
        interaction.message.components[0] = infoRow;

        await interaction.update({ 
            embeds: interaction.message.embeds,
            components: interaction.message.components,
        });
        return;
    } else {
        // else, display move data
        const moveEmbed = buildBattleMovesetEmbed(pokemon);
        interaction.message.embeds[1] = moveEmbed;

        // rebuild component
        const infoRow = buildBattleInfoActionRow(battle, data.stateId, data.teamName);
        interaction.message.components[0] = infoRow;

        await interaction.update({
            embeds: interaction.message.embeds,
            components: interaction.message.components,
        });
    }
}

module.exports = battleInfo;