import './mobile-docks.css';

const POSITIONS = ['top-right', 'bottom-right', 'bottom-left', 'top-left'];
const GAP = 12;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const nearest = (points, x, y) =>
  points.reduce((best, point) =>
    Math.hypot(point.x - x, point.y - y) < Math.hypot(best.x - x, best.y - y) ? point : best,
  );

// Panels floating over the mobile scene dock at the free ends of each side.
// The panel moved most recently keeps its spot; the others make room for it.
export function createMobileDocks(simulator, mobile) {
  const targets = document.createElement('div');
  targets.className = 'mobile-dock-targets';
  targets.setAttribute('aria-hidden', 'true');
  simulator.append(targets);
  const fixed = [
    ...simulator.querySelectorAll(
      '.mobile-scene-toolbar, .mobile-indicators, .simulation-console, .mobile-controls-drawer',
    ),
  ];
  const docks = [];
  let frame = 0;
  let rank = 0;

  function layoutPoints(dock, placed = []) {
    const scene = simulator.getBoundingClientRect();
    const style = getComputedStyle(targets);
    const edge = (side) => parseFloat(style.getPropertyValue(`padding-${side}`)) || GAP;
    const width = dock.node.offsetWidth;
    const height = dock.node.offsetHeight;
    const left = edge('left');
    const right = Math.max(left, scene.width - edge('right') - width);
    const top = edge('top');
    const bottom = Math.max(top, scene.height - edge('bottom') - height);
    const occupied = [
      ...fixed
        .map((node) => ({ node, rect: node.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width && rect.height)
        .map(({ node, rect }) => ({
          drawer: node.classList.contains('mobile-controls-drawer'),
          left: rect.left - scene.left,
          right: rect.right - scene.left,
          top: rect.top - scene.top,
          bottom: rect.bottom - scene.top,
        })),
      ...placed,
    ];

    // Find the top and bottom of each free edge. This also handles landscape,
    // larger text and other panels without placing this one over them.
    const available = (avoidDrawer) =>
      POSITIONS.flatMap((id) => {
        const x = id.endsWith('left') ? left : right;
        let intervals = [[top, bottom]];
        for (const rect of occupied) {
          if (!avoidDrawer && rect.drawer) continue;
          if (x + width + GAP <= rect.left || x >= rect.right + GAP) continue;
          const start = rect.top - height - GAP;
          const end = rect.bottom + GAP;
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
    const points = fallback.length ? fallback : [{ id: dock.preferred, x: right, y: top }];
    return { points, box: { width, height, left, right, top, bottom } };
  }

  function settle() {
    if (!mobile.matches || docks.some((dock) => dock.drag)) return;
    const placed = [];
    for (const dock of [...docks].sort((a, b) => b.rank - a.rank)) {
      if (!dock.shown()) continue;
      const { points, box } = layoutPoints(dock, placed);
      const point =
        points.find(({ id }) => id === dock.preferred) ||
        nearest(
          points,
          dock.preferred.endsWith('left') ? box.left : box.right,
          dock.preferred.startsWith('top') ? box.top : box.bottom,
        );
      dock.node.dataset[dock.attribute] = point.id;
      dock.move(point);
      placed.push({
        left: point.x,
        right: point.x + box.width,
        top: point.y,
        bottom: point.y + box.height,
      });
    }
  }

  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(settle);
  }

  function cancel(dock) {
    dock.finish(true);
    dock.node.classList.remove('is-snapping');
  }

  function add(
    node,
    { storageKey, attribute = 'dockPosition', initial = 'top-right', handle = () => true, onTap },
  ) {
    const dock = { node, attribute, preferred: initial, rank: 0, drag: null, dragged: false };
    try {
      const saved = localStorage.getItem(storageKey);
      if (POSITIONS.includes(saved)) dock.preferred = saved;
    } catch {
      /* Moving panels also works without browser storage. */
    }
    node.classList.add('mobile-dock');
    dock.shown = () => !node.hidden && node.getClientRects().length > 0;
    dock.move = (point) => {
      node.style.setProperty('--dock-x', `${point.x}px`);
      node.style.setProperty('--dock-y', `${point.y}px`);
    };
    const choose = (id) => {
      dock.preferred = id;
      dock.rank = ++rank;
      try {
        localStorage.setItem(storageKey, id);
      } catch {
        /* Keep the position for this visit. */
      }
      settle();
    };
    // The chosen corner wins over other panels, so offer every free corner.
    dock.cycle = () => {
      const { points } = layoutPoints(dock);
      const index = points.findIndex(({ id }) => id === node.dataset[attribute]);
      choose(points[(index + 1) % points.length].id);
    };
    // True once after a pointer gesture, so its trailing click is not repeated.
    dock.handledPointer = () => {
      const handled = dock.dragged;
      dock.dragged = false;
      return handled;
    };
    dock.finish = (cancelled = false) => {
      const { drag } = dock;
      if (!drag) return;
      dock.drag = null;
      dock.dragged = drag.moved || Boolean(onTap);
      node.classList.remove('is-dragging');
      node.classList.toggle('is-snapping', drag.moved && !cancelled);
      targets.replaceChildren();
      if (node.hasPointerCapture(drag.pointerId)) node.releasePointerCapture(drag.pointerId);
      if (drag.moved && !cancelled) choose(nearest(drag.points, drag.x, drag.y).id);
      // A snap can move the card before the browser generates its click. Handle
      // taps at pointer release while capture still identifies the right control.
      else if (!cancelled && onTap) onTap();
      else settle();
    };

    node.addEventListener('pointerdown', (event) => {
      if (!mobile.matches || !event.isPrimary || event.button !== 0 || dock.drag) return;
      if (!handle(event.target)) return;
      const { points, box } = layoutPoints(dock);
      const rect = node.getBoundingClientRect();
      const scene = simulator.getBoundingClientRect();
      dock.dragged = false;
      dock.drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: rect.left - scene.left,
        originY: rect.top - scene.top,
        x: rect.left - scene.left,
        y: rect.top - scene.top,
        box,
        points,
        moved: false,
      };
      node.classList.remove('is-snapping');
      dock.move(dock.drag);
      node.setPointerCapture(event.pointerId);
      event.stopPropagation();
    });
    node.addEventListener('pointermove', (event) => {
      const { drag } = dock;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        node.classList.add('is-dragging');
        for (const point of drag.points) {
          const target = document.createElement('div');
          target.className = 'mobile-dock-target';
          target.dataset.position = point.id;
          Object.assign(target.style, {
            left: `${point.x}px`,
            top: `${point.y}px`,
            width: `${drag.box.width}px`,
            height: `${drag.box.height}px`,
          });
          targets.append(target);
        }
      }
      drag.x = clamp(drag.originX + dx, drag.box.left, drag.box.right);
      drag.y = clamp(drag.originY + dy, drag.box.top, drag.box.bottom);
      dock.move(drag);
      const closest = nearest(drag.points, drag.x, drag.y);
      for (const target of targets.children)
        target.classList.toggle('is-nearest', target.dataset.position === closest.id);
      event.preventDefault();
      event.stopPropagation();
    });
    node.addEventListener('pointerup', (event) => {
      if (event.pointerId === dock.drag?.pointerId) dock.finish();
    });
    for (const type of ['pointercancel', 'lostpointercapture'])
      node.addEventListener(type, (event) => {
        if (event.pointerId === dock.drag?.pointerId) dock.finish(true);
      });
    new MutationObserver(() => {
      if (node.hidden) dock.finish(true);
      schedule();
    }).observe(node, { attributes: true, attributeFilter: ['hidden'] });
    resize.observe(node);
    docks.push(dock);
    schedule();
    return dock;
  }

  // Live panels such as the race standings change size while sailing, so only
  // a change to the scene or its fixed overlays interrupts a drag.
  const resize = new ResizeObserver((entries) => {
    if (entries.some(({ target }) => !docks.some((dock) => dock.node === target)))
      docks.forEach(cancel);
    schedule();
  });
  for (const node of [simulator, ...fixed]) resize.observe(node);
  window.addEventListener('resize', () => {
    docks.forEach(cancel);
    schedule();
  });
  window.addEventListener('blur', () => docks.forEach((dock) => dock.finish(true)));
  window.addEventListener('sail:text-size', schedule);
  mobile.addEventListener('change', () => {
    docks.forEach(cancel);
    schedule();
  });

  return { add, schedule };
}
