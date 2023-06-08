const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { eventNames } = require("../config/eventConfig");
const { moveConfig } = require("../config/battleConfig");
const { getFullUsername } = require("../utils/trainerUtils");

const buildSelectBattleTargetRow = (battle, eligibleTargets, moveId, stateId) => {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(JSON.stringify({
            eventName: eventNames.BATTLE_TARGET_SELECT,
            stateId: stateId,
            moveId: moveId,
        }))
        .setPlaceholder("Select a target")
        .addOptions(eligibleTargets.map(target => {
            const user = battle.users[target.userId];

            return {
                label: `[${getFullUsername(user)}] [${target.position}] ${target.name}`,
                value: `${target.id}`,
            }
        }));

    const actionRow = new ActionRowBuilder()
        .addComponents(selectMenu);

    return actionRow;
}

module.exports = {
    buildSelectBattleTargetRow
};