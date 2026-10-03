import { translate as t } from '../i18n/runtime.js';
import './session.css';

// A session outlives playback: pausing and utility dialogs keep the same cockpit.
export function mountSimulationSession({ onExit, onRestart, onChange }) {
  const simulator = document.querySelector('.simulator');
  const controls = document.createElement('div');
  controls.id = 'session-controls';
  controls.hidden = true;
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', t('Simulation controls'));
  controls.innerHTML = `<button id="session-exit" aria-label="${t('Exit simulation')}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M10 5H5v14h5M9 12h12m-4-4 4 4-4 4"/></svg><span>${t('Exit')}</span></button><span id="session-status" role="status"></span><button id="session-restart" aria-label="${t('Restart simulation')}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 10a9 9 0 1 1 1 8M3 4v6h6"/></svg><span>${t('Restart')}</span></button>`;
  simulator.prepend(controls);
  const mission = document.createElement('div');
  mission.className = 'session-mission';
  simulator.append(mission);
  simulator.tabIndex = -1;
  controls.querySelector('#session-exit').onclick = onExit;
  controls.querySelector('#session-restart').onclick = onRestart;
  const mobile = window.matchMedia('(max-width: 900px)');
  function arrange() {
    const parent = mobile.matches ? document.querySelector('.mobile-scene-toolbar') : simulator;
    if (parent && controls.parentElement !== parent) parent.prepend(controls);
  }
  mobile.addEventListener('change', arrange);
  arrange();
  let active = false;
  document.body.dataset.session = 'outside';
  return {
    sync({ started, graphicsReady, paused }) {
      const next = Boolean(started && graphicsReady);
      if (next !== active) {
        active = next;
        document.body.dataset.session = active ? 'active' : 'outside';
        controls.hidden = !active;
        onChange();
        if (!document.querySelector('dialog[open]')) {
          if (active) simulator.focus({ preventScroll: true });
          else if (controls.contains(document.activeElement)) {
            const selector = mobile.matches ? '#mobile-menu-toggle' : '.nav-item.active';
            document.querySelector(selector)?.focus({ preventScroll: true });
          }
        }
      }
      const status = controls.querySelector('#session-status');
      const label = t(paused ? 'Simulation paused' : 'Simulation running');
      if (status.textContent !== label) status.textContent = label;
      if (controls.dataset.paused !== String(paused)) controls.dataset.paused = String(paused);
    },
  };
}
