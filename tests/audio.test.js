import test from 'node:test';
import assert from 'node:assert/strict';
import { createSailingAudio } from '../src/audio/controller.js';
import { audioUI } from '../src/i18n/audio.js';

const memory = (initial) => {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key, next) => {
      value = next;
    },
  };
};

test('legacy sea settings are ignored while music mute and volume survive reloads', () => {
  const storage = memory('{"seaEnabled":true,"sea":0.72}');
  const options = {
    storage: () => storage,
    createContext: () => assert.fail('Paused audio must stay lazy'),
  };
  const audio = createSailingAudio(options);
  audio.setSettings({ music: 0.31, sea: 0.72, musicEnabled: false });
  assert.equal(Object.hasOwn(audio.settings, 'seaEnabled'), false);
  assert.equal(Object.hasOwn(audio.settings, 'sea'), false);
  assert.equal(audio.state, 'muted');
  const restored = createSailingAudio(options);
  assert.deepEqual(restored.settings, {
    enabled: true,
    quiet: false,
    musicEnabled: false,
    music: 0.31,
    musicSource: 'sail',
  });
  restored.setSettings({ musicEnabled: true });
  assert.equal(restored.settings.music, 0.31);
  audio.dispose();
  restored.dispose();
});

test('stored levels are bounded and blocked storage does not disable sound controls', () => {
  const audio = createSailingAudio({
    storage: () => memory('{"music":9,"sea":-1,"enabled":"false"}'),
  });
  assert.equal(audio.settings.music, 1);
  assert.equal(audio.settings.enabled, true);
  assert.equal(audio.settings.quiet, false);
  const blocked = createSailingAudio({
    storage: () => {
      throw new Error('Storage disabled');
    },
  });
  blocked.setSettings({ musicEnabled: false, music: 0.6 });
  assert.equal(blocked.settings.musicEnabled, false);
  assert.equal(blocked.settings.music, 0.6);
  audio.dispose();
  blocked.dispose();
});

test('quiet listening persists without changing the music volume or mute', () => {
  const storage = memory(null);
  const options = {
    storage: () => storage,
    createContext: () => assert.fail('Paused audio must stay lazy'),
  };
  const audio = createSailingAudio(options);
  audio.setSettings({ music: 0.32, musicEnabled: false, quiet: true });
  const restored = createSailingAudio(options);
  assert.equal(restored.settings.quiet, true);
  restored.setSettings({ quiet: false });
  assert.equal(restored.settings.music, 0.32);
  assert.equal(restored.settings.musicEnabled, false);
  audio.dispose();
  restored.dispose();
});

test('audio initializes only from a gesture and unsupported audio never breaks simulation', () => {
  let attempts = 0;
  const audio = createSailingAudio({
    storage: () => memory(null),
    createContext: () => {
      attempts++;
      throw new Error('No AudioContext');
    },
  });
  audio.setActive(true);
  assert.equal(attempts, 0);
  audio.setActive(true, { gesture: true });
  assert.equal(audio.state, 'unavailable');
  audio.retry();
  assert.equal(attempts, 1);
  audio.setActive(false);
  audio.dispose();
});

test('audio controls are translated in every supported language', () => {
  for (const dictionary of Object.values(audioUI)) {
    assert.deepEqual(Object.keys(dictionary), Object.keys(audioUI.en));
    for (const value of Object.values(dictionary))
      assert.ok(typeof value === 'string' && value.trim());
  }
});

test('radio choices persist without connecting while paused and unknown sources are rejected', () => {
  const storage = memory(null);
  const options = {
    storage: () => storage,
    createContext: () => assert.fail('Choosing a paused station must not create audio'),
    createMedia: () => assert.fail('Choosing a paused station must not start a stream'),
  };
  const audio = createSailingAudio(options);
  audio.setSettings({ musicSource: 'waves' });
  const waves = createSailingAudio(options);
  assert.equal(waves.settings.musicSource, 'waves');
  waves.dispose();
  audio.setSettings({ musicSource: 'rp-mellow' });
  const restored = createSailingAudio(options);
  assert.equal(restored.settings.musicSource, 'rp-mellow');
  restored.setSettings({ musicSource: 'https://unknown.example/radio' });
  assert.equal(restored.settings.musicSource, 'rp-mellow');
  const invalid = createSailingAudio({
    ...options,
    storage: () => memory('{"musicSource":"old-station"}'),
  });
  assert.equal(invalid.settings.musicSource, 'sail');
  for (const controller of [audio, restored, invalid]) controller.dispose();
});
