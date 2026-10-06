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
