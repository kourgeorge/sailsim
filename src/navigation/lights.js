import { getLocation } from '../locations.js';
import { islandHeight } from '../rendering/geography.js';

// Fictional light list shared by the chart and the 3D world. Periods include
// the dark interval; these are training characteristics, not local light data.
export function navigationLights(locationId) {
  const location = getLocation(locationId);
  const lights = location.buoys.map((point, index) => ({
    ...point,
    id: `${location.id}:buoy:${index}`,
    kind: 'buoy',
    color: '#ffd45c',
    y: 3.6,
    period: [4, 3, 5][index % 3],
    duration: 0.6,
    label: `${index + 1} · Fl Y ${[4, 3, 5][index % 3]}s`,
  }));
  if (location.lighthouse) {
    const { x, z, islandIndex } = location.lighthouse;
    lights.push({
      id: `${location.id}:lighthouse`,
      kind: 'lighthouse',
      x,
      z,
      y: islandHeight(x, z, location.islands[islandIndex]) + 21.4,
      color: '#fff2d1',
      period: 6,
      duration: 0.7,
      label: 'Fl W 6s',
    });
  }
  if (location.id === 'haven') {
    // A 026.6° leading line, mounted on North Head. The rear light is higher.
    for (const [index, x, z, height] of [
      [0, 350, -565, 7],
      [1, 370, -605, 17],
    ]) {
      lights.push({
        id: `haven:leading:${index}`,
        kind: 'leading',
        x,
        z,
        y: islandHeight(x, z, location.islands[1]) + height,
        mountHeight: height,
        color: '#fff2d1',
        period: 0,
        duration: 0,
        label: index ? 'F W · 027°' : 'F W',
      });
    }
  }
  return lights;
}

export function lightIsOn(light, time) {
  if (!Number.isFinite(time)) return false;
  if (!light.period) return true;
  return ((time % light.period) + light.period) % light.period < light.duration;
}

// Aspect measured from the bow: positive to starboard, aft at +/-180°.
export function vesselLightVisible(
  kind,
  aspect,
  { anchor = false, throttle = 0, mainHoist, jibHoist } = {},
) {
  const a = ((((aspect + 540) % 360) + 360) % 360) - 180;
  if (kind === 'anchor') return anchor;
  if (anchor) return false;
  if (kind === 'port') return a >= -112.5 && a <= 0;
  if (kind === 'starboard') return a >= 0 && a <= 112.5;
  if (kind === 'stern') return Math.abs(a) >= 112.5;
  return (
    kind === 'masthead' &&
    (throttle !== 0 || (mainHoist === 0 && jibHoist === 0)) &&
    Math.abs(a) <= 112.5
  );
}
