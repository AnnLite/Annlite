import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      globals: globals.node,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
  },
);