import { islandRatio } from './rendering/geography.js';
import { getLocation, DEFAULT_LOCATION_ID } from './locations.js';
import { terrainHeight, polygonHeight } from './world/real-terrain.js';

/** Shared chart/physics depth datum, metres below the still-water surface. */
export function depthAt(x,z,locationId=DEFAULT_LOCATION_ID) {
  const location=getLocation(locationId);
  if(location.islands[0]?.raster){
    for(const island of location.islands)if(island.polygon&&Math.abs(x-island.x)<island.rx+90&&Math.abs(z-island.z)<island.rz+90)return Math.max(0,-polygonHeight(x,z,island));
    return Math.max(0,-terrainHeight(x,z,location.islands[0]));
  }
  let depth=location.maxDepth;
  for(const island of location.islands)depth=Math.min(depth,(islandRatio(x,z,island)-1)*location.shoreDepthScale);
  return Math.max(0,Math.min(depth,location.maxDepth));
}
