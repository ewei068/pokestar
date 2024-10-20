const { DeactInstance } = require("./DeactInstance");
const { getInteractionInstance } = require("./interactions");
/* eslint-disable-next-line no-unused-vars */
const { DeactElement } = require("./DeactElement");
const { getState } = require("../services/state");

/**
 * @template T
 * @param {DeactElementFunction<T>} render
 * @param {any} interaction
 * @param {T} props
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
    instance.messageRef = await interactionInstance.deferReply();
  }
  const renderedElement = await instance.renderCurrentElement();
  instance.messageRef = await interactionInstance.reply(renderedElement);
  return renderedElement;
};

/**
 * @template T
 * @param {DeactElementFunction<T>} render
 * @param {T} props
 * @param {object} param2
 * @param {boolean=} param2.isHidden
 * @param {string=} param2.key
 */
const createElement = (
  render,
  props,
  { isHidden = false, key = undefined } = {}
) => ({
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
  const state = getState(interactionData.dSID);
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

  const callbackBindingKey = interactionData.dKey;
  if (!callbackBindingKey) {
    return { err: "Invalid interaction." };
  }

  // TODO: filtering
  /* if (state.userId && interaction.user.id !== state.userId) {
    return { err: "This interaction was not initiated by you." };
  } */
  const callbackOptions =
    rootInstance.getCallbackOptionsFromKey(callbackBindingKey);
  if (callbackOptions.defer) {
    rootInstance.messageRef = await interactionInstance.deferUpdate();
  }

  const res = await rootInstance.triggerCallbackFromKey(
    callbackBindingKey,
    interaction,
    interactionData
  );
  if (res?.err) {
    return res;
  }

  const renderedElement = await rootInstance.renderCurrentElement();
  rootInstance.messageRef = await interactionInstance.update(renderedElement);
  return renderedElement;
}

/**
 * @param {DeactElement} ref
 * @param {string} callbackBindingKey
 * @param {object} data
 * @returns {string}
 */
function makeComponentId(ref, callbackBindingKey, data = {}) {
  return JSON.stringify({
    dSID: ref.rootInstance.stateId,
    dKey: callbackBindingKey,
    ...data,
  });
}

/**
 * @param {Function} callback
 * @param {DeactElement} ref
 * @param {object} options
 * @param {boolean=} options.defer
 * @returns {string} binding key of the callback
 */
function useCallbackBinding(callback, ref, options = {}) {
  ref.callbacks.push({
    callback: async (interaction, interactionData) =>
      // TODO, probably
      await callback(interaction, interactionData),
    options,
  });

  return ref.getCallbackKey();
}

/**
 * @param {any} initialValue
 * @param {DeactElement} ref
 */
function useState(initialValue, ref) {
  const index = ref.state.length;
  const value = ref.finishedMounting ? ref.oldState[index] : initialValue;
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

/**
 * @template T
 * @param {T} initialValue
 * @param {DeactElement} elementRef
 * @returns {Ref<T>}
 */
function useRef(initialValue, elementRef) {
  const index = elementRef.refs.length;
  const ref = elementRef.finishedMounting
    ? elementRef.oldRefs[index]
    : {
        current: initialValue,
      };
  elementRef.refs.push(ref);
  return ref;
}

/**
 * @param {any[]} deps
 * @param {DeactElement} ref
 * @returns {boolean} have deps changed?
 */
function useCompareAndSetDeps(deps, ref) {
  let haveDepsChanged = false;
  for (const dep of deps) {
    const depRef = useRef(dep, ref);
    if (depRef.current !== dep) {
      depRef.current = dep;
      haveDepsChanged = true;
    }
  }
  return haveDepsChanged;
}

/**
 * @param {Function} callback
 * @param {any[]} deps
 * @param {DeactElement} ref
 */
function useMemo(callback, deps, ref) {
  const memoRef = useRef(null, ref);
  const haveDepsChanged = useCompareAndSetDeps(deps, ref);
  if (haveDepsChanged || !ref.finishedMounting) {
    memoRef.current = callback();
  }
  return memoRef.current;
}

module.exports = {
  createRoot,
  createElement,
  triggerBoundCallback,
  makeComponentId,
  useCallbackBinding,
  useState,
  useRef,
  useMemo,
};
