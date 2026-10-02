import './activity.css';

// Playback stays outside the inert vessel controls. Lessons own their start
// action; only pause/resume and free-sailing tools belong in the scene toolbar.
export function mountSimulationControls() {
  const dock = document.querySelector('.control-dock');
  const console = document.createElement('div');
  console.className = 'simulation-console';
  dock.before(console);
  console.append(dock);
  document
    .querySelector('.view-controls')
    .append(document.querySelector('#play'), document.querySelector('#reset'));
  document.querySelector('.scene-conditions').append(document.querySelector('#conditions'));
  const compass = document.querySelector('.wind-card');
  compass.id = 'scene-compass';
  compass.querySelector('.instrument-label').textContent = 'Compass & wind';
  compass.hidden = true;
  document.querySelector('.scene-tools').append(compass);
  document.querySelector('.play-actions').remove();
}
