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
  ...compat.extends("airbnb", "prettier"),
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      parserOptions: {
        ecmaVersion: 2020,
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
      "guard-for-in": "off", // TODO: enable but make better lol
      "no-continue": "off", // doesn't seem to work properly
    },
  },
  pluginJs.configs.recommended,
];
