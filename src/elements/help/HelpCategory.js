const {
  createElement,
  useMemo,
  useCallbackBinding,
} = require("../../deact/deact");
const usePaginationAndSelection = require("../../hooks/usePaginationAndSelection");
const {
  commandCategoryConfig,
  commandConfig,
} = require("../../config/commandConfig");
const { buildHelpCategoryEmbed } = require("../../embeds/helpEmbeds");
const ReturnButton = require("../foundation/ReturnButton");
const HelpCommand = require("./HelpCommand");

const PAGE_SIZE = 10;

/**
 *
 * @param {import("../../deact/DeactElement").DeactElement} ref
 * @param {object} param1
 * @param {CommandCategoryEnum} param1.commandCategory
 * @param {((category: CommandCategoryEnum) => void)=} param1.setCommandCategory
 * @param {number=} param1.initialPage
 * @param {string=} param1.initialCommand
 * @returns {Promise<any>}
 */
module.exports = async (
  ref,
  {
    commandCategory,
    setCommandCategory,
    initialPage = 1,
    initialCommand = null,
  }
) => {
  const commandCategoryData = commandCategoryConfig[commandCategory];
  const categoryCommands = useMemo(
    () =>
      commandCategoryData.commands.filter((command) =>
        commandConfig[command].stages.includes(process.env.STAGE)
      ),
    [],
    ref
  ); // readonly
  // TODO: parse beforehand and error gracefully?
  // TODO:
  // intial command handling
  /* const { initialSpeciesIdFound, err } = useMemo(
    () => {
      let initialSpeciesId = initialSpeciesIdOrName;
      if (
        initialSpeciesIdOrName !== null &&
        pokemonConfig[initialSpeciesIdOrName] === undefined
      ) {
        // if ID undefined, check all species for name match
        const selectedSpeciesId = allIds.find(
          (foundSpeciesId) =>
            pokemonConfig[foundSpeciesId].name.toLowerCase() ===
            initialSpeciesIdOrName.toLowerCase()
        );
        if (selectedSpeciesId) {
          initialSpeciesId = selectedSpeciesId;
        } else {
          return {
            initialSpeciesIdFound: null,
            err: "Invalid Pokemon species or Pokemon not added yet!",
          };
        }
      }

      return { initialSpeciesIdFound: initialSpeciesId, err: null };
    },
    [],
    ref
  );
  if (err) {
    return {
      err,
    };
  } */

  const {
    items: commands,
    currentItem: command,
    setItem: setCommand,
    scrollButtonsElement,
    selectMenuElement,
  } = usePaginationAndSelection(
    {
      allItems: categoryCommands,
      pageSize: PAGE_SIZE,
      initialPage,
      // initialItem: initialCategory,
      selectionPlaceholder: "Select a command:",
      itemConfig: commandConfig,
      showId: false,
      selectionCallbackOptions: { defer: false },
      paginationCallbackOptions: { defer: false },
    },
    ref
  );
  const returnActionBindng = useCallbackBinding(
    () => {
      setCommandCategory?.(null);
    },
    ref,
    { defer: false }
  );

  if (command) {
    return {
      elements: [
        createElement(HelpCommand, {
          command,
          categoryCommands,
          setCommand,
        }),
      ],
    };
  }
  return {
    elements: [
      {
        content: "",
        embeds: [buildHelpCategoryEmbed(commandCategory, commands)],
      },
    ],
    components: [
      scrollButtonsElement,
      selectMenuElement,
      createElement(ReturnButton, { callbackBindingKey: returnActionBindng }),
    ],
  };
};
