import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
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
    allConfig: js.configs.all
});

export default defineConfig([
    globalIgnores(["**/dist/", "**/config/", "**/scripts/", "**/node_modules/"]),
    {
        extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"),

        plugins: {
            "@typescript-eslint": typescriptEslint,
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: 5,
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.json",
            },
        },

        rules: {
            "@typescript-eslint/no-explicit-any": "off",

            "@typescript-eslint/no-namespace": ["error", {
                allowDeclarations: true,
            }],

            "@typescript-eslint/no-require-imports": "error",
            "@typescript-eslint/no-invalid-this": "off",
            "@typescript-eslint/no-inferrable-types": "warn",
            "@typescript-eslint/consistent-type-imports": "warn",
            "no-prototype-builtins": "off",
            "prefer-const": "error",
            "no-var": "error",

            eqeqeq: ["error", "always", {
                null: "ignore",
            }],

            "no-shadow": "off",
            "@typescript-eslint/no-shadow": "warn",

            "@typescript-eslint/no-unused-vars": ["warn", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],
        },
    },
]);