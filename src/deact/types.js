/**
 * @template T
 * @typedef {{
 *  current: T,
 * }} Ref
 */

/**
 * @typedef {import("./DeactElement").DeactElement} DeactElement
 */

/**
 * @template T
 * @callback DeactElementFunction
 * @param {DeactElement} ref
 * @param {T} props
 * @returns {Promise<any>} TODO
 */

/**
 * Type of props for a Deact element
 * @template T
 * @typedef {T extends DeactElementFunction<infer U> ? U : never} DeactElementProps
 */
