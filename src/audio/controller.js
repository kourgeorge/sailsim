import { createSoundscape } from './soundscape.js';

const STORAGE_KEY = 'sail-audio-v1';
const DEFAULTS = { enabled: true, musicEnabled: true, seaEnabled: true, music: 0.45, sea: 0.55 };
const level = (value, fallback) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;

export function createSailingAudio({
  createContext = () => new (window.AudioContext || window.webkitAudioContext)(),
  storage = () => localStorage,
  onChange = () => {},
} = {}) {
  let settings = { ...DEFAULTS };
  try {
    const saved = JSON.parse(storage().getItem(STORAGE_KEY));
    if (saved && typeof saved === 'object') {
      settings = {
        enabled: typeof saved.enabled === 'boolean' ? saved.enabled : true,
        musicEnabled: typeof saved.musicEnabled === 'boolean' ? saved.musicEnabled : true,
        seaEnabled: typeof saved.seaEnabled === 'boolean' ? saved.seaEnabled : true,
        music: level(saved.music, DEFAULTS.music),
        sea: level(saved.sea, DEFAULTS.sea),
      };
    }
  } catch {
    /* Sound remains usable without browser storage. */
  }
  let context, graph, scheduler, suspendTimer, resumePromise;
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
    ramp(graph.music.gain, settings.musicEnabled ? settings.music : 0, 0.25);
    ramp(graph.sea.gain, settings.seaEnabled ? settings.sea : 0, 0.25);
  }
  function startScheduler() {
    graph.schedule();
    if (!scheduler) scheduler = setInterval(() => graph.schedule(), 500);
  }
  function stopScheduler() {
    clearInterval(scheduler);
    scheduler = null;
  }
  function apply({ gesture = false, immediate = false } = {}) {
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
      if (context.state === 'running') {
        startScheduler();
        ramp(graph.output.gain, 0.75, 1.5);
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
    } else if (context) {
      ramp(graph.output.gain, 0, immediate ? 0 : 0.6);
      stopScheduler();
      const suspend = () => {
        if (!wanted() && context.state !== 'closed') context.suspend().catch(() => {});
      };
      if (immediate) suspend();
      else suspendTimer = setTimeout(suspend, 650);
    }
    onChange();
  }
  return {
    get settings() {
      return { ...settings };
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
        musicEnabled:
          typeof patch.musicEnabled === 'boolean' ? patch.musicEnabled : settings.musicEnabled,
        seaEnabled: typeof patch.seaEnabled === 'boolean' ? patch.seaEnabled : settings.seaEnabled,
        music: level(patch.music, settings.music),
        sea: level(patch.sea, settings.sea),
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
      apply({ gesture: true });
    },
    dispose() {
      disposed = true;
      clearTimeout(suspendTimer);
      stopScheduler();
      if (context) {
        context.onstatechange = null;
        context.close().catch(() => {});
      }
    },
  };
}
