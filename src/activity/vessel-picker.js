import { VESSELS, getVessel } from '../vessels.js';
import { translate as t } from '../i18n/runtime.js';
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
  root.innerHTML = `<span id="cover-vessel-label" class="vessel-label">${esc(t('Choose your boat'))}</span><div class="vessel-picker"><button id="cover-vessel" class="vessel-trigger" type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="cover-vessel-options" aria-labelledby="cover-vessel-label cover-vessel-value" aria-describedby="cover-vessel-specs"><span id="cover-vessel-value"></span><svg class="vessel-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></button><div id="cover-vessel-options" class="vessel-menu" role="listbox" aria-labelledby="cover-vessel-label" hidden>${VESSELS.map((vessel) => `<div id="vessel-option-${vessel.id}" class="vessel-option" role="option" aria-selected="false" data-vessel="${vessel.id}">${copy(vessel)}<span class="vessel-selected" aria-hidden="true">✓</span></div>`).join('')}</div></div><p id="cover-vessel-specs" dir="auto"></p>`;
  parent.before(root);
  const button = root.querySelector('#cover-vessel'),
    value = root.querySelector('#cover-vessel-value'),
    menu = root.querySelector('.vessel-menu'),
    options = [...menu.children];
  let active = 0,
    selected,
    search = '',
    searchTime = 0;
  function highlight(index) {
    active = (index + options.length) % options.length;
    options.forEach((option, i) => option.classList.toggle('is-active', i === active));
    button.setAttribute('aria-activedescendant', options[active].id);
    options[active].scrollIntoView({ block: 'nearest' });
  }
  function close() {
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.removeAttribute('aria-activedescendant');
    search = '';
  }
  function open() {
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    highlight(VESSELS.findIndex((vessel) => vessel.id === selected));
  }
  function choose(index) {
    close();
    onVessel(VESSELS[index].id);
    sync();
    button.focus({ preventScroll: true });
  }
  button.onclick = () => (menu.hidden ? open() : close());
  button.onkeydown = (event) => {
    const { key } = event;
    if (key === 'Tab') {
      close();
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' ', 'Escape'].includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      if (key === 'Escape') close();
      else if (key === 'Enter' || key === ' ') menu.hidden ? open() : choose(active);
      else if (menu.hidden) {
        open();
        if (key === 'End') highlight(options.length - 1);
      } else
        highlight(
          key === 'Home'
            ? 0
            : key === 'End'
              ? options.length - 1
              : active + (key === 'ArrowDown' ? 1 : -1),
        );
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      if (menu.hidden) open();
      search = performance.now() - searchTime > 700 ? key : search + key;
      searchTime = performance.now();
      const index = VESSELS.findIndex((vessel) =>
        `${t(vessel.name)} ${type(vessel)}`
          .toLocaleLowerCase()
          .startsWith(search.toLocaleLowerCase()),
      );
      if (index >= 0) highlight(index);
    }
  };
  options.forEach((option, index) => {
    option.onpointerdown = (event) => event.preventDefault();
    option.onclick = () => choose(index);
  });
  document.addEventListener('pointerdown', (event) => {
    if (!root.contains(event.target)) close();
  });
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget)) close();
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
