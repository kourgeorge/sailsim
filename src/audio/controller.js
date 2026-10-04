import { createSoundscape } from './soundscape.js';
import { createRadioStream, radioStation, musicSource } from './radio.js';

const STORAGE_KEY = 'sail-audio-v1';
const DEFAULTS = {
  enabled: true,
  quiet: false,
  musicEnabled: true,
  seaEnabled: true,
  music: 0.45,
  sea: 0.55,
  musicSource: 'sail',
};
const level = (value, fallback) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;

export function createSailingAudio({
  createContext = () => new (window.AudioContext || window.webkitAudioContext)(),
  storage = () => localStorage,
  onChange = () => {},
  createMedia,
} = {}) {
  let settings = { ...DEFAULTS };
  try {
    const saved = JSON.parse(storage().getItem(STORAGE_KEY));
    if (saved && typeof saved === 'object') {
      settings = {
        enabled: typeof saved.enabled === 'boolean' ? saved.enabled : true,
        quiet: typeof saved.quiet === 'boolean' ? saved.quiet : false,
        musicEnabled: typeof saved.musicEnabled === 'boolean' ? saved.musicEnabled : true,
        seaEnabled: typeof saved.seaEnabled === 'boolean' ? saved.seaEnabled : true,
        music: level(saved.music, DEFAULTS.music),
        sea: level(saved.sea, DEFAULTS.sea),
        musicSource: musicSource(saved.musicSource),
      };
    }
  } catch {
    /* Sound remains usable without browser storage. */
  }
  let context, graph, scheduler, suspendTimer, resumePromise, radio, radioGain;
  let active = false,
    unavailable = false,
    disposed = false;
  const audible = () =>
    (settings.musicEnabled && settings.music > 0) || (settings.seaEnabled && settings.sea > 0);
  const wanted = () => active && settings.enabled && audible();
  const ramp = (parameter, value, seconds) => {
    const now = context.currentTime;
    // Hold the current curve when users change their minds during a fade.
    if (parameter.cancelAndHoldAtTime) parameter.cancelAndHoldAtTime(now);
    else {
      parameter.cancelScheduledValues(now);
      parameter.setValueAtTime(parameter.value, now);
    }
    parameter.linearRampToValueAtTime(value, now + seconds);
  };
  function levels() {
    if (!graph) return;
    ramp(
      graph.music.gain,
      settings.musicEnabled && settings.musicSource === 'sail' ? settings.music : 0,
      0.25,
    );
    ramp(graph.sea.gain, settings.seaEnabled ? settings.sea : 0, 0.25);
    if (radioGain)
      ramp(
        radioGain.gain,
        settings.musicEnabled && radio?.state === 'playing' ? settings.music : 0,
        0.25,
      );
  }
  function startScheduler() {
    graph.schedule();
    if (!scheduler) scheduler = setInterval(() => graph.schedule(), 500);
  }
  function stopScheduler() {
    clearInterval(scheduler);
    scheduler = null;
  }
  function apply({ gesture = false, immediate = false, retryRadio = false } = {}) {
    clearTimeout(suspendTimer);
    if (disposed) return;
    if (wanted()) {
      if (!context && gesture && !unavailable) {
        try {
          context = createContext();
          graph = createSoundscape(context);
          context.onstatechange = onChange;
          levels();
        } catch {
          unavailable = true;
          context?.close().catch(() => {});
          context = null;
          graph = null;
          onChange();
          return;
        }
      }
      if (!context) return;
      const station = radioStation(settings.musicSource);
      if (station && settings.musicEnabled && settings.music > 0) {
        if (!radio && gesture) {
          radioGain = context.createGain();
          radioGain.gain.value = 0;
          radioGain.connect(graph.output);
          radio = createRadioStream({
            context,
            output: radioGain,
            createMedia,
            onChange: () => {
              levels();
              onChange();
            },
          });
        }
        radio?.start(station, { retry: retryRadio });
      } else radio?.stop();
      if (context.state === 'running') {
        startScheduler();
        ramp(graph.output.gain, settings.quiet ? 0.1875 : 0.75, settings.quiet ? 0.4 : 1.5);
      } else if (gesture && !resumePromise) {
        // resume() must be called in the initiating click/key handler on mobile.
        resumePromise = context
          .resume()
          .catch(() => {})
          .finally(() => {
            resumePromise = null;
            if (!disposed) {
              apply();
              onChange();
            }
          });
      }
    } else {
      radio?.stop();
      if (context) {
        ramp(graph.output.gain, 0, immediate ? 0 : 0.6);
        stopScheduler();
        const suspend = () => {
          if (!wanted() && context.state !== 'closed') context.suspend().catch(() => {});
        };
        if (immediate) suspend();
        else suspendTimer = setTimeout(suspend, 650);
      }
    }
    onChange();
  }
  return {
    get settings() {
      return { ...settings };
    },
    get radioState() {
      return radio?.state || 'idle';
    },
    get state() {
      if (unavailable) return 'unavailable';
      if (!settings.enabled || !audible()) return 'muted';
      if (!active) return 'paused';
      return context?.state === 'running' ? 'playing' : 'blocked';
    },
    setActive(value, options = {}) {
      const changed = active !== value;
      active = value;
      if (changed || options.gesture || options.immediate) apply(options);
    },
    setSettings(patch) {
      settings = {
        enabled: typeof patch.enabled === 'boolean' ? patch.enabled : settings.enabled,
        quiet: typeof patch.quiet === 'boolean' ? patch.quiet : settings.quiet,
        musicEnabled:
          typeof patch.musicEnabled === 'boolean' ? patch.musicEnabled : settings.musicEnabled,
        seaEnabled: typeof patch.seaEnabled === 'boolean' ? patch.seaEnabled : settings.seaEnabled,
        music: level(patch.music, settings.music),
        sea: level(patch.sea, settings.sea),
        musicSource: musicSource(patch.musicSource, settings.musicSource),
      };
      try {
        storage().setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch {
        /* Optional. */
      }
      levels();
      apply({ gesture: true });
    },
    retry() {
      apply({ gesture: true, retryRadio: ['error', 'blocked'].includes(radio?.state) });
    },
    dispose() {
      disposed = true;
      clearTimeout(suspendTimer);
      stopScheduler();
      radio?.dispose();
      radioGain?.disconnect();
      if (context) {
        context.onstatechange = null;
        context.close().catch(() => {});
      }
    },
  };
}
