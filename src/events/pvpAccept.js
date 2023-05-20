const { getStartTurnSend } = require("../services/battle");
const { validateParty } = require("../services/party");
const { getState } = require("../services/state");
const { getTrainer } = require("../services/trainer");

const pvpAccept = async (interaction, data) => {
    // get state
    const state = getState(data.stateId);
    if (!state) {
        await interaction.update({ 
            components: [] 
        });
        return { err: "This interaction has expired." };
    }

    // if state.opponentUserId does not match interaction.user.id, return error
    if (state.opponentUserId && state.opponentUserId != interaction.user.id) {
        return { err: "You can't accept this battle!" };
    }

    // if data has userId component, verify interaction was NOT done by that user
    if (state.userId && interaction.user.id == state.userId) {
        return { err: "You can't accept your own battle!" };
    }

    // get trainer
    const trainer = await getTrainer(interaction.user);
    if (trainer.err) {
        return { err: trainer.err };
    }

    // validate party
    const validate = await validateParty(trainer.data);
    if (validate.err) {
        return { err: validate.err };
    }

    // add trainer to battle
    const battle = state.battle;
    if (!battle) {
        return { err: "No battle data." };
    }
    
    if (!battle.hasStarted) {
        battle.addTeam("Team2", false);
        battle.addTrainer(trainer.data, validate.data, "Team2");

        // start battle
        battle.start();
    }

    await interaction.update(await getStartTurnSend(battle, data.stateId));
}

module.exports = pvpAccept;