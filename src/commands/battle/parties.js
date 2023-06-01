const { getTrainer } = require('../../services/trainer');
const { listPokemons } = require('../../services/pokemon');
const { idFrom } = require('../../utils/utils');
const { buildPartiesEmbed } = require('../../embeds/battleEmbeds');
const { getPartyPokemonIds } = require('../../utils/pokemonUtils');

const parties = async (user) => {
    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }
    const party = trainer.data.party;

    // get unique pokemon ids in all parties
    const uniqueIds = getPartyPokemonIds(trainer.data);

    // get pokemon from ids
    const pokemons = await listPokemons(
        trainer.data, 
        { 
            page: 1, 
            pageSize: uniqueIds.length + 1, // for safety idk
            filter: { _id: { $in: uniqueIds.map(idFrom)} } 
        }
    );
    if (pokemons.err) {
        return { err: pokemons.err };
    }

    // map id to pokemon
    const pokemonMap = {};
    for (const pokemon of pokemons.data) {
        pokemonMap[pokemon._id.toString()] = pokemon;
    }

    // get parties
    const partiesEmbed = buildPartiesEmbed(trainer.data, pokemonMap);

    const send = {
        embeds: [partiesEmbed],
    }
    return { send: send, err: null };
}

const partiesMessageCommand = async (message) => {
    const { send, err } = await parties(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const partiesSlashCommand = async (interaction) => {
    const { send, err } = await parties(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: partiesMessageCommand,
    slash: partiesSlashCommand
}