const { createRoot } = require("../../deact/deact");
const ChangeHeldItem = require("../../elements/pokemon/ChangeHeldItem");
const { buildPokemonInfoSend } = require("../../services/pokemon");

const pokemonActionButton = async (interaction, data) => {
  const { action } = data;

  const { send, err } = await buildPokemonInfoSend({
    user: interaction.user,
    pokemonId: data.id,
    action,
  });
  if (err) {
    return { err };
  }
  await interaction
    .update(send)
    .then(() => {
      if (action === "train") {
        return interaction.followUp({
          content:
            "To train this pokemon, copy the following command. For Mobile users, Long Press -> Copy Text.",
          ephemeral: true,
        });
      }
      if (action === "item") {
        // TODO
      }
    })
    .then(() => {
      if (action === "train") {
        return interaction.followUp({
          content: `/train pokemonid: ${data.id}`,
          ephemeral: true,
        });
      }
    });
};

module.exports = pokemonActionButton;
