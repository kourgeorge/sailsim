import { translate as t } from '../i18n/runtime.js';

export function mountMobileCompass(simulator, mobile, docks) {
  const compass = simulator.querySelector('#scene-compass');
  const placeholder = document.createComment('desktop compass');
  compass.before(placeholder);
  const dock = docks.add(compass, {
    storageKey: 'sail-compass-position',
    attribute: 'compassPosition',
    initial: 'top-right',
    onTap: () => dock.cycle(),
  });

  compass.addEventListener('click', (event) => {
    if (!mobile.matches) return;
    event.stopPropagation();
    if (!dock.handledPointer() || event.detail === 0) dock.cycle();
  });
  compass.addEventListener('keydown', (event) => {
    if (!mobile.matches || !['Enter', ' ', 'Escape'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'Escape') dock.finish(true);
    else if (!event.repeat) dock.cycle();
  });

  function arrange() {
    dock.finish(true);
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
    docks.schedule();
  }
  mobile.addEventListener('change', arrange);
  arrange();
}

// Race standings and the challenge card move by their title row, so their
// buttons and scrolling lists keep working.
export function mountMobilePanel(panel, mobile, docks, { storageKey, handle }) {
  if (!panel) return;
  const dock = docks.add(panel, {
    storageKey,
    initial: 'top-left',
    handle: (target) => Boolean(target.closest(handle)) && !target.closest('button, summary, a'),
  });
  // Dragging the title row must not also count as a tap on the scene or a button.
  panel.addEventListener(
    'click',
    (event) => {
      if (mobile.matches && dock.handledPointer() && event.target.closest(handle)) {
        event.stopPropagation();
      }
    },
    true,
  );
}
