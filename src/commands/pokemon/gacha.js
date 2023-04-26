const { getTrainer } = require ('../../services/trainer') ;
const { usePokeball } = require ('../../services/gacha') ;
const { buildNewPokemonEmbed } = require('../../embeds/pokemonEmbeds');
const { backpackItems } = require('../../config/backpackConfig');

/**
 * Attempts to use a pokeball to spin the gacha for a random pokemon.
 * @param {Object} user User who initiated the command.
 * @param {String} pokeball Pokeball to use.
 * @returns An embed with the new pokemon, or an error message.
 */
const gacha = async (user, pokeball) => {
    // map input pokeball to pokeball item
    const map = { 
        "pokeball": backpackItems.POKEBALL,
        "greatball": backpackItems.GREATBALL,
        "ultraball": backpackItems.ULTRABALL,
        "masterball": backpackItems.MASTERBALL
    }
    const pokeballId = map[pokeball];

    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }

    // use pokeball
    const gacha = await usePokeball(trainer.data, pokeballId);
    if (gacha.err) {
        return { embed: null, err: gacha.err };
    }

    // build Pokemon embed
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



