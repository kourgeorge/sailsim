import test from 'node:test';
import assert from 'node:assert/strict';
import { createRadioStream, RADIO_STATIONS } from '../src/audio/radio.js';

function player() {
  const pending = [];
  let created = 0,
    disconnected = false;
  const media = {
    src: '',
    paused: true,
    play() {
      this.paused = false;
      return new Promise((resolve, reject) => pending.push({ resolve, reject }));
    },
    pause() {
      this.paused = true;
    },
    removeAttribute(name) {
      if (name === 'src') this.src = '';
    },
    load() {},
  };
  const radio = createRadioStream({
    context: {
      createMediaElementSource: () => ({
        connect() {},
        disconnect() {
          disconnected = true;
        },
      }),
    },
    output: {},
    onChange() {},
    createMedia: () => {
      created++;
      return media;
    },
  });
  return { radio, media, pending, created: () => created, disconnected: () => disconnected };
}

test('radio stays lazy, reuses one decoder, and releases the stream on stop and disposal', () => {
  const p = player();
  assert.equal(p.created(), 0);
  p.radio.start(RADIO_STATIONS[0]);
  assert.equal(p.media.crossOrigin, 'anonymous');
  p.media.onplaying();
  assert.equal(p.radio.state, 'playing');
  p.radio.stop();
  assert.equal(p.media.src, '');
  assert.equal(p.media.paused, true);
  p.radio.start(RADIO_STATIONS[1]);
  assert.equal(p.created(), 1);
  p.radio.dispose();
  assert.equal(p.media.src, '');
  assert.equal(p.disconnected(), true);
  p.radio.start(RADIO_STATIONS[2]);
  assert.equal(p.media.src, '');
});

test('switching stations ignores an old playback rejection and failures wait for an explicit retry', async () => {
  const p = player();
  p.radio.start(RADIO_STATIONS[0]);
  p.radio.start(RADIO_STATIONS[1]);
  p.pending[0].reject(new Error('Previous playback aborted'));
  await Promise.resolve();
  assert.equal(p.radio.state, 'connecting');
  assert.equal(p.media.src, RADIO_STATIONS[1].url);
  p.pending[1].reject(Object.assign(new Error('Gesture required'), { name: 'NotAllowedError' }));
  await Promise.resolve();
  assert.equal(p.radio.state, 'blocked');
  assert.equal(p.media.src, '');
  p.radio.start(RADIO_STATIONS[1]);
  assert.equal(p.pending.length, 2);
  p.radio.start(RADIO_STATIONS[1], { retry: true });
  p.media.onplaying();
  assert.equal(p.radio.state, 'playing');
  p.radio.dispose();
});
