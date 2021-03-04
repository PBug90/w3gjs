module.exports = {
  transform: {
    ".(ts|tsx)": "ts-jest",
  },
  rootDir: "..",
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  moduleFileExtensions: ["ts", "tsx", "js"],
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
};
