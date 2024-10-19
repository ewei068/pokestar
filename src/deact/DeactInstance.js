const { setState, updateState } = require("../services/state");
const { DeactElement } = require("./DeactElement");
const { logger } = require("../log");

class DeactInstance {
  /**
   * @param {Function} render
   * @param {any} props
   * @param {{ ttl?: number }} param2
   */
  constructor(render, props, { ttl = 300 }) {
    this.stateId = setState(this.getStateToSet(), ttl);
    const initialElement = new DeactElement(this, render);
    this.rootProps = props;
    this.elements = {
      [initialElement.id]: initialElement,
    };
    this.currentElementId = initialElement.id;
    this.sharedState = {};
    this.locked = false;
  }

  addElement(element) {
    this.elements[element.id] = element;
  }

  removeElement(element) {
    delete this.elements[element.id];
  }

  getCurrentElement() {
    return this.elements[this.currentElementId];
  }

  async renderCurrentElement() {
    this.flushState();
    const element = this.getCurrentElement();
    let renders = 0;
    let res;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      res = await element.render(this.rootProps);
      if (res.err !== undefined || element.getIsDoneRendering()) {
        break;
      }

      renders += 1;
      if (renders === 15) {
        // TODO: name handling
        logger.warn("Many renders detected.");
      } else if (renders > 40) {
        logger.error("Too many renders detected.");
        res = {
          ...res,
          err: "Your request took too long.",
        };
        break;
      }
    }
    this.flushState();
    return res.err !== undefined
      ? {
          err: `${res.err}`,
        }
      : {
          element: res,
        };
  }

  getStateToSet() {
    return {
      instance: this,
      isDeact: true,
    };
  }

  flushState() {
    updateState(this.stateId, this.getStateToSet());
  }

  async triggerCallbackFromKey(bindingKey, interaction, interactionData) {
    const [elementId, callbackIndex] = bindingKey.split(",");
    const element = this.elements[elementId];
    const callback = element?.callbacks?.[callbackIndex];
    if (!callback) {
      return {
        err: "Interaction not supported",
      };
    }
    await callback(interaction, interactionData);
  }
}

module.exports = {
  DeactInstance,
};
