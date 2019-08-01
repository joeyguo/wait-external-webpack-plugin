const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WaitExternalPlugin = require('..//wait-external-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        pageA: "./src/pageA.js",
        pageB: "./src/pageB.js"
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        chunkFilename: "[name].chunk.js"
    },
    externals: [
        {
            jquery: 'window jQuery',
        },
        {
        reactComponet : ['React', 'Component']
    }],
    optimization: {
        splitChunks: {
            cacheGroups: { 
                commons: {
                    name: "commons",
                    chunks: "all", 
                    minSize: 1,
                    priority: 0 
                },
                vendor: { 
                    name: 'vendor',
                    test: /[\\/]node_modules[\\/]/,
                    chunks: 'all', 
                    priority: 10 
                }
            }
        }
    },
    plugins: [
        new WaitExternalPlugin({
            test: /\.js$/,
        }),
        new HtmlWebpackPlugin(),
    ]
};