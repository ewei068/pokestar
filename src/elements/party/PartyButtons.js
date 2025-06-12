/**
 * Party Buttons element for displaying a grid of party Pokémon as buttons
 * @module elements/party/PartyButtons
 */
const { ButtonStyle } = require("discord.js");
const { createElement, useCallbackBinding } = require("../../deact/deact");
const Button = require("../../deact/elements/Button");
const { buildPokemonEmojiString } = require("../../utils/pokemonUtils");

/**
 * Renders a grid of buttons representing the party slots
 * @param {DeactElement} ref
 * @param {object} props - Element props
 * @param {PartyInfo} props.party - Party configuration with rows and columns
 * @param {WithId<Pokemon>[]} props.partyPokemons - Array of Pokémon in party
 * @param {Function=} props.onSlotSelected - Callback when a party slot is selected
 * @param {Function=} [props.shouldEnableButton] - Function to determine if a button should be enabled
 * @returns {Promise<ComposedElements>}
 */
const PartyButtons = async (
  ref,
  { party, partyPokemons, onSlotSelected, shouldEnableButton = () => true }
) => {
  const { rows, cols } = party;

  // Create components array for each row
  const components = [];

  // Create callback for this button
  const callbackKey = useCallbackBinding(async (interaction, data) => {
    await onSlotSelected(data.index);
  }, ref);

  // Loop through each row
  for (let row = 0; row < rows; row += 1) {
    const rowButtons = [];

    // Loop through each column in this row
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;
      const pokemon = partyPokemons[index];
      const position = index + 1; // 1-indexed position

      // Button label and emoji
      const label = `${position}`;
      const emoji = pokemon ? buildPokemonEmojiString(pokemon) : "";
      const isEnabled = shouldEnableButton(index);

      // Create button
      rowButtons.push(
        createElement(Button, {
          label,
          emoji,
          style: isEnabled ? ButtonStyle.Primary : ButtonStyle.Secondary,
          disabled: !isEnabled,
          callbackBindingKey: callbackKey,
          data: { index },
        })
      );
    }

    // Add row to components
    components.push(rowButtons);
  }

  return {
    components,
  };
};

module.exports = PartyButtons;
