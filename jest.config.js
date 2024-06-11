// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,
  rootDir: __dirname,
  preset: "ts-jest",
  testMatch: ["<rootDir>/src/__tests__/**/*spec.[jt]s?(x)"],
  coverageProvider: "v8",
  coverageDirectory: "coverage",
  transform: { "\\.ts$": "ts-jest" },
  globals: {
    __TEST__: "true",
    __VERSION__: '"unknow"',
  },
};
