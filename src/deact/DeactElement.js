// @ts-ignore
const shortId = require("shortid");
const { logger } = require("../log");
const {
  isDeactCreateElement,
  reduceContent,
  reduceEmbeds,
  reduceComponents,
  reduceComponentRows,
} = require("./utils");

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
    this.finishedMounting = false;

    /**
     * @type {ComposedElements}
     */
    this.res = null;
  }

  resetLifecycle() {
    this.isDoneRendering = true;
    this.oldState = this.state;
    this.oldCallbacks = this.callbacks;
    this.oldRefs = this.refs;
    this.oldProps = this.props;
    this.lastRes = this.res;
    this.state = [];
    this.callbacks = [];
    this.refs = [];
  }

  resetChildren() {
    this.oldChildren = this.children;
    this.children = {};
  }

  restoreLifecycle() {
    this.isDoneRendering = true; // may not be correct
    this.state = this.oldState;
    this.callbacks = this.oldCallbacks;
    this.refs = this.oldRefs;
    this.props = this.oldProps;
    this.res = this.lastRes;
    this.children = this.oldChildren;
  }

  /**
   * @param {*} props
   * @returns {Promise<RenderResult>}
   */
  async render(props) {
    const willRerender =
      this.getHasPropsChanged(this.props, props) ||
      !this.getIsDoneRendering() ||
      !this.res ||
      !this.finishedMounting;
    if (willRerender) {
      try {
        this.resetLifecycle();
        this.props = props;
        const res = await this.renderCallback(this, this.props);
        if (res.err) {
          this.restoreLifecycle();
          return { err: res.err };
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
        const elementRes = await this.getElementResPure(element);
        // @ts-ignore
        if (elementRes.err) {
          if (!rv.err) {
            // @ts-ignore
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
        const elementRes = await this.getElementResWithKey(content, "content");
        // @ts-ignore
        if (elementRes.err) {
          if (!rv.err) {
            // @ts-ignore
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
        const elementRes = await this.getElementResWithArrayKey(
          embed,
          "embeds"
        );
        // @ts-ignore
        if (elementRes.err) {
          if (!rv.err) {
            // @ts-ignore
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
      for (const componentRow of this.res.components) {
        // if row is not an array, append all components to return value
        if (!Array.isArray(componentRow)) {
          const elementRes = await this.getElementResWithArrayKey(
            componentRow,
            "components"
          );
          // @ts-ignore
          if (elementRes.err) {
            if (!rv.err) {
              // @ts-ignore
              rv.err = elementRes.err;
            }
          } else {
            for (const childComponentRow of elementRes.components) {
              rv.components = reduceComponentRows(
                rv.components,
                childComponentRow
              );
            }
          }
        } else {
          let currentActionRow;
          // else, assume one component is returned and make a row from it
          for (const component of componentRow) {
            const elementRes = await this.getElementResWithArrayKey(
              component,
              "components"
            );
            // @ts-ignore
            if (elementRes.err) {
              if (!rv.err) {
                // @ts-ignore
                rv.err = elementRes.err;
              }
            } else {
              currentActionRow = reduceComponents(
                currentActionRow,
                // assume only one component is returned
                elementRes.components[0]
              );
            }
          }
          rv.components = reduceComponentRows(rv.components, currentActionRow);
        }
      }
    }

    // unmound old children that are not in new children
    for (const [key, oldChild] of Object.entries(this.oldChildren)) {
      if (!this.children[key]) {
        oldChild.unmount();
      }
    }

    this.finishedMounting = true;
    return rv;
  }

  /**
   * @template T
   * @param {ReturnType<import("./deact").createElement> | T} element
   * @returns {Promise<{ elementResult: (RenderResult | T), isDeactCreateElement: boolean}>}
   */
  async getElementRes(element) {
    if (isDeactCreateElement(element)) {
      const deactCreateElement =
        /** @type {ReturnType<import("./deact").createElement>} */ (element);
      const child = this.getOrMountChild(deactCreateElement);
      const childRes = await child.render(deactCreateElement.props);
      if (deactCreateElement.isHidden) {
        return {
          elementResult: {},
          isDeactCreateElement: true,
        };
      }
      return {
        elementResult: childRes,
        isDeactCreateElement: true,
      };
    }

    return {
      elementResult: /** @type {any} */ (element),
      isDeactCreateElement: false,
    };
  }

  /**
   * @template T
   * @param {ReturnType<import("./deact").createElement> | T} element
   * @returns {Promise<RenderResult | T>}
   */
  async getElementResPure(element) {
    return (await this.getElementRes(element)).elementResult;
  }

  /**
   * @template T
   * @param {ReturnType<import("./deact").createElement> | T} element
   * @param {string} key
   * @returns {Promise<RenderResult | { [key: string]: T }>}
   */
  async getElementResWithKey(element, key) {
    const elementRes = await this.getElementRes(element);
    let rv = elementRes.elementResult;
    if (!elementRes.isDeactCreateElement) {
      rv = { [key]: rv };
    }
    return rv;
  }

  /**
   * @template T
   * @param {ReturnType<import("./deact").createElement> | T} element
   * @param {string} arrayKey
   * @returns {Promise<RenderResult | { [arrayKey: string]: T[] }>}
   */
  async getElementResWithArrayKey(element, arrayKey) {
    const elementRes = await this.getElementRes(element);
    let rv = elementRes.elementResult;
    if (!elementRes.isDeactCreateElement) {
      rv = { [arrayKey]: [rv] };
    }
    return rv;
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
    const isSameElement =
      oldChild?.renderCallback === deactCreateElement.render;
    if (isSameElement) {
      this.children[key] = oldChild;
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
