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
    return { embed: embed, err: null };
}

const infoMessageCommand = async (message) => {
    const pokemonId = message.content.split(' ')[1];
    const { embed, err } = await info(message.author, pokemonId);
    if (err) {
        await message.channel.send(`${err}`);
    } else {
        await message.channel.send({ embeds: [embed] });
    }
}

const infoSlashCommand = async (interaction) => {
    const pokemonId = interaction.options.getString('pokemonid');
    const { embed, err } = await info(interaction.user, pokemonId);
    if (err) {
        await interaction.reply(`${err}`);
    } else {
        await interaction.reply({ embeds: [embed] });
    }
}

module.exports = {
    message: infoMessageCommand,
    slash: infoSlashCommand
};