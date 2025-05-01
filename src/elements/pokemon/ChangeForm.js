const { ButtonStyle } = require("discord.js");
const { pokemonConfig } = require("../../config/pokemonConfig");
const {
  useCallbackBinding,
  useState,
  createElement,
} = require("../../deact/deact");
const Button = require("../../deact/elements/Button");
const { buildPokemonEmbed } = require("../../embeds/pokemonEmbeds");
const useTrainer = require("../../hooks/useTrainer");
const {
  buildPokemonNameString,
  getAvailableForms,
  getFormChangeCost,
} = require("../../utils/pokemonUtils");
const { formatMoney } = require("../../utils/utils");
const {
  canChangeForm,
  changeForm,
  transformPokemon,
} = require("../../services/pokemon");
const usePokemon = require("../../hooks/usePokemon");
const useSelection = require("../../hooks/useSelection");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {CompactUser} param1.user
 * @param {string} param1.pokemonId
 */
const ChangeForm = async (ref, { user, pokemonId }) => {
  // Get trainer data
  const {
    trainer,
    err: trainerErr,
    refreshTrainer,
  } = await useTrainer(user, ref);
  if (trainerErr) {
    return {
      err: trainerErr,
    };
  }

  // Get pokemon data
  const {
    pokemon,
    err: pokemonErr,
    setPokemon,
    refreshPokemon,
  } = await usePokemon(pokemonId, user.id, ref);
  if (pokemonErr) {
    return {
      err: pokemonErr,
    };
  }

  // Get available forms for this Pokemon
  const availableForms = getAvailableForms(pokemon.speciesId);
  if (availableForms.length === 0) {
    return {
      err: `${pokemon.name} cannot change form!`,
    };
  }

  const {
    currentItem: selectedFormId,
    setItem: setSelectedFormId,
    selectMenuElement,
  } = useSelection(
    {
      items: availableForms,
      initialItem: pokemon.speciesId,
      selectionPlaceholder: "Select a form to change to",
      showId: true,
      useCurrentItemDefault: true,
      itemConfig: pokemonConfig,
      callbackOptions: {
        defer: false,
      },
    },
    ref
  );
  // State for error/success messages
  const [message, setMessage] = useState(null, ref);

  // Transform pokemon temporarily to show preview
  let previewPokemon = pokemon;
  if (selectedFormId) {
    previewPokemon = transformPokemon(pokemon, selectedFormId);
  }

  const canChange = selectedFormId
    ? canChangeForm(pokemon, selectedFormId, trainer).canChange
    : false;
  const cost = getFormChangeCost(pokemon.speciesId);

  // Handle form change confirmation
  const confirmFormChangeKey = useCallbackBinding(async () => {
    if (!selectedFormId) {
      setMessage("Please select a form first!");
      return;
    }

    try {
      const result = await changeForm(user, pokemonId, selectedFormId);
      if (result.err) {
        setMessage(`Error: ${result.err}`);
        await refreshTrainer();
        await refreshPokemon();
      } else {
        const newPokemon = result.data;
        setPokemon(newPokemon);
        await refreshTrainer();
        setMessage(
          `Successfully changed ${pokemon.name} to ${pokemonConfig[selectedFormId].name} form!`
        );
        setSelectedFormId(null);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      await refreshTrainer();
      await refreshPokemon();
    }
  }, ref);

  // Default content when no form is selected
  const defaultContent = `**${buildPokemonNameString(
    pokemon
  )}** can change forms! Select a form to preview.`;

  // Content when a form is selected
  const selectedContent = selectedFormId
    ? `Changing ${buildPokemonNameString(pokemon)} to **${
        pokemonConfig[selectedFormId].name
      }** form will cost ${formatMoney(cost)}.`
    : null;

  return {
    contents: [message || selectedContent || defaultContent],
    embeds: [buildPokemonEmbed(user, previewPokemon, "all")],
    components: [selectMenuElement].concat(
      selectedFormId
        ? [
            createElement(Button, {
              label: `Change Form (${formatMoney(cost)})`,
              style: ButtonStyle.Primary,
              callbackBindingKey: confirmFormChangeKey,
              disabled: !canChange || !selectedFormId,
              emoji: "🔄",
            }),
          ]
        : []
    ),
  };
};

module.exports = ChangeForm;
