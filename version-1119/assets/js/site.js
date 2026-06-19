(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-mobile-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var isOpen = mobileNav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === currentSlide);
      });
    }

    function startHero() {
      if (slides.length <= 1) {
        return;
      }
      heroTimer = window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(heroTimer);
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();

    var searchInput = document.querySelector("[data-library-search]");
    var searchButton = document.querySelector("[data-library-search-button]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var searchStatus = document.querySelector("[data-search-status]");
    var emptyState = document.querySelector("[data-empty-state]");

    function filterCards() {
      if (!searchInput || !cards.length) {
        return;
      }

      var keyword = searchInput.value.trim().toLowerCase();
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visibleCount += 1;
        }
      });

      if (searchStatus) {
        searchStatus.textContent = keyword ? "已匹配 " + visibleCount + " 部影片" : "共收录 " + cards.length + " 部影片";
      }
      if (emptyState) {
        emptyState.classList.toggle("show", visibleCount === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", filterCards);
      searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          document.getElementById("library")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
    if (searchButton) {
      searchButton.addEventListener("click", function () {
        filterCards();
        document.getElementById("library")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    filterCards();

    Array.prototype.slice.call(document.querySelectorAll("img")).forEach(function (image) {
      image.addEventListener("error", function () {
        image.style.opacity = "0";
        image.closest(".feature-cover, .poster-cover, .media-cover, .rank-cover, .player-shell")?.classList.add("image-missing");
      }, { once: true });
    });
  });
})();
