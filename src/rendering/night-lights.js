import * as THREE from 'three';
import { navigationLights, lightIsOn, vesselLightVisible } from '../navigation/lights.js';
import { canvasTexture } from './materials.js';
import { navigationLightsLit } from '../sky-conditions.js';

export function createNightLights(scene, yacht, locationId) {
  const group = new THREE.Group();
  group.name = 'Night navigation lights';
  scene.add(group);
  const glow = canvasTexture(64, 64, (ctx) => {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.12, '#ffffff');
    gradient.addColorStop(0.3, '#ffffff80');
    gradient.addColorStop(1, '#ffffff00');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  });
  function lamp(parent, color, x, y, z, name) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glow,
        color,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    );
    sprite.name = name;
    sprite.position.set(x, y, z);
    parent.add(sprite);
    return sprite;
  }
  const aids = navigationLights(locationId).map((light) => {
    const sprite = lamp(group, light.color, light.x, light.y, light.z, light.label);
    if (light.kind === 'leading') {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, light.mountHeight, 8),
        new THREE.MeshStandardMaterial({ color: '#d4d7cc' }),
      );
      post.position.set(light.x, light.y - light.mountHeight / 2, light.z);
      group.add(post);
    }
    return { light, sprite };
  });
  const boat = new THREE.Group();
  boat.name = 'Yacht navigation lights';
  yacht.add(boat);
  const lamps = [
    ['port', '#ff3024', -0.5, 1.88, -6.05],
    ['starboard', '#2dff8a', 0.5, 1.88, -6.05],
    ['stern', '#fff2d1', 0, 1.9, 5.1],
    ['masthead', '#fff2d1', 0, 7.4, -1.8],
    ['anchor', '#fff2d1', 0, 14.8, -1.8],
  ].map(([kind, color, x, y, z]) => ({
    kind,
    sprite: lamp(boat, color, x, y, z, kind),
    fitting: yacht.getObjectByName(`${kind}-light-fitting`),
  }));
  // A shaded red cockpit lamp keeps controls and the deck readable after dark.
  const cockpit = new THREE.PointLight('#ff7560', 2.5, 8, 2);
  cockpit.position.set(0, 2.9, 2.7);
  boat.add(cockpit);
  const position = new THREE.Vector3();
  const lensOffset = new THREE.Vector3();
  return {
    group,
    update(state, time, camera) {
      // Lit from sunset to sunrise, and by day in fog, rain or storms.
      const lit = navigationLightsLit(state);
      group.visible = boat.visible = lit;
      cockpit.visible = state.timeOfDay === 'night';
      if (!lit) {
        for (const { fitting } of lamps) if (fitting) fitting.material.emissiveIntensity = 0.35;
        return;
      }
      for (const { light, sprite } of aids) {
        const body =
          light.kind === 'buoy' && state.worldBodies?.find((body) => body.id === light.id);
        if (body) sprite.position.set(body.x, light.y + Math.sin(time * 1.3) * 0.08, body.z);
        if (light.kind === 'lighthouse') {
          // The existing lantern glazing is opaque. Put the apparent source
          // on its viewer-facing surface, retaining depth occlusion by land.
          sprite.position.set(light.x, light.y, light.z);
          lensOffset.copy(camera.position).sub(sprite.position).normalize().multiplyScalar(2.3);
          sprite.position.add(lensOffset);
        }
        sprite.visible = lightIsOn(light, time);
        // Preserve a small visible point at range without illuminating the sea.
        sprite.scale.setScalar(Math.max(0.6, camera.position.distanceTo(sprite.position) * 0.012));
      }
      const bearing =
        (Math.atan2(camera.position.x - state.x, state.z - camera.position.z) * 180) / Math.PI;
      for (const { kind, sprite, fitting } of lamps) {
        sprite.visible = vesselLightVisible(kind, bearing - state.heading, state);
        if (fitting) fitting.material.emissiveIntensity = sprite.visible ? 0.35 : 0;
        sprite.getWorldPosition(position);
        sprite.scale.setScalar(Math.max(0.24, camera.position.distanceTo(position) * 0.012));
      }
    },
  };
}
