(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["LivePhotos"] = factory();
	else
		root["LivePhotos"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var LivePhoto = __webpack_require__(1);
	var styles = __webpack_require__(4);

	var supportsLivePhotos = true;
	var stylesInUse = 0;
	var useStyles = true;

	/**
	 * Initializes the Live Photos on a page specified by the `data-live-photo` attribute or supplied
	 *
	 * @memberof LivePhotos
	 * @static
	 * @alias initialize
	 *
	 * @param  {Object|Array|string} [elements] - elements or selectors to create Live Photos from
	 * @param  {Object} [options] - options passed to each live photo
	 *
	 * @return {Array<LivePhoto>} Array of {@link LivePhoto} instances
	 */
	function initializeLivePhotos(elements, options) {
	    if (!supportsLivePhotos) {
	        return;
	    }

	    if (useStyles) {
	        addStyles();
	    }

	    if (typeof elements === 'object' && elements.toString() === '[object Object]') {
	        options = elements;
	        elements = options.elements;
	        delete options.elements;
	    }

	    elements || (elements = 'img[data-live-photo]');

	    if (typeof elements === 'string') {
	        elements = document.querySelectorAll(elements);
	    }

	    if (elements instanceof HTMLElement) {
	        elements = [elements];
	    }

	    var livePhotos = [];
	    Array.prototype.forEach.call(elements, function(el) {
	        if (typeof el === 'string') {
	            el = document.querySelector(el);
	        }

	        if (el) {
	            var livePhoto = new LivePhoto(el, options);
	            livePhotos.push(livePhoto);
	        }
	    });

	    return livePhotos;
	}

	/**
	 * Appends the styles to the page
	 *
	 * @memberof LivePhotos
	 * @static
	 */
	function addStyles() {
	    styles.use();
	    stylesInUse++;
	}

	/**
	 * Prevents styles from being appended to the page
	 *
	 * @memberof LivePhotos
	 * @static
	 */
	function noStyles() {
	    useStyles = false;
	}

	/**
	 * Removes appended styles
	 *
	 * @memberof LivePhotos
	 * @static
	 */
	function cleanup() {
	    while (stylesInUse > 0) {
	        styles.unuse();
	        stylesInUse--;
	    }
	}

	/**
	 * By default, this module acts as a function that creates LivePhotos, but using the
	 * {@linkplain LivePhotos.initialize static method} is preferable.
	 *
	 * @namespace LivePhotos
	 * @see {@link LivePhotos.initialize}
	 */
	function LivePhotos(elements, options) {
	    return initializeLivePhotos(elements, options);
	}

	LivePhotos.initialize = initializeLivePhotos;
	LivePhotos.addStyles = addStyles;
	LivePhotos.noStyles = noStyles;
	LivePhotos.cleanup = cleanup;

	/**
	 * Passthrough for the {@link LivePhoto} class
	 *
	 * @memberof LivePhotos
	 * @see {@link LivePhoto}
	 */
	LivePhotos.LivePhoto = LivePhoto;

	module.exports = LivePhotos;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var enableInlineVideo = __webpack_require__(2);
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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*! npm.im/iphone-inline-video */
	'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

	var Symbol = _interopDefault(__webpack_require__(3));

	function Intervalometer(cb) {
		var rafId;
		var previousLoopTime;
		function loop(now) {
			// must be requested before cb() because that might call .stop()
			rafId = requestAnimationFrame(loop);
			cb(now - (previousLoopTime || now)); // ms since last call. 0 on start()
			previousLoopTime = now;
		}
		this.start = function () {
			if (!rafId) { // prevent double starts
				loop(0);
			}
		};
		this.stop = function () {
			cancelAnimationFrame(rafId);
			rafId = null;
			previousLoopTime = 0;
		};
	}

	function preventEvent(element, eventName, toggleProperty, preventWithProperty) {
		function handler(e) {
			if (Boolean(element[toggleProperty]) === Boolean(preventWithProperty)) {
				e.stopImmediatePropagation();
				// console.log(eventName, 'prevented on', element);
			}
			delete element[toggleProperty];
		}
		element.addEventListener(eventName, handler, false);

		// Return handler to allow to disable the prevention. Usage:
		// const preventionHandler = preventEvent(el, 'click');
		// el.removeEventHandler('click', preventionHandler);
		return handler;
	}

	function proxyProperty(object, propertyName, sourceObject, copyFirst) {
		function get() {
			return sourceObject[propertyName];
		}
		function set(value) {
			sourceObject[propertyName] = value;
		}

		if (copyFirst) {
			set(object[propertyName]);
		}

		Object.defineProperty(object, propertyName, {get: get, set: set});
	}

	function proxyEvent(object, eventName, sourceObject) {
		sourceObject.addEventListener(eventName, function () { return object.dispatchEvent(new Event(eventName)); });
	}

	function dispatchEventAsync(element, type) {
		Promise.resolve().then(function () {
			element.dispatchEvent(new Event(type));
		});
	}

	// iOS 10 adds support for native inline playback + silent autoplay
	// Also adds unprefixed css-grid. This check essentially excludes
	var isWhitelisted = /iPhone|iPod/i.test(navigator.userAgent) && document.head.style.grid === undefined;

	var ಠ = Symbol();
	var ಠevent = Symbol();
	var ಠplay = Symbol('nativeplay');
	var ಠpause = Symbol('nativepause');

	/**
	 * UTILS
	 */

	function getAudioFromVideo(video) {
		var audio = new Audio();
		proxyEvent(video, 'play', audio);
		proxyEvent(video, 'playing', audio);
		proxyEvent(video, 'pause', audio);
		audio.crossOrigin = video.crossOrigin;

		// 'data:' causes audio.networkState > 0
		// which then allows to keep <audio> in a resumable playing state
		// i.e. once you set a real src it will keep playing if it was if .play() was called
		audio.src = video.src || video.currentSrc || 'data:';

		// if (audio.src === 'data:') {
		//   TODO: wait for video to be selected
		// }
		return audio;
	}

	var lastRequests = [];
	var requestIndex = 0;
	var lastTimeupdateEvent;

	function setTime(video, time, rememberOnly) {
		// allow one timeupdate event every 200+ ms
		if ((lastTimeupdateEvent || 0) + 200 < Date.now()) {
			video[ಠevent] = true;
			lastTimeupdateEvent = Date.now();
		}
		if (!rememberOnly) {
			video.currentTime = time;
		}
		lastRequests[++requestIndex % 3] = time * 100 | 0 / 100;
	}

	function isPlayerEnded(player) {
		return player.driver.currentTime >= player.video.duration;
	}

	function update(timeDiff) {
		var player = this;
		// console.log('update', player.video.readyState, player.video.networkState, player.driver.readyState, player.driver.networkState, player.driver.paused);
		if (player.video.readyState >= player.video.HAVE_FUTURE_DATA) {
			if (!player.hasAudio) {
				player.driver.currentTime = player.video.currentTime + (timeDiff * player.video.playbackRate) / 1000;
				if (player.video.loop && isPlayerEnded(player)) {
					player.driver.currentTime = 0;
				}
			}
			setTime(player.video, player.driver.currentTime);
		} else if (player.video.networkState === player.video.NETWORK_IDLE && !player.video.buffered.length) {
			// this should happen when the source is available but:
			// - it's potentially playing (.paused === false)
			// - it's not ready to play
			// - it's not loading
			// If it hasAudio, that will be loaded in the 'emptied' handler below
			player.video.load();
			// console.log('Will load');
		}

		// console.assert(player.video.currentTime === player.driver.currentTime, 'Video not updating!');

		if (player.video.ended) {
			delete player.video[ಠevent]; // allow timeupdate event
			player.video.pause(true);
		}
	}

	/**
	 * METHODS
	 */

	function play() {
		// console.log('play');
		var video = this;
		var player = video[ಠ];

		// if it's fullscreen, use the native player
		if (video.webkitDisplayingFullscreen) {
			video[ಠplay]();
			return;
		}

		if (player.driver.src !== 'data:' && player.driver.src !== video.src) {
			// console.log('src changed on play', video.src);
			setTime(video, 0, true);
			player.driver.src = video.src;
		}

		if (!video.paused) {
			return;
		}
		player.paused = false;

		if (!video.buffered.length) {
			// .load() causes the emptied event
			// the alternative is .play()+.pause() but that triggers play/pause events, even worse
			// possibly the alternative is preventing this event only once
			video.load();
		}

		player.driver.play();
		player.updater.start();

		if (!player.hasAudio) {
			dispatchEventAsync(video, 'play');
			if (player.video.readyState >= player.video.HAVE_ENOUGH_DATA) {
				// console.log('onplay');
				dispatchEventAsync(video, 'playing');
			}
		}
	}
	function pause(forceEvents) {
		// console.log('pause');
		var video = this;
		var player = video[ಠ];

		player.driver.pause();
		player.updater.stop();

		// if it's fullscreen, the developer the native player.pause()
		// This is at the end of pause() because it also
		// needs to make sure that the simulation is paused
		if (video.webkitDisplayingFullscreen) {
			video[ಠpause]();
		}

		if (player.paused && !forceEvents) {
			return;
		}

		player.paused = true;
		if (!player.hasAudio) {
			dispatchEventAsync(video, 'pause');
		}
		if (video.ended) {
			video[ಠevent] = true;
			dispatchEventAsync(video, 'ended');
		}
	}

	/**
	 * SETUP
	 */

	function addPlayer(video, hasAudio) {
		var player = video[ಠ] = {};
		player.paused = true; // track whether 'pause' events have been fired
		player.hasAudio = hasAudio;
		player.video = video;
		player.updater = new Intervalometer(update.bind(player));

		if (hasAudio) {
			player.driver = getAudioFromVideo(video);
		} else {
			video.addEventListener('canplay', function () {
				if (!video.paused) {
					// console.log('oncanplay');
					dispatchEventAsync(video, 'playing');
				}
			});
			player.driver = {
				src: video.src || video.currentSrc || 'data:',
				muted: true,
				paused: true,
				pause: function () {
					player.driver.paused = true;
				},
				play: function () {
					player.driver.paused = false;
					// media automatically goes to 0 if .play() is called when it's done
					if (isPlayerEnded(player)) {
						setTime(video, 0);
					}
				},
				get ended() {
					return isPlayerEnded(player);
				}
			};
		}

		// .load() causes the emptied event
		video.addEventListener('emptied', function () {
			// console.log('driver src is', player.driver.src);
			var wasEmpty = !player.driver.src || player.driver.src === 'data:';
			if (player.driver.src && player.driver.src !== video.src) {
				// console.log('src changed to', video.src);
				setTime(video, 0, true);
				player.driver.src = video.src;
				// playing videos will only keep playing if no src was present when .play()’ed
				if (wasEmpty) {
					player.driver.play();
				} else {
					player.updater.stop();
				}
			}
		}, false);

		// stop programmatic player when OS takes over
		video.addEventListener('webkitbeginfullscreen', function () {
			if (!video.paused) {
				// make sure that the <audio> and the syncer/updater are stopped
				video.pause();

				// play video natively
				video[ಠplay]();
			} else if (hasAudio && !player.driver.buffered.length) {
				// if the first play is native,
				// the <audio> needs to be buffered manually
				// so when the fullscreen ends, it can be set to the same current time
				player.driver.load();
			}
		});
		if (hasAudio) {
			video.addEventListener('webkitendfullscreen', function () {
				// sync audio to new video position
				player.driver.currentTime = video.currentTime;
				// console.assert(player.driver.currentTime === video.currentTime, 'Audio not synced');
			});

			// allow seeking
			video.addEventListener('seeking', function () {
				if (lastRequests.indexOf(video.currentTime * 100 | 0 / 100) < 0) {
					// console.log('User-requested seeking');
					player.driver.currentTime = video.currentTime;
				}
			});
		}
	}

	function overloadAPI(video) {
		var player = video[ಠ];
		video[ಠplay] = video.play;
		video[ಠpause] = video.pause;
		video.play = play;
		video.pause = pause;
		proxyProperty(video, 'paused', player.driver);
		proxyProperty(video, 'muted', player.driver, true);
		proxyProperty(video, 'playbackRate', player.driver, true);
		proxyProperty(video, 'ended', player.driver);
		proxyProperty(video, 'loop', player.driver, true);
		preventEvent(video, 'seeking');
		preventEvent(video, 'seeked');
		preventEvent(video, 'timeupdate', ಠevent, false);
		preventEvent(video, 'ended', ಠevent, false); // prevent occasional native ended events
	}

	function enableInlineVideo(video, hasAudio, onlyWhitelisted) {
		if ( hasAudio === void 0 ) hasAudio = true;
		if ( onlyWhitelisted === void 0 ) onlyWhitelisted = true;

		if ((onlyWhitelisted && !isWhitelisted) || video[ಠ]) {
			return;
		}
		addPlayer(video, hasAudio);
		overloadAPI(video);
		video.classList.add('IIV');
		if (!hasAudio && video.autoplay) {
			video.play();
		}
		if (navigator.platform === 'MacIntel' || navigator.platform === 'Windows') {
			console.warn('iphone-inline-video is not guaranteed to work in emulated environments');
		}
	}

	enableInlineVideo.isWhitelisted = isWhitelisted;

	module.exports = enableInlineVideo;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	var index = typeof Symbol === 'undefined' ? function (description) {
		return '@' + (description || '@') + Math.random();
	} : Symbol;

	module.exports = index;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var refs = 0;
	var dispose;
	var content = __webpack_require__(5);
	if(typeof content === 'string') content = [[module.id, content, '']];
	exports.use = exports.ref = function() {
		if(!(refs++)) {
			exports.locals = content.locals;
			dispose = __webpack_require__(7)(content, {});
		}
		return exports;
	};
	exports.unuse = exports.unref = function() {
		if(!(--refs)) {
			dispose();
			dispose = null;
		}
	};
	if(false) {
		var lastRefs = module.hot.data && module.hot.data.refs || 0;
		if(lastRefs) {
			exports.ref();
			if(!content.locals) {
				refs = lastRefs;
			}
		}
		if(!content.locals) {
			module.hot.accept();
		}
		module.hot.dispose(function(data) {
			data.refs = content.locals ? 0 : refs;
			if(dispose) {
				dispose();
			}
		});
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, ".live-photo {\n  position: relative;\n  overflow: hidden;\n  cursor: pointer; }\n  .live-photo video,\n  .live-photo img {\n    display: block;\n    max-width: 100%; }\n  .live-photo video {\n    position: absolute;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    pointer-events: none;\n    -ms-touch-action: none;\n        touch-action: none; }\n    .live-photo video::-webkit-media-controls-start-playback-button {\n      display: none; }\n  .live-photo .live-photo-icon {\n    display: block;\n    position: absolute;\n    top: 12px;\n    left: 12px;\n    width: 24px;\n    height: 24px;\n    background: url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' fill='%23fff'%3E%3Ctitle%3ELive Photo%3C/title%3E%3Cg fill-rule='evenodd'%3E%3Cpath d='M24 36c6.627 0 12-5.373 12-12s-5.373-12-12-12-12 5.373-12 12 5.373 12 12 12zm0-2c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10z'/%3E%3Cpath d='M24 29a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0-19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4.788.63a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4.462 1.85a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm3.831 2.94a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm2.94 3.831a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm1.849 4.462a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm.63 4.788a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-.63 4.788a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-1.85 4.461a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-2.94 3.831a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-3.831 2.94a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-4.462 1.849a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM24 44a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-4.788-.63a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-4.462-1.85a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-3.831-2.94a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-2.94-3.831a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM6.13 30.288a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5.5 25.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm.63-4.788a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm1.85-4.462a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm2.94-3.831a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm3.831-2.94a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4.462-1.849a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z'/%3E%3C/g%3E%3C/svg%3E\") center center;\n    background-size: contain;\n    -webkit-filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));\n            filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));\n    pointer-events: none; }\n  .live-photo .live-photo-postroll,\n  .live-photo .live-photo-video {\n    opacity: 0; }\n  .live-photo .live-photo-video {\n    -webkit-filter: blur(7.5px);\n            filter: blur(7.5px); }\n  .live-photo .live-photo-keyframe,\n  .live-photo .live-photo-postroll,\n  .live-photo .live-photo-video {\n    will-change: transform, filter, opacity;\n    transition: opacity 0.5s linear, -webkit-transform 0.5s ease-out, -webkit-filter 0.5s linear;\n    transition: transform 0.5s ease-out, filter 0.5s linear, opacity 0.5s linear;\n    transition: transform 0.5s ease-out, filter 0.5s linear, opacity 0.5s linear, -webkit-transform 0.5s ease-out, -webkit-filter 0.5s linear; }\n  .live-photo.loading .live-photo-icon {\n    -webkit-animation: live-photo-icon-loading 0.5s linear alternate infinite both;\n            animation: live-photo-icon-loading 0.5s linear alternate infinite both; }\n  .live-photo.preview .live-photo-postroll {\n    opacity: 1;\n    transition-duration: 0s; }\n  .live-photo.active video,\n  .live-photo.active img {\n    -webkit-transform: scale(1.075, 1.075);\n        -ms-transform: scale(1.075, 1.075);\n            transform: scale(1.075, 1.075); }\n  .live-photo.active .live-photo-postroll {\n    -webkit-animation: live-photo-post-roll 1s both;\n            animation: live-photo-post-roll 1s both; }\n  .live-photo.active .live-photo-video {\n    opacity: 1;\n    -webkit-filter: none;\n            filter: none;\n    transition-delay: 0.375s;\n    transition-duration: 0.625s; }\n\n@-webkit-keyframes live-photo-icon-loading {\n  0% {\n    opacity: 1; }\n  100% {\n    opacity: 0.75; } }\n\n@keyframes live-photo-icon-loading {\n  0% {\n    opacity: 1; }\n  100% {\n    opacity: 0.75; } }\n\n@-webkit-keyframes live-photo-post-roll {\n  0% {\n    opacity: 0;\n    -webkit-filter: blur(0);\n            filter: blur(0); }\n  2% {\n    opacity: 1; }\n  37.5% {\n    opacity: 1;\n    -webkit-filter: blur(7.5px);\n            filter: blur(7.5px); }\n  100% {\n    opacity: 0; } }\n\n@keyframes live-photo-post-roll {\n  0% {\n    opacity: 0;\n    -webkit-filter: blur(0);\n            filter: blur(0); }\n  2% {\n    opacity: 1; }\n  37.5% {\n    opacity: 1;\n    -webkit-filter: blur(7.5px);\n            filter: blur(7.5px); }\n  100% {\n    opacity: 0; } }\n", ""]);

	// exports


/***/ },
/* 6 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }
/******/ ])
});
;