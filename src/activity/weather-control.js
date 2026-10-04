import { translate as t } from '../i18n/runtime.js';
import './weather-control.css';

export function weatherControl(id, changing) {
  return `<label class="weather-choice" for="${id}"><span>${t('Weather')}</span><select id="${id}"><option value="changing" ${changing ? 'selected' : ''}>${t('Changing weather')}</option><option value="fixed" ${changing ? '' : 'selected'}>${t('Fixed weather')}</option></select></label>`;
}
