import { LOCATIONS, getLocation } from '../locations.js';
import { destinationPreview } from '../navigation/destination-preview.js';
import { translate, getLanguage } from '../i18n/runtime.js';
import { sectionUI } from '../i18n/sections.js';
import './section-covers.css';

const t = (value) => sectionUI[getLanguage()]?.[value] ?? translate(value);
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const tr = (value) => esc(t(value));
export const sectionForMode = (mode) =>
  mode === 'learn' ? 'learn' : mode === 'explore' ? 'explore' : 'challenge';
const waterDescription = (id) =>
  id === 'haven'
    ? 'Islands, open water, and winding passages.'
    : id === 'shelter'
      ? 'A sheltered bay with room to find your rhythm.'
      : 'Long headlands and a current to navigate.';

// All sections share the curriculum sidebar and the original lesson detail layout.
// Existing lesson nodes and challenge buttons retain their own action handlers.
export function mountSectionCovers({
  simulator,
  getState,
  onNavigate,
  onCourse,
  onStartFree,
  onLocation,
  onConditions,
  onSound,
  mountChallenges,
  mountDrills,
  onReview,
}) {
  const sidebar = document.querySelector('.sidebar');
  const lessonSidebarNodes = [...sidebar.children];
  const sectionSidebar = document.createElement('div');
  sectionSidebar.className = 'section-sidebar';
  sectionSidebar.innerHTML = `<div class="sidebar-heading"><div class="eyebrow" id="section-sidebar-eyebrow"></div><h1 id="section-sidebar-title"></h1><p id="section-sidebar-description"></p></div><div class="lesson-list section-group-list"><div data-sidebar-page="explore"><details class="course-module" open><summary><span>${tr('Change location')}</span><small>3</small></summary><div class="destination-choices">${LOCATIONS.map((location, index) => `<button class="destination-choice" data-cover-location="${location.id}" aria-pressed="false">${destinationPreview(location)}<span class="destination-number" aria-hidden="true">0${index + 1}</span><span class="destination-selected" aria-hidden="true">✓</span><span class="destination-copy"><strong>${tr(location.title)}</strong><small>${tr(waterDescription(location.id))}</small></span></button>`).join('')}</div></details></div><div id="cover-challenges" data-sidebar-page="challenge"></div></div>`;
  sidebar.append(sectionSidebar);
  const courseButton = document.createElement('button');
  courseButton.id = 'cover-course';
  courseButton.className = 'reference-link';
  courseButton.textContent = t('Browse lessons');
  courseButton.onclick = onCourse;

  const root = document.createElement('section');
  root.id = 'section-cover';
  root.className = 'section-cover';
  root.tabIndex = -1;
  root.setAttribute('aria-label', t('Section home'));
  root.innerHTML = `<nav class="cover-navigation" aria-label="${tr('Main navigation')}">${[
    ['learn', 'Learn to sail'],
    ['explore', 'Free sailing'],
    ['challenge', 'Challenges'],
  ]
    .map(([id, label]) => `<button data-section="${id}">${tr(label)}</button>`)
    .join(
      '',
    )}</nav><div class="cover-mobile-course"></div><details class="cover-section-browser"><summary id="cover-browser-title"></summary></details><div class="section-page" data-section-page="learn"><div id="cover-current-lesson"></div></div><div class="section-page section-detail" data-section-page="explore" hidden><div class="scene-title"><span>${tr('THE OPEN WATER')}</span><h2 id="cover-location-name"></h2><p id="cover-location-description"></p></div><div class="section-detail-card"><p id="cover-conditions" dir="auto"></p><div class="training-actions"><button id="cover-start-free" class="training-button primary">${tr('Set sail')}</button><button id="cover-conditions-button" class="training-button">${tr('Conditions')}</button><button id="cover-sound" class="training-button">${tr('Sound')}</button></div></div></div><div class="section-page section-detail" data-section-page="challenge" hidden><div class="cover-review" hidden><span>${tr('Your last attempt is ready to review.')}</span><button id="cover-review" class="training-button">${tr('Review last attempt')}</button></div><div id="cover-challenge-briefing"></div></div>`;
  const backdrop = document.createElement('div');
  backdrop.className = 'section-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  simulator.append(backdrop, root);
  root.querySelector('#cover-current-lesson').append(document.querySelector('#lesson-cover'));
  const navigation = root.querySelector('.cover-navigation');
  const sectionButtons = [...navigation.querySelectorAll('[data-section]')];
  sectionButtons.forEach((button) => {
    button.onclick = () => onNavigate(button.dataset.section);
  });
  root.querySelector('#cover-start-free').onclick = onStartFree;
  root.querySelector('#cover-conditions-button').onclick = onConditions;
  root.querySelector('#cover-sound').onclick = onSound;
  root.querySelector('#cover-review').onclick = onReview;
  const browser = root.querySelector('.cover-section-browser');
  const mobile = window.matchMedia('(max-width: 900px)');
  const catalog = sectionSidebar.querySelector('#cover-challenges');
  const briefing = root.querySelector('#cover-challenge-briefing');
  let lastSection, wasActive, previousConditions, selectedChallenge;
  function arrange() {
    const target = mobile.matches ? browser : sidebar;
    if (sectionSidebar.parentElement !== target) target.append(sectionSidebar);
    const courseTarget = mobile.matches ? root.querySelector('.cover-mobile-course') : sidebar;
    if (courseButton.parentElement !== courseTarget) {
      if (mobile.matches) courseTarget.append(courseButton);
      else sidebar.insertBefore(courseButton, document.querySelector('#reference'));
    }
  }
  mobile.addEventListener('change', arrange);
  arrange();
  sectionSidebar.querySelectorAll('[data-cover-location]').forEach((button) => {
    button.onclick = () => {
      onLocation(button.dataset.coverLocation);
      browser.open = false;
      root.scrollTop = 0;
    };
  });
  catalog.addEventListener(
    'click',
    (event) => {
      const button = event.target.closest(
        '[data-sailing-challenge], [data-race-course], [data-cover-drill], [data-cover-buoys]',
      );
      if (!button) return;
      const attribute = [
        'data-sailing-challenge',
        'data-race-course',
        'data-cover-drill',
        'data-cover-buoys',
      ].find((name) => button.hasAttribute(name));
      selectedChallenge = `[${attribute}="${button.getAttribute(attribute)}"]`;
      catalog.querySelectorAll('.lesson-row').forEach((row) => {
        row.classList.toggle('active', row === button);
        if (row === button) row.setAttribute('aria-current', 'true');
        else row.removeAttribute('aria-current');
      });
      browser.open = false;
    },
    true,
  );
  function group(title, buttons) {
    const details = document.createElement('details');
    details.className = 'course-module';
    details.open = true;
    details.innerHTML = `<summary><span>${esc(title)}</span><small>${buttons.length}</small></summary>`;
    buttons.forEach((button, index) => {
      const title = button.querySelector('strong')?.textContent || button.textContent;
      const description =
        button.querySelector('.challenge-choice-copy>span, small')?.textContent || '';
      const best = button.querySelector('.challenge-personal-best')?.textContent;
      button.className = 'lesson-row';
      button.innerHTML = `<span class="lesson-index">${String(index + 1).padStart(2, '0')}</span><span><strong>${esc(title)}</strong>${description ? `<small>${esc(description)}</small>` : ''}${best ? `<small>${esc(best)}</small>` : ''}</span>`;
      details.append(button);
    });
    return details;
  }
  function refreshChallenges() {
    mountChallenges(catalog);
    const library = catalog.querySelector('.race-library');
    sectionSidebar.querySelector('#section-sidebar-description').textContent =
      library.querySelector('p').textContent;
    const challenges = group(library.querySelector('.eyebrow').textContent, [
      ...library.querySelectorAll('[data-sailing-challenge]'),
    ]);
    const races = group(library.querySelector('h3').textContent, [
      ...library.querySelectorAll('[data-race-course]'),
    ]);
    const drillButton = library.querySelector('#race-engine-drills');
    const drills = document.createElement('div');
    mountDrills(drills);
    drillButton.className = 'reference-link';
    drillButton.textContent = t('Recent attempts');
    catalog.replaceChildren(challenges, races, drills, drillButton);
    // The first item supplies a useful detail panel on entry, just like a lesson.
    (
      (selectedChallenge && catalog.querySelector(selectedChallenge)) ||
      catalog.querySelector('[data-sailing-challenge]')
    )?.click();
  }
  return {
    sync({ mode, active, reviewable = false }) {
      const section = sectionForMode(mode);
      if (lastSection !== section || wasActive !== active) {
        root.hidden = active;
        root.inert = active;
        navigation.hidden = active;
        // A live restart can open the same briefing in a dialog. Release the
        // page controls so their IDs and handlers belong to only one host.
        if (active) briefing.replaceChildren();
        document.body.dataset.section = section;
        lessonSidebarNodes.forEach((node) => {
          node.hidden = section !== 'learn';
        });
        sectionSidebar.hidden = section === 'learn';
        courseButton.hidden = section !== 'learn';
        browser.hidden = section === 'learn';
        browser.open = false;
        document.querySelectorAll('.mobile-course, #lesson-cover').forEach((node) => {
          node.hidden = section !== 'learn';
          node.inert = section !== 'learn';
        });
        root.querySelectorAll('[data-section-page]').forEach((page) => {
          page.hidden = page.dataset.sectionPage !== section;
        });
        sectionSidebar.querySelectorAll('[data-sidebar-page]').forEach((page) => {
          page.hidden = page.dataset.sidebarPage !== section;
        });
        sectionButtons.forEach((button) => {
          if (button.dataset.section === section) button.setAttribute('aria-current', 'page');
          else button.removeAttribute('aria-current');
        });
        sectionSidebar.querySelector('#section-sidebar-eyebrow').textContent = t(
          section === 'explore' ? 'THE OPEN WATER' : 'Challenges',
        );
        sectionSidebar.querySelector('#section-sidebar-title').textContent = t(
          section === 'explore' ? 'Free sailing' : 'Challenges',
        );
        sectionSidebar.querySelector('#section-sidebar-description').textContent = t(
          section === 'explore'
            ? 'Choose your waters, set the breeze, and sail at your own pace.'
            : 'Build confidence, one lesson at a time.',
        );
        root.querySelector('#cover-browser-title').textContent = t(
          section === 'explore' ? 'Change location' : 'Challenges',
        );
        if (lastSection !== section || !active) root.scrollTop = 0;
        lastSection = section;
        wasActive = active;
        if (!active && section === 'challenge') refreshChallenges();
      }
      root.querySelector('.cover-review').hidden = !reviewable;
      if (section !== 'explore' || active) return;
      const state = getState();
      const key = [
        state.locationId,
        state.windSpeed,
        state.windDirection,
        state.currentSpeed,
        state.currentDirection,
      ].join(':');
      if (key === previousConditions) return;
      previousConditions = key;
      document.body.dataset.locationBackground = state.locationId;
      root.querySelector('#cover-location-name').textContent = t(
        getLocation(state.locationId).title,
      );
      root.querySelector('#cover-location-description').textContent = t(
        waterDescription(state.locationId),
      );
      root.querySelector('#cover-conditions').textContent =
        `${t('Wind')} · ${state.windSpeed} kn · ${state.windDirection}°  /  ${t('Current')} · ${state.currentSpeed} kn · ${state.currentDirection}°`;
      sectionSidebar.querySelectorAll('[data-cover-location]').forEach((button) => {
        const selected = button.dataset.coverLocation === state.locationId;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('active', selected);
      });
    },
    refreshChallenges,
    showChallengeBriefing(content) {
      briefing.innerHTML = content;
      // Keep the same title-above-card composition as the lesson panel.
      const section = briefing.firstElementChild;
      const title = document.createElement('div');
      title.className = 'scene-title';
      const eyebrow = section.querySelector('.eyebrow');
      const heading = section.querySelector('h2');
      const description =
        heading.nextElementSibling?.tagName === 'P' ? heading.nextElementSibling : null;
      title.append(eyebrow, heading);
      if (description) title.append(description);
      section.classList.add('section-detail-card');
      briefing.prepend(title);
      root.scrollTop = 0;
    },
    focus() {
      root.focus({ preventScroll: true });
    },
  };
}
