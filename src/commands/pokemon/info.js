const { getTrainer } = require('../../services/trainer');
const { getPokemon } = require('../../services/pokemon');
const { buildPokemonEmbed } = require('../../embeds/pokemonEmbeds');

const info = async (user, pokemonId) => {
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }
    const pokemon = await getPokemon(trainer.data, pokemonId);
    if (pokemon.err) {
        return { embed: null, err: pokemon.err };
    }

    const embed = buildPokemonEmbed(trainer.data, pokemon.data);

    const send = {
        content: `${pokemon.data._id}`,
        embeds: [embed]
    }
    return { send: send, err: null };
}

const infoMessageCommand = async (message) => {
    const pokemonId = message.content.split(' ')[1];
    const { send, err } = await info(message.author, pokemonId);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const infoSlashCommand = async (interaction) => {
    const pokemonId = interaction.options.getString('pokemonid');
    const { send, err } = await info(interaction.user, pokemonId);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: infoMessageCommand,
    slash: infoSlashCommand
};