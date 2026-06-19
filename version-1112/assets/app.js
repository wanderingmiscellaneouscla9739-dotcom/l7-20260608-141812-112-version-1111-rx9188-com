(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.hasAttribute('hidden') === false;
      if (isOpen) {
        mobilePanel.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
      } else {
        mobilePanel.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var heroIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    showSlide(0);
    window.setInterval(function () {
      showSlide(heroIndex + 1);
    }, 5200);
  }

  function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
  }

  var filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var qInput = filterForm.querySelector('[name="filter_q"]');
    var yearSelect = filterForm.querySelector('[name="filter_year"]');
    var typeSelect = filterForm.querySelector('[name="filter_type"]');

    function applyFilter() {
      var q = normalizeText(qInput && qInput.value);
      var year = normalizeText(yearSelect && yearSelect.value);
      var type = normalizeText(typeSelect && typeSelect.value);

      cards.forEach(function (card) {
        var blob = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region')
        ].join(' ').toLowerCase();
        var matchesQ = !q || blob.indexOf(q) !== -1;
        var matchesYear = !year || normalizeText(card.getAttribute('data-year')) === year;
        var matchesType = !type || normalizeText(card.getAttribute('data-type')).indexOf(type) !== -1;
        card.classList.toggle('hidden-by-filter', !(matchesQ && matchesYear && matchesType));
      });
    }

    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    ['input', 'change'].forEach(function (eventName) {
      filterForm.addEventListener(eventName, applyFilter);
    });
  }

  function attachVideo(video) {
    if (!video || video.dataset.ready === '1') {
      return;
    }
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.dataset.ready = '1';
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hlsPlayer = hls;
      video.dataset.ready = '1';
      return;
    }
    video.src = stream;
    video.dataset.ready = '1';
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-button');

    function start() {
      attachVideo(video);
      shell.classList.add('playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          shell.classList.remove('playing');
        }
      });
    }
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.SITE_MOVIES) {
    var form = searchPage.querySelector('[data-search-form]');
    var input = searchPage.querySelector('[name="q"]');
    var state = searchPage.querySelector('[data-search-state]');
    var results = searchPage.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function createCard(item) {
      var article = document.createElement('article');
      article.className = 'movie-card';
      article.innerHTML = [
        '<a href="' + item.file + '" class="poster-link" aria-label="观看' + item.titleEscaped + '">',
        '  <img src="' + item.cover + '" alt="' + item.titleEscaped + '" loading="lazy">',
        '  <span class="poster-gradient"></span>',
        '  <span class="type-pill">' + item.categoryEscaped + '</span>',
        '  <span class="duration-pill">' + item.durationEscaped + '</span>',
        '</a>',
        '<div class="movie-card-body">',
        '  <h2><a href="' + item.file + '">' + item.titleEscaped + '</a></h2>',
        '  <p>' + item.lineEscaped + '</p>',
        '  <div class="card-meta">',
        '    <span>⭐ ' + item.rating + '</span>',
        '    <span>' + item.yearEscaped + '</span>',
        '    <span>' + item.regionEscaped + '</span>',
        '  </div>',
        '  <div class="tag-row"><span>' + item.typeEscaped + '</span><span>' + item.genreEscaped + '</span></div>',
        '</div>'
      ].join('');
      return article;
    }

    function runSearch(query) {
      var q = normalizeText(query);
      results.innerHTML = '';
      if (!q) {
        state.textContent = '输入片名、类型、地区或年份即可检索片库。';
        window.SITE_MOVIES.slice(0, 24).forEach(function (item) {
          results.appendChild(createCard(item));
        });
        return;
      }
      var matched = window.SITE_MOVIES.filter(function (item) {
        return item.search.indexOf(q) !== -1;
      }).slice(0, 120);
      state.textContent = matched.length ? '为你找到相关影片。' : '未找到匹配影片。';
      matched.forEach(function (item) {
        results.appendChild(createCard(item));
      });
    }

    if (input) {
      input.value = initialQuery;
    }
    runSearch(initialQuery);

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input ? input.value : '';
        var url = new URL(window.location.href);
        if (value) {
          url.searchParams.set('q', value);
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState({}, '', url.toString());
        runSearch(value);
      });
    }
  }
})();
