(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });

      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
      });
    });

    show(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-card-area]').forEach(function (area) {
    var input = area.querySelector('[data-card-search]');
    var chips = Array.prototype.slice.call(area.querySelectorAll('[data-card-filter]'));
    var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card, .rank-item'));
    var activeFilter = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');

      cards.forEach(function (card) {
        var words = normalize(card.getAttribute('data-keywords') || card.textContent);
        var filterText = normalize(card.getAttribute('data-filter-value') || '');
        var matchKeyword = !keyword || words.indexOf(keyword) >= 0;
        var matchFilter = activeFilter === 'all' || filterText.indexOf(normalize(activeFilter)) >= 0;
        card.classList.toggle('hidden-by-filter', !(matchKeyword && matchFilter));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.getAttribute('data-card-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        apply();
      });
    });

    apply();
  });
})();
