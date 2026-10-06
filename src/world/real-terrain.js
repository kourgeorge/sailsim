// The same triangle surface is sampled by grounding and rendered in WebGL.
// Heights are little-endian signed decimetres, decoded once per destination.
const grids = new WeakMap();
export function terrainHeights(raster) {
  if (!grids.has(raster)) {
    const bytes = Uint8Array.from(atob(raster.encoded), c => c.charCodeAt(0));
    const values = new Float32Array(raster.cols * raster.rows);
    if (raster.encoding === 'delta-rle-v1') {
      let cursor=0,index=0,last=0;
      const read=()=>{let value=0,shift=0,byte;do {byte=bytes[cursor++];value|=(byte&127)<<shift;shift+=7;} while(byte&128);return value;};
      while(index<values.length) {
        const token=read();
        if(token===0) {const count=read();values.fill(last/10,index,index+count);index+=count;}
        else {const delta=token-1;last+=(delta>>>1)^-(delta&1);values[index++]=last/10;}
      }
    } else {
      const view = new DataView(bytes.buffer);
      for (let i = 0; i < values.length; i++) values[i] = view.getInt16(i * 2, true) / 10;
    }
    grids.set(raster, values);
  }
  return grids.get(raster);
}

export function terrainHeight(x, z, island) {
  const r = island.raster;
  const u = (x - island.x + r.width / 2) / r.width * (r.cols - 1);
  const v = (z - island.z + r.length / 2) / r.length * (r.rows - 1);
  // Extend edge samples outside a bounded survey; never turn a clipped headland
  // into an abrupt open-water drop. The chart shows the actual survey boundary.
  const cu = Math.max(0, Math.min(r.cols - 1, u));
  const cv = Math.max(0, Math.min(r.rows - 1, v));
  const col = Math.min(r.cols - 2, Math.floor(cu));
  const row = Math.min(r.rows - 2, Math.floor(cv));
  const a = cu - col, b = cv - row, i = row * r.cols + col;
  const h = terrainHeights(r);
  return a + b <= 1
    ? h[i] + a * (h[i + 1] - h[i]) + b * (h[i + r.cols] - h[i])
    : h[i + r.cols + 1] + (1 - a) * (h[i + r.cols] - h[i + r.cols + 1]) + (1 - b) * (h[i + 1] - h[i + r.cols + 1]);
}

export function geographicPoint(location, lat, lon) {
  return { x: (lon - location.coordinates.lon) * 111320 * Math.cos(location.coordinates.lat * Math.PI / 180), z: (location.coordinates.lat - lat) * 111320 };
}

export function worldMapPoint({ lat, lon }) {
  // Equirectangular map: north stays up in every interface language.
  return { x: (lon + 180) / 360 * 100, y: (90 - lat) / 180 * 100 };
}

export function polygonHeight(x,z,island) {
  const points=island.polygon;let inside=false,distance=Infinity;
  for(let i=0,j=points.length-1;i<points.length;j=i++) {
    const [ax,az]=points[j],[bx,bz]=points[i],dx=bx-ax,dz=bz-az;
    const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1)));
    distance=Math.min(distance,Math.hypot(x-ax-t*dx,z-az-t*dz));
    if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)inside=!inside;
  }
  return inside?Math.min(island.height,distance*.18):-Math.min(30,distance*.12);
}
