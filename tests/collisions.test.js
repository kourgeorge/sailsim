import test from 'node:test';
import assert from 'node:assert/strict';
import { createRigidBody, detectContact, resolveContact, stepRigidBodies, PLAYER_HULL, separatedBeyond } from '../src/collisions.js';

const body = (id, patch = {}) => createRigidBody({ id, kind: 'free', mass: 1000, shape: { type: 'box', beam: 2, length: 4 }, x: 0, z: 0, vx: 0, vz: 0, heading: 0, restitution: 0, friction: 0, linearDamping: 0, angularDamping: 0, ...patch });
const near = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) <= tolerance, `${a} ≉ ${b}`);
const kinetic = bodies => bodies.reduce((sum, b) => sum + .5 * b.mass * (b.vx ** 2 + b.vz ** 2) + .5 * b.inertia * (b.yawRate * Math.PI / 180) ** 2, 0);

test('finite hull bow and rotated footprint collide before centers touch', () => {
  const yacht = body('yacht', { shape: PLAYER_HULL });
  const obstacle = body('obstacle', { kind: 'fixed', z: -6.55, shape: { type: 'box', length: .3, beam: .5 } });
  assert.ok(detectContact(yacht, obstacle));
  obstacle.z = -7; assert.equal(detectContact(yacht, obstacle), null);
  yacht.heading = 90; obstacle.x = 6.55; obstacle.z = 0;
  assert.ok(detectContact(yacht, obstacle));
});

test('contact episode clearance uses hull edges rather than elapsed time or center distance', () => {
  const a = body('a'), b = body('b', { x: 2.1 });
  assert.equal(detectContact(a, b), null);
  assert.equal(separatedBeyond(a, b), false);
  b.x = 2.16;
  assert.equal(separatedBeyond(a, b), true);
  a.heading = 90; b.heading = 90; b.x = 0; b.z = 2.1;
  assert.equal(separatedBeyond(a, b), false);
  b.z = 2.16;
  assert.equal(separatedBeyond(a, b), true);
});

test('centered unequal-mass collision conserves momentum with low restitution and no spurious spin', () => {
  const a = body('a', { x: -1.9, vx: 2, mass: 1000, restitution: .1 });
  const b = body('b', { mass: 3000, restitution: .1 });
  const energy = kinetic([a, b]);
  resolveContact(a, b, detectContact(a, b));
  near(a.mass * a.vx + b.mass * b.vx, 2000);
  near(b.vx - a.vx, .2);
  near(a.yawRate, 0); near(b.yawRate, 0);
  assert.ok(kinetic([a, b]) < energy);
  assert.ok(b.vx > 0, 'struck movable vessel must react');
});

test('off-center impact rotates both hulls with mirror-symmetric response', () => {
  const results = [];
  for (const side of [-1, 1]) {
    const a = body('a', { x: -1.9, z: side * 1.3, vx: 2, shape: { type: 'box', length: 2, beam: 2 } });
    const b = body('b');
    const energy = kinetic([a, b]);
    resolveContact(a, b, detectContact(a, b));
    assert.ok(Math.abs(a.yawRate) > .1); assert.ok(Math.abs(b.yawRate) > .1);
    near(a.mass * a.vx + b.mass * b.vx, 2000);
    assert.ok(kinetic([a, b]) < energy);
    results.push([a.yawRate, b.yawRate, a.vx, b.vx]);
  }
  near(results[0][0], -results[1][0]); near(results[0][1], -results[1][1]);
  near(results[0][2], results[1][2]); near(results[0][3], results[1][3]);
});

test('fixed piers remain fixed and separating overlaps do not receive another normal impulse', () => {
  const a = body('yacht', { x: -1.9, vx: 2, vz: 1, friction: .4 });
  const pier = body('pier', { kind: 'fixed', friction: .4 });
  const original = { x: pier.x, z: pier.z, heading: pier.heading, vx: pier.vx, vz: pier.vz };
  const result = resolveContact(a, pier, detectContact(a, pier));
  assert.ok(result.impulse > 0); assert.ok(Math.abs(a.vx) < 2); assert.ok(Math.abs(a.vz) < 1);
  assert.deepEqual({ x: pier.x, z: pier.z, heading: pier.heading, vx: pier.vx, vz: pier.vz }, original);
  const left = body('left', { x: -1.9, vx: -1 }), right = body('right', { vx: 1 });
  const separation = resolveContact(left, right, detectContact(left, right));
  assert.equal(separation.impulse, 0); near(left.vx, -1); near(right.vx, 1);
});

