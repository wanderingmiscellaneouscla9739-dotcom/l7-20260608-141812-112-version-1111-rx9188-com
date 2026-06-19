(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var pages = Array.prototype.slice.call(document.querySelectorAll("[data-filter-page]"));
    pages.forEach(function (page) {
      var input = page.querySelector("[data-filter-input]");
      var year = page.querySelector("[data-filter-year]");
      var category = page.querySelector("[data-filter-category]");
      var cards = Array.prototype.slice.call(page.querySelectorAll("[data-card]"));
      var empty = page.querySelector("[data-filter-empty]");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");

      if (input && q) {
        input.value = q;
      }

      function filter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedCategory = category ? category.value : "";
        var shown = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || ""
          ].join(" ").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardCategory = card.getAttribute("data-category") || "";
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }
          if (selectedCategory && cardCategory !== selectedCategory) {
            matched = false;
          }

          card.classList.toggle("hidden", !matched);
          if (matched) {
            shown += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", shown === 0);
        }
      }

      if (input) {
        input.addEventListener("input", filter);
      }
      if (year) {
        year.addEventListener("change", filter);
      }
      if (category) {
        category.addEventListener("change", filter);
      }
      filter();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();

function initPlayer(playerId, source) {
  var video = document.getElementById(playerId);
  if (!video || !source) {
    return;
  }

  var box = video.closest(".player-box");
  var cover = box ? box.querySelector(".player-cover") : null;
  var loaded = false;
  var hls = null;

  function loadAndPlay() {
    if (!loaded) {
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", loadAndPlay);
  }

  video.addEventListener("click", function () {
    if (!loaded) {
      loadAndPlay();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
