/**
 * @file
 * @author Elvis Wei
 *
 * party.js all basic logic for parties.
 */
const { collectionNames } = require("../config/databaseConfig");
const { logger } = require("../log");
const { updateDocument, getCollection } = require("../database/mongoHandler");
const {
  listPokemonsFromTrainer: listPokemons,
  getPokemon,
} = require("./pokemon");
const { idFrom } = require("../utils/utils");
const { pokemonConfig } = require("../config/pokemonConfig");
const { getTrainer } = require("./trainer");
const { buildPartyEmbed } = require("../embeds/battleEmbeds");
const { getUserSelectedDevice } = require("../utils/trainerUtils");
const { drawIterable } = require("../utils/gachaUtils");

/**
 *
 * @param {Trainer} trainer
 * @param {PartyInfo} party
 * @returns {Promise<{data: null, err: string?}>}
 */
const updateParty = async (trainer, party) => {
  try {
    const res = await updateDocument(
      collectionNames.USERS,
      { userId: trainer.userId },
      { $set: { party } }
    );
    if (res.modifiedCount === 0) {
      logger.error(
        `Failed to update trainer ${trainer.user.username}'s party.`
      );
      return { data: null, err: "Error updating trainer party." };
    }
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error updating trainer party." };
  }
  return { data: null, err: null };
};

/**
 * @param {Trainer} trainer
 * @returns {Promise<{data: WithId<Pokemon>[]?, err: string?}>}
 */
const getPartyPokemons = async (trainer) => {
  const pokemonIds = trainer.party.pokemonIds.reduce((acc, curr) => {
    if (curr) {
      acc.push(curr);
    }
    return acc;
  }, []);

  const listOptions = {
    filter: { _id: { $in: pokemonIds.map((id) => idFrom(id)) } },
    allowNone: true,
  };
  const pokemons = await listPokemons(trainer, listOptions);
  if (pokemons.err) {
    return { data: null, err: pokemons.err };
  }

  // line up pokemon with party order
  const partyPokemons = [];
  for (let i = 0; i < trainer.party.pokemonIds.length; i += 1) {
    const pokemonId = trainer.party.pokemonIds[i];
    if (pokemonId) {
      const index = pokemons.data.findIndex(
        (p) => p._id.toString() === pokemonId.toString()
      );
      if (index === -1) {
        return {
          data: null,
          err: "Error finding party pokemon. Use `/party remove ALL` to fix party.",
        };
      }
      partyPokemons.push(pokemons.data[index]);
    } else {
      partyPokemons.push(null);
    }
  }

  return { data: partyPokemons, err: null };
};

/**
 * @param {PartyInfo} party
 * @returns {{data: PartyInfo?, err: string?}}
 */
const validatePartyLayout = (party) => {
  // check if party has valid length
  if (party.pokemonIds.length !== party.rows * party.cols) {
    return {
      data: null,
      err: "Party has invalid layout.",
    };
  }

  // check that the party has no duplicates
  const pokemonIds = party.pokemonIds.reduce((acc, curr) => {
    if (curr) {
      acc.push(curr);
    }
    return acc;
  }, []);
  if (pokemonIds.length !== new Set(pokemonIds).size) {
    return {
      data: null,
      err: "Party has duplicate Pokemon.",
    };
  }

  // check that the party has less than 6 pokemon
  const filteredPokemonIds = pokemonIds.filter((id) => id !== null);
  if (filteredPokemonIds.length > 6) {
    return {
      data: null,
      err: "Party has more than 6 Pokemon.",
    };
  }

  return { data: party, err: null };
};

/**
 * @param {PartyInfo} party
 * @param {string} pokemonId
 * @param {number} index
 */
const canAddOrMovePokemonToParty = (party, pokemonId, index) => {
  if (!Number.isInteger(index) || index < 0 || index >= party.pokemonIds.length) {
    return {
      data: null,
      err: `Invalid position! Must be between 1 and ${party.pokemonIds.length}.`,
    };
  }
  if (party.pokemonIds[index] === pokemonId) {
    return {
      data: null,
      err: "Pokemon is already in that position!",
    };
  }

  const pokemonInIndex = party.pokemonIds[index];
  return validatePartyLayout({
    ...party,
    pokemonIds: party.pokemonIds.map((id, mappedIndex) => {
      if (id === pokemonId) {
        return pokemonInIndex || null; // swap or remove pokemon from old index
      }
      if (mappedIndex === index) {
        return pokemonId; // add pokemon to new index
      }
      return id;
    }),
  });
};

