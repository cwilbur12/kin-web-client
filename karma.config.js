/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


var webpack_config = require('./webpack.config.js')({
    env: 'test',
});

module.exports = function(config) {
    config.set({
        frameworks: ['mocha', 'sinon-chai'],
        reporters: ['mocha', 'coverage'],
        browsers: ['Chrome'],

        files: [
            './test/index.js',
        ],

        preprocessors: {
            './test/index.js': ['webpack'],
        },

        webpack: webpack_config,
        webpackMiddleware: {
            noInfo: true
        },

        plugins: [
            'karma-chrome-launcher',
            'karma-coverage',
            'karma-mocha',
            'karma-mocha-reporter',
            'karma-sinon-chai',
            'karma-webpack',
        ],
    });
};
