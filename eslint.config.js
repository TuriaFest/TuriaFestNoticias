// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const boundaries = require("eslint-plugin-boundaries");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    plugins: {
      boundaries,
    },
    processor: angular.processInlineTemplates,
    settings: {
      "boundaries/elements": [
        { type: "core", pattern: "src/app/core/**/*" },
        { type: "layout", pattern: "src/app/layout/**/*" },
        { type: "feature", pattern: "src/app/features/*/**/*", capture: ["name"] },
        { type: "shared", pattern: "src/app/shared/**/*" },
        { type: "app", pattern: "src/app/app*" },
        { type: "env", pattern: "src/environments/**/*" },
        { type: "asset", pattern: "src/assets/**/*" },
      ],
      "boundaries/include": ["src/**/*.ts"],
      "boundaries/ignore": ["**/*.spec.ts"],
    },
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "fv",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "fv",
          style: "kebab-case",
        },
      ],
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "app", allow: ["app", "core", "layout", "shared", "feature", "env"] },
            { from: "core", allow: ["core", "shared", "env"] },
            { from: "layout", allow: ["layout", "core", "shared", "env"] },
            {
              from: ["feature"],
              allow: [
                "core",
                "shared",
                "env",
                ["feature", { name: "${from.name}" }],
              ],
            },
            { from: "shared", allow: ["shared", "core", "env", "asset"] },
            { from: "env", allow: ["env"] },
            { from: "asset", allow: ["asset"] },
          ],
        },
      ],
      "boundaries/entry-point": [
        "error",
        {
          default: "disallow",
          rules: [
            { target: ["feature"], allow: "*.routes.ts" },
            { target: ["core", "layout", "shared", "app", "env"], allow: "**" },
            { target: ["asset"], allow: "**" },
          ],
        },
      ],
      "boundaries/no-unknown": "off",
      "boundaries/no-unknown-files": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  },
]);
