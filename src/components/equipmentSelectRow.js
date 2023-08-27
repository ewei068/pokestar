/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * equipmentSelectRow.js creates the equipment select row within the ActionRowBuilder. Yea that's about it.
*/
const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { equipmentConfig } = require("../config/equipmentConfig");

/**
 * creates the equipment select row within the ActionRowBuilder. Yea that's about it.
 * @param {*} equipments  the equipment that are selectable.
 * @param {*} data the data necessary for the row?
 * @param {*} eventName the name of the event for the menuId to reference.
 * @returns ActionRowBuilder
 */
const buildEquipmentSelectRow = (equipments, data, eventName, pokemonIds=[]) => {
    const menuId = {
        eventName: eventName,
        ...data,
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`${JSON.stringify(menuId)}`)
        .setPlaceholder('Select an equipment')
        .addOptions(equipments.map((equipment, index) => {
            let pokemonId = equipment.pokemonId;
            if (pokemonIds.length > 0) {
                pokemonId = pokemonIds[index];
            }

            console.log(JSON.stringify({
                pokemonId: pokemonId,
                equipmentType: equipment.equipmentType,
            }))

            const equipmentData = equipmentConfig[equipment.equipmentType]
            return {
                label: `${equipmentData.name} (${pokemonId})`,
                value: JSON.stringify({
                    pokemonId: pokemonId,
                    equipmentType: equipment.equipmentType,
                }),
                emoji: equipmentData.emoji,
            }
        }));

    const actionRow = new ActionRowBuilder()
        .addComponents(selectMenu);

    return actionRow;
}

module.exports = {
    buildEquipmentSelectRow: buildEquipmentSelectRow
};