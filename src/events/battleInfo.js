const { getState } = require("../services/state");
const { buildBattleInfoActionRow } = require("../components/battleInfoActionRow");
const { buildBattleMovesetEmbed, buildBattleTeamEmbed } = require("../embeds/battleEmbeds");
const { stageNames } = require("../config/stageConfig");
const { logger } = require("../log");

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
 
    const selectionIndex = data.selectionIndex;
    if (selectionIndex === undefined) {
        return { err: "No button selected." };
    }

    const numTeams = Object.keys(battle.teams).length;

    // if data has teamId component, display pokemon on that team
    if (selectionIndex < numTeams) {
        const teamName = Object.keys(battle.teams)[selectionIndex];
        // if no team name, return
        if (!teamName) {
            return { err: "No team found." };
        }
        
        // get team pokemon embed
        const teamPokemonEmbed = buildBattleTeamEmbed(battle, teamName);
        interaction.message.embeds[1] = teamPokemonEmbed;
    } else if (selectionIndex === numTeams) {
        // else, display move data
        const moveEmbed = buildBattleMovesetEmbed(pokemon);
        interaction.message.embeds[1] = moveEmbed;
    } else if (selectionIndex === numTeams + 1) {
        // hide info embed
        interaction.message.embeds = [interaction.message.embeds[0]];
    } else if (selectionIndex === numTeams + 2 && process.env.STAGE === stageNames.ALPHA) {
        // in alpha, show debug
        logger.info(battle)
        await interaction.reply({ content: "Debug info sent to console.", ephemeral: true });
        return;
    } else {
        return { err: "Invalid selection." };
    }

    // rebuild component
    const infoRow = buildBattleInfoActionRow(battle, data.stateId, selectionIndex);
    interaction.message.components[0] = infoRow;

    await interaction.update({ 
        embeds: interaction.message.embeds,
        components: interaction.message.components,
    });
}

module.exports = battleInfo;