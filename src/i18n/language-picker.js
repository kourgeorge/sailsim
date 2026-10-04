import { LANGUAGES, translate as t } from './runtime.js';
import { mountDropdown } from '../ui/dropdown.js';
import './language-picker.css';

// Keep the native select as the mobile control and language-change source.
export function mountLanguagePicker(select) {
  const desktop = window.matchMedia('(min-width: 901px)');
  const label = select.labels[0];
  const root = document.createElement('div');
  root.className = 'language-picker';
  root.dataset.noTranslate = 'true';
  root.innerHTML = `<button id="language-picker" type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="language-options"><svg class="language-globe" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><circle cx="10" cy="10" r="8"/><ellipse cx="10" cy="10" rx="3.5" ry="8"/><path d="M2 10h16M4 5.5h12M4 14.5h12"/></svg><bdi class="language-value"></bdi><svg class="language-chevron dropdown-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m2 4 4 4 4-4"/></svg></button><div id="language-options" class="language-menu" role="listbox" hidden></div>`;
  select.after(root);
  const button = root.querySelector('button');
  const value = root.querySelector('.language-value');
  const menu = root.querySelector('.language-menu');
  button.title = t(select.title);
  menu.setAttribute('aria-label', t('Language'));
  const options = LANGUAGES.map((language) => {
    const option = document.createElement('div');
    option.id = `language-option-${language.code}`;
    option.className = 'language-option';
    option.setAttribute('role', 'option');
    const code = document.createElement('span');
    code.className = 'language-code';
    code.setAttribute('aria-hidden', 'true');
    code.textContent = language.code.toUpperCase();
    const name = document.createElement('bdi');
    name.lang = language.code;
    name.dir = language.dir;
    name.textContent = language.name;
    const check = document.createElement('span');
    check.className = 'language-selected dropdown-check';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = '✓';
    option.append(code, name, check);
    menu.append(option);
    return option;
  });
  function sync() {
    const selected = LANGUAGES.findIndex((language) => language.code === select.value);
    const language = LANGUAGES[selected];
    value.textContent = language.name;
    value.lang = language.code;
    value.dir = language.dir;
    button.setAttribute('aria-label', `${t('Language')}: ${language.name}`);
    button.disabled = select.disabled;
    options.forEach((option, i) => option.setAttribute('aria-selected', String(i === selected)));
  }
  const { close } = mountDropdown({
    root,
    button,
    menu,
    align: 'end',
    canOpen: () => !select.disabled && desktop.matches,
    getSelected: () => LANGUAGES.findIndex((language) => language.code === select.value),
    getSearchText: (_option, index) => LANGUAGES[index].name,
    onSelect(index) {
      const code = LANGUAGES[index].code;
      if (code === select.value) return;
      select.value = code;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      sync();
    },
  });
  function arrange() {
    const hadFocus = root.contains(document.activeElement) || document.activeElement === select;
    close();
    select.hidden = desktop.matches;
    root.hidden = !desktop.matches;
    label.htmlFor = desktop.matches ? button.id : select.id;
    if (hadFocus) (desktop.matches ? button : select).focus({ preventScroll: true });
  }
  select.addEventListener('change', sync);
  // Failed downloads restore the native value and re-enable its control.
  new MutationObserver(sync).observe(select, { attributes: true, attributeFilter: ['disabled'] });
  desktop.addEventListener('change', arrange);
  sync();
  arrange();
}
