import { createChartRenderer } from './navigation/chart.js';
import './style.css';
import { mountSimulationControls } from './activity/ui.js';
import { createActivityController } from './activity/controller.js';
import { mountAppShell } from './app-shell.js';
import { initializeTextSize, mountTextSize } from './accessibility/text-size.js';
import { createManeuverLab } from './learning/maneuver-ui.js';
import { lessons, modules } from './learning/curriculum.js';
import {
  initializeLocalization,
  changeLanguage,
  getLanguage,
  observeTranslations,
  translate as t,
} from './i18n/runtime.js';
import './i18n/locale.css';
import { createLearning } from './learning/ui.js';
import { createScene } from './scene.js';
import { getLocation } from './locations.js';
import { createLearningTools } from './learning/tools-ui.js';
import { openLocations } from './learning/location-ui.js';
import { mountControls, applyControlPatch } from './controls.js';
import './systems.css';
import { createHelmDashboard } from './rendering/helm-dashboard.js';
import { mountCockpitControls } from './cockpit/controls.js';
import {
  HOLD_KEYS,
  PRESS_KEYS,
  applyHeldKeys,
  decorateControls,
  shortcutsTable,
  badge as keyBadge,
} from './cockpit/keyboard.js';
import { anchorControlAction } from './anchoring/control-action.js';
import { createPracticeState } from './learning/scenario-state.js';
import { initialState, step, refreshDerived, pointOfSail } from './physics.js';
import './mobile.css';
import { mountMobileLayout } from './mobile.js';
import { mountSailingAudio } from './audio/ui.js';

