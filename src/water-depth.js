import { islandRatio } from './rendering/geography.js';
import { getLocation, DEFAULT_LOCATION_ID } from './locations.js';

/** Shared chart/physics depth datum, metres below the still-water surface. */
export function depthAt(x,z,locationId=DEFAULT_LOCATION_ID) {
  const location=getLocation(locationId);
  let depth=location.maxDepth;
  for(const island of location.islands)depth=Math.min(depth,(islandRatio(x,z,island)-1)*location.shoreDepthScale);
  return Math.max(0,Math.min(depth,location.maxDepth));
}
