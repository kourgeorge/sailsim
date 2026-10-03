import { CHALLENGES, getChallenge } from './catalog.js';
import {
  createChallenge,
  advanceChallenge,
  finishChallenge,
  challengeRequirements,
  challengeChart,
  revealChallengeTarget,
  targetBearing,
} from './engine.js';
import { readChallengeBest, saveChallengeBest } from './records.js';
import { translate, getLanguage } from '../i18n/runtime.js';
import { challengesUI } from '../i18n/challenges.js';
import { mountSailingTrack } from '../navigation/sailing-track-view.js';
import './challenges.css';

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
const tr = (value) => esc(t(value));
const t = (value) => challengesUI[getLanguage()]?.[value] ?? translate(value);
const format = (value, parameters) => t(value).replace(/\{(\w+)\}/g, (_, key) => parameters[key]);
const clock = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const storage = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
};
const bearing = (from, to) => `${Math.round(targetBearing(from, to)) % 360}`.padStart(3, '0');

export function challengeCatalog() {
  return `<div class="challenge-catalog">${CHALLENGES.map((d, index) => {
    const best = readChallengeBest(storage, d.id);
    return `<button class="challenge-choice" data-sailing-challenge="${d.id}"><span class="challenge-art" aria-hidden="true"><svg viewBox="0 0 100 65"><path class="challenge-grid" d="M0 20H100M0 40H100M20 0V65M50 0V65M80 0V65"/><path class="challenge-course-line" d="${['M5 50Q80 60 65 20T25 15', 'M12 50L40 32 68 40 86 12', 'M10 45Q50 15 76 32', 'M8 55Q25 40 30 15T80 5', 'M15 55L80 32 15 8'][index]}"/></svg><span>${d.symbol}</span></span><span class="challenge-choice-copy"><small>${tr(d.difficulty)} · <bdi>${clock(d.goldTime)}</bdi> ${tr('gold target')}</small><strong>${tr(d.name)}</strong><span>${tr(d.description)}</span><small class="challenge-personal-best">${best ? `${tr('Personal best')} · <bdi>${best.score}/100 · ${clock(best.elapsed)}</bdi>` : tr('Set your first record')}</small></span><span class="challenge-choice-arrow" aria-hidden="true">↗</span></button>`;
  }).join('')}</div>`;
}

