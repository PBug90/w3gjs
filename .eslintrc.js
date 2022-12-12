module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {},
  plugins: ["@typescript-eslint", "prettier"],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts"],
      },
    },
  },
};
