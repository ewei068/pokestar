/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * equipmentUpgrade.js Builds the upgrade menu for the selected equipment and waits for interactions.
*/
const { getState } = require("../services/state");
const { buildEquipmentUpgradeSend, buildEquipmentSend, upgradeEquipmentLevel, getPokemon, rerollStatSlot } = require("../services/pokemon");
const { getTrainer } = require("../services/trainer");

const equipmentUpgrade = async (interaction, data) => {
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

    const button = state.button;
    if (button !== "upgrade" && button !== "slot") {
        return { err: "Invalid button." };
    }

    let trainer = await getTrainer(interaction.user);
    if (trainer.err) {
        return { err: trainer.err };
    }
    trainer = trainer.data;

    let pokemon = await getPokemon(trainer, state.pokemonId);
    if (pokemon.err) {
        return { err: pokemon.err };
    }
    pokemon = pokemon.data;

    let followUpString = null
    if (button === "upgrade") {
        const res = await upgradeEquipmentLevel(trainer, pokemon, state.equipmentType);
        if (res.err) {
            return { err: res.err };
        }
        followUpString = res.data;
    } else if (button === "slot") {
        const res = await rerollStatSlot(trainer, pokemon, state.equipmentType, state.slotId);
        if (res.err) {
            return { err: res.err };
        }
        followUpString = res.data;
    }

    const { send, err } = await buildEquipmentUpgradeSend({
        stateId: data.stateId,
        user: interaction.user,
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }

    await interaction.followUp({
        content: followUpString,
        ephemeral: true
    });
}

module.exports = equipmentUpgrade;