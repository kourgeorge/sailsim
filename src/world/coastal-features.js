import { getLocation } from '../locations.js';
import { islandHeight, shoreScale } from '../rendering/geography.js';
import { destinationBuildings } from './destination-features.js';

const cache = new Map();

// Shared landmark positions for the 3D coast, tree clearings and navigation chart.
export function getCoastalFeatures(locationId) {
  const location = getLocation(locationId);
  if (cache.has(location.id)) return cache.get(location.id);
  if (location.coordinates) {
    const features=destinationBuildings(location);cache.set(location.id,features);return features;
  }
  const settlement = location.settlement || {
    islandIndex: 0,
    count: 8,
    startAngle: 0.35,
    angleStep: 0.045,
  };
  const features = [];
  const add = (type, islandIndex, angle, radius, index) => {
    const island = location.islands[islandIndex],
      r = radius * shoreScale(angle);
    const x = island.x + Math.cos(angle) * island.rx * r;
    const z = island.z + Math.sin(angle) * island.rz * r;
    const width = type === 'chapel' ? 8 : 5 + (index % 3);
    const length = type === 'chapel' ? 13 : 6 + ((index * 3) % 4);
    if (
      location.lighthouse &&
      Math.hypot(x - location.lighthouse.x, z - location.lighthouse.z) <
        12 + Math.hypot(width, length) / 2
    )
      return;
    const rotation = Math.PI / 2 - angle;
    const heights = [];
    for (const dx of [-width / 2 - 1, width / 2 + 1])
      for (const dz of [-length / 2 - 1, length / 2 + 1]) {
        heights.push(
          islandHeight(
            x + Math.cos(rotation) * dx + Math.sin(rotation) * dz,
            z - Math.sin(rotation) * dx + Math.cos(rotation) * dz,
            island,
          ),
        );
      }
    features.push(
      Object.freeze({
        type,
        islandIndex,
        x,
        z,
        y: Math.max(...heights),
        rotation,
        width,
        length,
        height: type === 'chapel' ? 6 : 3.4 + (index % 3) * 0.7,
        foundation: Math.max(0.8, Math.max(...heights) - Math.min(...heights) + 0.5),
        radius: Math.hypot(width, length) / 2 + 3,
        variant: index % 4,
      }),
    );
  };
  for (let i = 0; i < settlement.count; i++) {
    add(
      'house',
      settlement.islandIndex,
      settlement.startAngle + i * settlement.angleStep,
      0.77 + (i % 3) * 0.028,
      i,
    );
  }
  add(
    'chapel',
    settlement.islandIndex,
    settlement.startAngle + (settlement.count - 1) * settlement.angleStep * 0.5,
    0.65,
    0,
  );
  // A couple of isolated cottages on the other islands, facing the open bay.
  location.islands.forEach((island, index) => {
    if (index === settlement.islandIndex) return;
    if (island.profile === 'fjord') return;
    const angle = Math.atan2(-island.z, -island.x);
    for (let i = 0; i < 2; i++) add('house', index, angle + i * 0.13, 0.79, i + index);
  });
  const result = Object.freeze(features);
  cache.set(location.id, result);
  return result;
}

export function clearOfCoastalBuildings(x, z, features) {
  return features.every((feature) => Math.hypot(x - feature.x, z - feature.z) > feature.radius + 4);
}

const LANE_STEP = 2.5;

function insideFootprint(x, z, feature, margin) {
  const X = x - feature.x,
    Z = z - feature.z,
    c = Math.cos(feature.rotation),
    s = Math.sin(feature.rotation);
  return Math.abs(c * X - s * Z) < feature.width / 2 + margin && Math.abs(s * X + c * Z) < feature.length / 2 + margin;
}

function lanePoint(x, z, island, islandIndex, width) {
  const y = islandHeight(x, z, island);
  return y > 0.6 ? { x, y, z, width, islandIndex } : null;
}

