const { getTrainer } = require('../../services/trainer');
const { listPokemons } = require('../../services/pokemon');
const { MAX_RELEASE } = require('../../config/trainerConfig');
const { idFrom } = require("../../utils/utils");
const { buildPokemonListEmbed } = require('../../embeds/pokemonEmbeds');
const { buildYesNoActionRow } = require('../../components/yesNoActionRow');
const { eventNames } = require('../../config/eventConfig');
const { setState } = require('../../services/state');
const { calculateWorth } = require('../../utils/pokemonUtils');

const release = async (user, pokemonIds) => {
    if (pokemonIds.length > MAX_RELEASE) {
        return { err: `You can only release up to ${MAX_RELEASE} pokemons at a time!` };
    }

    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { err: trainer.err };
    }

    const toRelease = await listPokemons(trainer.data, page = 1, filter = { _id: { $in: pokemonIds.map(idFrom)} });
    if (toRelease.err) {
        return { err: toRelease.err };
    } else if (toRelease.data.length !== pokemonIds.length) {
        return { err: `You don't have all the pokemon you want to release!` };
    }

    const totalWorth = calculateWorth(toRelease.data, null);

    const embed = buildPokemonListEmbed(trainer.data, toRelease.data, 1);

    const stateId = setState({ userId: user.id, pokemonIds: pokemonIds }, ttl=150);
    const releaseData = {
        stateId: stateId,
    }
    const actionRow = buildYesNoActionRow(releaseData, eventNames.POKEMON_RELEASE, true);

    const send = {
        content: `Do you really want to release the following Pokemon for ₽${totalWorth}?`,
        embeds: [embed],
        components: [actionRow],
    }
    return { send: send, err: null };
}

const releaseMessageCommand = async (message) => {
    const pokemonIds = message.content.split(' ').slice(1);
    const { send, err } = await release(message.author, pokemonIds);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const releaseSlashCommand = async (interaction) => {
    const pokemonIds = interaction.options.getString('pokemonids').split(' ');
    const { send, err } = await release(interaction.user, pokemonIds);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: releaseMessageCommand,
    slash: releaseSlashCommand
};
