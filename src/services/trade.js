const { ButtonStyle } = require("discord.js");
const { buildButtonActionRow } = require("../components/buttonActionRow");
const { buildPokemonSelectRow } = require("../components/pokemonSelectRow");
const { eventNames } = require("../config/eventConfig");
const {
  MAX_TRADE_POKEMON,
  MAX_TRADE_MONEY,
  TRADE_COMPLETE_WINDOW,
  TRADE_ACCEPT_WINDOW,
} = require("../config/socialConfig");
const { stageNames } = require("../config/stageConfig");
const { trainerFields } = require("../config/trainerConfig");
const { buildTradeEmbed } = require("../embeds/socialEmbeds");
const { idFrom, formatMoney } = require("../utils/utils");
const { canRelease, listPokemons, updatePokemon } = require("./pokemon");
const { getState } = require("./state");
const { getTrainer, updateTrainer } = require("./trainer");

/**
 * @param {WithId<Trainer>} trainer
 * @returns {Promise<{data?: boolean, err: string?}>}
 */
const canTrade = async (trainer) => {
  const levelReq = process.env.STAGE === stageNames.ALPHA ? 5 : 50;
  if (trainer.level < levelReq) {
    return {
      data: false,
      err: `<@${trainer.userId}>: You must be level ${levelReq} to trade.`,
    };
  }
  return { err: null };
};

/**
 *
 * @param {WithId<Trainer>} trainer
 * @param {UserTradeInfo} trade
 * @returns {Promise<{data: WithId<Pokemon>[], err: string?}>}
 */
const getTradePokemons = async (trainer, trade = null) => {
  const pokemonIds = trade ? trade.pokemonIds : trainer.trade.pokemonIds;

  const canReleaseRes = await canRelease(trainer, pokemonIds);
  if (canReleaseRes.err) {
    return {
      data: null,
      err: `<@${trainer.userId}>: ${canReleaseRes.err} Use \`/traderemove ALL\` to fix trade.`,
    };
  }

  const listOptions = {
    filter: { _id: { $in: pokemonIds.map((id) => idFrom(id)) } },
    allowNone: true,
  };
  const pokemons = await listPokemons(trainer, listOptions);
  if (pokemons.err) {
    return { data: null, err: pokemons.err };
  }

  if (pokemons.data.length !== pokemonIds.length) {
    return {
      data: null,
      err: `<@${trainer.userId}>: Error finding trade pokemon. Use \`/traderemove ALL\` to fix trade.`,
    };
  }

  // if dupes, return
  const pokemonIdsSet = new Set(pokemonIds);
  if (pokemonIdsSet.size !== pokemonIds.length) {
    return {
      data: null,
      err: `<@${trainer.userId}>: Duplicate Pokemon in trade. Use \`/traderemove ALL\` to fix trade.`,
    };
  }

  return { data: pokemons.data || [], err: null };
};

const buildTradeOfferSend = async ({
  trainer = null,
  tradePokemons = [],
  money = 0,
} = {}) => {
  // build pokemon embed
  const embed = buildTradeEmbed(trainer, tradePokemons, money);

  const send = {
    embeds: [embed],
    components: [],
  };

  // if tradePokemons, build pokemon select menu
  if (tradePokemons.length) {
    const pokemonSelectMenu = buildPokemonSelectRow(
      tradePokemons,
      { userId: trainer.userId },
      eventNames.POKEMON_LIST_SELECT
    );
    send.components.push(pokemonSelectMenu);
  }

  return { send, err: null };
};