// Gravel lanes for the practice-water villages: one street running behind the
// cottages on each island, and a short path from the street to every door.
// Each lane is a list of points on dry land, clear of every building footprint.
export function getVillageLanes(locationId) {
  const location = getLocation(locationId);
  const key = `${location.id}:lanes`;
  if (cache.has(key)) return cache.get(key);
  const lanes = [];
  if (!location.coordinates) {
    const features = getCoastalFeatures(location.id);
    const blocked = (x, z, margin = 1.2, except = null) =>
      features.some((feature) => feature !== except && insideFootprint(x, z, feature, margin));
    location.islands.forEach((island, islandIndex) => {
      const homes = features.filter((feature) => feature.islandIndex === islandIndex);
      if (homes.length < 2) return;
      const polar = (feature) => {
        const ratio = Math.hypot((feature.x - island.x) / island.rx, (feature.z - island.z) / island.rz) / shoreScale(Math.atan2((feature.z - island.z) / island.rz, (feature.x - island.x) / island.rx));
        return { angle: Math.atan2((feature.z - island.z) / island.rz, (feature.x - island.x) / island.rx), ratio };
      };
      const houses = homes.filter((feature) => feature.type === 'house').map(polar);
      // Measure around the first building so a village crossing ±180° stays together.
      const base = polar(homes[0]).angle;
      const angles = homes.map((feature) => base + Math.atan2(Math.sin(polar(feature).angle - base), Math.cos(polar(feature).angle - base)));
      // The street runs just inland of the innermost cottage.
      const ratio = Math.min(...houses.map((house) => house.ratio)) - 0.05;
      const start = Math.min(...angles) - 0.012,
        end = Math.max(...angles) + 0.012;
      const along = (angle, r) => {
        const scale = r * shoreScale(angle);
        return [island.x + Math.cos(angle) * island.rx * scale, island.z + Math.sin(angle) * island.rz * scale];
      };
      const [x0, z0] = along(start, ratio),
        [x1, z1] = along(start + 0.001, ratio);
      const step = (LANE_STEP / Math.hypot(x1 - x0, z1 - z0)) * 0.001;
      let street = [];
      const streetAt = new Map();
      for (let angle = start; angle <= end + step / 2; angle += step) {
        let point = null;
        // Bend inland around anything in the way.
        for (let nudge = 0; nudge <= 0.05 && !point; nudge += 0.01) {
          const [x, z] = along(angle, ratio - nudge);
          if (!blocked(x, z, 3)) point = lanePoint(x, z, island, islandIndex, 4.2);
        }
        if (point) {
          street.push(point);
          streetAt.set(angle, point);
        } else {
          if (street.length > 1) lanes.push(street);
          street = [];
        }
      }
      if (street.length > 1) lanes.push(street);
      // A short path from each building to the nearest street point.
      const streetPoints = [...streetAt.values()];
      for (const home of homes) {
        if (!streetPoints.length) break;
        const target = streetPoints.reduce((best, point) =>
          Math.hypot(point.x - home.x, point.z - home.z) < Math.hypot(best.x - home.x, best.z - home.z) ? point : best,
        );
        const distance = Math.hypot(target.x - home.x, target.z - home.z),
          path = [];
        for (let d = 0; d <= distance; d += LANE_STEP * 0.6) {
          const t = d / distance,
            x = home.x + (target.x - home.x) * t,
            z = home.z + (target.z - home.z) * t;
          if (insideFootprint(x, z, home, 0.4)) continue;
          if (blocked(x, z, 1.6, home)) break;
          const point = lanePoint(x, z, island, islandIndex, 2.4);
          if (!point) break;
          path.push(point);
        }
        if (path.length) path.push({ ...target, width: 2.4 });
        if (path.length > 1) lanes.push(path);
      }
    });
  }
  const result = Object.freeze(lanes.map((lane) => Object.freeze(lane.map((point) => Object.freeze(point)))));
  cache.set(key, result);
  return result;
}

export function clearOfVillageLanes(x, z, lanes, margin = 2) {
  return lanes.every((lane) => lane.every((point) => Math.hypot(x - point.x, z - point.z) > point.width / 2 + margin));
}
