var process = require('process');

var watch = (process.argv.indexOf('--watch') !== -1);

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'chai', 'fixture'],

        // list of files / patterns to load in the browser
        files: [
            'test/fixtures/**/*.html',
            'test/fixtures/**/*.json',
            'test/index.js',
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '**/*.html': ['html2js'],
            '**/*.json': ['json_fixtures'],
            'lib/**/*.js': ['coverage'],
            'test/**/*.js': ['webpack'],
        },

        jsonFixturesPreprocessor: {
            variableName: '__json__',
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha', 'coverage'],

        webpack: require('./webpack.config-test'),

        webpackMiddleware: {
            // webpack-dev-middleware configuration
            // i. e.
            noInfo: true,
        },

        coverageReporter: { // important!
            dir: 'coverage',
            reporters: [{
                type: 'lcov',
                subdir: '.',
            }, {
                type: 'json',
                subdir: '.',
                file: 'coverage-final.json',
            }, {
                type: 'text',
            }],
        },

        plugins: [
            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
            'karma-safari-launcher',
            'karma-firefox-launcher',
            'karma-html2js-preprocessor',
            'karma-json-fixtures-preprocessor',
            'karma-webpack',
            'karma-mocha',
            'karma-mocha-reporter',
            'karma-chai',
            'karma-fixture',
            'karma-coverage',
        ],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: watch,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],
        // browsers: ['PhantomJS', 'Chrome', 'Firefox', 'Safari'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: !watch,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,
    });
};
