(function () {
  var shell = document.querySelector('[data-player]');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-play-button]');
  var source = video ? video.getAttribute('data-source') : '';
  var loaded = false;
  var stream = null;

  function loadStream() {
    if (loaded || !video || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      stream = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      stream.loadSource(source);
      stream.attachMedia(video);
    } else {
      video.src = source;
    }

    loaded = true;
  }

  function startPlayback() {
    loadStream();

    if (!video) {
      return;
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (stream && typeof stream.destroy === 'function') {
        stream.destroy();
      }
    });
  }
})();
