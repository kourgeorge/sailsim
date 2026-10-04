import { VESSELS, getVessel } from '../vessels.js';
import { translate as t } from '../i18n/runtime.js';
import { mountDropdown } from '../ui/dropdown.js';
import './vessel-picker.css';

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c],
  );
const type = (vessel) => t(vessel.type === 'catamaran' ? 'Cruising catamaran' : 'Sailing yacht');
const boatIcon = (vessel) =>
  `<svg class="vessel-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 4v19M14 7 5 20h9ZM19 10l7 10h-7Z"/>${vessel.type === 'catamaran' ? '<path d="M3 23h26M4 23l2 5h5l2-5m6 0 2 5h5l2-5"/>' : '<path d="M4 23h24l-5 5H9Z"/>'}</svg>`;
const copy = (vessel) =>
  `${boatIcon(vessel)}<span class="vessel-copy"><strong>${esc(t(vessel.name))}</strong><small>${esc(type(vessel))}</small></span>`;

export function mountVesselPicker(parent, { getSelectedVessel, onVessel }) {
  const root = document.createElement('div');
  root.className = 'vessel-choice';
  root.dataset.noTranslate = 'true';
  root.innerHTML = `<span id="cover-vessel-label" class="vessel-label">${esc(t('Choose your boat'))}</span><div class="vessel-picker"><button id="cover-vessel" class="vessel-trigger" type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="cover-vessel-options" aria-labelledby="cover-vessel-label cover-vessel-value" aria-describedby="cover-vessel-specs"><span id="cover-vessel-value"></span><svg class="vessel-chevron dropdown-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></button><div id="cover-vessel-options" class="vessel-menu" role="listbox" aria-labelledby="cover-vessel-label" hidden>${VESSELS.map((vessel) => `<div id="vessel-option-${vessel.id}" class="vessel-option" role="option" aria-selected="false" data-vessel="${vessel.id}">${copy(vessel)}<span class="vessel-selected dropdown-check" aria-hidden="true">✓</span></div>`).join('')}</div></div><p id="cover-vessel-specs" dir="auto"></p>`;
  parent.before(root);
  const button = root.querySelector('#cover-vessel'),
    value = root.querySelector('#cover-vessel-value'),
    menu = root.querySelector('.vessel-menu'),
    options = [...menu.children];
  let selected;
  const { close } = mountDropdown({
    root,
    button,
    menu,
    getSelected: () => VESSELS.findIndex((vessel) => vessel.id === selected),
    getSearchText: (_option, index) => `${t(VESSELS[index].name)} ${type(VESSELS[index])}`,
    onSelect(index) {
      onVessel(VESSELS[index].id);
      sync();
    },
  });
  function sync() {
    const vessel = getVessel(getSelectedVessel());
    if (selected === vessel.id) return;
    selected = vessel.id;
    button.dataset.vessel = vessel.id;
    value.innerHTML = copy(vessel);
    options.forEach((option) =>
      option.setAttribute('aria-selected', String(option.dataset.vessel === vessel.id)),
    );
    root.querySelector('#cover-vessel-specs').textContent =
      `${vessel.length} m · ${t('Beam')} ${vessel.beam} m · ${t('Draft')} ${vessel.draft} m${vessel.type === 'catamaran' ? ` · ${t('Twin engines')}` : ''}`;
  }
  sync();
  return { sync, close };
}
