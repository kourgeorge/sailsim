// Time of day and sky are presentation choices: they never change wind,
// current or boat physics, so race records stay comparable. Every preset is
// plain data, checked without WebGL and applied only when the choice changes.
export const TIMES_OF_DAY = ['sunrise', 'morning', 'day', 'afternoon', 'sunset', 'night'];
export const SKIES = ['clear', 'fair', 'overcast', 'fog', 'rain', 'storm'];
export const TIME_OF_DAY_LABELS = {
  sunrise: 'Sunrise',
  morning: 'Morning',
  day: 'Midday',
  afternoon: 'Afternoon',
  sunset: 'Sunset',
  night: 'Night',
};
export const SKY_LABELS = {
  clear: 'Clear sky',
  fair: 'Fair, scattered clouds',
  overcast: 'Overcast',
  fog: 'Fog',
  rain: 'Rain',
  storm: 'Thunderstorm',
};
// Compact names for the conditions strip above the scene.
export const SKY_SHORT_LABELS = {
  clear: 'Clear skies',
  fair: 'Fair',
  overcast: 'Overcast',
  fog: 'Fog',
  rain: 'Rain',
  storm: 'Thunderstorm',
};
export const DEFAULT_SKY_CHOICE = Object.freeze({ timeOfDay: 'day', sky: 'fair' });

export const timeOfDayOf = (state) =>
  TIMES_OF_DAY.includes(state?.timeOfDay) ? state.timeOfDay : 'day';
export const skyOf = (state) => (SKIES.includes(state?.sky) ? state.sky : 'fair');
export const skyChoice = (value) => ({ timeOfDay: timeOfDayOf(value), sky: skyOf(value) });

export const restrictedVisibility = (state) => ['fog', 'rain', 'storm'].includes(skyOf(state));
// COLREGs Rule 20: lights are shown from sunset to sunrise, and also by day
// in restricted visibility.
export const navigationLightsLit = (state) =>
  ['sunrise', 'sunset', 'night'].includes(timeOfDayOf(state)) || restrictedVisibility(state);

