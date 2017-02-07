module.exports = {
    "extends": "airbnb",
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": {
            "impliedStrict": true,
        }
    },
    "env": {
        "browser": true,
        "mocha": true,
    },
    "rules": {
        "camelcase": 0,
        "no-underscore-dangle": 0,
        "indent": ["error", 4],

         //TODO: those could probably be re-enabled
        "new-cap": [2],

        // Disable preference because mocha recommends not using arrow functions
        "prefer-arrow-callback": 0,

        // Prevent warnings for function in mocha's describe/it
        "func-names": 0,

        // Disabling this because of chai's `expect` format
        //
        // https://github.com/eslint/eslint/issues/2102
        "no-unused-expressions": 0,

        // Both styles are awesome ;)
        "arrow-body-style": 0,

        // This rule is stoopid ;)
        "class-methods-use-this": 0,

        // Let's not complain about deps being used in tests
        "import/no-extraneous-dependencies": [
            "error",
            {
                "devDependencies": ["**/*.test.js"],
            },
        ],
    },
    globals: {
        chai: false,
        sinon: false,
        $: false,
    }
}
