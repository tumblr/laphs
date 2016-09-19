Laphs: Live Photos on the Web
=============================

Add support for Apple's Live Photos on the Web! Brought to you by <a href="https://www.tumblr.com/tv/cats" target="_blank">Tumblr</a>.

## Demo

Click and hold down the following image to see it move.

<figure class="demo">
    <img src="https://68.media.tumblr.com/d5adbcc54a9de542e9eb156d64423512/tumblr_odrntaUSj11tfv1z4o1_1280.jpg" data-live-photo="https://68.media.tumblr.com/d5adbcc54a9de542e9eb156d64423512/tumblr_odrntaUSj11tfv1z4o1.mp4" data-live-photo-still-image-time="1.71"/>
</figure>
<script src="./laphs.js"></script>
<script src="./script.js"></script>

## Easy Setup

First, add the [JavaScript library](https://github.com/tumblr/live-photos/blob/master/dist/laphs.min.js) to your page. If you prefer, you can install it from [npm](https://www.npmjs.com/package/laphs) instead.

Next, add the special data attributes to your image markup:

```html
<img src="STILL-PHOTO.jpg" data-live-photo="LIVE-PHOTO.mov" data-live-photo-still-image-time="1.71"/>
```

Finally, include the following code snippet at the bottom of your page:

```html
<script>LivePhotos.initialize();</script>
```
