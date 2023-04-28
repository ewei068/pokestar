const { getTrainerInfo } = require('../../services/trainer');
const { validateParty } = require('../../services/party');
const { Battle } = require('../../services/battle');
const { setState } = require('../../services/state');
const { buildButtonActionRow } = require('../../components/buttonActionRow');
const { buildTrainerEmbed } = require('../../embeds/trainerEmbeds');
const { eventNames } = require('../../config/eventConfig');

const pvp = async (user) => {
    // get trainer
    const trainer = await getTrainerInfo(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }

    // validate party
    const validate = await validateParty(trainer.data);
    if (validate.err) {
        return { send: null, err: validate.err };
    }

    // create battle
    const battle = new Battle();
    battle.addTeam("Team1", false);
    battle.addTrainer(trainer.data, validate.data, "Team1");

    // get trainer embed
    const embed = buildTrainerEmbed(trainer.data);
    
    // create state
    const state = {
        battle: battle,
        userId: user.id,
    }
    const stateId = setState(state, 300);

    // get accept challenge button
    const rowData = {
        stateId: stateId
    }
    const confirmButtonRow = buildButtonActionRow(
        [{
            label: 'Accept Challenge!',
            disabled: false,
        }],
        rowData,
        eventNames.PVP_ACCEPT
    )

    const send = {
        // TODO: mentions
        content: `You have been challenged to a battle by ${user.username}!`,
        embeds: [embed],
        components: [confirmButtonRow]
    }

    return { send: send, err: null };
}

const pvpMessageCommand = async (message) => {
    const { send, err } = await pvp(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const pvpSlashCommand = async (interaction) => {
    const { send, err } = await pvp(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: pvpMessageCommand,
    slash: pvpSlashCommand
};