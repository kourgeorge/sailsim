import * as THREE from 'three';
import { createMaterials } from './rendering/materials.js';
import { createYacht } from './rendering/yacht.js';
import { createEnvironment } from './rendering/environment.js';
import { createTrainingCues } from './rendering/training-cues.js';
import { getLocation } from './locations.js';
import { getWorldBodyDefinitions, localToWorld } from './world/bodies.js';
import { syncBodyTransform, impactMotion } from './rendering/body-motion.js';
import { disposeSceneResources } from './rendering/dispose.js';
import { createAnchorCloseup } from './rendering/anchor-closeup.js';
import { createRaceVisuals } from './racing/visuals.js';
import { createHelmCamera } from './rendering/helm-camera.js';

export function createScene(container, { locationId = 'haven' } = {}) {
  let dirty = true,
    lastState = null,
    lastVisualTime = null;
  const invalidate = () => {
    dirty = true;
    container.dataset.renderPending = 'true';
  };
  invalidate();
  const location = getLocation(locationId);
  container.dataset.location = location.id;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#b5c9d2');
  scene.fog = new THREE.FogExp2('#b7c7ce', 0.00031);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  const gl = renderer.getContext(),
    debug = gl.getExtension('WEBGL_debug_renderer_info');
  const software =
    debug && /swiftshader|llvmpipe|software/i.test(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL));
  let sailingPixelRatio = software ? 0.7 : Math.min(devicePixelRatio, 1.65);
  renderer.setPixelRatio(sailingPixelRatio);
  container.dataset.quality = software ? 'compatibility' : 'high';
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.shadowMap.enabled = !software;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.append(renderer.domElement);
  renderer.domElement.setAttribute(
    'aria-label',
    'Detailed 3D sailing yacht with working cockpit instruments, reflective sea and wooded island harbor',
  );
  const camera = new THREE.PerspectiveCamera(
    47,
    container.clientWidth / container.clientHeight,
    0.08,
    10000,
  );
  const materials = createMaterials(),
    environment = createEnvironment(scene, renderer, materials, {
      software,
      locationId: location.id,
    }),
    yacht = createYacht(materials);
  scene.add(yacht.group);
  const anchorCloseup = createAnchorCloseup(container, renderer, yacht.group, scene.environment, {
    onResize: invalidate,
  });
  const trainingCues = createTrainingCues(scene);
  const raceVisuals = createRaceVisuals(scene, materials);
  // Keep one transform root per physical hull; cloned fittings share GPU buffers.
  const vesselDefinitions = getWorldBodyDefinitions(location.id).filter(
    (body) => body.visual.type === 'yacht',
  );
  const vesselTemplate = createYacht(materials, { detailed: false }).group;
  const vessels = vesselDefinitions.map((definition) => {
    const group = vesselTemplate.clone(true);
    group.userData.bodyId = definition.id;
    group.scale.setScalar(definition.visual.scale);
    group.traverse((object) => {
      object.castShadow = false;
    });
    syncBodyTransform(group, definition, 0, 0, definition.visual.index);
    scene.add(group);
    const tethers = (definition.visual.mooringLines || []).map((line) => {
      const mesh = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(),
          new THREE.Vector3(),
          new THREE.Vector3(),
        ]),
        new THREE.LineBasicMaterial({ color: '#b7aa87' }),
      );
      scene.add(mesh);
      return { mesh, ...line };
    });
    return { group, definition, tethers };
  });
  const contactRings = Array.from({ length: 8 }, () => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.72, 1, 32),
      new THREE.MeshBasicMaterial({
        color: '#dcf1e9',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.visible = false;
    scene.add(ring);
    return ring;
  });
  let disposed = false,
    frameCount = 0,
    frameAverage = 16;
  let view = 'chase',
    orbit = 0.1,
    elevation = 0,
    zoom = 1,
    lastFrameTime = null,
    dragPointer = null,
    lastX = 0,
    lastY = 0;
  const offset = new THREE.Vector3(),
    target = new THREE.Vector3(),
    desired = new THREE.Vector3(),
    up = new THREE.Vector3(0, 1, 0);
  const helmCamera = createHelmCamera();
  const views = {
    chase: { fov: 47 },
    helm: { fov: 72 },
    deck: { fov: 66 },
    aerial: { fov: 47 },
  };
  function resize() {
    const width = container.clientWidth,
      height = container.clientHeight;
    if (disposed || width < 1 || height < 1) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    invalidate();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  const mobile = window.matchMedia('(max-width: 900px)');
  const controlsOpen = () =>
    mobile.matches &&
    Boolean(
      document.querySelector('.mobile-controls-drawer.is-open, #systems-drawer:not([hidden])'),
    );
  const pointerDown = (e) => {
    if (controlsOpen() || !e.isPrimary || e.button !== 0 || dragPointer !== null) return;
    dragPointer = e.pointerId;
    lastX = e.clientX;
    lastY = e.clientY;
    renderer.domElement.setPointerCapture(e.pointerId);
  };
  const pointerMove = (e) => {
    if (e.pointerId !== dragPointer) return;
    if (controlsOpen()) {
      pointerUp(e);
      return;
    }
    orbit += (e.clientX - lastX) * 0.006;
    elevation = THREE.MathUtils.clamp(elevation + (e.clientY - lastY) * 0.003, -0.3, 0.65);
    lastX = e.clientX;
    lastY = e.clientY;
    invalidate();
  };
  const pointerUp = (e) => {
    if (e.pointerId !== dragPointer) return;
    dragPointer = null;
    if (renderer.domElement.hasPointerCapture(e.pointerId))
      renderer.domElement.releasePointerCapture(e.pointerId);
  };
  const wheel = (e) => {
    if (controlsOpen()) return;
    e.preventDefault();
    zoom = THREE.MathUtils.clamp(zoom + e.deltaY * 0.0008, 0.48, 2.2);
    invalidate();
  };
  const resetCamera = () => {
    if (controlsOpen()) return;
    orbit = 0;
    elevation = 0;
    zoom = 1;
    invalidate();
  };
  renderer.domElement.addEventListener('webglcontextrestored', invalidate);
  window.addEventListener('sail:text-size', invalidate);
  renderer.domElement.addEventListener('dblclick', resetCamera);
  renderer.domElement.addEventListener('pointerdown', pointerDown);
  renderer.domElement.addEventListener('pointermove', pointerMove);
  renderer.domElement.addEventListener('pointerup', pointerUp);
  renderer.domElement.addEventListener('pointercancel', pointerUp);
  renderer.domElement.addEventListener('lostpointercapture', pointerUp);
  renderer.domElement.addEventListener('wheel', wheel, { passive: false });
  function render(state, time) {
    // Study mode hides the simulator. Never let a zero-sized surface introduce
    // NaN framing into the camera position; that would survive becoming visible.
    if (disposed || container.clientWidth < 1 || container.clientHeight < 1) return;
    // Wall time belongs only to camera response/performance diagnostics.
    // All environmental and vessel animation uses the caller's visual time.
    const now = performance.now(),
      elapsed = lastFrameTime === null ? 1 / 60 : (now - lastFrameTime) / 1000;
    const dt = Math.min(0.1, Math.max(0.001, elapsed));
    lastFrameTime = now;
    frameCount++;
    frameAverage = frameAverage * 0.95 + elapsed * 1000 * 0.05;
    if (!software && frameCount === 30 && frameAverage > 45)
      sailingPixelRatio = Math.min(devicePixelRatio, 0.85);
    if (renderer.getPixelRatio() !== sailingPixelRatio) {
      renderer.setPixelRatio(sailingPixelRatio);
      resize();
    }
    container.dataset.fps = (1000 / frameAverage).toFixed(1);
    container.dataset.frames = frameCount;
    const roll = Math.sin(time * 0.72) * 0.008 * (state.windSpeed / 12),
      pitch = Math.sin(time * 0.95) * 0.005;
    const playerImpact = impactMotion(
      { ...state, mass: 5600, lastImpact: state.collision },
      state.elapsed || 0,
    );
    yacht.group.position.set(state.x, Math.sin(time * 0.8) * 0.045, state.z);
    yacht.group.rotation.set(
      pitch + playerImpact.pitch,
      (-state.heading * Math.PI) / 180,
      (state.heel * Math.PI) / 180 + roll + playerImpact.roll,
    );
    yacht.update(state, time);
    environment.excludeHullWater(yacht.group);
    environment.update(state, time);
    raceVisuals.update(time);
    container.dataset.raceBoats = String(raceVisuals.count);
    const worldBodies = new Map((state.worldBodies || []).map((body) => [body.id, body]));
    vessels.forEach(({ group, definition, tethers }, i) => {
      const body = worldBodies.get(definition.id) || definition;
      syncBodyTransform(group, body, state.elapsed || 0, time, i);
      for (const tether of tethers) {
        const cleat = localToWorld(body, tether.local.x, tether.local.z),
          anchor = tether.fixed,
          positions = tether.mesh.geometry.attributes.position;
        positions.setXYZ(0, cleat.x, 1.1 * definition.visual.scale, cleat.z);
        positions.setXYZ(1, (cleat.x + anchor.x) / 2, 0.42, (cleat.z + anchor.z) / 2);
        positions.setXYZ(2, anchor.x, 0.99, anchor.z);
        positions.needsUpdate = true;
        tether.mesh.geometry.computeBoundingSphere();
      }
    });
    const impacts = (state.collisionEvents || [])
      .filter(
        (event) =>
          (state.elapsed || 0) - event.time >= 0 && (state.elapsed || 0) - event.time < 1.3,
      )
      .slice(-contactRings.length);
    contactRings.forEach((ring, i) => {
      const event = impacts[i];
      ring.visible = Boolean(event);
      if (!event) return;
      const age = (state.elapsed || 0) - event.time;
      ring.position.set(event.point.x, 0.03, event.point.z);
      ring.scale.setScalar(0.25 + age * 2.6);
      ring.material.opacity = (1 - age / 1.3) * 0.55;
    });
    container.dataset.worldVessels = String(vessels.length);
    container.dataset.worldBodies = String(worldBodies.size);
    const heading = (state.heading * Math.PI) / 180,
      framing = Math.max(1, 0.9 / camera.aspect),
      smooth = 1 - Math.exp(-dt * 7);
    let cameraMoving;
    if (view === 'helm') {
      cameraMoving = helmCamera.update(camera, yacht.group, { orbit, elevation, smooth });
    } else {
      if (view === 'deck') {
        // Orbit around the cockpit from outside the hull. Portrait screens need
        // more distance to retain the deck and surrounding water horizontally.
        const cockpitFraming = Math.max(1, 0.85 / camera.aspect);
        target.set(0, 1.5, 1).applyAxisAngle(up, -heading).add(yacht.group.position);
        offset
          .set(7 * Math.cos(orbit), 4.5 + elevation * 5, 6 + Math.sin(orbit) * 7)
          .multiplyScalar(zoom * cockpitFraming)
          .applyAxisAngle(up, -heading);
        desired.copy(target).add(offset);
      } else if (view === 'aerial') {
        offset
          .set(
            Math.sin(orbit) * 55 * zoom,
            (85 + elevation * 40) * zoom,
            Math.cos(orbit) * 55 * zoom,
          )
          .applyAxisAngle(up, -heading);
        desired.copy(offset).add(yacht.group.position);
        target.set(state.x, 0, state.z);
      } else {
        const angle = orbit + 0.68;
        offset
          .set(
            Math.sin(angle) * 30 * zoom * framing,
            (11 + elevation * 20) * zoom * framing,
            Math.cos(angle) * 30 * zoom * framing,
          )
          .applyAxisAngle(up, -heading);
        desired.copy(offset).add(yacht.group.position);
        target.set(state.x, 6.8, state.z);
      }
      camera.position.lerp(desired, smooth);
      cameraMoving = camera.position.distanceToSquared(desired) > 1e-6;
      if (!cameraMoving) camera.position.copy(desired);
      camera.lookAt(target);
    }
    const helmFov = camera.aspect < 1 ? 90 : views.helm.fov;
    const desiredFov =
      view === 'helm' ? THREE.MathUtils.clamp(helmFov * zoom, 25, 100) : views[view].fov;
    camera.fov = THREE.MathUtils.lerp(camera.fov, desiredFov, smooth);
    const zoomMoving = Math.abs(camera.fov - desiredFov) > 0.001;
    if (!zoomMoving) camera.fov = desiredFov;
    camera.updateProjectionMatrix();
    dirty = cameraMoving || zoomMoving;
    renderer.render(scene, camera);
    const sceneCalls = renderer.info.render.calls,
      sceneTriangles = renderer.info.render.triangles;
    const anchorVisible = anchorCloseup.render(state);
    // Read-only diagnostics for browser quality/performance verification.
    container.dataset.drawCalls = sceneCalls + (anchorVisible ? renderer.info.render.calls : 0);
    container.dataset.triangles =
      sceneTriangles + (anchorVisible ? renderer.info.render.triangles : 0);
    container.dataset.camera = view;
    container.dataset.fov = camera.fov.toFixed(1);
    lastState = state;
    lastVisualTime = time;
    container.dataset.renderPending = String(dirty);
  }
  camera.position.set(location.start.x + 20, 13, location.start.z + 27);
  return {
    locationId: location.id,
    render,
    invalidate,
    renderIfNeeded(state, time) {
      if (dirty || state !== lastState || time !== lastVisualTime) render(state, time);
      // An idle pause is not a slow GPU frame. Exclude it from camera smoothing
      // and the automatic quality decision when rendering next resumes.
      else lastFrameTime = null;
    },
    getInstrumentCanvas: () => yacht.instrumentCanvas,
    setRace(race) {
      if (disposed) return;
      raceVisuals.set(race);
      invalidate();
    },
    setTrainingCues(cues) {
      if (disposed) return;
      trainingCues.set(cues);
      container.dataset.trainingCues = String(Boolean(cues));
      invalidate();
    },
    setView(v) {
      if (disposed || !views[v]) return;
      if (view !== v) helmCamera.reset();
      view = v;
      orbit = 0;
      elevation = 0;
      zoom = 1;
      invalidate();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      const canvas = renderer.domElement;
      canvas.removeEventListener('webglcontextrestored', invalidate);
      window.removeEventListener('sail:text-size', invalidate);
      for (const [event, handler] of [
        ['dblclick', resetCamera],
        ['pointerdown', pointerDown],
        ['pointermove', pointerMove],
        ['pointerup', pointerUp],
        ['pointercancel', pointerUp],
        ['lostpointercapture', pointerUp],
        ['wheel', wheel],
      ])
        canvas.removeEventListener(event, handler);
      trainingCues.dispose();
      anchorCloseup.dispose();
      const excludedTextures = environment.dispose();
      disposeSceneResources(scene, { extraMaterials: Object.values(materials), excludedTextures });
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
