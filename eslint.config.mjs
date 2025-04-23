import { defineConfig } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: compat.extends(
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended",
    ),

    plugins: {
      "@typescript-eslint": typescriptEslint,
      prettier,
    },

    languageOptions: {
      parser: tsParser,
    },

    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".ts"],
        },
      },
    },

    rules: {
      "no-console": [
        "error",
        {
          allow: ["warn", "error"],
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);
