/**
 * @file
 * @author Elvis Wei
 *
 * partyAuto.js is used to automatically make a party.
 */
const { getTrainer } = require("../../services/trainer");
const { updateParty, getPartyPokemons } = require("../../services/party");
const {
  listPokemonsFromTrainer: listPokemons,
} = require("../../services/pokemon");
const { buildPartyEmbed } = require("../../embeds/battleEmbeds");
const { getUserSelectedDevice } = require("../../utils/trainerUtils");

/**
 * creates an automatic party for the given user, uses dependencies to get other relevant data.
 * @param {*} user the user given to get the relevant data from.
 * @param {*} option the option type for making the automatic party.
 */
const partyAuto = async (user, option) => {
  // get trainer
  const trainer = await getTrainer(user);
  if (trainer.err || !trainer.data) {
    return { send: null, err: trainer.err };
  }
  const { party } = trainer.data;

  // remove all pokemon from party
  // get length of party
  const length = party.rows * party.cols;
  // remove all pokemon from party
  party.pokemonIds = Array(length).fill(null);

  // get 6 highest combat power, battle eligible pokemon
  const filter = {
    battleEligible: true,
  };
  const sort = {
    [option]: -1,
  };
  const bestPokemons = await listPokemons(trainer.data, {
    filter,
    sort,
    pageSize: 6,
    page: 1,
  });
  if (bestPokemons.err) {
    return { send: null, err: bestPokemons.err };
  }
  if (bestPokemons.data.length <= 0) {
    return {
      send: "You don't have any battle eligible pokemon! Use `/gacha` to catch some@",
      err: null,
    };
  }

  // sort pokemon by defensive stats
  bestPokemons.data.sort((a, b) => {
    const [hpA, , defA, , spdA] = a.stats;
    const [hpB, , defB, , spdB] = b.stats;
    return hpB + defB + spdB - b.level - (hpA + defA + spdA - a.level);
  });

  // add best pokemons to party in random positions
  for (const [index, pokemon] of bestPokemons.data.entries()) {
    // if position is already taken, get new position
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let position;
      if (index < 2) {
        // get random position in first row
        position = Math.floor(Math.random() * party.cols);
      } else {
        // get random position not in first row
        position =
          Math.floor(Math.random() * (party.cols * (party.rows - 1))) +
          party.cols;
      }
      // if position is empty, add pokemon
      if (!party.pokemonIds[position]) {
        party.pokemonIds[position] = pokemon._id.toString();
        break;
      }
    }
  }

  // update trainer
  const update = await updateParty(trainer.data, party);
  if (update.err) {
    return { send: null, err: update.err };
  }

  // get party pokemons
  const partyPokemons = await getPartyPokemons(trainer.data);
  if (partyPokemons.err) {
    return { send: null, err: partyPokemons.err };
  }

  // build pokemon embed
  const embed = buildPartyEmbed(trainer.data, partyPokemons.data, {
    isMobile: getUserSelectedDevice(user, trainer.data.settings) === "mobile",
  });

  const send = {
    content: `Your party has been autofilled with your strongest Pokemon!`,
    embeds: [embed],
  };
  return { send, err: null };
};

const partyAutoMessageCommand = async (message) => {
  const option = message.content.split(" ")[1] || "combatPower";
  const { send, err } = await partyAuto(message.author, option);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const partyAutoSlashCommand = async (interaction) => {
  const option = interaction.options.getString("option") || "combatPower";
  const { send, err } = await partyAuto(interaction.user, option);
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

module.exports = {
  message: partyAutoMessageCommand,
  slash: partyAutoSlashCommand,
};