/**
 * @param {Trainer} trainer
 * @param {Pokemon[]} partyPokemons
 * @returns {Promise<{data: null, err: string?}>}
 */
const validatePartyBase = async (trainer, partyPokemons) => {
  const { party } = trainer;

  const { err: validateErr } = await validatePartyLayout(party);
  if (validateErr) {
    return {
      data: null,
      err: "Please reset your party with `/party remove ALL`.",
    };
  }

  // check that all party pokemon are valid
  for (const pokemon of partyPokemons) {
    if (pokemon === null) {
      continue;
    }
    if (pokemon.userId.toString() !== trainer.userId.toString()) {
      return {
        data: null,
        err: "Please reset your party with `/party remove ALL`.",
      };
    }
  }

  return { data: null, err: null };
};

/**
 * @param {Trainer} trainer
 * @returns {Promise<{data: null, err: string?}>}
 */
const validateParty = async (trainer) => {
  const partyPokemons = await getPartyPokemons(trainer);
  if (partyPokemons.err) {
    return { data: null, err: partyPokemons.err };
  }
  return validatePartyBase(trainer, partyPokemons.data);
};

/**
 * @param {Trainer} trainer
 * @returns {Promise<{data: WithId<Pokemon>[], err: string?}>}
 */
const validatePartyForBattle = async (trainer) => {
  const { data: partyPokemons, err: partyErr } = await getPartyPokemons(
    trainer
  );
  if (partyErr) {
    return { data: null, err: partyErr };
  }

  const { err: validateErr } = await validatePartyBase(trainer, partyPokemons);
  if (validateErr) {
    return { data: null, err: validateErr };
  }

  // check that the party has more than 0 pokemon
  const filteredPokemonIds = partyPokemons.filter((id) => id !== null);
  if (filteredPokemonIds.length < 1) {
    return {
      data: null,
      err: "No Pokemon in party. Add Pokemon with `/party manage`.",
    };
  }
  if (filteredPokemonIds.length > 6) {
    return {
      data: null,
      err: "Invalid party. Please reset your party with `/party remove ALL`.",
    };
  }

  // check that all party pokemon are valid
  for (const pokemon of partyPokemons) {
    if (pokemon === null) {
      continue;
    }
    // check if species is battle eligible
    if (!pokemonConfig[pokemon.speciesId].battleEligible) {
      return {
        data: null,
        err: "Please reset your party with `/party remove ALL`.",
      };
    }
  }

  return { data: partyPokemons, err: null };
};

/**
 * Apply explicit intent to fresh state. Retry only a failed guard, never an
 * uncertain write. Legacy callers keep their post-command participation grant.
 * @param {import("./trainer").TrainerIdentity} user
 * @param {{kind: string, index: number, pokemonId?: string, expectedOccupant?: string | null}} command
 * @returns {Promise<{data: null, err: string | null, code?: string}>}
 */
