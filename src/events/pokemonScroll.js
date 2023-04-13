const { getTrainer } = require("../services/trainer");
const { listPokemons } = require("../services/pokemon");
const { buildPokemonListEmbed } = require("../embeds/pokemonEmbeds");
const { buildScrollActionRow } = require("../components/scrollActionRow");
const { buildPokemonSelectRow } = require("../components/pokemonSelectRow");
const { eventNames } = require("../config/eventConfig");
const { getState } = require("../services/state");

const pokemonScroll = async (interaction, data) => {
    // get state
    const state = getState(data.stateId);
    if (!state) {
        return;
    }

    // verify user is the same as the user who pressed the button
    if (state.userId && interaction.user.id !== state.userId) {
        return;
    }

    let page = state.page;
    if (data.isLeft) {
        page -= 1;
    } else {
        page += 1;
    }
    if (page < 1 || (!data.isLeft && state.lastPage)) {
        return;
    }
    state.page = page;

    // TODO: move to one function?
    const trainer = await getTrainer(interaction.user);
    if (trainer.err) {
        return;
    }

    const pokemons = await listPokemons(trainer.data, page);
    if (pokemons.err) {
        return;
    } 

    const embed = buildPokemonListEmbed(trainer.data, pokemons.data, page);
    const scrollRowData = {
        stateId: data.stateId,
    }
    const scrollActionRow = buildScrollActionRow(page, pokemons.lastPage, scrollRowData, eventNames.POKEMON_SCROLL);
    
    const selectRowData = {
        stateId: data.stateId,
    }
    const pokemonSelectRow = buildPokemonSelectRow(pokemons.data, selectRowData, eventNames.POKEMON_LIST_SELECT);
    
    await interaction.update({ 
        content: interaction.message.content,
        embeds: [embed], 
        components: [scrollActionRow, pokemonSelectRow] 
    });
}

module.exports = pokemonScroll;