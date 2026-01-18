import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser"; 
import importPlugin from "eslint-plugin-import";

export default [
  {
    files: ["**/*.ts", "**/*.js"],
    ignores: ["node_modules/**", "dist/**"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
        project: [
          "apigateway/code/tsconfig.json",
          "users/code/tsconfig.json",
          "tasks/code/tsconfig.json",
          "achievements/code/tsconfig.json",
          "shop/code/tsconfig.json"
        ]
      }
    },

    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin
    },

    rules: {
      ...tsPlugin.configs.recommended.rules,

      semi: ["error", "always"],
      quotes: ["error", "single"],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/explicit-function-return-type": "off",
      "import/order": ["error", { alphabetize: { order: "asc" } }]
    }
  }
];
