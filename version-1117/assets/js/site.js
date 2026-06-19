(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = selectAll('[data-hero-slide]', carousel);
        var dots = selectAll('[data-hero-dot]', carousel);
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var next = carousel.querySelector('[data-hero-next]');
        var prev = carousel.querySelector('[data-hero-prev]');

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    selectAll('[data-filter-form]').forEach(function (form) {
        var target = document.querySelector(form.getAttribute('data-filter-target'));
        if (!target) {
            return;
        }

        var cards = selectAll('[data-movie-card]', target);

        function applyFilter() {
            var keyword = normalize(form.elements.keyword && form.elements.keyword.value);
            var year = normalize(form.elements.year && form.elements.year.value);
            var type = normalize(form.elements.type && form.elements.type.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-type')
                ].join(' '));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
                var matchType = !type || normalize(card.getAttribute('data-type')) === type;
                card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
            });
        }

        form.addEventListener('input', applyFilter);
        form.addEventListener('change', applyFilter);
        form.addEventListener('reset', function () {
            window.setTimeout(applyFilter, 0);
        });
    });

    var searchRoot = document.querySelector('[data-search-page]');

    if (searchRoot && window.MOVIE_SEARCH_DATA) {
        var input = document.getElementById('searchInput');
        var form = document.getElementById('searchPageForm');
        var results = document.getElementById('searchResults');
        var status = document.getElementById('searchStatus');
        var hot = document.getElementById('searchHot');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input) {
            input.value = initialQuery;
        }

        function cardTemplate(movie) {
            return '<article class="movie-card">' +
                '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
                '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '<span class="poster-shadow"></span>' +
                '<span class="card-year">' + escapeHtml(movie.year) + '</span>' +
                '<span class="card-play">▶</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                '<div class="tag-line"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
                '</div>' +
                '</article>';
        }

        function renderSearch(query) {
            var word = normalize(query);
            var matched = [];

            if (word) {
                matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                    return normalize([
                        movie.title,
                        movie.region,
                        movie.type,
                        movie.year,
                        movie.genre,
                        movie.tags,
                        movie.category,
                        movie.oneLine
                    ].join(' ')).indexOf(word) !== -1;
                }).slice(0, 120);
            }

            if (!word) {
                status.textContent = '输入关键词后即可查看匹配影片。';
                results.innerHTML = '';
                if (hot) {
                    hot.style.display = '';
                }
                return;
            }

            if (hot) {
                hot.style.display = 'none';
            }

            if (!matched.length) {
                status.textContent = '没有找到匹配影片，可尝试更换关键词。';
                results.innerHTML = '';
                return;
            }

            status.textContent = '找到 ' + matched.length + ' 部相关影片';
            results.innerHTML = matched.map(cardTemplate).join('');
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = input ? input.value.trim() : '';
                var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
                window.history.replaceState(null, '', nextUrl);
                renderSearch(query);
            });
        }

        renderSearch(initialQuery);
    }
})();
