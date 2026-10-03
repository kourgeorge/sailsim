import { createChartRenderer } from './chart.js';
import { sailingTrackSnapshot } from './sailing-track.js';
import { getLocation } from '../locations.js';
import { getWorldBodyDefinitions } from '../world/bodies.js';
import { translate as t } from '../i18n/runtime.js';
import './sailing-track.css';

export function mountSailingTrack(container, record, { marks = [] } = {}) {
  const track = sailingTrackSnapshot(record);
  if (!container || !track) return;
  const figure = document.createElement('figure');
  figure.className = 'sailing-track';
  figure.dataset.noTranslate = 'true';
  const caption = document.createElement('figcaption');
  const title = document.createElement('strong');
  title.textContent = t('Your sailing path');
  const location = document.createElement('span');
  location.textContent = t(getLocation(track.locationId).title);
  caption.append(title, location);
  const canvas = document.createElement('canvas');
  canvas.dir = 'ltr';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', t('Your sailing path'));
  const legend = document.createElement('div');
  legend.className = 'sailing-track-legend';
  for (const [symbol, label, name] of [
    ['○', 'Start position', 'start'],
    ['━', 'Recorded track', 'route'],
    ['■', 'End position', 'end'],
  ]) {
    const item = document.createElement('span');
    item.className = `sailing-track-${name}`;
    item.textContent = `${symbol} ${t(label)}`;
    legend.append(item);
  }
  figure.append(caption, canvas, legend);
  container.append(figure);
  const piers = getWorldBodyDefinitions(track.locationId).filter(
    (body) => body.visual.type === 'pier',
  );
  const draw = createChartRenderer({
    getState: () => ({ ...track.samples.at(-1), locationId: track.locationId, worldBodies: piers }),
    getTraining: () => null,
    getChallengeIndex: () => -1,
    getTrack: () => ({ ...track, marks }),
  });
  const resize = () => {
    if (!canvas.isConnected) {
      observer.disconnect();
      return;
    }
    const width = canvas.clientWidth;
    if (!width) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(width * 0.65 * pixelRatio);
    draw(canvas, { pixelRatio });
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
}
