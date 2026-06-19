(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var previous = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var index = 0;
            var timer;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }

            function schedule() {
                clearInterval(timer);
                timer = setInterval(function () {
                    show(index + 1);
                }, 5600);
            }

            if (previous) {
                previous.addEventListener('click', function () {
                    show(index - 1);
                    schedule();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    schedule();
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    schedule();
                });
            });

            hero.addEventListener('mouseenter', function () {
                clearInterval(timer);
            });

            hero.addEventListener('mouseleave', schedule);

            show(0);
            schedule();
        });

        document.querySelectorAll('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
            button.addEventListener('click', function () {
                var id = button.getAttribute('data-scroll-left') || button.getAttribute('data-scroll-right');
                var row = document.getElementById(id);
                if (!row) {
                    return;
                }
                var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;
                row.scrollBy({ left: direction * 420, behavior: 'smooth' });
            });
        });

        document.querySelectorAll('[data-filter-form]').forEach(function (form) {
            var scope = form.closest('[data-filter-scope]') || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
            var input = form.querySelector('[data-filter-input]');
            var year = form.querySelector('[data-year-filter]');
            var type = form.querySelector('[data-type-filter]');
            var empty = scope.querySelector('[data-empty-state]');

            function applyFilters() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var yearValue = year ? year.value : '';
                var typeValue = type ? type.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var match = true;

                    if (query && text.indexOf(query) === -1) {
                        match = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        match = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        match = false;
                    }

                    card.classList.toggle('is-hidden', !match);
                    if (match) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            ['input', 'change'].forEach(function (eventName) {
                form.addEventListener(eventName, applyFilters);
            });
        });

        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('[data-play-button]');
            var stream = player.getAttribute('data-stream');
            var initialized = false;

            function start() {
                if (!video || !stream) {
                    return;
                }

                if (!initialized) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = stream;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                        player.hlsInstance = hls;
                    } else {
                        video.src = stream;
                    }
                    initialized = true;
                }

                if (overlay) {
                    overlay.classList.add('is-hidden');
                }

                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', start);
            }

            player.addEventListener('click', function (event) {
                if (event.target === video) {
                    return;
                }
                if (!initialized) {
                    start();
                }
            });
        });
    });
}());
