(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initSearchForms() {
        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var target = form.getAttribute('action') || './search.html';
                if (query) {
                    window.location.href = target + '?q=' + encodeURIComponent(query);
                } else {
                    window.location.href = target;
                }
            });
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function cardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type')
        ].join(' '));
    }

    function setEmpty(scope, visibleCount) {
        var parent = scope.closest('section') || document;
        var empty = parent.querySelector('[data-empty-state]');
        if (empty) {
            empty.classList.toggle('visible', visibleCount === 0);
        }
    }

    function applyTextFilter(scope, query) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var needle = normalize(query);
        var visibleCount = 0;
        cards.forEach(function (card) {
            var matched = !needle || cardText(card).indexOf(needle) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visibleCount += 1;
            }
        });
        setEmpty(scope, visibleCount);
    }

    function initSearchPage() {
        var scope = document.querySelector('[data-search-results]');
        if (!scope) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var input = document.querySelector('[data-search-input]');
        if (input) {
            input.value = query;
            input.addEventListener('input', function () {
                applyTextFilter(scope, input.value);
            });
        }
        applyTextFilter(scope, query);
    }

    function initFilters() {
        document.querySelectorAll('[data-filter-group]').forEach(function (group) {
            var section = group.closest('section');
            var scope = section ? section.querySelector('[data-filter-scope]') : null;
            if (!scope) {
                return;
            }
            var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-filter]'));
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    buttons.forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    var rule = button.getAttribute('data-filter') || 'all';
                    var visibleCount = 0;
                    scope.querySelectorAll('.movie-card').forEach(function (card) {
                        var matched = rule === 'all';
                        if (!matched) {
                            var parts = rule.split(':');
                            var key = parts[0];
                            var value = parts.slice(1).join(':');
                            matched = normalize(card.getAttribute('data-' + key)) === normalize(value);
                        }
                        card.style.display = matched ? '' : 'none';
                        if (matched) {
                            visibleCount += 1;
                        }
                    });
                    setEmpty(scope, visibleCount);
                });
            });
        });
    }

    function initBackTop() {
        var button = document.querySelector('[data-back-top]');
        if (!button) {
            return;
        }
        window.addEventListener('scroll', function () {
            button.classList.toggle('visible', window.scrollY > 360);
        });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initSearchPage();
        initFilters();
        initBackTop();
    });
}());
