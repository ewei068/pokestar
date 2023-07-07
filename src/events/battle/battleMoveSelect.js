/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * battleMoveSelect.js Gets the relevant information from the user interaction and sets up for target selection.
*/
const { buildSelectBattleMoveRow } = require("../../components/selectBattleMoveRow");
const { buildSelectBattleTargetRow } = require("../../components/selectBattleTargetRow");
const { moveConfig } = require("../../config/battleConfig");
const { getState } = require("../../services/state");

/**
 * Gets the relevant information from the user interaction and sets up for target selection.
 * @param {*} interaction the interaction from the trainer, move selected.
 * @param {*} data used to get the state. data from the interaction.
 * @returns 
 */
const battleMoveSelect = async (interaction, data) => {
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

    // get move
    const moveId = interaction.values[0];

    // validate move: make sure move is in pokemon's moveset
    if (pokemon.moveIds[moveId] === undefined) {
        return { err: "Invalid move." };
    }
    // validate cooldown
    if (pokemon.moveIds[moveId].cooldown > 0) {
        return { err: "Move is on cooldown." };
    }
    // validate disabled
    if (pokemon.moveIds[moveId].disabled) {
        return { err: "Move is disabled." };
    }

    // find valid targets for move
    const targets = battle.getEligibleTargets(pokemon, moveId);

    // if no targets, return error
    if (targets.length === 0) {
        return { err: "No eligible targets! Choose another move." };
    }

    // build selection menu of eligible targets
    const targetSelectMenu = buildSelectBattleTargetRow(battle, targets, moveId, data.stateId);

    // TODO: change when we have more than one component
    // if components length > 2, remove last component
    if (interaction.message.components.length > 2) {
        interaction.message.components.pop();
    }

    // pop move select menu and set default move
    interaction.message.components.pop();
    const moveSelectMenu = buildSelectBattleMoveRow(battle, data.stateId, moveId);

    // update message
    await interaction.update({
        components: interaction.message.components.concat(moveSelectMenu).concat(targetSelectMenu)
    });
}

module.exports = battleMoveSelect;
