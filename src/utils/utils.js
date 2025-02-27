/* eslint-disable no-param-reassign */
/**
 * @file
 * @author Elvis Wei
 *
 * utils.js functions used by most Utils and other files, most relating to converting information from the mongo database.
 *
 * TODO: REALLY NEED TO BREAK UP THIS FILE LOLOLOL
 */
const { Message } = require("discord.js");
const { ObjectId } = require("mongodb");
const { ansiTokens } = require("../enums/miscEnums");

/**
 * @param {Record<any, any>} obj
 * @param {string | number} key
 * @param {any} defaultValue
 * @returns {any}
 */
const getOrSetDefault = (obj, key, defaultValue) => {
  if (!obj[key]) {
    obj[key] = defaultValue;
  }
  return obj[key];
};

/**
 * @param {number} percent
 * @param {number=} size
 * @returns {string}
 */
const getPBar = (percent, size = 20) => {
  if (percent > 100) {
    percent = 100;
  } else if (percent < 0) {
    percent = 0;
  }
  const progress = Math.floor(percent / (100 / size));
  return `${"▓".repeat(progress)}${"░".repeat(size - progress)}`;
};

/**
 * @param {string[]} strings
 * @param {number} len
 * @returns {string[]}
 */
const getWhitespace = (strings, len = 0) => {
  const maxLen = len || Math.max(...strings.map((s) => s.length));
  const whitespace = [];
  for (let i = 0; i < strings.length; i += 1) {
    whitespace.push(" ".repeat(maxLen - strings[i].length));
  }
  return whitespace;
};

/**
 * line break string, first split into words, then
 * line break when sum of words is greater than maxLen
 * @param {string} str
 * @param {number=} maxLen
 * @returns {string}
 */
const linebreakString = (str, maxLen = 20) => {
  const words = str.split(" ");
  const lines = [];
  let line = "";
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    if (line.length + word.length > maxLen) {
      lines.push(line);
      line = "";
    }
    line += `${word} `;
  }
  lines.push(line);
  // convert lines to string by join
  return lines.join("\n");
};

/**
 * @param {string} str
 * @returns {ObjectId}
 */
const idFrom = (str) => new ObjectId(str);

/**
 * @template T
 * @param {T[][]} matrix
 * @param {number} index
 * @returns {T}
 */
const matrixLoc = (matrix, index) => {
  const row = Math.floor(index / matrix[0].length);
  const col = index % matrix[0].length;
  return matrix[row][col];
};

/**
 * @param {any[][]} matrix
 * @param {number} index
 * @returns {[number, number]}
 */
const matrixIndex = (matrix, index) => {
  const row = Math.floor(index / matrix[0].length);
  const col = index % matrix[0].length;
  return [row, col];
};

/**
 * @template T
 * @param {T[][]} matrix
 * @param {T} value
 * @returns {[number, number]?}
 */
const matrixIndexOf = (matrix, value) => {
  for (let i = 0; i < matrix.length; i += 1) {
    const row = matrix[i];
    for (let j = 0; j < row.length; j += 1) {
      const col = row[j];
      if (col === value) {
        return [i, j];
      }
    }
  }
  return null;
};

/**
 * @param {string} string
 * @returns {string?}
 */
const getUserId = (string) => {
  if (!string) {
    return null;
  }

  const id = string.match(/<@!?(\d+)>/);
  if (id) {
    return id[1];
  }
  return null;
};

/**
 * @param {Message | import("discord.js").Interaction} interaction
 * @returns {DiscordUser}
 */
const getUserFromInteraction = (interaction) => {
  if (interaction instanceof Message) {
    return interaction.author;
  }
  return interaction.user;
};

/**
 * @param {string} string
 * @returns {string?}
 */
