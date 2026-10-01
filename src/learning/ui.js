import { createProgressStore } from './progress-store.js';
import { lessons, modules } from './curriculum.js';
import {
  recordFor,
  masteredIds,
  lessonReady,
  checkKnowledge,
  beginAttempt,
  advanceAttempt,
  invalidateAttempt,
  recordEvent,
  useHint,
  coachingTip,
  practiceAssessment,
  practiceRubric,
  recordDecisionResult,
} from './engine.js';
import { practiceGroundSpeed, practiceStopThreshold } from './practice-assessment.js';
import { anchorSnapshot } from '../anchor.js';
import './learning.css';
import { decisionScenarios } from './decision-scenarios.js';
import { createTrainingReport } from './training-report.js';
import { createDecisionTraining } from './decision-ui.js';
import { translate as t, translatedScenario } from '../i18n/runtime.js';
import { createLessonReader } from './reader.js';
import { practiceRequirementsMarkup, updatePracticeRequirements } from './practice-requirements.js';
import { createPracticeBriefing } from './practice-briefing.js';
import { levelFor, COURSE_LEVELS } from './levels.js';
const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export function createLearning({
  getState,
  resetScenario,
  openModal,
  toast,
  onSelect,
  getMode,
  openManeuvers,
  openGuide,
  openFigure,
  onTrainingEnd = () => {},
  onPause = () => {},
  onResume = () => {},
  getPaused = () => true,
  onTrainingStart = () => {},
}) {
  let saveErrorShown = false;
  const store = createProgressStore({
    onChange: () => {
      renderLibrary();
      if (getMode() === 'learn') renderCard();
    },
    onError: () => {
      if (!saveErrorShown) {
        toast('Browser storage is unavailable. Keep this tab open and export your course record.');
        saveErrorShown = true;
      }
    },
  });
  const progress = store.progress;
  let selected = lessons.findIndex((l) => l.id === progress.selected),
    attempt = null,
    prepared = false,
    lastStatus = '',
    lastCheckpoint = -1;
  const current = () => lessons[selected];
  function save() {
    progress.selected = current().id;
    return store.save();
  }
  function completed() {
    return masteredIds(progress);
  }
  function renderLibrary() {
    const mastered = completed();
    $('#progress-label').textContent = `${mastered.size} / ${lessons.length}`;
    $('#progress-fill').style.width = `${(mastered.size / lessons.length) * 100}%`;
    $('#lessons').innerHTML = modules
      .map((m, mi) => {
        const group = lessons.filter((l) => l.module === m.id);
        return `<details class="course-module" ${current().module === m.id ? 'open' : ''}><summary><span>${String(mi + 1).padStart(2, '0')} ${esc(m.title)}</span><small dir="ltr">${group.filter((l) => mastered.has(l.id)).length}/${group.length}</small></summary>${group
          .map((l) => {
            const i = lessons.indexOf(l),
              done = mastered.has(l.id);
            return `<button class="lesson-row ${selected === i && getMode() === 'learn' ? 'current' : ''} ${done ? 'complete' : ''}" data-course-lesson="${i}" ${selected === i ? 'aria-current="step"' : ''}><span class="lesson-index">${done ? '✓' : String(i + 1).padStart(2, '0')}</span><span><strong>${esc(l.title)}</strong><small>${l.practice ? 'Live boat handling' : 'Interactive seamanship'} · ${l.minutes} MIN${!lessonReady(progress, l) ? ' · PREVIEW' : ''}</small></span></button>`;
          })
          .join('')}</details>`;
      })
      .join('');
    document
      .querySelectorAll('[data-course-lesson]')
      .forEach((b) => (b.onclick = () => select(+b.dataset.courseLesson)));
  }
  function select(index) {
    reader.close();
    decision.close();
    cancel('Lesson changed. Restart practice when you return.');
    selected = Math.max(0, Math.min(lessons.length - 1, index));
    attempt = null;
    save();
    onSelect(selected);
    renderLibrary();
    renderCard();
  }
  function placeCard() {
    const card = $('.lesson-card'),
      sidebar =
        getMode() === 'learn' &&
        attempt?.status === 'active' &&
        window.matchMedia('(min-width: 901px)').matches;
    card.classList.toggle('mission-sidebar', sidebar);
    const mobileContent = window.matchMedia('(max-width: 900px)').matches
      ? $('#mobile-lesson-content')
      : null;
    const parent = sidebar ? $('.sidebar') : mobileContent || $('.simulator');
    if (card.parentElement !== parent) {
      if (sidebar) parent.prepend(card);
      else if (mobileContent) parent.append(card);
      else parent.insertBefore(card, $('.scene-footer'));
    }
  }
  window.addEventListener('resize', placeCard);
  function renderCard() {
    const detailsOpen = $('.mobile-practice-details')?.open || false;
    const l = current(),
      r = recordFor(progress, l.id),
      mastered = completed().has(l.id),
      active = attempt?.status === 'active';
    $('#card-eyebrow').textContent =
      `${modules.find((m) => m.id === l.module).title.toUpperCase()} · ${l.minutes} MIN`;
    $('#card-title').textContent = active
      ? 'Current goal'
      : mastered
        ? 'Lesson mastered in simulation'
        : l.title;
    $('#card-body').textContent = active
      ? 'Complete each checkpoint in order. Conditions are fixed for this attempt.'
      : 'Training uses the simulator. Study opens the illustrated lesson.';
    $('#objective-check').textContent = mastered ? '✓' : active ? '◉' : '○';
    $('#objective-text').textContent =
      attempt?.status === 'invalid'
        ? attempt.message
        : attempt?.status === 'passed'
          ? 'Training evidence saved.'
          : active
            ? l.practice.steps[attempt.index].label
            : !lessonReady(progress, l)
              ? 'Preview and practice freely. Earlier lessons must be mastered for course credit.'
              : (l.practice ? r.practice : r.decision)
                ? 'Training evidence saved.'
                : 'Start training to perform assessed tasks. Study material is available separately.';
    let panel = $('#training-actions');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'training-actions';
      $('.lesson-copy').append(panel);
    }
    panel.hidden = getMode() !== 'learn';
    const scored = attempt ? practiceAssessment(attempt, l) : null,
      previous = scored?.status !== 'active' ? scored : null;
    panel.innerHTML = `${active ? '<div class="practice-session-label" id="practice-session-label" role="status"></div>' : ''}<div class="training-actions">${active ? '<button id="practice-toggle" class="training-button primary"></button><button id="practice-end" class="training-button end-practice">End simulation</button>' : '<button id="practice-start" class="training-button primary">▶ Start training</button>'}<button id="lesson-briefing" class="training-button">Study material</button><button id="course-library" class="training-button">Course</button></div><div class="training-status-line"><span>${active ? `<span id="practice-goal-count" data-no-translate>${esc(t('Goals completed'))}: <bdi dir="ltr" id="practice-goal-count-value"></bdi></span>` : l.practice ? 'Live boat handling' : 'Interactive seamanship'}</span>${active ? `<strong id="practice-live-score" class="practice-score" data-no-translate>${esc(t('Live score'))}: <bdi id="practice-score-value" dir="ltr"></bdi></strong>` : ''}</div>${active ? `${practiceRequirementsMarkup()}<div class="checkpoint-progress"><div id="checkpoint-fill"></div></div><div class="checkpoint-meta"><span id="checkpoint-status"></span><button id="practice-hint">Show hint</button></div><div id="practice-ground-speed" class="checkpoint-meta practice-ground-speed" data-no-translate hidden><span>${esc(t('Ground speed'))}: <bdi id="practice-ground-speed-value" dir="ltr">—</bdi></span><span id="practice-ground-speed-limit">${esc(t('Speed limit'))}: <bdi id="practice-ground-speed-threshold" dir="ltr"></bdi></span></div><div id="practice-anchor-rode" class="checkpoint-meta practice-anchor-rode" data-no-translate hidden><span>${esc(t('Rode paid out'))}: <bdi id="practice-anchor-rode-value" dir="ltr">—</bdi></span><span id="practice-anchor-operation-goal"></span></div><p id="practice-tip" hidden></p>` : ''}<div class="training-actions"><button id="training-goals" class="training-button">${active ? 'Show briefing' : 'Training goals'}</button>${!active && (previous || r.lastPracticeResult || r.lastDecisionResult) ? '<button id="practice-debrief" class="training-button">View debrief</button>' : ''}</div>`;
    if (active) {
      const details = document.createElement('details');
      details.className = 'mobile-practice-details';
      details.open = detailsOpen || window.matchMedia('(min-width: 901px)').matches;
      const summary = document.createElement('summary');
      summary.textContent = t('Practice details');
      details.append(summary, ...panel.childNodes);
      panel.append(details);
    }
    $('#lesson-briefing').onclick = briefing;
    $('#course-library').onclick = libraryModal;
    if ($('#practice-start')) $('#practice-start').onclick = start;
    if ($('#practice-toggle'))
      $('#practice-toggle').onclick = () => {
        getPaused() ? onResume() : onPause();
        tickPanel();
      };
    if ($('#practice-end')) $('#practice-end').onclick = endPractice;
    $('#training-goals').onclick = goalsModal;
    if ($('#practice-debrief'))
      $('#practice-debrief').onclick = () =>
        reportModal(previous || r.lastPracticeResult || r.lastDecisionResult);
    if ($('#practice-hint'))
      $('#practice-hint').onclick = () => {
        useHint(attempt, progress);
        $('#practice-tip').hidden = false;
        $('#practice-tip').textContent = coachingTip(l, attempt, getState());
        save();
      };
    $('#next-lesson').hidden = selected === lessons.length - 1;
    $('#next-lesson').setAttribute('aria-label', 'Browse next lesson (does not award credit)');
    placeCard();
    tickPanel();
  }
  // Preparing a lesson loads its boat, but does not create or time an attempt.
  function start() {
    reader.close();
    decision.close();
    cancel('Practice restarted.');
    attempt = null;
    prepared = true;
    onPause();
    if ($('#modal').open) $('#modal').close();
    renderCard();
    showPracticeBriefing();
  }
  function launch() {
    if (!prepared) return;
    const l = current();
    prepared = false;
    if (!l.practice) {
      const scenario = decisionScenarios.find((s) => s.lessonId === l.id);
      if (scenario) decision.open(scenario);
      return;
    }
    // Restore authored setup even if controls changed after dismissing the briefing.
    resetScenario(l.practice.setup);
    attempt = beginAttempt(l, getState(), progress);
    lastStatus = attempt.status;
    lastCheckpoint = 0;
    save();
    renderCard();
    if (attempt.status === 'active') {
      onTrainingStart();
      onResume();
      toast(t('Simulation started. Follow the current goal; your actions are now being scored.'));
    } else {
      onTrainingEnd();
      reportModal(practiceAssessment(attempt, l));
    }
  }
  function endPractice() {
    if (attempt?.status !== 'active') return;
    const reason = 'Simulation ended. Your completed goals and score have been saved.';
    invalidateAttempt(attempt, progress, reason);
    save();
    onTrainingEnd();
    renderLibrary();
    renderCard();
    reportModal(practiceAssessment(attempt, current()));
  }
  function showPracticeBriefing() {
    onPause();
    if ($('#modal').open) $('#modal').close();
    const l = current(),
      scenario = decisionScenarios.find((s) => s.lessonId === l.id),
      active = attempt?.status === 'active';
    if (!active && l.practice) resetScenario(l.practice.setup);
    const state = getState();
    practiceBriefing.open({
      lesson: l,
      goals: l.practice ? practiceRubric(l) : translatedScenario(scenario).stages,
      active,
      score: active ? practiceAssessment(attempt, l).score : 0,
      completed: active ? attempt.index : 0,
      preview: !lessonReady(progress, l),
      conditions: l.practice
        ? `${t('Wind speed')}: ${state.windSpeed} ${t('knots')} · ${t('HEADING')}: ${Math.round(state.heading)}°`
        : '',
    });
    tickPanel();
  }
  const practiceBriefing = createPracticeBriefing({
    onBegin: launch,
    onResume: () => {
      onResume();
      tickPanel();
    },
    onEnd: endPractice,
    onStudy: () => briefing(),
    onClose: () => tickPanel(),
  });
  const decision = createDecisionTraining({
    onResult: (report) => {
      recordDecisionResult(progress, current(), report);
      save();
      renderLibrary();
      renderCard();
    },
    onClose: () => {
      renderLibrary();
      renderCard();
    },
    onStudy: () => briefing(),
    onGuide: () => openGuide(current()),
  });
  function goalsModal() {
    if (attempt?.status === 'active' || prepared) showPracticeBriefing();
    else start();
  }
  const reportModal = createTrainingReport({
    current,
    getRecord: () => recordFor(progress, current().id),
    openModal,
    onRetry: start,
    onStudy: briefing,
  });
  const reader = createLessonReader({
    onClose: () => decision.resume(),
    onCheck: (answers, index) => {
      if (answers[index] !== current().quiz[index].correct)
        recordFor(progress, current().id).wrongAnswers++;
      const result = checkKnowledge(progress, current(), answers, { countWrongAnswers: false });
      save();
      if (result.complete) {
        renderLibrary();
        renderCard();
      }
      return result;
    },
    onPractice: resumeOrStart,
    onCourse: libraryModal,
    onRecord: recordModal,
    onNext: () => {
      select(Math.min(selected + 1, lessons.length - 1));
      briefing();
    },
    onGuide: openGuide,
    onFigure: openFigure,
    getEvidence: () => ({
      ...recordFor(progress, current().id),
      trainingActive: decision.active || attempt?.status === 'active',
      ready: lessonReady(progress, current()),
      mastered: completed().has(current().id),
    }),
  });
  function briefing() {
    practiceBriefing.close();
    onPause();
    decision.suspend();
    reader.open(current());
  }
  function libraryModal() {
    reader.close();
    decision.close();
    const mastered = completed();
    openModal(
      `<div class="eyebrow">YOUR SAILING SCHOOL</div><h2>From first principles to first passage.</h2><p>${lessons.length} lessons · ${modules.length} modules · ${lessons.filter((l) => l.practice).length} practical exercises. Study any lesson; earn mastery in sequence.</p><p>${t('{count} interactive seamanship scenarios').replace('{count}', decisionScenarios.length)}</p><div class="training-actions"><button id="resume-course" class="training-button primary">Resume next unmastered lesson</button><button id="view-record" class="training-button">My record</button><button id="open-maneuvers" class="training-button">Maneuvering lab</button></div><div class="course-levels">${COURSE_LEVELS.map((level) => `<button data-level="${level.id}" class="training-button"><strong>${level.title}</strong><span dir="ltr">${level.range}</span><small>${level.description}</small></button>`).join('')}</div><p class="training-notice">Study levels follow common training themes. Licensing and ICC requirements depend on the jurisdiction and vessel.</p><div class="course-library">${modules
        .map(
          (m, mi) =>
            `<section data-course-level="${levelFor(lessons.find((l) => l.module === m.id)).id}"><div class="eyebrow">${levelFor(lessons.find((l) => l.module === m.id)).title}</div><h3>${mi + 1}. ${esc(m.title)}</h3><p>${esc(m.outcome)}</p>${lessons
              .filter((l) => l.module === m.id)
              .map(
                (l) =>
                  `<button data-library-lesson="${lessons.indexOf(l)}"><span>${mastered.has(l.id) ? '✓' : '○'} ${esc(l.title)}</span><small>${l.practice ? 'Live boat handling' : 'Interactive seamanship'}</small></button>`,
              )
              .join('')}</section>`,
        )
        .join(
          '',
        )}</div><p class="training-notice">Model-based practice supports supervised sailing instruction. It does not assess real line loads, crew coordination, traffic interaction, or casualty recovery.</p>`,
    );
    document.querySelectorAll('[data-level]').forEach(
      (b) =>
        (b.onclick = () => {
          document
            .querySelectorAll('[data-course-level]')
            .forEach(
              (section) => (section.hidden = section.dataset.courseLevel !== b.dataset.level),
            );
          document
            .querySelectorAll('[data-level]')
            .forEach((tab) => tab.setAttribute('aria-pressed', String(tab === b)));
        }),
    );
    document.querySelectorAll('[data-library-lesson]').forEach(
      (b) =>
        (b.onclick = () => {
          select(+b.dataset.libraryLesson);
          $('#modal').close();
        }),
    );
    $('#resume-course').onclick = () => {
      select(
        Math.max(
          0,
          lessons.findIndex((l) => !mastered.has(l.id)),
        ),
      );
      start();
    };
    $('#view-record').onclick = recordModal;
    $('#open-maneuvers').onclick = openManeuvers;
  }
  function recordModal() {
    reader.close();
    decision.close();
    const mastered = completed();
    openModal(
      `<div class="eyebrow">YOUR LEARNING LOG</div><h2>${mastered.size} of ${lessons.length} lessons mastered.</h2><p>Saved in this browser. Attempts and hints help identify useful review. Hints do not reduce your score. An interrupted practice must restart.</p><button id="export-record" class="training-button primary">Export course record</button><div class="record-table"><table><thead><tr><th>Lesson</th><th>Evidence</th><th>Attempts / hints</th></tr></thead><tbody>${lessons
        .map((l) => {
          const r = recordFor(progress, l.id);
          return `<tr><td><button data-review="${lessons.indexOf(l)}">${esc(l.title)}</button></td><td>${mastered.has(l.id) ? 'Mastered' : r.knowledge || r.practice || r.decision ? 'In progress' : 'Not started'}<small>${r.knowledge ? '✓ Quiz' : '○ Quiz'} · ${l.practice ? (r.practice ? '✓' : '○') : r.decision ? '✓' : '○'} ${l.practice ? 'Live boat handling' : 'Interactive seamanship'}${r.lastPracticeResult || r.lastDecisionResult ? ` · <button data-saved-report="${lessons.indexOf(l)}">${(r.lastPracticeResult || r.lastDecisionResult).score}/100 ↗</button>` : ''}</small></td><td>${r.attempts + (r.decisionAttempts || 0)} / ${r.hints}${r.wrongAnswers ? `<small>${r.wrongAnswers} revised answers</small>` : ''}</td></tr>`;
        })
        .join(
          '',
        )}</tbody></table></div><p class="training-notice">This is a self-study record, not a certificate of sailing competence.</p>`,
    );
    document.querySelectorAll('[data-saved-report]').forEach(
      (button) =>
        (button.onclick = () => {
          select(Number(button.dataset.savedReport));
          const r = recordFor(progress, current().id);
          reportModal(r.lastPracticeResult || r.lastDecisionResult);
        }),
    );
    document.querySelectorAll('[data-review]').forEach(
      (b) =>
        (b.onclick = () => {
          select(+b.dataset.review);
          briefing();
        }),
    );
    $('#export-record').onclick = () => {
      const blob = new Blob(
          [
            JSON.stringify(
              {
                exportedAt: new Date().toISOString(),
                notice: 'Self-study record; not a sailing qualification',
                ...progress,
              },
              null,
              2,
            ),
          ],
          { type: 'application/json' },
        ),
        url = URL.createObjectURL(blob),
        link = document.createElement('a');
      link.href = url;
      link.download = 'sail-learning-record.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  }
  function cancel(reason) {
    practiceBriefing.close();
    prepared = false;
    decision.close();
    onPause();
    if (attempt?.status === 'active') {
      invalidateAttempt(attempt, progress, reason);
      save();
    }
    placeCard();
    if ($('#training-actions')) $('#training-actions').hidden = getMode() !== 'learn';
  }
  function event(type, value) {
    recordEvent(attempt, type, value);
  }
  function tickPanel() {
    if (attempt?.status !== 'active' || !$('#checkpoint-status')) return;
    const s = current().practice.steps[attempt.index],
      state = getState();
    updatePracticeRequirements($('#practice-requirements'), s, state, attempt, getPaused());
    $('#practice-session-label').textContent = t(
      getPaused() ? 'Simulation paused' : 'Simulation running',
    );
    $('#practice-toggle').textContent = t(getPaused() ? 'Resume simulation' : 'Pause simulation');
    $('#practice-goal-count-value').textContent =
      `${attempt.index} / ${current().practice.steps.length}`;
    if ($('#practice-score-value'))
      $('#practice-score-value').textContent =
        `${practiceAssessment(attempt, current()).score} / 100`;
    $('#checkpoint-status').setAttribute('data-no-translate', '');
    $('#checkpoint-status').innerHTML = s.duration
      ? `${esc(t('Continuous hold'))}: <bdi dir="ltr">${attempt.held.toFixed(1)} / ${s.duration} s</bdi>`
      : esc(
          t('Step {step}/{total}')
            .replace('{step}', attempt.index + 1)
            .replace('{total}', current().practice.steps.length),
        );
    $('#checkpoint-fill').style.width =
      `${s.duration ? Math.min(100, (attempt.held / s.duration) * 100) : 0}%`;
    const groundRow = $('#practice-ground-speed');
    if (groundRow) {
      groundRow.hidden = !['coast', 'anchor'].includes(s.kind);
      if (!groundRow.hidden) {
        const speed = practiceGroundSpeed(state),
          limit = practiceStopThreshold(s);
        $('#practice-ground-speed-value').textContent =
          `${Number.isFinite(speed) ? speed.toFixed(2) : '—'} kn`;
        $('#practice-ground-speed-limit').hidden = limit === null;
        $('#practice-ground-speed-threshold').textContent =
          limit === null ? '' : `< ${limit.toFixed(2)} kn`;
      }
    }
    const anchorRow = $('#practice-anchor-rode');
    if (anchorRow) {
      anchorRow.hidden = s.kind !== 'anchor';
      if (!anchorRow.hidden) {
        const snapshot = anchorSnapshot(state),
          setting = s.value === true;
        $('#practice-anchor-rode-value').textContent = setting
          ? `${snapshot.rode.toFixed(1)} / ${snapshot.targetRode.toFixed(1)} m`
          : `${snapshot.rode.toFixed(1)} m`;
        const met = setting ? !state.anchorWinchRunning : !state.anchor && snapshot.rode === 0;
        $('#practice-anchor-operation-goal').textContent =
          `${met ? '✓' : '○'} ${t(setting ? 'Windlass stopped' : 'Anchor fully stowed')}`;
      }
    }
    if ($('#practice-tip') && !$('#practice-tip').hidden)
      $('#practice-tip').textContent = coachingTip(current(), attempt, state);
  }
  function tick(dt) {
    if (getMode() !== 'learn' || attempt?.status !== 'active') return;
    advanceAttempt(attempt, current(), getState(), dt, progress);
    if (lastStatus !== attempt.status || lastCheckpoint !== attempt.index) {
      lastStatus = attempt.status;
      lastCheckpoint = attempt.index;
      save();
      renderLibrary();
      renderCard();
      if (attempt.status === 'passed') {
        onTrainingEnd();
        toast(`${t('Training passed')} · ${practiceAssessment(attempt, current()).score} / 100`);
        reportModal(practiceAssessment(attempt, current()));
      } else if (attempt.status === 'invalid') {
        onTrainingEnd();
        toast(attempt.message);
        reportModal(practiceAssessment(attempt, current()));
      } else toast(`Checkpoint complete. ${current().practice.steps[attempt.index].label}`);
    }
    tickPanel();
  }
  function refresh() {
    placeCard();
    renderLibrary();
    if (getMode() === 'learn') renderCard();
    else if ($('#training-actions')) $('#training-actions').hidden = true;
  }
  function resumeOrStart() {
    if (decision.active) {
      reader.close();
      decision.resume();
    } else if (attempt?.status === 'active') {
      reader.close();
      practiceBriefing.close();
      onResume();
      tickPanel();
    } else if (prepared) {
      reader.close();
      showPracticeBriefing();
    } else start();
  }
  return {
    flush: store.flush,
    start,
    resumeOrStart,
    updateStatus: tickPanel,
    get briefingOpen() {
      return practiceBriefing.isOpen;
    },
    get prepared() {
      return prepared;
    },
    get practiceStatus() {
      return attempt?.status || 'ready';
    },
    get decisionActive() {
      return decision.active;
    },
    get practiceActive() {
      return attempt?.status === 'active';
    },
    get training() {
      return decision.isOpen;
    },
    tickDecision: decision.tick,
    closeTraining: decision.close,
    get reading() {
      return reader.isOpen;
    },
    closeReader: reader.close,
    get selected() {
      return selected;
    },
    get active() {
      return attempt?.status === 'active' || decision.active;
    },
    current,
    select,
    refresh,
    briefing,
    libraryModal,
    tick,
    event,
    cancel,
  };
}
