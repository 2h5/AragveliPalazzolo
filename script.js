/* ============================================================
   AragvelliPalazzolo — Jack, 3D Creator
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Avoid the browser restoring a mid-page scroll position on reload,
     which would leave the scroll-driven animations out of sync. */
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
      name: 'Uptown Coffee Co.',
      category: 'Maywood, NJ',
      url: 'https://uptown-coffee-demo.pages.dev/',
      domain: 'uptown-coffee-demo.pages.dev'
    },
    {
      num: '02',
      name: 'The Blend Factory',
      category: 'Brooklyn, NY',
      url: 'https://theblendfactory-demo.pages.dev/',
      domain: 'theblendfactory-demo.pages.dev'
    },
    {
      num: '03',
      name: 'Nail Salon',
      category: 'Live Demo',
      url: 'https://aragvelipalazzolo-nail-salon-demo.pages.dev/',
      domain: 'aragvelipalazzolo-nail-salon-demo.pages.dev'
    },
    {
      num: '04',
      name: 'Paris 2 Nails',
      category: 'Live Demo',
      url: 'https://paris-2-nails-demo.pages.dev/',
      domain: 'paris-2-nails-demo.pages.dev'
    }
  ];

  /* ==========================================================
     HELPERS
     ========================================================== */

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  /* ==========================================================
     FADE IN — reveal on scroll into view
     ========================================================== */

  function initFadeIn() {
    var els = document.querySelectorAll('[data-fade]');

    Array.prototype.forEach.call(els, function (el) {
      var x = el.getAttribute('data-x');
      var y = el.getAttribute('data-y');
      var delay = el.getAttribute('data-delay');
      var duration = el.getAttribute('data-duration');

      el.style.setProperty('--fx', (x === null ? 0 : parseFloat(x)) + 'px');
      el.style.setProperty('--fy', (y === null ? 30 : parseFloat(y)) + 'px');
      el.style.setProperty('--fade-delay', (delay === null ? 0 : parseFloat(delay)) + 's');
      el.style.setProperty('--fade-duration', (duration === null ? 0.7 : parseFloat(duration)) + 's');
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px', threshold: 0 }
    );

    Array.prototype.forEach.call(els, function (el) {
      observer.observe(el);
    });
  }

  /* ==========================================================
     MAGNET — cursor-following magnetic hover
     ========================================================== */

  function initMagnets() {
    if (reduceMotion) return;

    var magnets = document.querySelectorAll('[data-magnet]');

    Array.prototype.forEach.call(magnets, function (el) {
      var padding = parseFloat(el.getAttribute('data-padding')) || 100;
      var strength = parseFloat(el.getAttribute('data-strength')) || 2;
      var active = false;

      window.addEventListener(
        'mousemove',
        function (e) {
          var rect = el.getBoundingClientRect();
          var centerX = rect.left + rect.width / 2;
          var centerY = rect.top + rect.height / 2;

          var withinX = Math.abs(e.clientX - centerX) < rect.width / 2 + padding;
          var withinY = Math.abs(e.clientY - centerY) < rect.height / 2 + padding;

          if (withinX && withinY) {
            if (!active) {
              active = true;
              el.style.transition = 'transform 0.3s ease-out';
            }
            var dx = (e.clientX - centerX) / strength;
            var dy = (e.clientY - centerY) / strength;
            el.style.transform = 'translate3d(' + dx + 'px, ' + dy + 'px, 0)';
          } else if (active) {
            active = false;
            el.style.transition = 'transform 0.6s ease-in-out';
            el.style.transform = 'translate3d(0, 0, 0)';
          }
        },
        { passive: true }
      );
    });
  }

  /* ==========================================================
     MARQUEE — scroll-linked horizontal rows
     ========================================================== */

  var marquee = null;

  function initMarquee() {
    var section = document.querySelector('.marquee');
    if (!section) return;

    var row1 = section.querySelector('[data-marquee-row="1"] .marquee-track');
    var row2 = section.querySelector('[data-marquee-row="2"] .marquee-track');

    var set1 = MARQUEE_IMAGES.slice(0, 11);
    var set2 = MARQUEE_IMAGES.slice(11);

    function fill(track, images) {
      var frag = document.createDocumentFragment();
      // Tripled for seamless scrolling in both directions.
      for (var pass = 0; pass < 3; pass++) {
        images.forEach(function (src) {
          var img = document.createElement('img');
          img.src = src;
          img.loading = 'lazy';
          img.alt = '';
          img.setAttribute('aria-hidden', 'true');
          frag.appendChild(img);
        });
      }
      track.appendChild(frag);
    }

    fill(row1, set1);
    fill(row2, set2);

    marquee = {
      section: section,
      row1: row1,
      row2: row2,
      base1: 0,
      base2: 0
    };

    measureMarquee();
  }

  function measureMarquee() {
    if (!marquee) return;
    // Start each track shifted back by one full set so there is
    // content to reveal travelling in either direction.
    marquee.base1 = -marquee.row1.scrollWidth / 3;
    marquee.base2 = -marquee.row2.scrollWidth / 3;
  }

  function updateMarquee() {
    if (!marquee) return;

    var sectionTop = marquee.section.getBoundingClientRect().top + window.scrollY;
    var offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
    var shift = offset - 200;

    marquee.row1.style.transform = 'translateX(' + (marquee.base1 + shift) + 'px)';
    marquee.row2.style.transform = 'translateX(' + (marquee.base2 - shift) + 'px)';
  }

  /* ==========================================================
     ANIMATED TEXT — character reveal on scroll
     ========================================================== */

  var animatedTexts = [];

  function initAnimatedText() {
    var els = document.querySelectorAll('[data-animated-text]');

    Array.prototype.forEach.call(els, function (el) {
      var text = el.textContent;
      el.textContent = '';

      var chars = [];
      var frag = document.createDocumentFragment();

      function makeChar(ch) {
        var span = document.createElement('span');
        span.className = 'char';

        var ghost = document.createElement('span');
        ghost.className = 'char-ghost';
        ghost.textContent = ch;

        var fill = document.createElement('span');
        fill.className = 'char-fill';
        fill.textContent = ch;

        span.appendChild(ghost);
        span.appendChild(fill);
        chars.push(fill);
        return span;
      }

      // Chars are grouped into words so lines only ever break at
      // spaces — per-character inline-blocks would wrap mid-word.
      var words = text.split(' ');

      words.forEach(function (word, w) {
        var wordSpan = document.createElement('span');
        wordSpan.className = 'word';

        for (var i = 0; i < word.length; i++) {
          wordSpan.appendChild(makeChar(word[i]));
        }

        frag.appendChild(wordSpan);

        if (w < words.length - 1) {
          frag.appendChild(makeChar(' '));
        }
      });

      el.appendChild(frag);
      animatedTexts.push({ el: el, chars: chars });
    });
  }

  function updateAnimatedText() {
    var vh = window.innerHeight;

    animatedTexts.forEach(function (item) {
      var rect = item.el.getBoundingClientRect();

      // Framer offset ['start 0.8', 'end 0.2']:
      // progress 0 when element top sits at 80% of the viewport,
      // progress 1 when element bottom sits at 20% of the viewport.
      var span = 0.6 * vh + rect.height;
      var progress = clamp((0.8 * vh - rect.top) / span, 0, 1);

      var total = item.chars.length;

      item.chars.forEach(function (char, i) {
        var start = i / total;
        var end = (i + 1) / total;
        var local = clamp((progress - start) / (end - start), 0, 1);
        char.style.opacity = 0.2 + 0.8 * local;
      });
    });
  }

  /* ==========================================================
     PROJECTS — sticky stacking cards
     ========================================================== */

  var projectCards = [];
  var pendingFrames = [];

  function initProjects() {
    var stack = document.querySelector('.projects-stack');
    if (!stack) return;

    // Touch devices can't hover, and letting a finger scroll inside an
    // embedded frame traps the page scroll — so there we link out instead.
    var touch = window.matchMedia('(hover: none)').matches;

    PROJECTS.forEach(function (project, index) {
      var card = document.createElement('div');
      card.className = 'project-card';
      card.style.setProperty('--card-z', index + 1);

      var head =
        '<div class="project-top">' +
        '<div class="project-top-left">' +
        '<span class="project-num">' + project.num + '</span>' +
        '<div class="project-meta">' +
        '<span class="project-category">' + project.category + '</span>' +
        '<h3 class="project-name">' + project.name + '</h3>' +
        '</div>' +
        '</div>' +
        (project.placeholder
          ? '<a class="btn-live" href="mailto:AragveliPalazzolo@gmail.com">Get Started</a>'
          : '<a class="btn-live" href="' + project.url + '" target="_blank" rel="noopener noreferrer">Live Project</a>') +
        '</div>';

      if (project.placeholder) {
        card.innerHTML =
          head +
          '<div class="project-preview project-preview-empty">' +
          '<p class="project-empty-text">This spot is open &mdash; your shop could be the next one here.</p>' +
          '</div>';
      } else {
        card.innerHTML =
          head +
          '<div class="project-preview">' +
          '<div class="browser-bar">' +
          '<span class="browser-dots"><i></i><i></i><i></i></span>' +
          '<span class="browser-url">' + project.domain + '</span>' +
          '</div>' +
          '<div class="project-frame">' +
          '<iframe class="project-iframe" data-src="' + project.url + '" title="' + project.name +
          ' website preview" loading="lazy" tabindex="-1" ' +
          'sandbox="allow-scripts allow-same-origin allow-popups"></iframe>' +
          '<' + (touch ? 'a' : 'button') + ' class="project-shield"' +
          (touch
            ? ' href="' + project.url + '" target="_blank" rel="noopener noreferrer"'
            : ' type="button"') +
          '><span>' + (touch ? 'Open live site' : 'Click to explore') + '</span></' +
          (touch ? 'a' : 'button') + '>' +
          '</div>' +
          '</div>';

        pendingFrames.push({
          card: card,
          frame: card.querySelector('.project-iframe')
        });

        if (!touch) {
          var shield = card.querySelector('.project-shield');
          shield.addEventListener('click', function () {
            card.classList.add('is-interactive');
          });
          // Re-arm the shield on the way out so the next scroll past the
          // card isn't swallowed by the frame.
          card.addEventListener('mouseleave', function () {
            card.classList.remove('is-interactive');
          });
        }
      }

      // Cards are direct children of the stack on purpose: a sticky element
      // only stays pinned inside its own parent, so per-card wrappers would
      // let each card slide away again instead of staying under the next one.
      stack.appendChild(card);

      projectCards.push({
        card: card,
        index: index,
        topPx: 0,
        snapY: 0
      });
    });

    layoutProjects();
  }

  /* Each card parks just below the header strip of the card before it, so a
     covered card still shows its number and name. The offset is measured from
     the real header rather than hard-coded, since it grows with the font
     clamps. offsetTop/offsetHeight are used instead of rects because the cards
     carry a scale transform. */
  function layoutProjects() {
    if (!projectCards.length) return;

    var first = projectCards[0].card;
    var mobile = window.innerWidth <= 560;

    if (mobile) {
      projectCards.forEach(function (item) {
        item.card.style.top = '';
        item.card.style.marginBottom = '';
      });
      document.documentElement.style.removeProperty('--frame-h');
      return;
    }

    var head = first.querySelector('.project-top');
    var peek = head.offsetTop + head.offsetHeight + 8;
    var stickyTop = stickyTopPx();

    // The deepest card sits under every header before it, so its preview gets
    // whatever vertical room is left over.
    var preview = first.querySelector('.project-frame, .project-preview-empty');
    var chrome = first.offsetHeight - (preview ? preview.offsetHeight : 0);
    var lastTop = stickyTop + (projectCards.length - 1) * peek;
    var frameH = clamp(window.innerHeight - lastTop - chrome - 16, 170, 720);

    document.documentElement.style.setProperty('--frame-h', Math.round(frameH) + 'px');

    projectCards.forEach(function (item, index) {
      item.topPx = stickyTop + index * peek;
      item.card.style.top = item.topPx + 'px';
    });

    projectCards.forEach(function (item) {
      item.snapY = absoluteTop(item.card) - item.topPx;
    });
  }

  /* Layout position of an element, unaffected by its sticky shift or scale. */
  function absoluteTop(el) {
    var y = 0;
    while (el) {
      y += el.offsetTop;
      el = el.offsetParent;
    }
    return y;
  }

  function stickyTopPx() {
    var root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return parseFloat(document.documentElement.style.getPropertyValue('--sticky-top')) * root;
  }

  /* ==========================================================
     PROJECTS — scroll snapping
     ==========================================================
     Once scrolling settles anywhere near the stack, the nearest card is
     pulled into its resting position so the section advances card by card
     instead of stopping half-way between two. */

  var snapping = false;
  var snapTimer = null;
  var lastY = 0;
  var scrollDir = 1;

  function scrollY() {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function snapProjects() {
    if (snapping || reduceMotion) return;
    if (window.innerWidth <= 560 || !projectCards.length) return;

    var y = scrollY();
    var vh = window.innerHeight;
    var best = null;
    var bestDist = Infinity;
    var near = null;
    var nearDist = Infinity;

    projectCards.forEach(function (item) {
      var delta = item.snapY - y;
      var dist = Math.abs(delta);

      if (dist < nearDist) {
        nearDist = dist;
        near = item.snapY;
      }
      // Only cards ahead of the direction of travel, so leaving the section
      // downward isn't yanked back up to the card just passed.
      if (delta * scrollDir >= -8 && dist < bestDist) {
        bestDist = dist;
        best = item.snapY;
      }
    });

    if (best === null || bestDist > vh * 0.45) {
      // A small drift off a resting card still settles back onto it.
      best = nearDist < vh * 0.2 ? near : null;
      bestDist = nearDist;
    }

    if (best === null || bestDist < 4) return;

    var max = document.documentElement.scrollHeight - window.innerHeight;
    best = clamp(best, 0, max);

    snapping = true;
    // Safety net: if the animation is interrupted its onComplete never runs,
    // which would leave snapping wedged on.
    setTimeout(function () {
      snapping = false;
    }, 900);

    if (smoothScroll) {
      smoothScroll.scrollTo(best, {
        duration: 0.6,
        lock: true,
        onComplete: function () {
          snapping = false;
        }
      });
    } else {
      window.scrollTo({ top: best, behavior: 'smooth' });
    }
  }

  function queueSnap() {
    if (snapTimer) clearTimeout(snapTimer);
    snapTimer = setTimeout(snapProjects, 140);
  }

  /* Embedded sites are only fetched once their card nears the viewport, so
     three live sites don't compete with the initial page load. This rides the
     existing scroll loop rather than IntersectionObserver — an iframe with no
     src yet doesn't reliably report intersections. */
  function loadNearbyFrames() {
    if (!pendingFrames.length) return;

    var vh = window.innerHeight;

    for (var i = pendingFrames.length - 1; i >= 0; i--) {
      var item = pendingFrames[i];
      var rect = item.card.getBoundingClientRect();

      if (rect.top < vh + 400 && rect.bottom > -400) {
        item.frame.src = item.frame.getAttribute('data-src');
        pendingFrames.splice(i, 1);
      }
    }
  }

  function updateProjects() {
    if (window.innerWidth <= 560 || !projectCards.length) return;

    var y = scrollY();

    // How far each card has travelled from its own resting spot toward the
    // next one's — 0 while it's the front card, 1 once it's fully covered.
    projectCards.forEach(function (item, i) {
      var next = projectCards[i + 1];
      item.progress = next ? clamp((y - item.snapY) / (next.snapY - item.snapY), 0, 1) : 0;
    });

    // A card shrinks a notch for every card that has come to rest on top of
    // it, so the stack reads as depth rather than a flat pile.
    projectCards.forEach(function (item, i) {
      var covered = 0;
      for (var j = i; j < projectCards.length - 1; j++) {
        covered += projectCards[j].progress;
      }
      item.card.style.transform = 'scale(' + (1 - Math.min(covered, 4) * 0.02) + ')';
    });
  }

  /* ==========================================================
     STICKY TOP OFFSET (matches CSS breakpoints)
     ========================================================== */

  function updateStickyTop() {
    var top = window.innerHeight < 760 ? '3.5rem' : window.innerWidth >= 768 ? '4.5rem' : '4rem';
    document.documentElement.style.setProperty('--sticky-top', top);
  }

  /* ==========================================================
     SCROLL LOOP
     ========================================================== */

  var ticking = false;
  var smoothScroll = null;

  function onScroll() {
    var y = scrollY();
    if (y !== lastY) {
      scrollDir = y > lastY ? 1 : -1;
      lastY = y;
    }
    queueSnap();

    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateMarquee();
      updateAnimatedText();
      updateProjects();
      loadNearbyFrames();
      ticking = false;
    });
  }

  /* ==========================================================
     INIT
     ========================================================== */

  function init() {
    updateStickyTop();
    initFadeIn();
    initMagnets();
    initMarquee();
    initAnimatedText();
    initProjects();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener(
      'resize',
      function () {
        updateStickyTop();
        layoutProjects();
        measureMarquee();
        onScroll();
      },
      { passive: true }
    );

    // Re-measure once the lazy marquee images have settled.
    window.addEventListener('load', function () {
      measureMarquee();
      onScroll();
    });

    onScroll();

    // Smooth scrolling
    if (!reduceMotion && typeof Lenis !== 'undefined') {
      var lenis = smoothScroll = new Lenis({
        duration: 1.2,
        easing: function (t) {
          return Math.min(1, 1.001 - Math.pow(2, -10 * t));
        },
        smoothWheel: true
      });

      lenis.on('scroll', onScroll);

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Nav anchors go through Lenis so they inherit the smooth easing.
      document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
          var id = link.getAttribute('href');
          if (id === '#') return;
          var target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          lenis.scrollTo(target);
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
