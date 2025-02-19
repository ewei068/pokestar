const { ButtonStyle } = require("discord.js");
const { useCallbackBinding, createElement } = require("../../deact/deact");
const Button = require("../../deact/elements/Button");
const ReturnButton = require("../foundation/ReturnButton");
const { canCraftItem, craftItem } = require("../../services/shop");
const { buildCraftItemEmbed } = require("../../embeds/shopEmbeds");
const { craftableItemConfig } = require("../../config/backpackConfig");
const { getInteractionInstance } = require("../../deact/interactions");
const { formatItemQuantity } = require("../../utils/itemUtils");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {Trainer} param1.trainer
 * @param {CraftableItemEnum} param1.itemId
 * @param {() => Promise<{ err?: string }>} param1.refreshTrainer
 * @param {(CraftableItemEnum) => any} param1.setItemId
 */
const CraftItem = async (
  ref,
  { trainer, itemId, refreshTrainer, setItemId }
) => {
  const itemData = craftableItemConfig[itemId];
  const canCraftOne = !canCraftItem(trainer, itemId).err;
  const canCraftTen = !canCraftItem(trainer, itemId, 10).err;

  const craftButtonBinding = useCallbackBinding(
    async (interaction, data) => {
      const interactionInstance = getInteractionInstance(interaction);
      const { quantity } = data;
      if (!quantity) {
        return { err: "Invalid quantity" };
      }

      const { err } = await craftItem(trainer.user, itemId, quantity);
      await refreshTrainer().then(async () => {
        if (err) {
          await interactionInstance.reply({
            element: {
              content: err,
              ephemeral: true,
            },
          });
        } else {
          await interactionInstance.reply({
            element: {
              content: `You crafted ${formatItemQuantity(itemId, quantity)}!`,
            },
          });
        }
      });
    },
    ref,
    { defer: false }
  );
  const returnActionBindng = useCallbackBinding(
    () => {
      setItemId?.(null);
    },
    ref,
    { defer: false }
  );

  return {
    elements: [
      {
        content: "",
        embeds: [buildCraftItemEmbed(trainer, itemId)],
      },
    ],
    components: [
      [
        createElement(Button, {
          label: "Craft 1",
          style:
            canCraftOne && !canCraftTen
              ? ButtonStyle.Primary
              : ButtonStyle.Secondary,
          callbackBindingKey: craftButtonBinding,
          disabled: !canCraftOne,
          data: { quantity: 1 },
          emoji: itemData.emoji,
        }),
        createElement(Button, {
          label: "Craft 10",
          callbackBindingKey: craftButtonBinding,
          disabled: !canCraftTen,
          data: { quantity: 10 },
          emoji: itemData.emoji,
        }),
      ],
      [createElement(ReturnButton, { callbackBindingKey: returnActionBindng })],
    ],
  };
};

module.exports = CraftItem;
