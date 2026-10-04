import './dropdown.css';

let opened;

// Rich pickers share this controller. Ordinary <select> controls inherit the
// same styles and keep the browser's selection, form, and accessibility APIs.
export function mountDropdown({
  root,
  button,
  menu,
  getSelected,
  onSelect,
  getSearchText = (option) => option.textContent,
  canOpen = () => !button.disabled,
  align = 'start',
}) {
  const events = new AbortController();
  const listen = (target, type, handler, options = {}) =>
    target.addEventListener(type, handler, { ...options, signal: events.signal });
  const options = [...menu.querySelectorAll('[role="option"]')];
  root.classList.add('dropdown');
  button.classList.add('dropdown-trigger');
  menu.classList.add('dropdown-menu');
  options.forEach((option) => option.classList.add('dropdown-option'));
  menu.setAttribute('popover', 'manual');
  let active = 0,
    search = '',
    searchTime = 0;
  const enabled = (index) =>
    Boolean(options[index]) && options[index].getAttribute('aria-disabled') !== 'true';

  function close() {
    if (menu.matches(':popover-open')) menu.hidePopover();
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.removeAttribute('aria-activedescendant');
    search = '';
    if (opened === close) opened = null;
  }

  function position() {
    if (menu.hidden) return;
    if (!button.checkVisibility()) return close();
    const viewport = window.visualViewport;
    const edge = 12;
    const left = (viewport?.offsetLeft || 0) + edge;
    const top = (viewport?.offsetTop || 0) + edge;
    const right = left + (viewport?.width || innerWidth) - edge * 2;
    const bottom = top + (viewport?.height || innerHeight) - edge * 2;
    const anchor = button.getBoundingClientRect();
    if (anchor.bottom < top || anchor.top > bottom) return close();
    const style = getComputedStyle(menu);
    const minWidth = parseFloat(style.getPropertyValue('--dropdown-menu-min-width')) || 0;
    menu.style.width = `${Math.min(right - left, Math.max(anchor.width, minWidth))}px`;
    const below = bottom - anchor.bottom - 6;
    const above = anchor.top - top - 6;
    const up = below < Math.min(menu.scrollHeight, 240) && above > below;
    menu.style.maxHeight = `${Math.max(44, Math.min(390, up ? above : below))}px`;
    const bounds = menu.getBoundingClientRect();
    const rtl = getComputedStyle(button).direction === 'rtl';
    const fromRight = (align === 'end') !== rtl;
    menu.style.left = `${Math.max(left, Math.min(right - bounds.width, fromRight ? anchor.right - bounds.width : anchor.left))}px`;
    menu.style.top = `${Math.max(top, up ? anchor.top - bounds.height - 6 : anchor.bottom + 6)}px`;
  }

  function highlight(index, direction = 1) {
    if (!options.length) return;
    index = (index + options.length) % options.length;
    for (let tries = 0; tries < options.length && !enabled(index); tries++)
      index = (index + direction + options.length) % options.length;
    if (!enabled(index)) return;
    active = index;
    options.forEach((option, i) => option.classList.toggle('is-active', i === active));
    button.setAttribute('aria-activedescendant', options[active].id);
    const bounds = options[active].getBoundingClientRect();
    const parent = menu.getBoundingClientRect();
    if (bounds.top < parent.top + 5) menu.scrollTop -= parent.top + 5 - bounds.top;
    else if (bounds.bottom > parent.bottom - 5) menu.scrollTop += bounds.bottom - parent.bottom + 5;
  }

  function open() {
    if (!canOpen() || !options.length) return;
    opened?.();
    opened = close;
    // Safari does not focus buttons on a pointer click by default.
    button.focus({ preventScroll: true });
    menu.hidden = false;
    menu.showPopover();
    button.setAttribute('aria-expanded', 'true');
    position();
    highlight(Math.max(0, getSelected()));
  }

  function choose(index) {
    if (!canOpen() || !enabled(index)) return;
    close();
    button.focus({ preventScroll: true });
    onSelect(index);
  }

  listen(button, 'click', () => (menu.hidden ? open() : close()));
  listen(button, 'keydown', (event) => {
    const { key } = event;
    if (key === 'Tab') return close();
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' ', 'Escape'].includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      if (key === 'Escape') return close();
      if (key === 'Enter' || key === ' ') return menu.hidden ? open() : choose(active);
      if (menu.hidden) {
        open();
        if (key === 'Home') highlight(0);
        if (key === 'End') highlight(options.length - 1, -1);
      } else {
        const direction = key === 'ArrowUp' || key === 'End' ? -1 : 1;
        highlight(
          key === 'Home' ? 0 : key === 'End' ? options.length - 1 : active + direction,
          direction,
        );
      }
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      if (menu.hidden) open();
      search = performance.now() - searchTime > 700 ? key : search + key;
      searchTime = performance.now();
      const index = options.findIndex(
        (option, i) =>
          enabled(i) &&
          getSearchText(option, i)
            .trim()
            .toLocaleLowerCase()
            .startsWith(search.toLocaleLowerCase()),
      );
      if (index >= 0) highlight(index);
    }
  });
  options.forEach((option, index) => {
    let touchStart;
    listen(option, 'pointerdown', (event) => {
      // Keep focus on the trigger until the click commits the selection.
      event.preventDefault();
    });
    listen(
      option,
      'touchstart',
      (event) => {
        touchStart = event.touches.length === 1 ? event.touches[0] : null;
      },
      { passive: true },
    );
    listen(
      option,
      'touchmove',
      (event) => {
        const touch = event.touches[0];
        if (
          !touch ||
          !touchStart ||
          event.touches.length !== 1 ||
          Math.hypot(touch.clientX - touchStart.clientX, touch.clientY - touchStart.clientY) > 10
        )
          touchStart = null;
      },
      { passive: true },
    );
    listen(
      option,
      'touchend',
      (event) => {
        const touch = event.changedTouches[0];
        if (
          touchStart &&
          touch &&
          Math.hypot(touch.clientX - touchStart.clientX, touch.clientY - touchStart.clientY) <= 10
        ) {
          // WebKit can suppress the click after focus-preserving pointerdown.
          // Commit a tap directly and prevent a second compatibility click.
          event.preventDefault();
          choose(index);
        }
        touchStart = null;
      },
      { passive: false },
    );
    listen(option, 'touchcancel', () => {
      touchStart = null;
    });
    listen(option, 'click', () => choose(index));
  });
  listen(document, 'pointerdown', (event) => {
    if (!root.contains(event.target)) close();
  });
  listen(root, 'focusout', (event) => {
    if (!root.contains(event.relatedTarget)) close();
  });
  listen(window, 'resize', close);
  listen(window, 'sail:text-size', close);
  listen(document, 'scroll', position, { capture: true, passive: true });
  if (window.visualViewport) listen(window.visualViewport, 'resize', close);
  close();
  return {
    close,
    destroy() {
      close();
      events.abort();
    },
  };
}
