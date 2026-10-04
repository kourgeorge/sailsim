import * as THREE from 'three';
import { mesh, box, canvasTexture } from './materials.js';
import { getLanguage, translate } from '../i18n/runtime.js';

const degrees = (value) =>
  Number.isFinite(value)
    ? `${String(Math.round(((value % 360) + 360) % 360) % 360).padStart(3, '0')}°`
    : '—';
const number = (value, digits = 1) => (Number.isFinite(value) ? value.toFixed(digits) : '—');

export function createHelmDisplay(parent, mat) {
  const group = new THREE.Group();
  group.name = 'helm-multifunction-display';
  parent.add(group);
  const width = 1.16,
    height = 0.696;
  box(group, mat.rubber, 0, 0, 0, width + 0.1, height + 0.1, 0.11, 0.045);
  const texture = canvasTexture(2400, 1440, () => {});
  // Keep oblique text stable without the stair-stepping of nearest sampling.
  // The Helm view also composites these pixels at browser resolution, without
  // raising the resolution of the surrounding 3D scene.
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  // No lighting-dependent washout: these are emitted pixels on a real screen.
  const screen = mesh(
    group,
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
    0,
    0,
    0.059,
  );
  screen.name = 'helm-multifunction-screen';
  screen.castShadow = false;
  const c = texture.image.getContext('2d');
  c.setTransform(2, 0, 0, 2, 0, 0);
  const mono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  let lastSignature = '',
    lastTick = -1,
    lastTime = null;
  function draw(state) {
    const rtl = ['ar', 'he'].includes(getLanguage());
    c.fillStyle = '#071c25';
    c.fillRect(0, 0, 1200, 720);
    const label = (text, x, y, w = 370, size = 42) => {
      const value = translate(text);
      c.fillStyle = '#c0d8d6';
      c.direction = rtl ? 'rtl' : 'ltr';
      c.textAlign = rtl ? 'right' : 'left';
      c.font = `700 ${size}px sans-serif`;
      const words = value.split(/\s+/),
        lines = [];
      let line = '';
      for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (line && c.measureText(next).width > w) {
          lines.push(line);
          line = word;
        } else line = next;
      }
      if (line) lines.push(line);
      // Two real text lines retain readable glyph width in long translations.
      const visible = lines.length > 2 ? [lines[0], lines.slice(1).join(' ')] : lines;
      visible.forEach((part, i) => {
        let fontSize = visible.length > 1 ? Math.min(size, 34) : size;
        c.font = `700 ${fontSize}px sans-serif`;
        while (c.measureText(part).width > w && fontSize > 28)
          c.font = `700 ${--fontSize}px sans-serif`;
        c.fillText(part, rtl ? x + w : x, y - (visible.length - 1 - i) * 38);
      });
      c.direction = 'ltr';
      c.textAlign = 'left';
    };
    const value = (text, x, y, w = 370, size = 92, color = '#f2fff6') => {
      c.direction = 'ltr';
      c.textAlign = 'left';
      c.fillStyle = color;
      c.font = `700 ${size}px ${mono}`;
      while (c.measureText(text).width > w && size > 24) c.font = `700 ${--size}px ${mono}`;
      c.fillText(text, x, y);
    };
    // Nine readable instruments use the whole screen; navigation has its own chart.
    const relative = (angle) =>
      Number.isFinite(angle)
        ? `${angle < -0.5 ? '←' : angle > 0.5 ? '→' : '↑'} ${Math.abs(angle).toFixed(0)}°`
        : '—';
    const cell = (title, text, column, row, detail = '', color = '#f2fff6') => {
      const x = 32 + column * 400,
        y = row * 240;
      label(title, x, y + 82, 336, 42);
      value(text, x, y + 185, 336, 108, color);
      if (detail) value(detail, x, y + 220, 336, 34, '#c0d8d6');
    };
    c.strokeStyle = '#31545c';
    c.lineWidth = 2;
    for (const x of [400, 800]) {
      c.beginPath();
      c.moveTo(x, 20);
      c.lineTo(x, 700);
      c.stroke();
    }
    for (const y of [240, 480]) {
      c.beginPath();
      c.moveTo(20, y);
      c.lineTo(1180, y);
      c.stroke();
    }
    const sog = state.speedOverGround,
      cog = Number.isFinite(sog) && sog > 0.05 ? state.courseOverGround : null;
    const awa = state.apparentWindAngle;
    cell('BOAT SPEED', number(state.speed, 2), 0, 0, 'kn');
    cell('HEADING', degrees(state.heading), 1, 0);
    cell('DEPTH', number(state.depth), 2, 0, 'm');
    cell('SOG', number(sog, 2), 0, 1, 'kn');
    cell('COG', degrees(cog), 1, 1);
    cell('APPARENT WIND', number(state.apparentWindSpeed), 2, 1, `kn · ${relative(awa)}`);
    cell('HELM', relative(state.rudder), 0, 2);
    if (state.vesselId === 'catamaran') {
      label('Twin engines', 432, 562, 336, 42);
      value(`P ${number(state.portThrottle * 100, 0)}%`, 432, 631, 336, 72, '#f1cc86');
      value(`S ${number(state.starboardThrottle * 100, 0)}%`, 432, 700, 336, 72, '#f1cc86');
    } else
      cell(
        'Engine throttle',
        `${state.throttle < -0.005 ? '▼' : state.throttle > 0.005 ? '▲' : '–'} ${number(Math.abs(state.throttle) * 100, 0)}%`,
        1,
        2,
        '',
        Math.abs(state.throttle) > 0.005 ? '#f1cc86' : '#edfff3',
      );
    cell(
      'Wind over water',
      number(state.waterWindSpeed),
      2,
      2,
      `kn · ${degrees(state.waterWindDirection)}`,
    );
    screen.userData.telemetry = {
      speed: state.speed,
      speedOverGround: sog,
      heading: state.heading,
      courseOverGround: cog,
      depth: state.depth,
      apparentWindSpeed: state.apparentWindSpeed,
      apparentWindAngle: awa,
      windSpeed: state.windSpeed,
      windDirection: state.windDirection,
      waterWindSpeed: state.waterWindSpeed,
      waterWindDirection: state.waterWindDirection,
      waterWindAngle: state.waterWindAngle,
      rudder: state.rudder,
      throttle: state.throttle,
      language: getLanguage(),
    };
    texture.needsUpdate = true;
  }
  return {
    group,
    canvas: texture.image,
    update(state, time) {
      const sameTime = time === lastTime;
      lastTime = time;
      const tick = Math.floor(time * 5);
      if (tick === lastTick && !sameTime) return;
      const signature = JSON.stringify([
        getLanguage(),
        state.vesselId,
        state.portThrottle,
        state.starboardThrottle,
        state.speed,
        state.heading,
        state.speedOverGround,
        state.courseOverGround,
        state.depth,
        state.apparentWindSpeed,
        state.apparentWindAngle,
        state.windSpeed,
        state.windDirection,
        state.waterWindSpeed,
        state.waterWindDirection,
        state.waterWindAngle,
        state.rudder,
        state.throttle,
      ]);
      if (signature === lastSignature) return;
      draw(state);
      lastSignature = signature;
      lastTick = tick;
    },
  };
}
