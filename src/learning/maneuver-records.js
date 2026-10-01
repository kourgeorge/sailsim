import { COLLISION_FAILURE_MESSAGE, collisionEvidence } from './practice-assessment.js';

export const MANEUVER_STORAGE_KEY = 'sail-maneuvers-v1';
const MAX_SAMPLES = 3001,
  MAX_RUNS = 6;
const fields = ['t', 'x', 'z', 'speed', 'heading', 'throttle', 'rudder', 'depth'];
export function createManeuverRecord(drillId, state) {
  const record = {
    version: 1,
    drillId,
    startedAt: new Date().toISOString(),
    status: 'active',
    samples: [],
    events: [],
    metrics: {},
    message: '',
  };
  captureManeuver(record, state, 0, true);
  return record;
}
export function captureManeuver(record, state, time, force = false) {
  const last = record.samples.at(-1);
  if (!Number.isFinite(time) || time < 0 || (last && time < last.t)) return;
  if (last && time === last.t) return;
  if (!force && last && time - last.t < 0.2 - 1e-8) return;
  const sample = {
    t: time,
    x: state.x,
    z: state.z,
    speed: state.speed,
    heading: state.heading,
    throttle: state.throttle,
    rudder: state.rudder,
    depth: state.depth,
  };
  if (!fields.every((k) => Number.isFinite(sample[k]))) return;
  record.samples.push(sample);
  // Keep the complete passage at lower temporal resolution if a long drill exceeds its budget.
  if (record.samples.length > MAX_SAMPLES)
    record.samples = record.samples.filter(
      (_, i) => i % 2 === 0 || i === record.samples.length - 1,
    );
}
export function finishManeuverRecord(record, attempt, state) {
  captureManeuver(record, state, attempt.elapsed, true);
  record.status = attempt.status;
  record.message = attempt.message;
  record.metrics = { ...attempt.metrics };
  record.events = attempt.events.map((e) => ({ ...e }));
  return record;
}
export function restoreManeuverRecords(raw, ids) {
  let payload;
  try {
    payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return [];
  }
  if (!Array.isArray(payload)) return [];
  return payload
    .filter(
      (r) =>
        r &&
        r.version === 1 &&
        ids.includes(r.drillId) &&
        ['passed', 'failed'].includes(r.status) &&
        typeof r.startedAt === 'string' &&
        Number.isFinite(Date.parse(r.startedAt)) &&
        typeof r.message === 'string' &&
        r.message.length < 500 &&
        Array.isArray(r.samples) &&
        r.samples.length > 0 &&
        r.samples.length <= MAX_SAMPLES &&
        r.samples.every(
          (s, i) =>
            s &&
            fields.every((k) => Number.isFinite(s[k])) &&
            s.t >= 0 &&
            Math.abs(s.x) < 1e6 &&
            Math.abs(s.z) < 1e6 &&
            Math.abs(s.speed) < 100 &&
            s.throttle >= -1 &&
            s.throttle <= 1 &&
            (!i || s.t > r.samples[i - 1].t),
        ) &&
        Array.isArray(r.events) &&
        r.events.length < 100 &&
        r.events.every(
          (e) => e && typeof e.type === 'string' && Number.isFinite(e.time) && e.time >= 0,
        ) &&
        r.metrics &&
        typeof r.metrics === 'object',
    )
    .slice(0, MAX_RUNS)
    .map((r) => ({
      ...r,
      metrics: {
        ...Object.fromEntries(
          Object.entries(r.metrics).filter(([, v]) => typeof v === 'number' && Number.isFinite(v)),
        ),
        ...(r.metrics.gateCrossing &&
        ['speed', 'crossTrack', 'time'].every((k) => Number.isFinite(r.metrics.gateCrossing[k]))
          ? {
              gateCrossing: {
                speed: r.metrics.gateCrossing.speed,
                crossTrack: r.metrics.gateCrossing.crossTrack,
                time: r.metrics.gateCrossing.time,
              },
            }
          : {}),
        ...(r.status === 'failed' && r.metrics.criticalFailure?.code === 'collision'
          ? {
              criticalFailure: {
                code: 'collision',
                message: COLLISION_FAILURE_MESSAGE,
                collision: collisionEvidence(r.metrics.criticalFailure.collision),
              },
            }
          : {}),
      },
      events: r.events.map((e) => ({
        type: e.type.slice(0, 80),
        time: e.time,
        index: Number.isInteger(e.index) ? e.index : 0,
        ...(e.type === 'collision' ? { collision: collisionEvidence(e.collision) } : {}),
      })),
    }));
}
export function addManeuverRecord(records, record) {
  return [record, ...records].slice(0, MAX_RUNS);
}
export function sampleAtTime(samples, time) {
  let lo = 0,
    hi = samples.length - 1;
  while (lo < hi) {
    const m = Math.ceil((lo + hi) / 2);
    if (samples[m].t <= time) lo = m;
    else hi = m - 1;
  }
  return { sample: samples[lo], index: lo };
}
