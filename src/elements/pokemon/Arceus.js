const { ButtonStyle } = require("discord.js");
const {
  buildPokemonEmbed,
  buildNewPokemonEmbed,
  buildDexListEmbed,
} = require("../../embeds/pokemonEmbeds");
const {
  useAwaitedMemo,
  useCallbackBinding,
  createElement,
  useState,
  useCallback,
  useModalSubmitCallbackBinding,
  createModal,
} = require("../../deact/deact");
const useTrainer = require("../../hooks/useTrainer");
const {
  getArceus,
  onArceusFormSelect,
  canArceusCreatePokemon,
  arceusCreatePokemon,
  arceusCreateItem,
} = require("../../services/mythic");
const { pokemonConfig } = require("../../config/pokemonConfig");
const { arceusMythicConfig } = require("../../config/mythicConfig");
const IdConfigSelectMenu = require("../foundation/IdConfigSelectMenu");
const usePaginationAndSelection = require("../../hooks/usePaginationAndSelection");
const { getInteractionInstance } = require("../../deact/interactions");
const ReturnButton = require("../foundation/ReturnButton");
const Button = require("../../deact/elements/Button");
const { emojis } = require("../../enums/emojis");
const { fuzzyMatchAll } = require("../../utils/utils");
const { buildPokemonSearchModal } = require("../../modals/pokemonModals");
const { getFlattenedRewardsString } = require("../../utils/trainerUtils");
const { backpackItemConfig } = require("../../config/backpackConfig");
const { buildItemListEmbed } = require("../../embeds/shopEmbeds");
const { buildItemSearchModal } = require("../../modals/trainerModals");

const defaultPokemonIds = /** @type {PokemonIdEnum[]} */ (
  Object.keys(pokemonConfig).filter((/** @type {PokemonIdEnum} */ speciesId) =>
    canArceusCreatePokemon(speciesId)
  )
);

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {DiscordUser} param1.user
 * @param {Function} param1.goBack
 * @returns {Promise<ComposedElements>}
 */
const CreatePokemon = async (ref, { user, goBack }) => {
  const [allIds, setAllIds] = useState(defaultPokemonIds, ref);

  const onSelect = useCallback(
    async (interaction, speciesId) => {
      const { data: newPokemon, err: newPokemonErr } =
        await arceusCreatePokemon(user, speciesId);
      if (newPokemonErr) {
        return {
          err: newPokemonErr,
        };
      }

      const interactionInstance = getInteractionInstance(interaction);
      if (interactionInstance) {
        await interactionInstance.reply({
          element: {
            content: newPokemon._id.toString(),
            embeds: [buildNewPokemonEmbed(newPokemon)],
          },
        });
      }

      goBack();
    },
    [user, goBack],
    ref
  );

  const { items, selectMenuElement, scrollButtonsElement, page } =
    usePaginationAndSelection(
      {
        allItems: allIds,
        pageSize: 10,
        initialPage: 1,
        selectionPlaceholder: "Select a Pokemon to create",
        itemConfig: pokemonConfig,
        showId: true,
        selectionCallbackOptions: { defer: true },
        paginationCallbackOptions: { defer: true },
        onSelect,
      },
      ref
    );

  let content = "Select a Pokemon to create";
  if (items.length === 0) {
    content = "No Pokemon found. Try a different search term!";
  }

  const goBackKey = useCallbackBinding(() => {
    goBack();
  }, ref);

  const onSearchKey = useModalSubmitCallbackBinding((interaction) => {
    const search = interaction.fields.getTextInputValue("pokemonSearchInput");
    setAllIds(
      fuzzyMatchAll(defaultPokemonIds, search, (id) => pokemonConfig[id].name)
    );
  }, ref);

  const openSearchModalKey = useCallbackBinding(async (interaction) => {
    await createModal(
      buildPokemonSearchModal,
      {},
      onSearchKey,
      interaction,
      ref
    );
  }, ref);

  return {
    contents: [content],
    embeds: [buildDexListEmbed(items, page)],
    components: [
      selectMenuElement,
      scrollButtonsElement,
      createElement(Button, {
        emoji: "🔍",
        label: "Search",
        style: ButtonStyle.Secondary,
        callbackBindingKey: openSearchModalKey,
      }),
      createElement(ReturnButton, { callbackBindingKey: goBackKey }),
    ],
  };
};

const defaultItems = /** @type {BackpackItemEnum[]} */ (
  Object.keys(backpackItemConfig)
);

