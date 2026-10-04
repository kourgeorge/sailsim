import {anchorSnapshot} from '../anchor.js';
import {windOverWater} from '../physics.js';
import {practiceGroundSpeed,practiceStopThreshold,practiceWindlassComplete} from './practice-assessment.js';

// The judge and live feedback consume identical rows. Round only in presentation.
// Absolute surge speed deliberately preserves existing grading (not ground speed).
const angle=(a,b)=>((a-b+540)%360)-180;
const display=value=>value===undefined||value===null||typeof value==='number'&&!Number.isFinite(value)?'—':value;
const row=(id,label,actual,target,unit,met)=>({id,label,actual:display(actual),target:display(target),unit,met:Boolean(met)});
const flag=(id,label,met)=>row(id,label,Boolean(met),true,'',met);

/** Compass guidance shares the physical wind frame; calm has no target bearing. */
export function practiceHeadingTarget(check,state){
 if(check?.kind!=='windAngle')return null;
 const wind=windOverWater(state);if(wind.direction===null)return null;
 const relative=angle(state.heading,wind.direction),middle=(check.value[0]+check.value[1])/2;
 return (wind.direction+(relative<0?-middle:middle)+360)%360;
}

export function practiceConditions(check,state,attempt){
 const wind=windOverWater(state),twa=wind.angle===null?null:Math.abs(wind.angle),speed=Math.abs(state.speed);
 const sails=state.mainHoist!==undefined?(state.mainHoist+state.jibHoist)/2:state.sails;
 const speedRow=(limit=2)=>row('boat-speed','Boat speed',speed,`> ${limit}`,'kn',speed>limit);
 const windRow=(min,max)=>row('true-wind-angle','Wind angle over water',twa,`${min}–${max}`,'°',twa!==null&&twa>=min&&twa<=max);
 const anchorUp=()=>flag('anchor-up','Anchor raised',!state.anchor);
 const lowered=()=>row('sail-hoist','Sail hoist (main + jib average)',sails*100,'< 1','%',sails<.01);
 const mainRaised=()=>row('main-hoist','Mainsail hoist',(state.mainHoist??state.sails)*100,'> 95','%',(state.mainHoist??state.sails)>.95);
 const groundRow=()=>{const actual=practiceGroundSpeed(state),limit=practiceStopThreshold(check);return row('ground-speed','Ground speed',actual,`< ${limit}`,'kn',actual<limit);};
 switch(check?.kind){
  case 'engineWaypoint':case 'engineStop':{
   const target=check.value,distance=Math.hypot(state.x-target.x,state.z-target.z),ground=practiceGroundSpeed(state);
   const rows=[row('waypoint-distance','Distance to waypoint',distance,`≤ ${target.radius}`,'m',distance<=target.radius),row('heading','Heading',state.heading,`${target.heading} ± ${target.tolerance}`,'°',Math.abs(angle(state.heading,target.heading))<=target.tolerance),lowered(),anchorUp(),row('water-depth','Water depth',state.depth,'≥ 3','m',state.depth>=3)];
   if(check.kind==='engineStop')rows.push(row('ground-speed','Ground speed',ground,`< ${target.maxSpeed}`,'kn',ground<target.maxSpeed),flag('engine-neutral','Engine neutral',state.throttle===0&&(state.vesselId!=='catamaran'||state.portThrottle===0&&state.starboardThrottle===0)));
   else rows.push(row('signed-speed','Speed through water',state.speed,`${target.speed[0]}–${target.speed[1]}`,'kn',state.speed>=target.speed[0]&&state.speed<=target.speed[1]));
   return rows;
  }
  case 'camera':return [flag('camera',check.value==='deck'?'Cockpit view selected':'Required camera selected',attempt.events.has(`camera:${check.value}`))];
  case 'event':return [flag('event',check.value==='chart'?'Navigation chart opened':'Required action completed',attempt.events.has(`event:${check.value}`))];
  case 'sails':return [check.value===0?lowered():row('sail-hoist','Sail hoist (main + jib average)',sails*100,'> 95','%',sails>.95)];
  case 'speedAbove':return [speedRow(check.value),anchorUp(),row('sail-hoist','Sail hoist (main + jib average)',sails*100,'> 10','%',sails>.1),flag('engine-neutral','Engine neutral',(state.throttle??0)===0)];
  case 'heading':return [row('heading','Heading',state.heading,`${check.value} ± 5`,'°',Math.abs(angle(state.heading,check.value))<=5),speedRow()];
  case 'windAngle':return [windRow(...check.value),speedRow()];
  case 'trim':{
   const difference=Math.abs((state.mainSheet??state.trim)-(state.suggestedMainSheet??Math.max(5,Math.min(88,(twa-35)/1.6))));
   return [mainRaised(),flag('main-drawing','Mainsail drawing',state.mainFlow==='Drawing'),row('trim-error','Difference from suggested trim',difference,`≤ ${check.value}`,'°',difference<=check.value),speedRow()];
  }
  case 'tack':case 'gybe':return [flag('crossing',check.kind==='tack'?'Bow crossed the wind':'Stern crossed the wind',wind.angle!==null&&attempt.maneuver===check.kind),flag('new-tack','Remain on the new tack',wind.direction!==null&&Math.sign(angle(state.heading,wind.direction))===attempt.maneuverSide),speedRow(),check.kind==='tack'?windRow(40,100):windRow(105,175)];
  case 'recover':return [windRow(40,100),speedRow()];
  case 'reef':return [flag('reef','Reef set',state.reefLevel>0||state.reef),mainRaised(),speedRow(1)];
  case 'coast':return [lowered(),anchorUp(),groundRow()];
  case 'anchor':{
   const paid=state.anchorPaidRode,target=state.anchorRode,validPaid=Number.isFinite(paid)&&paid>=0&&paid<=250,validTarget=Number.isFinite(target)&&target>=0&&target<=250;
   const rows=[row('rode-valid','Rode paid out',paid,'0–250','m',validPaid),row('target-rode-valid','Rode target',target,'0–250','m',validTarget),flag('windlass-stopped','Windlass stopped',state.anchorWinchRunning===false)];
   if(check.value===false){
    rows.push(flag('anchor-stowed','Anchor fully stowed',state.anchor===false&&paid<=1e-8));
   }else if(check.value===true){
    const snapshot=anchorSnapshot(state);
    rows.push(flag('anchor-deployed','Anchor deployed',state.anchor===true),row('rode-at-target','Rode paid out at target',paid,target,'m',Math.abs(paid-target)<=1e-8));
    if(Number.isFinite(check.minimumRode))rows.push(row('minimum-rode','Minimum rode paid out',paid,`≥ ${check.minimumRode}`,'m',paid+1e-8>=check.minimumRode));
    rows.push(flag('anchor-bottom','Anchor on seabed',snapshot.seabedContact),row('anchor-scope','Anchor scope',snapshot.scope,'≥ 1','',snapshot.scope>=1),flag('anchor-holding','Anchor not dragging',snapshot.status!=='dragging'&&state.anchorDragging!==true));
   }
   // Preserve exact endpoint tolerance and malformed-state rejection in the helper.
   rows.push(flag('anchor-operation','Anchor operation complete',practiceWindlassComplete(state,check)));
   if(check.value)rows.push(groundRow(),lowered());
   return rows;
  }
  case 'waypoint':{
   const distance=Math.hypot(state.x-check.value.x,state.z-check.value.z);
   return [row('waypoint-distance','Distance to waypoint',distance,`≤ ${check.value.radius}`,'m',distance<=check.value.radius),row('water-depth','Water depth',state.depth,'≥ 3','m',state.depth>=3)];
  }
  default:return [flag('unsupported','Supported practice goal',false)];
 }
}
