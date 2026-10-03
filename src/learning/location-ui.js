import { LOCATIONS } from '../locations.js';
import { destinationPreview } from '../navigation/destination-preview.js';
import { translate as t } from '../i18n/runtime.js';

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );

export function openLocations({ openModal, onSelect, isActive }) {
  openModal(
    `<div class="eyebrow">${esc(t('Practice waters'))}</div><h2>${esc(t('Choose your sailing grounds.'))}</h2><p>${esc(t('Selecting a location resets the boat and conditions. Your course record is kept. Assessed practices use Haven Islands.'))}</p>${isActive ? `<p class="training-notice">${esc(t('Finish or end the current practice before changing location.'))}</p>` : ''}<div class="location-grid">${LOCATIONS.map((location) => `<article class="location-choice destination-feature" data-location-card="${location.id}">${destinationPreview(location)}<div class="destination-copy"><h3>${esc(t(location.title))}</h3><p>${esc(t(location.description))}</p></div><div class="destination-modal-actions"><div class="location-metadata"><span>${esc(t('Wind speed'))}: <bdi>${location.conditions.windSpeed} kn</bdi></span><span>${esc(t('Current speed'))}: <bdi>${location.conditions.currentSpeed} kn</bdi></span></div><button class="training-button primary" data-location="${location.id}" ${isActive ? 'disabled' : ''}>${esc(t('Sail here'))}</button></div></article>`).join('')}</div>`,
  );
  document.querySelectorAll('[data-location]').forEach((button) => {
    button.onclick = () => {
      if (isActive) return;
      document.querySelector('#modal').close();
      onSelect(button.dataset.location);
    };
  });
}
