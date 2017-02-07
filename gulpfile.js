/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


"use strict";
const babel = require('gulp-babel');
const del = require('del');
const eslint = require('gulp-eslint');
const fs = require('fs');
const gulp = require('gulp');
const gutil = require('gulp-util');
const KarmaServer = require('karma').Server;
const webpack = require('webpack');
const webpack_config = require('./webpack.config.js');
const WebpackDevServer = require('webpack-dev-server');
const _ = require('lodash');


/**
 *  Environments configuration
 */
const chalk = require('chalk');
const ALLOWED_ENVS = ['dev', 'prod', 'preprod'];
const env_name = process.env.NODE_ENV;
if (ALLOWED_ENVS.indexOf(env_name) != -1) {
    console.log(`Running environment ${chalk.green(env_name)}`);
} else {
    console.error(chalk.red(`Environment ${chalk.blue(env_name)} not in ${chalk.yellow(ALLOWED_ENVS)}`));
    process.exit(1);
}


/**
 * Globbing expressions
 */
const client_files = 'src/client/**/*.js';
const test_files = 'test/**/*.js';


/**
 * Main tasks
 */
gulp.task('lint', () => {
    return gulp.src([
        client_files,
        test_files,
        '!src/client/rollbar.umd.nojson.min.js',
    ])
        .pipe(eslint())
        .pipe(eslint.format())
});

gulp.task('webpack', (callback) => {
    const config = webpack_config({
        env: env_name,
    });
    webpack(config, (error, stats) => {
        if (error) {
            throw new gutil.PluginError('webpack', error)
        };
        gutil.log("[webpack]", stats.toString({
            'colors': true,
        }));
        callback();
    });
});

gulp.task('webpack-dev-server', (callback) => {
    const host = 'dev.kin.today';
    const port = 8080;

    const config = webpack_config({
        env: env_name,
    });

    // FIXME: Webpack dev server's inline mode seems to auto-reload the page in rare
    // occasions (first install iOS simulator -> first connector),
    // might need further investigations
    _.forEach(config.entry, entry => {
        entry.unshift('webpack-dev-server/client?https://' + host + ':' + port + '/');
    });

    // Start a webpack-dev-server
    new WebpackDevServer(webpack(config), {
        key: fs.readFileSync('./certs/localhost-key.pem'),
        cert: fs.readFileSync('./certs/localhost-cert.pem'),
        https: true,
        stats: {
            colors: true
        },
    }).listen(port, host, (error) => {
        if (error) {
            throw new gutil.PluginError('webpack-dev-server', error);
        }
        gutil.log('[webpack-dev-server]', 'https://' + host + ':' + port + '/index.html');
    });
});


/**
 * Test tasks
 */
gulp.task('test', ['_set-test-node-env'], (done) => {
    new KarmaServer({
        configFile: `${__dirname}/karma.config.js`,
        singleRun: true,
    }, done).start();
});

gulp.task('test-watch', ['_set-test-node-env'], (done) => {
    new KarmaServer({
        configFile: `${__dirname}/karma.config.js`,
    }, done).start();
});

gulp.task('_set-test-node-env', function() {
    return process.env.NODE_ENV = 'test';
});


/**
 * Utils tasks
 */
gulp.task('clean', () => {
    del([
        './public/*.otf',
        './public/*.html',
        './public/*.css',
        './public/*.map',
        './public/*.js',
        './public/*.png',
    ]);
});
