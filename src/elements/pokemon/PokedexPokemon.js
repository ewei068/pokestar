const { buildSpeciesDexEmbed } = require("../../embeds/pokemonEmbeds");
const { pokemonConfig } = require("../../config/pokemonConfig");
const { getPokemonOwnershipStats } = require("../../services/pokemon");
const {
  useCallbackBinding,
  useState,
  createElement,
  useAwaitedMemo,
  useMemo,
} = require("../../deact/deact");
const Button = require("../../deact/elements/Button");
const { getPokemonOrder } = require("../../utils/pokemonUtils");
const ReturnButton = require("../foundation/ReturnButton");
const useSingleItemScroll = require("../../hooks/useSingleItemScroll");

module.exports = async (
  ref,
  { speciesId, initialTab = "info", setSpeciesId }
) => {
  const allIds = useMemo(getPokemonOrder, [], ref);
  const [tab, setTab] = useState(initialTab, ref);
  const speciesData = pokemonConfig[speciesId];
  const ownershipData = await useAwaitedMemo(
    () => getPokemonOwnershipStats(speciesId),
    [speciesId],
    ref
  );

  const tabButtonPressedKey = useCallbackBinding(
    (_interaction, data) => {
      const { tab: tabPressed } = data;
      setTab(tabPressed);
    },
    ref,
    { defer: false }
  );
  const { scrollButtonsElement } = useSingleItemScroll(
    {
      allItems: allIds,
      itemOverride: speciesId,
      setItemOverride: setSpeciesId,
      callbackOptions: { defer: true },
    },
    ref
  );
  const returnActionBindng = useCallbackBinding(
    () => {
      setSpeciesId?.(null);
    },
    ref,
    { defer: false }
  );

  return {
    elements: [
      {
        content: "",
        embeds: [
          buildSpeciesDexEmbed(speciesId, speciesData, tab, ownershipData.data),
        ],
      },
    ],
    components: [
      [
        createElement(Button, {
          label: "Info",
          disabled: tab === "info",
          callbackBindingKey: tabButtonPressedKey,
          data: { tab: "info" },
        }),
        createElement(Button, {
          label: "Growth",
          disabled: tab === "growth",
          callbackBindingKey: tabButtonPressedKey,
          data: { tab: "growth" },
        }),
        createElement(Button, {
          label: "Moves",
          disabled: tab === "moves",
          callbackBindingKey: tabButtonPressedKey,
          data: { tab: "moves" },
        }),
        createElement(Button, {
          label: "Abilities",
          disabled: tab === "abilities",
          callbackBindingKey: tabButtonPressedKey,
          data: { tab: "abilities" },
        }),
        createElement(Button, {
          label: "Rarity",
          disabled: tab === "rarity",
          callbackBindingKey: tabButtonPressedKey,
          data: { tab: "rarity" },
        }),
      ],
      scrollButtonsElement,
      createElement(ReturnButton, { callbackBindingKey: returnActionBindng }),
    ],
  };
};
