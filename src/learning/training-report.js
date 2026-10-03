import { decisionScenarios } from './decision-scenarios.js';
import { decisionDebriefReason, decisionEvidenceMarkup } from './decision-debrief.js';
import { translate as t, translatedScenario } from '../i18n/runtime.js';
import { mountSailingTrack } from '../navigation/sailing-track-view.js';
const $ = (selector) => document.querySelector(selector);
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export function createTrainingReport({ current, getRecord, openModal, onRetry, onStudy }) {
  return function reportModal(report) {
    if (!report) return;
    const l = current(),
      scenario = decisionScenarios.find((s) => s.lessonId === l.id),
      display = scenario ? translatedScenario(scenario) : null;
    const legacyWindlass =
      !display &&
      report.windlassAssessmentVersion !== 1 &&
      report.objectives.some((row) => row.kind === 'anchor');
    const history = display ? getRecord().decisionResults : getRecord().practiceResults;
    const reason = display
      ? decisionDebriefReason(report, display)
      : report.criticalFailure?.message ||
        report.debrief?.reason ||
        'All goals + 80/100 + no critical failure';
    const evidence = display
      ? decisionEvidenceMarkup(report, display)
      : report.objectives
          .map(
            (row, i) =>
              `<li><strong>${row.status === 'complete' ? '✓' : '○'} ${esc(legacyWindlass && row.kind === 'anchor' ? row.label : l.practice.steps[i].label)}</strong><span>${row.status === 'complete' ? 'Complete' : 'Not completed'}</span>${row.requiredSeconds ? `<small>Best continuous hold <b dir="ltr">${row.bestHoldSeconds.toFixed(1)} / ${row.requiredSeconds} s</b></small>` : ''}${row.evidence ? `<details><summary>Your recorded actions</summary><p>Heading: <b dir="ltr">${row.evidence.heading?.toFixed(1) ?? '—'}°</b> · Boat speed: <b dir="ltr">${row.evidence.speed?.toFixed(2) ?? '—'} kn</b>${['coast', 'anchor'].includes(row.kind) ? ` · ${esc(t('Ground speed'))}: <bdi dir="ltr">${row.evidence.speedOverGround?.toFixed(2) ?? '—'} kn</bdi>` : ''} · Depth: <b dir="ltr">${row.evidence.depth?.toFixed(1) ?? '—'} m</b></p>${row.kind === 'anchor' && !legacyWindlass ? `<p>${esc(t('Rode paid out'))}: <bdi dir="ltr">${row.evidence.anchorPaidRode?.toFixed(1) ?? '—'} m</bdi> · ${esc(t('Rode target'))}: <bdi dir="ltr">${row.evidence.anchorRode?.toFixed(1) ?? '—'} m</bdi> · ${row.evidence.anchorWinchRunning === false ? '✓' : row.evidence.anchorWinchRunning === true ? '○' : '—'} ${esc(t('Windlass stopped'))}</p>` : ''}</details>` : ''}</li>`,
          )
          .join('');
    openModal(
      `<div class="practice-debrief"><div class="eyebrow">Training debrief</div><h2>${report.status === 'passed' ? 'Training passed' : 'Training not passed'} · <span dir="ltr">${report.score} / 100</span></h2><p>${esc(reason)}</p>${legacyWindlass ? `<p class="training-notice">${esc(t('Earlier criteria · timed windlass operation was not assessed'))}</p>` : ''}<div class="training-actions">${(history || []).map((item, i) => `<button class="training-button" data-report-index="${i}">${t('Attempt')} ${i + 1} · ${item.score}/100</button>`).join('')}</div><ul class="training-results">${evidence}</ul><p>${t('Deductions')}: <b dir="ltr">−${report.penalties.reduce((sum, p) => sum + p.points, 0)}</b></p><p>${esc(display?.limitations || report.debrief?.summary || l.transfer)}</p><div class="training-actions"><button id="debrief-retry" class="training-button primary">Restart training</button><button id="debrief-study" class="training-button">Study material</button></div></div>`,
    );
    if (!display && report.track) {
      const map = document.createElement('div');
      $('.practice-debrief .training-results').before(map);
      mountSailingTrack(map, report.track, {
        marks: (l.practice?.steps || [])
          .filter((step) => step.kind === 'waypoint')
          .map((step) => step.value),
      });
    }
    $('#debrief-retry').onclick = onRetry;
    $('#debrief-study').onclick = onStudy;
    document
      .querySelectorAll('[data-report-index]')
      .forEach(
        (button) =>
          (button.onclick = () => reportModal(history[Number(button.dataset.reportIndex)])),
      );
  };
}
