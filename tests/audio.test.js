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

test('each layer can be muted without losing its volume, including after reload', () => {
  const storage = memory(null);
  const options = {
    storage: () => storage,
    createContext: () => assert.fail('Paused audio must stay lazy'),
  };
  const audio = createSailingAudio(options);
  audio.setSettings({ music: 0.31, sea: 0.72, musicEnabled: false });
  assert.equal(audio.settings.seaEnabled, true);
  audio.setSettings({ seaEnabled: false });
  assert.equal(audio.state, 'muted');
  const restored = createSailingAudio(options);
  assert.deepEqual(restored.settings, {
    enabled: true,
    quiet: false,
    musicEnabled: false,
    seaEnabled: false,
    music: 0.31,
    sea: 0.72,
  });
  restored.setSettings({ musicEnabled: true });
  assert.equal(restored.settings.music, 0.31);
  assert.equal(restored.settings.seaEnabled, false);
  audio.dispose();
  restored.dispose();
});

test('stored levels are bounded and blocked storage does not disable sound controls', () => {
  const audio = createSailingAudio({
    storage: () => memory('{"music":9,"sea":-1,"enabled":"false"}'),
  });
  assert.equal(audio.settings.music, 1);
  assert.equal(audio.settings.sea, 0);
  assert.equal(audio.settings.enabled, true);
  assert.equal(audio.settings.quiet, false);
  const blocked = createSailingAudio({
    storage: () => {
      throw new Error('Storage disabled');
    },
  });
  blocked.setSettings({ musicEnabled: false, sea: 0.6 });
  assert.equal(blocked.settings.musicEnabled, false);
  assert.equal(blocked.settings.sea, 0.6);
  audio.dispose();
  blocked.dispose();
});

test('quiet listening persists without changing the chosen layer levels or mutes', () => {
  const storage = memory(null);
  const options = {
    storage: () => storage,
    createContext: () => assert.fail('Paused audio must stay lazy'),
  };
  const audio = createSailingAudio(options);
  audio.setSettings({ music: 0.32, sea: 0.61, musicEnabled: false, quiet: true });
  const restored = createSailingAudio(options);
  assert.equal(restored.settings.quiet, true);
  restored.setSettings({ quiet: false });
  assert.equal(restored.settings.music, 0.32);
  assert.equal(restored.settings.sea, 0.61);
  assert.equal(restored.settings.musicEnabled, false);
  assert.equal(restored.settings.seaEnabled, true);
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
