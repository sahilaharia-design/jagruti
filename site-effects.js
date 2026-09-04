/**
 * Jagruti Steels — shared front-end polish
 * Subtle 3D tilt on card hover (.pcard, .cs, .app-card, .oem-cap).
 * Skips entirely on touch devices and when the visitor has requested
 * reduced motion. Pure enhancement — the site works identically without it.
 */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  var MAX_TILT_DEG = 6;
  var SELECTOR = '.pcard, .cs, .app-card, .oem-cap, .mfg-card';

  function attach(el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--tiltX', (-py * MAX_TILT_DEG).toFixed(2) + 'deg');
      el.style.setProperty('--tiltY', (px * MAX_TILT_DEG).toFixed(2) + 'deg');
    });
    el.addEventListener('mouseleave', function () {
      el.style.setProperty('--tiltX', '0deg');
      el.style.setProperty('--tiltY', '0deg');
    });
  }

  function init() {
    document.querySelectorAll(SELECTOR).forEach(attach);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * Scroll-reveal choreography — auto-stagger.
 * Each page's own inline script still owns the IntersectionObserver that
 * adds .visible (unchanged). This only assigns transition-delay ahead of
 * that, so sibling .fade-up/.fade-left/.fade-right elements that share a
 * parent cascade in sequence instead of popping in together — the gap
 * being that roughly half the site's fade elements were never given a
 * manual per-card delay. Elements that already carry an inline
 * transition-delay (hand-tuned earlier) are left untouched.
 */
(function () {
  var STEP_MS = 70;
  var MAX_STEPS = 6;

  function stagger() {
    var groups = new Map();
    document.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach(function (el) {
      var parent = el.parentElement;
      if (!parent) return;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });
    // Index against the full sibling group (manually-delayed elements included)
    // so an auto-assigned delay lands at this element's real position in the
    // cascade instead of jumping to the front of it.
    groups.forEach(function (els) {
      if (els.length < 2) return;
      els.forEach(function (el, i) {
        if (el.style.transitionDelay) return; // respect hand-tuned delay
        el.style.transitionDelay = (Math.min(i, MAX_STEPS) * STEP_MS) + 'ms';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', stagger);
  } else {
    stagger();
  }
})();

/**
 * Signature interaction layer — custom cursor, ambient cursor-spotlight,
 * film grain. Desktop + fine pointer + motion-OK only (same gate as the
 * tilt effect above) — skipped entirely, before touching the DOM, for
 * touch devices and prefers-reduced-motion. Every element it creates is
 * pointer-events:none, so it can never intercept a click; the real OS
 * cursor is only hidden (html.has-custom-cursor) after this successfully
 * initializes, so a script failure never leaves visitors without a cursor.
 */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  var HOVER_SELECTOR = 'a, button, .pcard, .cs, .app-card, .oem-cap, .mfg-card, input, textarea, select, [role="button"], [role="tab"]';

  function init() {
    document.documentElement.classList.add('has-custom-cursor');

    var grain = document.createElement('div');
    grain.className = 'cx-grain';
    var spot = document.createElement('div');
    spot.className = 'cx-spotlight';
    var ring = document.createElement('div');
    ring.className = 'cx-ring';
    var dot = document.createElement('div');
    dot.className = 'cx-cursor';
    document.body.appendChild(grain);
    document.body.appendChild(spot);
    document.body.appendChild(ring);
    document.body.appendChild(dot);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my; // ring trails the pointer with a soft lerp

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.classList.add('cx-visible');
      ring.classList.add('cx-visible');
      spot.classList.add('cx-active');
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      spot.style.setProperty('--mx', mx + 'px');
      spot.style.setProperty('--my', my + 'px');
    }, {passive: true});

    document.addEventListener('mouseleave', function () {
      dot.classList.remove('cx-visible');
      ring.classList.remove('cx-visible');
      spot.classList.remove('cx-active');
    });

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(HOVER_SELECTOR)) {
        dot.classList.add('cx-hover');
        ring.classList.add('cx-hover');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (!e.target.closest || !e.target.closest(HOVER_SELECTOR)) return;
      var to = e.relatedTarget;
      if (to && to.closest && to.closest(HOVER_SELECTOR)) return;
      dot.classList.remove('cx-hover');
      ring.classList.remove('cx-hover');
    });

    function tick() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * Magnetic buttons — primary CTAs drift a few px toward the cursor within
 * their own box, snapping back on leave. Feeds --magX/--magY custom
 * properties that styles.css composes with the existing hover-lift and
 * active-press transforms, rather than overwriting them — the magnetic
 * pull layers on top of, not instead of, the button's normal states.
 */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  var STRENGTH = 0.3;

  function attach(el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) * STRENGTH;
      var dy = (e.clientY - (r.top + r.height / 2)) * STRENGTH;
      el.style.setProperty('--magX', dx.toFixed(1) + 'px');
      el.style.setProperty('--magY', dy.toFixed(1) + 'px');
    });
    el.addEventListener('mouseleave', function () {
      el.style.setProperty('--magX', '0px');
      el.style.setProperty('--magY', '0px');
    });
  }

  function init() {
    document.querySelectorAll('.btn-blue, .btn-outline').forEach(attach);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
