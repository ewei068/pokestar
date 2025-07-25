const { createRoot } = require("../../deact/deact");
const { getInteractionInstance } = require("../../deact/interactions");
const PartyManageEntryPoint = require("../../elements/party/PartyManage");
const ChangeForm = require("../../elements/pokemon/ChangeForm");
const ChangeHeldItem = require("../../elements/pokemon/ChangeHeldItem");
const { buildPokemonInfoSend } = require("../../services/pokemon");

const pokemonActionButton = async (incomingInteraction, data) => {
  const { action } = data;
  const interaction = getInteractionInstance(incomingInteraction);

  const { send, pokemon, err } = await buildPokemonInfoSend({
    user: incomingInteraction.user,
    pokemonId: data.id,
    action,
  });
  if (err) {
    return { err };
  }
  await interaction
    .update({
      element: send,
    })
    .then((messageRef) => {
      if (action === "train") {
        return interaction.reply({
          element: {
            content:
              "To train this pokemon, copy the following command. For Mobile users, Long Press -> Copy Text.",
            ephemeral: true,
          },
          messageRef,
        });
      }
      if (action === "item") {
        return createRoot(
          ChangeHeldItem,
          {
            user: incomingInteraction.user,
            pokemonId: data.id,
          },
          incomingInteraction,
          { ttl: 240, defer: false }
        );
      }
      if (action === "form") {
        return createRoot(
          ChangeForm,
          { user: incomingInteraction.user, pokemonId: data.id },
          incomingInteraction,
          { ttl: 240, defer: false }
        );
      }
      if (action === "add") {
        return createRoot(
          PartyManageEntryPoint,
          {
            user: incomingInteraction.user,
            initialPokemon: pokemon,
            initialAction: "add",
          },
          incomingInteraction,
          { ttl: 240, defer: false }
        );
      }
    })
    .then((messageRef) => {
      if (action === "train") {
        return interaction.reply({
          element: {
            content: `/train pokemonid: ${data.id}`,
            ephemeral: true,
          },
          messageRef,
        });
      }
    });
};

module.exports = pokemonActionButton;
