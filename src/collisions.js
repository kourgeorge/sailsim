// Deterministic horizontal rigid-body contacts, in metres, seconds and kilograms.
// Headings/yaw rates are clockwise from north in degrees; +x east, +z south.
// This models contact momentum and simple water/mooring resistance, not hull damage or CFD.
import { getWorldBodyDefinitions, yachtHullShape } from './world/bodies.js';
const RAD = Math.PI / 180;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const cross = (a, b) => a.x * b.z - a.z * b.x;
const dot = (a, b) => a.x * b.x + a.z * b.z;
const sub = (a, b) => ({ x: a.x - b.x, z: a.z - b.z });
const fixed = body => body.kind === 'fixed' || body.grounded === true;
const inverseMass = body => fixed(body) ? 0 : 1 / body.mass;
const inverseInertia = body => fixed(body) ? 0 : 1 / body.inertia;
const wrap = angle => ((angle % 360) + 360) % 360;

// Outline matches yacht.js's maximum visible hull footprint around its render origin.
const playerShape = yachtHullShape();
export const PLAYER_HULL = Object.freeze({ ...playerShape, vertices: Object.freeze(playerShape.vertices.map(point => Object.freeze(point))) });
export const createWorldBodies = locationId => getWorldBodyDefinitions(locationId).map(createRigidBody);

function localVertices(shape) {
  if (shape.vertices) return shape.vertices;
  if (shape.type === 'circle') return Array.from({ length: 16 }, (_, i) => [Math.cos(i * Math.PI / 8) * shape.radius, Math.sin(i * Math.PI / 8) * shape.radius]);
  const halfLength = shape.length / 2, halfBeam = shape.beam / 2;
  if (shape.type === 'hull') return [[0, -halfLength], [halfBeam * .65, -halfLength * .6], [halfBeam, -halfLength * .1], [halfBeam, halfLength * .6], [halfBeam * .8, halfLength], [-halfBeam * .8, halfLength], [-halfBeam, halfLength * .6], [-halfBeam, -halfLength * .1], [-halfBeam * .65, -halfLength * .6]];
  return [[-halfBeam, -halfLength], [halfBeam, -halfLength], [halfBeam, halfLength], [-halfBeam, halfLength]];
}

export function createRigidBody(definition) {
  const shape = structuredClone(definition.shape ?? { type: 'box', length: definition.length, beam: definition.beam });
  const vertices = localVertices(shape);
  if (!['fixed', 'free', 'moored'].includes(definition.kind) || vertices.length < 3 || vertices.some(point => !Array.isArray(point) || !point.every(Number.isFinite))) throw new Error(`Invalid body shape: ${definition.id}`);
  const mass = definition.kind === 'fixed' ? 1 : definition.mass;
  if (!(mass > 0) || !Number.isFinite(mass)) throw new Error(`Invalid body mass: ${definition.id}`);
  const xs = vertices.map(point => point[0]), zs = vertices.map(point => point[1]);
  const width = Math.max(...xs) - Math.min(...xs), length = Math.max(...zs) - Math.min(...zs);
  if (!(width > 0 && length > 0)) throw new Error(`Empty body shape: ${definition.id}`);
  return { ...structuredClone(definition), shape, x: definition.x ?? 0, z: definition.z ?? 0, heading: definition.heading ?? 0,
    vx: definition.vx ?? 0, vz: definition.vz ?? 0, yawRate: definition.yawRate ?? 0, mass,
    inertia: definition.inertia > 0 ? definition.inertia : mass * (width * width + length * length) / 12,
    restitution: clamp(definition.restitution ?? .06, 0, .2), friction: clamp(definition.friction ?? .3, 0, 1),
    linearDamping: definition.linearDamping ?? .08, angularDamping: definition.angularDamping ?? .3,
    _vertices: vertices, _radius: Math.max(...vertices.map(([x, z]) => Math.hypot(x, z))), _featureSize: Math.min(width, length),
  };
}

