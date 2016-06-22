var path = require('path');
var cloneDeep = require('lodash/cloneDeep');
var config = cloneDeep(require('./webpack.config'));

delete config.entry;
delete config.output;

config.module.preLoaders = [{
    test: /\.js$/,
    include: path.resolve('lib/'),
    loader: 'istanbul-instrumenter',
}];

module.exports = config;
