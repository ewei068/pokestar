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
const {
  getPartyPokemons,
  canAddOrMovePokemonToParty,
  addOrMovePokemonToParty,
  removePokemonFromParty,
} = require("../../services/party");
const {
  buildPartyEmbed,
  buildAddOrMoveToPartyEmbed,
  buildMoveOrRemoveFromPartyEmbed,
} = require("../../embeds/battleEmbeds");
const Button = require("../../deact/elements/Button");
const FindPokemonFromOption = require("../pokemon/FindPokemonFromOption");
const {
  buildPokemonNameOrIdSearchModal,
} = require("../../modals/pokemonModals");
const PartyButtons = require("./PartyButtons");

// Action states for the party manager
const ACTIONS = {
  DEFAULT: "default",
  ADD: "add",
  MOVE: "move",
  MOVE_TO: "move_to",
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

  const [currentAction, setCurrentAction] = useState(ACTIONS.DEFAULT, ref);
  // @ts-ignore
  const /** @type {[WithId<Pokemon>?, any]} */ [
      selectedPokemon,
      setSelectedPokemon,
    ] = useState(null, ref);
  const [searchOption, setSearchOption] = useState(null, ref);

  const {
    trainer,
    refreshTrainer,
    err: trainerErr,
  } = await useTrainer(user, ref);
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
  const resetState = useCallback(
    async () => {
      await refreshTrainer();
      setCurrentAction(ACTIONS.DEFAULT);
      setSelectedPokemon(null);
      setSearchOption(null);
    },
    [refreshTrainer],
    ref
  );
  const backButtonKey = useCallbackBinding(async () => {
    await resetState();
  }, ref);

  const onPokemonFound = (pokemon) => {
    setSelectedPokemon(pokemon);
    setCurrentAction(ACTIONS.ADD);
  };

  // Render the PartyManage component with all the data and callbacks
  const /** @type {any[]} */ elements = [
      {
        embeds: [buildPartyEmbed(trainer, pokemons, { verbosity: 1 })],
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

  const shouldEnablePartyButton = useCallback(
    (index) => {
      if (currentAction === ACTIONS.ADD || currentAction === ACTIONS.MOVE_TO) {
        return (
          canAddOrMovePokemonToParty(
            trainer.party,
            selectedPokemon?._id?.toString?.(),
            index
          ).err === null
        );
      }
      if (currentAction === ACTIONS.MOVE || currentAction === ACTIONS.REMOVE) {
        return !!trainer.party.pokemonIds[index];
      }
      return false;
    },
    [currentAction, trainer.party, selectedPokemon],
    ref
  );
  const onPartyButtonClick = useCallback(
    async (index) => {
      if (currentAction === ACTIONS.ADD || currentAction === ACTIONS.MOVE_TO) {
        const { err: partyErr } = await addOrMovePokemonToParty(
          user,
          selectedPokemon?._id?.toString?.(),
          index
        );
        if (partyErr) {
          return { err: partyErr };
        }
        return await resetState();
      }
      if (currentAction === ACTIONS.REMOVE) {
        const { err: partyErr } = await removePokemonFromParty(user, index);
        if (partyErr) {
          return { err: partyErr };
        }
        return await resetState();
      }
      if (currentAction === ACTIONS.MOVE) {
        const newSelectedPokemon = pokemons[index];
        if (!newSelectedPokemon) {
          return { err: "Pokemon not found" };
        }
        setSelectedPokemon(newSelectedPokemon);
        setCurrentAction(ACTIONS.MOVE_TO);
      }
      return { err: "Invalid action" };
    },
    [user, selectedPokemon, resetState, currentAction],
    ref
  );
  if (
    currentAction === ACTIONS.ADD ||
    currentAction === ACTIONS.MOVE ||
    currentAction === ACTIONS.MOVE_TO ||
    currentAction === ACTIONS.REMOVE
  ) {
    elements.push(
      createElement(PartyButtons, {
        party: trainer.party,
        partyPokemons: pokemons,
        shouldEnableButton: shouldEnablePartyButton,
        onIndexSelected: onPartyButtonClick,
      })
    );
  }

  const embeds = [];
  const currentPosition = pokemons.findIndex(
    (pokemon) => pokemon?._id?.toString() === selectedPokemon?._id?.toString()
  );
  if (currentAction === ACTIONS.ADD || currentAction === ACTIONS.MOVE_TO) {
    embeds.push(
      buildAddOrMoveToPartyEmbed(
        selectedPokemon,
        currentPosition >= 0 ? currentPosition + 1 : undefined
      )
    );
  } else if (
    currentAction === ACTIONS.MOVE ||
    currentAction === ACTIONS.REMOVE
  ) {
    embeds.push(buildMoveOrRemoveFromPartyEmbed());
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
    embeds,
    components,
  };
};
module.exports = PartyManageEntryPoint;
