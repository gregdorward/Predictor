const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Path to the Next.js app to load next.config.js and .env files.
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
};

module.exports = createJestConfig(customJestConfig);
