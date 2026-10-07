import test from 'node:test';
import assert from 'node:assert/strict';
import {labStrings,labRowSets,LAB_LANGS} from '../src/i18n/labs.js';
import {rows as leadingRows,aspectRows,flashRows} from '../src/i18n/labs/lights-leading.js';
import {initialState,refreshDerived,step,groundVelocity,KNOT} from '../src/physics.js';
import {currentTrackLab,currentTrackModel} from '../src/learning/labs/current-track.js';
import {collisionBearingLab,createEncounter,stepEncounter,collisionBearingModel} from '../src/learning/labs/collision-bearing.js';
import {lightsAspectLab,leadingLineLab,lightsFlashLab,visibleLights,lightsAspectModel,leadingLineModel,lightsFlashModel,lightOn} from '../src/learning/labs/lights-leading.js';

// The two extra Lab 10 row sets may not be registered in src/i18n/labs.js yet.
for(const [lab,rows] of [['lights-aspect',aspectRows],['lights-flash',flashRows],['lights-leading',leadingRows]])
  if(!labRowSets[lab])LAB_LANGS.forEach((code,i)=>rows.forEach(row=>{labStrings[code][`${lab}.${row[0]}`]=row[i+1];}));
const labs=[currentTrackLab,collisionBearingLab,lightsAspectLab,leadingLineLab,lightsFlashLab];
const placeholders=value=>[...value.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort().join(',');

test('navigation lab strings: six languages, matching placeholders',()=>{
  for(const rows of [leadingRows,aspectRows,flashRows,labRowSets['current-track'],labRowSets['collision-bearing']]){
    assert.ok(rows.length>5);
    for(const row of rows){assert.equal(row.length,7,row[0]);for(const v of row.slice(2))assert.equal(placeholders(v),placeholders(row[1]),row[0]);}
  }
});

test('navigation labs render static fallbacks in all six languages',()=>{
  for(const lab of labs){
    assert.ok(lab.def.controls.length<=2,`${lab.id}: at most two controls`);
    for(const lang of LAB_LANGS){
      const svg=lab.staticFigure(lang);
      assert.match(svg,/^<svg/);assert.match(svg,new RegExp(`lang="${lang}"`));assert.match(svg,/<desc[^>]*>[^<]{20,}<\/desc>/);
      assert.doesNotMatch(svg,/undefined|NaN/,`${lab.id}/${lang}`);
      assert.ok(lab.readout({},lang).length>10);assert.ok(lab.caption(lang).length>40);
      for(const key of lab.taskKeys())assert.doesNotThrow(()=>labStrings[lang][lab.def.tasks[key].label]);
    }
  }
});

test('Lab 7: current changes the track; aiming up-current reaches the mark',()=>{
  const plain=currentTrackModel(currentTrackLab.settingsFor({currentSpeed:0}));
  assert.equal(plain.status,'reach');assert.equal(Math.round(plain.course),90);
  const cross=currentTrackModel(currentTrackLab.settingsFor({}));
  assert.equal(cross.status,'miss');assert.ok(cross.course<80);
  assert.match(currentTrackLab.readout({}),/Bow points .*090°.*, boat goes .*073°.*Aim up-current/);
  const aimed=currentTrackModel(currentTrackLab.settingsFor({heading:107}));
  assert.equal(aimed.status,'reachCrab');assert.ok(Math.abs(aimed.course-90)<1.5);
  // Lesson 39: 5 kn through the water, 1 kn against, 12 nm: 3 hours; with it, 2 h.
  assert.ok(Math.abs(currentTrackModel(currentTrackLab.settingsFor({currentSpeed:1,currentDirection:270,markDistance:12})).hours-3)<1e-9);
  assert.ok(Math.abs(currentTrackModel(currentTrackLab.settingsFor({currentSpeed:1,currentDirection:90,markDistance:12})).hours-2)<1e-9);
  assert.equal(currentTrackModel(currentTrackLab.settingsFor({heading:270})).status,'away');
});

test('Lab 7 agrees with groundVelocity() and step() under engine with sails down',()=>{
  for(const [heading,currentDirection,currentSpeed] of [[90,0,1.5],[107,0,1.5],[45,200,2],[300,90,.5]]){
    const s=initialState();Object.assign(s,{heading,speed:5,leeway:0,yawRate:0,rudder:0,currentSpeed,currentDirection,mainHoist:0,jibHoist:0,sails:0,throttle:0});
    refreshDerived(s);
    const m=currentTrackModel({heading,waterSpeed:5,currentSpeed,currentDirection,markDistance:3});
    assert.ok(Math.abs(s.speedOverGround-m.sog)<1e-6,`${heading}: sog`);
    assert.ok(Math.abs(((s.courseOverGround-m.course+540)%360)-180)<1e-6,`${heading}: course`);
    const x=s.x,z=s.z;step(s,.5);
    const moved=Math.atan2(s.x-x,-(s.z-z))*180/Math.PI;
    assert.ok(Math.abs(((moved-m.course+540)%360)-180)<1.5,`${heading}: stepped track ${moved} vs ${m.course}`);
  }
});

test('Lab 9: steady bearing on a collision course; a big early turn changes it',()=>{
  const s=collisionBearingLab.settingsFor({});
  let sim=createEncounter(s),bearings=[];
  for(let i=0;i<300;i++){stepEncounter(sim,2,s);if(i%30===0)bearings.push(collisionBearingModel(s,sim).bearing);}
  for(const b of bearings)assert.ok(Math.abs(b-bearings[0])<1e-6,'bearing constant');
  assert.equal(collisionBearingModel(s,sim).status,'risk');
  assert.equal(collisionBearingLab.readout({}).length>10,true);
  while(!sim.collided&&sim.t<1200)stepEncounter(sim,2,s);
  assert.equal(collisionBearingModel(s,sim).status,'collision');
  const turned={...s};sim=createEncounter(turned);
  for(let i=0;i<45;i++)stepEncounter(sim,2,turned);
  turned.ownCourse=60;
  for(let i=0;i<60;i++)stepEncounter(sim,2,turned);
  let m=collisionBearingModel(turned,sim);
  assert.equal(m.status,'changing');assert.ok(m.bigTurnEarly);assert.ok(Math.abs(m.drift)>3);
  while(sim.t<1200)stepEncounter(sim,2,turned);
  m=collisionBearingModel(turned,sim);
  assert.equal(m.status,'clear');assert.ok(m.minRange>=.4);
  for(const key of collisionBearingLab.taskKeys())assert.ok(collisionBearingLab.def.tasks[key].check(m.status==='clear'&&key!=='clear'?{...m,status:key==='spot'?'risk':'changing'}:m,turned,{events:new Set(['played'])}),key);
});

test('Lab 10: light sectors follow Rule 21',()=>{
  assert.deepEqual(visibleLights(0),{green:true,red:true,stern:false,masthead:false});
  assert.deepEqual(visibleLights(112.5,'power'),{green:true,red:false,stern:true,masthead:true});
  assert.deepEqual(visibleLights(113,'power'),{green:false,red:false,stern:true,masthead:false});
  assert.deepEqual(visibleLights(247.5),{green:false,red:true,stern:true,masthead:false});
  assert.deepEqual(visibleLights(250),{green:false,red:true,stern:false,masthead:false});
  assert.deepEqual(visibleLights(180),{green:false,red:false,stern:true,masthead:false});
  let sternArc=0,mastArc=0;for(let a=0;a<360;a+=.5){const l=visibleLights(a,'power');if(l.stern&&!l.green&&!l.red)sternArc+=.5;if(l.masthead)mastArc+=.5;}
  assert.ok(Math.abs(sternArc-134)<=1.5);assert.ok(Math.abs(mastArc-225.5)<=1);
  assert.equal(lightsAspectModel({aspect:90,vessel:'sailing'}).status,'green');
  assert.equal(lightsAspectModel({aspect:270,vessel:'sailing'}).status,'red');
  assert.equal(lightsAspectModel({aspect:180,vessel:'sailing'}).status,'stern');
  assert.match(lightsAspectLab.readout({}),/red and green/);
  assert.match(lightsAspectLab.readout({aspect:60,vessel:'power'}),/masthead/);
});

test('Lab 10: leading line and light characters',()=>{
  assert.equal(leadingLineModel({offset:40,distance:600}).status,'rearRight');
  assert.equal(leadingLineModel({offset:-40,distance:600}).status,'rearLeft');
  assert.equal(leadingLineModel({offset:0,distance:600}).status,'onLine');
  assert.ok(leadingLineModel({offset:20,distance:300}).split>leadingLineModel({offset:20,distance:1200}).split);
  for(const d of [200,600,1500]){const m=leadingLineModel({offset:0,distance:d});assert.ok(m.rearUp>m.frontUp,'rear light appears higher');}
  assert.equal(leadingLineLab.readout({}),'Rear light to the right: you are right of the line, move left.');
  assert.equal(lightOn('fl6',0),true);assert.equal(lightOn('fl6',3),false);assert.equal(lightOn('fl6',6.1),true);
  assert.equal(lightOn('fl2',1.8),true);assert.equal(lightOn('fl2',1.2),false);
  assert.equal(lightOn('iso4',1.9),true);assert.equal(lightOn('iso4',2.1),false);
  assert.equal(lightOn('oc5',4.5),false);assert.equal(lightOn('oc5',2),true);
  const sim=lightsFlashLab.def.loop.create({character:'fl6'});
  while(sim.t<12.01)lightsFlashLab.def.loop.step(sim,.05,{character:'fl6'});
  const m=lightsFlashModel({character:'fl6'},sim);assert.ok(lightsFlashLab.def.tasks.twoCycles.check(m));
  assert.match(lightsFlashLab.readout({}),/^Light on\. One white flash every 6 seconds/);
});

test('every navigation lab task is reachable',()=>{
  const reach=(lab,settings,key,sim)=>assert.ok(lab.def.tasks[key].check(lab.def.compute(lab.settingsFor(settings),sim),lab.settingsFor(settings),{initial:lab.settingsFor({}),events:new Set(['changed:distance'])}),`${lab.id}.${key}`);
  reach(currentTrackLab,{heading:107},'cross');reach(currentTrackLab,{currentDirection:270},'against');reach(currentTrackLab,{currentDirection:90},'behind');reach(currentTrackLab,{},'rightAngle');
  reach(lightsAspectLab,{aspect:180},'sternOnly');reach(lightsAspectLab,{aspect:0},'headOn');reach(lightsAspectLab,{aspect:300},'redOnly');reach(lightsAspectLab,{aspect:60,vessel:'power'},'power');
  reach(leadingLineLab,{offset:0},'onLine');reach(leadingLineLab,{offset:-20},'left');reach(leadingLineLab,{offset:30,distance:300},'closer');
  const fl2={t:10.1,watched:{}};reach(lightsFlashLab,{character:'fl2'},'group',fl2);reach(lightsFlashLab,{character:'oc5'},'isoOc',{t:5.1,watched:{}});
});
