const { getTrainer } = require ('../../services/trainer') ;
const { usePokeball } = require ('../../services/gacha') ;
const { buildNewPokemonEmbed, buildNewPokemonListEmbed } = require('../../embeds/pokemonEmbeds');
const { backpackItems, backpackCategories } = require('../../config/backpackConfig');
const { buildPokemonSelectRow } = require('../../components/pokemonSelectRow');
const { eventNames } = require('../../config/eventConfig');

/**
 * Attempts to use a pokeball to spin the gacha for a random pokemon.
 * @param {Object} user User who initiated the command.
 * @param {String} pokeball Pokeball to use.
 * @returns An embed with the new pokemon, or an error message.
 */
const gacha = async (user, pokeball, quantity) => {
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
    const gacha = await usePokeball(trainer.data, pokeballId, quantity);
    if (gacha.err) {
        return { embed: null, err: gacha.err };
    }

    if (gacha.data.pokemons.length === 1) {
        // build Pokemon embed
        const pokemon = gacha.data.pokemons[0];
        embed = buildNewPokemonEmbed(
            pokemon,
            pokeballId, 
            trainer.data.backpack[backpackCategories.POKEBALLS][pokeballId]
        );
        const send = {
            content: `${pokemon._id}`,
            embeds: [embed]
        }

        return { send: send, err: null };
    } else {
        // build Pokemon embed
        embed = buildNewPokemonListEmbed(
            gacha.data.pokemons,
            pokeballId,
            trainer.data.backpack[backpackCategories.POKEBALLS][pokeballId]
        );
        // make list selector
        // build selection row for pokemon Ids
    const selectRowData = {}
    const pokemonSelectRow = buildPokemonSelectRow(gacha.data.pokemons, selectRowData, eventNames.POKEMON_LIST_SELECT);
        const send = {
            embeds: [embed],
            components: [pokemonSelectRow]
        }

        return { send: send, err: null };
    }
}

const gachaMessageCommand = async (message) => {
    const args = message.content.split(" ");
    const pokeball = args[1];
    const quantity = args[2] ? parseInt(args[2]) : 1;
    const { send, err } = await gacha(message.author, pokeball, quantity);
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
    const quantity = interaction.options.getInteger('quantity') || 1;
    const { send, err } = await gacha(interaction.user, pokeball, quantity);
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



