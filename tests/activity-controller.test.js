import test from 'node:test';
import assert from 'node:assert/strict';
import { createActivityController } from '../src/activity/controller.js';

test('temporary overlays stop motion without changing the playback choice', () => {
  const context = { mode: 'explore' };
  const controller = createActivityController({ getContext: () => context });
  controller.toggle();
  assert.equal(controller.state.id, 'free-running');
  assert.equal(controller.canSimulate, true);
  context.overlayOpen = true;
  assert.equal(controller.state.id, 'free-paused');
  assert.equal(controller.canSimulate, false);
  assert.equal(controller.canRender, false);
  context.overlayOpen = false;
  assert.equal(controller.canSimulate, true);
  controller.pause();
  context.overlayOpen = true;
  context.overlayOpen = false;
  assert.equal(controller.canSimulate, false);
  assert.equal(controller.canRender, true);
});

test('lesson launch delegates to assessment and cannot start free motion', () => {
  const context = { mode: 'learn' };
  let starts = 0;
  const controller = createActivityController({ getContext: () => context, onStart: () => starts++ });
  controller.toggle();
  assert.equal(starts, 1);
  assert.equal(controller.paused, true);
  context.practiceActive = true;
  controller.toggle();
  assert.equal(controller.canSimulate, true);
  context.reading = true;
  assert.equal(controller.canRender, false);
  assert.equal(controller.controlsEnabled, false);
  controller.toggle();
  assert.equal(starts, 2);
});

test('decision scenarios expose no misleading playback action and suspend their timers in study', () => {
  const context = { mode: 'learn', decisionOpen: true, decisionActive: true };
  const controller = createActivityController({ getContext: () => context, onStart: () => assert.fail('Unexpected restart') });
  assert.equal(controller.state.command, undefined);
  assert.equal(controller.state.action, undefined);
  controller.toggle();
  assert.equal(controller.paused, true);
  assert.equal(controller.canTickDecision, true);
  for (const gate of ['hidden', 'reading', 'overlayOpen']) {
    context[gate] = true;
    assert.equal(controller.canTickDecision, false);
    context[gate] = false;
  }
  context.decisionActive = false;
  assert.equal(controller.state.command, undefined);
});
