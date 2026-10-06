import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PRACTICE_LOCATIONS as LOCATIONS } from '../src/locations.js';
import { depthAt } from '../src/water-depth.js';
import { initialState } from '../src/physics.js';
import { islandRatio } from '../src/rendering/geography.js';
import { createIslandTerrain, createShoreline } from '../src/rendering/shoreline.js';
import { getCoastalFeatures, clearOfCoastalBuildings } from '../src/world/coastal-features.js';
import { createMarineEncounters } from '../src/world/marine-encounters.js';
import { createMarineLife } from '../src/rendering/marine-life.js';
import { createCoastalVillage } from '../src/rendering/coastal-village.js';
import { disposeSceneResources } from '../src/rendering/dispose.js';

function randomSource(seed = 38) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

for (const location of LOCATIONS) {
  test(`${location.id}: detailed terrain follows the charted coast within the original triangle budget`, () => {
    for (const island of location.islands) {
      const geometry = createIslandTerrain(island),
        positions = geometry.attributes.position;
      assert.ok(geometry.index.count / 3 <= 8192);
      let shoreVertices = 0;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i),
          z = positions.getZ(i);
        if (Math.abs(islandRatio(x, z, island) - 1) < 1e-6) {
          shoreVertices++;
          assert.ok(Math.abs(positions.getY(i)) < 1e-5);
          assert.ok(depthAt(x, z, location.id) < 1e-4);
        }
      }
      assert.ok(shoreVertices >= 160);
      geometry.dispose();
    }
  });

  test(`${location.id}: cottages and chapel stand on land with a clearing around their footprints`, () => {
    const features = getCoastalFeatures(location.id);
    assert.equal(features.filter((feature) => feature.type === 'chapel').length, 1);
    assert.ok(features.filter((feature) => feature.type === 'house').length >= 8);
    for (const feature of features) {
      assert.equal(depthAt(feature.x, feature.z, location.id), 0);
      assert.ok(feature.y > 0 && feature.foundation > 0);
      assert.equal(clearOfCoastalBuildings(feature.x, feature.z, features), false);
      if (location.lighthouse)
        assert.ok(
          Math.hypot(feature.x - location.lighthouse.x, feature.z - location.lighthouse.z) > 12,
        );
    }
  });

  test(`${location.id}: occasional sightings stay in navigable water and leave gaps between encounters`, () => {
    const state = initialState(location.id),
      before = structuredClone(state);
    const encounters = createMarineEncounters(location.id, { random: randomSource() });
    const seen = new Set(),
      starts = { dolphin: [], fish: [], turtle: [] };
    let lastEvents = [];
    for (let time = 0; time < 43200; time += 5) {
      const slots = encounters.update(state, time);
      for (const { event } of slots) {
        if (!event || lastEvents.includes(event)) continue;
        seen.add(event.kind);
        starts[event.kind].push(event.start);
        for (let age = 0; age <= event.duration; age += 1) {
          const x = event.x + event.vx * age,
            z = event.z + event.vz * age;
          assert.ok(depthAt(x, z, location.id) >= (event.kind === 'dolphin' ? 4 : 2.5));
          assert.ok(Math.hypot(x - state.x, z - state.z) >= 13);
        }
      }
      lastEvents = slots.map((slot) => slot.event);
    }
    assert.deepEqual(
      [...seen].sort(),
      location.id === 'fjord' ? ['dolphin', 'fish'] : ['dolphin', 'fish', 'turtle'],
    );
    assert.ok(starts.fish.length > starts.dolphin.length * 2);
    assert.ok(starts.dolphin.length > starts.turtle.length);
    for (const [kind, times] of Object.entries(starts))
      for (let i = 1; i < times.length; i++)
        assert.ok(
          times[i] - times[i - 1] > (kind === 'dolphin' ? 120 : kind === 'turtle' ? 240 : 30),
        );
    assert.deepEqual(state, before, 'Cosmetic sightings never mutate physics or course state');
  });
}

test('marine sightings freeze with visual time and clear after resets and teleports', () => {
  const state = initialState(),
    source = randomSource();
  let draws = 0;
  const encounters = createMarineEncounters('haven', {
    random: () => {
      draws++;
      return source();
    },
  });
  for (let time = 0; time <= 25; time++) encounters.update(state, time);
  const frozen = structuredClone(encounters.slots),
    drawCount = draws;
  for (let i = 0; i < 30; i++) encounters.update(state, 25);
  assert.deepEqual(encounters.slots, frozen);
  assert.equal(draws, drawCount);
  encounters.update(state, 0);
  assert.ok(encounters.slots.every((slot) => slot.event === null && slot.due > 0));
  encounters.update({ ...state, x: state.x + 1000 }, 30);
  assert.ok(encounters.slots.every((slot) => slot.event === null && slot.due > 30));
});

test('wildlife uses fixed instance pools, reduces counts on low quality and disposes with the scene', () => {
  const scene = new THREE.Scene(),
    state = initialState();
  const marine = createMarineLife(scene, 'haven', { name: 'high' }, { random: randomSource() });
  let maxDolphins = 0,
    maxFish = 0;
  for (let time = 0; time < 1800; time += 0.5) {
    marine.update(state, time);
    const dolphins = scene.getObjectByName('Dolphins'),
      fish = scene.getObjectByName('Surface fish');
    maxDolphins = Math.max(maxDolphins, dolphins.count);
    maxFish = Math.max(maxFish, fish.count);
    assert.ok(dolphins.count <= 3 && fish.count <= 12);
    assert.ok(scene.getObjectByName('Sea turtles').count <= 1);
    assert.ok(scene.getObjectByName('Wildlife ripples').count <= 17);
    assert.ok(
      [...dolphins.instanceMatrix.array, ...fish.instanceMatrix.array].every(Number.isFinite),
    );
  }
  assert.equal(maxDolphins, 3);
  assert.equal(maxFish, 12);
  marine.setQuality({ name: 'minimum' });
  for (let time = 1800; time < 3600; time += 0.5) {
    marine.update(state, time);
    assert.ok(scene.getObjectByName('Dolphins').count <= 2);
    assert.ok(scene.getObjectByName('Surface fish').count <= 6);
  }
  const texture = new THREE.Texture();
  const shore = createShoreline(scene, LOCATIONS[0], texture);
  const village = createCoastalVillage(scene, getCoastalFeatures('haven'));
  assert.ok(village.geometry.index === null);
  assert.ok(village.geometry.attributes.position.count / 3 < 12000);
  assert.match(shore.mesh.material.fragmentShader, /hullExclusionActive/);
  const disposed = disposeSceneResources(scene);
  assert.equal(disposed.geometries, 7);
  assert.equal(disposed.materials, 4);
  assert.equal(disposed.textures, 1);
  assert.equal(scene.children.length, 0);
});
