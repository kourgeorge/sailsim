import test from 'node:test';
import assert from 'node:assert/strict';
import { PRACTICE_LOCATIONS as LOCATIONS } from '../src/locations.js';
import { initialState } from '../src/physics.js';
import { seededRandom } from '../src/rendering/materials.js';
import { createBirdEncounters } from '../src/world/bird-encounters.js';
import { createMarineEncounters } from '../src/world/marine-encounters.js';

test('long sails favor common seabirds, with more sea eagles in the fjords and mostly solitary eagles', () => {
  const sightings = {};
  for (const location of LOCATIONS) {
    const state = initialState(location.id);
    const birds = createBirdEncounters(location.id, { random: seededRandom(1927) });
    const counts = { gull: 0, cormorant: 0, tern: 0, eagle: 0 };
    const seen = new Set();
    let close = 0,
      soloEagles = 0;
    for (let time = 0; time < 86400; time += 5)
      for (const { event } of birds.update(state, time)) {
        if (!event || seen.has(event)) continue;
        seen.add(event);
        counts[event.species]++;
        if (event.close) close++;
        if (event.species === 'eagle' && event.count === 1) soloEagles++;
      }
    assert.ok(counts.gull > counts.cormorant && counts.gull > counts.tern);
    assert.ok(counts.eagle > 0 && counts.eagle < seen.size * 0.12);
    assert.ok(soloEagles > counts.eagle * 0.65);
    assert.ok(close > 0 && close < seen.size * 0.2);
    sightings[location.id] = counts;
  }
  assert.ok(sightings.fjord.eagle > sightings.haven.eagle * 2);
  assert.ok(sightings.fjord.eagle > sightings.shelter.eagle * 2);
});

test('startup does not guarantee rare wildlife and sightings have irregular gaps', () => {
  const firstBirds = new Set();
  for (const seed of [42, 618, 2917, 5362, 8273]) {
    const state = initialState();
    const birds = createBirdEncounters('haven', { random: seededRandom(seed) });
    const marine = createMarineEncounters('haven', { random: seededRandom(seed) });
    for (let time = 0; time < 25; time++) {
      birds.update(state, time);
      marine.update(state, time);
      assert.ok(marine.slots.every((slot) => !slot.event));
    }
    for (let time = 25; time < 600; time++) {
      const event = birds.update(state, time).find((slot) => slot.event)?.event;
      if (event) {
        firstBirds.add(event.species);
        break;
      }
    }
  }
  assert.ok(firstBirds.has('gull'));
  assert.ok(firstBirds.size > 1);
  const marine = createMarineEncounters('haven', { random: seededRandom(1742) });
  const state = initialState(),
    starts = [];
  for (let time = 0; time < 7200; time++) {
    const event = marine.update(state, time).find((slot) => slot.kind === 'fish').event;
    if (event && starts.at(-1) !== event.start) starts.push(event.start);
  }
  const gaps = starts.slice(1).map((start, i) => start - starts[i]);
  assert.ok(gaps.length > 10);
  assert.ok(Math.max(...gaps) > Math.min(...gaps) * 3);
});

test('the five-tap secret keeps local species weighting and cannot summon fjord sea turtles', () => {
  for (const locationId of ['haven', 'fjord']) {
    const state = initialState(locationId);
    const marine = createMarineEncounters(locationId, { random: seededRandom(1779) });
    const counts = { fish: 0, dolphin: 0, turtle: 0 };
    marine.update(state, 0);
    for (let i = 0; i < 500; i++) {
      for (const slot of marine.slots) slot.event = null;
      assert.ok(marine.summon(state, 0));
      const event = marine.slots.find((slot) => slot.event).event;
      counts[event.kind]++;
    }
    assert.ok(counts.fish > counts.dolphin * 3);
    assert.ok(counts.dolphin > counts.turtle);
    if (locationId === 'fjord') assert.equal(counts.turtle, 0);
    else assert.ok(counts.turtle > 0);
  }
});
