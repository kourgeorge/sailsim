import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PRACTICE_LOCATIONS as LOCATIONS } from '../src/locations.js';
import { initialState } from '../src/physics.js';
import { islandHeight, shoreScale } from '../src/rendering/geography.js';
import { seededRandom } from '../src/rendering/materials.js';
import { disposeSceneResources } from '../src/rendering/dispose.js';
import { createLandAnimals } from '../src/rendering/land-animals.js';
import {
  LAND_SPECIES,
  createLandEncounters,
  sampleLandAnimal,
} from '../src/world/land-encounters.js';
import { getCoastalFeatures, clearOfCoastalBuildings } from '../src/world/coastal-features.js';
import { inEncounterView } from '../src/world/encounter-view.js';

function shoreState(location, angle = 0) {
  const island = location.islands.at(location.id === 'fjord' ? -1 : 0);
  return Object.assign(initialState(location.id), {
    x: island.x + Math.cos(angle) * island.rx * 1.015 * shoreScale(angle),
    z: island.z + Math.sin(angle) * island.rz * 1.015 * shoreScale(angle),
  });
}

for (const location of LOCATIONS)
  test(`${location.id}: coastal animals use dry, clear paths, with singles and groups`, () => {
    const animals = createLandEncounters(location.id, { random: seededRandom(92) });
    const seen = new Set(),
      solo = new Set(),
      grouped = new Set(),
      events = new Set(),
      starts = [];
    const features = getCoastalFeatures(location.id);
    let quiet = 0;
    for (const angle of [0, Math.PI / 2]) {
      const state = shoreState(location, angle),
        before = structuredClone(state);
      for (let time = 0; time < 28800; time += 5) {
        const slots = animals.update(state, time);
        if (slots.every((slot) => !slot.event)) quiet++;
        for (const { event } of slots) {
          if (!event || events.has(event)) continue;
          events.add(event);
          seen.add(event.species);
          starts.push(event.start);
          (event.count === 1 ? solo : grouped).add(event.species);
          const species = LAND_SPECIES.find((s) => s.id === event.species);
          assert.ok(event.count >= 1 && event.count <= species.maxGroup);
          for (let age = 0; age <= event.duration; age += 2)
            for (let i = 0; i < event.count; i++) {
              const p = sampleLandAnimal(event, i, event.start + age);
              assert.ok(Object.values(p).every(Number.isFinite));
              const terrain = Math.max(
                ...location.islands.map((island) => islandHeight(p.x, p.z, island)),
              );
              assert.ok(terrain >= 1.5);
              assert.ok(Math.abs(p.y - terrain) < 0.055, 'feet follow the slope');
              assert.ok(clearOfCoastalBuildings(p.x, p.z, features));
              if (location.lighthouse)
                assert.ok(
                  Math.hypot(p.x - location.lighthouse.x, p.z - location.lighthouse.z) > 13,
                );
              assert.ok(p.fade >= 0 && p.fade <= 1);
              for (let j = i + 1; j < event.count; j++) {
                const other = sampleLandAnimal(event, j, event.start + age);
                assert.ok(Math.hypot(p.x - other.x, p.z - other.z) > species.radius * 2);
              }
              for (const offsetX of [-species.radius, species.radius])
                for (const offsetZ of [-species.radius, species.radius])
                  assert.ok(
                    Math.max(
                      ...location.islands.map((island) =>
                        islandHeight(p.x + offsetX, p.z + offsetZ, island),
                      ),
                    ) > 1.4,
                  );
            }
        }
      }
      assert.deepEqual(state, before, 'land wildlife never alters sailing physics');
    }
    const ids = LAND_SPECIES.map((s) => s.id).sort();
    assert.deepEqual([...seen].sort(), ids);
    assert.deepEqual([...solo].sort(), ids);
    assert.deepEqual([...grouped].sort(), ids);
    assert.ok(quiet > 300, 'sightings leave quiet intervals');
    const gaps = starts
      .slice(1)
      .map((t, i) => t - starts[i])
      .filter((gap) => gap > 0);
    assert.ok(Math.max(...gaps) > Math.min(...gaps) * 3);
  });

test('sightings stay on shore, follow the initial view and freeze on pause, rewind and teleport', () => {
  const location = LOCATIONS[0],
    state = shoreState(location, Math.PI / 2);
  let draws = 0;
  const random = seededRandom(92),
    animals = createLandEncounters(location.id, {
      random: () => {
        draws++;
        return random();
      },
    });
  const view = {
    position: { x: state.x, y: 3, z: state.z },
    direction: { x: 0, y: 0, z: -1 },
    fov: 72,
    aspect: 1.6,
  };
  let time = 0;
  while (time < 1200 && animals.slots.every((slot) => !slot.event))
    animals.update(state, time++, view);
  const event = animals.slots.find((slot) => slot.event)?.event;
  assert.ok(event);
  assert.ok(inEncounterView({ x: event.x, z: event.z, y: event.members[0].path[0].y }, view, 1.05));
  animals.update(state, time, view);
  const snapshot = structuredClone(animals.slots),
    drawsBefore = draws;
  for (let i = 0; i < 10; i++)
    animals.update(state, time, { ...view, direction: { x: 0, y: 0, z: 1 } });
  assert.deepEqual(animals.slots, snapshot);
  assert.equal(draws, drawsBefore);
  animals.update({ ...state, elapsed: -1 }, time + 1, view);
  assert.ok(animals.slots.every((slot) => !slot.event && slot.due > time + 1));
  animals.update(state, 0, view);
  assert.ok(animals.slots.every((slot) => !slot.event && slot.due > 0));
  const offshore = { ...state, x: 6000, z: 6000 };
  for (let t = 0; t < 3600; t++) {
    animals.update(offshore, t);
    assert.ok(animals.slots.every((slot) => !slot.event));
  }
});