const hex = (color) => {
  const n = parseInt(color.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (rgb) =>
  `#${rgb
    .map((v) =>
      Math.round(Math.max(0, Math.min(255, v)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
const scale = (color, k) => toHex(hex(color).map((v) => v * k));
const scaled = (rgb, k) => rgb.map((v) => v * k);

// Cloud colours are raw shader values (above 1 is a bright, sunlit edge).
const DAY_CLOUDS = {
  lit: [1.2, 1.22, 1.25],
  sunLit: [1.42, 1.29, 1.06],
  shade: [0.36, 0.46, 0.59],
  rim: [1.0, 0.86, 0.61],
};
// Sun path offsets are degrees of azimuth from the local noon bearing.
const TIMES = {
  sunrise: {
    offset: -88,
    elevation: () => 2.5,
    sun: '#ffb47e',
    sunIntensity: 1.5,
    ambientSky: '#f2c9b4',
    ambientGround: '#4b4038',
    ambient: 0.72,
    environment: 0.32,
    haze: '#e6b8a2',
    fog: 1.4,
    skyExposure: 0.62,
    turbidity: 1.5,
    light: 0.72,
    clouds: {
      lit: [1.35, 1.0, 0.86],
      sunLit: [1.6, 1.05, 0.7],
      shade: [0.42, 0.36, 0.46],
      rim: [1.0, 0.6, 0.35],
    },
    waterSun: '#ffbf8c',
    waterSky: '#c99b93',
    destination: 0.75,
  },
  morning: {
    offset: -55,
    elevation: (noon) => noon * 0.55,
    sun: '#ffe4c2',
    sunIntensity: 2.6,
    ambientSky: '#d8e8f8',
    ambientGround: '#544f40',
    ambient: 1.12,
    environment: 0.5,
    hazeTint: ['#f1dcc8', 0.25],
    fog: 1.15,
    skyExposure: 0.44,
    turbidity: 0.4,
    light: 0.95,
    clouds: {
      lit: [1.22, 1.18, 1.14],
      sunLit: [1.45, 1.27, 1.0],
      shade: [0.38, 0.45, 0.56],
      rim: [1.0, 0.8, 0.55],
    },
    waterSun: '#fff0d8',
    waterSky: '#79abd0',
    destination: 1,
  },
  day: {
    offset: 0,
    elevation: (noon) => noon,
    ambientSky: '#cde9ff',
    ambientGround: '#53503f',
    sunIntensity: 3.1,
    ambient: 1.25,
    environment: 0.55,
    fog: 1,
    skyExposure: 0.38,
    turbidity: 0,
    light: 1,
    clouds: DAY_CLOUDS,
    waterSun: '#fff4dd',
    waterSky: '#6da8d5',
    destination: 1,
  },
  afternoon: {
    offset: 55,
    elevation: (noon) => noon * 0.6,
    sun: '#ffe1b8',
    sunIntensity: 2.7,
    ambientSky: '#d9e6f2',
    ambientGround: '#57503d',
    ambient: 1.12,
    environment: 0.5,
    hazeTint: ['#f0d7bd', 0.2],
    fog: 1.1,
    skyExposure: 0.44,
    turbidity: 0.6,
    light: 0.95,
    clouds: {
      lit: [1.22, 1.17, 1.1],
      sunLit: [1.48, 1.25, 0.95],
      shade: [0.38, 0.44, 0.54],
      rim: [1.0, 0.78, 0.5],
    },
    waterSun: '#ffeccc',
    waterSky: '#7aa9cc',
    destination: 1,
  },
  sunset: {
    offset: 92,
    elevation: () => 2,
    sun: '#ff9659',
    sunIntensity: 1.45,
    ambientSky: '#eeb39e',
    ambientGround: '#3f3438',
    ambient: 0.66,
    environment: 0.3,
    haze: '#e2a184',
    fog: 1.45,
    skyExposure: 0.66,
    turbidity: 2,
    light: 0.68,
    clouds: {
      lit: [1.3, 0.92, 0.8],
      sunLit: [1.7, 0.95, 0.55],
      shade: [0.38, 0.3, 0.42],
      rim: [1.0, 0.5, 0.25],
    },
    waterSun: '#ffa66a',
    waterSky: '#b98b92',
    destination: 0.7,
  },
  night: {
    offset: 0,
    elevation: (noon) => noon,
    sun: '#a6c5f2',
    sunIntensity: 0.32,
    ambientSky: '#90b4e8',
    ambientGround: '#182c43',
    ambient: 0.24,
    environment: 0.055,
    haze: '#101c30',
    fog: 1,
    skyExposure: 0.38,
    turbidity: 0,
    light: 1,
    clouds: DAY_CLOUDS,
    waterSun: '#738fba',
    waterSky: '#0b1630',
    water: '#071727',
    destination: 0,
  },
};
// Grey weather replaces the blue sky with a cloud dome. `fogDensity` is an
// absolute visibility (fog: about 550 m; rain: about 2 km).
const WEATHER = {
  clear: { coverage: 0.2, sun: 1, ambient: 1, environment: 1, fog: 0.85 },
  fair: { coverage: 0, sun: 1, ambient: 1, environment: 1, fog: 1 },
  overcast: {
    dome: '#a9b1b8',
    coverage: 0.2,
    clouds: 0.62,
    sun: 0.22,
    ambient: 0.82,
    environment: 0.7,
    fog: 2.4,
    water: 0.35,
  },
  fog: {
    dome: '#c4cacd',
    coverage: 0.2,
    sun: 0.18,
    ambient: 0.9,
    environment: 0.7,
    fogDensity: 0.0055,
    water: 0.45,
  },
  rain: {
    dome: '#8a939b',
    coverage: 0.14,
    clouds: 0.48,
    sun: 0.12,
    ambient: 0.7,
    environment: 0.55,
    fogDensity: 0.0016,
    water: 0.5,
    rain: 0.7,
  },
  storm: {
    dome: '#545d66',
    coverage: 0.1,
    clouds: 0.3,
    sun: 0.06,
    ambient: 0.5,
    environment: 0.4,
    fogDensity: 0.0024,
    water: 0.62,
    rain: 1,
    lightning: true,
  },
};

function direction(azimuth, elevation) {
  const a = (azimuth * Math.PI) / 180,
    e = (elevation * Math.PI) / 180;
  // North is -z and east is +x, matching compass headings in the world.
  return [Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)];
}

export function skyPreset(state, place = {}) {
  const timeOfDay = timeOfDayOf(state),
    sky = skyOf(state);
  const {
    sun = '#fff0d5',
    haze = '#b7c7ce',
    cloudHaze = haze,
    fog = 0.00031,
    sunHeight = 0.64,
    turbidity = 1.8,
    rayleigh = 2.8,
    cloudCoverage = 0.5,
    water = '#217887',
    southern = false,
  } = place;
  const time = TIMES[timeOfDay],
    weather = WEATHER[sky],
    night = timeOfDay === 'night',
    grey = Boolean(weather.dome);
  // The original noon sun stood at this height over a 1.36 horizontal run.
  const noon = (Math.atan2(sunHeight, 1.36) * 180) / Math.PI;
  // Sun rises in the east and sets in the west; noon is south of northern
  // waters and north of southern ones.
  const azimuth = southern ? 0 - time.offset : 180 + time.offset;
  const timeHaze = time.haze ?? (time.hazeTint ? mix(haze, ...time.hazeTint) : haze);
  const hazeColor = grey
    ? scale(mix(weather.dome, timeHaze, night ? 0.88 : 0.28), night ? 1 : time.light)
    : timeHaze;
  const cloudScale = (weather.clouds ?? 1) * (grey ? time.light : 1);
  const clouds = Object.fromEntries(
    Object.entries(time.clouds).map(([key, rgb]) => [key, scaled(rgb, cloudScale)]),
  );
  const baseWater = time.water ?? water;
  const waterColor = night
    ? baseWater
    : scale(mix(baseWater, '#3b4a52', weather.water ?? 0), time.light);
  return {
    timeOfDay,
    sky,
    sunDirection: direction(azimuth, time.elevation(noon)),
    // The moon keeps the original fixed bearing over the north-west water.
    moonDirection: direction(324, noon),
    sunColor: time.sun ?? sun,
    sunIntensity: time.sunIntensity * weather.sun,
    ambientSky: grey && !night ? mix(time.ambientSky, '#c6ccd2', 0.6) : time.ambientSky,
    ambientGround: time.ambientGround,
    ambientIntensity: time.ambient * weather.ambient,
    environmentIntensity: time.environment * weather.environment,
    haze: hazeColor,
    fogDensity: weather.fogDensity ?? fog * time.fog * weather.fog,
    backdrop: grey ? 'dome' : night ? 'stars' : 'sky',
    skyExposure: time.skyExposure,
    turbidity: turbidity + time.turbidity,
    rayleigh,
    dome: {
      zenith: night && !grey ? '#061025' : scale(hazeColor, sky === 'fog' ? 1.04 : 0.82),
      horizon: night && !grey ? '#2c3d52' : hazeColor,
      moon: night && !grey ? 1 : 0,
    },
    clouds: {
      visible: !night && sky !== 'fog',
      coverage: Math.max(0.08, grey ? weather.coverage : cloudCoverage + weather.coverage),
      haze: grey || timeOfDay !== 'day' ? hazeColor : cloudHaze,
      ...clouds,
    },
    water: {
      color: waterColor,
      sunColor: grey ? mix(time.waterSun, hazeColor, 0.6) : time.waterSun,
      sky: grey ? scale(hazeColor, 0.85) : time.waterSky,
      horizon: hazeColor,
      // Bright reef shallows fade and darken toward the grey sea in poor light.
      destination: time.destination * (1 - (weather.water ?? 0) * 0.8),
      destinationLight: time.light * (1 - (weather.water ?? 0)) ** 2,
      shoreLight: night ? 0.18 : time.light * (1 - (weather.water ?? 0) * 0.7),
    },
    rain: weather.rain ?? 0,
    lightning: Boolean(weather.lightning),
  };
}

// A deterministic flash pattern: storms stay identical in replays.
export function lightningFlash(time) {
  const period = 6.5,
    cycle = Math.floor(time / period),
    n = Math.sin(cycle * 91.7 + 13.1) * 43758.5453,
    chance = n - Math.floor(n);
  const phase = time - cycle * period - chance * 3;
  if (chance < 0.4 || phase < 0) return 0;
  if (phase < 0.09) return 1;
  if (phase < 0.16) return 0.25;
  if (phase < 0.24) return 0.8;
  if (phase < 0.5) return ((0.5 - phase) / 0.26) * 0.3;
  return 0;
}
