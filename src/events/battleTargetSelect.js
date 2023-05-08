const { getState } = require("../services/state");
const { getStartTurnSend } = require("../services/battle");
const { logger } = require("../log");

const battleTargetSelect = async (interaction, data) => {
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

    // make sure it's the player's turn
    if (battle.activePokemon.userId !== interaction.user.id) {
        return { err: "It's not your turn." };
    }

    // TEMP: measure execution time
    const start = Date.now();
    // if skip turn, skip turn
    if (data.skipTurn) {
        const result = battle.activePokemon.skipTurn();
    } else {
        // get move ID from data
        const moveId = data.moveId;
        if (!moveId) {
            return { err: "No move selected." };
        }

        // get target ID from interaction
        const targetId = interaction.values[0];
        if (!targetId) {
            return { err: "No target selected." };
        }

        // use move on target
        // TODO: do something with result?
        const result = battle.activePokemon.useMove(moveId, targetId);
    }
    const send = await getStartTurnSend(battle, data.stateId);
    const end = Date.now();
    logger.info(`Execution time: ${end - start} ms`);

    await interaction.update(send);
}

module.exports = battleTargetSelect;