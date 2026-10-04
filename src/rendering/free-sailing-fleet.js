import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CATAMARAN } from '../vessels.js';
import { catamaranHullGeometry, catamaranDeckGeometry } from './catamaran-hull.js';
import { box, bar, mesh, batchStaticMeshes } from './materials.js';
import { createYacht, makeSail } from './yacht.js';
import { syncBodyTransform } from './body-motion.js';

function catamaran(mat) {
  const group = new THREE.Group();
  group.name = 'Cruising catamaran';
  const shell = mat.gelcoat.clone();
  shell.side = THREE.DoubleSide;
  const hull = catamaranHullGeometry(),
    deck = catamaranDeckGeometry();
  for (const side of [-1, 1]) {
    const x = (side * CATAMARAN.hullSpacing) / 2;
    mesh(group, hull, shell, x, 0, 0);
    mesh(group, deck, mat.grip, x, 0, 0);
    box(group, mat.navy, x, 0.55, 0.1, 1.62, 0.18, 6.6, 0.08);
    box(group, mat.navy, x, -0.82, -0.6, 0.2, 0.76, 3.4, 0.05);
    for (const z of [-4.5, -1, 2, 5])
      bar(group, mat.steel, [x + side * 0.55, 1.4, z], [x + side * 0.55, 2.25, z], 0.025);
    bar(group, mat.steel, [x + side * 0.55, 2.25, -4.5], [x + side * 0.55, 2.25, 5], 0.025);
  }
  box(group, mat.gelcoat, 0, 1.05, 0.8, 4.4, 0.5, 7, 0.12);
  box(group, mat.grip, 0, 1.1, -4, 4.3, 0.06, 2.5, 0.02);
  box(group, mat.gelcoat, 0, 1.65, -0.5, 4.3, 0.65, 4, 0.22);
  box(group, mat.glass, 0, 2.4, -0.5, 4.15, 0.95, 3.8, 0.25);
  for (const side of [-1, 1]) {
    box(group, mat.gelcoat, side * 1.98, 2.4, -0.5, 0.12, 1, 0.09, 0.02);
    box(group, mat.gelcoat, side * 1.1, 2.4, -2.35, 0.1, 1, 0.1, 0.02);
  }
  box(group, mat.gelcoat, 0, 3, -0.3, 4.7, 0.2, 4.5, 0.1);
  box(group, mat.navy, 0, 3.12, 0.5, 3.5, 0.04, 2.3, 0.01);
  box(group, mat.cushion, 0, 1.45, 4.4, 3.7, 0.4, 0.9, 0.1);
  for (const side of [-1, 1]) {
    bar(group, mat.steel, [side * 2, 1.4, 4.7], [side * 2, 3.05, 4.7], 0.04);
    bar(group, mat.steel, [side * 2.8, 1.5, 0], [0, 19, -1.7], 0.018);
  }
  box(group, mat.gelcoat, 0, 3.12, 3.6, 4.4, 0.12, 3, 0.06);
  bar(group, mat.aluminum, [0, 1.2, -1.7], [0, 19, -1.7], 0.11, 10);
  bar(group, mat.aluminum, [0, 4.3, -1.7], [0, 4.3, 5.3], 0.1, 8);
  bar(group, mat.steel, [0, 19, -1.7], [0, 1.55, -5.5], 0.018);
  box(group, mat.navy, 0, 4.45, 1.6, 0.4, 0.35, 6.5, 0.06);
  batchStaticMeshes(group, mergeGeometries);
  return group;
}

function sailingRig(group, mat) {
  const rig = new THREE.Group();
  const main = new THREE.Group();
  main.position.set(0, 3, -1.95);
  rig.add(main);
  makeSail(main, mat, { height: 14.35, foot: 5.2 }).update(0, 0, { angle: -0.45, side: -1 });
  const jib = new THREE.Group();
  jib.position.set(0, 1.4, -1.95);
  rig.add(jib);
  makeSail(jib, mat, { height: 15.6, foot: 3.6, jib: true, luffReach: 4.5 }).update(0, 0, {
    angle: -0.25,
    side: -1,
  });
  group.add(rig);
}

export function createFreeSailingFleet(scene, mat) {
  let entries = null;
  let visibleCount = 0;
  const templates = new Map();
  return {
    get count() {
      return visibleCount;
    },
    update(state, time) {
      const bodies = state.worldBodies.filter((body) => body.traffic);
      visibleCount = bodies.length;
      if (!entries && !bodies.length) return;
      if (!entries) {
        entries = bodies.map((body) => {
          const type = body.visual.vesselId;
          if (!templates.has(type)) {
            const template =
              type === 'catamaran' ? catamaran(mat) : createYacht(mat, { detailed: false }).group;
            if (type === 'monohull') sailingRig(template, mat);
            template.traverse((object) => {
              object.castShadow = false;
            });
            templates.set(type, template);
          }
          const group = templates.get(type).clone(true);
          group.name = `Free sailing ${type}`;
          group.userData.bodyId = body.id;
          scene.add(group);
          const wake = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 17),
            new THREE.ShaderMaterial({
              transparent: true,
              depthWrite: false,
              uniforms: { strength: { value: 0 }, time: { value: 0 } },
              vertexShader:
                'varying vec2 uvWake;void main(){uvWake=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
              fragmentShader: `varying vec2 uvWake;uniform float strength;uniform float time;
              void main(){float age=1.-uvWake.y;float edge=1.-smoothstep(.05,.5,abs(uvWake.x-.5));float foam=.6+.4*sin(age*75.-time*3.+sin(uvWake.x*53.));gl_FragColor=vec4(.77,.9,.87,edge*(1.-age)*foam*strength);}`,
            }),
          );
          wake.rotation.x = -Math.PI / 2;
          scene.add(wake);
          return { id: body.id, group, wake };
        });
      }
      const byId = new Map(bodies.map((body) => [body.id, body]));
      for (const [index, { id, group, wake }] of entries.entries()) {
        const body = byId.get(id);
        group.visible = wake.visible = Boolean(body);
        if (!body) continue;
        syncBodyTransform(group, body, state.elapsed || 0, time, index);
        const speed = Math.hypot(body.vx, body.vz);
        const angle = (body.heading * Math.PI) / 180;
        wake.visible = speed > 0.1;
        wake.position.set(body.x - Math.sin(angle) * 13, 0.08, body.z + Math.cos(angle) * 13);
        wake.rotation.z = -angle;
        wake.material.uniforms.strength.value = Math.min(0.2, speed * 0.15);
        wake.material.uniforms.time.value = time;
      }
    },
  };
}
