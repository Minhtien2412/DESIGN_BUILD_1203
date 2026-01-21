/**
 * Jest Configuration for Expo + React Native
 * Optimized for TypeScript and SDK 54
 */
module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: [
    "**/__tests__/**/*.test.(ts|tsx|js|jsx)",
    "**/?(*.)+(spec|test).(ts|tsx|js|jsx)",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@gorhom/.*|@tanstack/.*|date-fns|eventemitter3)",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^react-native$": "react-native",
  },
  collectCoverageFrom: [
    "services/**/*.{ts,tsx}",
    "context/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "utils/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/coverage/**",
  ],
  coverageReporters: ["text", "text-summary", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.expo/",
    "/android/",
    "/ios/",
    "/web/",
    "/backups/",
    "/BE-baotienweb.cloud/",
  ],
  cacheDirectory: "<rootDir>/.jest-cache",
  verbose: true,
  maxWorkers: "50%",
  // Expo-specific globals
  globals: {
    __DEV__: true,
  },
};
