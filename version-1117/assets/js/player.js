(function () {
    window.setupMoviePlayer = function (options) {
        var video = document.querySelector(options.videoSelector);
        var trigger = document.querySelector(options.triggerSelector);
        var source = options.source;
        var ready = false;
        var hls = null;

        if (!video || !trigger || !source) {
            return;
        }

        function attachSource() {
            if (ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            ready = true;
        }

        function begin(event) {
            if (event) {
                event.preventDefault();
            }

            attachSource();
            trigger.classList.add('is-hidden');
            var promise = video.play();

            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        trigger.addEventListener('click', begin);
        video.addEventListener('click', function () {
            if (!ready) {
                begin();
            }
        });

        video.addEventListener('play', function () {
            trigger.classList.add('is-hidden');
        });

        window.addEventListener('beforeunload', function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    };
})();
