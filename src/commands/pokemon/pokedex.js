const { buildPokedexSend } = require("../../services/pokemon")

const pokedex = async (id) => {
    return await buildPokedexSend({
        id: id
    });
}

const pokedexMessageCommand = async (interaction) => {
    const args = interaction.content.split(' ');
    const id = args[1] || "1";
    const { send, err } = await pokedex(id);
    if (err) {
        await interaction.channel.send(`${err}`);
        return { err: err };
    } else {
        await interaction.channel.send(send);
    }
}

const pokedexSlashCommand = async (interaction) => {
    const id = interaction.options.getString('species') || "1";
    const { send, err } = await pokedex(id);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: pokedexMessageCommand,
    slash: pokedexSlashCommand
};