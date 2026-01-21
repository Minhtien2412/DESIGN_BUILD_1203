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
    ],
  },
  {
    // Customize rules for the main app
    rules: {
      // Reduce noise from unused vars - allow underscore prefix
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      // Allow missing deps in useEffect with comment
      "react-hooks/exhaustive-deps": "warn",
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