export function createChallengeUI({
  container,
  openModal,
  openBriefing = openModal,
  onStart,
  onStop,
  onLibrary,
  setCues,
}) {
  let run = null,
    selected = CHALLENGES[0].id,
    updateTime = 0,
    recorded = false,
    improved = false;
  const panel = document.createElement('aside');
  panel.id = 'challenge-hud';
  panel.hidden = true;
  panel.dataset.noTranslate = 'true';
  panel.setAttribute('aria-label', t('Current challenge'));
  container.append(panel);

  function briefing(id = selected) {
    selected = id;
    const d = getChallenge(id),
      best = readChallengeBest(storage, id);
    openBriefing(
      `<section class="challenge-briefing" data-no-translate><div class="eyebrow">${tr('CHALLENGE BRIEFING')}</div><h2>${tr(d.name)}</h2><p>${tr(d.description)}</p><p class="challenge-rule">${tr(d.instructions)}</p><div class="race-setup"><span>${tr('Wind')}<bdi>${d.conditions.windSpeed} kn · ${d.conditions.windDirection}°</bdi></span><span>${tr('Current')}<bdi>${d.conditions.currentSpeed} kn · ${d.conditions.currentDirection}°</bdi></span><span>${tr('Time limit')}<bdi>${clock(d.timeLimit)}</bdi></span></div><p>${tr(d.engine ? 'Engine available. Sails start lowered.' : 'Sails only. The engine is disabled.')}</p><p>${tr('Wind and current stay fixed. Grounding or hull contact ends the attempt.')}</p><div class="challenge-medal-targets"><span>● ${tr('Gold')} <bdi>85+</bdi></span><span>● ${tr('Silver')} <bdi>65+</bdi></span><span>● ${tr('Bronze')} <bdi>1+</bdi></span></div><p>${tr('Complete the objective to earn a medal. Faster finishes score higher; treasure hints cost 10 points each.')}</p><p>${tr('Gold pace')} <bdi>${clock(d.goldTime)}</bdi> · ${tr('Silver pace')} <bdi>${clock(d.silverTime)}</bdi></p>${best ? `<p class="challenge-best">${tr('Personal best')} · <bdi>${best.score}/100 · ${clock(best.elapsed)}</bdi></p>` : ''}<div class="training-actions"><button id="challenge-start" class="training-button primary">${tr('Start challenge')}</button><button id="challenge-library" class="training-button">${tr('All challenges')}</button></div></section>`,
    );
    document.querySelector('#challenge-start').onclick = start;
    document.querySelector('#challenge-library').onclick = onLibrary;
  }

  function start() {
    run = createChallenge(selected);
    recorded = improved = false;
    updateTime = 0;
    onStart(run.state, run.definition);
    panel.hidden = false;
    panel.innerHTML = `<div class="challenge-hud-top"><strong>${tr(run.definition.name)}</strong><button id="challenge-options" aria-label="${tr('Challenge options')}">⋯</button></div><div class="challenge-hud-meta"><time id="challenge-clock" dir="ltr">0:00</time><span id="challenge-navigation" dir="ltr"></span></div><p id="challenge-live-goal"></p><span id="challenge-announcement" class="sr-only" role="status"></span><progress id="challenge-progress" aria-label="${tr('Challenge progress')}" max="1" value="0"></progress><details id="challenge-live-details" ${matchMedia('(min-width:901px)').matches ? 'open' : ''}><summary>${tr('Live requirements')}</summary><div id="challenge-requirements"></div></details><button id="challenge-reveal" class="training-button">${tr('Reveal target (−10 points)')}</button>`;
    panel.querySelector('#challenge-options').onclick = options;
    panel.querySelector('#challenge-reveal').onclick = () => {
      revealChallengeTarget(run);
      update();
    };
    document.querySelector('#modal').close();
    update();
  }

  function update() {
    if (!run || panel.hidden) return;
    const d = run.definition,
      treasure = d.kind === 'treasure';
    const revealed = !treasure || run.hints.includes(run.stage);
    panel.dataset.challengeStatus = run.status;
    panel.dataset.challengeId = d.id;
    panel.dataset.stage = run.stage;
    panel.querySelector('#challenge-clock').textContent =
      `${clock(run.elapsed)} / ${clock(d.timeLimit)}`;
    panel.querySelector('#challenge-navigation').textContent = revealed
      ? `${Math.round(Math.hypot(run.target.x - run.state.x, run.target.z - run.state.z))} m · ${bearing(run.state, run.target)}°`
      : '';
    let goal = run.reason;
    if (run.status === 'running') {
      if (treasure) {
        const origin = run.stage ? d.targets[run.stage - 1] : d.start;
        goal = `${format('Clue {number} of {total}', { number: run.stage + 1, total: d.targets.length })} · ${t(run.target.clue)} ${format('From {origin}: steer {bearing}° for {distance} m.', { origin: t(run.stage ? 'the last discovery' : 'the start'), bearing: bearing(origin, run.target), distance: Math.round(Math.hypot(origin.x - run.target.x, origin.z - run.target.z)) })}`;
      } else if (d.hold)
        goal = `${t('Continuous hold')} · \u2066${run.hold.toFixed(1)} / ${d.hold} s\u2069`;
      else
        goal = t(
          d.kind === 'tack'
            ? 'One tack. No gybes. Reach the finish.'
            : 'Choose a passage. Keep 1 m beneath the keel.',
        );
    }
    const goalNode = panel.querySelector('#challenge-live-goal');
    if (goalNode.textContent !== goal) goalNode.textContent = t(goal);
    const announcement = panel.querySelector('#challenge-announcement');
    const milestone = `${run.status}:${run.stage}:${run.tacks}`;
    if (announcement.dataset.milestone !== milestone) {
      announcement.dataset.milestone = milestone;
      announcement.textContent =
        run.status === 'running'
          ? treasure
            ? goal
            : d.kind === 'tack'
              ? `${t('Tacks completed')}: ${run.tacks}`
              : t(d.name)
          : t(run.reason);
    }
    const progress = panel.querySelector('#challenge-progress');
    progress.value =
      run.status === 'completed'
        ? 1
        : d.hold
          ? run.hold / d.hold
          : treasure
            ? run.stage / d.targets.length
            : Math.max(
                0,
                1 -
                  Math.hypot(run.target.x - run.state.x, run.target.z - run.state.z) /
                    Math.hypot(d.start.x - run.target.x, d.start.z - run.target.z),
              );
    const rows = (run.evidence || challengeRequirements(run))
      .map(
        (item) =>
          `<div class="challenge-requirement" data-met="${item.met}"><span aria-hidden="true">${item.met ? '✓' : '○'}</span><span>${tr(item.label)}${item.target ? `<small dir="ltr">${esc(item.target)}</small>` : ''}</span>${Number.isFinite(item.value) ? `<bdi>${Number.isInteger(item.value) ? item.value : item.value.toFixed(item.unit === 'kn' ? 2 : 1)}${item.unit || ''}</bdi>` : `<span class="sr-only">${tr(item.met ? 'Met' : 'Not yet')}</span>`}</div>`,
      )
      .join('');
    const requirements = panel.querySelector('#challenge-requirements');
    if (requirements.innerHTML !== rows) requirements.innerHTML = rows;
    const reveal = panel.querySelector('#challenge-reveal');
    reveal.hidden = !treasure || run.status !== 'running';
    reveal.disabled = run.hints.includes(run.stage);
    reveal.textContent = t(reveal.disabled ? 'Target revealed' : 'Reveal target (−10 points)');
    setCues(challengeChart(run).cues);
  }

  function options() {
    if (run.status !== 'running') {
      results();
      return;
    }
    openModal(
      `<section data-no-translate><h2>${tr(run.definition.name)}</h2><p>${tr(run.definition.instructions)}</p><p>${tr('The challenge is paused.')}</p><div class="training-actions"><button id="challenge-resume" class="training-button primary">${tr('Resume simulation')}</button><button id="challenge-restart" class="training-button">${tr('Try again')}</button><button id="challenge-end" class="training-button">${tr('End challenge')}</button></div></section>`,
    );
    document.querySelector('#challenge-resume').onclick = () =>
      document.querySelector('#modal').close();
    document.querySelector('#challenge-restart').onclick = start;
    document.querySelector('#challenge-end').onclick = end;
  }

  function results() {
    onStop();
    if (!recorded) {
      improved = saveChallengeBest(storage, run);
      recorded = true;
    }
    const completed = run.status === 'completed';
    openModal(
      `<section class="challenge-results" data-no-translate><div class="eyebrow">${tr('CHALLENGE RESULTS')}</div><h2>${tr(run.definition.name)}</h2><div class="challenge-result-score" data-medal="${run.medal || 'none'}"><span>${completed ? `● ${tr(run.medal)}` : tr('Unfinished')}</span><strong><bdi>${run.score}<small> / 100</small></bdi></strong><time dir="ltr">${clock(run.elapsed)}</time></div><p>${tr(run.reason)}</p>${improved ? `<p class="challenge-best">${tr('New personal best')}</p>` : ''}<div class="challenge-result-evidence">${(
        run.evidence || challengeRequirements(run)
      )
        .map(
          (r) =>
            `<span>${r.met ? '✓' : '○'} ${tr(r.label)}${Number.isFinite(r.value) ? ` <bdi>${r.value.toFixed(r.unit === 'kn' ? 2 : 1)}${r.unit || ''}</bdi>` : ''}</span>`,
        )
        .join(
          '',
        )}<span>${tr('Minimum keel clearance')} <bdi>${run.minClearance.toFixed(1)} m</bdi></span>${run.hints.length ? `<span>${tr('Hint penalty')} <bdi>−${run.hints.length * 10}</bdi></span>` : ''}</div><div id="adventure-track"></div><div class="training-actions"><button id="adventure-again" class="training-button primary">${tr('Try again')}</button><button id="adventure-library" class="training-button">${tr('All challenges')}</button></div></section>`,
    );
    const marks =
      run.definition.kind === 'treasure'
        ? run.definition.targets.slice(0, run.stage)
        : [run.target];
    mountSailingTrack(document.querySelector('#adventure-track'), run.track, { marks });
    document.querySelector('#adventure-again').onclick = start;
    document.querySelector('#adventure-library').onclick = onLibrary;
  }

  function end() {
    if (!run) return;
    finishChallenge(run);
    update();
    results();
  }

  return {
    briefing,
    end,
    review: results,
    restart: start,
    get active() {
      return run?.status === 'running';
    },
    get current() {
      return run;
    },
    get chart() {
      return run ? challengeChart(run) : null;
    },
    tick(dt) {
      if (!run || run.status !== 'running') return;
      advanceChallenge(run, dt);
      updateTime += dt;
      if (updateTime >= 0.15 || run.status !== 'running') {
        updateTime = 0;
        update();
      }
      if (run.status !== 'running') results();
    },
    leave() {
      run = null;
      panel.hidden = true;
      setCues(null);
    },
  };
}
