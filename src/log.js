const log4js = require("log4js");
const fs = require("fs");

const LOG_PATH = "logs/pokestar.log";
const ERROR_PATH = "logs/pokestar-error.log";

// create logs folder if not exist
if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

// create files if not exist
if (!fs.existsSync(LOG_PATH)) {
  fs.writeFileSync(LOG_PATH, "");
}
if (!fs.existsSync(ERROR_PATH)) {
  fs.writeFileSync(ERROR_PATH, "");
}

log4js.configure({
  appenders: {
    file: {
      type: "file",
      filename: LOG_PATH,
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
    },
    errorFile: {
      type: "file",
      filename: ERROR_PATH,
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
    },
    console: {
      type: "console",
    },
  },
  categories: {
    default: {
      appenders: ["file", "console"],
      level: "info",
    },
    error: {
      appenders: ["file", "errorFile", "console"],
      level: "error",
    },
    warn: {
      appenders: ["file", "console"],
      level: "warn",
    },
  },
});

const logger = log4js.getLogger();

module.exports = {
  logger,
};