test('foraging avoids scene obstacles across every member path', () => {
  const state = shoreState(LOCATIONS[0], Math.PI / 2),
    obstacles = [];
  for (let x = -410; x < -270; x += 9)
    for (let z = -230; z < -175; z += 9) obstacles.push({ x, z, radius: 1.5 });
  const animals = createLandEncounters('haven', { random: seededRandom(418), obstacles });
  let seen = 0;
  const events = new Set();
  for (let t = 0; t < 3600; t += 5)
    for (const { event } of animals.update(state, t)) {
      if (!event || events.has(event)) continue;
      events.add(event);
      seen++;
      const species = LAND_SPECIES.find((s) => s.id === event.species);
      for (const member of event.members)
        for (const p of member.path)
          assert.ok(
            obstacles.every(
              (obstacle) =>
                Math.hypot(p.x - obstacle.x, p.z - obstacle.z) > species.radius + obstacle.radius,
            ),
          );
    }
  assert.ok(seen > 5);
});

test('animal pools share one material, animate, pause, reduce mobile counts and dispose all resources', () => {
  const scene = new THREE.Scene(),
    state = shoreState(LOCATIONS[0], Math.PI / 2);
  const animals = createLandAnimals(scene, 'haven', { name: 'high' }, { random: seededRandom(92) });
  let maximum = 0,
    triangles = 0,
    time = 0,
    specimen;
  for (; time < 3600; time += 2) {
    animals.update(state, time);
    specimen ||= animals.encounters.slots.find((slot) => slot.event)?.event;
    const count = animals.group.children
      .filter((mesh) => mesh.name.endsWith('bodies'))
      .reduce((n, mesh) => n + mesh.count, 0);
    maximum = Math.max(maximum, count);
    assert.ok(count <= 12);
    const visible = animals.group.children.filter((mesh) => mesh.visible);
    assert.ok(visible.length <= 6);
    triangles = Math.max(
      triangles,
      visible.reduce(
        (sum, mesh) => sum + (mesh.geometry.attributes.position.count / 3) * mesh.count,
        0,
      ),
    );
    for (const mesh of visible) assert.ok([...mesh.instanceMatrix.array].every(Number.isFinite));
  }
  assert.ok(maximum >= 5);
  assert.ok(triangles < 18000);
  while (time < 4800 && animals.group.children.every((mesh) => !mesh.visible))
    animals.update(state, time++);
  const matrices = () => animals.group.children.map((mesh) => [...mesh.instanceMatrix.array]);
  animals.update(state, time);
  const paused = matrices();
  animals.update(state, time);
  assert.deepEqual(matrices(), paused);
  animals.update(state, time + 1);
  assert.notDeepEqual(matrices(), paused);
  animals.setQuality({ name: 'minimum' });
  for (let t = time + 2; t < time + 1800; t += 3) {
    animals.update(state, t);
    assert.ok(
      animals.group.children
        .filter((mesh) => mesh.name.endsWith('bodies'))
        .reduce((n, mesh) => n + mesh.count, 0) <= 6,
    );
  }
  // Force two full groups to exercise the limit even when this seed's natural
  // near-shore sightings happen to leave the second slot empty.
  const fullTime = time + 1800;
  animals.update(state, fullTime);
  for (const [index, slot] of animals.encounters.slots.entries()) {
    slot.event = {
      ...specimen,
      species: 'goat',
      start: fullTime - 20,
      count: 6,
      members: Array.from({ length: 6 }, (_, i) => ({
        ...specimen.members[0],
        path: specimen.members[0].path.map((p) => ({ ...p, x: p.x + i * 3 + index * 25 })),
      })),
    };
  }
  const countBodies = () =>
    animals.group.children
      .filter((mesh) => mesh.name.endsWith('bodies'))
      .reduce((n, mesh) => n + mesh.count, 0);
  animals.setQuality({ name: 'high' });
  animals.update(state, fullTime);
  assert.equal(countBodies(), 12);
  animals.setQuality({ name: 'minimum' });
  animals.update(state, fullTime);
  assert.equal(countBodies(), 6);
  const disposed = disposeSceneResources(scene);
  assert.equal(disposed.geometries, 15);
  assert.equal(disposed.materials, 1);
  assert.equal(disposed.textures, 0);
});