async function startApp() {
  initializeTextSize();
  let localeLoadError = false;
  try {
    await initializeLocalization(lessons, modules);
  } catch (error) {
    console.warn('Language pack unavailable', error.message);
    localeLoadError = true;
  }
  let sceneTime = 0;
  let lesson = 0,
    state = initialState(),
    mode = 'learn',
    camera = 'chase',
    challengeIndex = 0,
    challengeDone = false,
    challengeTime = 0;
  let learning, vesselControls, lab, learningTools, helmDashboard, cockpitControls, sailingAudio;
  mountAppShell({ lessonCount: lessons.length, mode });
  const $ = (s) => document.querySelector(s);
  let scene;
  try {
    scene = createScene($('#scene'));
  } catch (error) {
    $('#scene').innerHTML =
      '<div class="webgl-fallback"><h2>A browser with WebGL is needed for the 3D view.</h2><p>You can still use the chart, controls, and lessons.</p></div>';
    console.error(error);
  }

  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => $('#toast').classList.remove('show'), 4200);
  }
  function renderLessons() {
    learning?.refresh();
  }
  function updateLesson() {
    const l = lessons[lesson];
    $('#lesson-number').textContent = String(lesson + 1).padStart(2, '0');
    $('#scene-heading').textContent = l.title;
    $('#scene-subheading').textContent = l.sub;
    learning?.refresh();
  }
  function setMode(value) {
    learning?.closeReader();
    learning?.closeTraining();
    if (value !== 'maneuver') lab?.leave();
    if (value !== mode)
      learning?.cancel('Mode changed. Return to the lesson and restart practice.');
    mode = value;
    $('.simulator').dataset.mode = mode;
    document
      .querySelectorAll('button[data-mode]')
      .forEach((b) =>
        b.classList.toggle(
          'active',
          b.dataset.mode === mode || (mode === 'maneuver' && b.dataset.mode === 'challenge'),
        ),
      );
    $('.scene-title>span').style.visibility = mode === 'learn' ? 'visible' : 'hidden';
    if (mode === 'learn') updateLesson();
    else if (mode === 'maneuver') {
      renderLessons();
    } else {
      renderLessons();
      $('#scene-heading').textContent =
        mode === 'explore' ? 'Follow your curiosity.' : 'Find your next mark.';
      $('#scene-subheading').textContent =
        mode === 'explore'
          ? 'No route. No rush. Just the sea.'
          : 'Three buoys. One beautiful passage.';
      $('#card-eyebrow').textContent = mode === 'explore' ? 'FREE SAILING' : 'THE BUOY COURSE';
      $('#card-title').textContent =
        mode === 'explore' ? 'The islands are yours.' : 'Round the three amber buoys.';
      $('#card-body').textContent =
        mode === 'explore'
          ? 'Explore the coastline, experiment with sail trim, or change the breeze in Conditions. Open your chart to plan a passage.'
          : 'Sail within 35 metres of each buoy in order. Use your chart to locate the next mark and keep clear of shallow water.';
      $('#objective-text').textContent =
        mode === 'explore'
          ? 'Try the helm camera for a view from aboard.'
          : `Next mark: buoy ${challengeIndex + 1} of 3`;
      $('#objective-check').textContent = '○';
      $('#next-lesson').hidden = true;
    }
    sailingAudio?.sync(true);
  }
  function overlayOpen() {
    return $('#modal').open || Boolean(document.querySelector('.mobile-sheet[open]'));
  }
  const playback = createActivityController({
    getContext: () => ({
      reading: learning?.reading,
      decisionOpen: learning?.training,
      decisionActive: learning?.decisionActive,
      practiceActive: learning?.practiceActive,
      practicePrepared: learning?.prepared,
      briefingOpen: learning?.briefingOpen,
      practiceStatus: learning?.practiceStatus,
      overlayOpen: overlayOpen(),
      hidden: document.hidden,
      mode,
      maneuverActive: lab?.active,
    }),
    onStart: () => learning.resumeOrStart(),
  });
  const cockpitEnabled = () => playback.controlsEnabled;
  function syncPlayback() {
    sailingAudio?.sync();
    cockpitControls?.syncAvailability();
    const activity = playback.state,
      button = $('#play'),
      action = activity.action;
    const playbackAvailable = ['pause', 'resume'].includes(activity.command);
    button.hidden = !playbackAvailable;
    button.disabled = !playbackAvailable;
    $('#conditions').hidden = mode === 'learn' || Boolean(lab?.active);
    $('#reset').hidden = mode === 'learn';
    if (activity.command && button.dataset.action !== action) {
      button.dataset.action = action;
      button.replaceChildren(document.createTextNode(activity.command === 'pause' ? 'Ⅱ ' : '▶ '));
      const span = document.createElement('span');
      span.textContent = t(action);
      button.append(span, keyBadge('Space'));
      button.setAttribute('aria-label', t(action));
      button.title = `${t(action)} (Space)`;
    }
    const footer =
      mode === 'learn'
        ? t(activity.label)
        : state.grounded
          ? t('Aground · Reset to recover')
          : t(playback.paused ? 'Simulation paused' : 'Simulation running');
    if ($('#sim-status').textContent !== footer) $('#sim-status').textContent = footer;
    if (document.body.dataset.activity !== activity.id) {
      document.body.dataset.activity = activity.id;
      button.dataset.state = activity.id;
      learning?.updateStatus();
    }
  }
  function togglePlayback() {
    playback.toggle();
    sailingAudio?.sync(true);
    syncControls();
  }
  function syncControls() {
    refreshDerived(state);
    scene?.invalidate();
    cockpitControls?.update();
    helmDashboard?.update();
    $('#rudder').value = state.rudder;
    $('#trim').value = state.trim;
    $('#rudder-value').textContent =
      Math.abs(state.rudder) < 0.5
        ? 'Centered'
        : `${Math.abs(state.rudder).toFixed(0)}° ${state.rudder < 0 ? 'port' : 'starboard'}`;
    $('#trim-value').textContent = `${state.trim.toFixed(0)}°`;
    $('#sails span').textContent = state.sails ? 'Lower sails' : 'Raise sails';
    $('#reef').classList.toggle('on', state.reef);
    $('#reef span').textContent = state.reef ? `Reef ${state.reefLevel}` : 'Reef';
    $('#anchor span').textContent = t(anchorControlAction(state).label);
    $('#anchor').classList.toggle('on', state.anchor);
    $('#engine-throttle').value = state.throttle;
    $('#engine-throttle-value').textContent =
      Math.abs(state.throttle) < 0.01
        ? 'Neutral'
        : `${state.throttle < 0 ? 'Astern' : 'Ahead'} ${Math.round(Math.abs(state.throttle) * 100)}%`;
    syncPlayback();
  }
  $('#rudder').oninput = (e) => {
    applyControlPatch(state, { rudder: Number(e.target.value) });
    syncControls();
  };
  $('#trim').oninput = (e) => {
    applyControlPatch(state, { mainSheet: Number(e.target.value) });
    syncControls();
  };
  $('#engine-throttle').oninput = (e) => {
    applyControlPatch(state, { throttle: Number(e.target.value) });
    syncControls();
  };
  $('#engine-neutral').onclick = () => {
    applyControlPatch(state, { throttle: 0 });
    syncControls();
  };
  $('#center-helm').onclick = () => {
    applyControlPatch(state, { rudder: 0 });
    syncControls();
  };
  $('#play').onclick = togglePlayback;
  $('#sails').onclick = () => {
    applyControlPatch(state, { sails: state.sails > 0 ? 0 : 1 });
    syncControls();
    toast(
      state.sails
        ? 'Sails raised. Find the wind.'
        : 'Sails lowered. Your boat will coast to a stop.',
    );
  };
  $('#reef').onclick = () => {
    applyControlPatch(state, { reefLevel: (state.reefLevel + 1) % 3 });
    syncControls();
  };
  $('#anchor').onclick = () => {
    const action = anchorControlAction(state);
    if (action.needsTarget) {
      $('#cockpit-anchor-rode').focus();
      $('#cockpit-anchor-rode').select();
      toast(t('Choose a positive rode target.'));
      return;
    }
    applyControlPatch(state, action.patch);
    syncControls();
    toast(
      t(
        playback.paused && state.anchorWinchRunning
          ? 'Resume simulation to operate the windlass.'
          : state.anchorWinchRunning
            ? state.anchorRode > state.anchorPaidRode
              ? 'Lowering anchor'
              : 'Retrieving anchor'
            : 'Windlass stopped',
      ),
    );
  };
  $('#next-lesson').onclick = () => learning.select(Math.min(lesson + 1, lessons.length - 1));
  document.querySelectorAll('button[data-mode]').forEach(
    (b) =>
      (b.onclick = () => {
        if (b.dataset.mode === 'challenge') lab.library();
        else if (b.dataset.mode === 'learn' && mode === 'learn') learning.libraryModal();
        else setMode(b.dataset.mode);
      }),
  );
  function setCamera(value, { record = true } = {}) {
    camera = value;
    if (record) learning?.event('camera', camera);
    scene?.setView(camera);
    $('.simulator').dataset.view = camera;
    document.querySelectorAll('button[data-camera]').forEach((btn) => {
      btn.classList.toggle('selected', btn.dataset.camera === camera);
      btn.setAttribute('aria-pressed', String(btn.dataset.camera === camera));
    });
  }
  document
    .querySelectorAll('button[data-camera]')
    .forEach((b) => (b.onclick = () => setCamera(b.dataset.camera)));
  $('#reset').onclick = () => {
    lab?.cancel();
    learning?.cancel('Boat reset. Restart the assessed practice to record a new attempt.');
    state = initialState(state.locationId);
    lastCollisionSequence = 0;
    playback.pause();
    challengeIndex = 0;
    challengeDone = false;
    challengeTime = 0;
    setMode(mode === 'maneuver' ? 'explore' : mode);
    syncControls();
    toast('Boat returned to the practice grounds. Your lesson progress is saved.');
  };
  function openModal(content) {
    $('#modal-content').innerHTML = content;
    if (!$('#modal').open) $('#modal').showModal();
    $('#modal').scrollTop = 0;
    keys?.clear();
  }
  $('#close-modal').onclick = () => $('#modal').close();
  $('#modal').addEventListener('click', (e) => {
    if (e.target === $('#modal')) $('#modal').close();
  });
  $('#help').onclick = () =>
    openModal(
      `<div class="eyebrow">WELCOME ABOARD</div><h2>A few things before you sail.</h2><p>Use the helm to steer and the mainsheet to adjust your sail. Select Cockpit to inspect the winches, ropes, and live instruments, or Helm to sail from behind the wheel. The wind comes from the direction shown on the instrument. Your yacht loses power when pointed within 38° of the wind.</p>${shortcutsTable()}<p class="help-hint keyboard-help">Drag to look around · Scroll to zoom</p><p class="help-hint touch-help">Drag to look around. Use the on-screen sliders and buttons to control the boat.</p><p>Lessons save automatically in this browser. Open Course to browse lessons or resume your study.</p><div class="modal-note">An experimental learning playground with simplified physics. It is not a substitute for on-water instruction.</div>`,
    );
  $('#conditions').onclick = () => {
    if (learning.active || lab?.active) {
      toast(
        'Weather is fixed during assessed practice. Finish or reset the attempt before changing conditions.',
      );
      return;
    }
    openModal(
      `<div class="eyebrow">MAKE IT YOUR OWN</div><h2>A change in the weather.</h2><p>A steady breeze is a good place to start.</p><label class="setting-label" for="wind-speed">Wind speed over ground <strong id="wind-speed-value">${state.windSpeed} kn</strong></label><input id="wind-speed" type="range" min="3" max="30" value="${state.windSpeed}"><label class="setting-label" for="wind-direction">Wind over ground from <strong id="wind-direction-value">${state.windDirection}°</strong></label><input id="wind-direction" type="range" min="0" max="359" value="${state.windDirection}"><label class="setting-label" for="current-speed">Current speed <strong id="current-speed-value">${state.currentSpeed.toFixed(1)} kn</strong></label><input id="current-speed" type="range" min="0" max="4" step="0.1" value="${state.currentSpeed}"><label class="setting-label" for="current-direction">Current flowing toward <strong id="current-direction-value">${state.currentDirection}°</strong></label><input id="current-direction" type="range" min="0" max="359" value="${state.currentDirection}"><p class="modal-note">Weather wind is relative to the ground. The onboard display shows wind relative to moving water. Apparent wind is the air felt aboard. Wind names its source; current names where it flows. Conditions are fixed during assessed practice.</p>`,
    );
    $('#wind-speed').oninput = (e) => {
      state.windSpeed = +e.target.value;
      $('#wind-speed-value').textContent = state.windSpeed + ' kn';
      syncControls();
    };
    $('#wind-direction').oninput = (e) => {
      state.windDirection = +e.target.value;
      $('#wind-direction-value').textContent = state.windDirection + '°';
      syncControls();
    };
    $('#current-speed').oninput = (e) => {
      state.currentSpeed = +e.target.value;
      $('#current-speed-value').textContent = state.currentSpeed.toFixed(1) + ' kn';
      syncControls();
    };
    $('#current-direction').oninput = (e) => {
      state.currentDirection = +e.target.value;
      $('#current-direction-value').textContent = state.currentDirection + '°';
      syncControls();
    };
  };
  $('#reference').onclick = () => learningTools.library();
  function updateLocation() {
    const location = getLocation(state.locationId);
    $('#location-title').textContent = t(location.title);
    $('#chart-location-title').textContent = t(location.title);
  }
  function ensureScene(locationId) {
    const location = getLocation(locationId);
    if (scene?.locationId !== location.id) {
      scene?.dispose();
      scene = null;
      try {
        scene = createScene($('#scene'), { locationId: location.id });
        scene.setView(camera);
      } catch (error) {
        console.error(error);
        $('#scene').textContent = t('A browser with WebGL is needed for the 3D view.');
      }
    }
  }
  $('#location-select').onclick = () =>
    openLocations({
      openModal,
      isActive: learning.active || lab?.active,
      onSelect: (id) => {
        lab?.leave();
        learning.cancel('Location changed. Restart practice when you return.');
        state = initialState(id);
        lastCollisionSequence = 0;
        ensureScene(id);
        playback.pause();
        challengeIndex = 0;
        challengeDone = false;
        challengeTime = 0;
        setMode('explore');
        syncControls();
        updateLocation();
      },
    });
  const drawChart = createChartRenderer({
    getState: () => state,
    getTraining: () => (mode === 'maneuver' ? lab?.chart : null),
    getChallengeIndex: () => challengeIndex,
  });
  function openChart() {
    learning?.event('event', 'chart');
    openModal(
      `<div class="eyebrow">NAVIGATION</div><h2>${t(getLocation(state.locationId).title)}</h2><p>Your position updates live. Amber marks indicate the buoy course.</p><canvas id="large-chart" width="760" height="570"></canvas><div class="chart-legend"><span>▲ Your yacht</span><span>● Course buoys</span><span>△ Other vessels</span><span>⚓ ${t('Anchor & swing room')}</span><span>${t('Plan view · bow swing limit')}</span><span>Dashed: 3 m contour</span></div>`,
    );
    drawChart($('#large-chart'));
  }
  $('#chart-toggle').onclick = openChart;
  const dashboardMount = document.createElement('div');
  dashboardMount.id = 'helm-dashboard-mount';
  $('.control-dock').append(dashboardMount);
  helmDashboard = createHelmDashboard({
    container: dashboardMount,
    getState: () => state,
    openModal,
    onChart: openChart,
  });
  cockpitControls = mountCockpitControls({
    container: $('.control-dock'),
    getState: () => state,
    getEnabled: cockpitEnabled,
    onChange: (patch) => {
      applyControlPatch(state, patch);
      syncControls();
    },
  });
  const keys = new Set();
  const pressButton = (selector) => {
    const button = $(selector);
    if (button && !button.disabled && button.offsetParent) button.click();
  };
  const keyActions = {
    play: togglePlayback,
    center: () => {
      applyControlPatch(state, { rudder: 0 });
      syncControls();
    },
    neutral: () => {
      applyControlPatch(state, { throttle: 0 });
      syncControls();
    },
    sails: () => pressButton('#sails'),
    reef: () => pressButton('#reef'),
    anchor: () => pressButton('#anchor'),
    chart: openChart,
    keys: () => $('#help').click(),
  };
  decorateControls();
  $('#help').setAttribute('aria-keyshortcuts', 'K');
  window.addEventListener('keydown', (e) => {
    // Browser shortcuts, text entry and native widgets own their keys. Clear an
    // existing held helm command when focus or a modifier takes over.
    const widget = e.target.closest?.(
      'input,select,textarea,summary,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="slider"],[role="spinbutton"],[role="combobox"],[role="listbox"],[role="menu"],[role="tablist"]',
    );
    const nativeSpace = e.key === ' ' && e.target.closest?.('button,a[href],[role="button"]');
    if (
      e.defaultPrevented ||
      e.isComposing ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      e.shiftKey ||
      learning?.reading ||
      learning?.training ||
      learning?.briefingOpen ||
      overlayOpen() ||
      widget ||
      nativeSpace
    ) {
      keys.clear();
      return;
    }
    if (
      !cockpitEnabled() &&
      (HOLD_KEYS[e.code] ||
        ['center', 'neutral', 'sails', 'reef', 'anchor'].includes(PRESS_KEYS[e.code]))
    ) {
      keys.clear();
      return;
    }
    if (HOLD_KEYS[e.code]) {
      e.preventDefault();
      keys.add(e.code);
      return;
    }
    if (e.repeat) return;
    const action = PRESS_KEYS[e.code];
    if (action) {
      e.preventDefault();
      keyActions[action]();
    }
  });
  for (const event of [
    'sail-reader-open',
    'sail-training-open',
    'sail-practice-briefing-open',
    'focusin',
    'blur',
  ])
    window.addEventListener(event, () => keys.clear());
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  const compass = (h) => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(h / 45) % 8];
  let last = performance.now(),
    uiTick = 0,
    wasGrounded = false,
    lastCollisionSequence = 0;
  document.addEventListener('visibilitychange', () => {
    last = performance.now();
    keys.clear();
    if (document.hidden) {
      playback.pause();
      syncControls();
    }
  });
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    if (document.hidden) {
      requestAnimationFrame(frame);
      return;
    }
    if (!cockpitEnabled()) keys.clear();
    if (cockpitEnabled() && playback.canRender) {
      if (applyHeldKeys(state, keys, dt, applyControlPatch)) syncControls();
    }
    if (playback.canTickDecision) learning.tickDecision(dt);
    if (playback.canSimulate) {
      sceneTime += dt;
      step(state, dt);
      if ((state.collisionCount || 0) > lastCollisionSequence && state.collision) {
        toast(
          t('Contact detected · {speed} kn closing speed').replace(
            '{speed}',
            (state.collision.closingSpeed / (1852 / 3600)).toFixed(1),
          ),
        );
      }
      lastCollisionSequence = state.collisionCount || 0;
      learning.tick(dt);
      lab?.tick(dt);
      if (mode === 'challenge' && !challengeDone) {
        challengeTime += dt;
        const buoys = getLocation(state.locationId).buoys,
          target = buoys[challengeIndex];
        if (Math.hypot(state.x - target.x, state.z - target.z) < 35) {
          challengeIndex++;
          if (challengeIndex === buoys.length) {
            challengeDone = true;
            $('#objective-text').textContent =
              `Course complete in ${Math.floor(challengeTime / 60)}m ${Math.floor(challengeTime % 60)}s`;
            toast('Three marks rounded. Course complete!');
          } else {
            $('#objective-text').textContent = `Next mark: buoy ${challengeIndex + 1} of 3`;
            toast(`Buoy ${challengeIndex} reached. On to the next mark.`);
          }
        }
      }
    }
    if (state.grounded && !wasGrounded)
      toast('You’ve reached shallow water. Use Reset boat to return to the practice grounds.');
    wasGrounded = state.grounded;
    // A modal already pauses physics; keep its background still to free GPU time for reading.
    if (playback.canRender) scene?.renderIfNeeded(state, sceneTime);
    uiTick += dt;
    if (uiTick > 0.12) {
      uiTick = 0;
      $('#anchor span').textContent = t(anchorControlAction(state).label);
      vesselControls?.update();
      cockpitControls?.update();
      helmDashboard?.update();
      const twa = state.waterWindAngle,
        point = twa === null ? t('Calm over water') : pointOfSail(twa);
      $('#speed').textContent = state.speed.toFixed(1);
      $('#heading').textContent = String(Math.round(state.heading) % 360).padStart(3, '0');
      $('#heading-caption').textContent = compass(state.heading);
      $('#speed-caption').textContent = state.anchor
        ? state.anchorStatus
        : state.speed < -0.1
          ? 'Moving astern'
          : Math.abs(state.throttle) > 0.01
            ? 'Under engine'
            : state.speed < 0.5
              ? 'Waiting for the breeze'
              : point;
      $('#point-of-sail').textContent = point;
      $('#wind-arrow').style.display = twa === null ? 'none' : '';
      $('.no-go').style.display = twa === null ? 'none' : '';
      $('#wind-arrow').style.transform = `rotate(${state.waterWindDirection ?? 0}deg)`;
      $('.dial-boat').style.transform = `rotate(${state.heading}deg)`;
      $('.no-go').style.transform = `rotate(${state.waterWindDirection ?? 0}deg)`;
      $('#wind-value').textContent = state.waterWindSpeed.toFixed(1);
      $('#weather-wind').textContent = `${state.windSpeed} kn ${compass(state.windDirection)}`;
      $('#ideal-trim').textContent = `Suggested: ${Math.round(state.suggestedMainSheet)}°`;
      $('#scene').dataset.visualTime = sceneTime.toFixed(5);
      drawChart($('#mini-chart'));
      if ($('#modal').open) drawChart($('#large-chart'));
    }
    syncPlayback();
    requestAnimationFrame(frame);
  }
  learningTools = createLearningTools({
    openModal,
    onLesson: (id) => {
      learning.select(lessons.findIndex((l) => l.id === id));
      learning.briefing();
    },
  });
  learning = createLearning({
    getPaused: () => playback.paused || overlayOpen() || learning?.briefingOpen,
    onPause: () => {
      playback.pause();
      syncControls();
    },
    onResume: () => {
      playback.resume();
      syncControls();
    },
    onTrainingStart: () => setCamera('helm', { record: false }),
    onTrainingEnd: () => {
      playback.pause();
      syncControls();
    },
    openFigure: (l) => learningTools.figure(l),
    openGuide: (l) => learningTools.forLesson(l),
    openManeuvers: () => lab.library(),
    getState: () => state,
    getMode: () => mode,
    openModal,
    toast,
    onSelect: (index) => {
      lesson = index;
      setMode('learn');
    },
    resetScenario: (setup) => {
      ensureScene('haven');
      state = createPracticeState(setup);
      lastCollisionSequence = 0;
      playback.pause();
      syncControls();
      updateLocation();
      scene?.render(state, sceneTime);
    },
  });
  lab = createManeuverLab({
    getState: () => state,
    onStart: (newState) => {
      setMode('maneuver');
      state = newState;
      lastCollisionSequence = 0;
      ensureScene(state.locationId);
      updateLocation();
      playback.resume();
      syncControls();
      toggleSystems(false);
    },
    onStop: () => {
      playback.pause();
      syncControls();
    },
    onControl: (patch) => {
      applyControlPatch(state, patch);
      syncControls();
    },
    openModal,
    setCues: (cues) => scene?.setTrainingCues(cues),
    onBuoyCourse: () => setMode('challenge'),
    toast,
  });
  vesselControls = mountControls($('#vessel-controls'), {
    getState: () => state,
    getPaused: () =>
      playback.paused ||
      document.hidden ||
      learning.reading ||
      learning.training ||
      learning.briefingOpen ||
      overlayOpen(),
    onChange: (patch) => {
      applyControlPatch(state, patch);
      syncControls();
    },
    onAction: (type, value) => learning.event(type, value),
  });
  function toggleSystems(open) {
    $('#systems-drawer').hidden = !open;
    $('#systems-toggle').setAttribute('aria-expanded', String(open));
    if (open) {
      $('#vessel-controls>.vessel-panel').open = true;
      vesselControls.update();
    }
  }
  learningTools.mount();
  $('#systems-toggle').onclick = () => toggleSystems($('#systems-drawer').hidden);
  $('#systems-close').onclick = () => {
    toggleSystems(false);
    $('#systems-toggle').focus();
  };
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlayOpen()) toggleSystems(false);
  });
  mountSimulationControls();
  sailingAudio = mountSailingAudio({
    container: $('.view-controls'),
    getMode: () => mode,
    getActive: () => mode === 'explore' && !playback.paused && !document.hidden,
    openModal,
  });
  lesson = learning.selected;
  updateLesson();
  syncControls();
  updateLocation();
  $('#language-select').onchange = async (e) => {
    const select = e.target;
    select.disabled = true;
    try {
      await changeLanguage(select.value, lessons, modules, async () => {
        lab?.cancel();
        learning.cancel(
          'Changing language restarts the current practice. Completed lessons and quiz results are preserved.',
        );
        await learning.flush();
      });
    } catch {
      select.value = getLanguage();
      select.disabled = false;
      toast(t('Language could not be loaded. Please try again.'));
    }
  };
  mountMobileLayout();
  mountTextSize($('#text-size-control'));
  observeTranslations(document.body);
  if (localeLoadError) toast('Language could not be loaded. Please try again.');
  syncPlayback();
  requestAnimationFrame(frame);
}
startApp().catch((error) => {
  console.error(error);
  document.querySelector('#app').innerHTML =
    `<main style="padding:40px"><h1>${t('SAIL could not start')}</h1><p>${t('Please reload the page.')}</p></main>`;
});
