var process = require('process');
var webpack = require('webpack');
var inlineSvg = require('postcss-inline-svg');
var svgo = require('postcss-svgo');
var autoprefixer = require('autoprefixer');

var production = process.argv.indexOf('--production') !== -1;

var config = {
    context: __dirname,
    entry: './lib/live-photos.js',
    output:  {
        path: __dirname + '/dist',
        filename: 'live-photos.js',
        library: 'LivePhotos',
        libraryTarget: 'umd',
    },
    module: {
        loaders: [{test: /\.scss/, loader: 'style/useable!css!postcss!sass'}],
    },
    sassLoader: {
        sourceMap: true,
    },
    postcss: [
        inlineSvg(),
        svgo(),
        autoprefixer({
            browsers: [
                'last 3 versions',
            ],
        }),
    ],
};

if (production) {
    config.output.filename = 'live-photos.min.js';
    config.plugins = [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
        }),
    ];
}

module.exports = config;
