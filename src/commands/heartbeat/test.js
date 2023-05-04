const { EmbedBuilder } = require("discord.js");
const { buildYesNoActionRow } = require("../../components/yesNoActionRow");
const { setState } = require("../../services/state");

const test = async (channel, interaction=false) => {
    /* const sendResult = await channel.send("test1");
    console.log(sendResult);
    const state = {
        extra: sendResult
    };
    const stateId = setState(state, ttl=150);
    const data = {
        stateId: stateId,
    }
    const components = buildYesNoActionRow(data, "test", false); */

    const embed1 = new EmbedBuilder();
    embed1.setTitle("test1");

    const embed2 = new EmbedBuilder();
    embed2.setTitle("test2");

    const send = {
        content: "test",
        embeds: [embed1, embed2],
        // components: [components]
    }

    return send;
}

const testMessageCommand = async (message) => {
    const send = await test(message.channel);
    console.log(message)
    await message.channel.send(send);
}

const testSlashCommand = async (interaction) => {
    const send = await test(interaction.channel, true);
    const arg1 = interaction.options.getString('arg1');
    console.log(arg1);
    await interaction.reply(send);
}

module.exports = {
    message: testMessageCommand,
    slash: testSlashCommand
};

