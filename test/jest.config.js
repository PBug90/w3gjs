module.exports = {
  transform: {
    ".(ts|tsx)": "ts-jest",
  },
  rootDir: "..",
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  moduleFileExtensions: ["ts", "tsx", "js"],
  testPathIgnorePatterns: ["/node_modules/", "/test/smoke/"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
};
