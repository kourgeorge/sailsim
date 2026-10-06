import { RACE_COURSES, RACE_DIFFICULTIES, createRace, advanceRace, raceStandings } from './race.js';
import { translate as t } from '../i18n/runtime.js';
import { mountSailingTrack } from '../navigation/sailing-track-view.js';
import './race.css';
import { challengeCatalog } from '../challenges/ui.js';
import { weatherControl } from '../activity/weather-control.js';
import { raceRecordKey } from '../weather.js';
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
const tr = (value) => esc(t(value));
const clock = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function createRaceUI({
  container,
  openModal,
  openBriefing = openModal,
  onStart,
  onStop,
  onLeave,
  onVisuals,
  onDrills,
  onChallenge,
  onLibrary,
}) {
  let race = null,
    selected = RACE_COURSES[0].id,
    difficulty = 'club',
    changingWeather = true,
    updateTime = 0,
    previous = '';
  const panel = document.createElement('aside');
  panel.id = 'race-hud';
  panel.hidden = true;
  panel.dataset.noTranslate = 'true';
  panel.setAttribute('aria-label', t('Race standings'));
  container.append(panel);
  const storageKey = (course = selected, level = difficulty, changing = changingWeather) =>
    raceRecordKey(course, level, changing);
  const best = (course = selected, level = difficulty, changing = changingWeather) => {
    try {
      const value = Number(localStorage.getItem(storageKey(course, level, changing)));
      return value > 0 && value <= 900 ? value : null;
    } catch {
      return null;
    }
  };
  const setVisuals = () => onVisuals(race);
  function library() {
    onLibrary();
  }
  function mountLibrary(target) {
    target.innerHTML = `<section class="race-library" data-no-translate><div class="eyebrow">${tr('CHALLENGES')}</div><h2>${tr('Find your next adventure.')}</h2><p>${tr('Sailing missions to build your skills.')}</p>${challengeCatalog()}<h3>${tr('Race the fleet.')}</h3><p>${tr('Three rivals. The same yacht and wind. Find your fastest way around the course.')}</p><div class="race-courses">${RACE_COURSES.map((course, i) => `<button data-race-course="${course.id}"><span class="race-course-number">0${i + 1}</span><span><strong>${tr(course.name)}</strong><small>${tr(course.description)}</small></span><span aria-hidden="true">→</span></button>`).join('')}</div><button id="race-engine-drills" class="training-button">${tr('Engine drills & buoy course')}</button></section>`;
    target
      .querySelectorAll('[data-race-course]')
      .forEach((button) => (button.onclick = () => briefing(button.dataset.raceCourse)));
    target.querySelector('#race-engine-drills').onclick = onDrills;
    target
      .querySelectorAll('[data-sailing-challenge]')
      .forEach((button) => (button.onclick = () => onChallenge(button.dataset.sailingChallenge)));
  }
  function briefing(id = selected, preview = false) {
    const course = RACE_COURSES.find((item) => item.id === id);
    const content = `<section class="race-briefing" data-no-translate><div class="eyebrow">${tr('RACE BRIEFING')}</div><h2>${tr(course.name)}</h2><p>${tr(course.description)}</p><div class="race-setup"><span>${tr('Wind')}<bdi>${course.windSpeed} kn · ${course.windDirection}°</bdi></span><span>${tr('Current')}<bdi>${course.currentSpeed} kn · ${course.currentDirection}°</bdi></span><span>${tr('Fleet')}<b>${tr('You + 3 bots')}</b></span></div><label class="race-difficulty" for="race-difficulty">${tr('Difficulty')}<select id="race-difficulty">${Object.entries(
      RACE_DIFFICULTIES,
    )
      .map(
        ([key, value]) =>
          `<option value="${key}" ${key === difficulty ? 'selected' : ''}>${tr(value.name)}</option>`,
      )
      .join(
        '',
      )}</select></label>${weatherControl('race-weather', changingWeather)}<p>${tr('Wind shifts gradually around the starting conditions. Current changes more slowly.')}</p><p>${tr('Sail through the numbered rings in order. Engines are disabled. Every boat shares the same weather.')}</p><p>${tr('A five-second countdown holds the fleet at the start. Then steer and trim your sails. Pause stops every boat.')}</p><p id="race-best">${best(id) ? `${tr('Personal best')} · ${clock(best(id))}` : ''}</p><div class="training-actions"><button id="race-start" class="training-button primary">${tr('Start race')}</button><button id="race-back" class="training-button">${tr('All races')}</button></div></section>`;
    if (preview) return content;
    selected = id;
    openBriefing(content);
    const updateBest = () => {
      const time = best();
      document.querySelector('#race-best').textContent = time
        ? `${t('Personal best')} · ${clock(time)}`
        : '';
    };
    document.querySelector('#race-difficulty').onchange = (event) => {
      difficulty = event.target.value;
      updateBest();
    };
    document.querySelector('#race-weather').onchange = (event) => {
      changingWeather = event.target.value === 'changing';
      updateBest();
    };
    updateBest();
    document.querySelector('#race-start').onclick = start;
    document.querySelector('#race-back').onclick = library;
  }
  function start() {
    race = createRace(selected, difficulty, { changingWeather });
    previous = '';
    updateTime = 0;
    onStart(race.player);
    setVisuals();
    document.querySelector('#modal').close();
    panel.hidden = false;
    panel.innerHTML = `<div class="race-hud-top"><strong id="race-position"></strong><time id="race-clock" dir="ltr"></time><button id="race-menu" aria-label="${tr('Race options')}">⋯</button></div><p id="race-target"></p><ol id="race-standings"></ol><div id="race-countdown" role="status"></div>`;
    document.querySelector('#race-menu').onclick = options;
    update();
  }
  function update() {
    if (!race || panel.hidden) return;
    const standings = raceStandings(race),
      place = standings.findIndex((item) => item.id === 'player') + 1;
    const key = JSON.stringify([
      race.status,
      race.reason,
      Math.floor(race.elapsed),
      Math.ceil(race.countdown),
      race.racers[0].mark,
      ...standings.map((item) => [item.id, item.mark, item.finished]),
    ]);
    if (key === previous) return;
    previous = key;
    panel.dataset.raceStatus = race.status;
    document.querySelector('#race-position').innerHTML = tr('Position {place} / 4').replace(
      '{place} / 4',
      `<bdi dir="ltr">${place} / 4</bdi>`,
    );
    document.querySelector('#race-clock').textContent = clock(race.elapsed);
    const mark = Math.min(race.racers[0].mark + 1, race.course.marks.length);
    const target = race.course.marks[mark - 1];
    const dx = target.x - race.player.x,
      dz = target.z - race.player.z;
    const bearing = (((Math.atan2(dx, -dz) * 180) / Math.PI + 360) % 360)
      .toFixed(0)
      .padStart(3, '0');
    document.querySelector('#race-target').innerHTML =
      race.status === 'finished'
        ? tr(race.reason)
        : tr('Next ring {mark} / {total}').replace(
            '{mark} / {total}',
            `<bdi dir="ltr">${mark} / ${race.course.marks.length}</bdi>`,
          ) + `<br><bdi dir="ltr">${Math.round(Math.hypot(dx, dz))} m · ${bearing}°</bdi>`;
    document.querySelector('#race-standings').innerHTML = standings
      .map(
        (item) =>
          `<li ${item.id === 'player' ? 'class="race-you"' : ''}><i style="background:${item.color}"></i><span>${tr(item.name)}</span><small dir="ltr">${item.finished !== null ? clock(item.finished) : `${item.mark}/${race.course.marks.length}`}</small></li>`,
      )
      .join('');
    const count = document.querySelector('#race-countdown');
    count.hidden = race.countdown === 0;
    count.textContent = race.countdown > 0 ? `${t('Start in')} ${Math.ceil(race.countdown)}` : '';
  }
  function options() {
    if (race.status === 'finished') {
      results();
      return;
    }
    openModal(
      `<section data-no-translate><h2>${tr(race.course.name)}</h2><p>${tr('The fleet is paused.')}</p><div class="training-actions"><button id="race-resume" class="training-button primary">${tr('Resume race')}</button><button id="race-restart" class="training-button">${tr('Restart race')}</button><button id="race-exit" class="training-button">${tr('Leave race')}</button></div></section>`,
    );
    document.querySelector('#race-resume').onclick = () => document.querySelector('#modal').close();
    document.querySelector('#race-restart').onclick = () => briefing(race.course.id);
    document.querySelector('#race-exit').onclick = () => {
      document.querySelector('#modal').close();
      onLeave();
    };
  }
  function results() {
    onStop();
    const standings = raceStandings(race),
      player = race.racers[0],
      position = standings.findIndex((item) => item.id === 'player') + 1;
    const completed = player.finished !== null;
    const personalBest = best(race.course.id, race.difficulty, race.weather.enabled);
    const improved = completed && (personalBest === null || player.finished < personalBest);
    if (improved)
      try {
        localStorage.setItem(
          storageKey(race.course.id, race.difficulty, race.weather.enabled),
          String(player.finished),
        );
      } catch {
        /* Optional personal best. */
      }
    openModal(
      `<section class="race-results" data-no-translate><div class="eyebrow">${tr('RACE RESULTS')}</div><h2>${tr(completed ? (position === 1 ? 'You won!' : 'Across the finish.') : race.reason)}</h2><p>${tr(race.course.name)} · ${tr(RACE_DIFFICULTIES[race.difficulty].name)}</p><div class="race-result-score">${completed ? `<strong dir="ltr">${position}<small> / 4</small></strong><time dir="ltr">${clock(player.finished)}</time>` : `<strong>${tr('Did not finish')}</strong>`}</div>${improved ? `<p class="race-best">${tr('New personal best')}</p>` : ''}<ol class="race-result-list">${standings.map((item) => `<li><i style="background:${item.color}"></i><span>${tr(item.name)}</span><bdi>${item.finished !== null ? clock(item.finished) : tr('Unfinished')}</bdi></li>`).join('')}</ol><p>${tr('Finish times decide places. Unfinished boats are ordered by course progress.')}</p><div class="training-actions"><button id="race-again" class="training-button primary">${tr('Race again')}</button><button id="race-other" class="training-button">${tr('All races')}</button></div></section>`,
    );
    const map = document.createElement('div');
    document.querySelector('.race-result-list').before(map);
    mountSailingTrack(map, race.track, { marks: race.marks });
    document.querySelector('#race-again').onclick = () => {
      selected = race.course.id;
      difficulty = race.difficulty;
      changingWeather = race.weather.enabled;
      start();
    };
    document.querySelector('#race-other').onclick = library;
  }
  return {
    library,
    mountLibrary,
    review: results,
    briefing,
    preview: (id) => briefing(id, true),
    options,
    end() {
      if (!race) return;
      if (race.status !== 'finished') {
        race.status = 'finished';
        race.reason = 'Race ended';
      }
      update();
      results();
    },
    restart: start,
    get current() {
      return race;
    },
    get active() {
      return Boolean(race && race.status !== 'finished');
    },
    tick(dt) {
      if (!race || race.status === 'finished') return;
      advanceRace(race, dt);
      updateTime += dt;
      if (updateTime >= 0.1) {
        updateTime = 0;
        update();
      }
      if (race.status === 'finished') {
        update();
        results();
      }
    },
    leave() {
      race = null;
      panel.hidden = true;
      onVisuals(null);
    },
  };
}
