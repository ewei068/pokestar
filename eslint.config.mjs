import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  // mimic ESLintRC-style extends
  ...compat.extends("airbnb", "prettier", "plugin:jsdoc/recommended"),
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      parserOptions: {
        ecmaVersion: 2021,
      },
    },
  },
  { languageOptions: { globals: globals.node } },
  {
    rules: {
      "consistent-return": "off",
      "no-return-await": "off", // deprecated
      "no-restricted-syntax": "off", // TODO: enable but make better lol
      "no-underscore-dangle": "off", // Needed for mongo _id
      "no-restricted-globals": "off", // globals work differently
      "guard-for-in": "off", // TODO: enable but make better lol
      "no-continue": "off", // doesn't seem to work properly
      "no-await-in-loop": "off", // TODO: use promise.all
      "jsdoc/no-undefined-types": "off", // doesn't seem to work with TS types
      "jsdoc/require-param-description": "off", // TODO: maybe add descriptions
      "jsdoc/require-returns-description": "off", // TODO: maybe add descriptions
      "jsdoc/require-property-description": "off", // TODO: maybe add descriptions
      "jsdoc/valid-types": "off", // doesn't seem to work with TS types
      "jsdoc/require-returns": "off",
    },
  },
  pluginJs.configs.recommended,
];
