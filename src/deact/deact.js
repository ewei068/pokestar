const { DeactInstance } = require("./DeactInstance");
const { getInteractionInstance } = require("./interactions");
/* eslint-disable-next-line no-unused-vars */
const { DeactElement } = require("./DeactElement");

const createInstance = async (
  render,
  props,
  interaction,
  { defer = true, ttl }
) => {
  const interactionInstance = getInteractionInstance(interaction);
  if (!interactionInstance) {
    return {
      err: "Error getting interaction instance",
    };
  }
  const instance = new DeactInstance(render, props, { ttl });
  if (defer) {
    await interactionInstance.deferReply();
  }
  const renderedElement = await instance.renderCurrentElement();
  await interactionInstance.reply(renderedElement);
  return renderedElement;
};

/**
 * @callback forceUpdateType
 * @this {DeactElement}
 * @param {any} interaction // TODO
 * @param {object} root0
 * @param {boolean} root0.defer
 */

/**
 * @type {forceUpdateType}
 */
async function forceUpdate(interaction, { defer = true }) {
  const instance = this.parentInstance;
  const interactionInstance = getInteractionInstance(interaction);
  if (!interactionInstance) {
    return {
      err: "Error getting interaction instance",
    };
  }
  if (defer) {
    await interactionInstance.deferUpdate();
  }
  const renderedElement = await instance.renderCurrentElement();
  await interactionInstance.update(renderedElement);
  return renderedElement;
}

/**
 * @callback useCallbackBindingType
 * @this {DeactElement}
 * @param {Function} callback
 * @returns
 */

/**
 * @type {useCallbackBindingType}
 * @param {Function} callback
 * @returns {number} binding index of the callback
 */
function useCallbackBinding(callback) {
  this.callbacks.push(
    async (interaction, data) =>
      // TODO, probably
      await callback(interaction, data)
  );

  return this.callbacks.length - 1;
}

module.exports = {
  createInstance,
  forceUpdate,
  useCallbackBinding,
};
