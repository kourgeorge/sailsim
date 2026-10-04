import { translate as t } from '../i18n/runtime.js';
import './scene-capture.css';

export function mountSceneCapture({ getScene, openModal, toast }) {
  const button = document.createElement('button');
  button.id = 'scene-capture';
  button.type = 'button';
  button.hidden = true;
  button.dataset.noTranslate = 'true';
  button.setAttribute('aria-label', t('Capture scene'));
  button.setAttribute('aria-haspopup', 'dialog');
  button.innerHTML =
    '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 5 6 8H3v12h18V8h-3l-2-3H8Z"/><circle cx="12" cy="13" r="4"/></svg>';
  const mobile = matchMedia('(max-width: 900px)');
  function arrange() {
    document
      .querySelector(mobile.matches ? '.mobile-scene-toolbar' : '#session-controls')
      .append(button);
  }
  mobile.addEventListener('change', arrange);
  arrange();
  let active = false,
    available = false,
    busy = false,
    imageURL = null;
  function release() {
    if (imageURL) URL.revokeObjectURL(imageURL);
    imageURL = null;
  }
  document.querySelector('#modal').addEventListener('close', release);
  window.addEventListener('pagehide', release);
  function syncButton() {
    button.hidden = !active;
    button.disabled = busy || !available;
    button.setAttribute('aria-busy', String(busy));
    button.title = t(
      busy
        ? 'Capturing scene…'
        : available
          ? 'Capture scene'
          : 'Scene capture is unavailable in this browser.',
    );
  }
  button.onclick = async () => {
    if (busy || !active || !available) return;
    busy = true;
    syncButton();
    try {
      const blob = await getScene().capture();
      if (!active) return;
      release();
      imageURL = URL.createObjectURL(blob);
      const file = new File([blob], `sail-${new Date().toISOString().replace(/[:.]/g, '-')}.png`, {
        type: 'image/png',
      });
      openModal(
        '<section id="scene-capture-preview" data-no-translate><h2></h2><img><div class="training-actions"><a id="capture-save" class="training-button primary"></a><button id="capture-share" class="training-button" type="button" hidden></button></div><p id="capture-message" role="status" hidden></p></section>',
      );
      const root = document.querySelector('#scene-capture-preview');
      root.querySelector('h2').textContent = t('Scene captured');
      const image = root.querySelector('img');
      image.alt = t('Captured sailing scene');
      image.src = imageURL;
      const save = root.querySelector('#capture-save');
      save.textContent = t('Save image');
      save.href = imageURL;
      save.download = file.name;
      const share = root.querySelector('#capture-share');
      share.textContent = t('Share image');
      const data = { files: [file], title: 'SAIL' };
      let canShare = false;
      try {
        canShare = Boolean(navigator.share && navigator.canShare?.({ files: [file] }));
      } catch {}
      share.hidden = !canShare;
      share.onclick = async () => {
        share.disabled = true;
        const message = root.querySelector('#capture-message');
        message.hidden = true;
        try {
          // This is a fresh click, preserving mobile browsers' share activation.
          await navigator.share(data);
        } catch (error) {
          if (error.name !== 'AbortError') {
            message.textContent = t('Sharing is unavailable. Save the image instead.');
            message.hidden = false;
          }
        } finally {
          share.disabled = false;
        }
      };
    } catch {
      toast(t('Could not capture the scene. Please try again.'));
    } finally {
      busy = false;
      syncButton();
    }
  };
  return {
    sync(next) {
      if (active === next.active && available === next.available) return;
      active = next.active;
      available = next.available;
      syncButton();
    },
  };
}
