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
  let createChartScene;
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
      return ['ready', 'fallback'].includes(status) && matches();
    },
    ensure() {
      if (
        (['ready', 'fallback'].includes(status) && matches()) ||
        ['loading', 'error'].includes(status)
      )
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
            if (unavailable) throw new Error('WebGL unavailable');
            scene = createScene(container, getOptions());
            prepare(scene);
            status = 'ready';
          } catch (error) {
            scene?.dispose();
            scene = null;
            // Renderer/terrain bugs are recoverable errors, not evidence that
            // the user's browser lacks WebGL.
            if (!/webgl|creating.*context/i.test(error.message)) throw error;
            unavailable = true;
            createChartScene ||= (await import('../rendering/chart-scene.js')).createChartScene;
            if (ticket !== generation) return;
            scene = createChartScene(container, getOptions());
            prepare(scene);
            status = 'fallback';
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
