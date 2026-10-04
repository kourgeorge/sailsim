// Keep Three.js and all procedural scenery out of the browsing startup path.
// Yield through a paint before the synchronous GPU/geometry work begins.
const afterPaint = () =>
  new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

export function createSceneLoader({ container, getOptions, prepare, onChange }) {
  let scene = null;
  let status = 'idle';
  let generation = 0;
  let createScene;
  let unavailable = false;
  const matches = () => {
    const options = getOptions();
    return scene?.locationId === options.locationId && scene?.vesselId === options.vesselId;
  };
  return {
    get scene() {
      return scene;
    },
    get status() {
      return status;
    },
    get ready() {
      return unavailable || (status === 'ready' && matches());
    },
    ensure() {
      if (unavailable || (status === 'ready' && matches()) || ['loading', 'error'].includes(status))
        return;
      const ticket = ++generation;
      status = 'loading';
      void (async () => {
        try {
          await afterPaint();
          if (ticket !== generation) return;
          createScene ||= (await import('../scene.js')).createScene;
          if (ticket !== generation) return;
          await afterPaint();
          if (ticket !== generation) return;
          scene?.dispose();
          scene = null;
          container.replaceChildren();
          try {
            scene = createScene(container, getOptions());
            prepare(scene);
            status = 'ready';
          } catch (error) {
            // Preserve the existing chart/lesson fallback on devices without WebGL.
            scene?.dispose();
            scene = null;
            unavailable = true;
            status = 'fallback';
            console.error(error);
          }
        } catch (error) {
          if (ticket !== generation) return;
          status = 'error';
          console.error(error);
        }
        if (ticket === generation) onChange();
      })();
    },
    cancel() {
      if (!['loading', 'error'].includes(status)) return;
      generation++;
      status = scene ? 'ready' : 'idle';
    },
  };
}