const buildTradeAddSend = async ({
  user = null,
  pokemonId = null,
  money = 0,
} = {}) => {
  if (!pokemonId && !money) {
    return { send: null, err: "Invalid parameters." };
  }

  // get trainer
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }
  const { trade } = trainer.data;

  const canTradeRes = await canTrade(trainer.data);
  if (canTradeRes.err) {
    return { send: null, err: canTradeRes.err };
  }

  // if pokemon
  if (pokemonId) {
    // if max pokemon, return
    if (trade.pokemonIds.length >= MAX_TRADE_POKEMON) {
      return {
        send: null,
        err: `You can only trade up to ${MAX_TRADE_POKEMON} Pokemon at a time.`,
      };
    }

    // validate pokemon
    const pokemon = await canRelease(trainer.data, [pokemonId]);
    if (pokemon.err) {
      return { send: null, err: pokemon.err };
    }

    // if already in trade, return
    if (trade.pokemonIds.includes(pokemonId)) {
      return { send: null, err: "Pokemon already in trade." };
    }

    // add pokemon to trade
    trade.pokemonIds.push(pokemonId);
  } else {
    // if money less that 1, return
    if (money < 1) {
      return { send: null, err: "You must trade at least 1 money." };
    }

    // if already at max money, return
    if (trade.money >= MAX_TRADE_MONEY) {
      return {
        send: null,
        err: `You can only trade up to ${MAX_TRADE_MONEY} money at a time.`,
      };
    }

    // get money equal cieling of max money
    const moneyCeil = Math.min(MAX_TRADE_MONEY - trade.money, money);

    // if trainer doesn't have enough money, return
    if (trainer.data.money < moneyCeil) {
      return { send: null, err: "You don't have enough money." };
    }

    // add money to trade
    trade.money += moneyCeil;
    // subtract money from trainer: removed for now
    // trainer.data.money -= moneyCeil;
  }

  // get trade pokemon
  const tradePokemons = await getTradePokemons(trainer.data);
  if (tradePokemons.err) {
    return { send: null, err: tradePokemons.err };
  }

  // update trainer
  const update = await updateTrainer(trainer.data);
  if (update.err) {
    return { send: null, err: update.err };
  }

  const offerSend = await buildTradeOfferSend({
    trainer: trainer.data,
    tradePokemons: tradePokemons.data,
    money: trade.money,
  });
  if (offerSend.err) {
    return { send: null, err: offerSend.err };
  }
  offerSend.send.content = "Your trade offer has been updated.";
  return { send: offerSend.send, err: null };
};

const buildTradeRemoveSend = async ({
  user = null,
  pokemonId = null,
  money = 0,
} = {}) => {
  // get trainer
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }
  let { trade } = trainer.data;

  let moneyRemoved = 0;
  if (!pokemonId && !money) {
    // remove everything
    moneyRemoved = trade.money;
    trade = {
      ...trainerFields.trade.default,
    };
    trainer.data.trade = trade;
  } else if (pokemonId) {
    // remove pokemon
    const pokemonIndex = trade.pokemonIds.indexOf(pokemonId);
    if (pokemonIndex === -1) {
      return { send: null, err: "Pokemon not in trade." };
    }
    trade.pokemonIds.splice(pokemonIndex, 1);
  } else {
    // remove money
    // if money less that 1, return
    if (money < 1) {
      return { send: null, err: "You must remove at least 1 money." };
    }

    const oldMoney = trade.money;
    trade.money = Math.max(0, trade.money - money);
    // eslint-disable-next-line no-unused-vars
    moneyRemoved = oldMoney - trade.money;
  }

  // get trade pokemon
  const tradePokemons = await getTradePokemons(trainer.data);
  if (tradePokemons.err) {
    return { send: null, err: tradePokemons.err };
  }

  // update trainer
  // trainer.data.money += moneyRemoved; removed for now
  const update = await updateTrainer(trainer.data);
  if (update.err) {
    return { send: null, err: update.err };
  }

  const offerSend = await buildTradeOfferSend({
    trainer: trainer.data,
    tradePokemons: tradePokemons.data,
    money: trade.money,
  });
  if (offerSend.err) {
    return { send: null, err: offerSend.err };
  }
  offerSend.send.content = "Your trade offer has been updated.";
  return { send: offerSend.send, err: null };
};

const buildTradeInfoSend = async ({ user = null } = {}) => {
  // get trainer
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }
  const { trade } = trainer.data;

  const canTradeRes = await canTrade(trainer.data);
  if (canTradeRes.err) {
    return { send: null, err: canTradeRes.err };
  }

  // get trade pokemon
  const tradePokemons = await getTradePokemons(trainer.data);
  if (tradePokemons.err) {
    return { send: null, err: tradePokemons.err };
  }

  const offerSend = await buildTradeOfferSend({
    trainer: trainer.data,
    tradePokemons: tradePokemons.data,
    money: trade.money,
  });
  if (offerSend.err) {
    return { send: null, err: offerSend.err };
  }

  // add trade help button
  const buttonConfigs = [
    {
      label: "Trade Help",
      emoji: "❓",
      disabled: false,
    },
  ];
  const buttonRow = buildButtonActionRow(buttonConfigs, eventNames.TRADE_HELP);
  offerSend.send.components.push(buttonRow);

  return { send: offerSend.send, err: null };
};

