import test from 'node:test';
import assert from 'node:assert/strict';
import {heelReefLab,heelReefModel,HEEL_LAB_ANGLE} from '../src/learning/labs/heel-reef.js';
import {apparentWindLab,apparentWindModel} from '../src/learning/labs/apparent-wind.js';
import {anchorScopeLab,anchorScopeModel} from '../src/learning/labs/anchor-scope.js';
import {initialState,step,apparentWind,suggestedSheet} from '../src/physics.js';
import {anchorSnapshot} from '../src/anchor.js';
import {labText,LAB_LANGS} from '../src/i18n/labs.js';

const labs=[heelReefLab,apparentWindLab,anchorScopeLab];

test('steady labs render accessible static figures and readouts in six languages',()=>{
  for(const lab of labs)for(const lang of LAB_LANGS){
    const svg=lab.staticFigure(lang);
    assert.match(svg,/^<svg/);assert.match(svg,new RegExp(`lang="${lang}"`));
    assert.doesNotMatch(svg,/undefined|NaN/,`${lab.id}/${lang}`);
    assert.ok(lab.readout({},lang).length>15);assert.ok(lab.caption(lang).length>40);
    for(const key of lab.taskKeys())assert.ok(labText(lang)(lab.def.tasks[key].label).length>5);
  }
});

test('Lab 4: push grows with the square of wind speed; a reef lowers the heel',()=>{
  const ten=heelReefModel({windSpeed:10,reef:0}),twenty=heelReefModel({windSpeed:20,reef:0});
  assert.ok(Math.abs(twenty.pressure/ten.pressure-4)<1e-9);
  assert.equal(twenty.ratio,4);
  assert.match(heelReefLab.readout({windSpeed:20}),/4⁩ times as hard/);
  assert.equal(twenty.status,'reefNow');
  for(const wind of [8,15,20,25])assert.ok(heelReefModel({windSpeed:wind,reef:1}).heel<heelReefModel({windSpeed:wind,reef:0}).heel);
  assert.ok(heelReefModel({windSpeed:20,reef:2}).heel<heelReefModel({windSpeed:20,reef:1}).heel);
  assert.equal(heelReefModel({windSpeed:8,reef:0}).status,'easy');
});

test('Lab 4 heel agrees with the simulator settling on the same course and trim',()=>{
  for(const [windSpeed,reef] of [[10,0],[15,0],[20,0],[20,1],[25,2]]){
    const s=initialState(),sheet=suggestedSheet(HEEL_LAB_ANGLE);
    Object.assign(s,{heading:0,windDirection:HEEL_LAB_ANGLE,windSpeed,currentSpeed:0,mainSheet:sheet,trim:sheet,jibSheet:sheet,reefLevel:reef,reef:reef>0});
    for(let i=0;i<300;i++){s.speed=0;s.leeway=0;s.yawRate=0;s.heading=0;step(s,.1);}
    const lab=heelReefModel({windSpeed,reef});
    assert.ok(Math.abs(Math.abs(s.heel)-lab.heel)<1,`${windSpeed} kn reef ${reef}: sim ${s.heel} lab ${lab.heel}`);
  }
});

test('Lab 6: the triangle matches apparentWind()',()=>{
  for(const boatSpeed of [0,3,6,12,30])for(const trueAngle of [0,45,90,135,180]){
    const m=apparentWindModel({boatSpeed,trueAngle,trueSpeed:12});
    const aw=apparentWind({windDirection:trueAngle,windSpeed:12,heading:0,speed:boatSpeed,leeway:0,currentSpeed:0});
    assert.ok(Math.abs(m.speed-aw.speed)<1e-9);assert.ok(Math.abs(m.angle-Math.abs(aw.angle))<1e-9);
  }
  // Worked example from Lesson 17: 30 knots north, 20-knot wind abeam → about 36.1 knots, 34° off the bow.
  const ex=apparentWindModel({boatSpeed:30,trueAngle:90,trueSpeed:20});
  assert.ok(Math.abs(ex.speed-36.06)<.01);assert.equal(Math.round(ex.angle),34);
  assert.equal(apparentWindModel({boatSpeed:6,trueAngle:90,trueSpeed:12}).status,'forwardStronger');
  assert.equal(apparentWindModel({boatSpeed:6,trueAngle:150,trueSpeed:12}).status,'forwardWeaker');
  assert.equal(apparentWindModel({boatSpeed:0,trueAngle:90,trueSpeed:12}).status,'still');
  assert.match(apparentWindLab.readout({}),/further forward/);
});

test('Lab 8: scope and swing radius match anchorSnapshot()',()=>{
  for(const [depth,rode] of [[5,12],[5,19],[5,30],[10,40],[20,80],[3,2]]){
    const s=initialState();
    Object.assign(s,{anchor:true,anchorRode:rode,anchorPaidRode:rode,anchorWinchRunning:false,_anchor:{x:s.x,z:s.z,depth,onBottom:true,point:{x:s.x,y:-depth,z:s.z}}});
    const snap=anchorSnapshot(s),m=anchorScopeModel({depth,rode});
    assert.ok(Math.abs(snap.scope-m.scope)<1e-9,`${depth}/${rode} scope`);
    assert.ok(Math.abs(snap.swingRadius-m.radius)<1e-9,`${depth}/${rode} radius`);
    assert.equal(snap.reachesBottom,m.status!=='upDown');
    if(m.status!=='upDown')assert.equal(snap.shortScope,m.status==='steep');
  }
  assert.match(anchorScopeLab.readout({depth:5,rode:30}),/Pull is flat/);
  assert.match(anchorScopeLab.readout({depth:5,rode:12}),/Pull is steep/);
  assert.equal(anchorScopeModel({depth:5,rode:19}).status,'flat');
  assert.equal(anchorScopeModel({depth:5,rode:18}).status,'steep');
});

test('every steady-lab task can be reached',()=>{
  const reach=(lab,sequence,key)=>{
    const ctx={initial:lab.settingsFor(),events:new Set(['changed:x'])};
    let ok=false;
    for(const overrides of sequence){
      const settings=lab.settingsFor(overrides);for(const k of Object.keys(overrides))ctx.events.add(`changed:${k}`);
      ok=lab.def.tasks[key].check(lab.def.compute(settings),settings,ctx)||ok;
    }
    assert.ok(ok,`${lab.id}.${key}`);
  };
  reach(heelReefLab,[{windSpeed:10},{windSpeed:20}],'double');
  reach(heelReefLab,[{windSpeed:20}],'reefPoint');
  reach(heelReefLab,[{windSpeed:20},{windSpeed:20,reef:1}],'compare');
  reach(apparentWindLab,[{boatSpeed:9}],'speedUp');
  reach(apparentWindLab,[{trueAngle:150}],'bearAway');
  reach(apparentWindLab,[{boatSpeed:20,trueAngle:110}],'faster');
  reach(anchorScopeLab,[{rode:19}],'shortest5');
  reach(anchorScopeLab,[{depth:10,rode:40}],'deeper');
  reach(anchorScopeLab,[{rode:40}],'swing');
  reach(anchorScopeLab,[{rode:4}],'breakout');
});
