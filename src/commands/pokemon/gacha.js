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
    return { embed: embed, err: null };
}

const gachaMessageCommand = async (message) => {
    const pokeball = message.content.split(" ")[1];
    const { embed, err } = await gacha(message.author, pokeball);
    if (err) {
        await message.channel.send(`${err}`);
    }
    else {
        // await message.channel.send(`${embed}`);
        await message.channel.send({ embeds: [embed] });
    }
}

const gachaSlashCommand = async (interaction) => {
    const pokeball = interaction.options.getString('pokeball');
    const { embed, err } = await gacha(interaction.user, pokeball);
    if (err) {
        await interaction.reply(`${err}`);
    }
    else {
        // await interaction.reply(`${embed}`);
        await interaction.reply({ embeds: [embed] });
    }
}

module.exports = {
    message: gachaMessageCommand,
    slash: gachaSlashCommand
};



