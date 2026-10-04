import { createSailingAudio } from './controller.js';
import { AUDIO_SOURCES, radioStation } from './radio.js';
import { translate as t } from '../i18n/runtime.js';
import { createVesselHorns } from '../world/vessel-horns.js';
import './audio.css';

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const label = (value) => esc(t(value));
const icon =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><g class="sound-waves"><path d="M15 8a6 6 0 0 1 0 8"/><path class="sound-wave-far" d="M18 5a10 10 0 0 1 0 14"/></g><path class="sound-muted" d="m16 9 6 6m0-6-6 6"/></svg>';

export function mountSailingAudio({
  container,
  hornButton,
  getMode,
  getActive,
  getState,
  getHornActive,
  openModal,
}) {
  const controls = [];
  const audio = createSailingAudio({ onChange: update });
  const horns = createVesselHorns();
  let previous = '';
  let previousHorn = '';
  let hornSounding = false;
  const volumeLevel = () => {
    const { musicEnabled, music } = audio.settings;
    return !musicEnabled || music <= 0 ? 'mute' : music > 0.5 ? 'high' : 'medium';
  };
  const canSoundHorn = () => getMode() === 'explore' && getActive() && getHornActive?.();
  function updateHorn() {
    if (!hornButton) return;
    const available = canSoundHorn();
    const key = JSON.stringify([getMode(), available, hornSounding, audio.state]);
    if (key === previousHorn) return;
    previousHorn = key;
    hornButton.hidden = getMode() !== 'explore';
    hornButton.disabled = !available || hornSounding || audio.state === 'unavailable';
    hornButton.dataset.sounding = String(hornSounding);
    hornButton.querySelector('span').textContent = t('Horn');
    const description = t(
      audio.state === 'unavailable'
        ? 'Background audio is unavailable in this browser.'
        : !available
          ? 'Resume sailing to sound the horn.'
          : 'Sound one short blast',
    );
    hornButton.title = description;
    hornButton.setAttribute('aria-label', `${t('Horn')}. ${description}`);
  }
  async function soundHorn() {
    if (!canSoundHorn() || hornSounding) return;
    hornSounding = true;
    updateHorn();
    try {
      const source = await audio.horn(
        { voice: 'boat', signal: 'short', gain: 1, pan: 0 },
        { gesture: true },
      );
      if (source)
        await new Promise((resolve) => source.addEventListener('ended', resolve, { once: true }));
    } finally {
      hornSounding = false;
      updateHorn();
    }
  }
  if (hornButton) hornButton.onclick = soundHorn;
  function setVolume(percent) {
    // Keep the last audible setting so the menu's mute button can restore it.
    audio.setSettings({
      musicEnabled: percent > 0,
      ...(percent > 0 ? { music: percent / 100 } : {}),
    });
  }
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
    button.onclick = () => setVolume({ high: 50, medium: 0, mute: 100 }[volumeLevel()]);
    group.querySelector('.sound-options').onclick = showSettings;
    controls.push({ group, button });
    parent.append(group);
    previous = '';
    update();
  }
  function update() {
    updateHorn();
    const { musicEnabled, music, musicSource } = audio.settings;
    const state = audio.state;
    const sourceState = audio.sourceState;
    const key = JSON.stringify([musicEnabled, music, musicSource, state, sourceState]);
    if (key === previous) return;
    previous = key;
    const level = volumeLevel();
    const muted = level === 'mute';
    const levelLabel = { high: 'High', medium: 'Medium', mute: 'Mute' }[level];
    const action = { high: 'Set medium volume', medium: 'Mute sound', mute: 'Set high volume' }[
      level
    ];
    for (const { button } of controls) {
      button.dataset.audioState = state;
      button.dataset.volumeLevel = level;
      button.querySelector('span').textContent = t(levelLabel);
      button.setAttribute('aria-label', `${t('Sound')}: ${t(levelLabel)}. ${t(action)}`);
      button.title = button.getAttribute('aria-label');
      button.disabled = state === 'unavailable';
    }
    const root = document.querySelector('#sailing-audio-settings');
    if (!root) return;
    root.querySelector('#sound-source').value = musicSource;
    root.querySelector('#sound-source').disabled = state === 'unavailable';
    const station = radioStation(musicSource);
    root.querySelector('#sound-radio-info').hidden = !station;
    if (station) {
      const provider = root.querySelector('#sound-radio-provider');
      provider.textContent = `${station.provider.name} ↗`;
      provider.href = station.provider.url;
    }
    const percent = muted ? 0 : Math.round(music * 100);
    root.querySelector('#sound-music').value = percent;
    root.querySelector('#sound-music-value').textContent = `${percent}%`;
    root.querySelector('#sound-music').disabled = state === 'unavailable';
    const mute = root.querySelector('#sound-music-mute');
    mute.setAttribute('aria-pressed', String(muted));
    mute.setAttribute('aria-label', t(muted ? 'Unmute sound' : 'Mute sound'));
    mute.title = mute.getAttribute('aria-label');
    mute.disabled = state === 'unavailable';
    const retry = root.querySelector('#sound-retry');
    retry.hidden = state !== 'blocked' && !['blocked', 'error'].includes(sourceState);
    retry.textContent = t(
      sourceState === 'error'
        ? radioStation(musicSource)
          ? 'Retry radio'
          : 'Retry sound'
        : 'Enable sound',
    );
    const status = root.querySelector('#sound-status');
    status.hidden =
      !['unavailable', 'blocked'].includes(state) &&
      !['error', 'connecting', 'blocked'].includes(sourceState);
    status.textContent = t(
      state === 'unavailable'
        ? 'Background audio is unavailable in this browser.'
        : state === 'muted'
          ? 'Sound off'
          : sourceState === 'error'
            ? radioStation(musicSource)
              ? 'Radio is unavailable. Retry or choose another station.'
              : 'Sound is unavailable. Retry or choose another source.'
            : sourceState === 'connecting'
              ? radioStation(musicSource)
                ? 'Connecting to radio…'
                : 'Loading sound…'
              : state === 'blocked' || sourceState === 'blocked'
                ? 'Tap Enable sound to start the audio.'
                : state === 'playing'
                  ? 'Background sound is playing.'
                  : 'Sound begins when you resume Free sailing.',
    );
  }
  function showSettings() {
    openModal(
      `<section id="sailing-audio-settings" data-no-translate><h2>${label('Sound settings')}</h2><label class="setting-label" for="sound-source">${label('Sound source')}</label><div class="sound-source-picker"><select id="sound-source">${AUDIO_SOURCES.map((station) => `<option value="${station.id}">${label(station.name)}</option>`).join('')}</select></div><p id="sound-radio-info" hidden><a id="sound-radio-provider" target="_blank" rel="noopener noreferrer"></a><span>${label('Live radio requires internet.')}</span></p><label class="setting-label" for="sound-music">${label('Volume')}<output id="sound-music-value" for="sound-music" dir="ltr"></output></label><div class="sound-level"><input id="sound-music" type="range" min="0" max="100" step="1"><button id="sound-music-mute" class="sound-mute" type="button">${icon}<span>${label('Mute')}</span></button></div><p id="sound-status" role="status" hidden></p><button id="sound-retry" class="training-button" hidden>${label('Enable sound')}</button></section>`,
    );
    const root = document.querySelector('#sailing-audio-settings');
    root.querySelector('#sound-source').onchange = (e) =>
      audio.setSettings({ musicSource: e.target.value });
    root.querySelector('#sound-music').oninput = (e) => setVolume(Number(e.target.value));
    root.querySelector('#sound-music-mute').onclick = () =>
      setVolume(volumeLevel() === 'mute' ? (audio.settings.music || 0.5) * 100 : 0);
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
      if (getActive() && getHornActive?.() && getState) audio.horn(horns.update(getState(), true));
      else audio.stopHorns();
      update();
    },
  };
}
