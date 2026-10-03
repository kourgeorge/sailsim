import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderQuality, isMobileGraphicsDevice } from '../src/rendering/quality.js';

function runFrames(quality, durationMs, frameMs) {
  for (let elapsed = 0; elapsed < durationMs; elapsed += frameMs) quality.recordFrame(frameMs);
  return quality.current;
}

test('phones and tablets prioritize resolution over reflections, without affecting desktop detail', () => {
  const mobile = createRenderQuality({ touch: true, pixelRatio: 3 }).current;
  const desktop = createRenderQuality({ pixelRatio: 2 }).current;
  assert.equal(mobile.name, 'balanced');
  assert.equal(desktop.name, 'high');
  assert.equal(mobile.pixelRatio, 1.75);
  assert.equal(mobile.reflectionSize, 0);
  assert.equal(mobile.reflectionInterval, 0);
  assert.ok(mobile.shadowSize < desktop.shadowSize);
  assert.equal(desktop.pixelRatio, 2);
  assert.equal(desktop.reflectionSize, 512);
  assert.equal(desktop.reflectionInterval, 1);
  assert.equal(createRenderQuality({ pixelRatio: 1 }).current.pixelRatio, 1);
  assert.equal(createRenderQuality({ touch: true, pixelRatio: 1 }).current.pixelRatio, 1);
});

test('desktop keeps native resolution and original reflections through sustained slow frames', () => {
  const quality = createRenderQuality({ pixelRatio: 3 });
  const original = quality.current;
  runFrames(quality, 60000, 100);
  assert.equal(quality.current, original);
  assert.equal(original.pixelRatio, 3);
  assert.equal(original.reflectionSize, 512);
  assert.equal(original.reflectionInterval, 1);
  assert.equal(original.shadowSize, 1024);
  assert.equal(original.clouds, true);
});

test('touch desktops retain desktop graphics while phones and tablets use mobile graphics', () => {
  assert.equal(
    isMobileGraphicsDevice({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 10,
      coarsePointer: true,
      finePointer: true,
    }),
    false,
  );
  assert.equal(
    isMobileGraphicsDevice({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      platform: 'MacIntel',
      maxTouchPoints: 0,
      finePointer: true,
    }),
    false,
  );
  assert.equal(
    isMobileGraphicsDevice({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      platform: 'MacIntel',
      maxTouchPoints: 5,
      finePointer: true,
    }),
    true,
  );
  assert.equal(
    isMobileGraphicsDevice({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)' }),
    true,
  );
  assert.equal(
    isMobileGraphicsDevice({ userAgent: 'Mozilla/5.0 (Linux; Android 15)', finePointer: true }),
    true,
  );
  assert.equal(isMobileGraphicsDevice({ mobile: true }), true);
  assert.equal(isMobileGraphicsDevice({ coarsePointer: true }), true);
});

test('slowdowns well after startup progressively reduce work while keeping a resolution floor', () => {
  const quality = createRenderQuality({ touch: true, pixelRatio: 3 });
  runFrames(quality, 30000, 1000 / 60);
  assert.equal(quality.current.name, 'balanced');
  const reduced = runFrames(quality, 3500, 50);
  assert.equal(reduced.name, 'low');
  assert.equal(reduced.shadowSize, 0);
  assert.equal(reduced.clouds, false);
  assert.equal(reduced.pixelRatio, 1.5);
  assert.equal(reduced.reflectionSize, 0);
  const minimum = runFrames(quality, 30000, 50);
  assert.equal(minimum.name, 'minimum');
  assert.equal(minimum.pixelRatio, 1.25);
  assert.equal(minimum.reflectionSize, 0);
  assert.equal(minimum.reflectionInterval, 0);
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
  assert.equal(original.reflectionSize, 256);
  const mobile = createRenderQuality({ touch: true, software: true, pixelRatio: 3 });
  assert.equal(mobile.current.name, 'compatibility');
  assert.equal(mobile.current.reflectionSize, 0);
  assert.equal(mobile.current.reflectionInterval, 0);
  runFrames(mobile, 60000, 1000 / 60);
  assert.equal(mobile.current.reflectionSize, 0);
});
