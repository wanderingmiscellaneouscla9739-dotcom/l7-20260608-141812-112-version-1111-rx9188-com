(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initPlayer(box) {
        var video = box.querySelector('video');
        var trigger = box.querySelector('[data-play-trigger]');
        var message = box.querySelector('[data-player-message]');
        var stream = box.getAttribute('data-stream');
        var prepared = false;
        var manifestReady = false;
        var pendingPlay = false;
        var hlsInstance = null;

        function showMessage(text) {
            if (message) {
                message.textContent = text;
                message.classList.add('visible');
            }
        }

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (trigger) {
                        trigger.classList.remove('is-hidden');
                    }
                });
            }
        }

        function prepare() {
            if (prepared || !video || !stream) {
                return;
            }
            prepared = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    manifestReady = true;
                    if (pendingPlay) {
                        playVideo();
                    }
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        showMessage('播放失败，请稍后再试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                manifestReady = true;
            } else {
                showMessage('播放失败，请稍后再试');
            }
        }

        function start() {
            if (!video) {
                return;
            }
            pendingPlay = true;
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
            prepare();
            if (manifestReady || !window.Hls || !window.Hls.isSupported()) {
                playVideo();
            }
        }

        if (trigger) {
            trigger.addEventListener('click', start);
        }
        box.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        document.querySelectorAll('[data-player]').forEach(initPlayer);
    });
}());
