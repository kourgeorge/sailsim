// Rendering budgets affect only presentation, never simulation time or physics.
const profiles = [
  {
    name: 'high',
    pixelRatio: 1.65,
    shadowSize: 1024,
    reflectionSize: 512,
    reflectionInterval: 1,
    clouds: true,
  },
  {
    name: 'balanced',
    pixelRatio: 1.25,
    shadowSize: 512,
    reflectionSize: 256,
    reflectionInterval: 2,
    clouds: true,
  },
  {
    name: 'low',
    pixelRatio: 1,
    shadowSize: 0,
    reflectionSize: 256,
    reflectionInterval: 3,
    clouds: false,
  },
  {
    name: 'minimum',
    pixelRatio: 0.8,
    shadowSize: 0,
    reflectionSize: 128,
    reflectionInterval: 4,
    clouds: false,
  },
];
const compatibility = {
  name: 'compatibility',
  pixelRatio: 0.7,
  shadowSize: 0,
  reflectionSize: 256,
  reflectionInterval: 4,
  clouds: false,
};

export function createRenderQuality({ touch = false, software = false, pixelRatio = 1 } = {}) {
  const bestLevel = touch ? 1 : 0;
  const budgets = profiles.map((profile) => ({
    ...profile,
    pixelRatio: Math.min(pixelRatio, profile.pixelRatio),
  }));
  let level = bestLevel,
    frames = 0,
    slowFrames = 0,
    windowMs = 0,
    fastMs = 0,
    settleMs = 1000;
  const current = () => (software ? compatibility : budgets[level]);
  function resetWindow() {
    frames = 0;
    slowFrames = 0;
    windowMs = 0;
  }
  function resetTiming() {
    resetWindow();
    fastMs = 0;
    settleMs = 1000;
  }
  return {
    get current() {
      return current();
    },
    resetTiming,
    recordFrame(durationMs) {
      if (software) return current();
      // Background tabs, paused views and initial loading are not GPU samples.
      if (!Number.isFinite(durationMs) || durationMs <= 0 || durationMs > 1000) {
        resetTiming();
        return current();
      }
      if (settleMs > 0) {
        settleMs -= durationMs;
        return current();
      }
      windowMs += durationMs;
      frames++;
      if (durationMs > 28) slowFrames++;
      // A sustained sample avoids reacting to one slow frame or shader compilation.
      if (windowMs < 1500 || frames < 30) return current();
      const average = windowMs / frames;
      // Alternating fast/slow frames can look jerky even with a decent average.
      if (average > 28 || slowFrames / frames > 0.2) {
        fastMs = 0;
        if (level < budgets.length - 1) {
          level++;
          settleMs = 1000;
        }
      } else if (average < 19) {
        fastMs += windowMs;
        // Recover detail much more slowly than shedding work, to avoid flicker.
        if (fastMs >= 15000 && level > bestLevel) {
          level--;
          fastMs = 0;
          settleMs = 1000;
        }
      } else fastMs = 0;
      resetWindow();
      return current();
    },
  };
}
