import { getLocation } from '../locations.js';
import { islandHeight, shoreScale } from '../rendering/geography.js';

// All dimensions are metres, masses kilograms, headings compass degrees.
// Local +X is starboard and local −Z is the bow. The renderer and solver
// consume these same fixtures; moving a boat never moves its mooring anchor.
export function localToWorld(origin, x, z) {
  const angle = origin.heading * Math.PI / 180;
  return { x: origin.x + Math.cos(angle) * x - Math.sin(angle) * z,
    z: origin.z + Math.sin(angle) * x + Math.cos(angle) * z };
}

export function yachtHullShape(scale = 1) {
  const sections = [[-6.6,.015],[-6,.55],[-4.7,1.25],[-3,1.75],[-1,2.02],[1,2.06],[3,1.95],[5.25,1.62]];
  return { type:'hull', length:11.85*scale, beam:4.12*scale,
    vertices:[...sections.map(([z,x])=>[x*scale,z*scale]),
      ...[...sections].reverse().map(([z,x])=>[-x*scale,z*scale])] };
}

export function buoyBodyDefinition(id, point, index, { radius = 1.03, mass = 480 } = {}) {
  return {
    id, kind: 'moored', x: point.x, z: point.z, heading: 0,
    vx: 0, vz: 0, yawRate: 0, mass, inertia: mass * radius ** 2 / 2,
    shape: { type: 'circle', radius }, linearDamping: .65, angularDamping: .9,
    mooring: { x: point.x, z: point.z, slack: .8, stiffness: 900, damping: 850, maxRadius: 3.5 },
    visual: { type: 'buoy', index },
  };
}

// A separate seed keeps collision geography independent of texture/tree draws.
export function getWorldRockDefinitions(locationId = 'haven') {
  const location=getLocation(locationId),rocks=[];
  let seed=17383;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  location.islands.forEach((island,islandIndex)=>{
    for(let index=0;index<105;index++){
      const angle=random()*Math.PI*2,r=(.96+random()*.075)*shoreScale(angle);
      const x=island.x+Math.cos(angle)*island.rx*r,z=island.z+Math.sin(angle)*island.rz*r;
      rocks.push({id:`${location.id}:rock:${islandIndex}:${index}`,x,z,
        y:Math.max(-1,islandHeight(x,z,island))-.35,scale:1+random()*4,
        angle:random()*Math.PI*2,roll:random(),pitch:random(),shade:.42+random()*.2});
    }
  });
  return rocks;
}

export function getWorldBodyDefinitions(locationId = 'haven') {
  const location = getLocation(locationId), prefix = location.id, bodies = [];
  location.buoys.forEach((point,index) => bodies.push(buoyBodyDefinition(`${prefix}:buoy:${index}`, point, index)));
  if (location.marina) {
    const marina = location.marina, span = (marina.berths-1)*marina.spacing;
    const pier = (id,x,z,length,beam,index) => bodies.push({
      id:`${prefix}:marina:${id}`,kind:'fixed',...localToWorld(marina,x,z),
      heading:marina.heading,vx:0,vz:0,yawRate:0,mass:0,inertia:0,
      shape:{type:'box',length,beam},visual:{type:'pier',index},
    });
    pier('spine',0,0,5,span+14,-1);
    for(let index=0;index<marina.berths;index++) pier(`finger:${index}`,-span/2+index*marina.spacing,12,25,2,index);
    for(let index=0;index<marina.berths-1;index++) {
      if(index===marina.vacantBerth)continue;
      const scale=.74+(index%2)*.13,point=localToWorld(marina,-span/2+(index+.5)*marina.spacing,13);
      const mass=5600*scale**3,shape=yachtHullShape(scale);
      bodies.push({id:`${prefix}:yacht:moored:${index}`,kind:'moored',...point,
        heading:(marina.heading+180)%360,vx:0,vz:0,yawRate:0,mass,
        inertia:mass*(shape.length**2+shape.beam**2)/12,shape,
        mooring:{...point,slack:.3,stiffness:1800,damping:2100,maxRadius:2.5,
          heading:(marina.heading+180)%360,
          headingStiffness:mass*(shape.length**2+shape.beam**2)/12*.08,
          headingDamping:mass*(shape.length**2+shape.beam**2)/12*.35},
        visual:{type:'yacht',scale,index,mooringLines:[-4.8,4.2].map(z=>({
          local:{x:1.7*scale,z:z*scale},
          fixed:localToWorld(marina,-span/2+index*marina.spacing+1,13-z*scale),
        }))},
      });
    }
  }
  // An unpowered drifting yacht, clear of the lesson start and buoy routes.
  const freePoints={haven:{x:310,z:85},shelter:{x:-180,z:205},strait:{x:125,z:800},fjord:{x:110,z:760}};
  const scale=.84,mass=5600*scale**3,shape=yachtHullShape(scale);
  bodies.push({id:`${prefix}:yacht:free:0`,kind:'free',...freePoints[prefix],heading:20,
    vx:0,vz:0,yawRate:0,mass,inertia:mass*(shape.length**2+shape.beam**2)/12,shape,
    visual:{type:'yacht',scale,index:0},
  });
  for(const rock of getWorldRockDefinitions(location.id)) {
    if(rock.y>2.5)continue; // Higher rocks sit inside already-grounded terrain.
    bodies.push({id:rock.id,kind:'fixed',x:rock.x,z:rock.z,heading:0,
      vx:0,vz:0,yawRate:0,mass:0,inertia:0,
      shape:{type:'circle',radius:rock.scale},visual:{type:'rock'}});
  }
  return bodies;
}
