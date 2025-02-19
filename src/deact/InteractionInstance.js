const {
  ChatInputCommandInteraction,
  Message,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} = require("discord.js");
const { logger } = require("../log");

class InteractionInstance {
  /**
   * TODO: maybe make this extensible lol
   * @param {ChatInputCommandInteraction | Message | MessageComponentInteraction | import("discord.js").ModalMessageModalSubmitInteraction} interaction
   */
  constructor(interaction) {
    this.id = interaction.id;
    this.interaction = interaction;
    this.interactionActions = 0;
    this.interactionType = ""; // TODO
    this.deferred = false;
    this.replied = false;
    this.updated = false;
  }

  async deferReply() {
    const messageRef = await this.replyRaw({
      content: "Loading...",
    });
    this.deferred = true;
    return messageRef;
  }

  async deferUpdate() {
    // TODO: is this right?
    if (!(this.interaction instanceof MessageComponentInteraction)) {
      logger.warn("Cannot defer update for this interaction type");
      return;
    }
    const messageRef = await this.interaction.deferUpdate();
    this.deferred = true;
    return messageRef;
  }

  async followUpBasedOnInteractionType(elementToSend) {
    if (this.interaction instanceof ChatInputCommandInteraction) {
      return await this.interaction.followUp(elementToSend);
    }
    if (this.interaction instanceof Message) {
      return await this.interaction.reply(elementToSend);
    }
    if (this.interaction instanceof MessageComponentInteraction) {
      return await this.interaction.followUp(elementToSend);
    }
    logger.error("Attempt to follow up with unknown interaction type");
    return { err: "Unknown interaction type" };
  }

  async replyBasedOnInteractionType(elementToSend) {
    if (this.interaction instanceof ChatInputCommandInteraction) {
      return await this.interaction.reply(elementToSend);
    }
    if (this.interaction instanceof Message) {
      return await this.interaction.reply(elementToSend);
    }
    if (this.interaction instanceof MessageComponentInteraction) {
      return await this.interaction.reply(elementToSend);
    }
    logger.error("Attempt to reply with unknown interaction type");
    return { err: "Unknown interaction type" };
  }

  async replyRaw(elementToSend, messageRef) {
    let reply;
    if (this.replied || this.updated) {
      reply = this.followUpBasedOnInteractionType(elementToSend);
    } else if (this.deferred) {
      // TODO: order, probably
      if (messageRef) {
        reply = messageRef.edit(elementToSend);
      } else {
        reply = this.followUpBasedOnInteractionType(elementToSend);
      }
    } else {
      reply = this.replyBasedOnInteractionType(elementToSend);
    }
    return await reply;
  }

  /**
   * @param {object} param0
   * @param {string?=} param0.err
   * @param {any?=} param0.element
   * @param {any?=} param0.messageRef
   */
  async reply({ err, element, messageRef }) {
    const elementToSend = err || element;
    const reply = await this.replyRaw(elementToSend, messageRef);
    this.replied = true;
    return reply;
  }

  /**
   * @param {object} param0
   * @param {string?=} param0.err
   * @param {any?=} param0.element
   * @param {any?=} param0.messageRef
   */
  async update({ err, element, messageRef }) {
    if (
      !(this.interaction instanceof MessageComponentInteraction) &&
      !(this.interaction instanceof ModalSubmitInteraction)
    ) {
      logger.warn("Cannot update for this interaction type");
      return;
    }
    const elementToSend = err || element;
    let update;
    if (messageRef && (this.replied || this.updated || this.deferred)) {
      update = messageRef.edit(elementToSend);
    } else {
      update = this.interaction.update(elementToSend);
    }
    this.updated = true;
    return await update;
  }

  async sendModal(modalBuilder) {
    if (
      this.interaction instanceof Message ||
      this.interaction instanceof ModalSubmitInteraction
    ) {
      return { err: "Cannot send a modal to a Message or Modal" };
    }
    const modalShowRes = await this.interaction.showModal(modalBuilder);
    this.updated = true;
    return modalShowRes;
  }
}

module.exports = InteractionInstance;
