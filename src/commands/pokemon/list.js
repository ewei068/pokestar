const { listPokemon } = require('../../services/pokemon');
const { getTrainer } = require('../../services/trainer');
const { buildPokemonListEmbed } = require('../../embeds/pokemonEmbeds');
const { buildScrollActionRow } = require('../../components/scrollActionRow');
const { eventNames } = require('../../config/eventConfig');

const list = async (user, page) => {
    if (page < 1) {
        return { embeds: null, err: "Page must be greater than 0." };
    }

    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }

    const pokemons = await listPokemon(trainer.data, page);
    if (pokemons.err) {
        return { embed: null, err: pokemons.err };
    } 

    const embed = buildPokemonListEmbed(trainer.data, pokemons.data, page);
    const actionRow = buildScrollActionRow(page, pokemons.lastPage, eventNames.POKEMON_SCROLL);
    return { embeds: [embed], components: [actionRow], err: null };
}

const listMessageCommand = async (client, message) => {
    const args = message.content.split(" ");
    const page = args[1] ? parseInt(args[1]) : 1;
    const { embeds, components, err } = await list(message.author, page);
    if (err) {
        await message.channel.send(`${err}`);
    } else {
        await message.channel.send({ embeds: embeds, components: components });
    }
}

const listSlashCommand = async (interaction) => {
    let page = interaction.options.getInteger('page') ? interaction.options.getInteger('page') : 1;
    const { embeds, components, err } = await list(interaction.user, page);
    if (err) {
        await interaction.reply(`${err}`);
    } else {
        await interaction.reply({ embeds: embeds, components: components });
    }
}

module.exports = {
    message: listMessageCommand,
    slash: listSlashCommand
};