// Official direct streams: https://radioparadise.com/listen/stream-links
// Classical: https://www.radioswissclassic.ch/en/reception/internet
// MP3 works across the browsers supported by the simulator; these endpoints
// allow CORS so the same Web Audio volume controls also work on mobile Safari.
const radioParadise = {
  name: 'Radio Paradise',
  url: 'https://radioparadise.com/listen/stream-links',
};
export const RADIO_STATIONS = [
  {
    id: 'rp-main',
    name: 'radio main',
    url: 'https://stream.radioparadise.com/mp3-128',
    provider: radioParadise,
  },
  {
    id: 'rp-mellow',
    name: 'radio relax',
    url: 'https://stream.radioparadise.com/mellow-192',
    provider: radioParadise,
  },
  {
    id: 'rp-rock',
    name: 'radio rock',
    url: 'https://stream.radioparadise.com/rock-192',
    provider: radioParadise,
  },
  {
    id: 'rp-global',
    name: 'radio global',
    url: 'https://stream.radioparadise.com/global-192',
    provider: radioParadise,
  },
  {
    id: 'swiss-classical',
    name: 'radio classical',
    url: 'https://stream.srg-ssr.ch/srgssr/rsc_de/mp3/128',
    provider: {
      name: 'Radio Swiss Classic',
      url: 'https://www.radioswissclassic.ch/en/reception/internet',
    },
  },
];
export const AUDIO_SOURCES = [
  {
    id: 'sail',
    name: 'Sail relaxing',
    url: new URL('./assets/sail-relaxing.mp3', import.meta.url).href,
    loop: true,
  },
  {
    id: 'waves',
    name: 'waves',
    url: new URL('./assets/waves.mp3', import.meta.url).href,
    loop: true,
  },
  ...RADIO_STATIONS,
];
export const radioStation = (id) => RADIO_STATIONS.find((station) => station.id === id);
export const audioSource = (id) => AUDIO_SOURCES.find((source) => source.id === id);
export const musicSource = (value, fallback = 'sail') => (audioSource(value) ? value : fallback);

export function createAudioPlayer({
  context,
  output,
  onChange,
  createMedia = () => new Audio(),
  loadBuffer = async (url, signal) => {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Audio request failed: ${response.status}`);
    return context.decodeAudioData(await response.arrayBuffer());
  },
}) {
  let media, mediaNode, localNode, selected, timer, requestController, cached;
  let state = 'idle',
    generation = 0,
    disposed = false;
  const notify = (next) => {
    if (disposed || state === next) return;
    state = next;
    onChange();
  };
  function release() {
    clearTimeout(timer);
    requestController?.abort();
    requestController = null;
    if (localNode) {
      localNode.onended = null;
      localNode.stop();
      localNode.disconnect();
      localNode = null;
    }
    if (media) {
      media.pause();
      media.removeAttribute('src');
      media.load();
    }
  }
  function stop() {
    generation++;
    selected = null;
    release();
    notify('idle');
  }
  function fail(next = 'error') {
    generation++;
    release();
    notify(next);
  }
  async function startLoop(choice, request) {
    try {
      let buffer = cached?.id === choice.id ? cached.buffer : null;
      if (!buffer) {
        requestController = new AbortController();
        buffer = await loadBuffer(choice.url, requestController.signal);
      }
      if (request !== generation || disposed) return;
      // Retain only the last local sound, bounding decoded audio memory.
      cached = { id: choice.id, buffer };
      requestController = null;
      localNode = context.createBufferSource();
      localNode.buffer = buffer;
      localNode.loop = true;
      localNode.connect(output);
      localNode.onended = () => {
        if (request === generation) fail();
      };
      localNode.start();
      clearTimeout(timer);
      notify('playing');
    } catch {
      if (request === generation && !disposed) fail();
    }
  }
  return {
    get state() {
      return state;
    },
    start(choice, { retry = false } = {}) {
      if (disposed || (selected === choice.id && !retry)) return;
      stop();
      selected = choice.id;
      const request = generation;
      notify('connecting');
      timer = setTimeout(() => {
        if (request === generation) fail();
      }, 20000);
      if (choice.loop) {
        // BufferSource looping runs on the audio thread, including while the
        // main thread is busy. No ended-event restart or note timer is needed.
        startLoop(choice, request);
        return;
      }
      try {
        if (!media) {
          const element = createMedia();
          element.crossOrigin = 'anonymous';
          element.preload = 'none';
          element.loop = false;
          const node = context.createMediaElementSource(element);
          node.connect(output);
          media = element;
          mediaNode = node;
          media.onplaying = () => {
            if (!radioStation(selected) || !media.src) return;
            clearTimeout(timer);
            notify('playing');
          };
          media.onwaiting = () => {
            if (!radioStation(selected) || !media.src || !['playing', 'connecting'].includes(state))
              return;
            const pending = generation;
            clearTimeout(timer);
            timer = setTimeout(() => {
              if (pending === generation) fail();
            }, 20000);
            notify('connecting');
          };
          media.onerror = () => {
            if (radioStation(selected) && media.error) fail();
          };
          media.onended = () => {
            if (radioStation(selected)) fail();
          };
        }
        media.src = choice.url;
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
      cached = null;
      if (media) media.onplaying = media.onwaiting = media.onerror = media.onended = null;
      mediaNode?.disconnect();
    },
  };
}
