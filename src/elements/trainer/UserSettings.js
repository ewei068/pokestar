// TODO: generalze this component to be used for all settings?

const {
  useMemo,
  useState,
  useAwaitedEffect,
  useCallbackBinding,
  createElement,
} = require("../../deact/deact");
const usePaginationAndSelection = require("../../hooks/usePaginationAndSelection");
const { userSettingsConfig } = require("../../config/trainerConfig");
const { buildSettingsListEmbed } = require("../../embeds/settingsEmbeds");
const { getUserSettings, setUserSetting } = require("../../services/trainer");
const SettingsSelection = require("./SettingsSelection");
const { logger } = require("../../log");

const PAGE_SIZE = 10;

/**
 * @param {import("../../deact/DeactElement").DeactElement} ref
 * @param {object} param1
 * @param {DiscordUser} param1.user
 * @param {number=} param1.initialPage
 */
module.exports = async (ref, { user, initialPage = 1 }) => {
  const allSettings = /** @type {UserSettingsEnum[]} */ (
    useMemo(() => Object.keys(userSettingsConfig), [], ref)
  );
  const [userSettings, setUserSettings] = useState({}, ref);
  const [userSettingsErr, setUserSettingsErr] = useState(null, ref);

  const fetchUserSettings = async () => {
    await getUserSettings(user)
      .then((settingsRes) => {
        setUserSettings(settingsRes.data);
        setUserSettingsErr(settingsRes.err);
      })
      .catch((err) => {
        logger.error(err);
        setUserSettingsErr("Error fetching settings.");
      });
  };
  await useAwaitedEffect(fetchUserSettings, [], ref);

  const {
    page,
    items: settings,
    currentItem: selectedSetting,
    scrollButtonsElement,
    selectMenuElement,
  } = usePaginationAndSelection(
    {
      allItems: allSettings,
      pageSize: PAGE_SIZE,
      initialPage,
      selectionPlaceholder: "Select a setting:",
      useCurrentItemDefault: true,
      itemConfig: userSettingsConfig,
      showId: false,
      selectionCallbackOptions: { defer: false },
      paginationCallbackOptions: { defer: false },
    },
    ref
  );

  const onSettingEditBindingKey = useCallbackBinding(
    async (_interaction, data) => {
      await setUserSetting(user, selectedSetting, data.value)
        .then((updateRes) => {
          if (updateRes.err) {
            setUserSettingsErr(updateRes.err);
          } else {
            return fetchUserSettings();
          }
        })
        .catch((err) => {
          logger.error(err);
          setUserSettingsErr("Error updating settings.");
        });
    },
    ref,
    { defer: false }
  );

  return {
    elements: [
      {
        content: userSettingsErr || "",
        // @ts-ignore
        embeds: [
          buildSettingsListEmbed({
            settings,
            selectedSetting,
            userSettings,
            settingsConfig: userSettingsConfig,
            page,
          }),
        ],
      },
    ],
    components: [
      scrollButtonsElement,
      userSettingsErr ? [] : selectMenuElement,
      userSettingsErr || !selectedSetting
        ? []
        : createElement(SettingsSelection, {
            setting: selectedSetting,
            settingsConfig: userSettingsConfig,
            currentSettings: userSettings,
            callbackBindingKey: onSettingEditBindingKey,
          }),
    ],
  };
};
