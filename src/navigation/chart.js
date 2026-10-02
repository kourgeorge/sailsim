import { getLocation } from '../locations.js';
import { shoreScale } from '../rendering/geography.js';
import { drawAnchorChart } from '../anchoring/diagram.js';
import { anchorSnapshot } from '../anchor.js';
import { translate as t } from '../i18n/runtime.js';
import { localToWorld } from '../world/bodies.js';

export function createChartRenderer({
  getState,
  getTraining,
  getChallengeIndex,
  getRace = () => null,
}) {
  return function drawChart(canvas) {
    if (!canvas) return;
    const state = getState(),
      race = getRace();
    let training = getTraining();
    const challengeIndex = race ? race.racers[0].mark : getChallengeIndex();
    const ctx = canvas.getContext('2d'),
      w = canvas.width,
      h = canvas.height;
    if (race) {
      const points = [
        race.course.start,
        ...race.course.marks,
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
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#173d47';
    ctx.fillRect(0, 0, w, h);
    const location = getLocation(state.locationId),
      islands = location.islands,
      buoys = race
        ? race.course.marks
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
      const [x, y] = map(i.x, i.z);
      ctx.fillStyle = '#577669';
      ctx.strokeStyle = '#8eaa8a';
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
    ctx.fillStyle = '#a7c4c5';
    ctx.font = `${w > 300 ? 13 : 10}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('N ↑', 12, 21);
    const barMetres = race ? 100 : training ? 25 : 250,
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