const CreateItem = async (ref, { user, goBack }) => {
  const [allItems, setAllItems] = useState(defaultItems, ref);

  const onSelect = useCallback(
    async (interaction, itemId) => {
      const { err } = await arceusCreateItem(user, itemId);
      if (err) {
        return {
          err,
        };
      }

      const interactionInstance = getInteractionInstance(interaction);
      if (interactionInstance) {
        await interactionInstance.reply({
          element: {
            content: getFlattenedRewardsString(
              {
                backpack: {
                  [itemId]: 1,
                },
              },
              true
            ),
          },
        });
      }

      goBack();
    },
    [user, goBack],
    ref
  );

  const { items, selectMenuElement, scrollButtonsElement } =
    usePaginationAndSelection(
      {
        allItems,
        pageSize: 10,
        initialPage: 1,
        selectionPlaceholder: "Select an Item to create",
        itemConfig: backpackItemConfig,
        selectionCallbackOptions: { defer: true },
        paginationCallbackOptions: { defer: false },
        onSelect,
      },
      ref
    );

  let content = "Select an Item to create";
  if (items.length === 0) {
    content = "No Items found. Try a different search term!";
  }

  const onSearchKey = useModalSubmitCallbackBinding((interaction) => {
    const search = interaction.fields.getTextInputValue("itemSearchInput");
    setAllItems(
      fuzzyMatchAll(defaultItems, search, (id) => backpackItemConfig[id].name)
    );
  }, ref);

  const openSearchModalKey = useCallbackBinding(async (interaction) => {
    await createModal(buildItemSearchModal, {}, onSearchKey, interaction, ref);
  }, ref);

  const goBackKey = useCallbackBinding(() => {
    goBack();
  }, ref);

  return {
    contents: [content],
    embeds: [buildItemListEmbed(items)],
    components: [
      selectMenuElement,
      scrollButtonsElement,
      createElement(Button, {
        emoji: "🔍",
        label: "Search",
        style: ButtonStyle.Secondary,
        callbackBindingKey: openSearchModalKey,
      }),
      createElement(ReturnButton, { callbackBindingKey: goBackKey }),
    ],
  };
};

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {DiscordUser} param1.user
 * @returns {Promise<ComposedElements>}
 */
const Arceus = async (ref, { user }) => {
  const [tab, setTab] = useState("default", ref);
  const {
    trainer,
    err: trainerErr,
    refreshTrainer,
  } = await useTrainer(user, ref);
  if (trainerErr) {
    return { err: trainerErr };
  }

  const { data: initialArceus, err: arceusErr } = await useAwaitedMemo(
    async () => getArceus(trainer),
    [],
    ref
  );
  if (arceusErr) {
    return { err: arceusErr };
  }
  const [arceus, setArceus] = useState(initialArceus, ref);

  const onFormSelectKey = useCallbackBinding(async (interaction) => {
    const speciesId = interaction.values[0];
    const { data: newArceus, err: newArceusErr } = await onArceusFormSelect(
      user,
      // @ts-ignore
      speciesId
    );
    if (newArceusErr) {
      return {
        err: newArceusErr,
      };
    }
    setArceus(newArceus);
  }, ref);

  // form change select menu
  const formSelectMenu = createElement(IdConfigSelectMenu, {
    ids: arceusMythicConfig.speciesIds,
    config: pokemonConfig,
    placeholder: "Select a form",
    callbackBindingKey: onFormSelectKey,
    showId: true,
  });

  const goBack = useCallback(
    async () => {
      setTab("default");
      await refreshTrainer();
    },
    [setTab, refreshTrainer],
    ref
  );

  const changeTabKey = useCallbackBinding(
    (_interaction, data) => {
      const { tab: tabPressed } = data;
      setTab(tabPressed);
    },
    ref,
    { defer: false }
  );

  if (tab === "create") {
    return {
      elements: [createElement(CreatePokemon, { user, goBack })],
    };
  }
  if (tab === "createItem") {
    return {
      elements: [createElement(CreateItem, { user, goBack })],
    };
  }

  return {
    contents: [arceus._id.toString()],
    embeds: [buildPokemonEmbed(user, arceus, "info")],
    components: [
      formSelectMenu,
      [
        createElement(Button, {
          label: "Create Pokemon",
          style: ButtonStyle.Secondary,
          callbackBindingKey: changeTabKey,
          data: { tab: "create" },
          emoji: emojis.PIKACHU,
          disabled: trainer.usedCreation,
        }),
        createElement(Button, {
          label: "Create Item",
          style: ButtonStyle.Secondary,
          callbackBindingKey: changeTabKey,
          data: { tab: "createItem" },
          emoji: emojis.MASTERBALL,
          disabled: trainer.usedCreation,
        }),
      ],
    ],
  };
};

module.exports = Arceus;
