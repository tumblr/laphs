var forEach = require('lodash/forEach');

var LivePhotos;

describe('LivePhotos', function() {

    before(function() {
        fixture.setBase('test/fixtures');
    });

    beforeEach(function() {
        LivePhotos = require('../lib/live-photos');
    });

    afterEach(function() {
        fixture.cleanup();
        LivePhotos.cleanup();
        delete require.cache[require.resolve('../lib/live-photos')];
    });

    it('is a function', function() {
        assert.isFunction(LivePhotos);
    });

    it('creates LivePhoto instances', function() {
        fixture.load('basic.html');
        var livePhotos = LivePhotos();
        assert.equal(livePhotos.length, 1);
    });

    it('uses the elements and options arguments', function() {
        fixture.load('selectors.html');

        var options = {
            postrollMs: 500,
            deactivateMs: 1000,
            previewMs: 1000,
        };

        var livePhotos = LivePhotos('.img-a', options);
        assert.equal(livePhotos.length, 1);

        forEach(livePhotos, function(livePhoto) {
            forEach(options, function(value, key) {
                assert.equal(livePhoto[key], value, key + ' option is passed');
            });
        });
    });

});

describe('LivePhotos.initialize', function() {

    before(function() {
        fixture.setBase('test/fixtures');
    });

    beforeEach(function() {
        LivePhotos = require('../lib/live-photos');
    });

    afterEach(function() {
        fixture.cleanup();
        LivePhotos.cleanup();
        delete require.cache[require.resolve('../lib/live-photos')];
    });

    it('is a function', function() {
        assert.isFunction(LivePhotos);
    });

    it('creates LivePhoto instances for elements with data-live-photo attribute', function() {
        fixture.load('basic.html');
        var livePhotos = LivePhotos.initialize();
        assert.equal(livePhotos.length, 1);
    });

    it('passes options to each LivePhoto', function() {
        fixture.load('basic.html');

        var options = {
            postrollMs: 500,
            deactivateMs: 1000,
            previewMs: 1000,
        };

        var livePhotos = LivePhotos.initialize(options);
        forEach(livePhotos, function(livePhoto) {
            forEach(options, function(value, key) {
                assert.equal(livePhoto[key], value, key + ' option is passed');
            });
        });
    });

    it('appends a stylesheet once', function() {
        fixture.load('basic.html');
        assert.equal(document.head.querySelectorAll('style').length, 0, 'clean slate');
        LivePhotos.initialize();
        assert.equal(document.head.querySelectorAll('style').length, 1, 'one stylesheet appended');
    });

    it('skips invalid elements', function() {
        fixture.load('selectors.html');
        var livePhotos = LivePhotos.initialize(['#img-id', 'div.cool-img', false]);
        assert.equal(livePhotos.length, 1);
    });

    it('accepts a custom selector', function() {
        fixture.load('selectors.html');
        var livePhotos = LivePhotos.initialize('.img-a, .img-b');
        assert.equal(livePhotos.length, 2);
    });

    it('accepts an element', function() {
        fixture.load('selectors.html');
        var livePhotos = LivePhotos.initialize(document.getElementById('img-id'));
        assert.equal(livePhotos.length, 1);
    });

    it('accepts an array', function() {
        fixture.load('selectors.html');
        var livePhotos = LivePhotos.initialize(['.img-a', document.getElementById('img-id')]);
        assert.equal(livePhotos.length, 2);
    });

});

describe('LivePhotos.noStyles', function() {
    it('prevents the stylesheet from appending', function() {
        LivePhotos.noStyles();
        assert.equal(document.head.querySelectorAll('style').length, 0, 'clean slate');
        LivePhotos.initialize();
        assert.equal(document.head.querySelectorAll('style').length, 0, 'no stylesheet appended');
    });
});
