const { getTrainer, updateTrainer } = require('../../services/trainer');
const { updateParty, getPartyPokemons } = require('../../services/party');
const { getPokemon } = require('../../services/pokemon');
const { buildPartyEmbed } = require('../../embeds/battleEmbeds');
const { pokemonConfig } = require('../../config/pokemonConfig');

const partyLoad = async (user, preset) => {
    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }
    const party = trainer.data.party;
    const savedParties = trainer.data.savedParties;

    // attempt to get saved party from preset
    const savedParty = savedParties[preset];
    if (!savedParty) {
        return { send: null, err: "Invalid preset ID! Use `/parties` to see your saved parties" };
    }

    // swap part with saved party
    const tempParty = { ...party };
    trainer.data.party = savedParty;
    trainer.data.savedParties[preset] = tempParty;

    // update trainer
    const update = await updateTrainer(trainer.data);
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
        content: `Party ${preset} loaded!`,
        embeds: [embed]
    }
    return { send: send, err: null };
}

const partyLoadMessageCommand = async (message) => {
    const args = message.content.split(' ');
    const preset = parseInt(args[1]);
    const { send, err } = await partyLoad(message.author, preset);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const partyLoadSlashCommand = async (interaction) => {
    const preset = interaction.options.getInteger('preset');
    const { send, err } = await partyLoad(interaction.user, preset);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: partyLoadMessageCommand,
    slash: partyLoadSlashCommand
};


