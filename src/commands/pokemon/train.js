const { addPokemonExp, getPokemon } = require("../../services/pokemon");
const { getTrainer } = require("../../services/trainer");

const TRAIN_EXP = 1;

const train = async (user, pokemonId) => {
    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { data: null, err: trainer.err };
    }

    // get pokemon
    const pokemon = await getPokemon(trainer.data, pokemonId);
    if (pokemon.err) {
        return { data: null, err: pokemon.err };
    }
    const oldLevel = pokemon.data.level;

    // add exp
    const exp = await addPokemonExp(trainer.data, pokemon.data, TRAIN_EXP);
    if (exp.err) {
        return { data: null, err: exp.err };
    }

    let message = `Trained ${pokemon.data.name} and gained ${exp.data} exp.`;
    if (pokemon.data.level > oldLevel) {
        message += ` ${pokemon.data.name} leveled up to level ${pokemon.data.level}!`;
    }

    return { data: message, err: null };
}

const trainMessageCommand = async (message) => {
    const args = message.content.split(" ");
    const pokemonId = args[1];
    const { data, err } = await train(message.author, pokemonId);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(`${data}`);
    }
}

const trainSlashCommand = async (interaction) => {
    const pokemonId = interaction.options.getString('pokemonid');
    const { data, err } = await train(interaction.user, pokemonId);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(`${data}`);
    }
}

module.exports = {
    message: trainMessageCommand,
    slash: trainSlashCommand
};