test('adaptive substeps prevent a fast hull tunnelling through a thin pier', () => {
  const a = body('fast', { x: -10, vx: 80, shape: { type: 'box', length: 2, beam: 1 }, restitution: .05 });
  const pier = body('pier', { kind: 'fixed', shape: { type: 'box', length: 30, beam: .2 }, restitution: .05 });
  const events = stepRigidBodies([a, pier], .25);
  assert.ok(events.length > 0);
  assert.ok(a.x < 0, `vessel crossed pier: ${a.x}`);
  assert.ok(a.vx <= .01);
  near(pier.x, 0);
});

test('two moving vessels exchange impulse and the isolated solution is Galilean invariant', () => {
  const run = drift => {
    const a = body('a', { x: -1.9, vx: 2 + drift.x, vz: drift.z });
    const b = body('b', { vx: -1 + drift.x, vz: drift.z });
    resolveContact(a, b, detectContact(a, b));
    return { a, b };
  };
  const base = run({ x: 0, z: 0 }), translated = run({ x: 3, z: -2 });
  near(base.a.vx, .5); near(base.b.vx, .5);
  near(translated.a.vx - 3, base.a.vx); near(translated.b.vx - 3, base.b.vx);
  near(translated.a.vz + 2, base.a.vz); near(translated.b.vz + 2, base.b.vz);
});

test('moored buoys move on impact, remain restrained, and settle without teleporting to the anchor', () => {
  const yacht = body('yacht', { x: -1.4, vx: 2, mass: 5600, shape: { type: 'box', length: 3, beam: 2 }, linearDamping: .15 });
  const buoy = body('buoy', { kind: 'moored', mass: 250, shape: { type: 'circle', radius: .6 }, linearDamping: .7, angularDamping: .7, mooring: { x: 0, z: 0, slack: .5, maxRadius: 3, stiffness: 600, damping: 300 } });
  const events = stepRigidBodies([yacht, buoy], .2);
  assert.ok(events.length); assert.ok(buoy.x > .05); assert.ok(buoy.vx > 0);
  yacht.x = -100; yacht.vx = 0;
  const displaced = buoy.x;
  for (let i = 0; i < 500; i++) stepRigidBodies([buoy], .02);
  assert.ok(Math.hypot(buoy.x, buoy.z) <= 3.0001);
  assert.ok(Math.abs(buoy.x) < displaced + 1);
  assert.ok(Math.hypot(buoy.vx, buoy.vz) < .05);
});

test('contact simulation is reproducible and frame partitions converge', () => {
  const run = dt => {
    const a = body('a', { x: -5, vx: 2, z: .7 }), b = body('b', { mass: 2000 });
    for (let t = 0; t < 3 - 1e-9; t += dt) stepRigidBodies([a, b], Math.min(dt, 3 - t));
    return [a, b];
  };
  assert.deepEqual(run(.1), run(.1));
  const a = run(.02), b = run(.1);
  for (let i = 0; i < 2; i++) for (const key of ['x', 'z', 'vx', 'vz', 'heading', 'yawRate']) near(a[i][key], b[i][key], 1e-6);
});

test('berth heading restraint permits impact rotation and then restores orientation',()=>{
  const yacht=body('berthed',{kind:'moored',heading:0,yawRate:18,mooring:{x:0,z:0,slack:1,maxRadius:2.5,heading:0},angularDamping:.1});
  stepRigidBodies([yacht],1);const initialAngle=yacht.heading;
  assert.ok(initialAngle>5&&initialAngle<30,'lines must not lock the hull heading');
  for(let i=0;i<3000;i++)stepRigidBodies([yacht],.02);
  const error=((yacht.heading+180)%360)-180;
  assert.ok(Math.abs(error)<.5);assert.ok(Math.abs(yacht.yawRate)<.1);
});
