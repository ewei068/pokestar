module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/", "/__testing__/"],
  coveragePathIgnorePatterns: ["/node_modules/", "/__testing__/"],
  setupFilesAfterEnv: ["<rootDir>/src/__testing__/setup.js"],
};
