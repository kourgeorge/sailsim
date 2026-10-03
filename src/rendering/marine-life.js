import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createMarineEncounters } from '../world/marine-encounters.js';

function animalGeometry(dolphin) {
  const positions = [],
    colors = [],
    indices = [],
    parts = [];
  const sections = dolphin
    ? [
        [-1.7, 0.035, 0.035],
        [-1.4, 0.09, 0.07],
        [-1.03, 0.17, 0.17],
        [-0.78, 0.3, 0.29],
        [-0.3, 0.36, 0.34],
        [0.25, 0.29, 0.29],
        [0.8, 0.15, 0.18],
        [1.3, 0.065, 0.07],
        [1.5, 0.04, 0.04],
      ]
    : [
        [-0.44, 0.015, 0.035],
        [-0.28, 0.1, 0.14],
        [0, 0.13, 0.18],
        [0.25, 0.065, 0.1],
        [0.4, 0.025, 0.035],
      ];
  const back = new THREE.Color(dolphin ? '#536f79' : '#688f91');
  const belly = new THREE.Color(dolphin ? '#bbc9c6' : '#dae1c7');
  const radial = 10;
  sections.forEach(([z, width, height], row) => {
    for (let i = 0; i <= radial; i++) {
      const angle = (i / radial) * Math.PI * 2,
        y = Math.sin(angle);
      positions.push(Math.cos(angle) * width, y * height, z);
      const color = back.clone().lerp(belly, THREE.MathUtils.smoothstep(-y, -0.15, 0.8));
      colors.push(color.r, color.g, color.b);
      if (row && i < radial) {
        const a = row * (radial + 1) + i,
          b = a - radial - 1;
        indices.push(b, b + 1, a, b + 1, a + 1, a);
      }
    }
  });
  const body = new THREE.BufferGeometry();
  body.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  body.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  body.setIndex(indices);
  body.computeVertexNormals();
  parts.push(body.toNonIndexed());
  body.dispose();
  const fin = (points) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
    geometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(
        points.flatMap(() => [back.r, back.g, back.b]),
        3,
      ),
    );
    geometry.computeVertexNormals();
    parts.push(geometry);
  };
  if (dolphin) {
    const outline = [
      [-0.15, 0.25],
      [0.02, 0.36],
      [0.18, 0.69],
      [0.27, 0.73],
      [0.22, 0.44],
      [0.4, 0.29],
      [0.62, 0.2],
    ];
    const triangles = THREE.ShapeUtils.triangulateShape(
      outline.map(([z, y]) => new THREE.Vector2(z, y)),
      [],
    );
    fin(
      triangles.flatMap((triangle) =>
        triangle.map((index) => [0, outline[index][1], outline[index][0]]),
      ),
    );
    for (const side of [-1, 1]) {
      const eyeSource = new THREE.SphereGeometry(0.028, 6, 4);
      eyeSource.translate(side * 0.17, 0.09, -1.01);
      const eye = eyeSource.toNonIndexed();
      eyeSource.dispose();
      eye.deleteAttribute('uv');
      eye.setAttribute(
        'color',
        new THREE.BufferAttribute(
          new Float32Array(eye.attributes.position.count * 3).fill(0.035),
          3,
        ),
      );
      parts.push(eye);
      fin([
        [side * 0.22, -0.08, -0.65],
        [side * 0.8, -0.22, 0.05],
        [side * 0.26, -0.14, -0.05],
      ]);
      fin([
        [0, 0, 1.22],
        [side * 0.73, 0.035, 1.66],
        [side * 0.4, 0, 1.82],
        [0, 0, 1.22],
        [side * 0.4, 0, 1.82],
        [0, 0, 1.53],
      ]);
    }
  } else {
    fin([
      [0, 0, 0.31],
      [0, 0.23, 0.59],
      [0, 0, 0.48],
      [0, 0, 0.31],
      [0, 0, 0.48],
      [0, -0.23, 0.59],
    ]);
    fin([
      [0, 0.12, -0.12],
      [0, 0.32, 0.1],
      [0, 0.1, 0.23],
    ]);
  }
  const geometry = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  return geometry;
}

