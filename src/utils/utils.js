const { ObjectId } = require("mongodb");

const getOrSetDefault = (obj, key, defaultValue) => {
    if (!obj[key]) {
        obj[key] = defaultValue;
    }
    return obj[key];
}

const getPBar = (percent, size = 20) => {
    if (percent > 100) {
        percent = 100;
    } else if (percent < 0) {
        percent = 0;
    }
    const progress = Math.floor(percent / (100 / size));
    return `${"▓".repeat(progress)}${"░".repeat(size - progress)}`;
}

const getWhitespace = (strings) => {
    const maxLen = Math.max(...strings.map(s => s.length));
    let whitespace = [];
    for (let i = 0; i < strings.length; i++) {
        whitespace.push(" ".repeat(maxLen - strings[i].length));
    }
    return whitespace;
}

// line break string, first split into words, then
// line break when sum of words is greater than maxLen
const linebreakString = (str, maxLen = 20) => {
    const words = str.split(" ");
    let lines = [];
    let line = "";
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (line.length + word.length > maxLen) {
            lines.push(line);
            line = "";
        }
        line += word + " ";
    }
    lines.push(line);
    // convert lines to string by join
    return lines.join("\n");
}

const idFrom = (str) => {
    return new ObjectId(str);
}

const matrixLoc = (matrix, index) => {
    const row = Math.floor(index / matrix[0].length);
    const col = index % matrix[0].length;
    return matrix[row][col];
}

const matrixIndex = (matrix, index) => {
    const row = Math.floor(index / matrix[0].length);
    const col = index % matrix[0].length;
    return [row, col];
}

const matrixIndexOf = (matrix, value) => {
    for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        for (let j = 0; j < row.length; j++) {
            const col = row[j];
            if (col === value) {
                return [i, j];
            }
        }
    }
    return null;
}

const getUserId = (string) => {
    if (!string) {
        return null;
    }

    const id = string.match(/<@!?(\d+)>/);
    if (id) {
        return id[1];
    }
    return null;
}

const buildCommandUsageString = (prefix, commandData) => {
    let usageString = `\`/${commandData.aliases[0]}`;
    if (commandData.args) {
        for (const arg in commandData.args) {
            const argConfig = commandData.args[arg];
            usageString += ` <${arg}${argConfig.optional ? "?" : ""}: ${argConfig.type}>`;
        }
    }
    usageString += "\`";
    return usageString;
}

const setTwoInline = (fields) => {
    // every 2 fields, add a blank field
    if (fields.length > 2) {
        for (let i = 2; i < fields.length; i += 3) {
            fields.splice(i, 0, { name: '** **', value: '** **', inline: false });
        }
    }
    return fields;
}

const getFullUTCDate = (date=null) => {
    if (!date) {
        date = new Date();
    }
    const time = date.getTime();
    return Math.floor(time / 86400000);
}

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
    buildCommandUsageString,
    setTwoInline,
    getFullUTCDate
}