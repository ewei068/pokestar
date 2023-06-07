const { buildPokedexSend } = require("../../services/pokemon")

const pokedex = async (id) => {
    return await buildPokedexSend({
        id: id,
        view: "species"
    });
}

const pokedexMessageCommand = async (interaction) => {
    const args = interaction.content.split(' ')
    args.shift();
    const id = !args[0] ? "1" : args.join(" ");
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