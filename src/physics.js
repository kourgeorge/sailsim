import { getLocation, DEFAULT_LOCATION_ID } from './locations.js';
import { depthAt } from './water-depth.js';
import { bowFairlead, anchorSnapshot, anchorStatusText, reconcileAnchorControls, advanceAnchorWinch, updateAirborneAnchor } from './anchor.js';
export { depthAt } from './water-depth.js';
import { createRigidBody, createWorldBodies, PLAYER_HULL, advanceFreeBodies, solveContacts, collisionStepLimit, separatedBeyond, recordContactImpacts } from './collisions.js';
import { MONOHULL, getVessel, vesselYawInertia, catamaranHullShape } from './vessels.js';
import { advanceCatamaran } from './catamaran-physics.js';
import { advanceFreeSailingTraffic } from './world/free-sailing-traffic.js';
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const wrap = v => ((v % 360) + 360) % 360;
export const angleDifference = (a, b) => ((a - b + 540) % 360 + 360) % 360 - 180;
export const KNOT = 1852 / 3600;
const RAD = Math.PI / 180;
export const VESSEL = MONOHULL;
// Backward-compatible aliases for the original course and assessments.
export const islands = getLocation().islands;
export const buoys = getLocation().buoys;
export function pointOfSail(angle,vesselId='monohull') {
  const a = Math.abs(angleDifference(angle, 0));
  return a < (getVessel(vesselId).type==='catamaran'?43:38) ? 'In irons' : a < 60 ? 'Close hauled' : a < 80 ? 'Close reach' : a < 105 ? 'Beam reach' : a < 155 ? 'Broad reach' : 'Running';
}
export function initialState(locationId = DEFAULT_LOCATION_ID, vesselId = 'monohull') {
  const location=getLocation(locationId);
  const waterWind=windOverWater({...location.conditions,heading:location.start.heading});
  return {locationId:location.id,vesselId:getVessel(vesselId).id,timeOfDay:'day',...location.start,speed:0,rudder:0,trim:45,mainSheet:45,jibSheet:40,sails:1,
    mainHoist:1,jibHoist:1,reef:false,reefLevel:0,traveler:0,vang:.45,outhaul:.5,throttle:0,
    anchor:false,anchorRode:180,anchorPaidRode:0,anchorWinchRunning:false,anchorStatus:'Stowed',anchorScope:0,anchorTension:0,anchorDragging:false,
    ...location.conditions,heel:0,leeway:0,yawRate:0,rollRate:0,capsized:false,
    portThrottle:0,starboardThrottle:0,stabilityLoad:0,windwardHullLoad:.5,
    distance:0,elapsed:0,depth:depthAt(location.start.x,location.start.z,location.id),grounded:false,speedOverGround:0,courseOverGround:location.start.heading,
    waterWindSpeed:waterWind.speed,waterWindDirection:waterWind.direction,waterWindAngle:waterWind.angle,
    apparentWindSpeed:waterWind.speed,apparentWindAngle:waterWind.angle??0,suggestedMainSheet:45,suggestedJibSheet:40,
    mainEfficiency:0,jibEfficiency:0,mainFlow:'Ready',jibFlow:'Ready',vmg:0,turnRate:0,
    worldBodies:createWorldBodies(location.id),collision:null,collisionCount:0,collisionEvents:[],contactActive:false,_contactEpisodes:{}};
}
// A grounded hull is stationary relative to land even while current flows past it.
export function groundVelocity(s) {
  if(s.grounded)return {x:0,z:0};
  const h=s.heading*RAD,c=(s.currentDirection||0)*RAD;
  const u=s.speed*KNOT, v=s.leeway||0;
  return {x:Math.sin(h)*u+Math.cos(h)*v+Math.sin(c)*(s.currentSpeed||0)*KNOT,
    z:-Math.cos(h)*u+Math.sin(h)*v-Math.cos(c)*(s.currentSpeed||0)*KNOT};
}
// Bearings describe where wind comes FROM; velocity vectors describe motion TO.
export function apparentWind(s) {
  const w=s.windDirection*RAD,{x:vx,z:vz}=groundVelocity(s);
  const ax=-Math.sin(w)*s.windSpeed*KNOT-vx, az=Math.cos(w)*s.windSpeed*KNOT-vz;
  const direction=wrap(Math.atan2(-ax,az)/RAD);
  return {speed:Math.hypot(ax,az)/KNOT,angle:angleDifference(direction,s.heading),direction};
}
// Air relative to the moving water, independent of the yacht's own motion.
// Weather is air relative to ground; current is water relative to ground.
// A vanishing vector has no bearing: never turn calm into a north wind.
export function windOverWater(s) {
  const w=s.windDirection*RAD,c=(s.currentDirection||0)*RAD;
  const x=(-Math.sin(w)*s.windSpeed-Math.sin(c)*(s.currentSpeed||0))*KNOT;
  const z=(Math.cos(w)*s.windSpeed+Math.cos(c)*(s.currentSpeed||0))*KNOT;
  const magnitude=Math.hypot(x,z);
  if(magnitude<=1e-9)return {speed:0,direction:null,angle:null};
  const direction=wrap(Math.atan2(-x,z)/RAD);
  return {speed:magnitude/KNOT,direction,angle:angleDifference(direction,s.heading)};
}
function reconcile(s) {
  const old=s._controls;
  if(old){
    if(s.trim!==old.trim && s.mainSheet===old.mainSheet)s.mainSheet=s.trim;
    if(s.sails!==old.sails){s.mainHoist=s.sails?1:0;s.jibHoist=s.sails?1:0;}
    if(s.reef!==old.reef && s.reefLevel===old.reefLevel)s.reefLevel=s.reef?1:0;
  } else {
    if(s.trim!==45 && s.mainSheet===45)s.mainSheet=s.trim;
    if(!s.sails){s.mainHoist=0;s.jibHoist=0;}
    if(s.reef && !s.reefLevel)s.reefLevel=1;
  }
  for(const [key,min,max,fallback] of [['mainSheet',0,90,45],['jibSheet',0,90,40],['mainHoist',0,1,1],['jibHoist',0,1,1],['rudder',-35,35,0],['traveler',-20,20,0],['vang',0,1,.45],['outhaul',0,1,.5],['throttle',-1,1,0],['reefLevel',0,2,0],['anchorRode',0,250,180]])s[key]=clamp(Number.isFinite(s[key])?s[key]:fallback,min,max);
  s.reefLevel=Math.round(s.reefLevel);s.trim=s.mainSheet;s.sails=Math.max(s.mainHoist,s.jibHoist);s.reef=s.reefLevel>0;
  s._controls={trim:s.trim,mainSheet:s.mainSheet,sails:s.sails,reef:s.reef,reefLevel:s.reefLevel};
  if(getVessel(s).type==='catamaran'){
    if(s._engineThrottle!==undefined&&s.throttle!==s._engineThrottle){s.portThrottle=s.throttle;s.starboardThrottle=s.throttle;}
    else if(s._engineThrottle===undefined&&s.throttle!==0&&!s.portThrottle&&!s.starboardThrottle){s.portThrottle=s.throttle;s.starboardThrottle=s.throttle;}
    for(const key of ['portThrottle','starboardThrottle'])s[key]=clamp(Number.isFinite(s[key])?s[key]:s.throttle,-1,1);
    s.throttle=(s.portThrottle+s.starboardThrottle)/2;s._engineThrottle=s.throttle;
    s.rollRate=Number.isFinite(s.rollRate)?s.rollRate:0;
  }
  reconcileAnchorControls(s);
}
// Empirical sail coefficients; not a measured polar or CFD solution.
function coefficients(angle,sheet) {
  const alpha=clamp(angle-sheet,0,180), a=alpha*RAD;
  const lift=alpha<90?1.15*Math.exp(-(((alpha-18)/25)**2))*Math.min(1,alpha/8):0;
  const drag=.035+1.3*Math.sin(a)**2;
  return {drive:Math.max(0,lift*Math.sin(angle*RAD)-drag*Math.cos(angle*RAD)),
    side:lift*Math.cos(angle*RAD)+drag*Math.sin(angle*RAD),alpha};
}
export function suggestedSheet(angle) {
  let best=0,power=-1;
  for(let sheet=0;sheet<=85;sheet++){const p=coefficients(Math.abs(angle),sheet).drive;if(p>power){power=p;best=sheet;}}
  return best;
}
function sailForce(angle,sheet,area,pressure,noGo,shape=1) {
  const c=coefficients(Math.abs(angle),sheet), best=coefficients(Math.abs(angle),suggestedSheet(angle)).drive;
  return {drive:pressure*area*c.drive*noGo*shape,side:-Math.sign(angle)*pressure*area*c.side*noGo*shape,
    efficiency:area>0&&best>0?clamp(c.drive/best,0,1)*noGo:0,
    flow:area===0?'Lowered':noGo<.1||c.alpha<5?'Luffing':c.alpha>40&&Math.abs(angle)<120?'Stalled':'Drawing'};
}
function sailDynamics(s) {
  const vessel=getVessel(s);
  const aw=apparentWind(s),water=windOverWater(s),a=Math.abs(aw.angle);
  const noGo=water.angle===null||s.capsized?0:clamp((Math.abs(water.angle)-(vessel.type==='catamaran'?43:38))/9,0,1), pressure=.5*vessel.airDensity*(aw.speed*KNOT)**2;
  const reefArea=[1,.72,.48][s.reefLevel];
  const shape=1-.18*Math.abs(s.outhaul-clamp(water.speed/25,0,1))-.12*Math.abs(s.vang-clamp(a/140,.2,.85));
  const main=sailForce(aw.angle,clamp(s.mainSheet+s.traveler,0,90),vessel.mainArea*s.mainHoist*reefArea,pressure,noGo,shape);
  const jib=sailForce(aw.angle,s.jibSheet,vessel.jibArea*s.jibHoist,pressure,noGo);
  return {aw,water,main,jib,reefArea};
}
function sailTelemetry(s,{aw,water,main,jib}) {
  s.apparentWindSpeed=aw.speed;s.apparentWindAngle=aw.angle;
  s.waterWindSpeed=water.speed;s.waterWindDirection=water.direction;s.waterWindAngle=water.angle;
  s.suggestedMainSheet=clamp(suggestedSheet(aw.angle)-s.traveler,0,90);s.suggestedJibSheet=suggestedSheet(aw.angle);
  s.mainEfficiency=main.efficiency;s.jibEfficiency=jib.efficiency;s.mainFlow=main.flow;s.jibFlow=jib.flow;
}
function anchorTelemetry(s) {
  const snapshot=anchorSnapshot(s);
  s.anchorStatus=anchorStatusText(snapshot);s.anchorScope=snapshot.scope;
  s.anchorDragging=snapshot.status==='dragging';s.anchorTension=snapshot.tension;
}
/** Refresh instruments after edits while paused, without integrating movement or capturing an anchor. */
export function refreshDerived(s) {
  reconcile(s);
  sailTelemetry(s,sailDynamics(s));
  if(!s.grounded)s.depth=vesselWaterClearance(s).depth;
  const {x:vx,z:vz}=groundVelocity(s);
  s.speedOverGround=Math.hypot(vx,vz)/KNOT;
  if(s.speedOverGround>.01)s.courseOverGround=wrap(Math.atan2(vx,-vz)/RAD);
  s.vmg=s.speedOverGround*Math.cos(angleDifference(s.courseOverGround,s.windDirection)*RAD);
  s.turnRate=s.yawRate;
  anchorTelemetry(s);
  return s;
}
export function vesselWaterClearance(s,x=s.x,z=s.z){
  const vessel=getVessel(s);
  if(vessel.type!=='catamaran'){const depth=depthAt(x,z,s.locationId);return {depth,grounded:depth<vessel.draft};}
  const h=s.heading*RAD,depths=[];let grounded=false;
  for(const side of [-1,1])for(const [along,draft] of [[-5,.35],[-2,1.2],[0,1.2],[2,.7],[4.8,1.15],[5.7,.4]]){
    const across=side*vessel.hullSpacing/2;
    const depth=depthAt(x+Math.cos(h)*across-Math.sin(h)*along,z+Math.sin(h)*across+Math.cos(h)*along,s.locationId);
    depths.push(depth);if(depth<draft)grounded=true;
  }
  return {depth:Math.min(...depths),grounded};
}
function integrate(s,dt) {
  const vessel=getVessel(s),yawInertia=vesselYawInertia(vessel);
  advanceAnchorWinch(s,dt);
  // A keel contact remains a grounding until the boat is reset. Later substeps
  // must not erase the contact by checking the last safe (unadvanced) position.
  if(s.grounded){s.speed=0;s.leeway=0;s.yawRate=0;s.turnRate=0;s.speedOverGround=0;s.vmg=0;sailTelemetry(s,sailDynamics(s));updateAirborneAnchor(s,dt);anchorTelemetry(s);s.elapsed+=dt;return;}
  const {aw,water,main,jib,reefArea}=sailDynamics(s);
  const u=s.speed*KNOT, hullSpeed=1.34*Math.sqrt(VESSEL.waterline/0.3048)*KNOT;
  const drag=58*u+38*u*Math.abs(u)+Math.sign(u)*180*(Math.abs(u)/hullSpeed)**6;
  const rudderDrag=16*u*Math.abs(u)*Math.sin(s.rudder*RAD)**2;
  const heelLoss=Math.max(.65,Math.cos(s.heel*RAD));
  const engine=s.throttle*(s.throttle<0?1050:1650);
  let nextU;
  if(vessel.type==='catamaran')nextU=advanceCatamaran(s,{u,main,jib,aw},dt);
  else{
  nextU=u+(main.drive*heelLoss+jib.drive*heelLoss+engine-drag-rudderDrag)/VESSEL.mass*dt;
  const lateral=main.side+jib.side;
  s.leeway+=(lateral-(900+1700*Math.abs(u))*s.leeway)/VESSEL.mass*dt;
  // Signed speed reverses rudder effect astern. Forward propwash grants limited authority at rest.
  const flow=u+(s.throttle>0?.35*s.throttle:0);
  const targetYaw=(flow/VESSEL.waterline)*Math.tan(s.rudder*RAD)/RAD;
  s.yawRate+=(targetYaw-s.yawRate)*(1-Math.exp(-dt/1.6));
  const targetHeel=clamp(-lateral*.011*reefArea,-38,38);
  s.heel+=(targetHeel-s.heel)*(1-Math.exp(-dt/2));
  }
  s.heading=wrap(s.heading+s.yawRate*dt);
  const h=s.heading*RAD,c=(s.currentDirection||0)*RAD;
  let vx=Math.sin(h)*nextU+Math.cos(h)*s.leeway+Math.sin(c)*(s.currentSpeed||0)*KNOT;
  let vz=-Math.cos(h)*nextU+Math.sin(h)*s.leeway-Math.cos(c)*(s.currentSpeed||0)*KNOT;
  let nx=s.x+vx*dt,nz=s.z+vz*dt;
  s.anchorDragging=false;s.anchorTension=0;
  if(s.anchor&&s._anchor&&s._anchor.onBottom!==false){
    const vertical=s._anchor.depth+vessel.bowHeight;
    const scope=s.anchorPaidRode/vertical;
    if(s.anchorPaidRode>=vertical){
      const radius=Math.sqrt(Math.max(0,s.anchorPaidRode*s.anchorPaidRode-vertical*vertical));
      const fairlead=bowFairlead({x:nx,z:nz,heading:s.heading,vesselId:s.vesselId}),arm={x:fairlead.x-nx,z:fairlead.z-nz};
      const dx=fairlead.x-s._anchor.x,dz=fairlead.z-s._anchor.z,dist=Math.hypot(dx,dz);
      if(dist>radius && dist>0){
        const rx=dx/dist,rz=dz/dist,omega=s.yawRate*RAD;
        const outward=Math.max(0,(vx-omega*arm.z)*rx+(vz+omega*arm.x)*rz);
        const hold=clamp((scope-1)/2,0,1),lever=arm.x*rz-arm.z*rx;
        const impulse=outward/(1/vessel.mass+lever*lever/yawInertia)*hold;
        nx-=rx*(dist-radius)*hold;nz-=rz*(dist-radius)*hold;
        vx-=rx*impulse/vessel.mass;vz-=rz*impulse/vessel.mass;
        s.yawRate-=lever*impulse/yawInertia/RAD;
        s.anchorTension=impulse/dt;
        const waterX=vx-Math.sin(c)*(s.currentSpeed||0)*KNOT,waterZ=vz+Math.cos(c)*(s.currentSpeed||0)*KNOT;
        nextU=waterX*Math.sin(h)-waterZ*Math.cos(h);s.leeway=waterX*Math.cos(h)+waterZ*Math.sin(h);
        if(hold<1){s._anchor.x+=rx*(dist-radius)*(1-hold);s._anchor.z+=rz*(dist-radius)*(1-hold);s._anchor.point={x:s._anchor.x,y:-s._anchor.depth,z:s._anchor.z};s.anchorDragging=true;}
      }
    }
  }
  const clearance=vesselWaterClearance(s,nx,nz);s.depth=clearance.depth;s.grounded=clearance.grounded;
  if(!s.grounded){s.distance+=Math.hypot(nx-s.x,nz-s.z);s.x=nx;s.z=nz;s.speed=nextU/KNOT;}
  else{s.speed=0;s.leeway=0;s.yawRate=0;vx=0;vz=0;}
  s.speedOverGround=Math.hypot(vx,vz)/KNOT;
  if(s.speedOverGround>.01)s.courseOverGround=wrap(Math.atan2(vx,-vz)/RAD);
  sailTelemetry(s,s.grounded?sailDynamics(s):{aw,water,main,jib});
  updateAirborneAnchor(s,dt);
  anchorTelemetry(s);
  s.vmg=s.speedOverGround*Math.cos(angleDifference(s.courseOverGround,s.windDirection)*RAD);
  s.turnRate=s.yawRate;s.elapsed+=dt;
}
function playerRigidBody(s){
  const vessel=getVessel(s);
  if(s._playerBody?.vesselId!==vessel.id)s._playerBody=createRigidBody({id:'player',vesselId:vessel.id,kind:'free',mass:vessel.mass,inertia:vesselYawInertia(vessel),shape:vessel.type==='catamaran'?catamaranHullShape():PLAYER_HULL,restitution:.06,friction:.3});
  const body=s._playerBody;
  const velocity=groundVelocity(s);
  body.kind=s.grounded?'fixed':'free';body.x=s.x;body.z=s.z;body.heading=s.heading;body.yawRate=s.yawRate;
  body.vx=velocity.x;body.vz=velocity.z;
  return body;
}
function integrateContacts(s,dt){
  const c=(s.currentDirection||0)*RAD,current={x:Math.sin(c)*(s.currentSpeed||0)*KNOT,z:-Math.cos(c)*(s.currentSpeed||0)*KNOT};
  const craft=s.worldBodies.filter(body=>body.visual?.type==='yacht'&&!body.grounded).map(body=>({body,x:body.x,z:body.z}));
  advanceFreeSailingTraffic(s,dt);
  advanceFreeBodies(s.worldBodies,dt,current);
  for(const {body,x,z} of craft)if(depthAt(body.x,body.z,s.locationId)<getVessel(body.visual.vesselId).draft*(body.visual.scale??1)){body.x=x;body.z=z;body.vx=0;body.vz=0;body.yawRate=0;body.grounded=true;}
  const player=playerRigidBody(s),bodies=[player,...s.worldBodies];
  for(const bodyId of Object.keys(s._contactEpisodes)){
    const body=s.worldBodies.find(body=>body.id===bodyId);
    if(!body||separatedBeyond(player,body))delete s._contactEpisodes[bodyId];
  }
  const contacts=solveContacts(bodies);
  const playerContacts=contacts.filter(contact=>contact.aId==='player'||contact.bId==='player');
  s.contactActive=playerContacts.length>0||Object.keys(s._contactEpisodes).length>0;
  recordContactImpacts(bodies,contacts,s.elapsed);
  if(playerContacts.length){
    if(!s.grounded){
      s.x=player.x;s.z=player.z;s.heading=player.heading;s.yawRate=player.yawRate;
      const h=s.heading*RAD,wx=player.vx-current.x,wz=player.vz-current.z;
      s.speed=(wx*Math.sin(h)-wz*Math.cos(h))/KNOT;s.leeway=wx*Math.cos(h)+wz*Math.sin(h);
      const clearance=vesselWaterClearance(s);s.depth=clearance.depth;if(clearance.grounded){s.grounded=true;s.speed=0;s.leeway=0;s.yawRate=0;}
      refreshDerived(s);
    }
    for(const contact of playerContacts){
      const bodyId=contact.aId==='player'?contact.bId:contact.aId,body=s.worldBodies.find(body=>body.id===bodyId);
      if(s._contactEpisodes[bodyId]===undefined){
        const direction=contact.aId==='player'?1:-1;
        const event={bodyId,bodyKind:body.kind,point:{...contact.point},normal:{x:contact.normal.x*direction,z:contact.normal.z*direction},impulse:contact.impulse,closingSpeed:contact.closingSpeed,time:s.elapsed,sequence:++s.collisionCount};
        s.collision=event;s.collisionEvents=[...s.collisionEvents,event].slice(-16);
      }
      s._contactEpisodes[bodyId]=s.elapsed;
    }
  }
}
export function step(s,dt) {
  if(!Number.isFinite(dt)||dt<=0)return s;
  reconcile(s);
  s.worldBodies??=createWorldBodies(s.locationId);s.collisionCount??=0;s.collisionEvents??=[];s._contactEpisodes??={};
  // Bounded substeps preserve acceleration and turning when render frame rate varies.
  let remaining=Math.min(dt,2);
  while(remaining>1e-9){const chunk=Math.min(collisionStepLimit([playerRigidBody(s),...s.worldBodies]),remaining);integrate(s,chunk);integrateContacts(s,chunk);remaining-=chunk;}
  // Report the final pose/velocities, not airflow from before the last substep.
  return refreshDerived(s);
}
