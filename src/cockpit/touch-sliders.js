// Native ranges can abandon a touch drag that starts vertically, even with
// touch-action:none. Own that pointer until release; mouse and keyboard keep
// their native behavior, and touches elsewhere in the drawer can still scroll.
export function mountTouchSliders(mobile) {
  let active = null;
  const selector = '.mobile-controls-drawer input[type=range], .systems-drawer input[type=range]';

  function update(clientX) {
    const { input, rect } = active;
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const inset = Math.min(8, rect.width / 2);
    const ratio = Math.max(
      0,
      Math.min(1, (clientX - rect.left - inset) / Math.max(1, rect.width - inset * 2)),
    );
    const step = input.step === 'any' ? 0 : Number(input.step || 1);
    const value = min + ratio * (max - min);
    const rounded = step ? min + Math.round((value - min) / step) * step : value;
    const previous = input.value;
    input.value = String(Number(Math.max(min, Math.min(max, rounded)).toPrecision(12)));
    if (input.value !== previous) input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function finish() {
    if (!active) return;
    const { input, pointerId, original } = active;
    active = null;
    if (input.hasPointerCapture(pointerId)) input.releasePointerCapture(pointerId);
    if (input.value !== original) input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  document.addEventListener(
    'pointerdown',
    (event) => {
      const input = event.target.closest(selector);
      if (
        !mobile.matches ||
        !input ||
        input.disabled ||
        input.closest('[inert]') ||
        event.pointerType === 'mouse' ||
        !event.isPrimary ||
        event.button !== 0 ||
        active
      )
        return;
      active = {
        input,
        pointerId: event.pointerId,
        original: input.value,
        rect: input.getBoundingClientRect(),
      };
      input.focus({ preventScroll: true });
      input.setPointerCapture(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
      update(event.clientX);
    },
    true,
  );
  document.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerId !== active?.pointerId) return;
      if (active.input.disabled || !active.input.getClientRects().length) {
        finish();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      update(event.clientX);
    },
    true,
  );
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    document.addEventListener(
      type,
      (event) => {
        if (event.pointerId !== active?.pointerId) return;
        event.stopPropagation();
        finish();
      },
      true,
    );
  }
  window.addEventListener('blur', finish);
  mobile.addEventListener('change', finish);
}
