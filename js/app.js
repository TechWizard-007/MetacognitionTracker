/**
 * app.js — Logging page only. Reads form, builds entry, validates, saves, resets.
 * No calculation logic; depends on storage.js for persistence.
 */

(function () {
  'use strict';

  var form = document.getElementById('log-form');
  var logicEmotionInput = document.getElementById('logic-emotion');
  var energyDirectionInput = document.getElementById('energy-direction');
  var controlFlowInput = document.getElementById('control-flow');
  var stabilityInput = document.getElementById('stability');
  var noteInput = document.getElementById('note');
  var logicEmotionValue = document.getElementById('logic-emotion-value');
  var energyDirectionValue = document.getElementById('energy-direction-value');
  var controlFlowValue = document.getElementById('control-flow-value');
  var stabilityValue = document.getElementById('stability-value');

  if (!form || !logicEmotionInput || !energyDirectionInput || !controlFlowInput || !stabilityInput || !noteInput) {
    return;
  }

  /**
   * Sync slider output elements with current input values.
   */
  function updateSliderOutputs() {
    if (logicEmotionValue) logicEmotionValue.textContent = logicEmotionInput.value;
    if (energyDirectionValue) energyDirectionValue.textContent = energyDirectionInput.value;
    if (controlFlowValue) controlFlowValue.textContent = controlFlowInput.value;
    if (stabilityValue) stabilityValue.textContent = stabilityInput.value;
  }

  /**
   * Parse and clamp slider value to integer within range.
   */
  function parseSlider(value, min, max) {
    var n = parseInt(value, 10);
    if (isNaN(n)) return min;
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  /**
   * Build today's date in YYYY-MM-DD (local date, ISO-like).
   */
  function todayISO() {
    var d = new Date();
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return y + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }

  /**
   * Validate and build entry object from form. Returns null if invalid.
   */
  function buildEntry() {
    var logicEmotion = parseSlider(logicEmotionInput.value, -5, 5);
    var energyDirection = parseSlider(energyDirectionInput.value, -5, 5);
    var controlFlow = parseSlider(controlFlowInput.value, -5, 5);
    var stability = parseSlider(stabilityInput.value, 1, 5);
    var note = typeof noteInput.value === 'string' ? noteInput.value.trim() : '';
    return {
      date: todayISO(),
      logicEmotion: logicEmotion,
      energyDirection: energyDirection,
      controlFlow: controlFlow,
      stability: stability,
      note: note
    };
  }

  /**
   * Reset form to default slider positions and clear note.
   */
  function resetForm() {
    logicEmotionInput.value = 0;
    energyDirectionInput.value = 0;
    controlFlowInput.value = 0;
    stabilityInput.value = 3;
    noteInput.value = '';
    updateSliderOutputs();
    logicEmotionInput.setAttribute('aria-valuenow', '0');
    energyDirectionInput.setAttribute('aria-valuenow', '0');
    controlFlowInput.setAttribute('aria-valuenow', '0');
    stabilityInput.setAttribute('aria-valuenow', '3');
  }

  /**
   * Show subtle "Saved" feedback; fade out after 1.5s. One entry per date: overwrite today if exists.
   */
  function showSaveFeedback() {
    var el = document.getElementById('save-feedback');
    if (!el) return;
    el.hidden = false;
    el.classList.remove('save-feedback--out');
    clearTimeout(showSaveFeedback._timeout);
    showSaveFeedback._timeout = setTimeout(function () {
      el.classList.add('save-feedback--out');
      setTimeout(function () {
        el.hidden = true;
      }, 400);
    }, 1500);
  }

  /**
   * Handle form submit: build entry, save (overwrite same date), reset, show feedback.
   */
  function onSubmit(e) {
    e.preventDefault();
    var entry = buildEntry();
    if (!entry) return;
    MetaStorage.saveEntryReplacingDate(entry);
    resetForm();
    showSaveFeedback();
  }

  /**
   * Update slider output and aria-valuenow when user moves a slider.
   */
  function onSliderInput(input, output, min, max) {
    var val = parseSlider(input.value, min, max);
    input.value = val;
    if (output) output.textContent = val;
    input.setAttribute('aria-valuenow', String(val));
  }

  logicEmotionInput.addEventListener('input', function () {
    onSliderInput(logicEmotionInput, logicEmotionValue, -5, 5);
  });
  energyDirectionInput.addEventListener('input', function () {
    onSliderInput(energyDirectionInput, energyDirectionValue, -5, 5);
  });
  controlFlowInput.addEventListener('input', function () {
    onSliderInput(controlFlowInput, controlFlowValue, -5, 5);
  });
  stabilityInput.addEventListener('input', function () {
    onSliderInput(stabilityInput, stabilityValue, 1, 5);
  });

  /**
   * Subtle ripple on button click: radial gradient, fades out in 600ms.
   */
  function onButtonRipple(e) {
    var btn = e.currentTarget;
    if (!btn || btn.id !== 'submit-btn') return;
    var rect = btn.getBoundingClientRect();
    var x = (e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left + rect.width / 2)) - rect.left;
    var y = (e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : rect.top + rect.height / 2)) - rect.top;
    var size = Math.max(rect.width, rect.height) * 0.6;
    var ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = (x - size / 2) + 'px';
    ripple.style.top = (y - size / 2) + 'px';
    btn.appendChild(ripple);
    requestAnimationFrame(function () {
      ripple.classList.add('btn-ripple--active');
    });
    setTimeout(function () {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 600);
  }

  var submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('mousedown', onButtonRipple);
    submitBtn.addEventListener('touchstart', onButtonRipple, { passive: true });
  }

  form.addEventListener('submit', onSubmit);
  updateSliderOutputs();
})();
