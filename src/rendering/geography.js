// A shared continuous shoreline for both terrain rendering and depth soundings.
export function shoreScale(angle) {return 1+.075*Math.sin(angle*5+.7)+.035*Math.cos(angle*9-1.2);}
export function islandRatio(x,z,island) {const nx=(x-island.x)/island.rx,nz=(z-island.z)/island.rz;return Math.hypot(nx,nz)/shoreScale(Math.atan2(nz,nx));}
export function islandHeight(x,z,island){
 const nx=(x-island.x)/island.rx,nz=(z-island.z)/island.rz,r=islandRatio(x,z,island);
 if(r>1)return -(r-1)*30;
 const envelope=Math.pow(Math.max(0,1-r),1.25);
 const ridges=.65+.18*Math.sin(nx*7+nz*3)+.14*Math.cos(nz*9-nx*4)+.06*Math.sin(nx*19+nz*21);
 return Math.max(0,island.height*envelope*ridges-1.5);
}
