import {translate as t} from './i18n/runtime.js';

// Reuse the actual cockpit controls: changing layouts must preserve their state
// and listeners, including disabled controls during study and lesson preparation.
export function mountMobileLayout() {
  const simulator = document.querySelector('.simulator');
  const views = simulator.querySelector('.view-controls');
  const cameraViews = views.querySelector('.camera-views');
  const camera = document.createElement('select');
  camera.id = 'mobile-camera';
  camera.className = 'mobile-camera';
  camera.setAttribute('aria-label', t('Camera view'));
  for (const button of views.querySelectorAll('[data-camera]')) {
    const option = new Option(button.textContent.trim(), button.dataset.camera);
    camera.add(option);
  }
  cameraViews.prepend(camera);
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
  new ResizeObserver(() => {
    simulator.style.setProperty('--mobile-controls-height', `${Math.ceil(drawer.getBoundingClientRect().height)}px`);
  }).observe(drawer);
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
      if (document.querySelector('#mobile-lessons')?.open) requestAnimationFrame(() => current.scrollIntoView({block: 'nearest', inline: 'center'}));
    }
  };
  new MutationObserver(syncLessons).observe(document.querySelector('#lessons'), {childList: true});
  syncLessons();

  // The canvas owns the mobile viewport. Navigation and lessons live in sheets,
  // retaining the original nodes so desktop layouts and all handlers still work.
  const toolbar = document.createElement('div');
  toolbar.className = 'mobile-scene-toolbar';
  const menuButton = document.createElement('button');
  menuButton.id = 'mobile-menu-toggle';
  menuButton.type = 'button';
  menuButton.setAttribute('aria-label', t('Menu'));
  menuButton.innerHTML = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  const lessonButton = document.createElement('button');
  lessonButton.id = 'mobile-lesson-toggle';
  lessonButton.type = 'button';
  toolbar.append(menuButton, lessonButton);
  simulator.append(toolbar);
  const sheet = (id, title, trigger) => {
    const dialog = document.createElement('dialog');
    dialog.id = id;
    dialog.className = 'mobile-sheet';
    const header = document.createElement('div');
    header.className = 'mobile-sheet-heading';
    const heading = document.createElement('h2');
    heading.id = `${id}-title`;
    heading.textContent = t(title);
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'mobile-sheet-close';
    close.textContent = '×';
    close.setAttribute('aria-label', t('Close dialog'));
    header.append(heading, close);
    dialog.append(header);
    dialog.setAttribute('aria-labelledby', heading.id);
    trigger.setAttribute('aria-controls', id);
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    const show = () => {
      toggle.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('is-open');
      for (const other of document.querySelectorAll('.mobile-sheet[open]')) other.close();
      const details = dialog.querySelector('.mobile-practice-details');
      if (details) details.open = true;
      dialog.showModal();
      trigger.setAttribute('aria-expanded', 'true');
      close.focus();
      dialog.querySelector('.mobile-lesson[aria-current]')?.scrollIntoView({block: 'nearest', inline: 'center'});
    };
    trigger.addEventListener('click', show);
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { trigger.setAttribute('aria-expanded', 'false'); if (mobile.matches && !document.querySelector('dialog[open]')) trigger.focus(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
    document.body.append(dialog);
    return dialog;
  };
  const menu = sheet('mobile-menu', 'Menu', menuButton);
  const lessonSheet = sheet('mobile-lessons', 'Lessons', lessonButton);
  const lessonContent = document.createElement('div');
  lessonContent.id = 'mobile-lesson-content';
  lessonSheet.append(lessonContent);
  const menuTools = document.createElement('div');
  menuTools.className = 'mobile-menu-tools';
  const menuActions = document.createElement('div');
  menuActions.className = 'mobile-menu-actions';
  menuTools.append(menuActions);
  menu.append(menuTools);
  const hud = document.createElement('div');
  hud.className = 'mobile-indicators';
  hud.dataset.noTranslate = 'true';
  for (const [label, key] of [['BOAT SPEED', 'speed'], ['HEADING', 'heading'], ['DEPTH', 'depth']]) {
    const reading = document.createElement('div');
    const name = document.createElement('small');
    name.textContent = t(label);
    const value = document.createElement('bdi');
    value.dir = 'ltr';
    value.dataset.dashboardValue = key;
    reading.append(name, value);
    hud.append(reading);
  }
  simulator.append(hud);
  const indicators = document.createElement('button');
  indicators.id = 'mobile-indicators-toggle';
  indicators.type = 'button';
  indicators.textContent = t('Show instruments');
  indicators.setAttribute('aria-pressed', 'false');
  indicators.addEventListener('click', () => {
    const show = indicators.getAttribute('aria-pressed') !== 'true';
    indicators.setAttribute('aria-pressed', String(show));
    simulator.classList.toggle('show-mobile-indicators', show);
  });
  menuTools.append(indicators);
  const moves = [];
  for (const [selector, target] of [['.topbar', menu], ['.view-controls', menuTools], ['.location', menuTools], ['.weather', menuTools], ['#conditions', menuActions], ['#reset', menuActions], ['.mobile-course', lessonContent], ['.maneuver-live', lessonContent]]) {
    const node = document.querySelector(selector);
    if (!node) continue;
    const placeholder = document.createComment(`desktop ${selector}`);
    node.before(placeholder);
    moves.push({node, placeholder, target});
  }
  menu.addEventListener('click', event => {
    if (event.target.closest('button[data-mode], #help, #chart-toggle, #systems-toggle, #conditions, #reset, #location-select')) menu.close();
  }, true);
  camera.addEventListener('change', () => menu.close());
  lessonSheet.addEventListener('click', event => {
    if (event.target.closest('#practice-start, #practice-end, #lesson-briefing, #course-library, #training-goals, #practice-debrief, #lab-instructions, #lab-end')) lessonSheet.close();
  }, true);
  // Bubble after the button's own handler: Resume must read the sheet's paused
  // state before it disappears. A microtask in capture can run before the button.
  lessonSheet.addEventListener('click', event => {
    if (event.target.closest('#practice-toggle')) lessonSheet.close();
  });
  document.querySelector('#systems-close').addEventListener('click', () => { if (mobile.matches) menuButton.focus(); });
  const syncOverlayLabels = () => {
    const mode = simulator.dataset.mode || 'learn';
    lessonSheet.dataset.mobileMode = mode;
    lessonButton.hidden = !['learn', 'maneuver'].includes(mode);
    const active = ['training-running', 'training-paused'].includes(document.body.dataset.activity);
    const current = document.querySelector('#lessons [aria-current]');
    const number = String(Number(current?.dataset.courseLesson || 0) + 1).padStart(2, '0');
    const label = mode === 'maneuver' ? t('Current goal') : active ? document.querySelector('#objective-text').textContent : t('Lesson {number}').replace('{number}', number);
    if (lessonButton.textContent !== label) lessonButton.textContent = label;
    lessonButton.setAttribute('aria-label', active || mode === 'maneuver' ? t('Current goal') : t('Choose a lesson'));
    lessonButton.title = label;
  };
  const arrangeOverlays = () => {
    for (const {node, placeholder, target} of moves) {
      if (mobile.matches) target.append(node);
      else placeholder.after(node);
    }
    const card = document.querySelector('.lesson-card');
    if (mobile.matches) lessonContent.append(card);
    else {
      menu.close(); lessonSheet.close();
      if (card.parentElement === lessonContent) simulator.insertBefore(card, simulator.querySelector('.scene-footer'));
    }
    syncOverlayLabels();
  };
  mobile.addEventListener('change', arrangeOverlays);
  new MutationObserver(syncOverlayLabels).observe(simulator, {attributes: true, attributeFilter: ['data-mode']});
  new MutationObserver(syncOverlayLabels).observe(document.body, {attributes: true, attributeFilter: ['data-activity']});
  new MutationObserver(syncOverlayLabels).observe(document.querySelector('#lessons'), {childList: true});
  new MutationObserver(syncOverlayLabels).observe(document.querySelector('#objective-text'), {childList: true, characterData: true, subtree: true});
  arrangeOverlays();
}
