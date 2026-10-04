// Pointer events cover both a mouse click and a mobile tap without counting the
// synthetic click twice. A drag, cancellation or long hold breaks the sequence.
export function createSecretTaps(onSecret) {
  let active = null,
    count = 0,
    last = -Infinity;
  return {
    down(event) {
      if (!event.isPrimary || event.button !== 0) {
        active = null;
        count = 0;
        return;
      }
      active = { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp };
    },
    move(event) {
      if (
        active?.id === event.pointerId &&
        Math.hypot(event.clientX - active.x, event.clientY - active.y) > 10
      ) {
        active = null;
        count = 0;
      }
    },
    cancel() {
      active = null;
      count = 0;
    },
    up(event) {
      if (!active || active.id !== event.pointerId) return;
      const tap = active;
      active = null;
      if (
        event.timeStamp - tap.time > 450 ||
        Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 10
      ) {
        count = 0;
        return;
      }
      count = event.timeStamp - last < 600 ? count + 1 : 1;
      last = event.timeStamp;
      if (count === 5) {
        count = 0;
        onSecret();
      }
    },
  };
}
