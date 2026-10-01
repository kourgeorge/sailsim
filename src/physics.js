import { islandRatio } from './rendering/geography.js';
import { getLocation, DEFAULT_LOCATION_ID } from './locations.js';
import { createRigidBody, createWorldBodies, PLAYER_HULL, advanceFreeBodies, solveContacts, collisionStepLimit, separatedBeyond } from './collisions.js';
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const wrap = v => ((v % 360) + 360) % 360;
export const angleDifference = (a, b) => ((a - b + 540) % 360 + 360) % 360 - 180;
export const KNOT = 1852 / 3600;
const RAD = Math.PI / 180;
export const VESSEL = Object.freeze({ mass: 5600, waterline: 9.5, draft: 1.8, mainArea: 30, jibArea: 22, airDensity: 1.225, bowHeight: 1.2 });
// Backward-compatible aliases for the original course and assessments.
export const islands = getLocation().islands;
export const buoys = getLocation().buoys;
export function pointOfSail(angle) {
  const a = Math.abs(angleDifference(angle, 0));
  return a < 38 ? 'In irons' : a < 60 ? 'Close hauled' : a < 80 ? 'Close reach' : a < 105 ? 'Beam reach' : a < 155 ? 'Broad reach' : 'Running';
}
export function initialState(locationId = DEFAULT_LOCATION_ID) {
  const location=getLocation(locationId);
  return {locationId:location.id,...location.start,speed:0,rudder:0,trim:45,mainSheet:45,jibSheet:40,sails:1,
    mainHoist:1,jibHoist:1,reef:false,reefLevel:0,traveler:0,vang:.45,outhaul:.5,throttle:0,
    anchor:false,anchorRode:180,anchorStatus:'Stowed',anchorScope:0,anchorTension:0,anchorDragging:false,
    ...location.conditions,heel:0,leeway:0,yawRate:0,
    distance:0,elapsed:0,depth:depthAt(location.start.x,location.start.z,location.id),grounded:false,speedOverGround:0,courseOverGround:location.start.heading,
    apparentWindSpeed:location.conditions.windSpeed,apparentWindAngle:angleDifference(location.conditions.windDirection,location.start.heading),suggestedMainSheet:45,suggestedJibSheet:40,
    mainEfficiency:0,jibEfficiency:0,mainFlow:'Ready',jibFlow:'Ready',vmg:0,turnRate:0,
    worldBodies:createWorldBodies(location.id),collision:null,collisionCount:0,collisionEvents:[],contactActive:false,_contactEpisodes:{}};
}
export function depthAt(x,z,locationId = DEFAULT_LOCATION_ID) {
  const location=getLocation(locationId);
  let depth=location.maxDepth;
  for(const island of location.islands)depth=Math.min(depth,(islandRatio(x,z,island)-1)*location.shoreDepthScale);
  return clamp(depth,0,location.maxDepth);
}
// A grounded hull is stationary relative to land even while current flows past it.
function groundVelocity(s) {
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
  const aw=apparentWind(s), a=Math.abs(aw.angle), twa=Math.abs(angleDifference(s.windDirection,s.heading));
  const noGo=clamp((twa-38)/9,0,1), pressure=.5*VESSEL.airDensity*(aw.speed*KNOT)**2;
  const reefArea=[1,.72,.48][s.reefLevel];
  const shape=1-.18*Math.abs(s.outhaul-clamp(s.windSpeed/25,0,1))-.12*Math.abs(s.vang-clamp(a/140,.2,.85));
  const main=sailForce(aw.angle,clamp(s.mainSheet+s.traveler,0,90),VESSEL.mainArea*s.mainHoist*reefArea,pressure,noGo,shape);
  const jib=sailForce(aw.angle,s.jibSheet,VESSEL.jibArea*s.jibHoist,pressure,noGo);
  return {aw,main,jib,reefArea};
}
function sailTelemetry(s,{aw,main,jib}) {
  s.apparentWindSpeed=aw.speed;s.apparentWindAngle=aw.angle;
  s.suggestedMainSheet=clamp(suggestedSheet(aw.angle)-s.traveler,0,90);s.suggestedJibSheet=suggestedSheet(aw.angle);
  s.mainEfficiency=main.efficiency;s.jibEfficiency=jib.efficiency;s.mainFlow=main.flow;s.jibFlow=jib.flow;
}
/** Refresh instruments after edits while paused, without integrating movement or capturing an anchor. */
export function refreshDerived(s) {
  reconcile(s);
  sailTelemetry(s,sailDynamics(s));
  if(!s.grounded)s.depth=depthAt(s.x,s.z,s.locationId);
  const {x:vx,z:vz}=groundVelocity(s);
  s.speedOverGround=Math.hypot(vx,vz)/KNOT;
  if(s.speedOverGround>.01)s.courseOverGround=wrap(Math.atan2(vx,-vz)/RAD);
  s.vmg=s.speedOverGround*Math.cos(angleDifference(s.courseOverGround,s.windDirection)*RAD);
  s.turnRate=s.yawRate;
  if(s.anchor){
    const vertical=(s._anchor?.depth??s.depth)+VESSEL.bowHeight;
    s.anchorScope=s.anchorRode/vertical;
    if(s.anchorRode<vertical){s.anchorStatus='Rode too short';s.anchorDragging=false;s.anchorTension=0;}
    else {
      const radius=Math.sqrt(Math.max(0,s.anchorRode*s.anchorRode-vertical*vertical));
      const distance=s._anchor?Math.hypot(s.x-s._anchor.x,s.z-s._anchor.z):0;
      const taut=Boolean(s._anchor)&&distance>=radius-.2;
      s.anchorDragging=Boolean(s.anchorDragging)&&s.anchorScope<3&&taut;
      s.anchorStatus=s.anchorDragging?'Dragging · add scope':s.anchorScope<3?'Short scope · poor holding':taut?'Holding':'Deployed · settling';
      if(!taut)s.anchorTension=0;
    }
  }else{s.anchorStatus='Stowed';s.anchorScope=0;s.anchorTension=0;s.anchorDragging=false;}
  return s;
}
function integrate(s,dt) {
  // A keel contact remains a grounding until the boat is reset. Later substeps
  // must not erase the contact by checking the last safe (unadvanced) position.
  if(s.grounded){s.speed=0;s.leeway=0;s.yawRate=0;s.turnRate=0;s.speedOverGround=0;s.vmg=0;sailTelemetry(s,sailDynamics(s));s.elapsed+=dt;return;}
  const {aw,main,jib,reefArea}=sailDynamics(s);
  const u=s.speed*KNOT, hullSpeed=1.34*Math.sqrt(VESSEL.waterline/0.3048)*KNOT;
  const drag=58*u+38*u*Math.abs(u)+Math.sign(u)*180*(Math.abs(u)/hullSpeed)**6;
  const rudderDrag=16*u*Math.abs(u)*Math.sin(s.rudder*RAD)**2;
  const heelLoss=Math.max(.65,Math.cos(s.heel*RAD));
  const engine=s.throttle*(s.throttle<0?1050:1650);
  let nextU=u+(main.drive*heelLoss+jib.drive*heelLoss+engine-drag-rudderDrag)/VESSEL.mass*dt;
  const lateral=main.side+jib.side;
  s.leeway+=(lateral-(900+1700*Math.abs(u))*s.leeway)/VESSEL.mass*dt;
  // Signed speed reverses rudder effect astern. Forward propwash grants limited authority at rest.
  const flow=u+(s.throttle>0?.35*s.throttle:0);
  const targetYaw=(flow/VESSEL.waterline)*Math.tan(s.rudder*RAD)/RAD;
  s.yawRate+=(targetYaw-s.yawRate)*(1-Math.exp(-dt/1.6));
  s.heading=wrap(s.heading+s.yawRate*dt);
  const targetHeel=clamp(-lateral*.011*reefArea,-38,38);
  s.heel+=(targetHeel-s.heel)*(1-Math.exp(-dt/2));
  const h=s.heading*RAD,c=(s.currentDirection||0)*RAD;
  let vx=Math.sin(h)*nextU+Math.cos(h)*s.leeway+Math.sin(c)*(s.currentSpeed||0)*KNOT;
  let vz=-Math.cos(h)*nextU+Math.sin(h)*s.leeway-Math.cos(c)*(s.currentSpeed||0)*KNOT;
  let nx=s.x+vx*dt,nz=s.z+vz*dt;
  s.anchorDragging=false;
  if(s.anchor){
    if(!s._anchor){s._anchor={x:s.x,z:s.z,depth:depthAt(s.x,s.z,s.locationId)};}
    const vertical=s._anchor.depth+VESSEL.bowHeight;
    s.anchorScope=s.anchorRode/vertical;
    if(s.anchorRode<vertical){s.anchorStatus='Rode too short';s.anchorTension=0;}
    else {
      const radius=Math.sqrt(Math.max(0,s.anchorRode*s.anchorRode-vertical*vertical));
      const dx=nx-s._anchor.x,dz=nz-s._anchor.z,dist=Math.hypot(dx,dz);
      s.anchorStatus=s.anchorScope<3?'Short scope · poor holding':dist>=radius-.2?'Holding':'Deployed · settling';
      s.anchorTension=0;
      if(dist>radius && dist>0){
        const rx=dx/dist,rz=dz/dist,outward=Math.max(0,vx*rx+vz*rz);
        const hold=clamp((s.anchorScope-1)/2,0,1);
        const corrected=radius+(dist-radius)*(1-hold);
        nx=s._anchor.x+rx*corrected;nz=s._anchor.z+rz*corrected;
        vx-=rx*outward*hold;vz-=rz*outward*hold;
        s.anchorTension=outward*VESSEL.mass/Math.max(dt,.02);
        const waterX=vx-Math.sin(c)*(s.currentSpeed||0)*KNOT,waterZ=vz+Math.cos(c)*(s.currentSpeed||0)*KNOT;
        nextU=waterX*Math.sin(h)-waterZ*Math.cos(h);s.leeway=waterX*Math.cos(h)+waterZ*Math.sin(h);
        if(hold<1){s._anchor.x+=rx*(dist-radius)*(1-hold);s._anchor.z+=rz*(dist-radius)*(1-hold);s.anchorStatus='Dragging · add scope';s.anchorDragging=true;}
      }
    }
  }else{s._anchor=null;s.anchorStatus='Stowed';s.anchorScope=0;s.anchorTension=0;}
  s.depth=depthAt(nx,nz,s.locationId);s.grounded=s.depth<VESSEL.draft;
  if(!s.grounded){s.distance+=Math.hypot(nx-s.x,nz-s.z);s.x=nx;s.z=nz;s.speed=nextU/KNOT;}
  else{s.speed=0;s.leeway=0;s.yawRate=0;vx=0;vz=0;}
  s.speedOverGround=Math.hypot(vx,vz)/KNOT;
  if(s.speedOverGround>.01)s.courseOverGround=wrap(Math.atan2(vx,-vz)/RAD);
  sailTelemetry(s,s.grounded?sailDynamics(s):{aw,main,jib});
  s.vmg=s.speedOverGround*Math.cos(angleDifference(s.courseOverGround,s.windDirection)*RAD);
  s.turnRate=s.yawRate;s.elapsed+=dt;
}
function playerRigidBody(s){
  const body=s._playerBody??(s._playerBody=createRigidBody({id:'player',kind:'free',mass:VESSEL.mass,shape:PLAYER_HULL,restitution:.06,friction:.3}));
  const velocity=groundVelocity(s);
  body.kind=s.grounded?'fixed':'free';body.x=s.x;body.z=s.z;body.heading=s.heading;body.yawRate=s.yawRate;
  body.vx=velocity.x;body.vz=velocity.z;
  return body;
}
function integrateContacts(s,dt){
  const c=(s.currentDirection||0)*RAD,current={x:Math.sin(c)*(s.currentSpeed||0)*KNOT,z:-Math.cos(c)*(s.currentSpeed||0)*KNOT};
  const craft=s.worldBodies.filter(body=>body.visual?.type==='yacht'&&!body.grounded).map(body=>({body,x:body.x,z:body.z}));
  advanceFreeBodies(s.worldBodies,dt,current);
  for(const {body,x,z} of craft)if(depthAt(body.x,body.z,s.locationId)<VESSEL.draft*(body.visual.scale??1)){body.x=x;body.z=z;body.vx=0;body.vz=0;body.yawRate=0;body.grounded=true;}
  const player=playerRigidBody(s),bodies=[player,...s.worldBodies];
  for(const bodyId of Object.keys(s._contactEpisodes)){
    const body=s.worldBodies.find(body=>body.id===bodyId);
    if(!body||separatedBeyond(player,body))delete s._contactEpisodes[bodyId];
  }
  const contacts=solveContacts(bodies);
  const playerContacts=contacts.filter(contact=>contact.aId==='player'||contact.bId==='player');
  s.contactActive=playerContacts.length>0||Object.keys(s._contactEpisodes).length>0;
  for(const contact of contacts){
    if(contact.impulse>1)for(const id of [contact.aId,contact.bId]){const body=bodies.find(body=>body.id===id);body.lastImpact={time:s.elapsed,impulse:contact.impulse,point:{...contact.point},otherId:id===contact.aId?contact.bId:contact.aId};}
  }
  if(playerContacts.length){
    if(!s.grounded){
      s.x=player.x;s.z=player.z;s.heading=player.heading;s.yawRate=player.yawRate;
      const h=s.heading*RAD,wx=player.vx-current.x,wz=player.vz-current.z;
      s.speed=(wx*Math.sin(h)-wz*Math.cos(h))/KNOT;s.leeway=wx*Math.cos(h)+wz*Math.sin(h);
      s.depth=depthAt(s.x,s.z,s.locationId);if(s.depth<VESSEL.draft){s.grounded=true;s.speed=0;s.leeway=0;s.yawRate=0;}
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
  return s;
}
