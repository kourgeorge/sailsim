import { LANGUAGES, translate as t } from './runtime.js';
import './language-picker.css';

// Keep the native select as the mobile control and language-change source.
export function mountLanguagePicker(select) {
  const desktop = window.matchMedia('(min-width: 901px)');
  const label = select.labels[0];
  const root = document.createElement('div');
  root.className = 'language-picker';
  root.dataset.noTranslate = 'true';
  root.innerHTML = `<button id="language-picker" type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="language-options"><svg class="language-globe" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><circle cx="10" cy="10" r="8"/><ellipse cx="10" cy="10" rx="3.5" ry="8"/><path d="M2 10h16M4 5.5h12M4 14.5h12"/></svg><bdi class="language-value"></bdi><svg class="language-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m2 4 4 4 4-4"/></svg></button><div id="language-options" class="language-menu" role="listbox" hidden></div>`;
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
    check.className = 'language-selected';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = '✓';
    option.append(code, name, check);
    menu.append(option);
    return option;
  });
  let active = 0,
    search = '',
    searchTime = 0;
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
  function close() {
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.removeAttribute('aria-activedescendant');
    search = '';
  }
  function highlight(index) {
    active = (index + options.length) % options.length;
    options.forEach((option, i) => option.classList.toggle('is-active', i === active));
    button.setAttribute('aria-activedescendant', options[active].id);
    options[active].scrollIntoView({ block: 'nearest' });
  }
  function open() {
    if (select.disabled || !desktop.matches) return;
    menu.hidden = false;
    menu.style.transform = '';
    const bounds = menu.getBoundingClientRect();
    const shift = Math.max(0, 12 - bounds.left) - Math.max(0, bounds.right - innerWidth + 12);
    menu.style.transform = `translateX(${shift}px)`;
    button.setAttribute('aria-expanded', 'true');
    highlight(LANGUAGES.findIndex((language) => language.code === select.value));
  }
  function choose(index) {
    close();
    button.focus({ preventScroll: true });
    const code = LANGUAGES[index].code;
    if (select.disabled || code === select.value) return;
    select.value = code;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    sync();
  }
  button.onclick = () => (menu.hidden ? open() : close());
  button.onkeydown = (event) => {
    const { key } = event;
    if (key === 'Tab') return close();
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' ', 'Escape'].includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      if (key === 'Escape') close();
      else if (key === 'Enter' || key === ' ') menu.hidden ? open() : choose(active);
      else if (menu.hidden) {
        open();
        if (key === 'Home') highlight(0);
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
      event.stopPropagation();
      if (menu.hidden) open();
      search = performance.now() - searchTime > 700 ? key : search + key;
      searchTime = performance.now();
      const index = LANGUAGES.findIndex((language) =>
        language.name.toLocaleLowerCase().startsWith(search.toLocaleLowerCase()),
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
  window.addEventListener('resize', close);
  window.addEventListener('sail:text-size', close);
  sync();
  arrange();
}
