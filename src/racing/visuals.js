import * as THREE from 'three';
import { createYacht } from '../rendering/yacht.js';
import { MARK_RADIUS } from './race.js';

export function createRaceVisuals(scene, materials) {
  const root = new THREE.Group();
  root.name = 'Race fleet and numbered course';
  root.visible = false;
  scene.add(root);
  const boats = [],
    marks = [];
  let current = null;
  function label(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = text.length === 1 ? 96 : 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#102b36';
    ctx.fillRect(0, 0, canvas.width, 96);
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvas.width - 8, 88);
    ctx.fillStyle = color;
    ctx.font = 'bold 43px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, 50);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(canvas),
        depthTest: true,
        sizeAttenuation: false,
        transparent: true,
      }),
    );
    sprite.scale.set(0.065, 0.024375, 1);
    return sprite;
  }
  function clear() {
    // The yachts share some base materials with the scene. Dispose only owned
    // geometry/materials when the whole scene is disposed; reuse this fleet.
    root.visible = false;
    current = null;
  }
  return {
    set(race) {
      if (!race) {
        clear();
        return;
      }
      current = race;
      root.visible = true;
      if (!boats.length)
        for (const rival of race.racers.slice(1)) {
          const cloth = materials.cloth.clone();
          cloth.color.set(rival.color);
          const navy = materials.navy.clone();
          navy.color.set(rival.color);
          const boat = createYacht({ ...materials, cloth, navy }, { detailed: false });
          const main = new THREE.Mesh(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0, 13, 0),
              new THREE.Vector3(0, 0, 5.2),
            ]),
            cloth,
          );
          main.geometry.computeVertexNormals();
          main.position.set(0, 3, -1.95);
          boat.group.add(main);
          const jib = new THREE.Mesh(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0, 15, 4.55),
              new THREE.Vector3(0, 0.6, 4.7),
            ]),
            cloth,
          );
          jib.geometry.computeVertexNormals();
          jib.position.set(0, 1.5, -6.5);
          boat.group.add(jib);
          boat.raceSails = { main, jib };
          const name = label(rival.name, rival.color);
          name.position.y = 18;
          boat.group.add(name);
          root.add(boat.group);
          boats.push(boat);
        }
      for (let i = 0; i < 4; i++) {
        if (!marks[i]) {
          const group = new THREE.Group();
          const material = new THREE.MeshBasicMaterial({
            color: '#f4c87b',
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(MARK_RADIUS - 0.6, MARK_RADIUS, 64),
            material,
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.15;
          group.add(ring);
          const buoy = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.8, 2.3, 12), material);
          buoy.position.y = 1.1;
          group.add(buoy);
          const number = label(String(i + 1), '#f4c87b');
          number.scale.set(0.026, 0.026, 1);
          number.position.y = 4;
          group.add(number);
          root.add(group);
          marks.push({ group, material });
        }
        const mark = race.course.marks[i];
        marks[i].group.visible = Boolean(mark);
        if (mark) marks[i].group.position.set(mark.x, 0, mark.z);
      }
    },
    update(time) {
      if (!current) return;
      boats.forEach((boat, i) => {
        const s = current.racers[i + 1].state;
        boat.group.position.set(s.x, Math.sin(time * 0.8 + i) * 0.04, s.z);
        boat.group.rotation.set(0, (-s.heading * Math.PI) / 180, (s.heel * Math.PI) / 180);
        boat.update(s, time);
        const side = -Math.sign(s.apparentWindAngle || 1);
        boat.raceSails.main.rotation.y = (side * s.mainSheet * Math.PI) / 180;
        const jibAngle = (side * s.jibSheet * Math.PI) / 180;
        // Keep the head and tack on the forestay; only the clew moves with trim.
        const points = boat.raceSails.jib.geometry.attributes.position;
        points.setXYZ(2, Math.sin(jibAngle) * 4.7, 0.6, Math.cos(jibAngle) * 4.7);
        points.needsUpdate = true;
        boat.raceSails.jib.geometry.computeVertexNormals();
      });
      marks.forEach(({ material }, i) => {
        const next = current.racers[0].mark;
        material.color.set(i < next ? '#5b8279' : i === next ? '#fff0a9' : '#dba85d');
        material.opacity = i === next ? 0.8 : 0.28;
      });
    },
    get count() {
      return current ? boats.length : 0;
    },
  };
}
