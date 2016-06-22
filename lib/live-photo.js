var enableInlineVideo = require('iphone-inline-video');
var touchEnabled = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints);

/**
 * Create a video element that that can be played inline
 *
 * @param  {string} src - video URL
 * @param  {string} [className] - CSS classname for the video element
 * @param  {number} [time] - start time for the video
 * @param  {boolean} [muted] - whether the video should start muted
 *
 * @return {DOMElement} the video element
 *
 * @private
 */
function createVideoElement(src, className, time, muted) {
    var video = document.createElement('video');
    video.src = src + (time ? '#' + time : '');
    video.controls = false;
    video.muted = muted || false;
    video.preload = 'auto';
    if (className) {
        video.className = className;
    }
    enableInlineVideo(video, !muted);
    return video;
}

/**
 * Some mobile browsers restrictions prevent programmatic playback of HTML5 video that hasn't been
 * given permission via user interaction. This function is invoked on a user event to allow
 * programmatic playback later.
 *
 * @param  {DOMElement} video - the video element
 * @param  {Function} [cb] - invoked with the video
 *
 * @private
 */
function warmVideoTubes(video, cb) {
    if (video.paused) {
        var videoMuted = video.muted;
        var videoTime = video.currentTime;

        // Because we can't set currentTime until the video metadata is loaded
        var onLoadededMetadata = function() {
            video.removeEventListener('loadedmetadata', onLoadededMetadata);
            video.currentTime = videoTime;
            if (cb) {
                cb(video);
            }
        };

        // Play then immediately pause
        video.muted = true;
        video.play();
        video.pause();
        video.muted = videoMuted;
        if (video.duration >= 0) {
            onLoadededMetadata();
        } else {
            video.addEventListener('loadedmetadata', onLoadededMetadata);
        }
    }
}

/**
 * Generate the markup for a Live Photo
 *
 * @param  {string} keyframeUrl - URL of the keyframe image asset
 * @param  {string} videoUrl - URL of the Live Photo video asset
 * @param  {number} stillImageTime - time (in seconds) that corresponds to the position of the
 *         keyframe in the video
 *
 * @return {Object} object containing all of DOM elements used for the Live Photo
 *
 * @private
 */
function createLivePhotoElements(keyframeUrl, videoUrl, stillImageTime) {
    var container = document.createElement('div');
    container.className = 'live-photo';
    container.setAttribute('data-live-photo', '');

    var img = document.createElement('img');
    img.className = 'live-photo-keyframe';
    img.src = keyframeUrl;

    var postroll = createVideoElement(videoUrl, 'live-photo-postroll', stillImageTime, true);
    var video = createVideoElement(videoUrl, 'live-photo-video');

    var icon = document.createElement('i');
    icon.className = 'live-photo-icon';

    container.appendChild(img);
    container.appendChild(postroll);
    container.appendChild(video);
    container.appendChild(icon);

    return {
        container: container,
        img: img,
        postroll: postroll,
        video: video,
        icon: icon,
    };
}

/**
 * Determine which events should activate the Live Photo by default
 *
 * @return {Array} event names
 *
 * @private
 */
function defaultPlayEvents() {
    var events = ['mousedown'];
    if (touchEnabled) {
        events.push('touchstart');
    }
    return events;
}

/**
 * Determine which events should deactivate the Live Photo by default
 *
 * @return {Array} event names
 *
 * @private
 */
function defaultStopEvents() {
    var events = ['mouseup', 'mouseout'];
    if (touchEnabled) {
        events.push('touchend');
    }
    return events;
}

/**
 * @classdesc Creates the necessary markup and provides the interface to interact with a Live Photo
 *
 * @param  {string} keyframeUrl - URL of the keyframe image asset
 * @param  {string} videoUrl - URL of the Live Photo video asset
 * @param  {number} stillImageTime - time (in seconds) that corresponds to the position of the
 *         keyframe in the video
 * @param  {Object} [options] - additional Live Photo options
 *
 * @constructor
 */
