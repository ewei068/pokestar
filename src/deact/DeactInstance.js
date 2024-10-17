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
    const initialElement = new DeactElement(this, render, props);
    this.elements = {
      [initialElement.id]: initialElement,
    };
    this.currentElementId = initialElement.id;
    this.sharedState = {};
    this.locked = false;
  }

  getCurrentElement() {
    return this.elements[this.currentElementId];
  }

  async renderCurrentElement() {
    this.flushState();
    const element = this.getCurrentElement();
    let renders = 0;
    let res;
    while (true) {
      res = await element.render();
      if (res.err || element.isDoneRendering()) {
        break;
      }

      renders += 1;
      if (renders === 10) {
        // TODO: name handling
        logger.warn("Many renders detected.");
      } else if (renders > 20) {
        logger.error("Too many renders detected.");
        res = {
          ...res,
          err: "Your request took too long.",
        };
        break;
      }
    }
    this.flushState();
    return res;
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
}

module.exports = {
  DeactInstance,
};
