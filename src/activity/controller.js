import { activityState } from './state.js';

// One owner for playback and the interaction gates. Temporary overlays suspend
// motion without changing the user's pause/resume choice.
export function createActivityController({ getContext, onStart }) {
  let paused = true;
  const context = () => {
    const value = getContext();
    return { ...value, paused: paused || Boolean(value.overlayOpen || value.hidden) };
  };
  const unobstructed = (value) =>
    !value.hidden &&
    !value.reading &&
    !value.decisionOpen &&
    !value.briefingOpen &&
    !value.overlayOpen;

  return {
    context,
    get state() {
      return activityState(context());
    },
    get paused() {
      return paused;
    },
    get controlsEnabled() {
      return ['free-running', 'free-paused', 'training-running', 'training-paused'].includes(
        this.state.id,
      );
    },
    get canRender() {
      return unobstructed(context());
    },
    get canSimulate() {
      const value = context();
      return !value.paused && unobstructed(value);
    },
    get canTickDecision() {
      const value = context();
      return value.decisionOpen && !value.hidden && !value.reading && !value.overlayOpen;
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
    },
    toggle() {
      switch (this.state.command) {
        case 'start':
          onStart();
          break;
        case 'pause':
          this.pause();
          break;
        case 'resume':
          this.resume();
          break;
      }
    },
  };
}
