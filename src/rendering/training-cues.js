import * as THREE from 'three';

// Optional visual teaching aids. These never modify state, depth, collisions, or assessment.
// Bearings are compass degrees (north = -Z, east = +X), positions and lengths are metres.
export function createTrainingCues(scene) {
  const group = new THREE.Group();
  group.name = 'Optional maneuvering practice guidance';
  group.visible = false;
  scene.add(group);
  const makeMaterial = (color, opacity = .9) => new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, depthWrite: false, toneMapped: false,
    side: THREE.DoubleSide,
  });
  const amber = makeMaterial('#edbd76'), mint = makeMaterial('#71d7c5');
  const faint = makeMaterial('#edbd76', .32), trailMaterial = makeMaterial('#fff5d4', .72);
  const lineMaterial = new THREE.LineDashedMaterial({
    color: '#edbd76', dashSize: 2, gapSize: 1, transparent: true, opacity: .75,
    depthWrite: false, toneMapped: false,
  });
  const add = (parent, geometry, material) => {
    const object = new THREE.Mesh(geometry, material);
    object.renderOrder = 2;
    parent.add(object);
    return object;
  };
  const flat = (parent, geometry, material) => {
    const object = add(parent, geometry, material);
    object.rotation.x = -Math.PI / 2;
    return object;
  };
  const gate = new THREE.Group(); group.add(gate);
  const posts = [-1, 1].map(() => {
    const post = new THREE.Group(); gate.add(post);
    flat(post, new THREE.RingGeometry(.65, .82, 24), amber);
    const shaft = add(post, new THREE.CylinderGeometry(.045, .045, 1.6, 6), amber);
    shaft.position.y = .8;
    const diamond = add(post, new THREE.OctahedronGeometry(.22, 0), amber);
    diamond.position.y = 1.8;
    return post;
  });
  const gateLineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0),
  ]);
  const gateLine = new THREE.Line(gateLineGeometry, lineMaterial);gate.add(gateLine);
  const target = new THREE.Group();group.add(target);
  flat(target, new THREE.RingGeometry(.975, 1, 64), mint);
  const targetCenter = flat(target, new THREE.RingGeometry(.12, .16, 24), mint);
  const corridor = new THREE.Group();group.add(corridor);
  const boundaries = [-1, 1].map(() => flat(corridor, new THREE.PlaneGeometry(1, 1), faint));
  const trailGeometry = new THREE.BufferGeometry();
  const trailPositions = new Float32Array(255 * 6 * 3);
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  trailGeometry.setDrawRange(0, 0);
  const trail = add(group, trailGeometry, trailMaterial);
  trail.frustumCulled = false;
  const finitePoint = value => value && Number.isFinite(value.x) && Number.isFinite(value.z);
  const length = (value, fallback, min, max) => Number.isFinite(value) ? THREE.MathUtils.clamp(value, min, max) : fallback;
  const place = (object, value) => {
    object.visible = Boolean(finitePoint(value));
    if (!object.visible) return false;
    object.position.set(value.x, .10, value.z);
    object.rotation.y = -THREE.MathUtils.degToRad(Number.isFinite(value.heading) ? value.heading : 0);
    return true;
  };
  let lastGateWidth = null;
  return {
    set(cues) {
      group.visible = Boolean(cues);
      if (!cues) { trailGeometry.setDrawRange(0, 0); return; }
      if (place(gate, cues.gate)) {
        const width = length(cues.gate.width, 18, 2, 500);
        posts.forEach((post, i) => { post.position.x = (i ? 1 : -1) * width / 2; });
        if (width !== lastGateWidth) {
          const p = gateLineGeometry.attributes.position;
          p.setXYZ(0, -width / 2, 0, 0);p.setXYZ(1, width / 2, 0, 0);p.needsUpdate = true;
          gateLineGeometry.computeBoundingSphere();gateLine.computeLineDistances();lastGateWidth = width;
        }
      }
      if (place(target, cues.target)) {
        const radius = length(cues.target.radius, 12, 1, 250);
        target.scale.set(radius, 1, radius);
        // Keep the center mark small even for a large stopping area.
        targetCenter.scale.setScalar(Math.min(1, 2 / radius));
      }
      if (place(corridor, cues.corridor)) {
        const width = length(cues.corridor.width, 18, 2, 500);
        const span = length(cues.corridor.length, 90, 5, 1000);
        boundaries.forEach((line, i) => {
          line.position.x = (i ? 1 : -1) * width / 2;
          line.scale.set(.16, span, 1);
        });
      }
      trail.visible = cues.showTrack !== false && Array.isArray(cues.track);
      const points = trail.visible ? cues.track.filter(finitePoint).slice(-256) : [];
      let offset = 0;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1], b = points[i], dx = b.x - a.x, dz = b.z - a.z;
        const distance = Math.hypot(dx, dz);
        // Break teleports/resets and duplicate points instead of drawing a false track.
        if (distance < .03 || distance > 100) continue;
        const sx = -dz / distance * .12, sz = dx / distance * .12;
        for (const [x, z] of [[a.x+sx,a.z+sz],[a.x-sx,a.z-sz],[b.x+sx,b.z+sz],
          [a.x-sx,a.z-sz],[b.x-sx,b.z-sz],[b.x+sx,b.z+sz]]) {
          trailPositions[offset++] = x;trailPositions[offset++] = .085;trailPositions[offset++] = z;
        }
      }
      trailGeometry.attributes.position.needsUpdate = true;
      trailGeometry.setDrawRange(0, offset / 3);
    },
    dispose() {
      const geometries = new Set(), materials = new Set();
      group.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) materials.add(object.material);
      });
      geometries.forEach(geometry => geometry.dispose());materials.forEach(material => material.dispose());
      scene.remove(group);
    },
  };
}
