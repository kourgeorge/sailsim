import { createSailingAudio } from './controller.js';
import { RADIO_STATIONS } from './radio.js';
import { translate as t } from '../i18n/runtime.js';
import './audio.css';

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const label = (value) => esc(t(value));
const icon =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><g class="sound-waves"><path d="M15 8a6 6 0 0 1 0 8"/><path class="sound-wave-far" d="M18 5a10 10 0 0 1 0 14"/></g><path class="sound-muted" d="m16 9 6 6m0-6-6 6"/></svg>';

export function mountSailingAudio({ container, getMode, getActive, openModal }) {
  const controls = [];
  const audio = createSailingAudio({ onChange: update });
  let previous = '';
  function mountControls(
    parent,
    { id = 'sound-settings', optionsId = 'sound-options', buttonClass = '' } = {},
  ) {
    const group = document.createElement('div');
    group.className = 'sound-control';
    group.dataset.noTranslate = 'true';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', t('Sound'));
    group.innerHTML = `<button id="${id}" class="sound-toggle ${buttonClass}" type="button">${icon}<span>${label('Sound')}</span></button><button id="${optionsId}" class="sound-options ${buttonClass}" type="button" aria-haspopup="dialog" aria-label="${label('Sound settings')}" title="${label('Sound settings')}"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></button>`;
    const button = group.querySelector('.sound-toggle');
    button.onclick = () => audio.setSettings({ quiet: !audio.settings.quiet });
    group.querySelector('.sound-options').onclick = showSettings;
    controls.push({ group, button });
    parent.append(group);
    previous = '';
    update();
  }
  function update() {
    const { enabled, quiet, musicEnabled, music, musicSource } = audio.settings;
    const state = audio.state;
    const radioState = audio.radioState;
    const key = JSON.stringify([
      enabled,
      quiet,
      musicEnabled,
      music,
      musicSource,
      state,
      radioState,
    ]);
    if (key === previous) return;
    previous = key;
    for (const { button } of controls) {
      button.dataset.audioState = state;
      button.dataset.quiet = String(quiet);
      button.setAttribute('aria-pressed', String(quiet));
      button.setAttribute('aria-label', t(quiet ? 'Restore normal volume' : 'Lower sound volume'));
      button.title = button.getAttribute('aria-label');
      button.disabled = state === 'unavailable';
    }
    const root = document.querySelector('#sailing-audio-settings');
    if (!root) return;
    const toggle = root.querySelector('#sound-enabled');
    toggle.checked = enabled;
    toggle.disabled = state === 'unavailable';
    root.querySelector('#sound-quiet').checked = quiet;
    root.querySelector('#sound-quiet').disabled = !enabled || state === 'unavailable';
    root.querySelector('#sound-source').value = musicSource;
    root.querySelector('#sound-source').disabled = state === 'unavailable';
    root.querySelector('#sound-radio-info').hidden = musicSource === 'sail';
    root.querySelector('#sound-music').value = Math.round(music * 100);
    root.querySelector('#sound-music-value').textContent = `${Math.round(music * 100)}%`;
    root.querySelector('#sound-music').disabled =
      !enabled || !musicEnabled || state === 'unavailable';
    const mute = root.querySelector('#sound-music-mute');
    mute.setAttribute('aria-pressed', String(!musicEnabled));
    mute.setAttribute('aria-label', t(musicEnabled ? 'Mute music' : 'Unmute music'));
    mute.title = mute.getAttribute('aria-label');
    mute.disabled = !enabled || state === 'unavailable';
    const retry = root.querySelector('#sound-retry');
    retry.hidden = state !== 'blocked' && !['blocked', 'error'].includes(radioState);
    retry.textContent = t(radioState === 'error' ? 'Retry radio' : 'Enable sound');
    root.querySelector('#sound-status').textContent = t(
      state === 'unavailable'
        ? 'Background audio is unavailable in this browser.'
        : state === 'muted'
          ? 'Sound off'
          : radioState === 'error'
            ? 'Radio is unavailable. Retry or choose another mix.'
            : state === 'blocked' || radioState === 'blocked'
              ? 'Tap Enable sound to start the audio.'
              : radioState === 'connecting'
                ? 'Connecting to Radio Paradise…'
                : state === 'playing'
                  ? 'Background sound is playing.'
                  : 'Sound begins when you resume Free sailing.',
    );
  }
  function showSettings() {
    openModal(
      `<section id="sailing-audio-settings" data-no-translate><div class="eyebrow">${label('FREE SAILING')}</div><h2>${label('Sound settings')}</h2><p>${label('Choose Sail relaxing or live radio.')}</p><label class="sound-enable" for="sound-enabled"><span>${label('Background sound')}</span><input id="sound-enabled" type="checkbox" role="switch"></label><label class="sound-enable sound-quiet" for="sound-quiet"><span>${label('Quiet sound')}</span><input id="sound-quiet" type="checkbox" role="switch"></label><label class="setting-label" for="sound-source">${label('Music source')}</label><select id="sound-source"><option value="sail">${label('Sail relaxing')}</option><optgroup label="Radio Paradise">${RADIO_STATIONS.map((station) => `<option value="${station.id}">${label(station.name)}</option>`).join('')}</optgroup></select><p id="sound-radio-info" hidden><a href="https://radioparadise.com/listen/stream-links" target="_blank" rel="noopener noreferrer">Radio Paradise ↗</a><span>${label('Live radio requires internet.')}</span></p><label class="setting-label" for="sound-music">${label('Music volume')}<output id="sound-music-value" for="sound-music" dir="ltr"></output></label><div class="sound-level"><input id="sound-music" type="range" min="0" max="100" step="1"><button id="sound-music-mute" class="sound-mute" type="button">${icon}</button></div><p id="sound-status" role="status"></p><button id="sound-retry" class="training-button">${label('Enable sound')}</button></section>`,
    );
    const root = document.querySelector('#sailing-audio-settings');
    root.querySelector('#sound-source').onchange = (e) =>
      audio.setSettings({ musicSource: e.target.value });
    root.querySelector('#sound-enabled').onchange = (e) =>
      audio.setSettings({ enabled: e.target.checked });
    root.querySelector('#sound-quiet').onchange = (e) =>
      audio.setSettings({ quiet: e.target.checked });
    root.querySelector('#sound-music').oninput = (e) =>
      audio.setSettings({ music: Number(e.target.value) / 100 });
    root.querySelector('#sound-music-mute').onclick = () =>
      audio.setSettings({ musicEnabled: !audio.settings.musicEnabled });
    root.querySelector('#sound-retry').onclick = () => audio.retry();
    previous = '';
    audio.retry();
    update();
  }
  mountControls(container);
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) audio.setActive(false, { immediate: true });
    else audio.dispose();
  });
  return {
    mountControls,
    sync(gesture = false) {
      for (const { group } of controls) group.hidden = getMode() !== 'explore';
      audio.setActive(getActive(), { gesture, immediate: document.hidden });
      update();
    },
  };
}
