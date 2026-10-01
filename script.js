/* ============================================================
   AragveliPalazzolo — interface + scroll motion
   (the WebGL scene lives in scene.js)
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  /* ==========================================================
     DATA
     ========================================================== */

  var MARQUEE_IMAGES = [
    'https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif',
    'https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif',
    'https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif',
    'https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif',
    'https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif',
    'https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif',
    'https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif',
    'https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif',
    'https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif',
    'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',
    'https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif',
    'https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif',
    'https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif',
    'https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif',
    'https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif',
    'https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif',
    'https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif',
    'https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif',
    'https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif',
    'https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif',
    'https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif'
  ];

  var PROJECTS = [
    {
      num: '01',
      name: 'Local Cafe Concept',
      category: 'Local cafe demo',
      url: 'https://uptown-coffee-demo.pages.dev/',
      domain: 'uptown-coffee-demo.pages.dev'
    },
    {
      num: '02',
      name: 'Juice Bar Concept',
      category: 'Local juice bar demo',
      url: 'https://theblendfactory-demo.pages.dev/',
      domain: 'theblendfactory-demo.pages.dev'
    },
    {
      num: '03',
      name: 'Nail Salon Concept',
      category: 'Local nail salon demo',
      url: 'https://aragvelipalazzolo-nail-salon-demo.pages.dev/',
      domain: 'aragvelipalazzolo-nail-salon-demo.pages.dev'
    },
    {
      num: '04',
      name: 'Beauty Studio Concept',
      category: 'Local salon demo',
      url: 'https://paris-2-nails-demo.pages.dev/',
      domain: 'paris-2-nails-demo.pages.dev'
    },
    {
      num: '05',
      name: 'Coffee Shop Concept',
      category: 'Local coffee shop demo',
      url: 'https://lil-honey-coffee-demo.pages.dev/',
      domain: 'lil-honey-coffee-demo.pages.dev'
    },
    {
      num: '06',
      name: 'Café & Wine Bar Concept',
      category: 'Local cafe & wine bar demo',
      url: 'https://aromaticafe.pages.dev/',
      domain: 'aromaticafe.pages.dev'
    }
  ];

  /* Words in the about statement that pick up the gold italic. */
  var GOLD_WORDS = ['actually', 'look', 'good,'];

  /* ==========================================================
     HELPERS
     ========================================================== */

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  function each(selector, fn, root) {
    Array.prototype.forEach.call((root || document).querySelectorAll(selector), fn);
  }

  /* ==========================================================
     PRELOADER — counts up while fonts + scene warm up
     ========================================================== */

  function initLoader(done) {
    var loader = document.querySelector('.loader');
    var count = document.querySelector('[data-loader-count]');
    var bar = document.querySelector('.loader-bar');
    var start = performance.now();
    var minTime = reduceMotion ? 0 : 1500;
    var loaded = false;
    var shown;

    function markLoaded() {
      loaded = true;
    }

    Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise(function (resolve) {
        if (document.readyState === 'complete') resolve();
        else window.addEventListener('load', resolve);
      })
    ]).then(markLoaded);

    // Never hold the page hostage to a slow third-party asset.
    setTimeout(markLoaded, 4000);

    function tick(now) {
      // Time-based so a slow frame rate never stretches the intro.
      var timeP = minTime ? clamp((now - start) / minTime, 0, 1) : 1;
      var eased = 1 - Math.pow(1 - timeP, 3);
      shown = loaded ? eased : Math.min(eased, 0.86);

      count.textContent = Math.round(shown * 100);
      bar.style.setProperty('--p', shown.toFixed(3));

      if (shown >= 1) {
        loader.classList.add('is-done');
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-ready');
        window.dispatchEvent(new Event('app:ready'));
        setTimeout(function () {
          loader.style.display = 'none';
        }, 1400);
        done();
        return;
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ==========================================================
     SPLIT TEXT — chars for the hero, words for headings
     ========================================================== */

  function splitInto(el, mode) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    var index = 0;
    el.textContent = '';

    nodes.forEach(function (node) {
      var isEm = node.nodeType === 1 && node.tagName === 'EM';
      var text = node.textContent;
      var target = el;

      if (isEm) {
        target = document.createElement('em');
        el.appendChild(target);
      }

      var parts = mode === 'chars' ? text.split('') : text.split(/(\s+)/);

      parts.forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          target.appendChild(document.createTextNode(' '));
          return;
        }
        var mask = document.createElement('span');
        mask.className = 'split-mask';
        mask.setAttribute('aria-hidden', 'true');
        var piece = document.createElement('span');
        piece.className = 'split-piece';
        piece.style.setProperty('--i', index++);
        piece.textContent = part;
        mask.appendChild(piece);
        target.appendChild(mask);
      });
    });
  }

  function initSplit() {
    each('[data-split-chars]', function (el) {
      splitInto(el, 'chars');
    });
    each('[data-split-words]', function (el) {
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      splitInto(el, 'words');
    });
  }

  /* ==========================================================
     REVEALS
     ========================================================== */

  function initReveals() {
    var targets = document.querySelectorAll('[data-reveal], [data-split-words]');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(targets, function (el) {
        el.classList.add('is-in');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0 }
    );

    Array.prototype.forEach.call(targets, function (el) {
      observer.observe(el);
    });
  }

  /* ==========================================================
     ABOUT STATEMENT — words light up as it scrolls through
     ========================================================== */

  var statement = null;

  function initStatement() {
    var el = document.querySelector('[data-animated-text]');
    if (!el) return;

    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', words.join(' '));
    el.textContent = '';

    var spans = words.map(function (word, i) {
      var span = document.createElement('span');
      span.className = 'word';
      span.setAttribute('aria-hidden', 'true');
      if (GOLD_WORDS.indexOf(word) !== -1) span.classList.add('is-gold');
      span.textContent = word + (i < words.length - 1 ? ' ' : '');
      el.appendChild(span);
      return span;
    });

    statement = { el: el, words: spans };
  }

  function updateStatement(vh) {
    if (!statement) return;
    var rect = statement.el.getBoundingClientRect();
    var span = 0.55 * vh + rect.height;
    var progress = reduceMotion ? 1 : clamp((0.85 * vh - rect.top) / span, 0, 1);
    var total = statement.words.length;

    statement.words.forEach(function (word, i) {
      var local = clamp(progress * total * 1.15 - i, 0, 1);
      word.style.opacity = (0.14 + 0.86 * local).toFixed(3);
    });
  }

  /* ==========================================================
     3D GALLERY — tilted plane, rows drift with scroll
     ========================================================== */

  var gallery = null;

  function initGallery() {
    var section = document.querySelector('.gallery');
    if (!section) return;

    var plane = section.querySelector('.gallery-plane');
    var tracks = [];
    var sets = [
      MARQUEE_IMAGES.slice(0, 7),
      MARQUEE_IMAGES.slice(7, 14),
      MARQUEE_IMAGES.slice(14)
    ];

    each('.marquee-track', function (track, n) {
      var frag = document.createDocumentFragment();
      for (var pass = 0; pass < 3; pass++) {
        sets[n].forEach(function (src) {
          var img = document.createElement('img');
          img.src = src;
          img.loading = 'lazy';
          img.decoding = 'async';
          img.alt = '';
          frag.appendChild(img);
        });
      }
      track.appendChild(frag);
      tracks.push({ el: track, base: 0, dir: n % 2 ? -1 : 1 });
    }, section);

    gallery = { section: section, plane: plane, tracks: tracks };
    measureGallery();
  }

  function measureGallery() {
    if (!gallery) return;
    gallery.tracks.forEach(function (t) {
      t.base = -t.el.scrollWidth / 3;
    });
  }

  function updateGallery(vh) {
    if (!gallery) return;
    var rect = gallery.section.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > vh + 200) return;

    var progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
    var shift = (vh - rect.top) * 0.35;

    gallery.tracks.forEach(function (t) {
      t.el.style.transform = 'translate3d(' + (t.base + shift * t.dir).toFixed(1) + 'px,0,0)';
    });

    // The plane lies back as it enters and stands up as it leaves.
    gallery.plane.style.setProperty('--gx', (48 - progress * 34).toFixed(2) + 'deg');
  }

  /* ==========================================================
     SERVICE CARDS — scroll-in depth + pointer tilt
     ========================================================== */

  var cards = [];

  function initCards() {
    each('[data-tilt]', function (card, i) {
      cards.push({ el: card, i: i });
      if (!finePointer || reduceMotion) return;

      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.classList.add('is-tilting');
        card.style.setProperty('--ry', ((px - 0.5) * 14).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - py) * 12).toFixed(2) + 'deg');
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });

      card.addEventListener('pointerleave', function () {
        card.classList.remove('is-tilting');
        card.style.transition = 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s ease';
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        setTimeout(function () {
          card.style.transition = '';
        }, 900);
      });
    });
  }

  function updateCards(vh) {
    if (reduceMotion) return;
    cards.forEach(function (c) {
      var rect = c.el.getBoundingClientRect();
      // Staggered: each card starts its rise a little later than the last.
      var p = clamp((vh * 1.02 - rect.top) / (vh * 0.55) - c.i * 0.08, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      c.el.style.setProperty('--enter', eased.toFixed(3));
    });
  }

  /* ==========================================================
     PROJECTS — showcase (index + one large live preview)
     ========================================================== */

  var showcaseSlides = [];
  var showcaseItems = [];
  var showcaseViewport = null;
  var showcaseWindow = null;
  var showcaseOpen = null;
  var showcaseUrl = null;
  var showcaseActive = -1;
  var showcaseTouch = false;

  function initProjects() {
    var root = document.querySelector('.showcase');
    if (!root || !PROJECTS.length) return;

    // Touch devices can't hover, and letting a finger scroll inside an
    // embedded frame traps the page scroll — so there we link out instead.
    showcaseTouch = window.matchMedia('(hover: none)').matches;

    var stage = document.createElement('div');
    stage.className = 'showcase-stage';
    stage.innerHTML =
      '<div class="showcase-window">' +
      '<div class="showcase-chrome"><span class="showcase-dots"><i></i><i></i><i></i></span>' +
      '<span class="showcase-url"></span><span class="showcase-dots" style="visibility:hidden"><i></i><i></i><i></i></span></div>' +
      '<div class="showcase-viewport"></div></div>';

    showcaseWindow = stage.querySelector('.showcase-window');
    showcaseViewport = stage.querySelector('.showcase-viewport');
    showcaseUrl = stage.querySelector('.showcase-url');

    var index = document.createElement('div');
    index.className = 'showcase-index';
    index.innerHTML =
      '<div class="showcase-label"><span>The demos</span><span>' +
      PROJECTS.length + ' concepts</span></div>';

    var list = document.createElement('ol');
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Demo concepts');
    index.appendChild(list);

    PROJECTS.forEach(function (project, i) {
      buildSlide(project, i);
      buildIndexItem(project, i, list);
    });

    var foot = document.createElement('div');
    foot.className = 'showcase-foot';
    foot.innerHTML =
      '<a class="showcase-open btn btn-ghost" target="_blank" rel="noopener noreferrer" data-magnet data-strength="6">' +
      '<span>Open live</span><i class="btn-arrow">&nearr;</i></a>';
    index.appendChild(foot);

    showcaseOpen = foot.querySelector('.showcase-open');

    root.appendChild(index);
    root.appendChild(stage);

    setProject(0, false);
  }

  function buildSlide(project, i) {
    var slide = document.createElement('div');
    slide.className = 'showcase-slide';
    slide.id = 'showcase-slide-' + i;
    slide.setAttribute('role', 'tabpanel');
    slide.setAttribute('aria-labelledby', 'showcase-tab-' + i);

    var frame = null;

    if (project.placeholder) {
      slide.innerHTML =
        '<div class="showcase-empty"><p>This spot is open &mdash; your shop could be the next one here.</p></div>';
    } else {
      slide.innerHTML =
        '<iframe class="showcase-iframe" data-src="' + project.url + '" title="' +
        project.name + ' website preview" loading="lazy" tabindex="-1" ' +
        'sandbox="allow-scripts allow-same-origin allow-popups"></iframe>' +
        '<' + (showcaseTouch ? 'a' : 'button') + ' class="showcase-shield"' +
        (showcaseTouch
          ? ' href="' + project.url + '" target="_blank" rel="noopener noreferrer"'
          : ' type="button"') +
        '><span>' + (showcaseTouch ? 'Open live site' : 'Click to explore') + '</span></' +
        (showcaseTouch ? 'a' : 'button') + '>';

      frame = slide.querySelector('.showcase-iframe');

      if (!showcaseTouch) {
        slide.querySelector('.showcase-shield').addEventListener('click', function () {
          slide.classList.add('is-interactive');
        });
        // Re-arm the shield on the way out so the next scroll past the
        // preview isn't swallowed by the frame.
        slide.addEventListener('mouseleave', function () {
          slide.classList.remove('is-interactive');
        });
      }
    }

    showcaseViewport.appendChild(slide);
    showcaseSlides.push({ slide: slide, frame: frame, project: project });
  }

  function buildIndexItem(project, i, list) {
    var li = document.createElement('li');
    var btn = document.createElement('button');

    btn.type = 'button';
    btn.className = 'showcase-item';
    btn.id = 'showcase-tab-' + i;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'showcase-slide-' + i);
    btn.innerHTML =
      '<span class="showcase-num">' + project.num + '</span>' +
      '<span class="showcase-copy">' +
      '<span class="showcase-category">' + project.category + '</span>' +
      '<span class="showcase-name">' + project.name + '</span>' +
      '</span>';

    btn.addEventListener('click', function () {
      setProject(i, true);
    });

    if (!showcaseTouch) {
      btn.addEventListener('mouseenter', function () {
        setProject(i, false);
      });
    }

    btn.addEventListener('keydown', function (e) {
      var step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      var next = (i + step + showcaseItems.length) % showcaseItems.length;
      setProject(next, true);
    });

    li.appendChild(btn);
    list.appendChild(li);
    showcaseItems.push(btn);
  }

  function setProject(i, focus) {
    if (i === showcaseActive || !showcaseSlides[i]) return;

    var previous = showcaseSlides[showcaseActive];
    if (previous) {
      previous.slide.classList.remove('is-active', 'is-interactive');
    }

    showcaseActive = i;

    var current = showcaseSlides[i];
    current.slide.classList.add('is-active');
    loadFrame(current);
    loadFrame(showcaseSlides[i + 1]);

    showcaseItems.forEach(function (btn, n) {
      var active = n === i;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      btn.tabIndex = active ? 0 : -1;
    });

    var project = current.project;
    showcaseUrl.textContent = project.placeholder ? 'your-shop.com' : project.domain;
    showcaseOpen.querySelector('span').textContent = project.placeholder ? 'Get started' : 'Open live';
    showcaseOpen.href = project.placeholder
      ? 'mailto:AragveliPalazzolo@gmail.com'
      : project.url;

    if (focus) showcaseItems[i].focus();
  }

  function loadFrame(item) {
    if (!item || !item.frame || item.frame.src) return;
    item.frame.src = item.frame.getAttribute('data-src');
  }

  /* The preview window swings up from a tilted plane as it arrives. */
  function updateShowcase(vh) {
    if (!showcaseWindow || reduceMotion) return;
    var section = showcaseWindow.closest('.showcase');
    var rect = section.getBoundingClientRect();
    var p = clamp((vh - rect.top) / (vh * 0.75), 0, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    showcaseWindow.style.setProperty('--tilt', (1 - eased).toFixed(3));
  }

  /* ==========================================================
     NAV — hide on the way down, return on the way up
     ========================================================== */

  var nav = null;
  var lastY = 0;

  function updateNav() {
    if (!nav) nav = document.querySelector('.nav');
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    if (Math.abs(y - lastY) > 6) {
      nav.classList.toggle('is-hidden', y > lastY && y > 400);
      lastY = y;
    }
  }

  /* ==========================================================
     CURSOR + MAGNETS
     ========================================================== */

  function initCursor() {
    if (!finePointer || reduceMotion) return;

    var cursor = document.querySelector('.cursor');
    var dot = cursor.querySelector('.cursor-dot');
    var ring = cursor.querySelector('.cursor-ring');
    var mx = -100, my = -100, rx = -100, ry = -100;

    window.addEventListener('pointermove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      cursor.classList.remove('is-hidden');
    }, { passive: true });

    document.addEventListener('pointerleave', function () {
      cursor.classList.add('is-hidden');
    });

    document.addEventListener('pointerover', function (e) {
      var hot = e.target.closest('a, button, [data-tilt]');
      cursor.classList.toggle('is-hover', !!hot);
      // Over an embedded demo the native cursor is the honest one.
      cursor.classList.toggle('is-hidden', !!e.target.closest('.is-interactive'));
    });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  function initMagnets() {
    if (!finePointer || reduceMotion) return;

    each('[data-magnet]', function (el) {
      var strength = parseFloat(el.getAttribute('data-strength')) || 4;

      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / strength;
        var dy = (e.clientY - (r.top + r.height / 2)) / strength;
        el.style.transition = 'transform 0.2s ease-out, color 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
      });

      el.addEventListener('pointerleave', function () {
        el.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.transform = '';
      });
    });
  }

  /* ==========================================================
     SCROLL LOOP
     ========================================================== */

  var ticking = false;

  function update() {
    var vh = window.innerHeight;
    updateNav();
    updateGallery(vh);
    updateStatement(vh);
    updateCards(vh);
    updateShowcase(vh);
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  /* ==========================================================
     INIT
     ========================================================== */

  function initSmoothScroll() {
    if (reduceMotion || typeof Lenis === 'undefined') return;

    var lenis = new Lenis({
      duration: 1.25,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true
    });

    window.__lenis = lenis;
    lenis.on('scroll', onScroll);

    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(performance.now());

    each('a[href^="#"]', function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        var target = id === '#top' ? 0 : document.querySelector(id);
        if (target === null) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      });
    });
  }

  function init() {
    window.scrollTo(0, 0);

    var year = document.querySelector('[data-year]');
    if (year) year.textContent = new Date().getFullYear();

    initSplit();
    initStatement();
    initGallery();
    initCards();
    initProjects();
    initCursor();
    initMagnets();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      measureGallery();
      onScroll();
    }, { passive: true });
    window.addEventListener('load', function () {
      measureGallery();
      onScroll();
    });

    update();

    initLoader(function () {
      initReveals();
      initSmoothScroll();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
