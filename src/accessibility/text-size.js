import { translate } from '../i18n/runtime.js';
import './text-size.css';

const STORAGE_KEY = 'sail-text-size';
const DEFAULT_PERCENT = 100;
let currentPercent = DEFAULT_PERCENT;

function boundedPercent(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(100, Math.min(200, Math.round(number))) : DEFAULT_PERCENT;
}
function applyTextSize(value, persist = false) {
  currentPercent = boundedPercent(value);
  const root = document.documentElement;
  root.style.setProperty('--text-scale', String(currentPercent / 100));
  root.dataset.textSize = String(currentPercent);
  root.toggleAttribute('data-large-text', currentPercent >= 150);
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, String(currentPercent)); } catch { /* Keep the setting for this page. */ }
  }
  window.dispatchEvent(new CustomEvent('sail:text-size', { detail: { percent: currentPercent } }));
  return currentPercent;
}

// Call before rendering the application to avoid a flash of smaller text.
export function initializeTextSize() {
  let stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch { /* The default remains usable without storage. */ }
  return applyTextSize(stored === null || stored.trim() === '' ? DEFAULT_PERCENT : stored);
}

// Mount after the header exists. The native range supports arrows, Home/End and touch.
export function mountTextSize(container) {
  if (!container) throw new Error('A container is required for the text-size control.');
  const details = document.createElement('details');
  details.className = 'text-size-control';
  details.innerHTML = `<summary aria-label="Adjust text size" title="Text size">
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 19 8 5l6 14M4 14h8M15 19l3.5-8L22 19M16.5 16h4"/></svg>
    <span class="text-size-current" dir="ltr"></span>
  </summary>
  <div class="text-size-popover">
    <div class="text-size-heading"><label for="sail-text-size-range">Text size</label><output for="sail-text-size-range" dir="ltr" aria-live="polite"></output></div>
    <input id="sail-text-size-range" type="range" min="100" max="200" step="5" aria-label="Text size">
    <div class="text-size-limits"><span>Current minimum</span><span>Larger text</span></div>
    <button class="text-size-reset" type="button">Reset text size</button>
    <p>Text size is saved in this browser.</p>
  </div>`;
  container.append(details);
  const slider = details.querySelector('input');
  const summary = details.querySelector('summary');
  const update = () => {
    const percent = `${currentPercent}%`;
    slider.value = String(currentPercent);
    slider.setAttribute('aria-valuetext', translate(`${currentPercent}% text size`));
    details.querySelector('output').value = percent;
    details.querySelector('.text-size-current').textContent = percent;
  };
  slider.addEventListener('input', () => { applyTextSize(slider.value, true); update(); });
  details.querySelector('button').addEventListener('click', () => { applyTextSize(DEFAULT_PERCENT, true); update(); });
  const outside = event => { if (details.open && !details.contains(event.target)) details.open = false; };
  const escape = event => {
    if (event.key === 'Escape' && details.open) { details.open = false; summary.focus(); }
  };
  document.addEventListener('pointerdown', outside);
  document.addEventListener('keydown', escape);
  window.addEventListener('sail:text-size', update);
  update();

  // Text can wrap to additional rows. Reserve the measured dock/header height,
  // rather than covering the canvas or clipping larger labels in a fixed box.
  const measured = new Map();
  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const property = measured.get(entry.target);
      const height = `${Math.ceil(entry.target.getBoundingClientRect().height)}px`;
      if (entry.target.getBoundingClientRect().height > 0 && property && document.documentElement.style.getPropertyValue(property) !== height) {
        document.documentElement.style.setProperty(property, height);
      }
    }
  });
  for (const [selector, property] of [
    ['.topbar', '--topbar-height'], ['.simulation-console', '--control-dock-height'],
    ['.scene-title', '--scene-title-height'], ['.lesson-card', '--lesson-card-height'],
    ['.mobile-scene-toolbar', '--mobile-toolbar-height'], ['.mobile-indicators', '--mobile-indicators-height'],
  ]) {
    const element = document.querySelector(selector);
    if (element) { measured.set(element, property); observer.observe(element); }
  }
  return {
    dispose() {
      observer.disconnect();document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);window.removeEventListener('sail:text-size', update);
      details.remove();
    },
  };
}
