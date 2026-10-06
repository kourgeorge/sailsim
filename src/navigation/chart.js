import { getLocation } from '../locations.js';
import { shoreScale } from '../rendering/geography.js';
import { drawAnchorChart } from '../anchoring/diagram.js';
import { anchorSnapshot } from '../anchor.js';
import { translate as t } from '../i18n/runtime.js';
import { localToWorld } from '../world/bodies.js';
import { sailingTrackFrame } from './sailing-track.js';
import { getCoastalFeatures } from '../world/coastal-features.js';
import { navigationLights } from './lights.js';
import { drawTerrainChart } from './terrain-chart.js';

export function createChartRenderer({
  getState,
  getTraining,
  getChallengeIndex,
  getRace = () => null,
  getTrack = () => null,
}) {
  return function drawChart(canvas, { pixelRatio = 1 } = {}) {
    if (!canvas) return;
    const state = getState(),
      race = getRace(),
      track = getTrack();
    let training = getTraining();
    const challengeIndex = race ? race.racers[0].mark : getChallengeIndex();
    const ctx = canvas.getContext('2d'),
      w = canvas.width / pixelRatio,
      h = canvas.height / pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    if (race) {
      const points = [
        race.course.start,
        ...(race.marks || race.course.marks),
        ...race.racers.map((item) => item.state),
      ];
      const xs = points.map((p) => p.x),
        zs = points.map((p) => p.z);
      const minX = Math.min(...xs),
        maxX = Math.max(...xs),
        minZ = Math.min(...zs),
        maxZ = Math.max(...zs);
      training = {
        center: { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 },
        span: Math.max(400, (maxX - minX) * 1.4, ((maxZ - minZ) * 1.4 * w) / h),
        cues: {},
      };
    }
    if (track) training = sailingTrackFrame(track.samples, track.marks, w / h);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#173d47';
    ctx.fillRect(0, 0, w, h);
    const location = getLocation(state.locationId),
      islands = location.islands,
      buoys = track
        ? track.marks || []
        : race
          ? race.marks || race.course.marks
          : location.buoys.map(
              (b, i) =>
                state.worldBodies?.find((body) => body.id === `${location.id}:buoy:${i}`) || b,
            ),
      scale =
        w /
        (training
          ? Math.max(
              training.span,
              Math.abs(state.x - training.center.x) * 2.4,
              (Math.abs(state.z - training.center.z) * 2.4 * w) / h,
            )
          : location.chart.span),
      map = (x, z) => [
        w * 0.5 + (x - (training?.center.x ?? location.chart.centerX)) * scale,
        h * 0.5 + (z - (training?.center.z ?? location.chart.centerZ)) * scale,
      ];
    ctx.strokeStyle = '#ffffff0b';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += w / 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += w / 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (const i of islands) {
      if (i.polygon) {
        ctx.fillStyle = '#d7cfaa';
        ctx.beginPath();
        i.polygon.forEach(([x, z], j) => (j ? ctx.lineTo(...map(x, z)) : ctx.moveTo(...map(x, z))));
        ctx.closePath();
        ctx.fill();
        continue;
      }
      if (i.raster) {
        drawTerrainChart(ctx, i, map, scale);
        continue;
      }
      const [x, y] = map(i.x, i.z);
      ctx.fillStyle = '#28535a';
      ctx.beginPath();
      for (let j = 0; j <= 90; j++) {
        const a = (j / 90) * Math.PI * 2,
          r = shoreScale(a) * (1 + 3.8 / location.shoreDepthScale),
          px = x + Math.cos(a) * i.rx * scale * r,
          py = y + Math.sin(a) * i.rz * scale * r;
        j ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#577669';
      ctx.strokeStyle = '#bdba91';
      ctx.beginPath();
      for (let j = 0; j <= 90; j++) {
        const a = (j / 90) * Math.PI * 2,
          ratio = shoreScale(a),
          px = x + Math.cos(a) * i.rx * scale * ratio,
          py = y + Math.sin(a) * i.rz * scale * ratio;
        j ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (w > 300) {
        ctx.save();
        ctx.strokeStyle = '#9ac4c255';
        ctx.setLineDash([4, 5]);
        ctx.beginPath();
        for (let j = 0; j <= 90; j++) {
          const a = (j / 90) * Math.PI * 2,
            r = shoreScale(a) * (1 + 3 / location.shoreDepthScale),
            px = x + Math.cos(a) * i.rx * scale * r,
            py = y + Math.sin(a) * i.rz * scale * r;
          j ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }
      if (w > 300) {
        ctx.fillStyle = '#c5d4c2';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(i.name, x, y + 5);
      }
    }
    if (w > 300)
      for (const landmark of location.landmarks || []) {
        const [x, y] = map(landmark.x, landmark.z);
        if (x < 20 || x > w - 20 || y < 25 || y > h - 30) continue;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e4e6cc';
        ctx.fillText(landmark.name, x, y);
      }
    for (const feature of getCoastalFeatures(location.id)) {
      const [x, y] = map(feature.x, feature.z);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-feature.rotation);
      ctx.fillStyle = feature.type === 'chapel' ? '#e8ddbc' : '#bca487';
      const width = Math.max(1.5, feature.width * scale),
        length = Math.max(2, feature.length * scale);
      ctx.fillRect(-width / 2, -length / 2, width, length);
      ctx.restore();
      if (feature.type === 'chapel' && w > 300) {
        ctx.strokeStyle = '#f5e9c8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y - 7);
        ctx.lineTo(x, y - 15);
        ctx.moveTo(x - 3, y - 12);
        ctx.lineTo(x + 3, y - 12);
        ctx.stroke();
      }
    }
    if (location.lighthouse && w > 300) {
      const [x, y] = map(location.lighthouse.x, location.lighthouse.z);
      ctx.fillStyle = '#f5e9c8';
      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x + 3, y + 3);
      ctx.lineTo(x - 3, y + 3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f5e9c880';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 4);
      ctx.lineTo(x + 8, y - 4);
      ctx.stroke();
    }
    if (state.timeOfDay === 'night' && !track) {
      ctx.save();
      for (const light of navigationLights(state.locationId)) {
        const [x, y] = map(light.x, light.z);
        ctx.fillStyle = light.color;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        if (w > 300) {
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(light.label, x + 7, y + (light.kind === 'leading' ? 12 : -7));
        }
      }
      ctx.restore();
    }
    if (race) {
      ctx.strokeStyle = '#ecd09477';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      [race.course.start, ...buoys].forEach((point, i) =>
        i ? ctx.lineTo(...map(point.x, point.z)) : ctx.moveTo(...map(point.x, point.z)),
      );
      ctx.stroke();
      ctx.setLineDash([]);
      for (const rival of race.racers.slice(1)) {
        const [x, y] = map(rival.state.x, rival.state.z);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rival.state.heading * Math.PI) / 180);
        ctx.fillStyle = rival.color;
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(4, 5);
        ctx.lineTo(-4, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        if (w > 300) {
          ctx.fillStyle = rival.color;
          ctx.font = '12px sans-serif';
          ctx.fillText(rival.name, x + 10, y);
        }
      }
    }
    buoys.forEach((b, i) => {
      const [x, y] = map(b.x, b.z);
      ctx.fillStyle = i === challengeIndex ? '#f4c87b' : '#b48d4f';
      ctx.beginPath();
      ctx.arc(x, y, w > 300 ? 6 : 3, 0, Math.PI * 2);
      ctx.fill();
      if (w > 300) {
        ctx.fillText(String(i + 1), x + 14, y + 5);
      }
    });
    for (const body of state.worldBodies || []) {
      if (body.visual?.type === 'yacht') {
        const [bx, by] = map(body.x, body.z);
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate((body.heading * Math.PI) / 180);
        ctx.strokeStyle = body.kind === 'free' ? '#bde6df' : '#98b8c3';
        ctx.fillStyle = '#244951';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(3.5, 4);
        ctx.lineTo(-3.5, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (body.visual?.type === 'pier') {
        const [bx, by] = map(body.x, body.z);
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate((body.heading * Math.PI) / 180);
        ctx.fillStyle = '#beaa7d';
        ctx.fillRect(
          (-body.shape.beam * scale) / 2,
          (-body.shape.length * scale) / 2,
          Math.max(1, body.shape.beam * scale),
          Math.max(1, body.shape.length * scale),
        );
        ctx.restore();
      }
    }
    if (training) {
      const { gate, target, corridor } = training.cues;
      ctx.save();
      for (const [index, route] of (training.cues.alternatives || []).entries()) {
        ctx.strokeStyle = index ? '#aadcd0aa' : '#f1c888aa';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        route.points.forEach((point, i) =>
          i ? ctx.lineTo(...map(point.x, point.z)) : ctx.moveTo(...map(point.x, point.z)),
        );
        ctx.stroke();
        if (w > 300) {
          const point = route.points[Math.floor(route.points.length / 2)];
          const [x, y] = map(point.x, point.z);
          ctx.font = '12px sans-serif';
          ctx.textAlign = index ? 'right' : 'left';
          ctx.fillText(t(route.name), x + (index ? -10 : 10), y - 10);
        }
      }
      ctx.setLineDash([]);
      if (training.cues.route) {
        ctx.strokeStyle = '#93c5ae88';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        training.cues.route.forEach((point, i) => {
          const p = map(point.x, point.z);
          i ? ctx.lineTo(...p) : ctx.moveTo(...p);
        });
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#e0dec2';
        ctx.font = `${w > 300 ? 14 : 9}px sans-serif`;
        ctx.textAlign = 'left';
        for (const point of training.cues.route) {
          const [x, y] = map(point.x, point.z);
          ctx.fillText(String(point.number), x + 5, y - 7);
        }
      }
      ctx.strokeStyle = '#efc27d';
      ctx.lineWidth = 2;
      if (gate) {
        const a = localToWorld({ ...gate, heading: gate.heading ?? 0 }, -gate.width / 2, 0),
          b = localToWorld({ ...gate, heading: gate.heading ?? 0 }, gate.width / 2, 0);
        ctx.beginPath();
        ctx.moveTo(...map(a.x, a.z));
        ctx.lineTo(...map(b.x, b.z));
        ctx.stroke();
      }
      if (target) {
        const [tx, ty] = map(target.x, target.z);
        ctx.strokeStyle = '#93c5ae';
        ctx.beginPath();
        ctx.arc(tx, ty, target.radius * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (corridor) {
        ctx.strokeStyle = '#93c5ae';
        for (const sign of [-1, 1]) {
          const origin = { ...corridor, heading: corridor.heading ?? 0 },
            pa = localToWorld(origin, (sign * corridor.width) / 2, -corridor.length / 2),
            pb = localToWorld(origin, (sign * corridor.width) / 2, corridor.length / 2);
          const a = map(pa.x, pa.z),
            b = map(pb.x, pb.z);
          ctx.beginPath();
          ctx.moveTo(...a);
          ctx.lineTo(...b);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    if (track) {
      ctx.save();
      ctx.strokeStyle = '#74ead5';
      ctx.lineWidth = 3;
      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.beginPath();
      track.samples.forEach((sample, index) => {
        const p = map(sample.x, sample.z);
        index ? ctx.lineTo(...p) : ctx.moveTo(...p);
      });
      ctx.stroke();
      const start = track.samples[0],
        end = track.samples.at(-1);
      const [sx, sy] = map(start.x, start.z),
        [ex, ey] = map(end.x, end.z);
      ctx.fillStyle = '#173d47';
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f4c87b';
      ctx.fillRect(ex - 4, ey - 4, 8, 8);
      ctx.restore();
      canvas.dataset.trackPoints = String(track.samples.length);
    } else {
      drawAnchorChart(ctx, map, scale, anchorSnapshot(state));
      const [x, y] = map(state.x, state.z);
      canvas.dataset.vesselVisible = String(x >= 0 && x <= w && y >= 0 && y <= h);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((state.heading * Math.PI) / 180);
      ctx.fillStyle = '#f4f2da';
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(5, 6);
      ctx.lineTo(0, 3);
      ctx.lineTo(-5, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#a7c4c5';
    ctx.font = `${w > 300 ? 13 : 10}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('N ↑', 12, 21);
    const barMetres = track
        ? Math.max(1, 10 ** Math.floor(Math.log10(w / scale / 5)))
        : race
          ? 100
          : training
            ? 25
            : 250,
      barLength = barMetres * scale;
    ctx.strokeStyle = '#a7c4c5';
    ctx.beginPath();
    ctx.moveTo(12, h - 28);
    ctx.lineTo(12 + barLength, h - 28);
    ctx.moveTo(12, h - 32);
    ctx.lineTo(12, h - 24);
    ctx.moveTo(12 + barLength, h - 32);
    ctx.lineTo(12 + barLength, h - 24);
    ctx.stroke();
    ctx.fillText(`${barMetres} m`, 12, h - 8);
    if (w > 300) {
      ctx.fillStyle = '#a7c4c5';
      ctx.textAlign = 'right';
      ctx.fillText(t('Dashed: 3 m contour'), w - 16, h - 12);
    }
  };
}
