(function(LivePhotos, exports) {

    exports.livePhotos = LivePhotos.initialize();

    if ('console' in window) {
        console.log('Greetings, friend! %cTumblr%c here.', 'font-weight:bold;color:#36465d;', '');
        console.log('');

        console.log('I bet you\'re looking for some hints, so here they are:');
        console.log('');

        console.log('%cLivePhotos%c is the Live Photos library.', 'color:#f2992e;', '');
        console.log('The %1$c<img>%2$c tag on this page is brought to life using %1$c<script>%3$cLivePhotos();%1$c</script>%2$c', 'color:#a77dc2;', '', 'color:#f2992e;');

        console.log('%cLivePhotos.LivePhoto%c makes individual Live Photo objects.', 'color:#56bc8a;', '');

        console.log('%clivePhotos%c is an Array of all the Live Photos on this page.', 'color:#529ecc;', '');
        console.log('For example, try %clivePhotos[0].play()%c in the console to activate the example image on this page.', 'color:#529ecc;', '');

        console.log('');
        console.log('Okay, I guess that\'s all. Enjoy! 👌👽 🌭');
    }

})(window.LivePhotos, window);
