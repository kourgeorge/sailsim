import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, step } from '../src/physics.js';
import { LOCATIONS } from '../src/locations.js';
import { depthAt } from '../src/water-depth.js';
import { advanceFreeBodies, detectContact, createRigidBody } from '../src/collisions.js';
import {
  addFreeSailingTraffic,
  advanceFreeSailingTraffic,
} from '../src/world/free-sailing-traffic.js';

for (const location of LOCATIONS) {
  test(`${location.id}: free sailing adds a sparse mixed fleet with navigable physical routes`, () => {
    const state = initialState(location.id);
    assert.equal(state.worldBodies.filter((body) => body.traffic).length, 0);
    addFreeSailingTraffic(state);
    addFreeSailingTraffic(state);
    const fleet = state.worldBodies.filter((body) => body.traffic);
    if (location.coordinates) assert.ok(fleet.length >= 1 && fleet.length <= location.character.traffic);
    else assert.equal(fleet.length, 4);
    assert.equal(fleet.filter((body) => body.visual.vesselId === 'catamaran').length, Math.floor(fleet.length / 2));
    for (const boat of fleet) {
      assert.ok(boat.mass > 5000);
      assert.ok(Math.hypot(boat.x - state.x, boat.z - state.z) > 100);
      for (const other of fleet)
        if (boat !== other) assert.ok(Math.hypot(boat.x - other.x, boat.z - other.z) > 100);
    }
    const start = fleet.map((body) => ({ x: body.x, z: body.z }));
    for (let i = 0; i < 4500; i++) {
      advanceFreeSailingTraffic(state, 0.1);
      advanceFreeBodies(fleet, 0.1);
      state.elapsed += 0.1;
      for (const boat of fleet) {
        assert.ok(depthAt(boat.x, boat.z, location.id) > boat.traffic.draft + 1);
        assert.ok(Math.hypot(boat.vx, boat.vz) < 2);
        assert.ok(Math.abs(boat.yawRate) <= 4);
      }
    }
    fleet.forEach((body, i) => {
      if (body.traffic.route) assert.ok(Math.hypot(body.x - start[i].x, body.z - start[i].z) > 5);
      else assert.ok(Math.hypot(body.x - body.mooring.x, body.z - body.mooring.z) < 10);
    });
  });
}

for (const vesselId of ['monohull', 'catamaran']) {
  test(`contact with a traffic ${vesselId} transfers momentum without overriding the impact`, () => {
    const state = initialState();
    addFreeSailingTraffic(state);
    const target = state.worldBodies.find(
      (body) => body.traffic && body.visual.vesselId === vesselId,
    );
    target.heading = 0;
    Object.assign(state, {
      x: target.x - 18,
      z: target.z - 2,
      heading: 90,
      speed: 5,
      windSpeed: 0,
      currentSpeed: 0,
      sails: 0,
      mainHoist: 0,
      jibHoist: 0,
    });
    const before = { x: target.x, z: target.z };
    for (let i = 0; i < 200 && !target.lastImpact; i++) step(state, 0.05);
    assert.equal(state.collision?.bodyId, target.id);
    assert.ok(state.collision.impulse > 0);
    assert.ok(state.speed < 5);
    assert.ok(target.lastImpact?.impulse > 0);
    for (let i = 0; i < 10; i++) step(state, 0.05);
    assert.ok(Math.hypot(target.x - before.x, target.z - before.z) > 0.03);
    assert.ok(Math.abs(target.yawRate) > 0.01);
  });
}

test('traffic catamarans have two physical hulls with water between them', () => {
  const state = initialState();
  addFreeSailingTraffic(state);
  const cat = state.worldBodies.find(
    (body) => body.traffic && body.visual.vesselId === 'catamaran',
  );
  cat.heading = 0;
  const marker = createRigidBody({
    id: 'marker',
    kind: 'fixed',
    x: cat.x,
    z: cat.z,
    shape: { type: 'circle', radius: 0.2 },
  });
  assert.equal(detectContact(cat, marker), null);
  marker.x = cat.x + 2.5;
  assert.ok(detectContact(cat, marker));
});
