/**
 * xp.js — XP, level, and streak calculations.
 * Each entry = 20 XP. Level = floor(totalXP / 200).
 * Streak = consecutive days with at least one log (local date, backward from latest).
 */

var MetaXP = (function () {
  'use strict';

  var XP_PER_ENTRY = 20;
  var XP_PER_LEVEL = 200;

  /**
   * Returns total XP from all entries (one entry = 20 XP).
   * @param {Array<{date: string}>} entries
   * @returns {number}
   */
  function calculateXP(entries) {
    if (!entries || !Array.isArray(entries)) {
      return 0;
    }
    return entries.length * XP_PER_ENTRY;
  }

  /**
   * Level from total XP: floor(totalXP / 200).
   * @param {number} totalXP
   * @returns {number}
   */
  function calculateLevel(totalXP) {
    var n = Number(totalXP);
    if (isNaN(n) || n < 0) return 0;
    return Math.floor(n / XP_PER_LEVEL);
  }

  /**
   * Format a local Date as YYYY-MM-DD (local calendar date only, no timezone shift).
   */
  function toLocalDateStr(d) {
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return y + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }

  /**
   * Consecutive days with at least one log, counting backward from the most recent log date.
   * Uses local date comparison only (no UTC). Date map used for O(1) lookup.
   * Works across month/year transitions.
   * @param {Array<{date: string}>} entries
   * @returns {number} — streak in days (0 if no entries or no consecutive run from latest day).
   */
  function calculateStreak(entries) {
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return 0;
    }
    var dateSet = Object.create(null);
    for (var i = 0; i < entries.length; i++) {
      var d = entries[i].date;
      if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
        dateSet[d] = true;
      }
    }
    var dates = Object.keys(dateSet);
    if (dates.length === 0) return 0;
    dates.sort();
    var latest = dates[dates.length - 1];
    var streak = 0;
    var cursor = parseLocalDate(latest);
    if (!cursor) return 0;
    var checkStr = latest;
    while (dateSet[checkStr]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
      checkStr = toLocalDateStr(cursor);
    }
    return streak;
  }

  /**
   * Parse YYYY-MM-DD as local date (noon to avoid DST edge issues).
   */
  function parseLocalDate(dateStr) {
    var parts = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!parts) return null;
    var y = parseInt(parts[1], 10);
    var m = parseInt(parts[2], 10) - 1;
    var day = parseInt(parts[3], 10);
    if (isNaN(y) || isNaN(m) || isNaN(day)) return null;
    return new Date(y, m, day);
  }

  return {
    calculateXP: calculateXP,
    calculateLevel: calculateLevel,
    calculateStreak: calculateStreak
  };
})();
