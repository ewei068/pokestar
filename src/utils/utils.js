const getOrSetDefault = (obj, key, defaultValue) => {
    if (!obj[key]) {
        obj[key] = defaultValue;
    }
    return obj[key];
}

const getPBar = (percent, size = 20) => {
    if (percent > 100) {
        percent = 100;
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

module.exports = {
    getOrSetDefault,
    getPBar,
    getWhitespace,
}