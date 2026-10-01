import {writeFile,readFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {initialState,step,apparentWind,suggestedSheet,refreshDerived,KNOT,VESSEL,clamp} from '../src/physics.js';
import {applyControlPatch} from '../src/vessel-controls.js';

// This diagnostic measures the running engine. It does not calibrate or alter it.
// Steering is neutral and controls update on a simulation-time1s schedule.
const WINDS=[6,10,14,18],ANGLES=[45,60,75,90,110,135,150,170];
const TRIM_ANGLES=[130,132,135,138,140,142,144,146,148,150,155,160,165,170,175,180];
const mean=(items,key)=>items.reduce((sum,item)=>sum+item[key],0)/items.length;
const span=(items,key)=>Math.max(...items.map(item=>item[key]))-Math.min(...items.map(item=>item[key]));
const rounding=value=>Number.isFinite(value)?+value.toFixed(8):value;
function observe(state){
 const aw=apparentWind(state),u=state.speed*KNOT;
 return {speedKn:state.speed,totalWaterSpeedKn:Math.hypot(u,state.leeway)/KNOT,
  leewayMS:state.leeway,leewayDeg:Math.atan2(state.leeway,u)*180/Math.PI,heelDeg:state.heel,
  apparentWindKn:aw.speed,apparentWindAngleDeg:aw.angle,mainSheetDeg:state.mainSheet,jibSheetDeg:state.jibSheet,
  mainEfficiency:state.mainEfficiency,jibEfficiency:state.jibEfficiency,vmgKn:state.vmg};
}
function trim(state){
 const aw=apparentWind(state),sheet=suggestedSheet(aw.angle);
 applyControlPatch(state,{mainSheet:sheet,jibSheet:sheet,traveler:0,outhaul:clamp(state.windSpeed/25,0,1),vang:clamp(Math.abs(aw.angle)/140,.2,.85)});
}
export function measurePolarPoint({windKn,twaDeg,tack=1,dt=.1,initialSpeedKn=0,maxSeconds=600}){
 const state=Object.assign(initialState(),{x:30000,z:30000,heading:(tack*twaDeg+360)%360,windDirection:0,windSpeed:windKn,currentSpeed:0,currentDirection:0,speed:initialSpeedKn,worldBodies:[],rudder:0,throttle:0,anchor:false,mainHoist:1,jibHoist:1,reefLevel:0});
 const samples=[];trim(state);refreshDerived(state);
 let elapsed=0,nextSample=1,settled=false;
 while(elapsed<maxSeconds-1e-9){
  const chunk=Math.min(dt,nextSample-elapsed,maxSeconds-elapsed);step(state,chunk);elapsed+=chunk;
  if(elapsed>=nextSample-1e-8){
   refreshDerived(state);samples.push({time:nextSample,...observe(state)});trim(state);nextSample++;
   const window=samples.slice(-60);
   if(elapsed>=180&&span(window,'speedKn')<.002&&span(window,'leewayMS')<.001&&span(window,'heelDeg')<.02){settled=true;break;}
  }
 }
 refreshDerived(state);
 const terminal=samples.slice(-60),summary=Object.fromEntries(Object.keys(observe(state)).map(key=>[key,rounding(mean(terminal,key))]));
 // Infer sail drive from an actual small engine step, using the current source's
 // documented resistance law. This is diagnostic accounting, not measured drag.
 const probe=structuredClone(state),probeDt=.001;step(probe,probeDt);
 const accelerationMS2=(probe.speed-state.speed)*KNOT/probeDt,lateralAccelerationMS2=(probe.leeway-state.leeway)/probeDt;
 const u=state.speed*KNOT,hullSpeedKn=1.34*Math.sqrt(VESSEL.waterline/.3048),hullSpeedMS=hullSpeedKn*KNOT;
 const linearN=58*u,quadraticN=38*u*Math.abs(u),waveN=Math.sign(u)*180*(Math.abs(u)/hullSpeedMS)**6;
 return {windKn,twaDeg,tack,dt,initialSpeedKn,seconds:rounding(elapsed),settled,
  ...summary,terminalSpan:{speedKn:rounding(span(terminal,'speedKn')),leewayMS:rounding(span(terminal,'leewayMS')),heelDeg:rounding(span(terminal,'heelDeg'))},
  forceAccounting:{accelerationMS2:rounding(accelerationMS2),lateralAccelerationMS2:rounding(lateralAccelerationMS2),linearDragN:rounding(linearN),quadraticDragN:rounding(quadraticN),waveDragN:rounding(waveN),inferredDriveN:rounding(VESSEL.mass*accelerationMS2+linearN+quadraticN+waveN),inferredSideForceN:rounding(VESSEL.mass*lateralAccelerationMS2+(900+1700*Math.abs(u))*state.leeway)},
  safety:{grounded:state.grounded,collisionCount:state.collisionCount,headingDriftDeg:rounding(state.heading-(tack*twaDeg+360)%360)},samples:terminal};
}

export function measureTrimSweep(){
 return TRIM_ANGLES.map(twaDeg=>measurePolarPoint({windKn:14,twaDeg,tack:1}));
}

async function main(){
 const args=process.argv.slice(2);
 if(args.some(arg=>arg!=='--trim-sweep'))throw new Error('Usage: node scripts/physics-polar-baseline.mjs [--trim-sweep]');
 const source=await readFile(new URL('../src/physics.js',import.meta.url),'utf8');
 if(args.includes('--trim-sweep')){
  const rows=measureTrimSweep();
  const recommendedTrim=Array.from({length:91},(_,i)=>({apparentWindAngleDeg:90+i,suggestedSheetDeg:suggestedSheet(90+i)}));
  const transitions=recommendedTrim.slice(1).map((row,i)=>({...row,previousSheetDeg:recommendedTrim[i].suggestedSheetDeg,changeDeg:row.suggestedSheetDeg-recommendedTrim[i].suggestedSheetDeg}));
  const data={schemaVersion:1,generatedAt:new Date().toISOString(),command:'node scripts/physics-polar-baseline.mjs --trim-sweep',
   physicsSourceSha256:createHash('sha256').update(source).digest('hex'),gitHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),vessel:VESSEL,
   method:{windKn:14,trueWindAnglesDeg:TRIM_ANGLES,tack:1,dt:.1,maxSeconds:600,minSeconds:180,terminalWindowSeconds:60,controls:'Full main/jib; suggested-sheet scan updated each simulation second; no current, engine, reef, or contacts; neutral helm. Trim maximizes instantaneous empirical forward drive, not global VMG.',recommendedTrim:'Exact production suggestedSheet at every integer apparent wind angle from 90 to 180 degrees.'},
   note:'Diagnostic of the current empirical model, not an externally calibrated sailing polar.',rows,recommendedTrim};
  const output=new URL('../artifacts/physics-trim-transition.json',import.meta.url);
  await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(output,JSON.stringify(data,null,2)+'\n');
  console.log(JSON.stringify({output:fileURLToPath(output),points:rows.length,settled:rows.filter(row=>row.settled).length,largestSuggestedTrimStep:transitions.reduce((a,b)=>Math.abs(a.changeDeg)>Math.abs(b.changeDeg)?a:b),rows:rows.map(({twaDeg,speedKn,apparentWindAngleDeg,mainSheetDeg,heelDeg,leewayDeg})=>({twaDeg,speedKn,apparentWindAngleDeg,mainSheetDeg,heelDeg,leewayDeg}))},null,2));
  return;
 }
 const rows=[];
 for(const windKn of WINDS)for(const twaDeg of ANGLES)for(const tack of [-1,1])rows.push(measurePolarPoint({windKn,twaDeg,tack}));
 const sensitivity=[];
 for(const windKn of WINDS)for(const twaDeg of [45,90,170]){
  const baseline=rows.find(row=>row.windKn===windKn&&row.twaDeg===twaDeg&&row.tack===1);
  for(const variant of [{label:'fine-frame',dt:.01},{label:'warm-start',initialSpeedKn:8}]){
   const result=measurePolarPoint({windKn,twaDeg,tack:1,...variant});
   sensitivity.push({variant:variant.label,windKn,twaDeg,delta:{speedKn:rounding(result.speedKn-baseline.speedKn),leewayDeg:rounding(result.leewayDeg-baseline.leewayDeg),heelDeg:rounding(result.heelDeg-baseline.heelDeg)},result});
  }
 }
 const symmetry=[];
 for(const windKn of WINDS)for(const twaDeg of ANGLES){
  const a=rows.find(row=>row.windKn===windKn&&row.twaDeg===twaDeg&&row.tack===-1),b=rows.find(row=>row.windKn===windKn&&row.twaDeg===twaDeg&&row.tack===1);
  symmetry.push({windKn,twaDeg,speedDifferenceKn:rounding(a.speedKn-b.speedKn),leewaySumMS:rounding(a.leewayMS+b.leewayMS),heelSumDeg:rounding(a.heelDeg+b.heelDeg)});
 }
 const data={schemaVersion:1,generatedAt:new Date().toISOString(),gitHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),physicsSourceSha256:createHash('sha256').update(source).digest('hex'),vessel:VESSEL,
  method:{trueWindKn:WINDS,trueWindAnglesDeg:ANGLES,tacks:[-1,1],dt:.1,maxSeconds:600,minSeconds:180,terminalWindowSeconds:60,settlingLimits:{speedSpanKn:.002,leewaySpanMS:.001,heelSpanDeg:.02},controls:'Full main and jib; no reef; no current; no engine; neutral helm; suggested-sheet1degree scan and optimum vang/outhaul updated each1s; no contacts; far offshore. Suggested-sheet policy is not an independent global VMG optimizer.',forceAccounting:'Finite-difference acceleration through actual step; resistance coefficients reconstructed from this source revision. No external polar/reference calibration.'},rows,sensitivity,symmetry};
 const output=new URL('../artifacts/physics-polar-baseline.json',import.meta.url);await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(output,JSON.stringify(data,null,2)+'\n');
 console.log(JSON.stringify({output:fileURLToPath(output),points:rows.length,settled:rows.filter(row=>row.settled).length,maxFrameSpeedDeltaKn:Math.max(...sensitivity.filter(row=>row.variant==='fine-frame').map(row=>Math.abs(row.delta.speedKn))),maxWarmStartSpeedDeltaKn:Math.max(...sensitivity.filter(row=>row.variant==='warm-start').map(row=>Math.abs(row.delta.speedKn))),maxTackSpeedDifferenceKn:Math.max(...symmetry.map(row=>Math.abs(row.speedDifferenceKn))),speedTable:WINDS.map(windKn=>({windKn,speeds:ANGLES.map(twaDeg=>rows.find(row=>row.windKn===windKn&&row.twaDeg===twaDeg&&row.tack===1).speedKn)}))},null,2));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
