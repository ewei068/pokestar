const { DeactInstance } = require("./DeactInstance");
const { getInteractionInstance } = require("./interactions");
/* eslint-disable-next-line no-unused-vars */
const { DeactElement } = require("./DeactElement");

/**
 * @param {Function} render
 * @param {any} interaction
 * @param {any} props
 * @param {object} param3
 * @param {boolean=} param3.defer
 * @param {number=} param3.ttl
 * @returns {Promise<any>}
 */
const createRoot = async (
  render,
  interaction,
  props,
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
 * @param {Function} callback
 * @param {DeactElement} ref
 * @returns {string} binding key of the callback
 */
function useCallbackBinding(callback, ref) {
  ref.callbacks.push(
    async (interaction, data) =>
      // TODO, probably
      await callback(interaction, data)
  );

  return ref.getCallbackKey();
}

module.exports = {
  createRoot,
  useCallbackBinding,
};
