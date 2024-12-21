/**
 * @template T
 * @typedef {{
 *  current: T,
 * }} Ref
 */

/**
 * @typedef {import("./DeactElement").DeactElement} DeactElement
 * @typedef {import("./deact").CallbackBindingOptions} CallbackBindingOptions
 */

/**
 * @template T
 * @callback DeactElementFunction
 * @param {DeactElement} ref
 * @param {T} props
 * @returns {Promise<ComposedElements>}
 */

/**
 * Type of props for a Deact element
 * @template T
 * @typedef {T extends DeactElementFunction<infer U> ? U : never} DeactElementProps
 */

/**
 * @typedef {import('discord.js').EmbedBuilder} Embed
 * @typedef {import('discord.js').ButtonBuilder | import('discord.js').StringSelectMenuBuilder} Component
 * @typedef {import('discord.js').ActionRowBuilder} ComponentRow
 */

/**
 * @typedef {{
 *   content?: string,
 *   embeds?: Embed[],
 *   components?: ComponentRow[],
 * }} ElementPayload
 * @typedef {ElementPayload & {
 *   err?: string
 * }} RenderResult
 * @typedef {ReturnType<import('./deact').createElement>} CreateElementResult
 */

/**
 * @typedef {object} ComposedElements
 * @property {(CreateElementResult | ElementPayload)[]?=} elements
 * @property {(CreateElementResult | string)[]?=} contents
 * @property {(CreateElementResult | Embed)[]?=} embeds
 * @property {((ComponentRow | Component | CreateElementResult)[] | ComponentRow | CreateElementResult)[]?=} components
 * @property {string?=} err
 */
