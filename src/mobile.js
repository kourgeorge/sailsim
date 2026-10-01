import {translate as t} from './i18n/runtime.js';

// Reuse the actual cockpit controls: changing layouts must preserve their state
// and listeners, including disabled controls during study and lesson preparation.
export function mountMobileLayout() {
  const simulator = document.querySelector('.simulator');
  const views = simulator.querySelector('.view-controls');
  const camera = document.createElement('select');
  camera.id = 'mobile-camera';
  camera.className = 'mobile-camera';
  camera.setAttribute('aria-label', t('Camera view'));
  for (const button of views.querySelectorAll('[data-camera]')) {
    const option = new Option(button.textContent.trim(), button.dataset.camera);
    camera.add(option);
  }
  views.prepend(camera);
  camera.addEventListener('change', () => views.querySelector(`[data-camera="${camera.value}"]`).click());
  const syncCamera = () => { camera.value = simulator.dataset.view || 'chase'; };
  new MutationObserver(syncCamera).observe(simulator, {attributes: true, attributeFilter: ['data-view']});
  syncCamera();

  const dock = simulator.querySelector('.control-dock');
  const groups = dock.querySelector('.cockpit-control-groups');
  const tabs = document.createElement('div');
  tabs.className = 'mobile-control-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', t('Boat controls'));
  const drawer = document.createElement('div');
  drawer.id = 'mobile-controls-drawer';
  drawer.className = 'mobile-controls-drawer';
  dock.before(drawer);
  drawer.append(tabs, dock);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.id = 'mobile-controls-toggle';
  toggle.className = 'mobile-controls-toggle';
  toggle.setAttribute('aria-controls', drawer.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = t('Boat controls');
  // Keep the disclosure before its contents in keyboard reading order.
  drawer.before(toggle);
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    drawer.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && drawer.classList.contains('is-open') && !document.querySelector('dialog[open]')) {
      toggle.click();
      toggle.focus();
    }
  });
  const panels = [
    ['helm', 'Helm', ['helm', 'engine']],
    ['sails', 'Sails', ['sheets', 'headsail', 'rig']],
    ['anchor', 'Anchor', ['anchor']],
    ['instruments', 'Instruments', []],
  ].map(([id, label, keys]) => {
    const panel = document.createElement('div');
    panel.className = 'mobile-control-panel';
    panel.id = `mobile-panel-${id}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.id = `mobile-tab-${id}`;
    button.textContent = t(label);
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    tabs.append(button);
    for (const key of keys) panel.append(groups.querySelector(`.cockpit-group-${key}`));
    if (id === 'instruments') panel.append(dock.querySelector('#helm-dashboard-mount'));
    groups.append(panel);
    return {id, panel, button};
  });
  const mobile = window.matchMedia('(max-width: 900px)');
  let selected = 'helm';
  const update = () => {
    const available = id => simulator.dataset.mode !== 'maneuver' || ['helm', 'instruments'].includes(id);
    if (!available(selected)) selected = 'helm';
    for (const {id, panel, button} of panels) {
      const active = id === selected;
      button.hidden = !available(id);
      panel.hidden = mobile.matches && !active;
      panel.classList.toggle('is-active', active);
      if (mobile.matches) {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', button.id);
      } else {
        panel.removeAttribute('role');
        panel.removeAttribute('aria-labelledby');
      }
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    }
    // The dashboard remains its own full-width row on desktop.
    const dashboard = dock.querySelector('#helm-dashboard-mount');
    (mobile.matches ? panels[3].panel : dock).append(dashboard);
    dock.scrollTop = 0;
  };
  for (const {id, button} of panels) button.addEventListener('click', () => { selected = id; update(); });
  tabs.addEventListener('keydown', event => {
    const visible = panels.filter(({button}) => !button.hidden);
    const index = visible.findIndex(({button}) => button === event.target);
    if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const direction = document.documentElement.dir === 'rtl' ? -1 : 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? visible.length - 1 :
      (index + (event.key === 'ArrowRight' ? direction : -direction) + visible.length) % visible.length;
    visible[next].button.click();
    visible[next].button.focus();
  });
  mobile.addEventListener('change', () => {
    const details = simulator.querySelector('.mobile-practice-details') || document.querySelector('.sidebar .mobile-practice-details');
    if (details) details.open = !mobile.matches;
    update();
  });
  new MutationObserver(update).observe(simulator, {attributes: true, attributeFilter: ['data-mode']});
  update();

  // A visible, scrollable lesson list mirrors the course's real selection buttons.
  const course = document.createElement('section');
  course.className = 'mobile-course';
  course.setAttribute('aria-label', t('Choose a lesson'));
  const heading = document.createElement('div');
  heading.className = 'mobile-course-heading';
  const title = document.createElement('strong');
  title.textContent = t('Choose a lesson');
  const browse = document.createElement('button');
  browse.type = 'button';
  browse.textContent = t('All lessons');
  browse.addEventListener('click', () => document.querySelector('#course-library')?.click());
  heading.append(title, browse);
  const list = document.createElement('div');
  list.className = 'mobile-lesson-list';
  list.setAttribute('role', 'group');
  list.setAttribute('aria-label', t('Course'));
  course.append(heading, list);
  simulator.prepend(course);
  let currentLesson;
  const syncLessons = () => {
    const source = [...document.querySelectorAll('#lessons [data-course-lesson]')];
    list.replaceChildren(...source.map(original => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mobile-lesson';
      button.dataset.mobileLesson = original.dataset.courseLesson;
      const number = original.querySelector('.lesson-index').cloneNode(true);
      const name = document.createElement('span');
      name.textContent = original.querySelector('strong').textContent;
      button.append(number, name);
      if (original.hasAttribute('aria-current')) button.setAttribute('aria-current', 'step');
      button.addEventListener('click', () => {
        original.click();
        toggle.setAttribute('aria-expanded', 'false');
        drawer.classList.remove('is-open');
      });
      return button;
    }));
    const current = list.querySelector('[aria-current]');
    if (current && currentLesson !== current.dataset.mobileLesson) {
      currentLesson = current.dataset.mobileLesson;
      requestAnimationFrame(() => current.scrollIntoView({block: 'nearest', inline: 'center'}));
    }
  };
  new MutationObserver(syncLessons).observe(document.querySelector('#lessons'), {childList: true});
  syncLessons();
}
