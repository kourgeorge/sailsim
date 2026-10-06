import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoatWake } from '../src/rendering/boat-wake.js';

function sail(wake, speed, seconds) {
  const state = { x: 0, z: 0, heading: 0, speed, speedOverGround: speed, capsized: false };
  for (let t = 0; t <= seconds; t += 1 / 30) {
    state.z = -t * speed * 0.514444;
    wake.update(state, t);
  }
  return wake;
}

function extent(wake) {
  const positions = wake.geometry.attributes.position.array,
    count = wake.geometry.drawRange.count / 3 + 2;
  let minZ = Infinity, maxZ = -Infinity, width = 0;
  for (let v = 0; v < count; v += 2) {
    minZ = Math.min(minZ, positions[v * 3 + 2]);
    maxZ = Math.max(maxZ, positions[v * 3 + 2]);
    width = Math.max(width, Math.abs(positions[v * 3] - positions[(v + 1) * 3]));
  }
  return { length: maxZ - minZ, width };
}

test('the wake stays where the boat passed and grows longer and wider with speed', () => {
  const slow = extent(sail(createBoatWake(), 2, 10)),
    fast = extent(sail(createBoatWake(), 7, 10));
  assert.ok(fast.length > slow.length * 2.5);
  assert.ok(fast.width > slow.width * 1.5);
  // Foam is laid in world space behind the moving stern, not carried along with it.
  const wake = sail(createBoatWake({ sternOffset: 6 }), 6, 4), positions = wake.geometry.attributes.position.array;
  const last = (wake.geometry.drawRange.count / 6) * 2;
  assert.ok(Math.abs(positions[last * 3 + 2] - 6) < 1.5);
  assert.ok(positions[2] < -6);
});

test('a stopped boat leaves no fresh foam and a jump clears the old trail', () => {
  const wake = sail(createBoatWake(), 6, 3);
  const strengths = wake.geometry.attributes.aStrength.array;
  assert.ok(strengths[0] > 0.7);
  wake.update({ x: 500, z: 500, heading: 0, speed: 0, speedOverGround: 0 }, 3.1);
  assert.ok(wake.geometry.attributes.aStrength.array[0] === 0);
  assert.equal(wake.visible, false);
});
