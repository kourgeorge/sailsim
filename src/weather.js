const FIELDS = ['windSpeed', 'windDirection', 'currentSpeed', 'currentDirection'];
const INTERVAL = 20;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const wrap = (value) => ((value % 360) + 360) % 360;

export function weatherConditions(state) {
  return Object.fromEntries(FIELDS.map((key) => [key, state[key]]));
}

function random(weather) {
  weather.seed = (Math.imul(weather.seed, 1664525) + 1013904223) >>> 0;
  return weather.seed / 4294967296;
}

function nextTargets(weather) {
  for (const key of FIELDS) {
    const range = weather.ranges[key],
      current = key.startsWith('current');
    const offset = weather.previous[key];
    // A bounded, mean-reverting random walk around the chosen preset. Ocean
    // current drifts more slowly than wind; a zero-current preset stays still.
    const next =
      offset * (current ? 0.96 : 0.92) +
      (random(weather) + random(weather) - 1) * range * (current ? 0.08 : 0.3);
    const low = key.endsWith('Speed') ? Math.max(-range, -weather.base[key]) : -range;
    const high =
      key === 'windSpeed'
        ? Math.min(range, 35 - weather.base[key])
        : key === 'currentSpeed'
          ? Math.min(range, 4 - weather.base[key])
          : range;
    weather.target[key] = clamp(next, low, high);
  }
}

// Plain serializable state keeps replays and race physics deterministic. Each
// 20-second segment is smoothly interpolated, independent of rendering rate.
export function createWeather(conditions, { enabled = true, seed = 17492 } = {}) {
  const base = weatherConditions(conditions);
  const weather = {
    enabled,
    seed: seed >>> 0,
    elapsed: 0,
    segmentTime: 0,
    base,
    ranges: {
      windSpeed: Math.min(6, base.windSpeed * 0.3),
      windDirection: base.windSpeed > 0 ? 22 : 0,
      currentSpeed: Math.min(0.4, base.currentSpeed * 0.25),
      currentDirection: base.currentSpeed > 0 ? 8 : 0,
    },
    previous: Object.fromEntries(FIELDS.map((key) => [key, 0])),
    target: {},
    conditions: { ...base },
  };
  nextTargets(weather);
  return weather;
}

export function advanceWeather(weather, dt) {
  if (!weather.enabled || !Number.isFinite(dt) || dt <= 0) return weather.conditions;
  weather.elapsed += dt;
  weather.segmentTime += dt;
  while (weather.segmentTime >= INTERVAL) {
    weather.segmentTime -= INTERVAL;
    weather.previous = { ...weather.target };
    nextTargets(weather);
  }
  const t = weather.segmentTime / INTERVAL,
    blend = t * t * (3 - 2 * t);
  for (const key of FIELDS) {
    const value =
      weather.base[key] +
      weather.previous[key] +
      (weather.target[key] - weather.previous[key]) * blend;
    weather.conditions[key] = key.endsWith('Direction') ? wrap(value) : value;
  }
  return weather.conditions;
}

export function raceWeatherSeed(courseId) {
  // Every attempt on a course gets the same changing-weather sequence, shared
  // by the whole fleet, so personal-best times remain comparable.
  return [...courseId].reduce(
    (seed, char) => (Math.imul(seed, 31) + char.charCodeAt(0)) >>> 0,
    7293,
  );
}

export function raceRecordKey(courseId, difficulty, changingWeather) {
  return changingWeather
    ? `sail-race-best-v2:${courseId}:${difficulty}:changing`
    : `sail-race-best-v1:${courseId}:${difficulty}`;
}
