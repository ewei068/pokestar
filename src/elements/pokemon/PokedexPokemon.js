const { buildSpeciesDexEmbed } = require("../../embeds/pokemonEmbeds");
const { pokemonConfig } = require("../../config/pokemonConfig");
const { getPokemonOwnershipStats } = require("../../services/pokemon");

module.exports = async (ref, { speciesId, tab = "info" }) => {
  const speciesData = pokemonConfig[speciesId];
  const ownershipData = await getPokemonOwnershipStats(speciesId); // TODO: use effect
  return {
    elements: [
      {
        content: "",
        embeds: [
          buildSpeciesDexEmbed(speciesId, speciesData, tab, ownershipData),
        ],
        components: [],
      },
    ],
  };
};
