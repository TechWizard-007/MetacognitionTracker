/**
 * cosmic.js — Star shower and click sparkles. Shared by index and dashboard.
 */

(function () {
  'use strict';

  var STAR_COUNT = 36;
  var FALL_DURATION_MIN = 100;
  var FALL_DURATION_MAX = 160;
  var SPARKLE_DOTS = 6;
  var SPARKLE_DURATION_MS = 1500;

  /**
   * Create the slow shower of stars (cute, gentle fall).
   */
  function initStarShower() {
    var container = document.getElementById('stars-shower');
    if (!container) return;

    for (var i = 0; i < STAR_COUNT; i++) {
      var star = document.createElement('span');
      star.className = 'star-shower-dot';
      star.setAttribute('aria-hidden', 'true');
      var left = Math.random() * 100;
      var delay = Math.random() * 50;
      var duration = FALL_DURATION_MIN + Math.random() * (FALL_DURATION_MAX - FALL_DURATION_MIN);
      var size = 2 + Math.random() * 2;
      star.style.left = left + '%';
      star.style.animationDelay = delay + 's';
      star.style.animationDuration = duration + 's';
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.opacity = 0.3 + Math.random() * 0.5;
      container.appendChild(star);
    }
  }

  /**
   * Spawn a cute sparkle burst at click position (small dots drift out and fade).
   */
  function onClickSparkle(e) {
    var x = e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    var y = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    var wrap = document.createElement('div');
    wrap.className = 'click-sparkle';
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';
    document.body.appendChild(wrap);

    for (var i = 0; i < SPARKLE_DOTS; i++) {
      var angle = (i / SPARKLE_DOTS) * 360;
      var dot = document.createElement('span');
      dot.className = 'click-sparkle-dot';
      dot.style.setProperty('--angle', angle + 'deg');
      dot.style.animationDelay = (i * 0.05) + 's';
      wrap.appendChild(dot);
    }

    requestAnimationFrame(function () {
      wrap.classList.add('click-sparkle--active');
    });

    setTimeout(function () {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }, SPARKLE_DURATION_MS);
  }

  function onTapSparkle(e) {
    if (e.target && (e.target.closest('a') || e.target.closest('button'))) return;
    onClickSparkle(e);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initStarShower();
      document.addEventListener('click', onTapSparkle, false);
    });
  } else {
    initStarShower();
    document.addEventListener('click', onTapSparkle, false);
  }
})();
