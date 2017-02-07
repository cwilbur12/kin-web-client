/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const RollbarSourceMapPlugin = require('rollbar-sourcemap-webpack-plugin')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');


// TODO: Those "rollbar"-related configs are also in `src/client/config.js`
// We should definitely have a better way of "sharing" them than copy-pasting ;)
const ROLLBAR_PUBLIC_TOKEN = '';
const ROLLBAR_CODE_VERSION = 0.1;


const config = function(options) {
    const output = {
        output: {
            path: path.join(__dirname, 'public'),
            filename: '[name]-[hash].js',
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    include: path.join(__dirname, 'src'),
                    exclude: [
                        path.join(__dirname, 'node_modules'),
                        path.join(__dirname, 'src/client/rollbar.umd.nojson.min.js'),
                    ],
                    use: 'eslint-loader',
                    enforce: 'pre',
                },
                {
                    test: /\.jsx?$/,
                    include: path.join(__dirname, 'src'),
                    exclude: path.join(__dirname, 'node_modules'),
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                cacheDirectory: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                outputStyle: 'expanded',
                            },
                        },
                        'postcss-loader',
                    ],
                },
                {
                    test: /\.css$/,
                    use: ExtractTextPlugin.extract({
                        fallbackLoader: 'style-loader',
                        loader: 'css-loader',
                    }),
                },
                {
                    test: /\.png$/,
                    use: 'url-loader?limit=100000',
                },
                {
                    test: /\.jpg$/,
                    use: 'file-loader',
                },
                {
                    test: /\.gif$/,
                    use: 'file-loader',
                },
                {
                    test: /\.mp3$/,
                    use: 'file-loader',
                },
                {
                    test: /\.otf$/,
                    use: 'file-loader',
                },
                {
                    test: /\.json$/,
                    use: 'json-loader'
                }
            ],
        },
        plugins: [
            new ExtractTextPlugin('[name]-[hash].css'),
            new webpack.DefinePlugin({
                KIN_ENV_NAME: JSON.stringify(options.env),
            }),
            new webpack.ProvidePlugin({
                '$': 'jquery',
                'jQuery': 'jquery',
                'window.jQuery': 'jquery',
            }),
        ],
        resolve: {
            extensions: ['.js', '.jsx']
        },
        performance: {
            hints: false // With vendors, we are far exceeding the "recommended" sizes
        },
    };

    // Environement-specific options
    output.devtool = {
        dev: 'eval',
        preprod: 'hidden-source-map',
        prod: 'hidden-source-map',
    }[options.env];


    // Add Plugins
    if (['dev', 'preprod', 'prod'].indexOf(options.env) !== -1) {
        output.entry = {
            auth: ['./src/client/auth.jsx'],
            client: ['./src/client/main.jsx'],
            connector: ['./src/client/connector/main.js'],
        };

        output.plugins = output.plugins.concat(
            new HtmlWebpackPlugin({
                chunks: ['auth', 'vendor'],
                favicon: 'src/public/imgs/logo/logo@3x.png',
                filename: 'auth.html',
                template: 'src/public/template.html',
                title: 'Kin Calendar - Authentication',
            }),
            new HtmlWebpackPlugin({
                chunks: ['client', 'vendor'],
                favicon: 'src/public/imgs/logo/logo@3x.png',
                filename: 'index.html',
                template: 'src/public/template.html',
                title: 'Kin Calendar',
            }),
            new HtmlWebpackPlugin({
                chunks: ['connector', 'vendor'],
                favicon: 'src/public/imgs/logo/logo@3x.png',
                filename: 'connector.html',
                template: 'src/public/template.html',
                title: 'Kin Calendar - Connector',
            }),
            new WebpackCleanupPlugin(),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks: module => /node_modules/.test(module.resource)
            })
        );
    }

    if (['preprod', 'prod'].indexOf(options.env) !== -1) {
        const public_path = {
            preprod: 'https://beta.calendar.kin.today',
            prod: 'https://calendar.kin.today',
        }[options.env];

        output.plugins = output.plugins.concat(
            new RollbarSourceMapPlugin({
                accessToken: ROLLBAR_PUBLIC_TOKEN,
                version: ROLLBAR_CODE_VERSION,
                publicPath: public_path,
            }),
            new webpack.LoaderOptionsPlugin({
                minimize: true,
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                },
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    // Hide everything, they are all from 3rd-parties and it's worth taking the
                    // risk of introducing new ones (eslint is there as a first barrier though)
                    warnings: false,
                },
                output: {
                    comments: false,
                },
                sourceMap: true,
            })
        );
    }

    if (options.env === 'dev') {
        output.plugins = output.plugins.concat(
            new webpack.LoaderOptionsPlugin({
                minimize: false,
                debug: true,
            })
        );
    }

    return output;
};


module.exports = config;
