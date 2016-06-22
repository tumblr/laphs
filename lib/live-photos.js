var LivePhoto = require('./live-photo');
var styles = require('./styles.scss');

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
