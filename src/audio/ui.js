import { createSailingAudio } from './controller.js';
import { translate as t } from '../i18n/runtime.js';
import './audio.css';

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const label = (value) => esc(t(value));
const icon =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path class="sound-waves" d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/><path class="sound-muted" d="m16 9 6 6m0-6-6 6"/></svg>';

export function mountSailingAudio({ container, getMode, getActive, openModal }) {
  const button = document.createElement('button');
  button.id = 'sound-settings';
  button.type = 'button';
  button.dataset.noTranslate = 'true';
  button.setAttribute('aria-haspopup', 'dialog');
  button.innerHTML = `${icon}<span>${label('Sound')}</span>`;
  container.append(button);
  const audio = createSailingAudio({ onChange: update });
  let previous = '';
  function update() {
    const { enabled, musicEnabled, seaEnabled, music, sea } = audio.settings;
    const state = audio.state;
    const key = JSON.stringify([enabled, musicEnabled, seaEnabled, music, sea, state]);
    if (key === previous) return;
    previous = key;
    button.dataset.audioState = state;
    button.title = t(state === 'muted' ? 'Sound off' : 'Sea & music');
    button.setAttribute('aria-label', t('Sea & music'));
    const root = document.querySelector('#sailing-audio-settings');
    if (!root) return;
    const toggle = root.querySelector('#sound-enabled');
    toggle.checked = enabled;
    toggle.disabled = state === 'unavailable';
    for (const [name, value] of [
      ['music', music],
      ['sea', sea],
    ]) {
      root.querySelector(`#sound-${name}`).value = Math.round(value * 100);
      root.querySelector(`#sound-${name}-value`).textContent = `${Math.round(value * 100)}%`;
      const layerEnabled = name === 'music' ? musicEnabled : seaEnabled;
      root.querySelector(`#sound-${name}`).disabled =
        !enabled || !layerEnabled || state === 'unavailable';
      const mute = root.querySelector(`#sound-${name}-mute`);
      mute.setAttribute('aria-pressed', String(!layerEnabled));
      mute.setAttribute(
        'aria-label',
        t(
          name === 'music'
            ? layerEnabled
              ? 'Mute music'
              : 'Unmute music'
            : layerEnabled
              ? 'Mute sea sounds'
              : 'Unmute sea sounds',
        ),
      );
      mute.title = mute.getAttribute('aria-label');
      mute.disabled = !enabled || state === 'unavailable';
    }
    root.querySelector('#sound-retry').hidden = state !== 'blocked';
    root.querySelector('#sound-status').textContent = t(
      state === 'unavailable'
        ? 'Background audio is unavailable in this browser.'
        : state === 'muted'
          ? 'Sound off'
          : state === 'blocked'
            ? 'Tap Enable sound to start the audio.'
            : state === 'playing'
              ? 'Background sound is playing.'
              : 'Sound begins when you resume Free sailing.',
    );
  }
  button.onclick = () => {
    openModal(
      `<section id="sailing-audio-settings" data-no-translate><div class="eyebrow">${label('FREE SAILING')}</div><h2>${label('Sea & music')}</h2><p>${label('Slow, gentle music with the wash of the sea. Adjust each sound to suit your mood.')}</p><label class="sound-enable" for="sound-enabled"><span>${label('Background sound')}</span><input id="sound-enabled" type="checkbox" role="switch"></label>${[
        ['music', 'Relaxing music'],
        ['sea', 'Sea sounds'],
      ]
        .map(
          ([name, title]) =>
            `<label class="setting-label" for="sound-${name}">${label(title)}<output id="sound-${name}-value" for="sound-${name}" dir="ltr"></output></label><div class="sound-level"><input id="sound-${name}" type="range" min="0" max="100" step="1"><button id="sound-${name}-mute" class="sound-mute" type="button">${icon}</button></div>`,
        )
        .join(
          '',
        )}<p id="sound-status" role="status"></p><button id="sound-retry" class="training-button">${label('Enable sound')}</button></section>`,
    );
    const root = document.querySelector('#sailing-audio-settings');
    root.querySelector('#sound-enabled').onchange = (e) =>
      audio.setSettings({ enabled: e.target.checked });
    for (const name of ['music', 'sea'])
      root.querySelector(`#sound-${name}`).oninput = (e) =>
        audio.setSettings({ [name]: Number(e.target.value) / 100 });
    for (const name of ['music', 'sea'])
      root.querySelector(`#sound-${name}-mute`).onclick = () =>
        audio.setSettings({ [`${name}Enabled`]: !audio.settings[`${name}Enabled`] });
    root.querySelector('#sound-retry').onclick = () => audio.retry();
    previous = '';
    audio.retry();
    update();
  };
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) audio.setActive(false, { immediate: true });
    else audio.dispose();
  });
  return {
    sync(gesture = false) {
      button.hidden = getMode() !== 'explore';
      audio.setActive(getActive(), { gesture, immediate: document.hidden });
      update();
    },
  };
}