/**
 *
 * @param {WithId<Trainer>} trainer
 * @param {UserTradeInfo} trade
 * @returns {Promise<{err: string?}>}
 */
const validateTrade = async (trainer, trade) => {
  // get trade pokemons
  const tradePokemons = await getTradePokemons(trainer, trade);
  if (tradePokemons.err) {
    return { err: tradePokemons.err };
  }

  // make sure trade pokemons is between 0 and max trade pokemons
  if (
    tradePokemons.data.length < 0 ||
    tradePokemons.data.length > MAX_TRADE_POKEMON
  ) {
    return {
      err: `<@${trainer.userId}>: You can only trade between 0 and ${MAX_TRADE_POKEMON} pokemon at a time.`,
    };
  }

  // make sure money between 0 and max trade money
  if (trade.money < 0 || trade.money > MAX_TRADE_MONEY) {
    return {
      err: `<@${trainer.userId}>: You can only trade between 0 and ${MAX_TRADE_MONEY} money at a time.`,
    };
  }

  // make sure trainer has enough money
  if (trade.money > trainer.money) {
    return {
      err: `<@${
        trainer.userId
      }>: You do not have enough money to trade ${formatMoney(trade.money)}.`,
    };
  }

  return { err: null };
};

/**
 * @param {WithId<Trainer>} trainer1
 * @param {WithId<Trainer>} trainer2
 * @param {UserTradeInfo} trade1
 * @param {UserTradeInfo} trade2
 * @returns {Promise<{err: string?}>}
 */
const validateTrades = async (trainer1, trainer2, trade1, trade2) => {
  // make sure both trainers can trade
  const canTrade1 = await canTrade(trainer1);
  if (canTrade1.err) {
    return { err: canTrade1.err };
  }

  const canTrade2 = await canTrade(trainer2);
  if (canTrade2.err) {
    return { err: canTrade2.err };
  }

  // validate both trades
  const validate1 = await validateTrade(trainer1, trade1);
  if (validate1.err) {
    return { err: validate1.err };
  }

  const validate2 = await validateTrade(trainer2, trade2);
  if (validate2.err) {
    return { err: validate2.err };
  }

  return { err: null };
};

const buildTradeRequestSend = async ({
  stateId = null,
  user1 = null,
  userId2 = null,
} = {}) => {
  const state = getState(stateId);

  state.user1 = user1;
  state.userId1 = user1.id;
  state.userId2 = userId2;

  // get trainer
  const trainer = await getTrainer(user1);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }
  const { trade } = trainer.data;

  const canTradeRes = await canTrade(trainer.data);
  if (canTradeRes.err) {
    return { send: null, err: canTradeRes.err };
  }

  // get trade pokemon
  const tradePokemons = await getTradePokemons(trainer.data);
  if (tradePokemons.err) {
    return { send: null, err: tradePokemons.err };
  }

  // offer display
  const offerSend = await buildTradeOfferSend({
    trainer: trainer.data,
    tradePokemons: tradePokemons.data,
    money: trade.money,
  });
  if (offerSend.err) {
    return { send: null, err: offerSend.err };
  }

  // trade string
  const userString = userId2 ? ` with <@${userId2}>!` : "!";
  offerSend.send.content = `<@${user1.id}> wants to trade${userString}`;

  // accept button
  const buttonConfigs = [
    {
      label: "Accept",
      disabled: false,
      data: {
        stateId,
      },
    },
  ];
  const acceptButton = buildButtonActionRow(
    buttonConfigs,
    eventNames.TRADE_REQUEST_ACCEPT
  );
  offerSend.send.components.push(acceptButton);

  // add trade to state
  state.trade1 = {
    ...trade,
  };

  return { send: offerSend.send, err: null };
};

