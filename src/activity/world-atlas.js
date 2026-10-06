import { WORLD_DESTINATIONS } from '../locations.js';
import { worldMapPoint } from '../world/real-terrain.js';
import './world-atlas.css';

const labelPositions = [
  [30, 29],
  [36, 52],
  [20, 42],
  [51, 35],
  [65, 33],
  [48, 10],
  [65, 65],
  [85, 52],
  [12, 68],
  [88, 83],
];
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

export function worldAtlas(t) {
  return `<section class="world-atlas" aria-label="${esc(t('World sailing destinations'))}"><div class="atlas-heading"><span>${esc(t('SAIL THE WORLD'))}</span><span>${esc(t('10 extraordinary destinations'))}</span></div><div class="atlas-scroll" tabindex="0" role="group" aria-label="${esc(t('World map. Select a destination.'))}"><div class="atlas-map" dir="ltr"><img src="${import.meta.env.BASE_URL}section-backgrounds/world-map.svg" width="1200" height="600" alt=""><svg class="atlas-routes" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">${WORLD_DESTINATIONS.map(
    (location, index) => {
      const p = worldMapPoint(location.coordinates),
        [x, y] = labelPositions[index];
      return `<g data-atlas-route="${location.id}"><path d="M${p.x * 10} ${p.y * 5}L${x * 10} ${y * 5}"/><circle cx="${p.x * 10}" cy="${p.y * 5}" r="3"/></g>`;
    },
  ).join(
    '',
  )}</svg><span class="atlas-ocean atlas-pacific">PACIFIC OCEAN</span><span class="atlas-ocean atlas-atlantic">ATLANTIC OCEAN</span><span class="atlas-ocean atlas-indian">INDIAN OCEAN</span>${WORLD_DESTINATIONS.map(
    (location, index) => {
      const [x, y] = labelPositions[index];
      return `<button type="button" class="atlas-pin" data-atlas-location="${location.id}" style="left:${x}%;top:${y}%" aria-pressed="false" aria-label="${esc(t(location.title))} · ${esc(t(location.region))}"><b>${String(index + 1).padStart(2, '0')}</b><span>${esc(t(location.title))}</span></button>`;
    },
  ).join(
    '',
  )}</div></div><div class="atlas-footer"><span>${esc(t('Choose a pin to explore'))}</span><a href="${import.meta.env.BASE_URL}terrain-sources.html" target="_blank" rel="noopener">${esc(t('Map & terrain sources'))} ↗</a></div></section>`;
}

export function syncWorldAtlas(root, id) {
  root.querySelectorAll('[data-atlas-location]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.atlasLocation === id));
  });
  root
    .querySelectorAll('[data-atlas-route]')
    .forEach((route) => route.classList.toggle('active', route.dataset.atlasRoute === id));
}
