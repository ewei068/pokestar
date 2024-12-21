// TODO: try to move these to their respective files

const timeEnum = Object.freeze({
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  FORTNITE: 14 * 24 * 60 * 60 * 1000, // this is mispelled on purpose
});

/** @typedef {Enum<upsellEnum>} UpsellEnum */
const upsellEnum = Object.freeze({
  TUTORIAL_UPSELL: "tutorialUpsell",
});

module.exports = {
  timeEnum,
  upsellEnum,
};
