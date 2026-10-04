import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudioPlayer, RADIO_STATIONS, AUDIO_SOURCES } from '../src/audio/radio.js';

function player(loadBuffer = async () => ({ duration: 80 })) {
  const loops = [];
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
  const radio = createAudioPlayer({
    loadBuffer,
    context: {
      createBufferSource: () => {
        const node = {
          connect() {},
          disconnect() {},
          start() {
            this.started = true;
          },
          stop() {
            this.stopped = true;
          },
        };
        loops.push(node);
        return node;
      },
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
  return { radio, media, pending, loops, created: () => created, disconnected: () => disconnected };
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

test('music and waves loop exclusively and stop before live radio starts', async () => {
  const p = player();
  for (const source of AUDIO_SOURCES) {
    p.radio.start(source);
    await Promise.resolve();
    if (source.loop) {
      assert.equal(p.loops.filter((node) => node.started && !node.stopped).length, 1);
      assert.equal(p.loops.at(-1).loop, true);
      assert.equal(p.created(), 0);
    } else {
      assert.equal(p.loops.filter((node) => node.started && !node.stopped).length, 0);
      assert.equal(p.created(), 1);
      assert.equal(p.media.src, source.url);
      p.media.onplaying();
    }
    assert.equal(p.radio.state, 'playing');
  }
  p.radio.dispose();
});

test('a late local decode never starts over a subsequently selected radio station', async () => {
  let resolve;
  const p = player(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  p.radio.start(AUDIO_SOURCES[0]);
  p.radio.start(RADIO_STATIONS[0]);
  p.media.onplaying();
  resolve({ duration: 80 });
  await Promise.resolve();
  assert.equal(p.loops.length, 0);
  assert.equal(p.radio.state, 'playing');
  assert.equal(p.media.src, RADIO_STATIONS[0].url);
  p.radio.dispose();
});

test('local playback reuses its decoded buffer after pause and releases it on disposal', async () => {
  let loads = 0;
  const p = player(async () => {
    loads++;
    return { duration: 80 };
  });
  p.radio.start(AUDIO_SOURCES[0]);
  await Promise.resolve();
  p.radio.stop();
  assert.equal(p.loops[0].stopped, true);
  p.radio.start(AUDIO_SOURCES[0]);
  await Promise.resolve();
  assert.equal(loads, 1);
  p.radio.dispose();
  assert.equal(p.loops[1].stopped, true);
});
