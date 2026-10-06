import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { initialState } from '../src/physics.js';
import { LOCATIONS, getLocation } from '../src/locations.js';
import { depthAt } from '../src/water-depth.js';
import { islandHeight } from '../src/rendering/geography.js';
import { seededRandom } from '../src/rendering/materials.js';
import { createMarineEncounters } from '../src/world/marine-encounters.js';
import { createBirdEncounters, sampleBirdFlight } from '../src/world/bird-encounters.js';
import { inEncounterView } from '../src/world/encounter-view.js';
import { createCruiseEncounters } from '../src/world/cruise-encounters.js';
import { createCruiseShip } from '../src/rendering/cruise-ship.js';
import { createLandDetails } from '../src/rendering/land-details.js';
import { createMarineLife } from '../src/rendering/marine-life.js';
import { createSecretTaps } from '../src/world/secret-taps.js';
import { disposeSceneResources } from '../src/rendering/dispose.js';

function cameraView(state, heading = 0) {
  const h = (heading * Math.PI) / 180;
  return {
    position: { x: state.x, y: 3, z: state.z },
    direction: { x: Math.sin(h), y: 0, z: -Math.cos(h) },
    fov: 72,
    aspect: 1.6,
  };
}

test('close wildlife uses the actual view, including looking behind, and stays fixed after a camera turn', () => {
  const state = initialState();
  for (const heading of [0, 90, 180, 270]) {
    const view = cameraView(state, heading),
      marine = createMarineEncounters('haven', { random: seededRandom(41) });
    marine.update(state, 0, view);
    assert.equal(marine.summon(state, 1, view), true);
    const event = marine.slots.find((slot) => slot.event).event;
    assert.ok(inEncounterView({ ...event, y: 0 }, view));
    assert.ok(Math.hypot(event.x - state.x, event.z - state.z) < 31);
    const before = structuredClone(event);
    marine.update(state, 1, cameraView(state, heading + 180));
    assert.deepEqual(event, before);
  }
});

test('the secret immediately surfaces each marine species while the simulation is paused', () => {
  const scene = new THREE.Scene(),
    state = initialState(),
    view = cameraView(state);
  const marine = createMarineLife(scene, 'haven', { name: 'high' }, { random: seededRandom(271) });
  marine.update(state, 0, view);
  const seen = new Set(),
    matrix = new THREE.Matrix4(),
    position = new THREE.Vector3();
  for (let i = 0; i < 30; i++) {
    for (const slot of marine.encounters.slots) slot.event = null;
    assert.ok(marine.encounters.summon(state, 0, view));
    marine.update(state, 0, view);
    const event = marine.encounters.slots.find((slot) => slot.event).event;
    seen.add(event.kind);
    const name = { dolphin: 'Dolphins', fish: 'Surface fish', turtle: 'Sea turtles' }[event.kind];
    const mesh = scene.getObjectByName(name);
    assert.ok(mesh.count > 0);
    mesh.getMatrixAt(0, matrix);
    position.setFromMatrixPosition(matrix);
    assert.ok(position.y > 0, `${event.kind} must surface immediately`);
    const before = [...mesh.instanceMatrix.array];
    marine.update(state, 0, view);
    assert.deepEqual([...mesh.instanceMatrix.array], before);
  }
  assert.deepEqual([...seen].sort(), ['dolphin', 'fish', 'turtle']);
  disposeSceneResources(scene);
});

test('birds make occasional close passes and complete a coastal landing with a pause on land', () => {
  const state = Object.assign(initialState(), { x: -110, z: -290 }),
    birds = createBirdEncounters('haven', { random: seededRandom(72) });
  let landed = 0,
    close = 0;
  const events = new Set();
  for (let time = 0; time < 1800; time++)
    for (const { event } of birds.update(state, time)) {
      if (!event || events.has(event)) continue;
      events.add(event);
      if (event.close) close++;
      if (!event.landing) continue;
      landed++;
      const resting = sampleBirdFlight(event, 0, event.start + 19),
        restingLater = sampleBirdFlight(event, 0, event.start + 24);
      assert.deepEqual(resting, restingLater);
      assert.equal(resting.perched, 1);
      assert.equal(depthAt(resting.x, resting.z, 'haven'), 0);
      for (let age = 0; age < event.duration; age += 0.1) {
        const p = sampleBirdFlight(event, 0, event.start + age);
        for (const island of getLocation('haven').islands)
          assert.ok(p.y > islandHeight(p.x, p.z, island) + 0.1);
      }
      assert.ok(sampleBirdFlight(event, 0, event.start + 35).y > resting.y + 5);
    }
  assert.ok(landed > 0);
  assert.ok(close > 0);
  assert.ok(close < events.size * 0.6);
});

