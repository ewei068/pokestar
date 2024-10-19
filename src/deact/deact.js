const { DeactInstance } = require("./DeactInstance");
const { getInteractionInstance } = require("./interactions");
/* eslint-disable-next-line no-unused-vars */
const { DeactElement } = require("./DeactElement");
const { getState } = require("../services/state");

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

const createElement = (render, props, { isHidden = false, key }) => ({
  render,
  props,
  isHidden,
  key,
  isDeactCreateElement: true,
});

// TODO: figure out how to remove ref parameter

/**
 * @param {any} interaction
 * @param {any} interactionData
 */
async function triggerBoundCallback(interaction, interactionData) {
  // TODO: lock
  const interactionInstance = getInteractionInstance(interaction);
  if (!interactionInstance) {
    return {
      err: "Error getting interaction instance",
    };
  }

  // get state
  const state = getState(interactionData.stateId);
  if (!state) {
    // TODO: bad?
    await interaction.update({
      components: [],
    });
    return { err: "This interaction has expired." };
  }

  const rootInstance = state.instance;
  if (!state.isDeact || !rootInstance) {
    return { err: "An error has occured." };
  }

  const bindingKey = interactionData.key;
  if (!bindingKey) {
    return { err: "Invalid interaction." };
  }

  // TODO: filtering
  /* if (state.userId && interaction.user.id !== state.userId) {
    return { err: "This interaction was not initiated by you." };
  } */
  await interactionInstance.deferUpdate();

  const res = await rootInstance.triggerCallbackFromKey(
    bindingKey,
    interaction,
    interactionData
  );
  if (res?.err) {
    return res;
  }

  const renderedElement = await rootInstance.renderCurrentElement();
  await interactionInstance.update(renderedElement);
  return renderedElement;
}

/**
 * @param {Function} callback
 * @param {DeactElement} ref
 * @returns {string} binding key of the callback
 */
function useCallbackBinding(callback, ref) {
  ref.callbacks.push(
    async (interaction, interactionData) =>
      // TODO, probably
      await callback(interaction, interactionData)
  );

  return ref.getCallbackKey();
}

/**
 * @param {any} initialValue
 * @param {DeactElement} ref
 */
function useState(initialValue, ref) {
  const index = ref.state.length;
  const value = ref.oldState.length ? ref.oldState[index] : initialValue;
  ref.state.push(value);
  return [
    value,
    (newValue) => {
      if (newValue === ref.state[index]) {
        return;
      }
      // this might be incorrect
      // eslint-disable-next-line no-param-reassign
      ref.state[index] = newValue;
      // eslint-disable-next-line no-param-reassign
      ref.isDoneRendering = false;
    },
  ];
}

module.exports = {
  createRoot,
  createElement,
  triggerBoundCallback,
  useCallbackBinding,
  useState,
};