const onTradeRequestAccept = async ({ stateId = null, user2 = null } = {}) => {
  // get state
  const state = getState(stateId);

  // if userId2 and user2.id don't match, return
  if (state.userId2 && state.userId2 !== user2.id) {
    return { err: "You cannot accept this trade request." };
  }

  // if userids are equal, return
  if (state.userId1 === user2.id) {
    return { err: "You cannot accept your own trade request." };
  }

  // get first trainer
  const trainer1 = await getTrainer(state.user1);
  if (trainer1.err) {
    return { err: trainer1.err };
  }

  // get trainer
  const trainer2 = await getTrainer(user2);
  if (trainer2.err) {
    return { err: trainer2.err };
  }
  const { trade } = trainer2.data;

  // validate both trades
  const validate = await validateTrades(
    trainer1.data,
    trainer2.data,
    state.trade1,
    trade
  );
  if (validate.err) {
    return { err: validate.err };
  }

  // update state
  state.user2 = user2;
  state.userId2 = user2.id;
  state.trade2 = {
    ...trade,
  };
  state.tradeStartedTime = Date.now();

  return { err: null };
};

const onTradeAccept = async ({ stateId = null, user = null } = {}) => {
  // get state
  const state = getState(stateId);

  // if its been less than 5 seconds since trade started, return
  if (Date.now() - state.tradeStartedTime < TRADE_ACCEPT_WINDOW * 1000) {
    return {
      err: `You cannot accept a trade within ${TRADE_ACCEPT_WINDOW} seconds of it starting.`,
    };
  }

  // if trade cancelled, return
  if (state.declineUserId !== undefined) {
    return { err: "You cannot accept a trade that has been cancelled." };
  }

  // figure out if user is user1 or user2
  const { user1 } = state;
  const isUser1 = user1.id === user.id;

  // update state
  if (isUser1) {
    state.user1Accepted = true;
  } else {
    state.user2Accepted = true;
  }

  // if both users have accepted and complete trade not initiated, set trade start time
  if (
    state.user1Accepted &&
    state.user2Accepted &&
    state.tradeAcceptedTime === undefined
  ) {
    state.tradeAcceptedTime = Date.now();
    return { err: null, shouldTrade: true };
  }

  return { err: null };
};

const onTradeComplete = async ({ stateId = null } = {}) => {
  // get state
  const state = getState(stateId);

  // if trade cancelled, return
  if (state.declineUserId !== undefined) {
    return { err: "Trade was cancelled and did not complete." };
  }

  // if trade not accepted, return
  if (state.tradeAcceptedTime === undefined) {
    return { err: "Trade was not accepted and did not complete." };
  }

  // get trainers and trades
  const trainer1 = await getTrainer(state.user1);
  if (trainer1.err) {
    return { err: trainer1.err };
  }
  const trainer2 = await getTrainer(state.user2);
  if (trainer2.err) {
    return { err: trainer2.err };
  }
  const { trade1 } = state;
  const { trade2 } = state;

  // validate trades
  const validate = await validateTrades(
    trainer1.data,
    trainer2.data,
    trade1,
    trade2
  );
  if (validate.err) {
    return { err: validate.err };
  }

  // swap money
  const moneyDiff = trade1.money - trade2.money;
  trainer1.data.money -= moneyDiff;
  trainer2.data.money += moneyDiff;

  // TODO: rollback?
  // swap pokemons
  const trainer1Pokemons = await getTradePokemons(trainer1.data, trade1);
  if (trainer1Pokemons.err) {
    return { err: trainer1Pokemons.err };
  }
  const trainer2Pokemons = await getTradePokemons(trainer2.data, trade2);
  if (trainer2Pokemons.err) {
    return { err: trainer2Pokemons.err };
  }

  const promises = [];
  for (const pokemon of trainer1Pokemons.data) {
    pokemon.userId = trainer2.data.userId;
    promises.push(updatePokemon(pokemon));
  }
  for (const pokemon of trainer2Pokemons.data) {
    pokemon.userId = trainer1.data.userId;
    promises.push(updatePokemon(pokemon));
  }

  // reset trainer trades
  trainer1.data.trade = {
    ...trainerFields.trade.default,
  };
  trainer2.data.trade = {
    ...trainerFields.trade.default,
  };

  // update trainers
  promises.push(updateTrainer(trainer1.data));
  promises.push(updateTrainer(trainer2.data));

  // update state
  state.tradeCompletedTime = Date.now();

  // await promises
  await Promise.all(promises);

  return { err: null };
};

