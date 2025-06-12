/**
 * Party Manage element for interactive party management
 * @module elements/party/PartyManage
 */
const { ButtonStyle } = require("discord.js");
const {
  useAwaitedMemo,
  useCallbackBinding,
  createElement,
  useState,
  createModal,
  useModalSubmitCallbackBinding,
  useCallback,
} = require("../../deact/deact");
const useTrainer = require("../../hooks/useTrainer");
const { getPartyPokemons } = require("../../services/party");
const { buildPartyEmbed } = require("../../embeds/battleEmbeds");
const Button = require("../../deact/elements/Button");
const FindPokemonFromOption = require("../pokemon/FindPokemonFromOption");
const {
  buildPokemonNameOrIdSearchModal,
} = require("../../modals/pokemonModals");

// Action states for the party manager
const ACTIONS = {
  DEFAULT: "default",
  ADD: "add",
  MOVE: "move",
  REMOVE: "remove",
  SEARCH: "search",
};

/**
 * Renders the party management UI
 * @param {DeactElement} ref
 * @param {object} props - Element props
 * @param {(action: string, interaction: any) => void} props.onActionSelected - Action selection handler
 * @returns {Promise<ComposedElements>}
 */
const PartyManageButtons = async (ref, { onActionSelected }) => {
  // Create button callbacks
  const addButtonKey = useCallbackBinding(async (interaction) => {
    await onActionSelected(ACTIONS.ADD, interaction);
  }, ref);
  const moveButtonKey = useCallbackBinding(async (interaction) => {
    await onActionSelected(ACTIONS.MOVE, interaction);
  }, ref);
  const removeButtonKey = useCallbackBinding(async (interaction) => {
    await onActionSelected(ACTIONS.REMOVE, interaction);
  }, ref);

  const actionButtons = [
    createElement(Button, {
      label: "Add",
      emoji: "🔍",
      style: ButtonStyle.Success,
      callbackBindingKey: addButtonKey,
    }),
    createElement(Button, {
      label: "Move/Swap",
      emoji: "🔄",
      style: ButtonStyle.Primary,
      callbackBindingKey: moveButtonKey,
    }),
    createElement(Button, {
      label: "Remove",
      emoji: "✖",
      style: ButtonStyle.Danger,
      callbackBindingKey: removeButtonKey,
    }),
  ];

  return {
    components: [actionButtons],
  };
};

/**
 * Entry point for party management, handles data fetching and state
 * @param {DeactElement} ref
 * @param {object} props - Element props
 * @param {DiscordUser} props.user - User
 * @returns {Promise<ComposedElements>}
 */
const PartyManageEntryPoint = async (ref, props) => {
  const { user } = props;

  // State management
  const [currentAction, setCurrentAction] = useState(ACTIONS.DEFAULT, ref);
  const [selectedPokemon, setSelectedPokemon] = useState(null, ref);
  const [searchOption, setSearchOption] = useState(null, ref);

  // Get trainer data
  const { trainer, err: trainerErr } = await useTrainer(user, ref);
  if (trainerErr) {
    return { err: trainerErr };
  }

  // Get party Pokemon
  const { data: pokemons, err: pokemonErr } = await useAwaitedMemo(
    async () => getPartyPokemons(trainer),
    [trainer],
    ref
  );
  if (pokemonErr) {
    return { err: pokemonErr };
  }

  // Pokemon ID search modal submission handler
  const searchSubmittedActionBinding = useModalSubmitCallbackBinding(
    async (interaction) => {
      const pokemonSearchInput =
        interaction.fields.getTextInputValue("pokemonSearchInput");
      setSearchOption(pokemonSearchInput);
      setCurrentAction(ACTIONS.SEARCH);
    },
    ref
  );

  // Handle action selection (Add/Move/Remove)
  const handleActionSelected = useCallback(
    async (action, interaction) => {
      if (action === ACTIONS.ADD) {
        await createModal(
          buildPokemonNameOrIdSearchModal,
          {},
          searchSubmittedActionBinding,
          interaction,
          ref
        );
      } else {
        setCurrentAction(action);
      }
    },
    [searchSubmittedActionBinding],
    ref
  );

  // Back button handler
  const backButtonKey = useCallbackBinding(async () => {
    setCurrentAction(ACTIONS.DEFAULT);
    setSelectedPokemon(null);
    setSearchOption(null);
  }, ref);

  // Handler for when a Pokemon is found
  const onPokemonFound = (pokemon) => {
    setSelectedPokemon(pokemon);
    setCurrentAction(ACTIONS.ADD);
  };

  // Render the PartyManage component with all the data and callbacks
  const /** @type {any[]} */ elements = [
      {
        embeds: [buildPartyEmbed(trainer, pokemons, { detailed: true })],
      },
    ];
  const components = [];
  if (currentAction === ACTIONS.SEARCH) {
    elements.push(
      createElement(FindPokemonFromOption, {
        user,
        onPokemonFound,
        option: searchOption,
      })
    );
  }
  if (currentAction === ACTIONS.DEFAULT) {
    elements.push(
      createElement(PartyManageButtons, {
        onActionSelected: handleActionSelected,
      })
    );
  } else {
    components.push(
      createElement(Button, {
        label: "Back",
        style: ButtonStyle.Secondary,
        callbackBindingKey: backButtonKey,
      })
    );
  }
  return {
    elements,
    components,
  };
};
module.exports = PartyManageEntryPoint;
