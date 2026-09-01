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
  var SELECTOR = '.pcard, .cs, .app-card, .oem-cap';

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
