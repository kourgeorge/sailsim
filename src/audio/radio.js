// Official direct streams: https://radioparadise.com/listen/stream-links
// MP3 works across the browsers supported by the simulator; these endpoints
// allow CORS so the same Web Audio volume controls also work on mobile Safari.
export const RADIO_STATIONS = [
  { id: 'rp-main', name: 'radio main', url: 'https://stream.radioparadise.com/mp3-128' },
  { id: 'rp-mellow', name: 'radio relax', url: 'https://stream.radioparadise.com/mellow-192' },
  { id: 'rp-rock', name: 'radio rock', url: 'https://stream.radioparadise.com/rock-192' },
  { id: 'rp-global', name: 'radio global', url: 'https://stream.radioparadise.com/global-192' },
];
export const radioStation = (id) => RADIO_STATIONS.find((station) => station.id === id);
export const musicSource = (value, fallback = 'sail') =>
  value === 'sail' || radioStation(value) ? value : fallback;

export function createRadioStream({ context, output, onChange, createMedia = () => new Audio() }) {
  let media, source, selected, timer;
  let state = 'idle',
    generation = 0,
    disposed = false;
  const notify = (next) => {
    if (disposed || state === next) return;
    state = next;
    onChange();
  };
  function stop() {
    generation++;
    selected = null;
    clearTimeout(timer);
    if (media) {
      media.pause();
      media.removeAttribute('src');
      // Release the live connection and buffered audio, including while muted.
      media.load();
    }
    notify('idle');
  }
  function fail(next = 'error') {
    generation++;
    clearTimeout(timer);
    media?.pause();
    if (media) {
      media.removeAttribute('src');
      media.load();
    }
    notify(next);
  }
  return {
    get state() {
      return state;
    },
    start(station, { retry = false } = {}) {
      if (disposed || (selected === station.id && !retry)) return;
      stop();
      selected = station.id;
      const request = generation;
      try {
        if (!media) {
          const element = createMedia();
          element.crossOrigin = 'anonymous';
          element.preload = 'none';
          const node = context.createMediaElementSource(element);
          node.connect(output);
          media = element;
          source = node;
          media.onplaying = () => {
            if (!selected || !media.src) return;
            clearTimeout(timer);
            notify('playing');
          };
          media.onwaiting = () => {
            if (!selected || !['playing', 'connecting'].includes(state)) return;
            const pending = generation;
            clearTimeout(timer);
            timer = setTimeout(() => {
              if (pending === generation) fail();
            }, 20000);
            notify('connecting');
          };
          media.onerror = () => {
            if (selected && media.error) fail();
          };
          media.onended = () => {
            if (selected) fail();
          };
        }
        media.src = station.url;
        notify('connecting');
        timer = setTimeout(() => {
          if (request === generation) fail();
        }, 20000);
        Promise.resolve(media.play()).catch((error) => {
          if (request === generation && selected && !disposed)
            fail(error.name === 'NotAllowedError' ? 'blocked' : 'error');
        });
      } catch {
        fail();
      }
    },
    stop() {
      if (selected) stop();
    },
    dispose() {
      stop();
      disposed = true;
      if (media) media.onplaying = media.onwaiting = media.onerror = media.onended = null;
      source?.disconnect();
    },
  };
}