const onTradeDecline = async ({ stateId = null, user = null } = {}) => {
  // get state
  const state = getState(stateId);

  // set state decline to user id
  state.declineUserId = user.id;

  return { err: null };
};

const buildTradeSend = async ({ stateId = null } = {}) => {
  // get state
  const state = getState(stateId);

  // get trainers
  const trainer1 = await getTrainer(state.user1);
  if (trainer1.err) {
    return { send: null, err: trainer1.err };
  }
  const trainer2 = await getTrainer(state.user2);
  if (trainer2.err) {
    return { send: null, err: trainer2.err };
  }

  // get and validate trades
  const { trade1 } = state;
  const { trade2 } = state;
  const validate = await validateTrades(
    trainer1.data,
    trainer2.data,
    trade1,
    trade2
  );
  if (validate.err) {
    return { send: null, err: validate.err };
  }

  // get trade pokemon
  const tradePokemons1 = await getTradePokemons(trainer1.data, trade1);
  if (tradePokemons1.err) {
    return { send: null, err: tradePokemons1.err };
  }
  const tradePokemons2 = await getTradePokemons(trainer2.data, trade2);
  if (tradePokemons2.err) {
    return { send: null, err: tradePokemons2.err };
  }

  // get offer displays
  const offerSend1 = await buildTradeOfferSend({
    trainer: trainer1.data,
    tradePokemons: tradePokemons1.data,
    money: trade1.money,
  });
  if (offerSend1.err) {
    return { send: null, err: offerSend1.err };
  }
  const offerSend2 = await buildTradeOfferSend({
    trainer: trainer2.data,
    tradePokemons: tradePokemons2.data,
    money: trade2.money,
  });
  if (offerSend2.err) {
    return { send: null, err: offerSend2.err };
  }

  // get accept1/cancel/accept2 buttons
  const buttonConfigs = [
    {
      label: `${trainer1.data.user.username} Accept`,
      disabled:
        state.user1Accepted !== undefined || state.declineUserId !== undefined,
      data: {
        stateId,
        userId: trainer1.data.userId,
      },
      emoji: "✅",
      style: ButtonStyle.Success,
    },
    {
      label: "Cancel",
      disabled: state.declineUserId !== undefined,
      data: {
        stateId,
      },
      emoji: "✖️",
      style: ButtonStyle.Danger,
    },
    {
      label: `${trainer2.data.user.username} Accept`,
      disabled:
        state.user2Accepted !== undefined || state.declineUserId !== undefined,
      data: {
        stateId,
        userId: trainer2.data.userId,
      },
      emoji: "✅",
      style: ButtonStyle.Success,
    },
  ];
  const buttons = buildButtonActionRow(
    buttonConfigs,
    eventNames.TRADE_REQUEST_BUTTON
  );

  let content = `Trade between <@${trainer1.data.userId}> and <@${trainer2.data.userId}>`;
  if (state.declineUserId) {
    content = `Trade declined by <@${state.declineUserId}>`;
  } else if (state.tradeAcceptedTime) {
    content = `Trade has been **accepted** by both parties and will complete <t:${
      Math.floor(state.tradeAcceptedTime / 1000) + TRADE_COMPLETE_WINDOW
    }:R>. **You may still cancel the trade.**`;
  }

  // merge offers
  const send = {
    content: `${content}`,
    embeds: [...offerSend1.send.embeds, ...offerSend2.send.embeds],
    components: [
      ...offerSend1.send.components,
      ...offerSend2.send.components,
      buttons,
    ],
  };

  return { send, err: null };
};

module.exports = {
  buildTradeAddSend,
  buildTradeRemoveSend,
  buildTradeInfoSend,
  buildTradeRequestSend,
  onTradeRequestAccept,
  onTradeAccept,
  onTradeDecline,
  onTradeComplete,
  buildTradeSend,
};
