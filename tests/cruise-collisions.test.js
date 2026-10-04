import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { initialState, step, groundVelocity } from '../src/physics.js';
import { detectContact } from '../src/collisions.js';
import {
  createCruiseBody,
  createCruiseEncounters,
  cruiseHullShape,
} from '../src/world/cruise-encounters.js';
import { createCruiseShip } from '../src/rendering/cruise-ship.js';
import { seededRandom } from '../src/rendering/materials.js';
import { disposeSceneResources } from '../src/rendering/dispose.js';

function contactFixture({ x = 2977, z = 3000, heading = 90, speed = 8, shipSpeed = 0 } = {}) {
  const body = createCruiseBody({ x: 3000, z: 3000, heading: 0, vx: 0, vz: -shipSpeed }, 'haven');
  const state = Object.assign(initialState(), {
    x,
    z,
    heading,
    speed,
    sails: 0,
    mainHoist: 0,
    jibHoist: 0,
    windSpeed: 0,
    currentSpeed: 0,
    worldBodies: [body],
  });
  return { state, body };
}

test('a yacht hits the cruise hull and cannot motor through its broadside', () => {
  const { state, body } = contactFixture();
  state.throttle = 1;
  for (let i = 0; i < 250; i++) step(state, 0.02);
  assert.ok(state.collisionCount > 0);
  assert.equal(state.collision.bodyId, body.id);
  assert.ok(state.collision.impulse > 1000);
  assert.ok(state.x < body.x - 14, 'the yacht stays outside the ship');
  assert.ok(Math.abs(body.x - 3000) < 0.1, 'the much heavier ship barely moves');
  assert.ok((detectContact(state._playerBody, body)?.penetration || 0) < 0.02);
});

test('a moving cruise bow transfers its ground velocity to a stopped yacht', () => {
  const { state, body } = contactFixture({
    x: 3000,
    z: 2897,
    heading: 0,
    speed: 0,
    shipSpeed: 4.6,
  });
  for (let i = 0; i < 200; i++) step(state, 0.02);
  assert.ok(state.collisionCount > 0);
  assert.ok(groundVelocity(state).z < -1, 'the passing bow pushes the yacht clear');
  assert.ok(body.vz < -4.59, 'the ship retains almost all its momentum');
  assert.ok((detectContact(state._playerBody, body)?.penetration || 0) < 0.02);
});

test('the rounded cruise bow is solid without a rectangular invisible wall', () => {
  const shape = cruiseHullShape();
  assert.equal(Math.min(...shape.vertices.map((p) => p[1])), -89);
  assert.equal(Math.max(...shape.vertices.map((p) => p[1])), 81);
  assert.equal(Math.max(...shape.vertices.map((p) => p[0])), 14);
  const { state, body } = contactFixture({ x: 3013, z: 2912, heading: 0, speed: 0 });
  step(state, 0.02);
  assert.equal(state.collisionCount, 0, 'water beside the narrow bow remains navigable');
  assert.equal(detectContact(state._playerBody, body), null);
});

test('encounters attach exactly one body and remove it on disable, world reset and disposal', () => {
  const state = initialState(),
    initialBodies = state.worldBodies.length;
  const encounters = createCruiseEncounters('haven', { random: seededRandom(681) });
  let time = 0;
  const spawn = () => {
    for (let end = time + 2400; time < end && !encounters.event; time++)
      encounters.update(state, time, null, true);
    assert.ok(encounters.event);
    assert.equal(state.worldBodies.length, initialBodies + 1);
    return encounters.event.body;
  };
  const first = spawn();
  for (let i = 0; i < 5; i++) encounters.update(state, time, null, true);
  assert.equal(state.worldBodies.filter((b) => b.id === first.id).length, 1);
  encounters.update(state, ++time, null, false);
  assert.equal(state.worldBodies.length, initialBodies);
  spawn();
  const oldBodies = state.worldBodies;
  state.worldBodies = initialState().worldBodies;
  encounters.update(state, ++time, null, true);
  assert.equal(oldBodies.length, initialBodies);
  assert.equal(encounters.event, null);
  spawn();
  encounters.dispose();
  assert.equal(state.worldBodies.length, initialBodies);
});

test('the visible ship follows its solved position and pauses with physics', () => {
  const scene = new THREE.Scene(),
    state = initialState();
  const ship = createCruiseShip(scene, 'haven', { name: 'minimum' }, { random: seededRandom(681) });
  let time = 0;
  while (time < 2400 && !ship.encounters.event) ship.update(state, time++, null, true);
  const body = ship.encounters.event.body;
  const before = { x: body.x, z: body.z };
  step(state, 0.2);
  ship.update(state, time + 0.2, null, true);
  assert.ok(Math.hypot(body.x - before.x, body.z - before.z) > 0.9);
  assert.equal(ship.group.position.x, body.x);
  assert.equal(ship.group.position.z, body.z);
  assert.equal(ship.group.rotation.y, (-body.heading * Math.PI) / 180);
  const frozen = structuredClone(body);
  for (let i = 0; i < 5; i++) ship.update(state, time + 0.2, null, true);
  assert.deepEqual(body, frozen);
  ship.dispose();
  assert.equal(
    state.worldBodies.some((b) => b.id === body.id),
    false,
  );
  disposeSceneResources(scene);
});
