const { ButtonStyle } = require("discord.js");
const {
  createElement,
  useCallbackBinding,
  useAwaitedMemo,
} = require("../../deact/deact");
const Button = require("../../deact/elements/Button");
const StringSelectMenu = require("../../deact/elements/StringSelectMenu");
const { leaderboardConfig } = require("../../config/socialConfig");
const { getLeaderboard } = require("../../services/social");
const { buildLeaderboardEmbed } = require("../../embeds/socialEmbeds");
const { useState } = require("../../deact/deact");

/**
 * Displays a leaderboard with scope and category selection controls.
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {string} param1.initialCategory Initial category to display.
 * @param {string} param1.initialScope Initial scope to display (global or server).
 * @param {object} param1.guild Guild object for server-scoped leaderboards.
 */
const Leaderboard = async (ref, { initialCategory, initialScope, guild }) => {
  if (!leaderboardConfig[initialCategory]) {
    return {
      err: `Invalid leaderboard category. Valid categories are: ${Object.keys(
        leaderboardConfig
      ).join(", ")}`,
    };
  }
  const [category, setCategory] = useState(initialCategory, ref);
  const [scope, setScope] = useState(initialScope, ref);

  const handleScopeChangeKey = useCallbackBinding((_interaction, data) => {
    setScope(data.scope);
  }, ref);

  const handleCategoryChangeKey = useCallbackBinding((interaction) => {
    const selectedCategory = interaction.values[0];
    if (!leaderboardConfig[selectedCategory]) {
      return { err: "Invalid category selected" };
    }
    setCategory(selectedCategory);
  }, ref);

  const categoryData = leaderboardConfig[category];
  const leaderboardResult = await useAwaitedMemo(
    async () => {
      let subset = null;
      if (scope === "server") {
        const members = await guild.members.cache;
        subset = members.map((member) => member.user.id);
      }

      return await getLeaderboard(categoryData, subset);
    },
    [scope, category],
    ref
  );
  if (leaderboardResult.err) {
    return {
      content: `Error: ${leaderboardResult.err}`,
      components: [],
    };
  }

  const embed = buildLeaderboardEmbed(
    leaderboardResult.data,
    categoryData,
    scope
  );

  // Create select menu options for categories
  const categoryOptions = Object.entries(leaderboardConfig).map(
    ([key, value]) => ({
      label: value.name,
      value: key,
      default: key === category,
    })
  );

  // First action row: scope toggle buttons
  const scopeButtons = [
    createElement(Button, {
      label: "Global",
      style: scope === "global" ? ButtonStyle.Primary : ButtonStyle.Secondary,
      callbackBindingKey: handleScopeChangeKey,
      disabled: scope === "global",
      data: { scope: "global" },
    }),
    createElement(Button, {
      label: "Server",
      style: scope === "server" ? ButtonStyle.Primary : ButtonStyle.Secondary,
      callbackBindingKey: handleScopeChangeKey,
      disabled: scope === "server",
      data: { scope: "server" },
    }),
  ];

  // Second action row: category select menu
  const categorySelect = createElement(StringSelectMenu, {
    placeholder: "Select Leaderboard Type",
    options: categoryOptions,
    callbackBindingKey: handleCategoryChangeKey,
    data: {},
  });

  return {
    contents: [""],
    embeds: [embed],
    components: [scopeButtons, categorySelect],
  };
};

module.exports = Leaderboard;
