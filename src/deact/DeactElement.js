const shortId = require("shortid");

class DeactElement {
  /**
   *
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

  resetLifecycle() {
    this.state = [];
    this.callbacks = [];
  }

  async render() {
    this.resetLifecycle();
    return await this.renderCallback(this.props);
  }
}

module.exports = {
  DeactElement,
};
