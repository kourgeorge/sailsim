import { translate as t } from '../i18n/runtime.js';
import './scene-loading.css';

export function mountSceneLoading({ onCancel }) {
  const dialog = document.createElement('dialog');
  dialog.id = 'scene-loading';
  dialog.dataset.noTranslate = 'true';
  dialog.setAttribute('aria-labelledby', 'scene-loading-title');
  dialog.setAttribute('aria-describedby', 'scene-loading-description');
  dialog.innerHTML = `<div class="scene-loading-content"><span class="scene-loading-spinner" aria-hidden="true"></span><div role="status" aria-live="polite"><h2 id="scene-loading-title"></h2><p id="scene-loading-description"></p></div><div class="scene-loading-actions"><button id="scene-loading-reload" type="button" hidden>${t('Reload page')}</button><button id="scene-loading-cancel" type="button">${t('Back')}</button></div></div>`;
  document.body.append(dialog);
  dialog.querySelector('#scene-loading-cancel').onclick = onCancel;
  dialog.querySelector('#scene-loading-reload').onclick = () => location.reload();
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    onCancel();
  });
  let previous = '';
  return {
    sync({ active, status }) {
      const show = active && ['loading', 'error'].includes(status);
      if (!show) {
        if (dialog.open) dialog.close();
        previous = '';
        return;
      }
      if (previous !== status) {
        previous = status;
        const error = status === 'error';
        dialog.dataset.state = status;
        dialog.querySelector('#scene-loading-title').textContent = t(
          error ? 'Could not load the simulation' : 'Loading simulation…',
        );
        dialog.querySelector('#scene-loading-description').textContent = t(
          error ? 'Check your connection and reload the page.' : 'Preparing your boat and the sea.',
        );
        dialog.querySelector('#scene-loading-reload').hidden = !error;
      }
      if (!dialog.open) dialog.showModal();
    },
  };
}