export function worldVertices(body) {
  const old=body._worldCache;
  if(old&&old.x===body.x&&old.z===body.z&&old.heading===body.heading)return old.vertices;
  const c = Math.cos(body.heading * RAD), s = Math.sin(body.heading * RAD);
  const vertices=body._vertices.map(([x, z]) => ({ x: body.x + c * x - s * z, z: body.z + s * x + c * z }));
  body._worldCache={x:body.x,z:body.z,heading:body.heading,vertices,minX:Math.min(...vertices.map(p=>p.x)),maxX:Math.max(...vertices.map(p=>p.x)),minZ:Math.min(...vertices.map(p=>p.z)),maxZ:Math.max(...vertices.map(p=>p.z))};
  return vertices;
}

// Fixed geometry is immutable during a run. A location reset creates new bodies,
// hence a fresh weak cache; no rendering/global clock state enters the simulation.
const staticGrids=new WeakMap(),GRID=40;
function nearbyStatic(body,stationary,travel=0){
  if(stationary.length<40)return stationary;
  let grid=staticGrids.get(stationary[0]);
  if(!grid||grid.count!==stationary.length){
    grid={count:stationary.length,cells:new Map()};
    for(const item of stationary){worldVertices(item);const b=item._worldCache;for(let x=Math.floor(b.minX/GRID);x<=Math.floor(b.maxX/GRID);x++)for(let z=Math.floor(b.minZ/GRID);z<=Math.floor(b.maxZ/GRID);z++){const key=`${x}:${z}`;if(!grid.cells.has(key))grid.cells.set(key,[]);grid.cells.get(key).push(item);}}
    staticGrids.set(stationary[0],grid);
  }
  const radius=body._radius+travel+.2,found=new Set();
  for(let x=Math.floor((body.x-radius)/GRID);x<=Math.floor((body.x+radius)/GRID);x++)for(let z=Math.floor((body.z-radius)/GRID);z<=Math.floor((body.z+radius)/GRID);z++)for(const item of grid.cells.get(`${x}:${z}`)??[])found.add(item);
  return [...found];
}

function projection(vertices, axis) {
  let min = Infinity, max = -Infinity;
  for (const vertex of vertices) { const p = dot(vertex, axis); min = Math.min(min, p); max = Math.max(max, p); }
  return { min, max };
}

// Contact-episode hysteresis: a small rebound is still the same encounter.
// A separating-axis gap is a conservative clearance measure for convex shapes.
export function separatedBeyond(a, b, clearance = .15) {
  if (Math.hypot(b.x - a.x, b.z - a.z) > a._radius + b._radius + clearance) return true;
  const av = worldVertices(a), bv = worldVertices(b);
  for (const vertices of [av, bv]) for (let i = 0; i < vertices.length; i++) {
    const edge = sub(vertices[(i + 1) % vertices.length], vertices[i]), length = Math.hypot(edge.x, edge.z);
    if (length < 1e-9) continue;
    const axis = { x: -edge.z / length, z: edge.x / length };
    const pa = projection(av, axis), pb = projection(bv, axis);
    if (pb.min - pa.max > clearance || pa.min - pb.max > clearance) return true;
  }
  return false;
}

// Clip the convex overlap patch. Its centroid provides an off-centre contact point,
// while a symmetric face impact stays symmetric instead of spinning from a corner.
function overlapPatch(subject, clip) {
  let output = subject;
  const signedArea = clip.reduce((sum, point, i) => sum + cross(point, clip[(i + 1) % clip.length]), 0);
  const sign = signedArea >= 0 ? 1 : -1;
  for (let i = 0; i < clip.length && output.length; i++) {
    const a = clip[i], edge = sub(clip[(i + 1) % clip.length], a), input = output;
    output = [];
    let previous = input.at(-1), oldDistance = sign * cross(edge, sub(previous, a));
    for (const current of input) {
      const distance = sign * cross(edge, sub(current, a));
      if ((distance >= -1e-9) !== (oldDistance >= -1e-9)) {
        const t = oldDistance / (oldDistance - distance);
        output.push({ x: previous.x + (current.x - previous.x) * t, z: previous.z + (current.z - previous.z) * t });
      }
      if (distance >= -1e-9) output.push(current);
      previous = current; oldDistance = distance;
    }
  }
  return output;
}

