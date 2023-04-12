const { getTrainer } = require('../../services/trainer');
const { listPokemons } = require('../../services/pokemon');
const { MAX_RELEASE } = require('../../config/trainerConfig');
const { idFrom } = require("../../database/mongoHandler");
const { buildPokemonListEmbed } = require('../../embeds/pokemonEmbeds');
const { buildYesNoActionRow } = require('../../components/yesNoActionRow');
const { eventNames } = require('../../config/eventConfig');
const { setState } = require('../../services/eventStates');

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
        console.log(toRelease.data)
        return { err: `You don't have all the pokemon you want to release!` };
    }

    const embed = buildPokemonListEmbed(trainer.data, toRelease.data, 1);

    const stateId = setState({ userId: user.id, pokemonIds: pokemonIds }, ttl=300);
    const releaseData = {
        stateId: stateId,
    }
    const actionRow = buildYesNoActionRow(releaseData, eventNames.POKEMON_RELEASE, true);
    
    return { embeds: [embed], components: [actionRow], err: null };
}

const releaseMessageCommand = async (message) => {
    const pokemonIds = message.content.split(' ').slice(1);
    const { embeds, components, err } = await release(message.author, pokemonIds);
    if (err) {
        await message.channel.send(`${err}`);
    } else {
        await message.channel.send({ content: "Are you sure you want to release the following Pokemon?", embeds: embeds, components: components })
    }
}

const releaseSlashCommand = async (interaction) => {
    const pokemonIds = interaction.options.getString('pokemonids').split(' ');
    const { embeds, components, err } = await release(interaction.user, pokemonIds);
    if (err) {
        await interaction.reply(`${err}`);
    } else {
        await interaction.reply({ content: "Are you sure you want to release the following Pokemon?", embeds: embeds, components: components });
    }
}

module.exports = {
    message: releaseMessageCommand,
    slash: releaseSlashCommand
};
