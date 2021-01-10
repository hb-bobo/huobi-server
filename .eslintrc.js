module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "jest"],
    env: {
        browser: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "prettier/@typescript-eslint",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:jest/recommended"
    ],
    rules: {
        "only-arrow-functions": 0,
        "interface-name": 0,
        "object-literal-sort-keys": 0,
        "no-implicit-dependencies": 0,
        "no-object-literal-type-assertion": 0,
        "no-submodule-imports": 0,
        "non-simple": 0,
        "prefer-const": 1,
        "@typescript-eslint/no-empty-interface": 0,
        "@typescript-eslint/camelcase": 0,
        "@typescript-eslint/explicit-function-return-type": 0,
        "@typescript-eslint/no-var-requires": 0,
        '@typescript-eslint/explicit-module-boundary-types': 0,
    }
};
