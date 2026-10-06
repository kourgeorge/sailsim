import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PRACTICE_LOCATIONS as LOCATIONS } from '../src/locations.js';
import { initialState } from '../src/physics.js';
import { islandHeight } from '../src/rendering/geography.js';
import {
  BIRD_SPECIES,
  BIRD_FORMATIONS,
  birdOffset,
  createBirdEncounters,
  sampleBirdFlight,
} from '../src/world/bird-encounters.js';
import { createBirdLife } from '../src/rendering/bird-life.js';
import { disposeSceneResources } from '../src/rendering/dispose.js';

function randomSource(seed = 83) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

test('four distinct coastal species have natural solo and flock configurations', () => {
  assert.deepEqual(
    BIRD_SPECIES.map((bird) => bird.id),
    ['eagle', 'gull', 'cormorant', 'tern'],
  );
  assert.deepEqual(BIRD_FORMATIONS, ['soaring', 'pair', 'v', 'loose']);
  assert.equal(new Set(BIRD_SPECIES.map((bird) => bird.span)).size, 4);
  assert.equal(new Set(BIRD_SPECIES.map((bird) => bird.flapRate)).size, 4);
  assert.deepEqual(BIRD_SPECIES[0].formations, ['soaring', 'pair']);
  const v = Array.from({ length: 9 }, (_, i) => birdOffset('v', i));
  assert.deepEqual(v[0], { across: 0, behind: 0 });
  for (let i = 1; i < v.length; i += 2) {
    assert.equal(v[i].across, -v[i + 1].across);
    assert.equal(v[i].behind, v[i + 1].behind);
  }
  const loose = Array.from({ length: 12 }, (_, i) => birdOffset('loose', i, 1.4));
  for (let i = 0; i < loose.length; i++)
    for (let j = i + 1; j < loose.length; j++)
      assert.ok(
        Math.hypot(loose[i].across - loose[j].across, loose[i].behind - loose[j].behind) > 1.6,
      );
});

for (const location of LOCATIONS)
  test(`${location.id}: varied bird encounters clear the terrain and leave the simulation untouched`, () => {
    const encounters = createBirdEncounters(location.id, { random: randomSource() });
    const state = initialState(location.id),
      before = structuredClone(state);
    const species = new Set(),
      formations = new Set(),
      events = new Set();
    const pose = {};
    let empty = 0;
    // Rare species are no longer guaranteed on a short sail.
    for (let time = 0; time < 43200; time += 5) {
      const slots = encounters.update(state, time);
      if (slots.every((slot) => !slot.event)) empty++;
      for (const { event } of slots) {
        if (!event || events.has(event)) continue;
        events.add(event);
        species.add(event.species);
        formations.add(event.formation);
        assert.ok(
          BIRD_SPECIES.find((bird) => bird.id === event.species).formations.includes(
            event.formation,
          ),
        );
        for (let age = 0; age < event.duration; age += 0.5)
          for (let i = 0; i < event.count; i++) {
            sampleBirdFlight(event, i, event.start + age, pose);
            assert.ok(Object.values(pose).every(Number.isFinite));
            for (const island of location.islands)
              assert.ok(pose.y > islandHeight(pose.x, pose.z, island) + (event.landing ? 0.1 : 8));
          }
      }
    }
    assert.deepEqual([...species].sort(), BIRD_SPECIES.map((bird) => bird.id).sort());
    assert.deepEqual([...formations].sort(), [...BIRD_FORMATIONS].sort());
    assert.ok(empty > 20, 'Passing groups leave intervals of quiet sky');
    assert.deepEqual(state, before);
  });

test('bird clocks freeze when paused and reset cleanly after rewind, restart and teleport', () => {
  const state = initialState(),
    random = randomSource();
  let draws = 0;
  const encounters = createBirdEncounters('haven', {
    random: () => {
      draws++;
      return random();
    },
  });
  for (let time = 0; time <= 25; time++) {
    state.elapsed = time;
    encounters.update(state, time);
  }
  const frozen = structuredClone(encounters.slots),
    count = draws;
  for (let i = 0; i < 30; i++) encounters.update(state, 25);
  assert.deepEqual(encounters.slots, frozen);
  assert.equal(draws, count);
  encounters.update({ ...state, elapsed: 0 }, 26);
  assert.ok(encounters.slots.every((slot) => slot.event === null && slot.due > 26));
  encounters.update(state, 0);
  assert.ok(encounters.slots.every((slot) => slot.event === null));
  encounters.update({ ...state, x: 1000 }, 30);
  assert.ok(encounters.slots.every((slot) => slot.event === null && slot.due > 30));
});

test('bird pools cap total flock size, animate wings, obey pause and share one material', () => {
  const scene = new THREE.Scene(),
    state = initialState();
  const birds = createBirdLife(scene, 'haven', { name: 'high' }, { random: randomSource() });
  let maximum = 0;
  for (let time = 0; time <= 900; time += 0.5) {
    birds.update(state, time);
    const bodies = birds.group.children.filter((mesh) => mesh.name.endsWith('bodies'));
    const count = bodies.reduce((sum, mesh) => sum + mesh.count, 0);
    maximum = Math.max(maximum, count);
    assert.ok(count <= 18);
    assert.ok(birds.group.children.filter((mesh) => mesh.visible).length <= 6);
    for (const mesh of birds.group.children)
      assert.ok([...mesh.instanceMatrix.array].every(Number.isFinite));
  }
  assert.ok(maximum >= 10);
  const before = birds.group.children.map((mesh) => [...mesh.instanceMatrix.array]);
  birds.update(state, 900);
  assert.deepEqual(
    birds.group.children.map((mesh) => [...mesh.instanceMatrix.array]),
    before,
  );
  birds.setQuality({ name: 'minimum' });
  for (let time = 901; time <= 1800; time++) {
    birds.update(state, time);
    const count = birds.group.children
      .filter((mesh) => mesh.name.endsWith('bodies'))
      .reduce((sum, mesh) => sum + mesh.count, 0);
    assert.ok(count <= 6);
  }
  const disposed = disposeSceneResources(scene);
  assert.equal(disposed.geometries, 12);
  assert.equal(disposed.materials, 1);
  assert.equal(disposed.textures, 0);
});
