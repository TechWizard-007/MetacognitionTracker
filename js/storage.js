/**
 * storage.js — LocalStorage logic only.
 * Key: "metaEntries". Value: JSON string array of entry objects.
 */

var MetaStorage = (function () {
  'use strict';

  var KEY = 'metaEntries';

  /**
   * Returns all stored entries. Safe when no data or invalid JSON.
   * @returns {Array<{date: string, logicEmotion: number, energyDirection: number, controlFlow: number, stability: number, note: string}>}
   */
  function getEntries() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw === null || raw === '') {
        return [];
      }
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed;
    } catch (e) {
      return [];
    }
  }

  /**
   * Appends one entry and saves the full array to LocalStorage.
   * @param {Object} entry — Must have date, logicEmotion, energyDirection, controlFlow, stability, note.
   */
  function saveEntry(entry) {
    var list = getEntries();
    list.push(entry);
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {
      /* ignore quota or other errors */
    }
  }

  /**
   * Saves one entry, replacing any existing entry with the same date (one entry per date).
   * @param {Object} entry — Must have date, logicEmotion, energyDirection, controlFlow, stability, note.
   */
  function saveEntryReplacingDate(entry) {
    var list = getEntries();
    var entryDate = entry && entry.date;
    var filtered = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].date !== entryDate) {
        filtered.push(list[i]);
      }
    }
    filtered.push(entry);
    try {
      localStorage.setItem(KEY, JSON.stringify(filtered));
    } catch (e) {
      /* ignore quota or other errors */
    }
  }

  /**
   * Removes all entries from LocalStorage.
   */
  function clearEntries() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {
      /* ignore */
    }
  }

  return {
    getEntries: getEntries,
    saveEntry: saveEntry,
    saveEntryReplacingDate: saveEntryReplacingDate,
    clearEntries: clearEntries
  };
})();
