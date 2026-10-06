import worldDestinations from './world/data/destinations.json' with { type: 'json' };
import { DESTINATION_CHARACTER } from './world/destination-character.js';
import { destinationMarina } from './world/destination-features.js';
// Sailing waters, in metres. All rendered land is represented here so
// the chart, depth model, cockpit plotter and 3D coastline share one source.
function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}
export const DEFAULT_LOCATION_ID = 'haven';
export const PRACTICE_LOCATIONS = deepFreeze([
  {
    id: 'haven', title: 'Haven Islands',
    description: 'A fictional island group for the core course, buoy navigation, and maneuvering practice.',
    islands: [
      { x: -340, z: -360, rx: 210, rz: 180, height: 65, name: 'Pine Island' },
      { x: 390, z: -620, rx: 245, rz: 170, height: 87, name: 'North Head' },
      { x: 630, z: 80, rx: 180, rz: 260, height: 57, name: 'Little Haven' },
      { x: -620, z: 350, rx: 220, rz: 160, height: 42, name: 'West Cay' },
    ],
    buoys: [{ x: 90, z: -140 }, { x: 240, z: -290 }, { x: 170, z: -470 }],
    start: { x: 0, z: 100, heading: 35 },
    conditions: { windDirection: 315, windSpeed: 12, currentDirection: 90, currentSpeed: 0 },
    maxDepth: 35, shoreDepthScale: 24,
    chart: { centerX: 0, centerZ: -120, span: 1900 },
    marina: { x: 380, z: 70, heading: 90, berths: 5, spacing: 22, vacantBerth: 0 },
    lighthouse: { islandIndex: 0, x: -164, z: -338 },
    settlement: { islandIndex: 0, count: 23, startAngle: -.9, angleStep: .082 },
    treeDensity: 390,
  },
  {
    id: 'shelter', title: 'Shelter Bay',
    description: 'A fictional enclosed bay with gentle default wind, shallow margins, and room to practice controlled approaches.',
    islands: [
      { x: -560, z: -60, rx: 250, rz: 670, height: 62, name: 'Cedar Peninsula' },
      { x: 0, z: -680, rx: 650, rz: 280, height: 84, name: 'Shelter Ridge' },
      { x: 570, z: -30, rx: 245, rz: 710, height: 69, name: 'Lantern Point' },
    ],
    buoys: [{ x: -100, z: 140 }, { x: 50, z: -170 }, { x: 160, z: 180 }],
    start: { x: 0, z: 390, heading: 0 },
    conditions: { windDirection: 270, windSpeed: 8, currentDirection: 180, currentSpeed: 0 },
    maxDepth: 25, shoreDepthScale: 30,
    chart: { centerX: 0, centerZ: -100, span: 2300 },
    marina: { x: -255, z: 120, heading: 270, berths: 4, spacing: 22 },
    lighthouse: { islandIndex: 2, x: 400, z: -330 },
    settlement: { islandIndex: 0, count: 16, startAngle: -.5, angleStep: .065 },
    treeDensity: 440,
  },
  {
    id: 'strait', title: 'Windward Strait',
    description: 'A fictional passage between long headlands, with a cross-current for comparing heading and ground track.',
    islands: [
      { x: -650, z: -150, rx: 400, rz: 1400, height: 145, name: 'Western Headland' },
      { x: 650, z: -150, rx: 400, rz: 1400, height: 126, name: 'Eastern Headland' },
    ],
    buoys: [{ x: -60, z: 520 }, { x: 60, z: -100 }, { x: -60, z: -740 }],
    start: { x: 0, z: 900, heading: 0 },
    conditions: { windDirection: 270, windSpeed: 16, currentDirection: 90, currentSpeed: 1 },
    maxDepth: 55, shoreDepthScale: 32,
    chart: { centerX: 0, centerZ: -150, span: 3500 },
    marina: null,
    lighthouse: { islandIndex: 0, x: -330, z: -490 },
    settlement: null,
    treeDensity: 250,
  },
  {
    id: 'fjord', title: 'Norwegian Fjords',
    description: 'Fictional Norwegian waters beneath snowy peaks, tumbling waterfalls, and a quiet waterside village.',
    biome: 'fjord',
    islands: [
      { x: -700, z: -450, rx: 430, rz: 1750, height: 850, profile: 'fjord', name: 'Eagle Ridge' },
      { x: 720, z: -350, rx: 435, rz: 1850, height: 960, profile: 'fjord', name: 'Silver Falls' },
      { x: -80, z: -2380, rx: 650, rz: 490, height: 1080, profile: 'fjord', name: 'Snow Crown' },
      { x: 375, z: 960, rx: 140, rz: 230, height: 44, name: 'Hearth Island' },
    ],
    buoys: [{ x: -70, z: 350 }, { x: 30, z: -450 }, { x: -20, z: -1320 }],
    start: { x: -60, z: 900, heading: 0 },
    conditions: { windDirection: 285, windSpeed: 10, currentDirection: 180, currentSpeed: .3 },
    maxDepth: 120, shoreDepthScale: 68,
    chart: { centerX: 0, centerZ: -550, span: 5500 },
    marina: null,
    lighthouse: { islandIndex: 3, x: 278, z: 920 },
    settlement: { islandIndex: 3, count: 13, startAngle: 2.35, angleStep: .09 },
    treeDensity: 300,
    waterfalls: [{ islandIndex: 0, angle: -.35 }, { islandIndex: 1, angle: 3.3 }, { islandIndex: 1, angle: 2.65 }],
  },
]);
export const WORLD_DESTINATIONS = deepFreeze(worldDestinations.map(location => {
  const character=DESTINATION_CHARACTER[location.id];
  return {...location,character,islands:location.islands.map(island=>({...island,palette:character})),marina:destinationMarina(location,character)};
}));
export const LOCATIONS = Object.freeze([...PRACTICE_LOCATIONS, ...WORLD_DESTINATIONS]);
const byId = new Map(LOCATIONS.map(location => [location.id, location]));
// Unknown or old saved ids resolve predictably to the original course waters.
export function getLocation(id = DEFAULT_LOCATION_ID) {
  return byId.get(id) || byId.get(DEFAULT_LOCATION_ID);
}
