import './cover-pager.css';

const interactive =
  'button,a,input,select,textarea,summary,[role="combobox"],[role="listbox"],[contenteditable="true"]';

export function mountCoverPager({ container, cover, getPage, select, translate: t }) {
  const nav = document.createElement('nav');
  nav.className = 'cover-pager';
  nav.dataset.noTranslate = 'true';
  nav.setAttribute('aria-label', t('Browse this section'));
  nav.innerHTML = `<button type="button" class="cover-previous"><svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m12 4-6 6 6 6"/></svg><span></span></button><div class="cover-page-position"><div class="cover-page-count" role="status" aria-live="polite" aria-atomic="true"><span class="cover-page-kind"></span><bdi class="cover-page-number" dir="ltr"></bdi><span class="cover-page-name"></span></div><div class="cover-page-track" aria-hidden="true"><span></span></div><span class="cover-swipe-hint"></span></div><button type="button" class="cover-next"><span></span><svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m8 4 6 6-6 6"/></svg></button>`;
  container.append(nav);
  const previous = nav.querySelector('.cover-previous');
  const next = nav.querySelector('.cover-next');
  previous.querySelector('span').textContent = t('Previous');
  next.querySelector('span').textContent = t('Next');
  nav.querySelector('.cover-swipe-hint').textContent = t('Swipe to browse');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pages = [...cover.querySelectorAll('[data-section-page]')];
  const rtl = () => document.documentElement.dir === 'rtl';
  let signature = '',
    drag = null,
    animation = null;
  const available = () => !cover.hidden && !cover.inert && !document.querySelector('dialog[open]');
  function sync() {
    const page = getPage();
    nav.hidden = !page;
    if (!page) {
      resetDrag();
      return;
    }
    const key = [page.kind, page.index, page.total, page.title, page.previous, page.next].join(':');
    if (key === signature) return;
    signature = key;
    previous.disabled = page.index === 0;
    next.disabled = page.index === page.total - 1;
    for (const [button, action, title] of [
      [previous, 'Previous', page.previous],
      [next, 'Next', page.next],
    ]) {
      const label = `${t(action)}${title ? `: ${title}` : ''}`;
      button.setAttribute('aria-label', label);
      button.title = label;
    }
    nav.querySelector('.cover-page-kind').textContent = t(page.kind);
    nav.querySelector('.cover-page-number').textContent =
      `${String(page.index + 1).padStart(2, '0')} / ${String(page.total).padStart(2, '0')}`;
    nav.querySelector('.cover-page-name').textContent = `: ${page.title}`;
    nav.querySelector('.cover-page-track > span').style.transform =
      `scaleX(${(page.index + 1) / page.total})`;
  }
  function reveal(surface, from) {
    animation?.cancel();
    if (reducedMotion.matches || !surface || surface.hidden) return;
    animation = surface.animate(
      [
        { transform: `translateX(${from}px)`, opacity: 0.6 },
        { transform: 'translateX(0)', opacity: 1 },
      ],
      { duration: 180, easing: 'ease-out' },
    );
  }
  function move(step) {
    const page = getPage();
    if (!available() || !page || page.index + step < 0 || page.index + step >= page.total)
      return false;
    select(page.index + step);
    cover.scrollTop = 0;
    const lesson = cover.querySelector('#lesson-cover');
    if (lesson) lesson.scrollTop = 0;
    sync();
    reveal(
      pages.find((surface) => !surface.hidden),
      step * (rtl() ? -24 : 24),
    );
    return true;
  }
  previous.onclick = () => move(-1);
  next.onclick = () => move(1);
  function keyboard(event) {
    if (
      !['ArrowLeft', 'ArrowRight'].includes(event.key) ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;
    if (event.target.closest(interactive) && !nav.contains(event.target)) return;
    if (!available()) return;
    event.preventDefault();
    event.stopPropagation();
    move((event.key === 'ArrowRight' ? 1 : -1) * (rtl() ? -1 : 1));
  }
  cover.addEventListener('keydown', keyboard);
  nav.addEventListener('keydown', keyboard);
  function resetDrag() {
    if (!drag) return;
    const { surface, id } = drag;
    drag = null;
    surface.style.transform = '';
    surface.classList.remove('is-swiping');
    if (surface.hasPointerCapture(id)) surface.releasePointerCapture(id);
  }
  for (const surface of pages) {
    surface.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary) {
        resetDrag();
        return;
      }
      if (
        event.pointerType === 'mouse' ||
        event.button !== 0 ||
        !available() ||
        event.target.closest(interactive)
      )
        return;
      // Leave browser edge gestures and text/control interactions available.
      if (event.clientX < 18 || event.clientX > innerWidth - 18) return;
      animation?.cancel();
      drag = {
        surface,
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        horizontal: false,
      };
    });
    surface.addEventListener('pointermove', (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x,
        dy = event.clientY - drag.y;
      if (!drag.horizontal) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
        if (Math.abs(dx) < Math.abs(dy) * 1.35) {
          resetDrag();
          return;
        }
        drag.horizontal = true;
        surface.setPointerCapture(event.pointerId);
        surface.classList.add('is-swiping');
      }
      if (!available()) {
        resetDrag();
        return;
      }
      if (event.cancelable) event.preventDefault();
      if (!reducedMotion.matches)
        surface.style.transform = `translateX(${Math.max(-48, Math.min(48, dx * 0.18))}px)`;
    });
    surface.addEventListener('pointerup', (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x,
        dy = event.clientY - drag.y;
      const threshold = Math.max(40, Math.min(64, surface.clientWidth * 0.16));
      const swipe =
        drag.horizontal && Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.35;
      const offset = drag.horizontal ? Math.max(-48, Math.min(48, dx * 0.18)) : 0;
      resetDrag();
      if (!swipe || !move((dx < 0 ? 1 : -1) * (rtl() ? -1 : 1))) {
        if (offset) reveal(surface, offset);
      }
    });
    surface.addEventListener('pointercancel', (event) => {
      if (drag?.id === event.pointerId) resetDrag();
    });
    surface.addEventListener('lostpointercapture', (event) => {
      // Touch starts with implicit capture on the heading/text under the
      // finger. Transferring it to the page must not cancel our own swipe.
      if (event.target === surface && drag?.id === event.pointerId) resetDrag();
    });
  }
  window.addEventListener('blur', resetDrag);
  window.addEventListener('resize', resetDrag);
  new ResizeObserver(() => {
    if (nav.offsetHeight)
      container.style.setProperty('--cover-pager-height', `${nav.offsetHeight}px`);
  }).observe(nav);
  sync();
  return { sync };
}
