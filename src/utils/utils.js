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

module.exports = {
    getOrSetDefault,
    getPBar,
    getWhitespace,
    linebreakString,
    idFrom
}