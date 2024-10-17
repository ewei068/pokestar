const { setState, updateState } = require("../services/state");
const { DeactElement } = require("./DeactElement");

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

  async renderCurrentElement() {
    const res = this.elements[this.currentElementId].render();
    this.flushState();
    return await res;
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
