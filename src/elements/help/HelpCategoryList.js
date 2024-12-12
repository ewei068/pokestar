const { createElement, useMemo } = require("../../deact/deact");
const usePaginationAndSelection = require("../../hooks/usePaginationAndSelection");
const {
  commandCategoryConfig,
  commandConfig,
} = require("../../config/commandConfig");
const { buildHelpEmbed } = require("../../embeds/helpEmbeds");
const HelpCategory = require("./HelpCategory");

const PAGE_SIZE = 10;

/**
 *
 * @param {import("../../deact/DeactElement").DeactElement} ref
 * @param {object} param1
 * @param {number=} param1.initialPage
 * @param {string=} param1.initialCommand
 * @returns {Promise<any>}
 */
module.exports = async (ref, { initialPage = 1, initialCommand = null }) => {
  const allCategories = useMemo(
    () => Object.keys(commandCategoryConfig),
    [],
    ref
  ); // readonly
  // TODO: parse beforehand and error gracefully?
  // Parse intial category from initial command
  // Pass in initial command as props
  const { initialCategoryFound, initialCommandFound, err } = useMemo(
    () => {
      const providedCommand = initialCommand;
      // search through command config for alias
      for (const commandName in commandConfig) {
        const commandData = commandConfig[commandName];
        if (
          commandData.aliases.includes(providedCommand) &&
          commandData.stages.includes(process.env.STAGE)
        ) {
          // attempt to find category
          for (const category in commandCategoryConfig) {
            if (
              commandCategoryConfig[category].commands.includes(commandName)
            ) {
              return {
                initialCategoryFound: category,
                initialCommandFound: providedCommand,
                err: null,
              };
            }
          }
        }
      }

      return { err: "Invalid command." };
    },
    [],
    ref
  );
  if (err) {
    return {
      err,
    };
  }

  const {
    items: commandCategories,
    currentItem: commandCategory,
    setItem: setCommandCategory,
    scrollButtonsElement,
    selectMenuElement,
  } = usePaginationAndSelection(
    {
      allItems: allCategories,
      pageSize: PAGE_SIZE,
      initialPage,
      initialItem: initialCategoryFound,
      selectionPlaceholder: "Select a command category:",
      itemConfig: commandCategoryConfig,
      showId: false,
      selectionCallbackOptions: { defer: false },
      paginationCallbackOptions: { defer: false },
    },
    ref
  );

  if (commandCategory) {
    return {
      elements: [
        createElement(HelpCategory, {
          initialCommand: initialCommandFound,
          // @ts-ignore
          commandCategory,
          setCommandCategory,
        }),
      ],
    };
  }
  return {
    elements: [
      {
        content: "",
        embeds: [buildHelpEmbed(commandCategories)],
      },
    ],
    components: [scrollButtonsElement, selectMenuElement],
  };
};
