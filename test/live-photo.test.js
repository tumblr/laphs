var forEach = require('lodash/forEach');

var LivePhoto;

var keyframeUrl, videoUrl, stillImageTime;

describe('LivePhoto', function() {

    before(function() {
        fixture.setBase('test/fixtures');
    });

    beforeEach(function() {
        LivePhoto = require('../lib/live-photo');

        var images = fixture.load('images.json');
        var image = images[0];
        keyframeUrl = image.keyframeUrl;
        videoUrl = image.videoUrl;
        stillImageTime = image.stillImageTime;
    });

    afterEach(function() {
        delete require.cache[require.resolve('../lib/live-photo')];
        fixture.cleanup();
    });

    describe('#constructor', function() {
        it('can create an instance without throwing', function() {
            assert.doesNotThrow(function() {
                new LivePhoto(keyframeUrl, videoUrl, stillImageTime);
            });
        });

        it('returns an instance of a LivePhoto', function() {
            var livePhoto = new LivePhoto(keyframeUrl, videoUrl, stillImageTime);
            assert.isTrue(livePhoto instanceof LivePhoto);
        });

        it('uses keyframeUrl, videoUrl, stillImageTime arguments', function() {
            var livePhoto = new LivePhoto(keyframeUrl, videoUrl, stillImageTime);
            assert.equal(livePhoto.img.src, keyframeUrl);
            assert.equal(livePhoto.postroll.src, videoUrl + '#' + stillImageTime);
            assert.equal(livePhoto.video.src, videoUrl);
            assert.equal(livePhoto.stillImageTime, stillImageTime);
        });

        it('uses the options argument', function() {
            var options = {
                postrollMs: 500,
                deactivateMs: 1000,
                previewMs: 1000,
            };

            var livePhoto = new LivePhoto(keyframeUrl, videoUrl, stillImageTime, options);

            forEach(options, function(value, key) {
                assert.equal(livePhoto[key], value, key + ' option is passed');
            });
        });

        it('silently fixes missing `new` keyword', function() {
            var livePhoto = LivePhoto(keyframeUrl, videoUrl, stillImageTime);
            assert.isTrue(livePhoto instanceof LivePhoto);
        });

        it('accepts an image element', function() {
            fixture.load('img-id.html');
            var livePhoto = new LivePhoto(document.getElementById('img-id'));
            assert.equal(livePhoto.img.src, 'http://40.media.tumblr.com/605593e8dc43cd6b523f101f1a680362/tumblr_nyt1yj7O5e1t3gniso1_1280.jpg');
            assert.equal(livePhoto.video.src, 'http://53.media.tumblr.com/605593e8dc43cd6b523f101f1a680362/tumblr_nyt1yj7O5e1t3gniso1.mov');
            assert.equal(livePhoto.stillImageTime, 1.112);
        });

        it('throws when keyframeUrl or videoUrl are missing', function() {
            assert.throws(function() {
                new LivePhoto('', videoUrl, stillImageTime);
            });
            assert.throws(function() {
                new LivePhoto(keyframeUrl, '', stillImageTime);
            });
        });

        it('suppresses keyframeUrl/videoUrl errors when noErrors option is enabled', function() {
            assert.doesNotThrow(function() {
                new LivePhoto('', videoUrl, stillImageTime, {noErrors: true});
            });
            assert.doesNotThrow(function() {
                new LivePhoto(keyframeUrl, '', stillImageTime, {noErrors: true});
            });
        });

        it('has the expected markup', function() {
            fixture.load('basic.html');
            var livePhoto = new LivePhoto(keyframeUrl, videoUrl, stillImageTime);
            assert.equal(livePhoto.container.children.length, 4, 'has exactly four children');
            assert.equal(livePhoto.container.children[0], livePhoto.img, 'image is first');
            assert.equal(livePhoto.container.children[1], livePhoto.postroll, 'postroll is second');
            assert.equal(livePhoto.container.children[2], livePhoto.video, 'video is third');
            assert.equal(livePhoto.container.children[3], livePhoto.icon, 'icon is fourth');
        });

        it('does not automatically append', function() {
            var livePhoto = new LivePhoto(keyframeUrl, videoUrl);
            assert.isNotOk(livePhoto.container.parentElement);
        });

        it('appends on demand', function() {
            var livePhoto = new LivePhoto(keyframeUrl, videoUrl, stillImageTime);
            document.body.appendChild(livePhoto.container);
            assert.isOk(livePhoto.container.parentElement);
            document.body.removeChild(livePhoto.container);
        });

        it('automatically appends for an existing element', function() {
            fixture.load('img-id.html');
            var livePhoto = new LivePhoto(document.getElementById('img-id'));
            assert.isOk(livePhoto.container.parentElement);
        });
    });

    describe('#play', function() {
        it('is a function', function() {
            var livePhoto = new LivePhoto(keyframeUrl, videoUrl, stillImageTime);
            assert.isFunction(livePhoto.play);
        });

        it('starts playback');
    });

    describe('#stop', function() {
        it('is a function', function() {
            var livePhoto = new LivePhoto(keyframeUrl, videoUrl);
            assert.isFunction(livePhoto.stop);
        });

        it('stops playback');
    });

    describe('#preview', function() {
        it('is a function', function() {
            var livePhoto = new LivePhoto(keyframeUrl, videoUrl);
            assert.isFunction(livePhoto.preview);
        });

        it('starts the preview');
    });

});
