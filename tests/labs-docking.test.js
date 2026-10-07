import test from 'node:test';
import assert from 'node:assert/strict';
import {createDockingSim,stepDockingSim,dockingModel,dockingLab,dockingDone} from '../src/learning/labs/docking.js';
import {initialState,step,angleDifference} from '../src/physics.js';

const run=(settings,seconds,sim=createDockingSim(settings))=>{for(let t=0;t<seconds-1e-9;t+=.1)stepDockingSim(sim,.1,settings);return sim;};
const ctx=frames=>({history:()=>frames,initial:{},events:new Set(['changed'])});

test('Lab 11: reverse from rest shows prop walk swinging the stern to port',()=>{
  const settings={engine:'astern',helm:0,speed:0},sim=run(settings,7),m=dockingModel(settings,sim);
  assert.equal(m.status,'walk');
  assert.ok(m.walked>=5,`bow turned to starboard by ${m.walked}°`);
  assert.ok(m.stern.x<0||angleDifference(m.heading,90)>0,'stern moved toward port');
  assert.ok(dockingLab.def.tasks.walk.check(m,settings,ctx([])));
  assert.match(dockingLab.readout({engine:'astern'}),/prop walk/);
});

test('Lab 11: the stern swings out in a turn, and a burst astern stops the boat',()=>{
  const turning={engine:'ahead',helm:25,speed:1},m=dockingModel(turning,run(turning,6));
  assert.equal(m.status,'swing');assert.ok(dockingLab.def.tasks.swing.check(m,turning,ctx([])));
  const settings={engine:'neutral',helm:0,speed:1.5},sim=createDockingSim(settings),frames=[];
  const go=(s,seconds)=>{for(let t=0;t<seconds;t+=.1){stepDockingSim(sim,.1,s);frames.push(dockingModel(s,sim));}};
  go({...settings,engine:'astern'},1);
  while(sim.s.speed>.05&&sim.time<40)go({...settings,engine:'astern'},.1);
  go(settings,.2);
  const end=dockingModel(settings,sim);
  assert.ok(Math.abs(end.speed)<.15,`stopped at ${end.speed} kn`);
  assert.ok(dockingLab.def.tasks.stop.check(end,settings,ctx(frames)));
});

test('Lab 11 runs the same boat as the full simulator',()=>{
  const settings={engine:'astern',helm:10,speed:0,wind:'offDock'},sim=run(settings,8);
  const s=initialState();s.worldBodies=[];
  Object.assign(s,{x:0,z:0,heading:90,hullWindage:true,windSpeed:15,windDirection:0,currentSpeed:0,mainHoist:0,jibHoist:0,speed:0,leeway:0,rudder:10,yawRate:0,throttle:-.6});
  for(let i=0;i<80;i++)step(s,.1);
  assert.ok(Math.abs(angleDifference(s.heading,sim.s.heading))<1e-9);assert.ok(Math.abs(s.speed-sim.s.speed)<1e-9);
  assert.ok(!dockingDone(createDockingSim({})));
});

test('Lab 11 renders its still drawing in all six languages',()=>{
  for(const lang of ['en','es','ar','he','ru','fr']){
    const svg=dockingLab.staticFigure(lang,{engine:'astern'});
    assert.match(svg,/^<svg/);assert.doesNotMatch(svg,/NaN|undefined/);
  }
});

test('Lab 11: wind across the berth blows the bow off; the simulator itself runs without hull wind',()=>{
  for(const [wind,sign] of [['offDock',1],['onDock',-1]]){
    const settings={engine:'neutral',helm:0,speed:0,wind},m=dockingModel(settings,run(settings,15));
    assert.equal(m.status,'blowOff');
    assert.ok(sign*m.turned>=10,`${wind}: bow swings downwind (${m.turned}°)`);
    assert.ok(sign*m.z>1,`${wind}: boat drifts downwind (${m.z} m)`);
    assert.ok(dockingLab.def.tasks.blowOff.check(m,settings,ctx([])));
  }
  const calm=dockingModel({engine:'neutral',helm:0,speed:0,wind:'none'},run({engine:'neutral',helm:0,speed:0,wind:'none'},15));
  assert.ok(Math.abs(calm.turned)<1e-9);
  assert.ok(!initialState().hullWindage,'course exercises stay tuned without hull wind');
});
