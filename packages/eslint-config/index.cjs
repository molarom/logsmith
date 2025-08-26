module.exports = {
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["import", "unused-imports", "jsdoc"],
  rules: {
    "no-unused-vars": "off",
    "unused-imports/no-unused-imports": "warn",
    "import/order": ["warn", { "newlines-between": "always" }],
    "jsdoc/require-jsdoc": "off",
  },
};
