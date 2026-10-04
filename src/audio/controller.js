import { createAudioPlayer, audioSource, musicSource } from './radio.js';
import { createHornPlayer } from './horns.js';

const STORAGE_KEY = 'sail-audio-v1';
const HORN_VOLUME = 0.45;
const DEFAULTS = {
  musicEnabled: true,
  music: 0.45,
  musicSource: 'sail',
};
const level = (value, fallback) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;

export function createSailingAudio({
  createContext = () =>
    new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'playback' }),
  storage = () => localStorage,
  onChange = () => {},
  createMedia,
} = {}) {
  let settings = { ...DEFAULTS };
  try {
    const saved = JSON.parse(storage().getItem(STORAGE_KEY));
    if (saved && typeof saved === 'object') {
      settings = {
        // Fold the former master/quiet switches into the one volume and mute.
        // Old quiet mode applied one quarter of the chosen slider volume.
        musicEnabled: saved.enabled !== false && saved.musicEnabled !== false,
        music: level(saved.music, DEFAULTS.music) * (saved.quiet === true ? 0.25 : 1),
        musicSource: musicSource(saved.musicSource),
      };
    }
  } catch {
    /* Sound remains usable without browser storage. */
  }
  let context, output, sourceGain, player, horns, suspendTimer, resumePromise;
  let active = false,
    unavailable = false,
    disposed = false;
  let hornGeneration = 0;
  function stopHorns() {
    hornGeneration++;
    horns?.stop();
  }
  const audible = () => settings.musicEnabled && settings.music > 0;
  const ramp = (parameter, value, seconds) => {
    const now = context.currentTime;
    if (parameter.cancelAndHoldAtTime) parameter.cancelAndHoldAtTime(now);
    else {
      parameter.cancelScheduledValues(now);
      parameter.setValueAtTime(parameter.value, now);
    }
    parameter.linearRampToValueAtTime(value, now + seconds);
  };
  function levels() {
    if (!sourceGain) return;
    ramp(sourceGain.gain, audible() && player?.state === 'playing' ? settings.music : 0, 0.25);
  }
  function apply({ gesture = false, immediate = false, retrySource = false } = {}) {
    clearTimeout(suspendTimer);
    if (disposed) return;
    if (active) {
      if (!context && gesture && !unavailable) {
        try {
          context = createContext();
          output = context.createGain();
          output.gain.value = 0;
          output.connect(context.destination);
          sourceGain = context.createGain();
          sourceGain.gain.value = 0;
          sourceGain.connect(output);
          // One source plays at a time: a decoded local loop or live radio.
          // No synthesizer, reverb, or JS note scheduler runs with the scene.
          player = createAudioPlayer({
            context,
            output: sourceGain,
            createMedia,
            onChange: () => {
              levels();
              onChange();
            },
          });
          context.onstatechange = onChange;
        } catch {
          unavailable = true;
          context?.close().catch(() => {});
          context = null;
          sourceGain = null;
          output = null;
          onChange();
          return;
        }
      }
      if (!context) return;
      // Music controls only affect the background source. Keep the context
      // ready for horn signals throughout an active sailing session.
      if (audible()) player.start(audioSource(settings.musicSource), { retry: retrySource });
      else player.stop();
      if (context.state === 'running') {
        ramp(output.gain, 0.75, 1.5);
      } else if (gesture && !resumePromise) {
        // Both play() and resume() run inside the initiating mobile gesture.
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
      player?.stop();
      stopHorns();
      if (context) {
        ramp(output.gain, 0, immediate ? 0 : 0.6);
        const suspend = () => {
          if (!active && context.state !== 'closed') context.suspend().catch(() => {});
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
    get sourceState() {
      return player?.state || 'idle';
    },
    get state() {
      if (unavailable) return 'unavailable';
      if (!audible()) return 'muted';
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
      levels();
      apply({ gesture: true });
    },
    retry() {
      apply({ gesture: true, retrySource: ['error', 'blocked'].includes(player?.state) });
    },
    horn(event, { gesture = false } = {}) {
      if (!event || disposed || !active) return;
      const generation = hornGeneration;
      if (gesture) apply({ gesture: true });
      const play = () => {
        if (disposed || generation !== hornGeneration || !active || context?.state !== 'running')
          return;
        horns ||= createHornPlayer(context, output);
        return horns.play(event, HORN_VOLUME);
      };
      // A player's tap may need to unlock mobile audio. Never replay that tap
      // after a pause or exit while resume() was pending.
      return gesture && resumePromise ? resumePromise.then(play) : play();
    },
    stopHorns,
    dispose() {
      disposed = true;
      clearTimeout(suspendTimer);
      player?.dispose();
      stopHorns();
      sourceGain?.disconnect();
      output?.disconnect();
      if (context) {
        context.onstatechange = null;
        context.close().catch(() => {});
      }
    },
  };
}
