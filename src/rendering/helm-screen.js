import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';

// Composite just the instrument at browser resolution. The WebGL screen writes
// an alpha opening with normal depth testing, so the wheel, hands and rigging
// still occlude it. This avoids increasing the framebuffer for the whole sea.
export function createHelmScreen(container, renderer, camera, yacht) {
  const screen = yacht.group.getObjectByName('helm-multifunction-screen');
  const canvas = yacht.instrumentCanvas;
  const display = new CSS3DRenderer();
  const layer = display.domElement;
  layer.className = 'helm-screen-layer';
  // CSS3D positions the canvas from a left-to-right origin. Localized text is
  // drawn inside the canvas; inheriting page RTL would shift the whole screen.
  layer.dir = 'ltr';
  layer.setAttribute('aria-hidden', 'true');
  Object.assign(layer.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
  layer.hidden = true;
  container.insertBefore(layer, renderer.domElement);
  renderer.domElement.style.position = 'relative';
  Object.assign(canvas.style, {
    width: `${canvas.width}px`,
    height: `${canvas.height}px`,
    pointerEvents: 'none',
    backfaceVisibility: 'hidden',
  });
  const object = new CSS3DObject(canvas);
  // CSS3DObject defaults to accepting events; sailing gestures stay on WebGL.
  canvas.style.pointerEvents = 'none';
  object.matrixAutoUpdate = false;
  const scene = new THREE.Scene();
  scene.add(object);
  const scale = new THREE.Matrix4().makeScale(
    screen.geometry.parameters.width / canvas.width,
    screen.geometry.parameters.height / canvas.height,
    1,
  );
  const material = screen.material;
  const blending = material.blending,
    premultipliedAlpha = material.premultipliedAlpha,
    beforeRender = screen.onBeforeRender;
  // NoBlending permits an opaque, depth-tested surface to write zero alpha.
  // Reflection cameras keep the original texture, including in water mirrors.
  material.blending = THREE.NoBlending;
  material.premultipliedAlpha = true;
  material.needsUpdate = true;
  let enabled = false;
  screen.onBeforeRender = function (...args) {
    beforeRender.apply(this, args);
    material.opacity = enabled && args[2] === camera ? 0 : 1;
  };
  let width = 0,
    height = 0;
  return {
    render(active) {
      enabled = active;
      layer.hidden = !active;
      if (!active) return;
      if (width !== container.clientWidth || height !== container.clientHeight) {
        width = container.clientWidth;
        height = container.clientHeight;
        display.setSize(width, height);
      }
      screen.updateWorldMatrix(true, false);
      object.matrix.copy(screen.matrixWorld).multiply(scale);
      display.render(scene, camera);
    },
    dispose() {
      screen.onBeforeRender = beforeRender;
      material.blending = blending;
      material.premultipliedAlpha = premultipliedAlpha;
      material.opacity = 1;
      material.needsUpdate = true;
      object.removeFromParent();
      layer.remove();
    },
  };
}
