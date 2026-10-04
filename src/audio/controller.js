import { createSoundscape } from './soundscape.js';
import { createRadioStream, radioStation, musicSource } from './radio.js';

const STORAGE_KEY = 'sail-audio-v1';
const DEFAULTS = {
  enabled: true,
  quiet: false,
  musicEnabled: true,
  music: 0.45,
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
        music: level(saved.music, DEFAULTS.music),
        musicSource: musicSource(saved.musicSource),
      };
    }
  } catch {
    /* Sound remains usable without browser storage. */
  }
  let context, graph, scheduler, suspendTimer, resumePromise, radio, radioGain;
  let sourceReadyAt = 0;
  let active = false,
    unavailable = false,
    disposed = false;
  const audible = () => settings.musicEnabled && settings.music > 0;
  const wanted = () => active && settings.enabled && audible();
  const ramp = (parameter, value, seconds, readyAt = 0) => {
    const now = context.currentTime;
    // Hold the current curve when users change their minds during a fade.
    if (parameter.cancelAndHoldAtTime) parameter.cancelAndHoldAtTime(now);
    else {
      parameter.cancelScheduledValues(now);
      parameter.setValueAtTime(parameter.value, now);
    }
    // Finish fading out the old source before making its replacement audible.
    const start = value > 0 ? Math.max(now, readyAt) : now;
    if (start > now) {
      parameter.setValueAtTime(0, now);
      parameter.setValueAtTime(0, start);
    }
    const end = value === 0 && readyAt > now ? Math.min(now + seconds, readyAt) : start + seconds;
    parameter.linearRampToValueAtTime(value, end);
  };
  function levels() {
    if (!graph) return;
    ramp(
      graph.music.gain,
      settings.musicEnabled && settings.musicSource === 'sail' ? settings.music : 0,
      0.25,
      sourceReadyAt,
    );
    if (radioGain)
      ramp(
        radioGain.gain,
        settings.musicEnabled && radioStation(settings.musicSource) && radio?.state === 'playing'
          ? settings.music
          : 0,
        0.25,
        sourceReadyAt,
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
      if (station) {
        stopScheduler();
        graph.stop(Math.max(context.currentTime, sourceReadyAt));
      }
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
        if (!station) startScheduler();
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
      const previousSource = settings.musicSource;
      settings = {
        enabled: typeof patch.enabled === 'boolean' ? patch.enabled : settings.enabled,
        quiet: typeof patch.quiet === 'boolean' ? patch.quiet : settings.quiet,
        musicEnabled:
          typeof patch.musicEnabled === 'boolean' ? patch.musicEnabled : settings.musicEnabled,
        music: level(patch.music, settings.music),
        musicSource: musicSource(patch.musicSource, settings.musicSource),
      };
      try {
        storage().setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch {
        /* Optional. */
      }
      if (context && previousSource !== settings.musicSource)
        sourceReadyAt = context.currentTime + 0.25;
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
