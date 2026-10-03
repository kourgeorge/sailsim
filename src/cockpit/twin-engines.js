import { translate as t } from '../i18n/runtime.js';
import { getVessel } from '../vessels.js';
import './twin-engines.css';

export function mountTwinEngines(container, { getState, onChange }) {
  const root = document.createElement('fieldset');
  root.className = 'twin-engines';
  const legend = document.createElement('legend');
  legend.textContent = t('Twin engines');
  root.append(legend);
  const pair = document.createElement('div');
  pair.className = 'twin-engine-pair';
  root.append(pair);
  const controls = [];
  for (const [key, label] of [
    ['portThrottle', 'Port engine'],
    ['starboardThrottle', 'Starboard engine'],
  ]) {
    const row = document.createElement('label'),
      name = document.createElement('span'),
      value = document.createElement('output'),
      input = document.createElement('input');
    name.textContent = t(label);
    value.dir = 'ltr';
    Object.assign(input, {
      id: `cockpit-${key}`,
      type: 'range',
      min: '-1',
      max: '1',
      step: '.05',
      value: '0',
    });
    input.setAttribute('aria-label', t(label));
    value.htmlFor = input.id;
    input.oninput = () => onChange({ [key]: Number(input.value) });
    row.append(name, value, input);
    pair.append(row);
    controls.push({ key, input, value });
  }
  const status = document.createElement('p');
  status.className = 'catamaran-stability';
  status.setAttribute('role', 'status');
  root.append(status);
  container.append(root);
  return {
    update() {
      const s = getState();
      root.hidden = getVessel(s).type !== 'catamaran';
      if (root.hidden) return;
      for (const { key, input, value } of controls) {
        input.value = String(s[key]);
        value.textContent = `${s[key] < 0 ? '▼' : s[key] > 0 ? '▲' : '–'} ${Math.round(Math.abs(s[key]) * 100)}%`;
      }
      const label = s.capsized
        ? t('Capsized · restart the voyage')
        : s.windwardHullLoad < 0.12 || s.stabilityLoad > 0.65
          ? t('High sail load · reef or ease sheets')
          : '';
      if (status.textContent !== label) status.textContent = label;
      status.hidden = !label;
    },
  };
}
