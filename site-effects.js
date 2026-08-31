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