const executePartyCommand = async (user, command) => {
  const failure = (code, err) => ({ data: null, err, code });
  if (!command || !["party.place", "party.remove"].includes(command.kind) ||
      !Number.isInteger(command.index) ||
      (command.kind === "party.place" && (typeof command.pokemonId !== "string" || !/^[a-f\d]{24}$/i.test(command.pokemonId))) ||
      (command.expectedOccupant !== undefined && command.expectedOccupant !== null &&
        (typeof command.expectedOccupant !== "string" || !/^[a-f\d]{24}$/i.test(command.expectedOccupant)))) {
    return failure("invalid_party_command", "Invalid party command.");
  }
  // Discord callers without a supplied expectation bind their intent to the
  // first observed occupant too; a guard retry must not remove a different one.
  const pokemonId = command.kind === "party.place" ? command.pokemonId.toLowerCase() : undefined;
  let expected = command.expectedOccupant?.toLowerCase() ?? command.expectedOccupant;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const result = await getTrainer(user, false);
    if (result.err || !result.data) return failure("trainer_unavailable", result.err || "Trainer unavailable.");
    const trainer = result.data;
    const current = trainer.party;
    if (command.index < 0 || command.index >= current.pokemonIds.length) return failure("invalid_party_command", "Invalid party position.");
    if (expected === undefined) expected = current.pokemonIds[command.index];
    if (current.pokemonIds[command.index] !== expected) return failure("party_changed", "That position changed. Refresh your party and try again.");
    let next;
    if (command.kind === "party.place") {
      const candidate = canAddOrMovePokemonToParty(current, pokemonId, command.index);
      if (candidate.err) return failure("invalid_party_command", candidate.err);
      next = candidate.data;
    } else {
      if (!current.pokemonIds[command.index]) return failure("invalid_party_command", "No Pokemon in that position!");
      next = { ...current, pokemonIds: current.pokemonIds.map((id, index) => index === command.index ? null : id) };
    }
    const invalid = validatePartyLayout(next);
    if (invalid.err) return failure("invalid_party_command", invalid.err);
    const ids = next.pokemonIds.filter(Boolean);
    if (ids.some((id) => !/^[a-f\d]{24}$/i.test(id))) return failure("pokemon_not_owned", "Party contains an unavailable Pokemon.");
    const store = await getCollection(collectionNames.USER_POKEMON);
    const owned = await store.find({ userId: trainer.userId, _id: { $in: ids.map(idFrom) } }).toArray();
    if (owned.length !== ids.length) return failure("pokemon_not_owned", "Party contains an unavailable Pokemon.");
    const write = await updateDocument(collectionNames.USERS,
      { userId: trainer.userId, party: current }, { $set: { party: next } });
    if (write.matchedCount === 1 || write.modifiedCount === 1) return { data: null, err: null };
  }
  return failure("party_changed", "Your party changed. Refresh and try again.");
};

const buildPartyAddSend = async ({
  user = null,
  pokemonId = null,
  position = null,
} = {}) => {
  // get trainer
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }
  const partyPokemon = trainer.data.party.pokemonIds;

  // if position null or undefined, get random unfilled position
  const unfilledPositions = partyPokemon.reduce((acc, curr, index) => {
    if (!curr) {
      acc.push(index + 1);
    }
    return acc;
  }, []);
  const randomUnfilledPosition = drawIterable(unfilledPositions, 1)[0];
  const positionToInsert = position ?? randomUnfilledPosition;
  const index = positionToInsert - 1;

  // check if position is valid
  if (index < 0 || index >= trainer.data.party.pokemonIds.length) {
    return {
      send: null,
      err: `Invalid position! Must be between 1 and ${trainer.data.party.pokemonIds.length}.`,
    };
  }

  // get pokemon
  const pokemon = await getPokemon(trainer.data, pokemonId);
  if (pokemon.err) {
    return { send: null, err: pokemon.err };
  }

  // temp: check battle elibility
  if (!pokemonConfig[pokemon.data.speciesId].battleEligible) {
    return {
      send: null,
      err: `We have not implemented ${pokemon.data.name}'s battle moves yet; look forward to a future update! Use \`/list filterby: battleEligible filtervalue: True\` to find your battle eligible Pokemon!`,
    };
  }

  const update = await executePartyCommand(user, {
    kind: "party.place", pokemonId: pokemon.data._id.toString(), index,
    expectedOccupant: trainer.data.party.pokemonIds[index],
  });
  if (update.err) return { send: null, err: update.err };
  const refreshed = await getTrainer(user, false);
  if (refreshed.err) return { send: null, err: refreshed.err };
  trainer.data.party = refreshed.data.party;

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
    content: `${pokemon.data.name} was added to your party!`,
    embeds: [embed],
    components: [],
  };
  return { send, err: null };
};

/**
 * @param {CompactUser} user
 * @param {string} pokemonId
 * @param {number} index
 * @returns {Promise<{data: null, err: string?}>}
 */
const addOrMovePokemonToParty = async (user, pokemonId, index) =>
  executePartyCommand(user, { kind: "party.place", pokemonId, index });

/**
 * @param {CompactUser} user
 * @param {number} index
 * @returns {Promise<{data: null, err: string?}>}
 */
const removePokemonFromParty = async (user, index) =>
  executePartyCommand(user, { kind: "party.remove", index });


module.exports = {
  updateParty,
  executePartyCommand,
  getPartyPokemons,
  validatePartyForBattle,
  validateParty,
  buildPartyAddSend,
  canAddOrMovePokemonToParty,
  addOrMovePokemonToParty,
  removePokemonFromParty,
};