function LivePhoto(keyframeUrl, videoUrl, stillImageTime, options) {
    // Silently correct when user forgets the `new` keyword
    if (!(this instanceof LivePhoto)) {
        return new LivePhoto(keyframeUrl, videoUrl, stillImageTime, options);
    }

    // Generate the elements from the options
    var elements, replaceEl;
    if (keyframeUrl instanceof HTMLElement) {
        options = videoUrl;
        replaceEl = keyframeUrl;
        videoUrl = replaceEl.getAttribute('data-live-photo');
        stillImageTime = parseFloat(replaceEl.getAttribute('data-live-photo-still-image-time'));
        keyframeUrl = replaceEl.src;
    }

    // Handle options
    options || (options = {});
    this.postrollMs = options.postrollMs || 375;
    this.deactivateMs = options.deactivateMs || 500;
    this.previewMs = options.previewMs || 500;

    // Video time that corresponds with the keyframe
    this.stillImageTime = stillImageTime || NaN;

    // Create necessary DOM
    if (!keyframeUrl && !options.noErrors) {
        throw new Error('LivePhoto Error: Missing keyframeUrl');
    }
    if (!videoUrl && !options.noErrors) {
        throw new Error('LivePhoto Error: Missing videoUrl');
    }
    elements = createLivePhotoElements(keyframeUrl, videoUrl, stillImageTime);

    // Replace any existing element
    if (replaceEl) {
        replaceEl.parentNode.insertBefore(elements.container, replaceEl);
        replaceEl.parentNode.removeChild(replaceEl);
    }

    // Save the elements
    this.container = elements.container;
    this.img = elements.img;
    this.video = elements.video;
    this.postroll = elements.postroll;
    this.icon = elements.icon;

    // Bind video event handlers
    this.__onVideoCanPlayThrough = this._onVideoCanPlayThrough.bind(this);
    this.__onVideoLoadededMetadata = this._onVideoLoadededMetadata.bind(this);
    this.__onPostrollTimeUpdate = this._onPostrollTimeUpdate.bind(this);
    this.__startVideoPlayback = this._startVideoPlayback.bind(this);
    this.__startPostrollPlayback = this._startPostrollPlayback.bind(this);
    this.__resetPlayback = this._resetPlayback.bind(this);
    this.__resetPreview = this._resetPreview.bind(this);

    // Get the duration from the video
    this.video.addEventListener('canplaythrough', this.__onVideoCanPlayThrough);
    if (this.video.duration) {
        this._setDuration(this.video.duration);
        this._resetPostroll();
    } else {
        this._setDuration(0);
        this.video.addEventListener('loadedmetadata', this.__onVideoLoadededMetadata);
    }

    // Set initial flags
    this._playing = false;
    this._canPlayThrough = false;
    this._playWhenReady = false;

    // Add event listeners
    if (options.useEventHandlers !== false) {
        this._addEventHandlers(options.playEvents, options.stopEvents);
    }
}

