// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "dist/*",
      "services/legacy/*",
      "BE-baotienweb.cloud/**/*",
      "lib/construction-map/examples/*",
      "backups/**/*",
      "src/**/*", // Legacy src folder - entire directory
      "testing/**/*",
      "scripts/**/*",
      "mocks/**/*",
      "*.config.js",
      "coverage/**/*",
      "perfex-crm-ai-architect/**/*",
      "lib/construction-map/vite.config.ts",
      "lib/construction-map/dist/**/*",
      "features/progress-report-source/**/*",
      "features/call/CallScreen.tsx.disabled",
      "lib/communication/webrtc.ts", // Uses react-native-webrtc which is not installed
      "shared/utils/deviceUtils.ts", // Contains non-hook functions with Hook-like names
      "**/vite.config.ts",
      "**/vite.config.*.ts",
      "web/**/*",
      "e2e/**/*",
      "__tests__/**/*",
      "backend/**/*",
      "docs/**/*",
      "deployment/**/*",
      "prisma/**/*",
      "openapi/**/*",
      "jest.setup.js",
      "tmp-*.js",
      "domain/**/*",
      "presentation/**/*",
      "index.js",
    ],
  },
  {
    // Customize rules for the main app - reduce noise for production
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsparser,
    },
    rules: {
      // exhaustive-deps - downgrade to off for animations (common pattern)
      "react-hooks/exhaustive-deps": "off",
      // Import warnings - reduce noise
      "import/no-named-as-default": "off",
      "import/no-named-as-default-member": "off",
      "import/no-duplicates": "off",
      "import/first": "off",
      // React specific - reduce noise for anonymous functions
      "react/display-name": "off",
      // Allow unescaped quotes in JSX (common in Vietnamese text)
      "react/no-unescaped-entities": "off",
      // Allow unused vars with _ prefix (intentionally ignored)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Allow require() imports for assets and dynamic imports
      "@typescript-eslint/no-require-imports": "off",
      // Allow Array<T> syntax
      "@typescript-eslint/array-type": "off",
      // Allow empty interfaces
      "@typescript-eslint/no-empty-object-type": "off",
      // Allow expressions
      "no-unused-expressions": "off",
    },
  },
]);
