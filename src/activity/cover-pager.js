import './cover-pager.css';
import { createCoverSlide } from './cover-slide.js';

const interactive =
  'button,a,input,select,textarea,summary,[role="combobox"],[role="listbox"],[contenteditable="true"]';

export function mountCoverPager({ container, cover, getPage, getPreview, select, translate: t }) {
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
  const motion = createCoverSlide({ container, cover, reducedMotion });
  const pages = [...cover.querySelectorAll('[data-section-page]')];
  const rtl = () => document.documentElement.dir === 'rtl';
  let signature = '',
    drag = null,
    selecting = false;
  const available = () => !cover.hidden && !cover.inert && !document.querySelector('dialog[open]');
  function sync() {
    const page = getPage();
    nav.hidden = !page;
    if (!page) {
      resetDrag();
      motion.cancel();
      return;
    }
    const key = [page.kind, page.index, page.total, page.title, page.previous, page.next].join(':');
    if (key === signature) return;
    resetDrag();
    if (!selecting) motion.cancel();
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
  function move(step, offset = 0) {
    const page = getPage();
    if (!available() || !page || page.index + step < 0 || page.index + step >= page.total)
      return false;
    const surface = pages.find((page) => !page.hidden);
    motion.slide(
      surface,
      {
        offset,
        direction: step * (rtl() ? -1 : 1),
        width: cover.clientWidth,
      },
      () => {
        selecting = true;
        try {
          select(page.index + step);
          cover.scrollTop = 0;
          const lesson = cover.querySelector('#lesson-cover');
          if (lesson) lesson.scrollTop = 0;
          sync();
        } finally {
          selecting = false;
        }
        return pages.find((page) => !page.hidden);
      },
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
    if (cover.hasPointerCapture(id)) cover.releasePointerCapture(id);
  }
  cover.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary) {
      resetDrag();
      motion.cancel();
      return;
    }
    if (
      event.pointerType === 'mouse' ||
      event.button !== 0 ||
      !available() ||
      event.target.closest(`${interactive},.cover-section-browser`)
    )
      return;
    // Leave browser edge gestures and text/control interactions available.
    if (event.clientX < 18 || event.clientX > innerWidth - 18) return;
    const surface = pages.find((page) => !page.hidden);
    if (!surface) return;
    motion.cancel();
    drag = {
      surface,
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      horizontal: false,
      offset: 0,
    };
  });
  cover.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x,
      dy = event.clientY - drag.y;
    if (!drag.horizontal) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 10) return;
      if (Math.abs(dy) > Math.abs(dx) * 1.25) {
        resetDrag();
        return;
      }
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.1) return;
      drag.horizontal = true;
      cover.setPointerCapture(event.pointerId);
      drag.surface.classList.add('is-swiping');
    }
    if (!available()) {
      resetDrag();
      return;
    }
    if (event.cancelable) event.preventDefault();
    const page = getPage();
    const step = (dx < 0 ? 1 : -1) * (rtl() ? -1 : 1);
    const canMove = page && page.index + step >= 0 && page.index + step < page.total;
    drag.offset = canMove
      ? Math.max(-cover.clientWidth, Math.min(cover.clientWidth, dx))
      : Math.max(-40, Math.min(40, dx * 0.2));
    if (!reducedMotion.matches) drag.surface.style.transform = `translateX(${drag.offset}px)`;
    if (canMove)
      motion.preview(drag.surface, () => getPreview(page.index + step), {
        key: `${page.kind}:${page.index + step}`,
        direction: step * (rtl() ? -1 : 1),
        width: cover.clientWidth,
        offset: drag.offset,
      });
    else motion.clearPreview();
  });
  cover.addEventListener('pointerup', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const { surface } = drag;
    const dx = event.clientX - drag.x;
    const threshold = Math.max(28, Math.min(44, cover.clientWidth * 0.08));
    // Once horizontal intent is established, allow a natural curved finish.
    const swipe = drag.horizontal && Math.abs(dx) >= threshold;
    const offset = drag.offset;
    resetDrag();
    if (!swipe || !move((dx < 0 ? 1 : -1) * (rtl() ? -1 : 1), offset)) {
      motion.settle(surface, offset);
    }
  });
  cover.addEventListener('pointercancel', (event) => {
    if (drag?.id === event.pointerId) {
      const { surface, offset } = drag;
      resetDrag();
      motion.settle(surface, offset);
    }
  });
  cover.addEventListener('lostpointercapture', (event) => {
    // Touch starts with implicit capture on the heading/text under the
    // finger. Transferring it to the page must not cancel our own swipe.
    if (event.target === cover && drag?.id === event.pointerId) {
      const { surface, offset } = drag;
      resetDrag();
      motion.settle(surface, offset);
    }
  });
  window.addEventListener('blur', () => {
    resetDrag();
    motion.cancel();
  });
  let viewportWidth = innerWidth;
  window.addEventListener('resize', () => {
    // Mobile browser toolbars can change the viewport height during a gesture.
    if (innerWidth !== viewportWidth) {
      resetDrag();
      motion.cancel();
    }
    viewportWidth = innerWidth;
  });
  new ResizeObserver(() => {
    if (nav.offsetHeight)
      container.style.setProperty('--cover-pager-height', `${nav.offsetHeight}px`);
  }).observe(nav);
  sync();
  return { sync };
}
