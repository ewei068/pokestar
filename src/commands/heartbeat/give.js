const { getTrainer } = require('../../services/trainer');
const { giveNewPokemon } = require('../../services/gacha');
const { buildNewPokemonEmbed } = require('../../embeds/pokemonEmbeds');

const give = async (user, pokemonId) => {
    // TODO: restrict users who can use?

    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }

    // give pokemon
    const give = await giveNewPokemon(trainer.data, pokemonId);
    if (give.err) {
        return { send: null, err: give.err };
    }

    const embed = buildNewPokemonEmbed(give.data.pokemon, give.data.speciesData);
    const send = {
        content: `${give.data.id}`,
        embeds: [embed]
    }

    return { send: send, err: null };
}

const giveMessageCommand = async (message) => {
    const args = message.content.split(' ');
    const pokemonId = args[1];
    const { send, err } = await give(message.author, pokemonId);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const giveSlashCommand = async (interaction) => {
    const pokemonId = interaction.options.getString('pokemonid');
    const { send, err } = await give(interaction.user, pokemonId);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: giveMessageCommand,
    slash: giveSlashCommand
};