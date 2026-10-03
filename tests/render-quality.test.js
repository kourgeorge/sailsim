import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderQuality } from '../src/rendering/quality.js';

function runFrames(quality, durationMs, frameMs) {
  for (let elapsed = 0; elapsed < durationMs; elapsed += frameMs) quality.recordFrame(frameMs);
  return quality.current;
}

test('phones and tablets start with a smaller graphics budget, without affecting desktop detail', () => {
  const mobile = createRenderQuality({ touch: true, pixelRatio: 3 }).current;
  const desktop = createRenderQuality({ pixelRatio: 2 }).current;
  assert.equal(mobile.name, 'balanced');
  assert.equal(desktop.name, 'high');
  assert.ok(mobile.pixelRatio < desktop.pixelRatio);
  assert.ok(mobile.reflectionSize < desktop.reflectionSize);
  assert.ok(mobile.shadowSize < desktop.shadowSize);
  assert.ok(mobile.reflectionInterval > desktop.reflectionInterval);
  assert.equal(createRenderQuality({ pixelRatio: 1 }).current.pixelRatio, 1);
});

test('slowdowns well after startup progressively reduce work while keeping a resolution floor', () => {
  const quality = createRenderQuality({ touch: true, pixelRatio: 3 });
  runFrames(quality, 30000, 1000 / 60);
  assert.equal(quality.current.name, 'balanced');
  const reduced = runFrames(quality, 3500, 50);
  assert.equal(reduced.name, 'low');
  assert.equal(reduced.shadowSize, 0);
  assert.equal(reduced.clouds, false);
  const minimum = runFrames(quality, 30000, 50);
  assert.equal(minimum.name, 'minimum');
  assert.ok(minimum.pixelRatio >= 0.8);
  assert.ok(minimum.reflectionInterval > reduced.reflectionInterval);
});

test('one hitch does not blur the scene or toggle rendering features', () => {
  const quality = createRenderQuality({ touch: true });
  runFrames(quality, 5000, 1000 / 60);
  const original = quality.current;
  quality.recordFrame(200);
  runFrames(quality, 10000, 1000 / 60);
  assert.equal(quality.current, original);
});

test('regular missed frames trigger adaptation even when average FPS looks acceptable', () => {
  const quality = createRenderQuality({ touch: true });
  for (let i = 0; i < 180; i++) quality.recordFrame(i % 2 ? 1000 / 30 : 1000 / 60);
  assert.equal(quality.current.name, 'low');
});

test('paused views, resumed tabs, and resizes do not count as poor rendering performance', () => {
  const quality = createRenderQuality({ touch: true });
  const original = quality.current;
  for (let i = 0; i < 5; i++) {
    runFrames(quality, 1500, 50);
    quality.resetTiming();
    quality.recordFrame(null);
    quality.recordFrame(10000);
  }
  assert.equal(quality.current, original);
  runFrames(quality, 5000, 1000 / 60);
  assert.equal(quality.current, original);
});

test('detail recovers only after sustained headroom and stays within the mobile budget', () => {
  const quality = createRenderQuality({ touch: true });
  runFrames(quality, 3500, 50);
  assert.equal(quality.current.name, 'low');
  runFrames(quality, 8000, 1000 / 60);
  assert.equal(quality.current.name, 'low');
  runFrames(quality, 10000, 25);
  assert.equal(quality.current.name, 'low');
  runFrames(quality, 20000, 1000 / 60);
  assert.equal(quality.current.name, 'balanced');
  runFrames(quality, 60000, 1000 / 60);
  assert.equal(quality.current.name, 'balanced');
});

test('software rendering keeps its compatibility budget', () => {
  const quality = createRenderQuality({ software: true, pixelRatio: 2 });
  const original = quality.current;
  assert.equal(original.name, 'compatibility');
  assert.equal(original.shadowSize, 0);
  runFrames(quality, 60000, 1000 / 60);
  runFrames(quality, 60000, 100);
  assert.equal(quality.current, original);
});
