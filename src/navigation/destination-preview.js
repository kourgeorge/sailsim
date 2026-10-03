import landmarks from './destination-landmarks.json';
import { getLanguage, translate } from '../i18n/runtime.js';
import { sectionUI } from '../i18n/sections.js';
import './destination-preview.css';

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );

// Images and landmark positions are captured together from the actual 3D scene.
// The containing destination card supplies the accessible name and description.
export function destinationPreview(location) {
  const t = (value) => sectionUI[getLanguage()]?.[value] ?? translate(value);
  return `<span class="destination-aerial" aria-hidden="true"><img class="destination-image" src="${import.meta.env.BASE_URL}destination-previews/${location.id}.webp" width="2100" height="1400" alt="" loading="lazy" decoding="async">${landmarks[location.id].map((mark) => `<span class="destination-landmark" style="left:${mark.x}%;top:${mark.y}%"><span class="destination-landmark-dot"></span>${esc(t(mark.label))}</span>`).join('')}</span>`;
}
