const { MAX_TRADE_POKEMON, MAX_TRADE_MONEY } = require("../config/socialConfig");
const { buildTradeEmbed } = require("../embeds/socialEmbeds");
const { idFrom } = require("../utils/utils");
const { getPokemon, canRelease, listPokemons } = require("./pokemon");
const { getTrainer, updateTrainer } = require("./trainer");

const getTradePokemons = async (trainer) => {
    const pokemonIds = trainer.trade.pokemonIds;

    const canReleaseRes = await canRelease(trainer, pokemonIds);
    if (canReleaseRes.err) {
        return { data: null, err: `${trainer.user.username}: ${canReleaseRes.err} Use \`/traderemove ALL\` to fix trade.` };
    }

    const listOptions = {
        filter: { _id: { $in: pokemonIds.map(id => idFrom(id)) } },
        allowNone: true,
    };
    const pokemons = await listPokemons(trainer, listOptions);
    if (pokemons.err) {
        return { data: null, err: pokemons.err };
    }

    if (pokemons.data.length !== pokemonIds.length) {
        return { data: null, err: `${trainer.user.username}: Error finding trade pokemon. Use \`/traderemove ALL\` to fix trade.` };
    }

    // if dupes, return
    const pokemonIdsSet = new Set(pokemonIds);
    if (pokemonIdsSet.size !== pokemonIds.length) {
        return { data: null, err: `${trainer.user.username}: Duplicate Pokemon in trade. Use \`/traderemove ALL\` to fix trade.` };
    }

    return { data: pokemons.data || [], err: null };
}

const buildTradeAddSend = async ({user=null, pokemonId=null, money=0}={}) => {
    if (!pokemonId && !money) {
        return { send: null, err: "Invalid parameters." };
    }

    // get trainer
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }
    const trade = trainer.data.trade;

    // if pokemon
    if (pokemonId) {
        // if max pokemon, return
        if (trade.pokemonIds.length >= MAX_TRADE_POKEMON) {
            return { send: null, err: `You can only trade up to ${MAX_TRADE_POKEMON} Pokemon at a time.` };
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
            return { send: null, err: `You can only trade up to ${MAX_TRADE_MONEY} money at a time.` };
        }

        // get money equal cieling of max money
        const moneyCeil = Math.min(MAX_TRADE_MONEY - trade.money, money);

        // if trainer doesn't have enough money, return
        if (trainer.data.money < moneyCeil) {
            return { send: null, err: "You don't have enough money." };
        }

        // add money to trade
        trade.money += moneyCeil;
        // subtract money from trainer
        trainer.data.money -= moneyCeil;
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

    // build pokemon embed
    const embed = buildTradeEmbed(trainer.data, tradePokemons.data, trade.money);

    const send = {
        content: `Your trade offer has been updated!`,
        embeds: [embed],
        components: []
    }
    return { send: send, err: null };
}

module.exports = {
    buildTradeAddSend,
}
