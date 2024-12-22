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

const ansiTokens = Object.freeze({
  RESET: "ANSI_TOKEN_RESET",
  BOLD: "ANSI_TOKEN_BOLD",
  UNDERLINE: "ANSI_TOKEN_UNDERLINE",
  INVERSE: "ANSI_TOKEN_INVERSE",
  TEXT_GRAY: "ANSI_TOKEN_TEXT_GRAY",
  TEXT_RED: "ANSI_TOKEN_TEXT_RED",
  TEXT_GREEN: "ANSI_TOKEN_TEXT_GREEN",
  TEXT_YELLOW: "ANSI_TOKEN_TEXT_YELLOW",
  TEXT_BLUE: "ANSI_TOKEN_TEXT_BLUE",
  TEXT_MAGENTA: "ANSI_TOKEN_TEXT_MAGENTA",
  TEXT_CYAN: "ANSI_TOKEN_TEXT_CYAN",
  TEXT_WHITE: "ANSI_TOKEN_TEXT_WHITE",
  BACKGROUND_DARK_BLUE: "ANSI_TOKEN_BACKGROUND_DARK_BLUE",
  BACKGROUND_ORANGE: "ANSI_TOKEN_BACKGROUND_ORANGE",
  BACKGROUND_MARBLE_BLUE: "ANSI_TOKEN_BACKGROUND_MARBLE_BLUE",
});

module.exports = {
  timeEnum,
  upsellEnum,
  ansiTokens,
};
