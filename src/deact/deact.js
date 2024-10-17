const { DeactInstance } = require("./DeactInstance");
const { getInteractionInstance } = require("./interactions");
/* eslint-disable-next-line no-unused-vars */
const { DeactElement } = require("./DeactElement");

/**
 * @param {Function} render
 * @param {any} props
 * @param {any} interaction
 * @param {object} param3
 * @param {boolean=} param3.defer
 * @param {number=} param3.ttl
 * @returns
 */
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

// TODO: figure out how to remove ref parameter

/**
 * @param {any} interaction // TODO
 * @param {DeactElement} ref
 * @param {object} root0
 * @param {boolean} root0.defer
 */
async function forceUpdate(interaction, ref, { defer = true }) {
  const instance = ref.parentInstance;
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
 * @param {Function} callback
 * @param {DeactElement} ref
 * @returns {number} binding index of the callback
 */
function useCallbackBinding(callback, ref) {
  ref.callbacks.push(
    async (interaction, data) =>
      // TODO, probably
      await callback(interaction, data)
  );

  return ref.callbacks.length - 1;
}

module.exports = {
  createInstance,
  forceUpdate,
  useCallbackBinding,
};
