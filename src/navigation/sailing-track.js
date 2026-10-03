import { LOCATIONS, getLocation } from '../locations.js';

export const MAX_TRACK_SAMPLES = 401;
const validPoint = (point) =>
  point &&
  ['x', 'z', 't'].every((key) => Number.isFinite(point[key]) && Math.abs(point[key]) <= 1e7) &&
  point.t >= 0;
const point = (state, t) => ({ x: state.x, z: state.z, t });
const rounded = (sample) =>
  Object.fromEntries(['x', 'z', 't'].map((key) => [key, Math.round(sample[key] * 1000) / 1000]));

export function createSailingTrack(state) {
  const first = point(state, 0);
  if (!validPoint(first)) return null;
  return {
    version: 1,
    locationId: getLocation(state.locationId).id,
    samples: [first],
    last: first,
    interval: 1,
  };
}

export function captureSailingTrack(track, state, time) {
  if (!track || (state.locationId && state.locationId !== track.locationId)) return;
  const sample = point(state, time);
  if (!validPoint(sample) || time < track.last.t) return;
  // Keep the exact endpoint even between recorded samples or on a failed frame.
  track.last = sample;
  if (time - track.samples.at(-1).t + 1e-8 < track.interval) return;
  if (track.samples.length >= MAX_TRACK_SAMPLES - 1) {
    track.samples = track.samples.filter((_, index) => index % 2 === 0);
    track.interval *= 2;
  }
  track.samples.push(sample);
}

export function restoreSailingTrack(value) {
  if (
    !value ||
    value.version !== 1 ||
    !LOCATIONS.some((location) => location.id === value.locationId)
  )
    return null;
  if (
    !Array.isArray(value.samples) ||
    !value.samples.length ||
    value.samples.length > MAX_TRACK_SAMPLES
  )
    return null;
  if (
    !value.samples.every(
      (sample, index) => validPoint(sample) && (!index || sample.t >= value.samples[index - 1].t),
    )
  )
    return null;
  return { version: 1, locationId: value.locationId, samples: value.samples.map(rounded) };
}

export function sailingTrackSnapshot(track) {
  if (!Array.isArray(track?.samples) || !track.samples.length) return null;
  const samples = [...track.samples];
  if (track.last) {
    if (track.last.t === samples.at(-1)?.t) samples[samples.length - 1] = track.last;
    else samples.push(track.last);
  }
  return restoreSailingTrack({ ...track, samples });
}

export function sailingTrackFrame(samples, marks = [], aspect = 1) {
  const points = [...samples, ...marks];
  const xs = points.map((p) => p.x),
    zs = points.map((p) => p.z);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minZ = Math.min(...zs),
    maxZ = Math.max(...zs);
  return {
    center: { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 },
    span: Math.max(60, (maxX - minX) * 1.35, (maxZ - minZ) * aspect * 1.35),
    cues: {},
  };
}
