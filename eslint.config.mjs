import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js"
import pluginJSXRuntimeConfig from "eslint-plugin-react/configs/jsx-runtime.js"
import { fixupConfigRules } from "@eslint/compat"

export default [
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.webextensions },
    },
    rules: {
      "default-case-last": "error",
      eqeqeq: "error",
      "no-await-in-loop": "warn",
      "no-duplicate-imports": "error",
      "no-implicit-coercion": "error",
      "no-label-var": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "error",
      "no-unmodified-loop-condition": "error",
      "no-unreachable-loop": "error",
      // should be enabled but array destructuring in one file trips it up.
      // may turn on later.
      // "no-useless-assignment": "error",
      "prefer-promise-reject-errors": "error",
      yoda: "warn",
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.jsx"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  },
  ...fixupConfigRules(pluginReactConfig),
  ...fixupConfigRules(pluginJSXRuntimeConfig),
]