export function createMarineLife(scene, locationId, quality, options) {
  const group = new THREE.Group();
  group.name = 'Occasional marine life';
  scene.add(group);
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.55,
    side: THREE.DoubleSide,
  });
  const dolphins = new THREE.InstancedMesh(animalGeometry(true), material, 3);
  const fish = new THREE.InstancedMesh(animalGeometry(false), material, 12);
  dolphins.name = 'Dolphins';
  fish.name = 'Surface fish';
  for (const mesh of [dolphins, fish]) {
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.count = 0;
    group.add(mesh);
  }
  // One small instanced surface mesh for all ripples; no particles or extra pass.
  const ringGeometry = new THREE.RingGeometry(0.8, 1, 20, 2);
  const ringColors = [];
  for (let i = 0; i < ringGeometry.attributes.position.count; i++) {
    const radius = Math.hypot(
      ringGeometry.attributes.position.getX(i),
      ringGeometry.attributes.position.getY(i),
    );
    ringColors.push(1, 1, 1, Math.max(0, Math.sin(((radius - 0.8) / 0.2) * Math.PI)));
  }
  ringGeometry.setAttribute('color', new THREE.Float32BufferAttribute(ringColors, 4));
  ringGeometry.rotateX(-Math.PI / 2);
  const ripples = new THREE.InstancedMesh(
    ringGeometry,
    new THREE.MeshBasicMaterial({
      color: '#bfdbd4',
      transparent: true,
      opacity: 0.18,
      vertexColors: true,
      depthWrite: false,
    }),
    15,
  );
  ripples.name = 'Wildlife ripples';
  ripples.frustumCulled = false;
  ripples.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  ripples.count = 0;
  group.add(ripples);
  const encounters = createMarineEncounters(locationId, options),
    transform = new THREE.Object3D();
  let budget = quality;
  return {
    group,
    encounters,
    setQuality(next) {
      budget = next;
    },
    update(state, time) {
      const slots = encounters.update(state, time);
      const small = ['low', 'minimum', 'compatibility'].includes(budget.name);
      dolphins.count = fish.count = ripples.count = 0;
      for (const { event } of slots) {
        if (!event) continue;
        const age = time - event.start,
          dolphin = event.kind === 'dolphin';
        const animals = dolphin ? dolphins : fish,
          count = dolphin ? (small ? 2 : 3) : small ? 6 : 12;
        const period = dolphin ? 4.8 : 2.1;
        for (let i = 0; i < count; i++) {
          const offset = i * (dolphin ? 0.85 : 0.31);
          const localAge = age - offset;
          if (localAge < 0 || localAge > event.duration - 1) continue;
          const phase = (localAge % period) / period;
          const swim = Math.sin(phase * Math.PI * 2);
          const side = ((i % 3) - 1) * (dolphin ? 2.1 : 1.15);
          const x = event.x + event.vx * age + Math.cos(event.heading) * side - event.vx * offset;
          const z = event.z + event.vz * age + Math.sin(event.heading) * side - event.vz * offset;
          if (
            Math.hypot(x - state.x, z - state.z) < 9 ||
            Math.hypot(x - state.x, z - state.z) > 180
          )
            continue;
          const departure = THREE.MathUtils.smoothstep(age, event.duration - 3, event.duration - 1);
          const y =
            (dolphin ? -0.55 + Math.max(0, swim) * 1.25 : -0.25 + Math.max(0, swim) * 0.86) -
            departure * (dolphin ? 1.5 : 1);
          transform.position.set(x, y, z);
          transform.rotation.set(
            Math.cos(phase * Math.PI * 2) * (dolphin ? 0.28 : 0.62),
            -event.heading,
            dolphin ? 0 : Math.sin(localAge * 9 + event.seed) * 0.12,
            'YXZ',
          );
          transform.scale.setScalar(dolphin ? 1 - i * 0.08 : 0.8 + (i % 3) * 0.14);
          transform.updateMatrix();
          animals.setMatrixAt(animals.count++, transform.matrix);
          if (Math.abs(swim) < 0.5) {
            const scale = (dolphin ? 0.8 : 0.35) + phase * (dolphin ? 1.7 : 0.7);
            transform.position.set(x, -0.025, z);
            transform.rotation.set(0, -event.heading, 0);
            transform.scale.set(scale, 1, scale * 0.65);
            transform.updateMatrix();
            ripples.setMatrixAt(ripples.count++, transform.matrix);
          }
        }
      }
      for (const mesh of [dolphins, fish, ripples]) {
        mesh.visible = mesh.count > 0;
        mesh.instanceMatrix.needsUpdate = true;
      }
    },
  };
}
