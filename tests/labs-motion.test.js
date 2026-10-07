import test from 'node:test';
import assert from 'node:assert/strict';
import {tackGybeLab,createTackSim,stepTackSim,tackDone,tackModel} from '../src/learning/labs/tack-gybe.js';
import {rudderLab,createRudderSim,stepRudderSim,rudderDone,rudderModel} from '../src/learning/labs/rudder.js';
import {initialState,step,noGoFactor} from '../src/physics.js';
import {labText,LAB_LANGS} from '../src/i18n/labs.js';

function runTack(settings){
  const sim=createTackSim(settings),statuses=new Set(),models=[];
  while(!tackDone(sim)){stepTackSim(sim,.1);const m=tackModel(settings,sim);statuses.add(m.status);models.push({m,flow:sim.s.mainFlow,noGo:noGoFactor(sim.s.waterWindAngle)});}
  return {sim,statuses,models,final:tackModel(settings,sim)};
}
function runRudder(settings,seconds=6,helmAfter){
  const sim=createRudderSim(settings);let live={...settings};
  for(let i=0;i<seconds*10;i++){if(helmAfter&&i===helmAfter.at*10)live={...live,helm:helmAfter.helm};stepRudderSim(sim,.1,live);}
  return rudderModel(live,sim);
}
// The kit runs task checks with a shared context object that lives as long as the mounted lab.
const checkAll=(lab,models)=>{const ctx={initial:lab.def.initial,events:new Set(['changed']),history:()=>[]};const passed=new Set();for(const [m,s] of models)for(const [key,task] of Object.entries(lab.def.tasks))if(task.check(m,s,ctx))passed.add(key);return passed;};

test('Lab 3: a slow tack ends in irons, a steady tack completes, a gybe stays full',()=>{
  const slow=runTack({maneuver:'tack',rate:'slow',sheetIn:false});
  assert.ok(slow.final.irons);assert.equal(slow.final.status,'irons');assert.ok(!slow.final.completed);
  assert.ok(slow.final.speed<2);
  const steady=runTack({maneuver:'tack',rate:'normal',sheetIn:false});
  assert.ok(steady.final.completed);assert.equal(steady.final.status,'tackDone');assert.ok(steady.statuses.has('noGo'));
  assert.match(tackGybeLab.readout({rate:'sharp'}),/Close hauled/);
  const free=runTack({maneuver:'gybe',rate:'normal',sheetIn:false}),sheeted=runTack({maneuver:'gybe',rate:'normal',sheetIn:true});
  assert.ok(free.final.completed&&sheeted.final.completed);
  assert.ok(free.statuses.has('boomCross'));assert.ok(sheeted.statuses.has('boomShort'));
  assert.ok(sheeted.final.swing*4<free.final.swing,'pulling the sheet in shortens the swing');
});

test('Lab 3 agrees with the simulator: no drive in the no-go zone, full sails through a gybe',()=>{
  const tack=runTack({maneuver:'tack',rate:'normal',sheetIn:false});
  for(const {m,flow,noGo} of tack.models)if(noGo<.1)assert.equal(flow,'Luffing',`t=${m.time}`);
  const gybe=runTack({maneuver:'gybe',rate:'normal',sheetIn:false});
  assert.ok(gybe.models.every(({flow})=>flow==='Drawing'));
  // The lab's boat is the simulator's boat: the same helm on a fresh state gives the same heading.
  const sim=createTackSim({maneuver:'tack',rate:'normal',sheetIn:false}),twin=structuredClone(sim.s);
  for(let i=0;i<50;i++){stepTackSim(sim,.1);twin.rudder=sim.s.rudder;step(twin,.1);twin.mainSheet=twin.trim=twin.suggestedMainSheet;twin.jibSheet=twin.suggestedJibSheet;}
  assert.ok(Math.abs(sim.s.heading-twin.heading)<1e-6);assert.ok(Math.abs(sim.s.speed-twin.speed)<1e-6);
});

