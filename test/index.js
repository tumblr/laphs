// @see https://github.com/webpack/karma-webpack#alternative-usage

var testsContext = require.context('.', true, /\.test\.js$/);
testsContext.keys().forEach(testsContext);
