function setupMobileMenu() {
    const button = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
        return;
    }

    button.addEventListener('click', function () {
        panel.classList.toggle('is-open');
        button.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
    });
}

function setupHero() {
    const hero = document.querySelector('[data-hero]');

    if (!hero) {
        return;
    }

    const track = hero.querySelector('[data-hero-track]');
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    function render() {
        track.style.transform = 'translateX(-' + active * 100 + '%)';
        dots.forEach(function (dot, index) {
            dot.classList.toggle('is-active', index === active);
            dot.setAttribute('aria-current', index === active ? 'true' : 'false');
        });
    }

    function go(index) {
        active = (index + slides.length) % slides.length;
        render();
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            go(active + 1);
        }, 5000);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    if (prev) {
        prev.addEventListener('click', function () {
            go(active - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            go(active + 1);
            start();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            go(index);
            start();
        });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    render();
    start();
}

function setupFilters() {
    const forms = Array.from(document.querySelectorAll('[data-library-filter]'));

    forms.forEach(function (form) {
        const query = form.querySelector('[data-filter-query]');
        const year = form.querySelector('[data-filter-year]');
        const type = form.querySelector('[data-filter-type]');
        const target = document.querySelector(form.getAttribute('data-library-filter'));
        const note = document.querySelector('[data-filter-note]');

        if (!target) {
            return;
        }

        const cards = Array.from(target.querySelectorAll('.movie-card'));
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');

        if (initialQuery && query && !query.value) {
            query.value = initialQuery;
        }

        function apply() {
            const q = query ? query.value.trim().toLowerCase() : '';
            const y = year ? year.value : '';
            const t = type ? type.value : '';
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                const matchQuery = !q || haystack.indexOf(q) !== -1;
                const matchYear = !y || card.getAttribute('data-year') === y;
                const matchType = !t || card.getAttribute('data-type') === t;
                const matched = matchQuery && matchYear && matchType;

                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (note) {
                note.textContent = visible > 0 ? '当前可浏览 ' + visible + ' 部内容' : '没有匹配内容';
            }
        }

        ['input', 'change'].forEach(function (eventName) {
            if (query) {
                query.addEventListener(eventName, apply);
            }
            if (year) {
                year.addEventListener(eventName, apply);
            }
            if (type) {
                type.addEventListener(eventName, apply);
            }
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            apply();
        });

        apply();
    });
}

function initializeMoviePlayer(sourceUrl) {
    const video = document.getElementById('movie-player');
    const overlay = document.getElementById('movie-play-overlay');
    const message = document.getElementById('player-message');

    if (!video || !overlay || !sourceUrl) {
        return;
    }

    let prepared = false;
    let preparing = null;
    let hls = null;

    function setMessage(text) {
        if (message) {
            message.textContent = text || '';
        }
    }

    function prepare() {
        if (prepared) {
            return Promise.resolve();
        }

        if (preparing) {
            return preparing;
        }

        preparing = new Promise(function (resolve) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                prepared = true;
                resolve();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(sourceUrl);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    prepared = true;
                    resolve();
                });

                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage('播放暂时不可用');
                    }
                });

                window.setTimeout(function () {
                    prepared = true;
                    resolve();
                }, 1400);
                return;
            }

            video.src = sourceUrl;
            prepared = true;
            resolve();
        });

        return preparing;
    }

    function start() {
        setMessage('');
        video.controls = true;
        prepare().then(function () {
            overlay.classList.add('is-hidden');
            const playTask = video.play();

            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        });
    }

    overlay.addEventListener('click', start);

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });

    video.addEventListener('error', function () {
        setMessage('播放暂时不可用');
        overlay.classList.remove('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}

window.initializeMoviePlayer = initializeMoviePlayer;

document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
});
