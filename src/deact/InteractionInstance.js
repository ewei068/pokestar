class InteractionInstance {
  constructor(interaction) {
    this.id = interaction.id;
    this.interaction = interaction;
    this.interactionActions = 0;
    this.interactionType = ""; // TODO
    this.deferred = false;
  }

  async deferReply() {
    this.messageRef = await this.interaction.reply({
      content: "Loading...",
    });
    this.deferred = true;
  }

  async deferUpdate() {
    this.messageRef = await this.interaction.update({
      content: "Loading...",
    });
    this.deferred = true;
  }

  async reply({ err, element }) {
    const elementToSend = err || element;
    if (this.deferred) {
      await this.messageRef.edit(elementToSend);
    } else {
      await this.interaction.reply(elementToSend);
    }
  }

  async update({ err, element }) {
    const elementToSend = err || element;
    if (this.deferred) {
      await this.messageRef.edit(elementToSend);
    } else {
      await this.interaction.update(elementToSend);
    }
  }
}

module.exports = InteractionInstance;
