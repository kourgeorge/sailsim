import { LOCATIONS, getLocation } from '../locations.js';
import { shoreScale } from '../rendering/geography.js';
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

function waterChart(location) {
  const { centerX, centerZ, span } = location.chart;
  const point = (x, z) => [160 + ((x - centerX) * 240) / span, 100 + ((z - centerZ) * 240) / span];
  return `<svg class="cover-water-chart" viewBox="0 0 320 200" aria-hidden="true"><path class="cover-chart-grid" d="M0 50H320M0 100H320M0 150H320M80 0V200M160 0V200M240 0V200"/>${location.islands
    .map(
      (island) =>
        `<polygon points="${Array.from({ length: 90 }, (_, n) => {
          const a = (n / 90) * Math.PI * 2,
            r = shoreScale(a);
          return point(
            island.x + Math.cos(a) * island.rx * r,
            island.z + Math.sin(a) * island.rz * r,
          ).join(',');
        }).join(' ')}"/>`,
    )
    .join(
      '',
    )}<g transform="translate(${point(location.start.x, location.start.z).join(' ')})"><path class="cover-chart-boat" d="M0 -9 6 7 0 4 -6 7Z"/></g><text x="15" y="24">N ↑</text></svg>`;
}

// Section pages own navigation outside a session. The existing lesson actions
// stay attached to their original nodes, including their progress and briefing handlers.
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
  onReview,
}) {
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
    .join('')}</nav>
    <div class="section-page" data-section-page="learn"><header class="cover-heading"><span class="eyebrow">${tr('THE SAILING SCHOOL')}</span><h1>${tr('Learn to sail')}</h1><p>${tr('Build confidence, one lesson at a time.')}</p><button id="cover-course" class="training-button primary">${tr('Browse lessons')}</button></header><div id="cover-current-lesson"><div class="cover-subheading">${tr('Your next lesson')}</div></div></div>
    <div class="section-page" data-section-page="explore" hidden><header class="cover-heading"><span class="eyebrow">${tr('THE OPEN WATER')}</span><h1>${tr('Free sailing')}</h1><p>${tr('Choose your waters, set the breeze, and sail at your own pace.')}</p></header><div class="cover-waters">${LOCATIONS.map((location) => `<button class="cover-water" data-cover-location="${location.id}" aria-pressed="false">${waterChart(location)}<span><strong>${tr(location.title)}</strong><small>${tr(location.id === 'haven' ? 'Islands, open water, and winding passages.' : location.id === 'shelter' ? 'A sheltered bay with room to find your rhythm.' : 'Long headlands and a current to navigate.')}</small></span><b class="cover-water-check" aria-hidden="true">✓</b></button>`).join('')}</div><div class="cover-launch"><div><strong id="cover-location-name"></strong><p id="cover-conditions" dir="auto"></p></div><div class="training-actions"><button id="cover-conditions-button" class="training-button">${tr('Conditions')}</button><button id="cover-sound" class="training-button">${tr('Sound')}</button><button id="cover-start-free" class="training-button primary">${tr('Set sail')}</button></div></div></div>
    <div class="section-page" data-section-page="challenge" hidden><div class="cover-review" hidden><span>${tr('Your last attempt is ready to review.')}</span><button id="cover-review" class="training-button">${tr('Review last attempt')}</button></div><div id="cover-challenges"></div></div>`;
  simulator.append(root);
  root.querySelector('#cover-current-lesson').append(document.querySelector('#lesson-cover'));
  root.querySelectorAll('[data-section]').forEach((button) => {
    button.onclick = () => onNavigate(button.dataset.section);
  });
  root.querySelector('#cover-course').onclick = onCourse;
  root.querySelector('#cover-start-free').onclick = onStartFree;
  root.querySelector('#cover-conditions-button').onclick = onConditions;
  root.querySelector('#cover-sound').onclick = onSound;
  root.querySelector('#cover-review').onclick = onReview;
  root.querySelectorAll('[data-cover-location]').forEach((button) => {
    button.onclick = () => onLocation(button.dataset.coverLocation);
  });
  let lastSection, wasActive, previousConditions;
  return {
    sync({ mode, active, reviewable = false }) {
      const section = sectionForMode(mode);
      if (lastSection !== section || wasActive !== active) {
        root.hidden = active;
        root.inert = active;
        document.body.dataset.section = section;
        root.querySelectorAll('[data-section-page]').forEach((page) => {
          page.hidden = page.dataset.sectionPage !== section;
        });
        root.querySelectorAll('[data-section]').forEach((button) => {
          if (button.dataset.section === section) button.setAttribute('aria-current', 'page');
          else button.removeAttribute('aria-current');
        });
        if (!active && section === 'challenge')
          mountChallenges(root.querySelector('#cover-challenges'));
        if (lastSection !== section || !active) root.scrollTop = 0;
        lastSection = section;
        wasActive = active;
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
      root.querySelector('#cover-location-name').textContent = t(
        getLocation(state.locationId).title,
      );
      root.querySelector('#cover-conditions').textContent =
        `${t('Wind')} · ${state.windSpeed} kn · ${state.windDirection}°  /  ${t('Current')} · ${state.currentSpeed} kn · ${state.currentDirection}°`;
      root.querySelectorAll('[data-cover-location]').forEach((button) => {
        button.setAttribute(
          'aria-pressed',
          String(button.dataset.coverLocation === state.locationId),
        );
      });
    },
    refreshChallenges() {
      mountChallenges(root.querySelector('#cover-challenges'));
    },
    focus() {
      root.focus({ preventScroll: true });
    },
  };
}
