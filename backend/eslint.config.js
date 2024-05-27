import globals from 'globals';
import js from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        myCustomGlobal: 'readonly',
        "process": true
      },
    },
    rules: {
      semi: ["warn", "always"]
  }
  },
  js.configs.recommended,
];