const getChannelId = (string) => {
  if (!string) {
    return null;
  }

  const id = string.match(/<#(\d+)>/);
  if (id) {
    return id[1];
  }
  return null;
};

/**
 * @param {any} prefix
 * @param {any} commandData
 * @returns {string}
 */
const buildCommandUsageString = (prefix, commandData) => {
  let usageString = `\`/${commandData.aliases[0]}`;
  if (commandData.args) {
    for (const arg in commandData.args) {
      const argConfig = commandData.args[arg];
      usageString += ` <${arg}${argConfig.optional ? "?" : ""}: ${
        argConfig.type
      }>`;
    }
  }
  usageString += "`";
  return usageString;
};

/**
 * @param {any[]} fields
 * @returns {any[]}
 */
const setTwoInline = (fields) => {
  // every 2 fields, add a blank field
  if (fields.length > 2) {
    for (let i = 2; i < fields.length; i += 3) {
      fields.splice(i, 0, { name: "** **", value: "** **", inline: false });
    }
  }
  return fields;
};

/**
 * @param {Date?=} date
 * @returns {number}
 */
const getFullUTCDate = (date = null) => {
  if (!date) {
    date = new Date();
  }
  const time = date.getTime();
  return Math.floor(time / 86400000);
};

/**
 * @param {Date?=} date
 * @returns {number}
 */
const getFullUTCWeek = (date = null) => {
  if (!date) {
    date = new Date();
  }
  const time = date.getTime();
  return Math.floor(time / (86400000 * 7));
};

/**
 * nice fortnite
 * @param {Date?=} date
 * @returns {number}
 */
const getFullUTCFortnight = (date = null) => {
  if (!date) {
    date = new Date();
  }
  const time = date.getTime();
  return Math.floor(time / (86400000 * 14));
};

/**
 * @param {number} interval
 * @param {Date?=} date
 * @returns {number}
 */
const getFullUTCTimeInterval = (interval, date = null) => {
  if (!date) {
    date = new Date();
  }
  const time = date.getTime();
  return Math.floor(time / interval);
};

/**
 * @param {number} fortnight fortnite lol
 * @returns {number}
 */
const fortnightToUTCTime = (fortnight) => fortnight * 86400000 * 14;

/* const getFullUTCMonth = (date=null) => {
    if (!date) {
        date = new Date();
    }
    const time = date.getTime();
    return Math.floor(time / (86400000 * 30));
} */

/**
 * @param {number} interval
 * @param {Date=} date
 * @returns {Date}
 */
const getNextTimeIntervalDate = (interval, date = null) => {
  if (!date) {
    date = new Date();
  }
  const currentUtcTimeInterval = getFullUTCTimeInterval(interval, date);
  const nextUtcTimeInterval = currentUtcTimeInterval + 1;
  const nextTimeIntervalTime = nextUtcTimeInterval * interval;
  return new Date(nextTimeIntervalTime);
};

/**
 * @param {Date?=} date
 * @returns {{hours: number, minutes: number, seconds: number}}
 */
const getTimeToNextDay = (date = null) => {
  if (!date) {
    date = new Date();
  }
  const time = date.getTime();
  const timeToNextDay = 86400000 - (time % 86400000);
  // return hours, minutes, seconds
  return {
    hours: Math.floor(timeToNextDay / 3600000),
    minutes: Math.floor((timeToNextDay % 3600000) / 60000),
    seconds: Math.floor((timeToNextDay % 60000) / 1000),
  };
};

/**
 * @param {Function} fn
 * @param {number=} interval
 */
const poll = async (fn, interval = 60 * 1000) => {
  fn();
  setTimeout(() => poll(fn, interval), interval);
};

/**
 * @param {number} amount
 * @returns {string}
 */
const formatMoney = (amount) => {
  // break into commas
  let str = amount.toString();
  // reverse string
  str = str.split("").reverse().join("");
  let formatted = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str[i];
    if (i % 3 === 0 && i !== 0) {
      formatted = `,${formatted}`;
    }
    formatted = char + formatted;
  }
  return `₽${formatted}`;
};

/**
 * @template {Function} T
 * @param {T} fn
 * @returns {Promise<ReturnType<T>?>}
 */
const errorlessAsync = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    // do nothing
  }
};

const zip = (...arr) =>
  Array(Math.max(...arr.map((a) => a.length)))
    .fill()
    .map((_, i) => arr.map((a) => a[i]));

/**
 * ERRORLESS
 * @param {any} interaction
 * @param {any} message
 */
