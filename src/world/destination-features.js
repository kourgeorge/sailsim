import { geographicPoint, terrainHeight } from './real-terrain.js';

export function destinationBuildings(location) {
  const features=[];
  let seed=8317;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  for(const [districtIndex,district] of (location.character?.settlements||[]).entries()) {
    const center=geographicPoint(location,district.lat,district.lon);
    for(let i=0;i<district.count*8 && features.filter(f=>f.district===districtIndex).length<district.count;i++) {
      const x=center.x+(random()-.5)*district.radius*2,z=center.z+(random()-.5)*district.radius*2;
      const y=terrainHeight(x,z,location.islands[0]);
      const width=5+random()*8,length=6+random()*10;
      const rotation=Math.round(random()*4)*Math.PI/2;
      const h=[[-width/2,-length/2],[width/2,-length/2],[-width/2,length/2],[width/2,length/2]].map(([dx,dz])=>terrainHeight(x+dx,z+dz,location.islands[0]));
      if(Math.min(...h)<1 || Math.max(...h)-Math.min(...h)>6 || features.some(f=>Math.hypot(f.x-x,f.z-z)<(f.width+width)*.7))continue;
      features.push({type:features.length%29===0?'chapel':'house',islandIndex:0,district:districtIndex,x,z,y:Math.max(...h),width,length,rotation,height:4+random()*5,foundation:Math.max(.6,Math.max(...h)-Math.min(...h)+.4),radius:Math.hypot(width,length)/2+3,variant:features.length%4});
    }
  }
  return Object.freeze(features.map(Object.freeze));
}

export function destinationMarina(location,character) {
  if(!character.harbor)return null;
  const p=geographicPoint(location,character.harbor.lat,character.harbor.lon);
  // A simplified pier layout sits in actual water, with dry shoreline nearby.
  let best=null,score=Infinity;
  const angle=character.harbor.heading*Math.PI/180,span=(character.harbor.berths-1)*11+12;
  for(let dx=-180;dx<=180;dx+=15)for(let dz=-180;dz<=180;dz+=15){
    const x=p.x+dx,z=p.z+dz;
    const safe=[[-span,-8],[span,-8],[-span,30],[span,30],[0,0]].every(([a,b])=>terrainHeight(x+Math.cos(angle)*a-Math.sin(angle)*b,z+Math.sin(angle)*a+Math.cos(angle)*b,location.islands[0])<-.8);
    if(safe&&dx*dx+dz*dz<score){best={x,z};score=dx*dx+dz*dz;}
  }
  return best?{...best,heading:character.harbor.heading,berths:character.harbor.berths,spacing:22}:null;
}

const bungalowCache=new WeakMap();
export function destinationBungalows(location) {
  if(bungalowCache.has(location))return bungalowCache.get(location);
  const huts=[];
  for(const site of location.character?.bungalows||[]) {
    const center=geographicPoint(location,site.lat,site.lon);
    for(let i=0;i<site.count;i++) {
      const x=center.x+(i-site.count/2)*19,z=center.z+Math.sin(i*.5)*30;
      if(terrainHeight(x,z,location.islands[0])<-.5)huts.push({x,z});
    }
  }
  bungalowCache.set(location,huts);return huts;
}
