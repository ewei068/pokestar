const { getTrainer } = require ('../../services/trainer') ;
const { usePokeball } = require ('../../services/gacha') ;
const { buildNewPokemonEmbed } = require('../../embeds/pokemonEmbeds');

const gacha = async (user, pokeball) => {
    // map input pokeball to pokeball item
    if (pokeball === "pokeball") {
        pokeball = "0"
    } else if (pokeball === "greatball") {
        pokeball = "1"
    } else if (pokeball === "ultraball") {
        pokeball = "2"
    } else if (pokeball === "masterball") {
        pokeball = "3"
    }

    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }

    // use pokeball
    const gacha = await usePokeball(trainer.data, pokeball);
    if (gacha.err) {
        return { embed: null, err: gacha.err };
    }

    embed = buildNewPokemonEmbed(gacha.data.pokemon, gacha.data.speciesData);
    const send = {
        content: `${gacha.data.id}`,
        embeds: [embed]
    }
    return { send: send, err: null };
}

const gachaMessageCommand = async (message) => {
    const pokeball = message.content.split(" ")[1];
    const { send, err } = await gacha(message.author, pokeball);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    }
    else {
        await message.channel.send(send);
    }
}

const gachaSlashCommand = async (interaction) => {
    const pokeball = interaction.options.getString('pokeball');
    const { send, err } = await gacha(interaction.user, pokeball);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    }
    else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: gachaMessageCommand,
    slash: gachaSlashCommand
};



