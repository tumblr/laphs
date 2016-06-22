Live Photos on the Web
======================

Add support for Live Photos in web browsers.

## Installation

### Using npm

Install the library:

    npm install --save live-photos

Include it into your module:

```js
var LivePhotos = require('live-photos');
```

### The old-fashioned way

Copy `dist/live-photos.min.js` into your project and include it in a `<script>` tag on your page. This will make the `LivePhotos` global variable available.

## Usage

[Full documentation](https://tumblr.github.io/live-photos)

The easiest way to use this library is by using special data-attributes on your Live Photo `<img>` tags.

```html
<img src="http://40.media.tumblr.com/3613923b93c21e78bc9e8935220c186a/tumblr_o63c4ekE1X1twn7m0o1_1280.jpg" data-live-photo="http://53.media.tumblr.com/3613923b93c21e78bc9e8935220c186a/tumblr_o63c4ekE1X1twn7m0o1.mov" data-live-photo-still-image-time="1.71"/>
```

* `src` is the URL of the keyframe image
* `data-live-photo` is the URL of the Live Photo video file
* `data-live-photo-still-image-time` is the time (in seconds) corresponding to where they keyframe was pulled from the video

Include this JavaScript to find and convert all such images that it finds on the page:

```js
LivePhotos.initialize();
```

You can also pass elements or custom selectors manually, if you prefer:

```js
LivePhotos.initialize(el);
// or...
LivePhotos.initialize([el1, el2, el3]);
// or...
LivePhotos.initialize('.my-live-photos');
```

The `LivePhotos` function returns an array of `LivePhoto` objects, which are described in more detail below.

By default, this library injects styles to make your Live Photos look nice. If you prefer, you can disable this behavior before you scan for Live Photos:

```js
LivePhotos.noStyles();
// Subsequent calls will not inject the styles
```

### The LivePhoto Object

Live Photos created using this library are wrapped in a `LivePhoto` object that has an API for playback

The following methods are available on Live Photos:

* `load` triggers loading the video assets for the Live Photo
* `play` activates Live Photo playback, stopping on the last frmae
* `stop` deactivates Live Photo playback, transitioning back to the keyframe
* `preview` plays a short clip of the video just before the keyframe, which mimicking the behavior of Live Photos viewed in the Photos App on an iOS device

If you like, you can create a `LivePhoto` object directly by passing an element with `src`, `data-live-photo`, and `data-live-photo-still-image-time` attributes:

```js
var livePhoto = new LivePhotos.LivePhoto(el, options);
```

You may also pass the keyframe and video URLs and the keyframe time directly:

```js
var livePhoto = new LivePhotos.LivePhoto(keyframeUrl, videoUrl, stillImageTime, options);
```

## Contributing

### Pull Requests

1. Fork the repo and create your branch from `master`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. If you haven't already, complete the Contributor License Agreement ("CLA").

### Contributor License Agreement ("CLA")

In order to accept your pull request, we need you to submit a CLA.

Complete the CLA [here](http://static.tumblr.com/zyubucd/GaTngbrpr/tumblr_corporate_contributor_license_agreement_v1__10-7-14.pdf).

## Copyright and license

Copyright 2016 Tumblr, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this work except in compliance with the License. You may obtain a copy of
the License in the [LICENSE](LICENSE) file, or at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations.
