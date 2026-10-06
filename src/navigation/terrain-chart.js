import { terrainHeights } from '../world/real-terrain.js';

const tiles = new WeakMap();
export function drawTerrainChart(ctx, island, map, scale) {
  const r = island.raster;
  if (!tiles.has(r)) {
    const canvas = document.createElement('canvas');
    canvas.width = r.cols; canvas.height = r.rows;
    const context = canvas.getContext('2d'), image = context.createImageData(r.cols, r.rows), h = terrainHeights(r);
    for (let i = 0; i < h.length; i++) {
      const y = h[i], color = y >= 0 ? [87,118,105] : y > -3 ? [75,128,126] : y > -10 ? [40,83,90] : [23,61,71];
      image.data.set([...color,255], i * 4);
    }
    context.putImageData(image,0,0); tiles.set(r,canvas);
  }
  const [x,y] = map(island.x-r.width/2,island.z-r.length/2);
  ctx.drawImage(tiles.get(r),x,y,r.width*scale,r.length*scale);
  ctx.strokeStyle='#bdba91'; ctx.lineWidth=.8; ctx.beginPath();
  for (const coast of r.coasts) coast.forEach(([x,z],i) => i ? ctx.lineTo(...map(x,z)) : ctx.moveTo(...map(x,z)));
  ctx.stroke();
  ctx.save(); ctx.strokeStyle='#9ac4c255'; ctx.setLineDash([4,5]); ctx.beginPath();
  for (const coast of r.shallows || []) coast.forEach(([x,z],i) => i ? ctx.lineTo(...map(x,z)) : ctx.moveTo(...map(x,z)));
  ctx.stroke();
  ctx.strokeStyle='#a7c4c533'; ctx.strokeRect(x,y,r.width*scale,r.length*scale); ctx.restore();
}
