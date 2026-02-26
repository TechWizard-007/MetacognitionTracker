/**
 * stats.js — Dashboard only. Loads entries, filters last 7 days, shows averages and bar indicators.
 * Uses MetaStorage.getEntries() and MetaXP for XP/level/streak.
 */

(function () {
  'use strict';

  var XP_SECTION = document.getElementById('xp-section');
  var XP_VALUE = document.getElementById('xp-value');
  var LEVEL_VALUE = document.getElementById('level-value');
  var STREAK_VALUE = document.getElementById('streak-value');
  var WEEKLY_CONTENT = document.getElementById('weekly-content');
  var EMPTY_STATE = document.getElementById('empty-state');

  /**
   * Returns true if date string (YYYY-MM-DD) is within the last 7 days (inclusive of today).
   * Compares using ISO date strings; uses local date for "today".
   */
  function isInLastSevenDays(dateStr) {
    if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return false;
    }
    var today = new Date();
    var todayStr = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
    var logDate = new Date(dateStr + 'T12:00:00');
    var todayDate = new Date(todayStr + 'T12:00:00');
    var diffMs = todayDate - logDate;
    var diffDays = diffMs / (24 * 60 * 60 * 1000);
    return diffDays >= 0 && diffDays < 7;
  }

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  /**
   * Filter entries to those in the last 7 days.
   */
  function getLastSevenDaysEntries(entries) {
    if (!entries || !Array.isArray(entries)) return [];
    return entries.filter(isInLastSevenDays);
  }

  /**
   * Compute average of a numeric field. Returns 0 if no entries.
   */
  function average(entries, key) {
    if (!entries.length) return 0;
    var sum = 0;
    var count = 0;
    for (var i = 0; i < entries.length; i++) {
      var v = entries[i][key];
      if (typeof v === 'number' && !isNaN(v)) {
        sum += v;
        count++;
      }
    }
    return count === 0 ? 0 : sum / count;
  }

  /**
   * Normalize value to 0..1 for bar width. For -5..+5: (v+5)/10. For 1..5: (v-1)/4.
   */
  function toBarRatio(value, min, max) {
    var v = Number(value);
    if (isNaN(v)) return 0;
    if (min === -5 && max === 5) return (v + 5) / 10;
    if (min === 1 && max === 5) return (v - 1) / 4;
    return 0;
  }

  /**
   * Round to one decimal for display.
   */
  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  /**
   * Animate numeric value from 0 to end over duration ms using requestAnimationFrame.
   * isDecimal: show one decimal place; otherwise integer.
   */
  function animateValue(el, endValue, duration, isDecimal) {
    if (!el || duration <= 0) return;
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var t = Math.min(elapsed / duration, 1);
      var eased = 1 - (1 - t) * (1 - t);
      var current = eased * endValue;
      el.textContent = isDecimal ? round1(current) : Math.round(current);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = isDecimal ? round1(endValue) : endValue;
      }
    }
    requestAnimationFrame(step);
  }

  /**
   * Animate streak display: number counts up, suffix " day" / " days" stays.
   */
  function animateStreak(el, streak, duration) {
    if (!el || duration <= 0) return;
    var startTime = null;
    var suffix = streak === 1 ? ' day' : ' days';
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var t = Math.min(elapsed / duration, 1);
      var eased = 1 - (1 - t) * (1 - t);
      var current = Math.round(eased * streak);
      el.textContent = current + (current === 1 ? ' day' : ' days');
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = streak + suffix;
    }
    requestAnimationFrame(step);
  }

  /**
   * Render XP, level, and streak with count-up animation (800ms).
   */
  function renderXP(entries) {
    if (!MetaXP || !XP_VALUE || !LEVEL_VALUE || !STREAK_VALUE) return;
    var totalXP = MetaXP.calculateXP(entries);
    var level = MetaXP.calculateLevel(totalXP);
    var streak = MetaXP.calculateStreak(entries);
    animateValue(XP_VALUE, totalXP, 800, false);
    animateValue(LEVEL_VALUE, level, 800, false);
    animateStreak(STREAK_VALUE, streak, 800);
  }

  var EMPTY_STATE_WRAP = document.getElementById('empty-state-wrap');

  /**
   * Render weekly averages and horizontal bar indicators.
   */
  function renderWeekly(entries) {
    var week = getLastSevenDaysEntries(entries);
    if (EMPTY_STATE_WRAP) {
      EMPTY_STATE_WRAP.hidden = week.length > 0;
    }
    if (WEEKLY_CONTENT) {
      WEEKLY_CONTENT.hidden = week.length === 0;
    }
    if (week.length === 0) return;

    var avgLogic = average(week, 'logicEmotion');
    var avgEnergy = average(week, 'energyDirection');
    var avgControl = average(week, 'controlFlow');
    var avgStability = average(week, 'stability');

    var html = '';
    html += metricBlock('Logic ↔ Emotion', avgLogic, -5, 5);
    html += metricBlock('Inward ↔ Outward Energy', avgEnergy, -5, 5);
    html += metricBlock('Flow ↔ Control', avgControl, -5, 5);
    html += metricBlock('Emotional Stability', avgStability, 1, 5);
    WEEKLY_CONTENT.innerHTML = html;

    /* Animate bar fill from 0 to final width (CSS transition 1.5s ease-out) */
    var bars = WEEKLY_CONTENT.querySelectorAll('.bar-fill');
    for (var b = 0; b < bars.length; b++) {
      var finalW = bars[b].getAttribute('data-final-width');
      if (finalW != null) {
        (function (bar, w) {
          requestAnimationFrame(function () {
            bar.style.width = w + '%';
          });
        })(bars[b], finalW);
      }
    }
    /* Count-up for metric numeric values (800ms) */
    var valueEls = WEEKLY_CONTENT.querySelectorAll('.metric-value-animated');
    for (var v = 0; v < valueEls.length; v++) {
      var finalVal = parseFloat(valueEls[v].getAttribute('data-value'), 10);
      if (!isNaN(finalVal)) animateValue(valueEls[v], finalVal, 800, true);
    }
  }

  /**
   * One metric: header row (label + value), then horizontal bar.
   * Bar starts at 0% and data-final-width is set for CSS transition; value animates via JS.
   */
  function metricBlock(label, value, min, max) {
    var ratio = Math.max(0, Math.min(1, toBarRatio(value, min, max)));
    var pct = Math.round(ratio * 100);
    var displayValue = round1(value);
    return (
      '<div class="metric">' +
      '<div class="metric-header">' +
      '<span class="metric-label">' + escapeHtml(label) + '</span>' +
      '<span class="metric-value metric-value-animated" data-value="' + displayValue + '">0</span>' +
      '</div>' +
      '<div class="bar-wrap"><div class="bar-fill" style="width:0" data-final-width="' + pct + '"></div></div>' +
      '</div>'
    );
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  /**
   * Initialize dashboard: load entries, render XP and weekly section.
   */
  function init() {
    var entries = MetaStorage ? MetaStorage.getEntries() : [];
    renderXP(entries);
    renderWeekly(entries);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
