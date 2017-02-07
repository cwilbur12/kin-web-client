module.exports = {
    "extends": "airbnb",
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": {
            "impliedStrict": true,
            "jsx": true
        }
    },
    "env": {
        "browser": true,
    },
    "rules": {
        "camelcase": 0,
        "no-underscore-dangle": 0,
        "indent": ["error", 4],
        "react/jsx-indent": [2, 4],
        "comma-dangle": 0,
        "max-len": ["error", 100, 2, {
            ignoreUrls: true,
            ignoreComments: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
        }],
        "arrow-body-style": 0, // Both styles are awesome ;)
        "class-methods-use-this": 0,
        "jsx-a11y/no-static-element-interactions": 0,
        "no-console": 0,
        "no-bitwise": 0,
        "react/require-default-props": 0,
    },
    "globals": {
        "$": false,
        "KIN_ENV_NAME": false,
    },
    "settings": {
        "import/core-modules": [
            "config",
            "utils",
            "prop_types",
        ],
    },
}
