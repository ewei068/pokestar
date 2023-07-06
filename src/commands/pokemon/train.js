/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * train.js The system for users to train their pokemon. Allows them to train a pokemon at a given location, boosting its exp and ev.
*/
const { getPokemon, trainPokemon } = require("../../services/pokemon");
const { getTrainer } = require("../../services/trainer");
const { locations } = require("../../config/locationConfig");
const { statConfig } = require("../../config/pokemonConfig");

/**
 * Trains a Pokemon at a given locations, boosting its EXP and EVs.
 * @param {Object} user User who initiated the command.
 * @param {String} pokemonId ID of the Pokemon to train.
 * @param {String} location Location to train at.
 * @returns Message indicating the Pokemon's gained EXP and EVs.
 */
const train = async (user, pokemonId, location) => {
    // get location id
    const map = {
        "home": locations.HOME,
        "restaurant": locations.RESTAURANT,
        "gym": locations.GYM,
        "dojo": locations.DOJO,
        "temple": locations.TEMPLE,
        "school": locations.SCHOOL,
        "track": locations.TRACK,
        "berryBush": locations.BERRY_BUSH,
        "berryFarm": locations.BERRY_FARM,
    }
    const locationId = map[location];

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

    // add exp & EVs
    const res = await trainPokemon(trainer.data, pokemon.data, locationId);
    if (res.err) {
        return { data: null, err: res.err };
    }
    const { exp, evs } = res.data;

    // build message
    let message = `Trained ${pokemon.data.name} and gained ${exp} exp.`;
    if (evs[0] != 0 || evs[1] != 0 || evs[2] != 0 || evs[3] != 0 || evs[4] != 0 || evs[5] != 0) {
        message += ` ${pokemon.data.name} gained the following EVs:`;
        // format evs for all that exist
        for (const ev in evs) {
            if (evs[ev] != 0) {
                message += ` ${evs[ev]} ${statConfig[ev].name},`;
            }
        }
        // remove last comma if exists
        if (message[message.length - 1] === ",") {
            message = message.slice(0, -1);
            message += ".";
        }
    }
    // check if pokemon leveled up
    if (pokemon.data.level > oldLevel) {
        message += ` ${pokemon.data.name} leveled up to level ${pokemon.data.level}!`;
    }

    return { data: message, err: null };
}

const trainMessageCommand = async (message) => {
    const args = message.content.split(" ");
    const pokemonId = args[1];
    let location = args.length > 2 ? args[2] : "home"; // default to home
    const { data, err } = await train(message.author, pokemonId, location);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(`${data}`);
    }
}

const trainSlashCommand = async (interaction) => {
    const pokemonId = interaction.options.getString('pokemonid');
    const location = interaction.options.getString('location'); // default to home
    const { data, err } = await train(interaction.user, pokemonId, location || "home");
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
