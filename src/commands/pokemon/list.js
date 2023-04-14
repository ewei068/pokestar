const { listPokemons: listPokemon } = require('../../services/pokemon');
const { getTrainer } = require('../../services/trainer');
const { buildPokemonListEmbed } = require('../../embeds/pokemonEmbeds');
const { buildScrollActionRow } = require('../../components/scrollActionRow');
const { eventNames } = require('../../config/eventConfig');
const { setState } = require('../../services/state');
const { buildPokemonSelectRow } = require('../../components/pokemonSelectRow');

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

    const stateId = setState({ 
        userId: user.id, 
        page: page, 
        lastPage: pokemons.lastPage 
    }, ttl=300);
    const scrollRowData = {
        stateId: stateId,
    }
    const scrollActionRow = buildScrollActionRow(page, pokemons.lastPage, scrollRowData, eventNames.POKEMON_SCROLL);
    
    const selectRowData = {
        stateId: stateId,
    }
    const pokemonSelectRow = buildPokemonSelectRow(pokemons.data, selectRowData, eventNames.POKEMON_LIST_SELECT);

    const send = {
        content: "**[MOBILE USERS]** Select a pokemon to copy its ID (Hold message -> Copy Text).",
        embeds: [embed],
        components: [scrollActionRow, pokemonSelectRow]
    }
    return { send: send, err: null };
}

const listMessageCommand = async (message) => {
    const args = message.content.split(" ");
    const page = args[1] ? parseInt(args[1]) : 1;
    const { send, err } = await list(message.author, page);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const listSlashCommand = async (interaction) => {
    let page = interaction.options.getInteger('page') ? interaction.options.getInteger('page') : 1;
    const { send, err } = await list(interaction.user, page);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: listMessageCommand,
    slash: listSlashCommand
};