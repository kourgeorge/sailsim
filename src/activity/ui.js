import { activityState } from './state.js';
import { translate as t } from '../i18n/runtime.js';
import './activity.css';
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
// The single simulation control group: status, start/pause, conditions and reset live together.
export function createActivityStatus({ getContext, controls = [] }) {
  const dock = document.querySelector('.control-dock');
  // Keep playback outside the dock's inert/disabled vessel controls.
  const console = document.createElement('div');
  console.className = 'simulation-console';
  dock.before(console);
  console.append(dock);
  const root = document.createElement('section');
  root.id = 'activity-status';
  root.className = 'activity-status';
  root.setAttribute('aria-label', t('Simulation status'));
  console.prepend(root);
  const info = document.createElement('div');
  info.className = 'activity-info';
  info.dataset.noTranslate = 'true';
  const tools = document.createElement('div');
  tools.className = 'activity-controls';
  tools.append(...controls);
  root.append(info, tools);
  let previous = '';
  function update() {
    // Decision scenarios have their own workspace; keep the same controls beside its tasks.
    const training = document.querySelector('#decision-training');
    const target =
      training && !training.hidden
        ? training.querySelector('.training-layout, .training-debrief')
        : null;
    if (target) {
      if (root.nextElementSibling !== target) target.before(root);
    } else if (root.parentElement !== console) console.prepend(root);
    const state = activityState(getContext()),
      key = JSON.stringify(state);
    if (key === previous) return;
    previous = key;
    root.dataset.state = state.id;
    root.dataset.tone = state.tone;
    root.title = t(state.message);
    document.body.dataset.activity = state.id;
    const names = {
      ready: 'Ready',
      briefing: 'Simulation ready',
      study: 'Text lesson',
      'scenario-running': 'Scenario active',
      'training-running': 'In simulation',
      'training-paused': 'Paused',
      'free-running': 'Free sailing',
      'free-paused': 'Paused',
      review: 'Review',
    };
    info.innerHTML = `<div class="activity-symbol" aria-hidden="true">${state.tone === 'running' ? '●' : state.tone === 'study' ? '▤' : state.tone === 'review' ? '≡' : state.tone === 'ready' ? '○' : 'Ⅱ'}</div><div class="activity-copy" role="status"><strong>${esc(t(names[state.id]))}</strong><span>${esc(t(state.message))}</span></div>`;
  }
  update();
  return { update };
}