const attemptToReply = async (interaction, message) => {
  try {
    await interaction.reply(message);
  } catch {
    try {
      await interaction.followUp(message);
    } catch {
      // do nothing
    }
    // do nothing
  }
};

/**
 *
 * @param {any} root
 * @param {DefaultFieldConfig} fieldConfig
 * @param {Date} lastCorrectedTime
 * @param {Date} newCorrectedTime
 * @returns {boolean} if field was modified
 */
const setDefaultFields = (
  root,
  fieldConfig,
  lastCorrectedTime,
  newCorrectedTime
) => {
  let modified = false;
  // check if all fields are present
  for (const field in fieldConfig) {
    const fieldData = fieldConfig[field];
    if (root[field] === undefined) {
      // eslint-disable-next-line no-param-reassign
      root[field] = fieldData.default;
      modified = true;
    }

    // if the field has its own config, attempt to set it
    if (fieldData.type === "object" && fieldData.config) {
      modified =
        setDefaultFields(
          root[field] ?? {},
          fieldData.config,
          lastCorrectedTime,
          newCorrectedTime
        ) || modified;
    }
  }

  // attempt to reset time-interval fields
  for (const field in fieldConfig) {
    const { refreshInterval } = fieldConfig[field];
    if (!refreshInterval) {
      continue;
    }

    const currentTimeInterval = getFullUTCTimeInterval(
      refreshInterval,
      newCorrectedTime
    );
    const lastTimeInterval = getFullUTCTimeInterval(
      refreshInterval,
      lastCorrectedTime
    );
    if (currentTimeInterval > lastTimeInterval) {
      // eslint-disable-next-line no-param-reassign
      root[field] = fieldConfig[field].default;
      modified = true;
    }
  }
  return modified;
};

const ansiTokenMap = Object.freeze({
  [ansiTokens.RESET]: "\u001b[0m",
  [ansiTokens.BOLD]: "\u001b[1m",
  [ansiTokens.UNDERLINE]: "\u001b[4m",
  [ansiTokens.INVERSE]: "\u001b[7m",
  [ansiTokens.TEXT_GRAY]: "\u001b[30m",
  [ansiTokens.TEXT_RED]: "\u001b[31m",
  [ansiTokens.TEXT_GREEN]: "\u001b[32m",
  [ansiTokens.TEXT_YELLOW]: "\u001b[33m",
  [ansiTokens.TEXT_BLUE]: "\u001b[34m",
  [ansiTokens.TEXT_MAGENTA]: "\u001b[35m",
  [ansiTokens.TEXT_CYAN]: "\u001b[36m",
  [ansiTokens.TEXT_WHITE]: "\u001b[37m",
  [ansiTokens.BACKGROUND_DARK_BLUE]: "\u001b[40m",
  [ansiTokens.BACKGROUND_ORANGE]: "\u001b[41m",
  [ansiTokens.BACKGROUND_MARBLE_BLUE]: "\u001b[42m",
});

/**
 * @param {string} str
 * @returns {string}
 */
const buildAnsiString = (str) => {
  let ansiString = "```ansi\n";
  // find and replace for all tokens
  for (const token in ansiTokenMap) {
    str = str.replaceAll(token, ansiTokenMap[token]);
  }
  ansiString += str;
  ansiString += "\n```";
  return ansiString;
};

/**
 * @param {any} obj
 * @param {PokemonTag | HeldItemTag | MoveTag | EffectTag} tag
 */
const getHasTag = (obj, tag) => obj?.tags?.includes?.(tag);

module.exports = {
  getOrSetDefault,
  getPBar,
  getWhitespace,
  linebreakString,
  idFrom,
  matrixIndex,
  matrixLoc,
  matrixIndexOf,
  getUserId,
  getUserFromInteraction,
  getChannelId,
  buildCommandUsageString,
  setTwoInline,
  getFullUTCDate,
  getFullUTCWeek,
  getFullUTCFortnight,
  getFullUTCTimeInterval,
  getNextTimeIntervalDate,
  fortnightToUTCTime,
  getTimeToNextDay,
  poll,
  formatMoney,
  errorlessAsync,
  zip,
  attemptToReply,
  setDefaultFields,
  buildAnsiString,
  getHasTag,
};
