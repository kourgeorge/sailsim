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
    selecting = false,
    dragFrame = 0;
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
    cancelAnimationFrame(dragFrame);
    dragFrame = 0;
    if (!drag) return;
    const { surface, id, source } = drag;
    drag = null;
    surface.style.transform = '';
    surface.classList.remove('is-swiping');
    if (source === 'pen' && cover.hasPointerCapture(id)) cover.releasePointerCapture(id);
  }
  function startDrag(target, id, x, y, source) {
    if (!available() || target.closest(`${interactive},.cover-section-browser`)) return;
    // Leave browser edge gestures and text/control interactions available.
    if (x < 18 || x > innerWidth - 18) return;
    const surface = pages.find((page) => !page.hidden);
    if (!surface) return;
    motion.cancel();
    drag = {
      surface,
      source,
      id,
      x,
      y,
      width: cover.clientWidth,
      horizontal: false,
      offset: 0,
    };
  }
  function drawDrag() {
    dragFrame = 0;
    if (!drag) return;
    const { surface, offset, width, page, step, canMove } = drag;
    if (!reducedMotion.matches) surface.style.transform = `translateX(${offset}px)`;
    if (canMove)
      motion.preview(surface, () => getPreview(page.index + step), {
        key: `${page.kind}:${page.index + step}`,
        direction: step * (rtl() ? -1 : 1),
        width,
        offset,
      });
    else motion.clearPreview();
  }
  function moveDrag(x, y, event) {
    const dx = x - drag.x,
      dy = y - drag.y;
    if (!drag.horizontal) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 10) return;
      if (Math.abs(dy) > Math.abs(dx) * 1.25) {
        resetDrag();
        return;
      }
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.1) return;
      drag.horizontal = true;
      if (drag.source === 'pen') cover.setPointerCapture(drag.id);
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
      ? Math.max(-drag.width, Math.min(drag.width, dx))
      : Math.max(-40, Math.min(40, dx * 0.2));
    Object.assign(drag, { page, step, canMove });
    // Touch samples can arrive faster than painting. Update the two page
    // transforms together once per frame, keeping preview work off that path.
    if (!dragFrame) dragFrame = requestAnimationFrame(drawDrag);
  }
  function endDrag(x) {
    const { surface } = drag,
      dx = x - drag.x;
    const threshold = Math.max(28, Math.min(44, drag.width * 0.08));
    // Once horizontal intent is established, allow a natural curved finish.
    const swipe = drag.horizontal && Math.abs(dx) >= threshold;
    const offset = drag.offset;
    resetDrag();
    if (!swipe || !move((dx < 0 ? 1 : -1) * (rtl() ? -1 : 1), offset)) {
      motion.settle(surface, offset);
    }
  }
  function cancelDrag() {
    if (drag) {
      const { surface, offset } = drag;
      resetDrag();
      motion.settle(surface, offset);
    }
  }
  // iPad browsers can cancel their pointer stream when an inner scroll view
  // takes ownership. The native touch stream continues through that handoff;
  // track it directly and prevent native scrolling only after horizontal intent.
  cover.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length !== 1) {
        cancelDrag();
        return;
      }
      const touch = event.changedTouches[0];
      startDrag(event.target, touch.identifier, touch.clientX, touch.clientY, 'touch');
    },
    { passive: true },
  );
  cover.addEventListener(
    'touchmove',
    (event) => {
      if (drag?.source !== 'touch') return;
      if (event.touches.length !== 1) {
        cancelDrag();
        return;
      }
      const touch = [...event.touches].find((touch) => touch.identifier === drag.id);
      if (touch) moveDrag(touch.clientX, touch.clientY, event);
    },
    { passive: false },
  );
  cover.addEventListener('touchend', (event) => {
    if (drag?.source !== 'touch') return;
    const touch = [...event.changedTouches].find((touch) => touch.identifier === drag.id);
    if (touch) endDrag(touch.clientX);
  });
  cover.addEventListener('touchcancel', () => {
    if (drag?.source === 'touch') cancelDrag();
  });
  // Stylus browsing still uses pointer capture; touch must not run twice.
  cover.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'pen' || event.button !== 0) return;
    if (!event.isPrimary) {
      cancelDrag();
      return;
    }
    startDrag(event.target, event.pointerId, event.clientX, event.clientY, 'pen');
  });
  cover.addEventListener('pointermove', (event) => {
    if (drag?.source === 'pen' && drag.id === event.pointerId)
      moveDrag(event.clientX, event.clientY, event);
  });
  cover.addEventListener('pointerup', (event) => {
    if (drag?.source === 'pen' && drag.id === event.pointerId) endDrag(event.clientX);
  });
  cover.addEventListener('pointercancel', (event) => {
    if (drag?.source === 'pen' && drag.id === event.pointerId) cancelDrag();
  });
  cover.addEventListener('lostpointercapture', (event) => {
    if (event.target === cover && drag?.source === 'pen' && drag.id === event.pointerId)
      cancelDrag();
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
