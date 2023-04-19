const { listPokemons: listPokemons } = require('../../services/pokemon');
const { getTrainer } = require('../../services/trainer');
const { buildPokemonListEmbed } = require('../../embeds/pokemonEmbeds');
const { buildScrollActionRow } = require('../../components/scrollActionRow');
const { eventNames } = require('../../config/eventConfig');
const { setState } = require('../../services/state');
const { buildPokemonSelectRow } = require('../../components/pokemonSelectRow');

const list = async (user, page, filterBy, filterValue, sortBy, descending) => {
    if (page < 1) {
        return { embeds: null, err: "Page must be greater than 0." };
    }

    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }

    // build list options with page/sort/filter
    if (filterValue == "true") {
        filterValue = true;
    } else if (filterValue == "false") {
        filterValue = false;
    }
    const listOptions = {
        page: page,
    }
    if (filterBy != "none") {
        if (filterValue == null) {
            return { embed: null, err: "Filter value must be provided if filterBy is provided." };
        }

        listOptions.filter = {
            [filterBy]: filterValue
        }
    }
    if (sortBy) {
        listOptions.sort = {
            [sortBy]: descending ? -1 : 1,
            "_id": 1
        }
    }

    const pokemons = await listPokemons(trainer.data, listOptions);
    if (pokemons.err) {
        return { embed: null, err: pokemons.err };
    } 

    const embed = buildPokemonListEmbed(trainer.data, pokemons.data, page);

    const stateId = setState({ 
        userId: user.id, 
        listOptions: listOptions,
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
    const filterBy = args[2] ? args[2] : "none";
    const filterValue = args[3] ? args[3] : null;
    const sortBy = args[4] ? args[4] : null;
    const descending = args[5] == "true";
    const { send, err } = await list(message.author, page, filterBy, filterValue, sortBy, descending);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const listSlashCommand = async (interaction) => {
    const page = interaction.options.getInteger('page') ? interaction.options.getInteger('page') : 1;
    const filterBy = interaction.options.getString('filterby') ? interaction.options.getString('filterby') : "none";
    const filterValue = interaction.options.getString('filtervalue') ? interaction.options.getString('filtervalue') : null;
    const sortBy = interaction.options.getString('sortby') ? interaction.options.getString('sortby') : null;
    const descending = interaction.options.getBoolean('descending') ? interaction.options.getBoolean('descending') : false;
    const { send, err } = await list(interaction.user, page, filterBy, filterValue, sortBy, descending);
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