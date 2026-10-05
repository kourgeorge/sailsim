const RAD = Math.PI / 180;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// The traveler control is normalized by tack: positive means ease leeward.
// THREE local +X is starboard, so starboard wind puts boom and car to port.
export function rigVisualState(state) {
  const wind =
    state.apparentWindAngle ??
    ((((state.windDirection - state.heading + 540) % 360) + 360) % 360) - 180;
  const side = Math.sign(wind) || 1;
  return {
    boomAngle:
      -side * clamp((state.mainSheet ?? state.trim ?? 45) + (state.traveler ?? 0), 0, 90) * RAD,
    travelerX: (-side * clamp(state.traveler ?? 0, -20, 20)) / 20,
    windVaneAngle: -wind * RAD,
  };
}

// Matches the original 12% response at 60 Hz, while remaining independent of
// render frequency. A repeated/invalid timestamp must not advance the boom.
export function smoothBoomAngle(current, target, elapsed) {
  if (!Number.isFinite(elapsed) || elapsed <= 0) return current;
  const response = 1 - Math.exp(Math.log(0.88) * 60 * elapsed);
  return current + (target - current) * response;
}

// Presentation only: the controls and sailing model retain their commanded
// values. Advance with simulation visual time so pausing also pauses the rig.
export function createSailAnimation() {
  let previousState = null,
    previousTime = null;
  const pose = { main: 1, jib: 1, mainMoving: false, jibMoving: false };
  const approach = (current, target, elapsed, raisingSeconds, loweringSeconds) => {
    const step = elapsed / (target > current ? raisingSeconds : loweringSeconds);
    return current + clamp(target - current, -step, step);
  };
  return {
    update(state, time) {
      const legacyHoist = Number(Boolean(state.sails ?? true));
      const mainHoist = clamp(state.mainHoist ?? legacyHoist, 0, 1);
      const jib = clamp(state.jibHoist ?? legacyHoist, 0, 1);
      const reef = Math.round(clamp(state.reefLevel ?? Number(Boolean(state.reef)), 0, 2));
      const main = mainHoist * [1, 0.72, 0.48][reef];
      // A new scenario/boat or a rewound clock starts in its authored pose,
      // including when the application reuses an existing 3D scene.
      if (state !== previousState || previousTime === null || time < previousTime) {
        pose.main = main;
        pose.jib = jib;
      } else if (Number.isFinite(time) && time > previousTime) {
        const elapsed = time - previousTime;
        pose.main = approach(pose.main, main, elapsed, 3, 2);
        pose.jib = approach(pose.jib, jib, elapsed, 2.5, 2);
      }
      pose.mainMoving = Math.abs(pose.main - main) > 0.00001;
      pose.jibMoving = Math.abs(pose.jib - jib) > 0.00001;
      previousState = state;
      if (Number.isFinite(time)) previousTime = time;
      return pose;
    },
  };
}
