const shortId = require("shortid");
const { logger } = require("../log");
const {
  isDeactCreateElement,
  reduceContent,
  reduceEmbeds,
  reduceComponents,
  reduceComponentRows,
} = require("./utils");

/**
 * @typedef {object} ComposedElements
 * @property {any[]?} elements
 * @property {string[]?} contents
 * @property {any[]?} embeds
 * @property {any[][]?} components
 * @property {boolean?} err
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
    this.children = {};
    this.oldChildren = {};

    /**
     * @type {ComposedElements}
     */
    this.res = null;
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

  resetChildren() {
    this.oldChildren = this.children;
    this.children = {};
  }

  restoreLifecycle() {
    this.isDoneRendering = true; // may not be correct
    this.state = this.oldState;
    this.callbacks = this.oldCallbacks;
    this.props = this.oldProps;
    this.res = this.lastRes;
    this.children = this.oldChildren;
  }

  /**
   * @param {*} props
   * @returns {Promise<{
   *   content?: string,
   *   embeds?: any[],
   *   components?: any[],
   *   err?: string
   * }>}
   */
  async render(props) {
    const willRerender =
      this.getHasPropsChanged(this.props, props) ||
      !this.getIsDoneRendering() ||
      !this.res;
    if (willRerender) {
      try {
        this.resetLifecycle();
        this.props = props;
        const res = await this.renderCallback(this, this.props);
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

    this.resetChildren();
    this.childCounter = 0;
    const rv = {};

    // compose elements
    // TODO: render children async then Promise.all?
    if (this.res.elements !== undefined) {
      for (const element of this.res.elements) {
        const elementRes = await this.getElementRes(element);
        if (elementRes.err) {
          if (!rv.err) {
            rv.err = elementRes.err;
          }
        } else {
          rv.content = reduceContent(rv.content, elementRes.content);
          rv.embeds = reduceEmbeds(rv.embeds, elementRes.embeds);
          rv.components = reduceComponentRows(
            rv.components,
            elementRes.components
          );
        }
      }
    }

    // compose contents
    if (this.res.contents !== undefined) {
      for (const content of this.res.contents) {
        const elementRes = await this.getElementRes(content, {
          key: "content",
        });
        if (elementRes.err) {
          if (!rv.err) {
            rv.err = elementRes.err;
          }
        } else {
          rv.content = reduceContent(rv.content, elementRes.content);
        }
      }
    }

    // compose embeds
    if (this.res.embeds !== undefined) {
      for (const embed of this.res.embeds) {
        const elementRes = await this.getElementRes(embed, { key: "embeds" });
        if (elementRes.err) {
          if (!rv.err) {
            rv.err = elementRes.err;
          }
        } else {
          rv.embeds = reduceEmbeds(rv.embeds, elementRes.embeds);
        }
      }
    }

    // compose components
    if (this.res.components !== undefined) {
      rv.components = rv.components ?? [];
      for (const [rowIndex, componentRow] of this.res.components.entries()) {
        let currentActionRow = rv.components[rowIndex];
        for (const component of componentRow) {
          const elementRes = await this.getElementRes(component, {
            key: "components",
          });
          if (elementRes.err) {
            if (!rv.err) {
              rv.err = elementRes.err;
            }
          } else {
            currentActionRow = reduceComponents(
              currentActionRow,
              elementRes.components
            );
          }
        }
        if ((currentActionRow?.components?.length ?? 0) > 0) {
          if (rv.components.length > 5) {
            continue;
          }
          if (rv.components.length <= rowIndex) {
            rv.components.push(currentActionRow);
          }
          rv.components[rowIndex] = currentActionRow;
        }
      }
    }

    return rv;
  }

  async getElementRes(element, { key = undefined } = {}) {
    if (isDeactCreateElement(element)) {
      const child = this.getOrMountChild(element);
      const childRes = await child.render(element.props);
      if (element.isHidden) {
        return {};
      }
      return childRes;
    }
    if (key) {
      return {
        [key]: element,
      };
    }
    return element;
  }

  /**
   * TODO
   * @param {*} deactCreateElement
   * @returns {DeactElement}
   */
  getOrMountChild(deactCreateElement) {
    const key = deactCreateElement?.key ?? this.childCounter;
    this.childCounter += 1;
    const oldChild = this.oldChildren[key];
    const isSameElement = oldChild?.render === deactCreateElement.render;
    if (isSameElement) {
      return oldChild;
    }
    const newChild = new DeactElement(
      this.rootInstance,
      deactCreateElement.render
    );
    this.rootInstance.addElement(newChild);
    this.children[key] = newChild;
    return newChild;
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

  getIsDoneRenderingAndChildren() {
    const childrenAreDoneRendering = Object.values(this.children).every(
      (child) => child.getIsDoneRenderingAndChildren()
    );
    return this.getIsDoneRendering() && childrenAreDoneRendering;
  }
}

module.exports = {
  DeactElement,
};
