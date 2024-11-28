const childProcess = require("child_process");
const { pokemonConfig } = require("../../src/config/pokemonConfig");

// given a key and value (dict), create a map from value.name in MACRO_CASE to the stringified key
// then, copy it to clipboard

const pokemonIdEnum = Object.entries(pokemonConfig).reduce(
  (acc, [key, value]) => {
    // convert name to MACRO_CASE, and replace - and whitespace with _
    const macroCase = value.name.toUpperCase().replace(/-|\s/g, "_");

    acc[macroCase] = key;
    return acc;
  },
  {}
);

const pokemonIdEnumString = JSON.stringify(pokemonIdEnum, null, 2);
const proc = childProcess.spawn("pbcopy");

proc.stdin.write(pokemonIdEnumString);
proc.stdin.end();
