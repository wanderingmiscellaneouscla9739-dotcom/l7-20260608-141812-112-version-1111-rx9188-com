(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function hide(element) {
    if (element) {
      element.classList.add("hidden");
    }
  }

  function show(element, message) {
    if (element) {
      if (message) {
        element.textContent = message;
      }
      element.classList.remove("hidden");
    }
  }

  ready(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-hls-player]"));

    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var source = shell.getAttribute("data-video-src");
      var loading = shell.querySelector("[data-player-loading]");
      var message = shell.querySelector("[data-player-message]");
      var playButton = shell.querySelector("[data-player-play]");

      if (!video || !source) {
        hide(loading);
        show(message, "视频源暂不可用");
        return;
      }

      function markReady() {
        hide(loading);
      }

      function markError() {
        hide(loading);
        show(message, "视频加载失败，请刷新页面或稍后重试");
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, markReady);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            markError();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", markReady);
        video.addEventListener("error", markError);
      } else {
        hide(loading);
        show(message, "当前浏览器暂不支持 HLS 播放");
      }

      if (playButton) {
        playButton.addEventListener("click", function () {
          hide(message);
          video.play().then(function () {
            hide(playButton);
          }).catch(function () {
            show(message, "请再次点击播放或检查浏览器自动播放权限");
          });
        });
      }

      video.addEventListener("play", function () {
        hide(playButton);
      });

      video.addEventListener("pause", function () {
        if (video.currentTime < video.duration) {
          show(playButton);
        }
      });

      video.addEventListener("error", markError);
    });
  });
})();
