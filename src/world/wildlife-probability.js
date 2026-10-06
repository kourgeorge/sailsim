import { getLocation } from '../locations.js';

// Approximate, gameplay-scaled sighting intensities per simulated hour, not
// measured population counts. These describe animals visible from a boat:
// coastal gulls dominate; surfacing fish are easier to encounter than cetaceans
// or sea turtles. The fictional non-fjord waters use temperate coastal fauna.
// Sheltered bays favor gulls/cormorants; passages favor terns and dolphins;
// Norwegian fjords favor sea eagles and exclude warm-water sea turtles.
// Cooldowns, time spent visible, and terrain/view checks lower actual rates.
const RATES = {
  haven: {
    birds: { gull: 60, cormorant: 18, tern: 12, eagle: 1 },
    marine: { fish: 28, dolphin: 4, turtle: 1 },
    land: { deer: 12, goat: 8, fox: 4, rabbit: 16, boar: 6 },
  },
  shelter: {
    birds: { gull: 70, cormorant: 20, tern: 9, eagle: 0.5 },
    marine: { fish: 34, dolphin: 1.2, turtle: 0.5 },
    land: { deer: 14, goat: 5, fox: 5, rabbit: 18, boar: 8 },
  },
  strait: {
    birds: { gull: 44, cormorant: 12, tern: 22, eagle: 0.8 },
    marine: { fish: 20, dolphin: 5, turtle: 0.35 },
    land: { deer: 9, goat: 14, fox: 4, rabbit: 12, boar: 5 },
  },
  fjord: {
    birds: { gull: 46, cormorant: 23, tern: 8, eagle: 5 },
    marine: { fish: 22, dolphin: 1.8, turtle: 0 },
    land: { deer: 16, goat: 18, fox: 4, rabbit: 9, boar: 1 },
  },
};

export function wildlifeRates(locationId) {
  const location = getLocation(locationId);
  if (RATES[location.id]) return RATES[location.id];
  if (location.biome === 'fjord') return RATES.fjord;
  return {
    birds: { gull: 46, cormorant: 12, tern: 22, eagle: 0 },
    marine: { fish: 28, dolphin: 4, turtle: location.biome === 'tropical' ? 2 : 0 },
    land: { deer: 0, goat: 0, fox: 0, rabbit: 0, boar: 0 },
  };
}

export function weightedWildlife(weights, random) {
  const entries = Object.entries(weights).filter(([, weight]) => weight > 0);
  if (!entries.length) return null;
  let draw = random() * entries.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [id, weight] of entries) {
    draw -= weight;
    if (draw < 0) return id;
  }
  return entries.at(-1)[0];
}

// Exponential waiting times allow quiet stretches and chance sightings without
// cycling through a checklist. A minimum gap prevents rapid repeat encounters.
export function wildlifeDelay(rate, random, minimum) {
  if (rate <= 0) return Infinity;
  return minimum - (Math.log1p(-Math.min(random(), 1 - Number.EPSILON)) * 3600) / rate;
}