LivePhoto.prototype = {
    /**
     * Adds UI event listeners for Live Photo
     *
     * @param  {Array|function|string} playEvents - events that should initialize Live Photo playback
     * @param  {Array|function|string} stopEvents - events that should interrupt Live Photo playback
     *
     * @private
     */
    _addEventHandlers: function(playEvents, stopEvents) {
        var container = this.container;

        var bootstrapped = false;
        var playVideo = this.play.bind(this);
        var video = this.video;
        var postroll = this.postroll;
        var play = function(e) {
            e.preventDefault();
            if (bootstrapped) {
                playVideo();
            } else {
                var videoReady = false;
                var postrollReady = false;
                warmVideoTubes(video, function() {
                    videoReady = true;
                    if (postrollReady) {
                        playVideo();
                    }
                });
                warmVideoTubes(postroll, function() {
                    postrollReady = true;
                    if (videoReady) {
                        playVideo();
                    }
                });
                bootstrapped = true;
            }
        };
        (playEvents && playEvents !== false) || (playEvents = defaultPlayEvents);
        if (typeof playEvents === 'function') {
            playEvents = playEvents(this);
        }
        if (typeof playEvents === 'string') {
            playEvents = playEvents.split(/[,\s]+/);
        }
        playEvents.forEach(function(playEvent) {
            if (playEvent) {
                container.addEventListener(playEvent, play);
            }
        });

        var stopVideo = this.stop.bind(this);
        var stop = function(e) {
            e.preventDefault();
            stopVideo();
        };
        (stopEvents && stopEvents !== false) || (stopEvents = defaultStopEvents);
        if (typeof stopEvents === 'function') {
            stopEvents = stopEvents(this);
        }
        if (typeof stopEvents === 'string') {
            stopEvents = stopEvents.split(/[,\s]+/);
        }
        stopEvents.forEach(function(stopEvent) {
            if (stopEvent) {
                container.addEventListener(stopEvent, stop);
            }
        });
    },

    /**
     * Handles first `canplaythrough` event, indicating that the Live Photo is ready for interactive playback
     *
     * @private
     */
    _onVideoCanPlayThrough: function() {
        this._canPlayThrough = true;
        if (this._playWhenReady) {
            this._playWhenReady = false;
            this.play();
        }
        this.container.classList.remove('loading');
        this.video.removeEventListener('canplaythrough', this.__onVideoCanPlayThrough);
    },

    /**
     * Handles the first `loadedmetadata` event, indicating that the video duration is available
     * and that seeking is available
     *
     * @private
     */
    _onVideoLoadededMetadata: function() {
        this._setDuration(this.video.duration || 0);
        this._resetPostroll();
        this.video.removeEventListener('loadedmetadata', this.__onVideoLoadededMetadata);
    },

    /**
     * Used to determine when the Live Photo "preview" should stop
     *
     * @private
     */
    _onPostrollTimeUpdate: function(e) {
        if (this.postroll.currentTime >= this.stillImageTime - 0.1) {
            this._resetPreview();
        }
    },

    /**
     * Cleans up any timeouts and event listeners used during Live Photo playback
     *
     * @private
     */
    _clearTimeouts: function() {
        clearTimeout(this._resetVideoTimeout);
        clearTimeout(this._resetPostrollTimeout);
        clearTimeout(this._resetPreviewTimeout);
        this.postroll.removeEventListener('timeupdate', this.__onPostrollTimeUpdate);
    },

    /**
     * Sets the duration of the video, which may be used to estimate the still image and preview
     * playback start times
     *
     * @param  {number} duration - video duration in seconds
     *
     * @private
     */
    _setDuration: function(duration) {
        this.duration = duration;
        if (typeof this.stillImageTime !== 'number' || isNaN(this.stillImageTime)) {
            // com.apple.quicktime.still-image-time
            // The real keyframe time is stored in the metadata, but if we don't have it, assume
            // that we should start in the middle instead
            this.stillImageTime = duration * 0.5;
        }
        this.previewStart = Math.max(0, this.stillImageTime - this.previewMs / 1000);
    },

    /**
     * Pauses the postroll and reset to the still image time
     *
     * @private
     */
    _resetPostroll: function() {
        this.postroll.pause();
        this.postroll.currentTime = this.stillImageTime;
    },

    /**
     * Pauses the video and reset to the beginning
     *
     * @private
     */
    _resetVideo: function() {
        this.video.pause();
        this.video.currentTime = 0;
        this.video.muted = false;
    },

    /**
     * Starts video playback, interrupting any postroll playback
     *
     * @private
     */
    _startVideoPlayback: function() {
        this.video.play();
        this._resetPostroll();
    },

    /**
     * Restarts postroll playback
     *
     * @private
     */
    _startPostrollPlayback: function() {
        this._resetPostroll();
        this.postroll.play();
    },

    /**
     * Resets Live Photo playback, including both the video and the postroll
     *
     * @private
     */
    _resetPlayback: function() {
        this._playing = false;
        this._resetVideo();
        this._resetPostroll();
    },

    /**
     * Stops Live Photo preview playback, resetting the postroll
     *
     * @private
     */
    _resetPreview: function() {
        this.postroll.removeEventListener('timeupdate', this.__onPostrollTimeUpdate);
        this._resetPostroll();
        this.container.classList.remove('preview');
    },

    /**
     * Loads the media for the video and preroll
     *
     * @method
     */
    load: function() {
        this.video.load();
        this.postroll.load();
    },

    /**
     * Starts Live Photo playback from the beginning, if it is not already playing
     *
     * @method
     */
    play: function() {
        if (this._playing) {
            return;
        }

        if (!this._canPlayThrough) {
            this._playWhenReady = true;
            this._clearTimeouts();
            this.load();
            this.container.classList.add('loading');
            return;
        }

        this._playing = true;
        this._clearTimeouts();

        this._startPostrollPlayback();
        this.video.currentTime = 0;
        this._resetPostrollTimeout = setTimeout(this.__startVideoPlayback, this.postrollMs);
        this.container.classList.add('active');
    },

    /**
     * Stops Live Photo playback and returns to the inactive state
     *
     * @method
     */
    stop: function() {
        if (!this._playing) {
            return;
        }

        this.video.muted = true;
        this._clearTimeouts();
        this.container.classList.remove('active');

        this._resetVideoTimeout = setTimeout(this.__resetPlayback, this.deactivateMs);
    },

    /**
     * Plays the Live Photo preview, which is about one second starting from the still image time
     *
     * @method
     */
    preview: function() {
        if (this._playing) {
            return;
        }

        this._clearTimeouts();

        this.postroll.currentTime = this.previewStart;
        this.postroll.play();
        this.container.classList.add('preview');

        this._previewCompleteTimeout = setTimeout(this.__resetPreview, 1000 * (this.stillImageTime - this.previewStart));

        // The preview is over once we hit the correct time
        this.postroll.addEventListener('timeupdate', this.__onPostrollTimeUpdate);
    },
};

module.exports = LivePhoto;
