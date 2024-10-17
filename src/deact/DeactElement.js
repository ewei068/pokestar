const shortId = require("shortid");
const { logger } = require("../log");

class DeactElement {
  /**
   * @param {import("./DeactInstance").DeactInstance} parentInstance
   * @param {Function} renderCallback
   * @param {any} props
   */
  constructor(parentInstance, renderCallback, props) {
    this.parentInstance = parentInstance;
    this.renderCallback = renderCallback;
    this.props = props;
    this.id = shortId.generate();
    this.resetLifecycle();
  }

  updateProps(props) {
    this.props = props;
  }

  resetLifecycle() {
    this.oldState = [];
    this.callbacks = [];
    this.state = [];
    this.callbacks = [];
  }

  restoreLifecycle() {
    this.state = this.oldState;
    this.oldState = [];
  }

  async render() {
    this.resetLifecycle();
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

  unmount() {
    // todo
  }
}

module.exports = {
  DeactElement,
};
