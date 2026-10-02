import { translate as t } from '../i18n/runtime.js';

const STORAGE_KEY = 'sail-compass-position';
const POSITIONS = ['top-right', 'bottom-right', 'bottom-left', 'top-left'];
const GAP = 12;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const nearest = (points, x, y) =>
  points.reduce((best, point) =>
    Math.hypot(point.x - x, point.y - y) < Math.hypot(best.x - x, best.y - y) ? point : best,
  );

export function mountMobileCompass(simulator, mobile) {
  const compass = simulator.querySelector('#scene-compass');
  const placeholder = document.createComment('desktop compass');
  compass.before(placeholder);
  const targets = document.createElement('div');
  targets.className = 'compass-dock-targets';
  targets.setAttribute('aria-hidden', 'true');
  simulator.append(targets);
  let preferred = POSITIONS[0];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (POSITIONS.includes(saved)) preferred = saved;
  } catch {
    /* Moving the compass also works without browser storage. */
  }
  let drag = null;
  let suppressClick = false;
  let frame = 0;
  let points = [];
  const obstacles = [
    ...simulator.querySelectorAll(
      '.mobile-scene-toolbar, .mobile-indicators, .simulation-console, .mobile-controls-drawer, #race-hud',
    ),
  ];

  function layoutPoints() {
    const bounds = simulator.getBoundingClientRect();
    const style = getComputedStyle(targets);
    const edge = (side) => parseFloat(style.getPropertyValue(`padding-${side}`)) || GAP;
    const width = compass.offsetWidth;
    const height = compass.offsetHeight;
    const left = edge('left');
    const right = Math.max(left, bounds.width - edge('right') - width);
    const top = edge('top');
    const bottom = Math.max(top, bounds.height - edge('bottom') - height);
    const occupied = obstacles
      .map((node) => ({ node, rect: node.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width && rect.height);

    // Find the top and bottom of each free edge. This also handles landscape,
    // larger text and the race standings without placing the compass over them.
    const available = (avoidDrawer) =>
      POSITIONS.flatMap((id) => {
        const x = id.endsWith('left') ? left : right;
        let intervals = [[top, bottom]];
        for (const { node, rect } of occupied) {
          if (!avoidDrawer && node.classList.contains('mobile-controls-drawer')) continue;
          if (x + width + GAP <= rect.left - bounds.left || x >= rect.right - bounds.left + GAP)
            continue;
          const start = rect.top - bounds.top - height - GAP;
          const end = rect.bottom - bounds.top + GAP;
          intervals = intervals.flatMap(([min, max]) => {
            if (end <= min || start >= max) return [[min, max]];
            return [min <= start ? [min, start] : null, end <= max ? [end, max] : null].filter(
              Boolean,
            );
          });
        }
        if (!intervals.length) return [];
        return [{ id, x, y: id.startsWith('top') ? intervals[0][0] : intervals.at(-1)[1] }];
      });
    // A tall temporary drawer can cover all available water on a small phone.
    // Keep the saved dock beneath it until the drawer closes.
    const clear = available(true);
    const fallback = clear.length ? clear : available(false);
    points = fallback.length ? fallback : [{ id: preferred, x: right, y: top }];
    return { width, height, left, right, top, bottom };
  }

  function move(point) {
    compass.style.setProperty('--compass-x', `${point.x}px`);
    compass.style.setProperty('--compass-y', `${point.y}px`);
  }

  function settle() {
    if (!mobile.matches || compass.hidden || drag) return;
    const bounds = layoutPoints();
    const point =
      points.find(({ id }) => id === preferred) ||
      nearest(
        points,
        preferred.endsWith('left') ? bounds.left : bounds.right,
        preferred.startsWith('top') ? bounds.top : bounds.bottom,
      );
    compass.dataset.compassPosition = point.id;
    move(point);
  }

  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(settle);
  }

  function choose(id) {
    preferred = id;
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* Keep the position for this visit. */
    }
    settle();
  }

  function finish(cancelled = false) {
    if (!drag) return;
    const { pointerId, moved, x, y } = drag;
    drag = null;
    suppressClick = moved || cancelled;
    compass.classList.remove('is-dragging');
    compass.classList.toggle('is-snapping', moved && !cancelled);
    targets.replaceChildren();
    if (compass.hasPointerCapture(pointerId)) compass.releasePointerCapture(pointerId);
    if (moved && !cancelled) choose(nearest(points, x, y).id);
    else settle();
  }

  compass.addEventListener('pointerdown', (event) => {
    if (!mobile.matches || !event.isPrimary || event.button !== 0 || drag) return;
    const bounds = layoutPoints();
    const rect = compass.getBoundingClientRect();
    const scene = simulator.getBoundingClientRect();
    suppressClick = false;
    drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left - scene.left,
      originY: rect.top - scene.top,
      x: rect.left - scene.left,
      y: rect.top - scene.top,
      bounds,
      moved: false,
    };
    compass.classList.remove('is-snapping');
    move(drag);
    compass.setPointerCapture(event.pointerId);
    event.stopPropagation();
  });
  compass.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      compass.classList.add('is-dragging');
      for (const point of points) {
        const target = document.createElement('div');
        target.className = 'compass-dock-target';
        target.dataset.position = point.id;
        Object.assign(target.style, {
          left: `${point.x}px`,
          top: `${point.y}px`,
          width: `${drag.bounds.width}px`,
          height: `${drag.bounds.height}px`,
        });
        targets.append(target);
      }
    }
    drag.x = clamp(drag.originX + dx, drag.bounds.left, drag.bounds.right);
    drag.y = clamp(drag.originY + dy, drag.bounds.top, drag.bounds.bottom);
    move(drag);
    const closest = nearest(points, drag.x, drag.y);
    for (const target of targets.children)
      target.classList.toggle('is-nearest', target.dataset.position === closest.id);
    event.preventDefault();
    event.stopPropagation();
  });
  compass.addEventListener('pointerup', (event) => {
    if (event.pointerId === drag?.pointerId) finish();
  });
  for (const type of ['pointercancel', 'lostpointercapture'])
    compass.addEventListener(type, (event) => {
      if (event.pointerId === drag?.pointerId) finish(true);
    });
  const cycle = () => {
    layoutPoints();
    const index = points.findIndex(({ id }) => id === compass.dataset.compassPosition);
    choose(points[(index + 1) % points.length].id);
  };
  compass.addEventListener('click', (event) => {
    if (!mobile.matches) return;
    event.stopPropagation();
    if (!suppressClick || event.detail === 0) cycle();
    suppressClick = false;
  });
  compass.addEventListener('keydown', (event) => {
    if (!mobile.matches || !['Enter', ' ', 'Escape'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'Escape') finish(true);
    else if (!event.repeat) cycle();
  });

  function arrange() {
    finish(true);
    compass.classList.remove('is-snapping');
    if (mobile.matches) {
      simulator.append(compass);
      compass.tabIndex = 0;
      compass.setAttribute('role', 'button');
      compass.setAttribute('aria-label', t('Compass & wind'));
      compass.title = t('Drag or tap to move compass');
      compass.setAttribute('aria-description', compass.title);
    } else {
      placeholder.after(compass);
      for (const attribute of ['tabindex', 'role', 'aria-label', 'aria-description', 'title'])
        compass.removeAttribute(attribute);
    }
    schedule();
  }
  const onResize = () => {
    finish(true);
    compass.classList.remove('is-snapping');
    schedule();
  };
  const resize = new ResizeObserver(onResize);
  for (const node of [simulator, compass, ...obstacles]) resize.observe(node);
  new MutationObserver(() => {
    if (compass.hidden) finish(true);
    schedule();
  }).observe(compass, { attributes: true, attributeFilter: ['hidden'] });
  window.addEventListener('resize', onResize);
  window.addEventListener('blur', () => finish(true));
  window.addEventListener('sail:text-size', schedule);
  mobile.addEventListener('change', arrange);
  arrange();
}
