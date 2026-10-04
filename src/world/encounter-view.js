// Camera information is sampled only when choosing an encounter. Once spawned,
// animals follow a world-space route, even when the sailor turns the camera.
export function inEncounterView(point, view, margin = 0.72) {
  if (!view?.direction || !view?.position) return true;
  const d = view.direction,
    p = view.position;
  const x = point.x - p.x,
    y = (point.y || 0) - p.y,
    z = point.z - p.z;
  const horizontal = Math.hypot(d.x, d.z);
  const rx = horizontal > 0.001 ? -d.z / horizontal : 1;
  const rz = horizontal > 0.001 ? d.x / horizontal : 0;
  const forward = x * d.x + y * d.y + z * d.z;
  const across = x * rx + z * rz;
  const up = x * (-rz * d.y) + y * (rz * d.x - rx * d.z) + z * rx * d.y;
  const tangent = Math.tan(((view.fov || 47) * Math.PI) / 360) * margin;
  return (
    forward > 1 &&
    Math.abs(up) < forward * tangent &&
    Math.abs(across) < forward * tangent * (view.aspect || 1.5)
  );
}

export function encounterPoint(state, view, random, min, max, y = 0) {
  const heading =
    view?.direction && Math.hypot(view.direction.x, view.direction.z) > 0.1
      ? Math.atan2(view.direction.x, -view.direction.z)
      : (state.heading * Math.PI) / 180;
  for (let attempt = 0; attempt < 32; attempt++) {
    const angle = heading + (random() - 0.5) * Math.PI * 2;
    const range = min + random() * (max - min);
    const point = { x: state.x + Math.sin(angle) * range, y, z: state.z - Math.cos(angle) * range };
    if (inEncounterView(point, view)) {
      if (view?.direction && view?.position) {
        const d = view.direction,
          p = view.position,
          horizontal = Math.hypot(d.x, d.z);
        const rx = horizontal > 0.001 ? -d.z / horizontal : 1,
          rz = horizontal > 0.001 ? d.x / horizontal : 0;
        const dx = point.x - p.x,
          dy = point.y - p.y,
          dz = point.z - p.z;
        const forward = dx * d.x + dy * d.y + dz * d.z,
          across = dx * rx + dz * rz;
        const halfWidth =
          forward * Math.tan(((view.fov || 47) * Math.PI) / 360) * (view.aspect || 1.5);
        // Keep a sighting beside the yacht's central hull and sail silhouette.
        if (Math.abs(across) < halfWidth * 0.25) continue;
      }
      return point;
    }
  }
  return null;
}
