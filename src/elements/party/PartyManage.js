/**
 * Party Manage element for interactive party management
 * @module elements/party/PartyManage
 */
const { ButtonStyle } = require("discord.js");
const {
  useAwaitedMemo,
  useCallbackBinding,
  createElement,
} = require("../../deact/deact");
const useTrainer = require("../../hooks/useTrainer");
const { getPartyPokemons } = require("../../services/party");
const { buildPartyEmbed } = require("../../embeds/battleEmbeds");
const { logger } = require("../../log");
const Button = require("../../deact/elements/Button");

/**
 * Renders a party management interface
 * @param {DeactElement} ref
 * @param {object} props - Element props
 * @param {DiscordUser} props.user - User
 * @returns {Promise<ComposedElements>}
 */
const PartyManage = async (ref, props) => {
  const { user } = props;
  const { trainer, err: trainerErr } = await useTrainer(user, ref);
  if (trainerErr) {
    return { err: trainerErr };
  }
  const { data: pokemons, err: pokemonErr } = await useAwaitedMemo(
    async () => getPartyPokemons(trainer),
    [trainer],
    ref
  );
  if (pokemonErr) {
    return { err: pokemonErr };
  }

  // Create button callbacks
  const addButtonPressedKey = useCallbackBinding(async () => {
    console.log("Add Pokémon button clicked");
  }, ref);
  const moveButtonPressedKey = useCallbackBinding(async () => {
    console.log("Move/Swap button clicked");
  }, ref);
  const removeButtonPressedKey = useCallbackBinding(async () => {
    console.log("Remove Pokémon button clicked");
  }, ref);

  const partyEmbed = buildPartyEmbed(trainer, pokemons, { detailed: true });

  return {
    embeds: [partyEmbed],
    components: [
      [
        createElement(Button, {
          emoji: "🔍",
          label: "Add",
          style: ButtonStyle.Success,
          callbackBindingKey: addButtonPressedKey,
        }),
        createElement(Button, {
          emoji: "🔄",
          label: "Move/Swap",
          style: ButtonStyle.Primary,
          callbackBindingKey: moveButtonPressedKey,
        }),
        createElement(Button, {
          emoji: "✖",
          label: "Remove",
          style: ButtonStyle.Danger,
          callbackBindingKey: removeButtonPressedKey,
        }),
      ],
    ],
  };
};

module.exports = PartyManage;
