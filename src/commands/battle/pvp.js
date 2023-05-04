const { getTrainerInfo } = require('../../services/trainer');
const { validateParty } = require('../../services/party');
const { Battle } = require('../../services/battle');
const { setState } = require('../../services/state');
const { buildButtonActionRow } = require('../../components/buttonActionRow');
const { buildTrainerEmbed } = require('../../embeds/trainerEmbeds');
const { eventNames } = require('../../config/eventConfig');
const { getUserId } = require('../../utils/utils');

const pvp = async (user, opponentUserId) => {
    // if opponent user ID equals user ID, return error
    if (opponentUserId === user.id) {
        return { send: null, err: "You can't challenge yourself!" };
    }

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
        opponentUserId: opponentUserId
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
            data: rowData
        }],
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
    const args = message.content.split(' ');
    const opponentUserId = getUserId(args[1]) || null;

    const { send, err } = await pvp(message.author, opponentUserId);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const pvpSlashCommand = async (interaction) => {
    const opponentUserId = interaction.options.getUser('opponent') ? interaction.options.getUser('opponent').id : null;
    
    const { send, err } = await pvp(interaction.user, opponentUserId);
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