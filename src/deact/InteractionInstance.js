class InteractionInstance {
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
    const messageRef = await this.interaction.reply({
      content: "Loading...",
    });
    this.deferred = true;
    return messageRef;
  }

  async deferUpdate() {
    // TODO: is this right?
    const messageRef = await this.interaction.deferUpdate();
    this.deferred = true;
    return messageRef;
  }

  /**
   * @param {object} param0
   * @param {string?=} param0.err
   * @param {any?=} param0.element
   * @param {any?=} param0.messageRef
   */
  async reply({ err, element, messageRef }) {
    const elementToSend = err || element;
    let reply;
    if (this.replied || this.updated) {
      reply = this.interaction.followUp(elementToSend);
    } else if (this.deferred && messageRef) {
      reply = messageRef.edit(elementToSend);
    } else {
      reply = this.interaction.reply(elementToSend);
    }
    this.replied = true;
    return await reply;
  }

  /**
   * @param {object} param0
   * @param {string?=} param0.err
   * @param {any?=} param0.element
   * @param {any?=} param0.messageRef
   */
  async update({ err, element, messageRef }) {
    const elementToSend = err || element;
    let update;
    if (messageRef && (this.replied || this.updated || this.deferred)) {
      update = messageRef.edit(elementToSend);
      // maybe use editReply?
    } else {
      update = this.interaction.update(elementToSend);
    }
    this.updated = true;
    return await update;
  }
}

module.exports = InteractionInstance;
