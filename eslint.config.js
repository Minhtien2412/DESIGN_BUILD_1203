// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "dist/*",
      "services/legacy/*",
      "BE-baotienweb.cloud/*",
      "lib/construction-map/examples/*",
      "backups/*",
      "src/*", // Legacy src folder
      "testing/*",
      "scripts/*",
      "mocks/*",
      "*.config.js",
      "coverage/*",
      "perfex-crm-ai-architect/*",
      "web/*",
      "e2e/*",
    ],
  },
  {
    // Customize rules for the main app - reduce noise for production
    rules: {
      // Unused vars - allow underscore prefix AND ignore rest siblings
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_|^(width|height|error|err|e)$",
          caughtErrorsIgnorePattern: "^_|^(error|err|e)$",
          ignoreRestSiblings: true,
        },
      ],
      // exhaustive-deps - downgrade to off for animations (common pattern)
      "react-hooks/exhaustive-deps": "off",
      // Import warnings - reduce noise
      "import/no-named-as-default": "off",
      "import/no-named-as-default-member": "off",
      // React specific - reduce noise for anonymous functions
      "react/display-name": "off",
      // Allow unescaped quotes in JSX (common in Vietnamese text)
      "react/no-unescaped-entities": "off",
    },
  },
]);
