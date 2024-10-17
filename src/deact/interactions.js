const InteractionInstance = require("./InteractionInstance");

const interactions = {};
const TTL = 60 * 1000;

const deleteInteraction = (interactionId) => {
  if (interactionId in interactions) {
    delete interactions[interactionId];
  }
};

const handleTimeout = (interactionId) => {
  deleteInteraction(interactionId);
};

const setInteractionInstance = (interaction) => {
  if (!interaction || !interaction.id) {
    return;
  }

  interactions[interaction.id] = new InteractionInstance(interaction);

  setTimeout(() => {
    handleTimeout(interaction.id);
  }, TTL);
};

/**
 * @param {any} interaction
 * @returns {InteractionInstance | undefined}
 */
const getInteractionInstance = (interaction) => {
  if (!interaction || !interaction.id) {
    return;
  }

  return interactions[interaction.id];
};

const removeInteractionInstance = (interaction) => {
  if (!interaction || !interaction.id) {
    return;
  }

  deleteInteraction(interaction.id);
};

module.exports = {
  setInteractionInstance,
  getInteractionInstance,
  removeInteractionInstance,
};
