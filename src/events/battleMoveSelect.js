const { buildSelectBattleTargetRow } = require("../components/selectBattleTargetRow");
const { moveConfig } = require("../config/battleConfig");
const { getState } = require("../services/state");

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

    // set placeholder of last component to move name
    // pop move select menu
    const moveSelectMenu = interaction.message.components.pop();
    moveSelectMenu.components[0].data.placeholder = moveConfig[moveId].name;

    // update message
    await interaction.update({
        components: interaction.message.components.concat(moveSelectMenu).concat(targetSelectMenu)
    });
}

module.exports = battleMoveSelect;
