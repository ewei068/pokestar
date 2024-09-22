/* eslint-disable no-param-reassign */
/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * utils.js functions used by most Utils and other files, most relating to converting information from the mongo database.
 */
const { ObjectId } = require("mongodb");

const getOrSetDefault = (obj, key, defaultValue) => {
  if (!obj[key]) {
    obj[key] = defaultValue;
  }
  return obj[key];
};

const getPBar = (percent, size = 20) => {
  if (percent > 100) {
    percent = 100;
  } else if (percent < 0) {
    percent = 0;
  }
  const progress = Math.floor(percent / (100 / size));
  return `${"▓".repeat(progress)}${"░".repeat(size - progress)}`;
};

const getWhitespace = (strings, len = 0) => {
  const maxLen = len || Math.max(...strings.map((s) => s.length));
  const whitespace = [];
  for (let i = 0; i < strings.length; i += 1) {
    whitespace.push(" ".repeat(maxLen - strings[i].length));
  }
  return whitespace;
};

// line break string, first split into words, then
// line break when sum of words is greater than maxLen
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

const idFrom = (str) => new ObjectId(str);

const matrixLoc = (matrix, index) => {
  const row = Math.floor(index / matrix[0].length);
  const col = index % matrix[0].length;
  return matrix[row][col];
};

const matrixIndex = (matrix, index) => {
  const row = Math.floor(index / matrix[0].length);
  const col = index % matrix[0].length;
  return [row, col];
};

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

const setTwoInline = (fields) => {
  // every 2 fields, add a blank field
  if (fields.length > 2) {
    for (let i = 2; i < fields.length; i += 3) {
      fields.splice(i, 0, { name: "** **", value: "** **", inline: false });
    }
  }
  return fields;
};

const getFullUTCDate = (date = null) => {
  if (!date) {
    date = new Date();
  }
  const time = date.getTime();
  return Math.floor(time / 86400000);
};

const getFullUTCWeek = (date = null) => {
  if (!date) {
    date = new Date();
  }
  const time = date.getTime();
  return Math.floor(time / (86400000 * 7));
};

// nice fortnite
const getFullUTCFortnight = (date = null) => {
  if (!date) {
    date = new Date();
  }
  const time = date.getTime();
  return Math.floor(time / (86400000 * 14));
};

const fortnightToUTCTime = (fortnight) => fortnight * 86400000 * 14;

/* const getFullUTCMonth = (date=null) => {
    if (!date) {
        date = new Date();
    }
    const time = date.getTime();
    return Math.floor(time / (86400000 * 30));
} */

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

const poll = async (fn, interval = 60 * 1000) => {
  fn();
  setTimeout(() => poll(fn, interval), interval);
};

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

const errorlessAsync = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    // do nothing
  }
};

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
  getChannelId,
  buildCommandUsageString,
  setTwoInline,
  getFullUTCDate,
  getFullUTCWeek,
  getFullUTCFortnight,
  fortnightToUTCTime,
  getTimeToNextDay,
  poll,
  formatMoney,
  errorlessAsync,
};
