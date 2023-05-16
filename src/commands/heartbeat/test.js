const { EmbedBuilder } = require("discord.js");
const seedrandom = require("seedrandom");
const { buildYesNoActionRow } = require("../../components/yesNoActionRow");
const { setState } = require("../../services/state");

const test2 = ({arg1 = null, arg2 = null} = {}) => {
    console.log(arg1);
    console.log(arg2);
}

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

    const testArgs = {
        arg1: "test1",
        arg2: "test2"
    }

    test2(testArgs);

    const embed1 = new EmbedBuilder();
    embed1.setTitle("test1");

    const embed2 = new EmbedBuilder();
    embed2.setTitle("test2");

    // seedrandom using date 
    const date = new Date().getDate();
    const rng = seedrandom(date);

    const send = {
        content: `${rng()}`,
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