for (const location of LOCATIONS)
  test(`${location.id}: cruise ships only enter in free sailing on a deep, clear route`, () => {
    const state = initialState(location.id),
      before = structuredClone(state);
    const encounters = createCruiseEncounters(location.id, { random: seededRandom(681) });
    for (let time = 0; time < 200; time++)
      assert.equal(encounters.update(state, time, null, false), null);
    let seen = null;
    for (let time = 200; time < 2400; time++) {
      const event = encounters.update(state, time, null, true);
      if (event) {
        seen = event;
        break;
      }
    }
    // A real lagoon or small anchorage need not have room for a cruise ship.
    if (location.coordinates && !seen) {
      assert.deepEqual(state,before);
      return;
    }
    assert.ok(seen, 'A navigable passage can be found');
    assert.ok(seen.decks >= 5 && seen.decks <= 10);
    for (let age = -20; age < seen.duration + 20; age += 1) {
      const x = seen.x + seen.vx * age,
        z = seen.z + seen.vz * age;
      for (const side of [-14, 14])
        assert.ok(
          depthAt(
            x + Math.cos(seen.heading) * side,
            z + Math.sin(seen.heading) * side,
            location.id,
          ) >= 8,
        );
      assert.ok(Math.hypot(x - state.x, z - state.z) > 120);
    }
    const frozen = structuredClone(seen);
    for (let i = 0; i < 20; i++) encounters.update(state, seen.start, null, true);
    assert.deepEqual(seen, frozen);
    assert.equal(encounters.update(state, seen.start + 1, null, false), null);
    assert.deepEqual(state, before);
  });

test('scenic meshes have bounded geometry, reduce mobile counts and dispose without textures', () => {
  const scene = new THREE.Scene(),
    land = createLandDetails(scene, getLocation('fjord'));
  assert.ok(land.flowers.count > 0);
  assert.ok(land.falls);
  const high = land.flowers.count;
  land.setQuality({ name: 'minimum' });
  assert.ok(land.flowers.count < high);
  const ship = createCruiseShip(scene, 'haven', { name: 'high' }, { random: seededRandom(681) }),
    state = initialState();
  for (let time = 0; time < 1600 && !ship.group.visible; time++)
    ship.update(state, time, null, true);
  assert.ok(ship.group.visible);
  assert.equal(ship.group.children.length, 3);
  assert.equal(scene.getObjectByName('Cruise tourists').count, 48);
  const event = ship.encounters.event;
  ship.setQuality({ name: 'minimum' });
  ship.update(state, event.start, null, true);
  assert.equal(scene.getObjectByName('Cruise tourists').count, 16);
  let triangles = 0;
  scene.traverse((mesh) => {
    if (mesh.isMesh)
      triangles +=
        ((mesh.geometry.index?.count || mesh.geometry.attributes.position.count) / 3) *
        (mesh.isInstancedMesh ? mesh.count : 1);
  });
  assert.ok(triangles < 45000, `${triangles} triangles for scenery`);
  const disposed = disposeSceneResources(scene);
  assert.equal(disposed.textures, 0);
});

test('five consecutive mouse or touch taps reveal one animal; drags, holds, cancellation and gaps do not', () => {
  for (const pointerType of ['mouse', 'touch']) {
    let count = 0;
    const taps = createSecretTaps(() => count++);
    const event = (time, x = 20) => ({
      pointerId: 1,
      isPrimary: true,
      button: 0,
      clientX: x,
      clientY: 30,
      timeStamp: time,
      pointerType,
    });
    for (let i = 0; i < 5; i++) {
      taps.down(event(i * 120));
      taps.up(event(i * 120 + 40));
    }
    assert.equal(count, 1);
    for (let i = 0; i < 4; i++) {
      taps.down(event(1000 + i * 120));
      taps.up(event(1040 + i * 120));
    }
    taps.down(event(1500));
    taps.move(event(1520, 45));
    taps.up(event(1540, 45));
    assert.equal(count, 1);
    taps.down(event(2000));
    taps.up(event(2500));
    taps.down(event(2700));
    taps.cancel();
    taps.up(event(2750));
    for (let i = 0; i < 5; i++) {
      taps.down(event(3000 + i * 800));
      taps.up(event(3040 + i * 800));
    }
    assert.equal(count, 1);
  }
});
