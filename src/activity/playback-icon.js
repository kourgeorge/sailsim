// SVG keeps playback controls independent of each device's emoji and symbol fonts.
export function playbackIcon(action = 'play') {
  const shape =
    action === 'pause'
      ? '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>'
      : '<path d="M8 5v14l11-7Z"/>';
  return `<svg class="playback-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true" focusable="false">${shape}</svg>`;
}
