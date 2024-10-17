const shortId = require("shortid");
const { logger } = require("../log");

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
    this.state = [];
    this.callbacks = [];
  }

  restoreLifecycle() {
    this.isDoneRendering = true;
    this.state = this.oldState;
    this.callbacks = this.oldCallbacks;
    this.props = this.oldProps;
  }

  async render(props) {
    this.resetLifecycle();
    this.props = props;
    try {
      // TODO: optimize by listening for props/state changes
      const res = await this.renderCallback(this, this.props);
      if (res.err) {
        this.restoreLifecycle();
      }
      return res;
    } catch (e) {
      logger.error(e);
      this.restoreLifecycle();
      return { err: "Big error lol" };
    }
  }

  getCallbackKey() {
    return `${this.id},${this.callbacks.length - 1}`;
  }

  // eslint-disable-next-line class-methods-use-this
  unmount() {
    // todo
  }

  getIsDoneRendering() {
    return this.isDoneRendering; // TODO
  }
}

module.exports = {
  DeactElement,
};
