module.exports = {
  env: { node: true },
  extends: ["eslint:recommended"],
  root: true,
  overrides: [
    {
      files: "*.ts",
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "eslint-config-prettier",
        "@z1digitalstudio/eslint-config-imports",
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
      },
      plugins: ["@typescript-eslint"],
    },
  ],
};
