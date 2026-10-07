import { translate as t } from '../i18n/runtime.js';
import { SKIES, SKY_LABELS, TIMES_OF_DAY, TIME_OF_DAY_LABELS } from '../sky-conditions.js';
import './weather-control.css';

export function weatherControl(id, changing) {
  return `<label class="weather-choice" for="${id}"><span>${t('Weather')}</span><select id="${id}"><option value="changing" ${changing ? 'selected' : ''}>${t('Changing weather')}</option><option value="fixed" ${changing ? '' : 'selected'}>${t('Fixed weather')}</option></select></label>`;
}

const options = (values, labels, selected) =>
  values
    .map(
      (value) =>
        `<option value="${value}" ${value === selected ? 'selected' : ''}>${t(labels[value])}</option>`,
    )
    .join('');

// Time of day and sky are shared by free sailing and every challenge.
export function skyControls(choice) {
  return `<div class="sky-choices"><label class="weather-choice" for="sky-time"><span>${t('Time of day')}</span><select id="sky-time">${options(TIMES_OF_DAY, TIME_OF_DAY_LABELS, choice.timeOfDay)}</select></label><label class="weather-choice" for="sky-weather"><span>${t('Sky')}</span><select id="sky-weather">${options(SKIES, SKY_LABELS, choice.sky)}</select></label></div><p class="modal-note sky-note">${t('Navigation lights come on from sunset to sunrise, and in fog, rain or storms.')}</p>`;
}

export function bindSkyControls(root, onChange) {
  const time = root.querySelector('#sky-time'),
    sky = root.querySelector('#sky-weather');
  if (!time || !sky) return;
  const change = () => onChange({ timeOfDay: time.value, sky: sky.value });
  time.onchange = sky.onchange = change;
}
