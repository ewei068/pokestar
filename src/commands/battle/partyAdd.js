const { getTrainer } = require('../../services/trainer');
const { updateParty, getPartyPokemons } = require('../../services/party');
const { getPokemon } = require('../../services/pokemon');
const { buildPartyEmbed } = require('../../embeds/battleEmbeds');
const { pokemonConfig } = require('../../config/pokemonConfig');

const partyAdd = async (user, pokemonId, position) => {
    const index = position - 1;
    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }
    const partyPokemon = trainer.data.party.pokemonIds;

    // check if position is valid
    if (index < 0 || index >= trainer.data.party.length) {
        return { send: null, err: `Invalid position! Must be between 1 and ${trainer.data.party.length}.` };
    }

    // get pokemon
    const pokemon = await getPokemon(trainer.data, pokemonId);
    if (pokemon.err) {
        return { send: null, err: pokemon.err };
    }

    // temp: check battle elibility
    if (!pokemonConfig[pokemon.data.speciesId].battleEligible) {
        return { send: null, err: `We have not implemented ${pokemon.data.name}'s battle moves yet; look forward to a future update! Use \`/list filterby: battleEligible filtervalue: True\` to find your battle eligible Pokemon!` };
    }

    // if pokemon in party, swap pokemon from both indices
    const existingIndex = partyPokemon.indexOf(pokemon.data._id.toString());
    if (existingIndex !== -1) {
        if (existingIndex === index) {
            return { send: null, err: `${pokemon.data.name} is already in that position!` };
        }
        partyPokemon[index] = partyPokemon.splice(existingIndex, 1, partyPokemon[index])[0];
    } else {
        // check if party is full
        if (partyPokemon[index] == null && partyPokemon.reduce((acc, curr) => acc + (curr ? 1 : 0), 0) >= 6) {
            return { send: null, err: `Your party is full! Remove a Pokemon with \`/partyremove\`` };
        }

        // insert pokemon into index
        partyPokemon[index] = pokemon.data._id.toString();
    }

    // update trainer
    const update = await updateParty(trainer.data, trainer.data.party);
    if (update.err) {
        return { send: null, err: update.err };
    }

    // get party pokemons
    const partyPokemons = await getPartyPokemons(trainer.data);
    if (partyPokemons.err) {
        return { send: null, err: partyPokemons.err };
    }

    // build pokemon embed
    const embed = buildPartyEmbed(trainer.data, partyPokemons.data);

    const send = {
        content: `${pokemon.data.name} was added to your party!`,
        embeds: [embed]
    }
    return { send: send, err: null };
}

const partyAddMessageCommand = async (message) => {
    const args = message.content.split(' ');
    const pokemonId = args[1];
    const position = parseInt(args[2]);
    const { send, err } = await partyAdd(message.author, pokemonId, position);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const partyAddSlashCommand = async (interaction) => {
    const pokemonId = interaction.options.getString('pokemonid');
    const position = interaction.options.getInteger('position');
    const { send, err } = await partyAdd(interaction.user, pokemonId, position);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: partyAddMessageCommand,
    slash: partyAddSlashCommand
};


