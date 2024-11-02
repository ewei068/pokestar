const {
  /* eslint-disable-next-line no-unused-vars */
  MessageComponentInteraction,
  /* eslint-disable-next-line no-unused-vars */
  ModalSubmitInteraction,
} = require("discord.js");
const { DeactInstance } = require("./DeactInstance");
const { getInteractionInstance } = require("./interactions");
/* eslint-disable-next-line no-unused-vars */
const { DeactElement } = require("./DeactElement");
const { getState } = require("../services/state");
const { userTypeEnum } = require("./enums");

/**
 * @template T
 * @param {DeactElementFunction<T>} render
 * @param {T} props
 * @param {any} interaction
 * @param {object} param3
 * @param {boolean=} param3.defer
 * @param {any=} param3.userIdForFilter TODO: better name?
 * @param {number=} param3.ttl
 * @returns {Promise<any>}
 */
const createRoot = async (
  render,
  props,
  interaction,
  { defer = true, ttl, userIdForFilter = userTypeEnum.DEFAULT }
) => {
  const interactionInstance = getInteractionInstance(interaction);
  if (!interactionInstance) {
    return {
      err: "Error getting interaction instance",
    };
  }
  const instance = new DeactInstance(render, props, interaction.user.id, {
    ttl,
    userIdForFilter,
  });
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

  const rootInstance = /** @type {DeactInstance?} */ (state.instance);
  if (!state.isDeact || !rootInstance) {
    return { err: "An error has occured." };
  }

  const callbackBindingKey = interactionData.dKey;
  if (!callbackBindingKey) {
    return { err: "Invalid interaction." };
  }

  const { defer, userIdForFilter: callbackUserIdForFilter } =
    rootInstance.getCallbackOptionsFromKey(callbackBindingKey);
  const instanceUserIdForFilter = rootInstance.userIdForFilter;
  const userIdForFilter = callbackUserIdForFilter || instanceUserIdForFilter;
  // filter by user ID
  let isValidUser = false;
  if (userIdForFilter === userTypeEnum.ANY) {
    isValidUser = true;
  } else if (userIdForFilter === userTypeEnum.DEFAULT || !userIdForFilter) {
    isValidUser = interaction.user.id === rootInstance.initialUserId;
  } else {
    isValidUser = interaction.user.id === userIdForFilter;
  }
  if (!isValidUser) {
    return { err: "You may not currently take this action." };
  }

  if (defer) {
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
 * @param {string} stateId
 * @param {string} callbackBindingKey
 * @param {object} data
 * @returns {string}
 */
function makeComponentIdWithStateId(stateId, callbackBindingKey, data = {}) {
  return JSON.stringify({
    dSID: stateId,
    dKey: callbackBindingKey,
    ...data,
  });
}

/**
 * @param {DeactElement} ref
 * @param {string} callbackBindingKey
 * @param {object} data
 * @returns {string}
 */
function makeComponentId(ref, callbackBindingKey, data = {}) {
  return makeComponentIdWithStateId(
    ref.rootInstance.stateId,
    callbackBindingKey,
    data
  );
}

/**
 * @template {{
 *  id: string,
 *  [key: string]: any
 * }} T
 * @callback BuildModalFunction
 * @param {T} props
 * @returns {Promise<import("discord.js").ModalBuilder> | import("discord.js").ModalBuilder}
 */

/**
 * @template {{
 *  id: string,
 *  [key: string]: any
 * }} T
 * @param {BuildModalFunction<T>} modalFunction
 * @param {Omit<T, 'id'>} props
 * @param {string} callbackBindingKey
 * @param {any} interaction
 * @param {DeactElement} ref
 * @param {object=} data
 */
const createModal = async (
  modalFunction,
  props,
  callbackBindingKey,
  interaction,
  ref,
  data = {}
) => {
  const interactionInstance = getInteractionInstance(interaction);
  if (!interactionInstance) {
    return {
      err: "Error getting interaction instance",
    };
  }
  const id = makeComponentId(ref, callbackBindingKey, data);
  // @ts-ignore
  const modal = await modalFunction({
    ...props,
    id,
  });
  return await interactionInstance.sendModal(modal);
};

const useCallbackBindingRaw = (callback, ref, options) => {
  ref.callbacks.push({
    callback: async (interaction, interactionData) =>
      // TODO, probably
      await callback(interaction, interactionData),
    options,
  });

  return ref.getCallbackKey();
};

/**
 * @typedef {object} CallbackBindingOptions
 * @property {boolean=} defer
 * @property {any=} userIdForFilter
 */

/**
 * @param {(interaction: MessageComponentInteraction, data: any) => any} callback
 * @param {DeactElement} ref
 * @param {CallbackBindingOptions} options
 * @returns {string} binding key of the callback
 */
const useCallbackBinding = (callback, ref, options = {}) =>
  useCallbackBindingRaw(callback, ref, options);

/**
 * @param {(interaction: ModalSubmitInteraction, data: any) => any} callback
 * @param {DeactElement} ref
 * @param {CallbackBindingOptions} options
 * @returns {string} binding key of the callback
 */
const useModalSubmitCallbackBinding = (callback, ref, options = {}) =>
  useCallbackBindingRaw(callback, ref, options);

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
 * @param {any} initialValue
 * @param {DeactElement} ref
 */
function useState(initialValue, ref) {
  const index = ref.state.length;
  const value = ref.finishedMounting ? ref.oldState[index] : initialValue;
  ref.state.push(value);
  // shouldn't have to use useCallback because `ref` and `index` should never change and the setState function should never change
  const setStateRef = useRef((newValue) => {
    if (newValue === ref.state[index]) {
      return;
    }
    // this might be incorrect
    // eslint-disable-next-line no-param-reassign
    ref.state[index] = newValue;
    // eslint-disable-next-line no-param-reassign
    ref.isDoneRendering = false;
  }, ref);
  return [value, setStateRef.current];
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
 * @template T
 * @param {() => T} callback
 * @param {any[]} deps
 * @param {DeactElement} ref
 * @returns {T}
 */
function useMemo(callback, deps, ref) {
  const memoRef = useRef(null, ref);
  const haveDepsChanged = useCompareAndSetDeps(deps, ref);
  if (haveDepsChanged || !ref.finishedMounting) {
    memoRef.current = callback();
  }
  return memoRef.current;
}

/**
 * @template T
 * @param {() => Promise<T>} callback
 * @param {any[]} deps
 * @param {DeactElement} ref
 * @returns {Promise<T>}
 */
async function useAwaitedMemo(callback, deps, ref) {
  const promise = useMemo(callback, deps, ref);
  return await promise;
}

/**
 * @param {(() => (() => void)) | (() => void)} callback
 * @param {any[]} deps
 * @param {DeactElement} ref
 */
function useEffect(callback, deps, ref) {
  const cleanupRef = useRef(null, ref);
  const haveDepsChanged = useCompareAndSetDeps(deps, ref);
  if (haveDepsChanged || !ref.finishedMounting) {
    const cleanup = callback();
    if (cleanupRef.current) {
      cleanupRef.current();
    }
    cleanupRef.current = cleanup;
  }
}

module.exports = {
  userTypeEnum,
  createRoot,
  createElement,
  createModal,
  triggerBoundCallback,
  makeComponentIdWithStateId,
  makeComponentId,
  useCallbackBinding,
  useModalSubmitCallbackBinding,
  useState,
  useRef,
  useMemo,
  useAwaitedMemo,
  useEffect,
};