test('Lab 5: flow, momentum and reversed steering astern',()=>{
  const still=runRudder({speed:0,helm:20,tiller:false}),slow=runRudder({speed:1,helm:20,tiller:false}),fast=runRudder({speed:4,helm:20,tiller:false});
  assert.equal(still.status,'noFlow');assert.ok(Math.abs(still.turnRate)<.05);
  assert.ok(fast.turnRate>slow.turnRate*2.5&&slow.turnRate>0,'more speed, more grip');
  assert.equal(fast.status,'turningStarboard');
  const astern=runRudder({speed:-1.5,helm:20,tiller:false});
  assert.equal(astern.status,'astern');assert.ok(astern.turnRate<0,'starboard helm astern swings the bow to port');
  const coast=runRudder({speed:4,helm:20,tiller:false},5.5,{at:5,helm:0});
  assert.equal(coast.status,'coasting');assert.ok(coast.turnRate>1);
  assert.match(rudderLab.readout({speed:0,helm:20}),/Little flow/);
});

test('Lab 5 agrees with the simulator: same speed and helm give the same turn as step()',()=>{
  const sim=createRudderSim({speed:3});
  const s=initialState();s.worldBodies=[];Object.assign(s,{x:0,z:100,heading:0,windSpeed:0,currentSpeed:0,mainHoist:0,jibHoist:0,speed:3,leeway:0});
  for(let i=0;i<60;i++){stepRudderSim(sim,.1,{helm:15});s.rudder=15;s.throttle=sim.s.throttle;step(s,.1);}
  assert.ok(Math.abs(sim.s.heading-s.heading)<1e-6);assert.ok(Math.abs(sim.s.yawRate-s.yawRate)<1e-9);
});

test('every motion-lab task can be reached',()=>{
  const tackModels=[];
  for(const settings of [{maneuver:'tack',rate:'normal',sheetIn:false},{maneuver:'tack',rate:'slow',sheetIn:false},{maneuver:'gybe',rate:'normal',sheetIn:false},{maneuver:'gybe',rate:'normal',sheetIn:true}])
    tackModels.push([runTack(settings).final,settings]);
  assert.deepEqual([...checkAll(tackGybeLab,tackModels)].sort(),tackGybeLab.taskKeys().sort());
  const rudderModels=[[runRudder({speed:0,helm:20}),{}],[runRudder({speed:1,helm:20}),{}],[runRudder({speed:4,helm:20}),{}],[runRudder({speed:-1.5,helm:20},6),{}],[runRudder({speed:4,helm:20},5.5,{at:5,helm:0}),{}]];
  assert.deepEqual([...checkAll(rudderLab,rudderModels)].sort(),rudderLab.taskKeys().sort());
});

test('motion labs render static fallbacks in six languages and run fast',()=>{
  for(const lab of [tackGybeLab,rudderLab])for(const lang of LAB_LANGS){
    const svg=lab.staticFigure(lang),t=labText(lang);
    assert.match(svg,/^<svg/);assert.match(svg,new RegExp(`lang="${lang}"`));assert.match(svg,/<desc id="[^"]+">[^<]{20,}<\/desc>/);
    assert.doesNotMatch(svg,/undefined|NaN/,`${lab.id}/${lang}`);
    assert.ok(lab.caption(lang).length>40);for(const key of lab.taskKeys())assert.ok(t(lab.def.tasks[key].label).length>5);
    for(const control of lab.def.controls){assert.ok(t(control.label));for(const option of control.options||[])assert.ok(t(option.label));}
  }
  for(const status of ['tackStart','braking','noGo','irons','tackDone','gybeStart','boomCross','boomShort','gybeDone'])for(const lang of LAB_LANGS)assert.ok(labText(lang)(`tack-gybe.${status}`,{swing:90}).length>10);
  for(const status of ['noFlow','astern','coasting','turningPort','turningStarboard','straight'])for(const lang of LAB_LANGS)assert.ok(labText(lang)(`rudder.${status}`,{rate:1}).length>10);
  let start=performance.now();runTack({maneuver:'tack',rate:'slow',sheetIn:false});assert.ok(performance.now()-start<1000,'full tack run');
  start=performance.now();const sim=createRudderSim({speed:4});while(!rudderDone(sim))stepRudderSim(sim,.1,{helm:10});assert.ok(performance.now()-start<1000,'full rudder run');
});
