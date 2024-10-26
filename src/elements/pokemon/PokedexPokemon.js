const { buildSpeciesDexEmbed } = require("../../embeds/pokemonEmbeds");
const { pokemonConfig } = require("../../config/pokemonConfig");
const { getPokemonOwnershipStats } = require("../../services/pokemon");
const {
  useCallbackBinding,
  useState,
  createElement,
  useAwaitedMemo,
} = require("../../deact/deact");
const Button = require("../../deact/elements/Button");

module.exports = async (ref, { speciesId, initialTab = "info" }) => {
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
    ],
  };
};
