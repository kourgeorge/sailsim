import { createChartRenderer } from './navigation/chart.js';
import { createSailingTrack, captureSailingTrack } from './navigation/sailing-track.js';
import { mountSailingTrack } from './navigation/sailing-track-view.js';
import './style.css';
import { mountSimulationControls } from './activity/ui.js';
import { playbackIcon } from './activity/playback-icon.js';
import { mountSimulationSession } from './activity/session.js';
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
import { mountLanguagePicker } from './i18n/language-picker.js';
import { createLearning } from './learning/ui.js';
import { createSceneLoader } from './activity/scene-loader.js';
import { mountSceneLoading } from './activity/scene-loading.js';
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
import './rendering/scene-compass.css';
import { mountMobileLayout } from './mobile.js';
import { mountSailingAudio } from './audio/ui.js';
import { createRaceUI } from './racing/ui.js';
import { createChallengeUI } from './challenges/ui.js';
import { mountSectionCovers, sectionForMode } from './activity/section-covers.js';
import { getVessel } from './vessels.js';
import { addFreeSailingTraffic } from './world/free-sailing-traffic.js';
import { createWeather, advanceWeather, weatherConditions } from './weather.js';
import { weatherControl } from './activity/weather-control.js';
import { mountSceneCapture } from './activity/scene-capture.js';
import './ui/dropdown.css';

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
  let changingWeather = true,
    voyageWeather = null,
    voyageWeatherState = null;
  let selectedVessel = 'monohull';
  try {
    selectedVessel = getVessel(localStorage.getItem('sail-vessel')).id;
  } catch {}
  let lesson = 0,
    state = initialState(),
    mode = 'learn',
    freeSailingStarted = false,
    camera = 'chase',
    challengeIndex = 0,
    challengeDone = false,
    challengeTime = 0,
    challengeTrack = null;
  let learning,
    vesselControls,
    lab,
    racing,
    adventures,
    learningTools,
    helmDashboard,
    cockpitControls,
    simulationSession,
    sectionCovers,
    sailingAudio,
    sceneCapture,
    sceneLoading;
  mountAppShell({ lessonCount: lessons.length, mode });
  const $ = (s) => document.querySelector(s);
  let scene,
    sceneCues = null,
    sceneRace = null;
  const graphics = createSceneLoader({
    container: $('#scene'),
    getOptions: () => ({
      locationId: getLocation(state.locationId).id,
      vesselId: getVessel(state).id,
      isFreeSailing: () => mode === 'explore' && freeSailingStarted,
    }),
    prepare: (next) => {
      next.setView(camera);
      next.setTrainingCues(sceneCues);
      next.setRace(sceneRace);
      next.render(state, sceneTime);
    },
    onChange: () => {
      scene = graphics.scene;
      // Loading time must never advance the boat or consume training/race time.
      last = performance.now();
      syncControls();
    },
  });
  function setSceneCues(cues) {
    sceneCues = cues;
    scene?.setTrainingCues(cues);
  }
  function setSceneRace(race) {
    sceneRace = race;
    scene?.setRace(race);
  }

  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => $('#toast').classList.remove('show'), 4200);
  }
  function resetVoyageWeather() {
    voyageWeather = createWeather(state, {
      enabled: changingWeather,
      seed: Math.floor(Math.random() * 4294967296),
    });
    voyageWeatherState = state;
  }
  function selectedConditions() {
    return voyageWeatherState === state ? { ...voyageWeather.base } : weatherConditions(state);
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
    if (value === 'challenge') {
      challengeIndex = 0;
      challengeDone = false;
      challengeTime = 0;
      challengeTrack = null;
    }
    if (value !== 'race') racing?.leave();
    if (value !== 'adventure') {
      adventures?.leave();
      delete $('.simulator').dataset.challengeEngine;
    }
    if (value !== mode) freeSailingStarted = false;
    learning?.closeReader();
    learning?.closeTraining();
    if (value !== 'maneuver') lab?.leave();
    if (value !== mode)
      learning?.cancel('Mode changed. Return to the lesson and restart practice.');
    mode = value;
    // The saved boat choice belongs only to free sailing, including its setup page.
    if (mode !== 'explore' && state.vesselId === 'catamaran') {
      const { windSpeed, windDirection, currentSpeed, currentDirection } = state;
      state = initialState(state.locationId);
      Object.assign(state, { windSpeed, windDirection, currentSpeed, currentDirection });
      lastCollisionSequence = 0;
    }
    $('.simulator').dataset.mode = mode;
    document
      .querySelectorAll('button[data-mode]')
      .forEach((b) =>
        b.classList.toggle(
          'active',
          b.dataset.mode === mode ||
            (['maneuver', 'race', 'adventure'].includes(mode) && b.dataset.mode === 'challenge'),
        ),
      );
    $('.scene-title>span').style.visibility = mode === 'learn' ? 'visible' : 'hidden';
    if (mode === 'learn') updateLesson();
    else if (['maneuver', 'race', 'adventure'].includes(mode)) {
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
      maneuverActive: lab?.active || adventures?.active,
    }),
    onStart: () => learning.resumeOrStart(),
  });
  const sessionStarted = () =>
    mode === 'learn'
      ? Boolean(learning?.practiceActive)
      : mode === 'maneuver'
        ? Boolean(lab?.active)
        : mode === 'race'
          ? Boolean(racing?.active)
          : mode === 'adventure'
            ? Boolean(adventures?.active)
            : freeSailingStarted;
  const sessionRequested = () => !learning?.reading && !learning?.training && sessionStarted();
  const cockpitEnabled = () => playback.controlsEnabled && sessionStarted() && graphics.ready;
  function syncPlayback() {
    const requested = sessionRequested();
    if (requested) graphics.ensure();
    else graphics.cancel();
    sceneLoading?.sync({ active: requested, status: graphics.status });
    const simulator = $('.simulator');
    const sceneCompass = $('#scene-compass');
    if (sceneCompass) sceneCompass.hidden = !cockpitEnabled() || !playback.canRender;
    // Opening a dialog temporarily pauses motion without ending playback.
    const simulationRunning = String(cockpitEnabled() && !playback.paused);
    if (simulator.dataset.simulationRunning !== simulationRunning)
      simulator.dataset.simulationRunning = simulationRunning;
    if (simulator.dataset.freeSailingStarted !== String(freeSailingStarted))
      simulator.dataset.freeSailingStarted = String(freeSailingStarted);
    sailingAudio?.sync();
    cockpitControls?.syncAvailability();
    const activity = playback.state,
      button = $('#play'),
      action = activity.action;
    simulationSession?.sync({
      started: requested,
      graphicsReady: graphics.ready,
      paused: !playback.canSimulate,
    });
    sceneCapture?.sync({
      active: document.body.dataset.session === 'active',
      available: Boolean(scene?.ready),
    });
    sectionCovers?.sync({
      mode,
      active: document.body.dataset.session === 'active',
      reviewable:
        !sessionStarted() &&
        Boolean(
          mode === 'race'
            ? racing?.current
            : mode === 'adventure'
              ? adventures?.current
              : mode === 'maneuver'
                ? lab?.current
                : mode === 'challenge' && challengeDone && challengeTrack,
        ),
    });
    const playbackAvailable =
      ['pause', 'resume'].includes(activity.command) &&
      !(mode === 'race' && !racing?.active) &&
      !(mode === 'adventure' && !adventures?.active);
    button.hidden = !playbackAvailable;
    button.disabled = !playbackAvailable || !graphics.ready;
    $('#conditions').hidden = ['learn', 'race', 'adventure'].includes(mode) || Boolean(lab?.active);
    $('#reset').hidden = mode === 'learn';
    if (activity.command && button.dataset.action !== action) {
      button.dataset.action = action;
      button.innerHTML = playbackIcon(activity.command === 'pause' ? 'pause' : 'play');
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
    if (!cockpitEnabled()) return;
    playback.toggle();
    sailingAudio?.sync(true);
    syncControls();
  }
  function syncControls() {
    if (mode === 'race') state.throttle = 0;
    if (mode === 'adventure' && !adventures?.current?.definition.engine) state.throttle = 0;
    refreshDerived(state);
    scene?.invalidate();
    cockpitControls?.update();
    helmDashboard?.update();
    $('#speed').textContent = state.speed.toFixed(1);
    $('#heading').textContent = String(Math.round(state.heading) % 360).padStart(3, '0');
    $('#weather-wind').textContent =
      `${+state.windSpeed.toFixed(1)} kn ${compass(state.windDirection)}`;
    $('#scene').dataset.visualTime = sceneTime.toFixed(5);
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
      state.vesselId === 'catamaran' && state.portThrottle !== state.starboardThrottle
        ? t('Independent engines')
        : Math.abs(state.throttle) < 0.01
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
        navigateSection(b.dataset.mode);
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
  function setStartingCamera(desktopView) {
    const view = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
      ? 'chase'
      : desktopView;
    if (view) setCamera(view, { record: false });
  }
  document
    .querySelectorAll('button[data-camera]')
    .forEach((b) => (b.onclick = () => setCamera(b.dataset.camera)));
  $('#reset').onclick = () => {
    if (mode === 'adventure') {
      adventures.briefing(adventures.current.definition.id);
      return;
    }
    if (mode === 'race') {
      racing.briefing(racing.current.course.id);
      return;
    }
    freeSailingStarted = false;
    lab?.cancel();
    learning?.cancel('Boat reset. Restart the assessed practice to record a new attempt.');
    state = initialState(state.locationId, state.vesselId);
    lastCollisionSequence = 0;
    playback.pause();
    challengeIndex = 0;
    challengeDone = false;
    challengeTime = 0;
    challengeTrack = null;
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
  function openChallengeBriefing(content) {
    if (sessionStarted()) {
      openModal(content);
      return;
    }
    if (sectionForMode(mode) !== 'challenge') navigateSection('challenge');
    else closeOverlays();
    // Returning from a restart dialog transfers the briefing back to the page.
    $('#modal-content').replaceChildren();
    sectionCovers.showChallengeBriefing(content);
  }
  function finishChallenge(completed) {
    challengeDone = true;
    freeSailingStarted = false;
    playback.pause();
    openModal(
      `<section class="challenge-debrief"><div class="eyebrow">${t('Challenge debrief')}</div><h2>${t(completed ? 'Course complete' : 'Challenge ended')}</h2><p>${t('Course buoys')}: <bdi>${challengeIndex} / 3</bdi> · <bdi>${Math.floor(challengeTime / 60)}:${String(Math.floor(challengeTime % 60)).padStart(2, '0')}</bdi></p><div id="challenge-track"></div><div class="training-actions"><button id="challenge-again" class="training-button primary">${t('Try again')}</button><button id="challenge-exit" class="training-button">${t('All challenges')}</button></div></section>`,
    );
    mountSailingTrack($('#challenge-track'), challengeTrack || createSailingTrack(state), {
      marks: getLocation(state.locationId).buoys,
    });
    $('#challenge-again').onclick = () => {
      $('#modal').close();
      restartSession();
    };
    $('#challenge-exit').onclick = () => navigateSection('challenge');
  }
  $('#close-modal').onclick = () => $('#modal').close();
  let backdropPress = false;
  $('#modal').addEventListener('pointerdown', (e) => {
    // Native option menus can retarget their final click to the dialog in WebKit.
    const nativeMenuOpen =
      CSS.supports('selector(select:open)') && $('#modal').querySelector('select:open');
    backdropPress = e.target === $('#modal') && !nativeMenuOpen;
  });
  $('#modal').addEventListener('click', (e) => {
    if (backdropPress && e.target === $('#modal')) $('#modal').close();
    backdropPress = false;
  });
  $('#help').onclick = () =>
    openModal(
      `<h2>Help</h2><p>Use the helm to steer and the mainsheet to adjust your sail. Select Cockpit to inspect the winches, ropes, and live instruments, or Helm to sail from behind the wheel. The wind comes from the direction shown on the instrument. Your yacht loses power when pointed within 38° of the wind.</p>${shortcutsTable()}<p class="help-hint keyboard-help">Drag to look around · Scroll to zoom</p><p class="help-hint touch-help">Drag to look around. Use the on-screen sliders and buttons to control the boat.</p><p>Lessons save automatically in this browser. Open Course to browse lessons or resume your study.</p><div class="modal-note">An experimental learning playground with simplified physics. It is not a substitute for on-water instruction.</div>`,
    );
  $('#conditions').onclick = () => {
    if (learning.active || lab?.active || ['race', 'adventure'].includes(mode)) {
      toast(
        'Weather is fixed during assessed practice. Finish or reset the attempt before changing conditions.',
      );
      return;
    }
    openModal(
      `<div class="eyebrow">MAKE IT YOUR OWN</div><h2>A change in the weather.</h2>${mode === 'explore' ? `${weatherControl('weather-mode', changingWeather)}<p>${t('Wind shifts gradually around the starting conditions. Current changes more slowly.')}</p>` : '<p>A steady breeze is a good place to start.</p>'}<label class="setting-label" for="wind-speed">Wind speed over ground <strong id="wind-speed-value">${+state.windSpeed.toFixed(1)} kn</strong></label><input id="wind-speed" type="range" min="3" max="35" step="0.1" value="${state.windSpeed.toFixed(1)}"><label class="setting-label" for="wind-direction">Wind over ground from <strong id="wind-direction-value">${Math.round(state.windDirection) % 360}°</strong></label><input id="wind-direction" type="range" min="0" max="359" value="${Math.round(state.windDirection) % 360}"><label class="setting-label" for="current-speed">Current speed <strong id="current-speed-value">${state.currentSpeed.toFixed(1)} kn</strong></label><input id="current-speed" type="range" min="0" max="4" step="0.1" value="${state.currentSpeed.toFixed(1)}"><label class="setting-label" for="current-direction">Current flowing toward <strong id="current-direction-value">${Math.round(state.currentDirection) % 360}°</strong></label><input id="current-direction" type="range" min="0" max="359" value="${Math.round(state.currentDirection) % 360}"><p class="modal-note">Weather wind is relative to the ground. The onboard display shows wind relative to moving water. Apparent wind is the air felt aboard. Wind names its source; current names where it flows. Conditions are fixed during assessed practice.</p>`,
    );
    const weatherMode = $('#weather-mode');
    if (weatherMode)
      weatherMode.onchange = (event) => {
        changingWeather = event.target.value === 'changing';
        resetVoyageWeather();
        syncControls();
      };
    $('#wind-speed').oninput = (e) => {
      state.windSpeed = +e.target.value;
      resetVoyageWeather();
      $('#wind-speed-value').textContent = state.windSpeed + ' kn';
      syncControls();
    };
    $('#wind-direction').oninput = (e) => {
      state.windDirection = +e.target.value;
      resetVoyageWeather();
      $('#wind-direction-value').textContent = state.windDirection + '°';
      syncControls();
    };
    $('#current-speed').oninput = (e) => {
      state.currentSpeed = +e.target.value;
      resetVoyageWeather();
      $('#current-speed-value').textContent = state.currentSpeed.toFixed(1) + ' kn';
      syncControls();
    };
    $('#current-direction').oninput = (e) => {
      state.currentDirection = +e.target.value;
      resetVoyageWeather();
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
  $('#location-select').onclick = () =>
    openLocations({
      openModal,
      isActive: learning.active || lab?.active || racing?.active || adventures?.active,
      onSelect: (id) => {
        lab?.leave();
        learning.cancel('Location changed. Restart practice when you return.');
        state = initialState(id, selectedVessel);
        lastCollisionSequence = 0;
        playback.pause();
        challengeIndex = 0;
        challengeDone = false;
        challengeTime = 0;
        challengeTrack = null;
        setMode('explore');
        syncControls();
        updateLocation();
      },
    });
  const drawChart = createChartRenderer({
    getState: () => state,
    getTraining: () =>
      mode === 'adventure' ? adventures?.chart : mode === 'maneuver' ? lab?.chart : learning?.chart,
    getChallengeIndex: () => challengeIndex,
    getRace: () => (mode === 'race' ? racing?.current : null),
  });
  function openChart() {
    learning?.event('event', 'chart');
    const race = mode === 'race' ? racing.current : null;
    const adventure = mode === 'adventure' ? adventures.current : null;
    const targetVisible = adventure && !!adventures.chart?.cues.target;
    const chartInstructions = adventure
      ? `${t(targetVisible ? 'The green circle marks your current target.' : 'Your treasure target is hidden. Follow the clue, or choose Reveal target (−10 points) to show it on the chart.')} ${t('Yellow circles mark course buoys.')}`
      : race
        ? t('Sail through the numbered rings in order.')
        : learning?.chart
          ? t('Follow the numbered targets in order. The highlighted marker is your current goal.')
          : 'Your position updates live. Amber marks indicate the buoy course.';
    openModal(
      `<div class="eyebrow">NAVIGATION</div><h2>${t(adventure ? adventure.definition.name : race ? race.course.name : getLocation(state.locationId).title)}</h2><p>${chartInstructions}</p><canvas id="large-chart" width="760" height="570"></canvas><div class="chart-legend"><span>▲ Your yacht</span><span class="chart-legend-buoys">● Course buoys</span>${targetVisible ? `<span class="chart-legend-target">${t('○ Current target')}</span>` : ''}<span>△ Other vessels</span><span>⚓ ${t('Anchor & swing room')}</span><span>${t('Plan view · bow swing limit')}</span><span>Dashed: 3 m contour</span></div>`,
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
    horn: () => pressButton('#boat-horn'),
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
        ['center', 'neutral', 'sails', 'reef', 'anchor', 'horn'].includes(PRESS_KEYS[e.code]))
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
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.25));
    last = now;
    if (document.hidden) {
      requestAnimationFrame(frame);
      return;
    }
    syncPlayback();
    if (playback.canTickDecision) learning.tickDecision(dt);
    if (!cockpitEnabled()) keys.clear();
    if (!sessionRequested() || !graphics.ready) {
      requestAnimationFrame(frame);
      return;
    }
    if (cockpitEnabled() && playback.canRender) {
      if (applyHeldKeys(state, keys, dt, applyControlPatch)) syncControls();
    }
    if (playback.canSimulate && sessionStarted()) {
      if (mode === 'challenge' && !challengeDone && !challengeTrack)
        challengeTrack = createSailingTrack(state);
      sceneTime += dt;
      if (mode === 'race') racing?.tick(dt);
      else if (mode === 'adventure') adventures?.tick(dt);
      else {
        if (mode === 'explore') {
          if (voyageWeatherState !== state) resetVoyageWeather();
          Object.assign(state, advanceWeather(voyageWeather, dt));
        }
        step(state, dt);
      }
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
        captureSailingTrack(challengeTrack, state, challengeTime);
        const buoys = getLocation(state.locationId).buoys,
          target = buoys[challengeIndex];
        if (Math.hypot(state.x - target.x, state.z - target.z) < 35) {
          challengeIndex++;
          if (challengeIndex === buoys.length) {
            challengeDone = true;
            $('#objective-text').textContent =
              `Course complete in ${Math.floor(challengeTime / 60)}m ${Math.floor(challengeTime % 60)}s`;
            finishChallenge(true);
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
        point = twa === null ? t('Calm over water') : pointOfSail(twa, state.vesselId);
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
      $('#weather-wind').textContent =
        `${+state.windSpeed.toFixed(1)} kn ${compass(state.windDirection)}`;
      $('#ideal-trim').textContent = `Suggested: ${Math.round(state.suggestedMainSheet)}°`;
      $('#scene').dataset.visualTime = sceneTime.toFixed(5);
      if ($('#mini-chart').checkVisibility()) drawChart($('#mini-chart'));
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
    setCues: setSceneCues,
    getPaused: () => !graphics.ready || playback.paused || overlayOpen() || learning?.briefingOpen,
    onPause: () => {
      playback.pause();
      syncControls();
    },
    onResume: () => {
      playback.resume();
      syncControls();
    },
    onTrainingStart: () => setStartingCamera('helm'),
    onTrainingEnd: () => {
      playback.pause();
      syncControls();
    },
    openFigure: (l) => learningTools.figure(l),
    openGuide: (l) => learningTools.forLesson(l),
    onChallenge: (id) => {
      navigateSection('challenge');
      sectionCovers.selectChallenge(id);
    },
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
      state = createPracticeState(setup);
      lastCollisionSequence = 0;
      playback.pause();
      syncControls();
      updateLocation();
    },
  });
  lab = createManeuverLab({
    openBriefing: openChallengeBriefing,
    getState: () => state,
    onStart: (newState) => {
      setMode('maneuver');
      state = newState;
      lastCollisionSequence = 0;
      updateLocation();
      setStartingCamera();
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
    setCues: setSceneCues,
    onBuoyCourse: () => {
      setMode('challenge');
      state = initialState('haven');
      lastCollisionSequence = 0;
      updateLocation();
      freeSailingStarted = true;
      setStartingCamera();
      playback.resume();
      syncControls();
    },
    toast,
  });
  racing = createRaceUI({
    container: $('.simulator'),
    openModal,
    openBriefing: openChallengeBriefing,
    onStart: (newState) => {
      setMode('race');
      state = newState;
      lastCollisionSequence = 0;
      updateLocation();
      playback.resume();
      syncControls();
      toggleSystems(false);
      setCamera('chase', { record: false });
    },
    onStop: () => {
      playback.pause();
      syncControls();
    },
    onLeave: (section = 'challenge') => navigateSection(section),
    onVisuals: setSceneRace,
    onDrills: () => lab.library(),
    onChallenge: (id) => adventures.briefing(id),
    onLibrary: () => navigateSection('challenge'),
  });
  adventures = createChallengeUI({
    container: $('.simulator'),
    openModal,
    openBriefing: openChallengeBriefing,
    onStart: (newState, definition) => {
      setMode('adventure');
      state = newState;
      $('.simulator').dataset.challengeEngine = String(definition.engine);
      lastCollisionSequence = 0;
      updateLocation();
      playback.resume();
      syncControls();
      toggleSystems(false);
      setCamera('chase', { record: false });
    },
    onStop: () => {
      playback.pause();
      syncControls();
    },
    onLibrary: () => navigateSection('challenge'),
    setCues: setSceneCues,
  });
  vesselControls = mountControls($('#vessel-controls'), {
    getState: () => state,
    getPaused: () =>
      !graphics.ready ||
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
  function exitSession() {
    keys.clear();
    clearTimeout(toast.timer);
    $('#toast').classList.remove('show');
    toggleSystems(false);
    playback.pause();
    if (mode === 'learn') learning.endPractice();
    else if (mode === 'maneuver') lab.end();
    else if (mode === 'race') racing.end();
    else if (mode === 'adventure') adventures.end();
    else if (mode === 'challenge') finishChallenge(false);
    else {
      Object.assign(state, selectedConditions());
      freeSailingStarted = false;
    }
    // Exit returns to the section. Explicit End & review actions still show
    // the report, and the cover can reopen the finished attempt.
    closeOverlays();
    syncControls();
    sectionCovers?.focus();
  }
  function closeOverlays() {
    document.querySelectorAll('dialog[open]').forEach((dialog) => dialog.close());
  }
  function navigateSection(section) {
    if (sessionStarted()) exitSession();
    keys.clear();
    playback.pause();
    freeSailingStarted = false;
    toggleSystems(false);
    learning?.closeReader();
    learning?.closeTraining();
    closeOverlays();
    if (sectionForMode(mode) !== section || section === 'learn') setMode(section);
    syncControls();
    if (section === 'challenge') sectionCovers?.refreshChallenges();
    sectionCovers?.focus();
  }
  function restartSession() {
    keys.clear();
    toggleSystems(false);
    if (mode === 'learn') learning.restart();
    else if (mode === 'maneuver') lab.start(lab.current.drillId);
    else if (mode === 'race') racing.restart();
    else if (mode === 'adventure') adventures.restart();
    else {
      const { windSpeed, windDirection, currentSpeed, currentDirection } =
        mode === 'explore' ? selectedConditions() : state;
      state = initialState(state.locationId, state.vesselId);
      Object.assign(state, { windSpeed, windDirection, currentSpeed, currentDirection });
      if (mode === 'explore') addFreeSailingTraffic(state);
      lastCollisionSequence = 0;
      challengeIndex = 0;
      challengeDone = false;
      challengeTime = 0;
      challengeTrack = null;
      setMode(mode);
      freeSailingStarted = true;
      setStartingCamera();
      playback.resume();
    }
    syncControls();
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
    hornButton: $('#boat-horn'),
    getMode: () => mode,
    getActive: () => mode === 'explore' && !playback.paused && !document.hidden,
    getState: () => state,
    getHornActive: () =>
      mode === 'explore' && sessionRequested() && graphics.ready && playback.canSimulate,
    openModal,
  });
  lesson = learning.selected;
  updateLesson();
  syncControls();
  updateLocation();
  sectionCovers = mountSectionCovers({
    simulator: $('.simulator'),
    getState: () => state,
    lessons,
    getSelectedLesson: () => learning.selected,
    getLessonPreview: (index) => learning.coverPreview(index),
    getChallengePreview: (button) => {
      if (button.dataset.sailingChallenge)
        return adventures.preview(button.dataset.sailingChallenge);
      if (button.dataset.raceCourse) return racing.preview(button.dataset.raceCourse);
      return lab.preview(button.dataset.coverDrill);
    },
    onLesson: (index) => learning.select(index),
    getSelectedVessel: () => selectedVessel,
    getChangingWeather: () => changingWeather,
    onVessel: (id) => {
      selectedVessel = getVessel(id).id;
      try {
        localStorage.setItem('sail-vessel', selectedVessel);
      } catch {}
      const { windSpeed, windDirection, currentSpeed, currentDirection } = selectedConditions();
      state = initialState(state.locationId, selectedVessel);
      Object.assign(state, { windSpeed, windDirection, currentSpeed, currentDirection });
      lastCollisionSequence = 0;
      syncControls();
    },
    onNavigate: navigateSection,
    onCourse: () => learning.libraryModal(),
    onStartFree: () => {
      closeOverlays();
      // Every entry begins a fresh voyage with the selected location and weather.
      const { windSpeed, windDirection, currentSpeed, currentDirection } = selectedConditions();
      state = initialState(state.locationId, selectedVessel);
      Object.assign(state, { windSpeed, windDirection, currentSpeed, currentDirection });
      addFreeSailingTraffic(state);
      lastCollisionSequence = 0;
      setMode('explore');
      freeSailingStarted = true;
      setStartingCamera();
      playback.resume();
      sailingAudio?.sync(true);
      syncControls();
    },
    onLocation: (id) => {
      state = initialState(id, selectedVessel);
      lastCollisionSequence = 0;
      updateLocation();
      syncControls();
    },
    onConditions: () => $('#conditions').click(),
    mountSound: (container) =>
      sailingAudio.mountControls(container, {
        id: 'cover-sound',
        optionsId: 'cover-sound-options',
        buttonClass: 'training-button',
      }),
    mountChallenges: (container) => racing.mountLibrary(container),
    mountDrills: (container) => lab.mountChoices(container),
    onReview: () => {
      if (mode === 'race') racing.review();
      else if (mode === 'adventure') adventures.review();
      else if (mode === 'maneuver') lab.review();
      else if (mode === 'challenge' && challengeDone) finishChallenge(challengeIndex === 3);
    },
  });
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
  mountLanguagePicker($('#language-select'));
  mountMobileLayout();
  simulationSession = mountSimulationSession({
    onExit: exitSession,
    onRestart: restartSession,
    onChange: () => learning.placeCard(),
  });
  sceneCapture = mountSceneCapture({ getScene: () => scene, openModal, toast });
  sceneLoading = mountSceneLoading({ onCancel: exitSession });
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
