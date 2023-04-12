const { getTrainer } = require("../services/trainer");
const { listPokemons: listPokemon } = require("../services/pokemon");
const { buildPokemonListEmbed } = require("../embeds/pokemonEmbeds");
const { buildScrollActionRow } = require("../components/scrollActionRow");
const { eventNames } = require("../config/eventConfig");

const pokemonScroll = async (interaction, data) => {
    let page = data.page;
    if (data.isLeft) {
        page -= 1;
    } else {
        page += 1;
    }
    // TODO: verify user is the same as the user who pressed the button
    if (page < 1) {
        return;
    }

    const trainer = await getTrainer(interaction.user);
    if (trainer.err) {
        return;
    }

    const pokemons = await listPokemon(trainer.data, page);
    if (pokemons.err) {
        return;
    } 

    const embed = buildPokemonListEmbed(trainer.data, pokemons.data, page);
    const actionRow = buildScrollActionRow(page, pokemons.lastPage, eventNames.POKEMON_SCROLL);
    
    await interaction.update({ embeds: [embed], components: [actionRow] });
}

module.exports = pokemonScroll;