const shortId = require("shortid");
const { logger } = require("../log");

/**
 * @typedef {object} ComposedElements
 * @property {any[]?} elements
 * @property {string[]?} contents
 * @property {any[]?} embeds
 * @property {any[][]?} components
 * @property {boolean?} err
 * @property {boolean?} isHidden
 */

class DeactElement {
  /**
   * @param {import("./DeactInstance").DeactInstance} rootInstance
   * @param {Function} renderCallback
   */
  constructor(rootInstance, renderCallback) {
    this.rootInstance = rootInstance;
    this.renderCallback = renderCallback;
    this.id = shortId.generate();
    this.resetLifecycle();
    this.isDoneRendering = true;
  }

  resetLifecycle() {
    this.isDoneRendering = true;
    this.oldState = this.state;
    this.oldCallbacks = this.callbacks;
    this.oldProps = this.props;
    this.lastRes = this.res;
    this.state = [];
    this.callbacks = [];
  }

  restoreLifecycle() {
    this.isDoneRendering = true; // may not be correct
    this.state = this.oldState;
    this.callbacks = this.oldCallbacks;
    this.props = this.oldProps;
    this.res = this.lastRes;
  }

  async render(props) {
    const shouldRerender =
      this.getHasPropsChanged(this.props, props) ||
      !this.getIsDoneRendering() ||
      !this.res;
    if (shouldRerender) {
      try {
        this.resetLifecycle();
        this.props = props;
        const res = shouldRerender
          ? await this.renderCallback(this, this.props)
          : this.lastRes;
        if (res.err) {
          this.restoreLifecycle();
        }
        this.res = res;
      } catch (e) {
        logger.error(e);
        this.restoreLifecycle();
        return { err: "Big error lol" };
      }
    }
    return this.res;
  }

  getCallbackKey() {
    return `${this.id},${this.callbacks.length - 1}`;
  }

  // eslint-disable-next-line class-methods-use-this
  unmount() {
    // todo
  }

  // eslint-disable-next-line class-methods-use-this
  getHasPropsChanged(oldProps, newProps) {
    if (!oldProps) {
      return true;
    }
    for (const key of Object.keys(oldProps)) {
      if (oldProps[key] !== newProps[key]) {
        return true;
      }
    }
    if (!newProps) {
      return true;
    }
    for (const key of Object.keys(newProps)) {
      if (oldProps[key] !== newProps[key]) {
        return true;
      }
    }
    return false;
  }

  getIsDoneRendering() {
    return this.isDoneRendering; // TODO
  }
}

module.exports = {
  DeactElement,
};