export function detectContact(a, b) {
  if (Math.hypot(b.x - a.x, b.z - a.z) > a._radius + b._radius) return null;
  const av = worldVertices(a), bv = worldVertices(b);
  const ab=a._worldCache,bb=b._worldCache;
  if(ab.maxX<=bb.minX||bb.maxX<=ab.minX||ab.maxZ<=bb.minZ||bb.maxZ<=ab.minZ)return null;
  let penetration = Infinity, normal;
  for (const vertices of [av, bv]) for (let i = 0; i < vertices.length; i++) {
    const edge = sub(vertices[(i + 1) % vertices.length], vertices[i]), length = Math.hypot(edge.x, edge.z);
    if (length < 1e-9) continue;
    const axis = { x: -edge.z / length, z: edge.x / length };
    const pa = projection(av, axis), pb = projection(bv, axis);
    const forward = pa.max - pb.min, backward = pb.max - pa.min;
    if (forward <= 0 || backward <= 0) return null;
    const overlap = Math.min(forward, backward);
    if (overlap < penetration) {
      penetration = overlap;
      normal = forward < backward ? axis : { x: -axis.x, z: -axis.z };
    }
  }
  if (!normal) return null;
  const patch = overlapPatch(av, bv);
  const point = patch.length ? { x: patch.reduce((sum, p) => sum + p.x, 0) / patch.length, z: patch.reduce((sum, p) => sum + p.z, 0) / patch.length } : { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
  return { normal, penetration, point };
}

function contactVelocity(body, radius) {
  if (fixed(body)) return { x: 0, z: 0 };
  const omega = body.yawRate * RAD;
  return { x: body.vx - omega * radius.z, z: body.vz + omega * radius.x };
}

function applyImpulse(body, impulse, radius, direction) {
  if (fixed(body)) return;
  body.vx += direction * impulse.x / body.mass; body.vz += direction * impulse.z / body.mass;
  body.yawRate += direction * cross(radius, impulse) / body.inertia / RAD;
}

export function resolveContact(a, b, contact) {
  const ia = inverseMass(a), ib = inverseMass(b), ja = inverseInertia(a), jb = inverseInertia(b);
  if (!(ia + ib)) return { impulse: 0, closingSpeed: 0 };
  const { normal: n, point, penetration } = contact, ra = sub(point, a), rb = sub(point, b);
  const relative = sub(contactVelocity(b, rb), contactVelocity(a, ra)), normalSpeed = dot(relative, n);
  let impulse = 0;
  if (normalSpeed < 0) {
    const divisor = ia + ib + cross(ra, n) ** 2 * ja + cross(rb, n) ** 2 * jb;
    impulse = -(1 + Math.min(a.restitution, b.restitution)) * normalSpeed / divisor;
    const vector = { x: n.x * impulse, z: n.z * impulse };
    applyImpulse(a, vector, ra, -1); applyImpulse(b, vector, rb, 1);
    const rv = sub(contactVelocity(b, rb), contactVelocity(a, ra)), tangent = { x: -n.z, z: n.x };
    const frictionMass = ia + ib + cross(ra, tangent) ** 2 * ja + cross(rb, tangent) ** 2 * jb;
    const limit = Math.sqrt(a.friction * b.friction) * impulse;
    const frictionImpulse = clamp(-dot(rv, tangent) / frictionMass, -limit, limit);
    const friction = { x: tangent.x * frictionImpulse, z: tangent.z * frictionImpulse };
    applyImpulse(a, friction, ra, -1); applyImpulse(b, friction, rb, 1);
  }
  // Position-only correction removes overlap without adding bounce energy.
  const correction = Math.max(0, penetration - .002) * .75 / (ia + ib);
  if (!fixed(a)) { a.x -= n.x * correction * ia; a.z -= n.z * correction * ia; }
  if (!fixed(b)) { b.x += n.x * correction * ib; b.z += n.z * correction * ib; }
  return { impulse, closingSpeed: Math.max(0, -normalSpeed) };
}

export function solveContacts(bodies, iterations = 4) {
  const contacts = new Map();
  const moving = bodies.filter(body => !fixed(body)), immovable = bodies.filter(fixed), pairs = [];
  const addPair = (a,b) => { const radius = a._radius + b._radius + .2; if ((a.x-b.x)**2+(a.z-b.z)**2 <= radius*radius) pairs.push([a,b]); };
  for (let i=0;i<moving.length;i++) { for(let j=i+1;j<moving.length;j++)addPair(moving[i],moving[j]); for(const stationary of nearbyStatic(moving[i],immovable))addPair(moving[i],stationary); }
  for (let iteration = 0; iteration < iterations; iteration++) {
    for (const [a,b] of pairs) {
      const contact = detectContact(a, b); if (!contact) continue;
      const result = resolveContact(a, b, contact), key = `${a.id}|${b.id}`, previous = contacts.get(key);
      if (!previous) contacts.set(key, { aId: a.id, bId: b.id, ...contact, ...result });
      else { previous.impulse += result.impulse; previous.closingSpeed = Math.max(previous.closingSpeed, result.closingSpeed); }
    }
  }
  return [...contacts.values()];
}

export function advanceFreeBodies(bodies, dt, current = { x: 0, z: 0 }) {
  for (const body of bodies) {
    if (fixed(body)) continue;
    const m = body.mooring;
    if (body.kind === 'moored' && m) {
      const dx = body.x - m.x, dz = body.z - m.z, distance = Math.hypot(dx, dz), extension = Math.max(0, distance - (m.slack ?? 1));
      if (extension > 0 && distance > 1e-9) {
        const radialSpeed = (body.vx * dx + body.vz * dz) / distance;
        const tension = Math.max(0, (m.stiffness ?? 300) * extension + (m.damping ?? 200) * radialSpeed);
        body.vx -= dx / distance * tension / body.mass * dt; body.vz -= dz / distance * tension / body.mass * dt;
      }
      if(Number.isFinite(m.heading)){
        const error=(((body.heading-m.heading+540)%360+360)%360-180)*RAD;
        const torque=-(m.headingStiffness??body.inertia*.08)*error-(m.headingDamping??body.inertia*.35)*body.yawRate*RAD;
        body.yawRate+=torque/body.inertia/RAD*dt;
      }
    }
    const damp = Math.exp(-body.linearDamping * dt);
    body.vx = current.x + (body.vx - current.x) * damp; body.vz = current.z + (body.vz - current.z) * damp;
    body.yawRate *= Math.exp(-body.angularDamping * dt);
    body.x += body.vx * dt; body.z += body.vz * dt; body.heading = wrap(body.heading + body.yawRate * dt);
    if (body.kind === 'moored' && m?.maxRadius > 0) {
      const dx = body.x - m.x, dz = body.z - m.z, distance = Math.hypot(dx, dz);
      if (distance > m.maxRadius) {
        const nx = dx / distance, nz = dz / distance, outward = Math.max(0, body.vx * nx + body.vz * nz);
        body.x = m.x + nx * m.maxRadius; body.z = m.z + nz * m.maxRadius;
        body.vx -= nx * outward; body.vz -= nz * outward;
      }
    }
  }
}

/** Bound translation plus rotational tip travel relative to the thinnest collider. */
export function collisionStepLimit(bodies, maxStep = .02) {
  let limit=maxStep;
  const moving=bodies.filter(body=>!fixed(body)),stationary=bodies.filter(fixed);
  const speed = body => fixed(body)?0:Math.hypot(body.vx,body.vz)+Math.abs(body.yawRate*RAD)*body._radius;
  for(const a of moving){const av=speed(a);for(const b of [...moving,...nearbyStatic(a,stationary,av*maxStep)]){if(a===b)continue;const closing=av+speed(b),radius=a._radius+b._radius+closing*maxStep+.1;
    if((a.x-b.x)**2+(a.z-b.z)**2>radius*radius)continue;
    const feature=Math.max(.02,Math.min(a._featureSize,b._featureSize));limit=Math.min(limit,feature*.2/Math.max(1,closing));
  }}
  return limit;
}

/** Standalone contact step used by deterministic fixtures and non-player bodies. */
export function stepRigidBodies(bodies, dt, current = { x: 0, z: 0 }) {
  if (!Number.isFinite(dt) || dt <= 0) return [];
  let remaining = Math.min(dt, 2); const events = [];
  while (remaining > 1e-9) {
    const chunk = Math.min(remaining, collisionStepLimit(bodies));
    advanceFreeBodies(bodies, chunk, current);
    events.push(...solveContacts(bodies)); remaining -= chunk;
  }
  return events;
}
