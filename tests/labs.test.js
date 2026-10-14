import test from 'node:test';
import assert from 'node:assert/strict';
import {LABS,getLab,renderLabFigure,labCaption,labSpec} from '../src/learning/labs/index.js';
import {lessonLabs,quizLabs} from '../src/learning/lesson-labs.js';
import {lessons} from '../src/learning/curriculum.js';
import {labRowSets,labText,LAB_LANGS} from '../src/i18n/labs.js';
import {initialState,refreshDerived,pointOfSail} from '../src/physics.js';
import {sailForceModel} from '../src/learning/labs/sail-force.js';
import {compassWindModel} from '../src/learning/labs/compass-wind.js';

const placeholders=value=>[...value.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort().join(',');

test('every lab string has all six languages with the same placeholders',()=>{
  for(const [lab,rows] of Object.entries(labRowSets)){
    const keys=new Set();
    for(const row of rows){
      assert.equal(row.length,LAB_LANGS.length+1,`${lab}.${row[0]}: six languages`);
      assert.ok(!keys.has(row[0]),`${lab}.${row[0]}: duplicate key`);keys.add(row[0]);
      for(const value of row)assert.ok(typeof value==='string'&&value.trim(),`${lab}.${row[0]}: empty translation`);
      for(const value of row.slice(2))assert.equal(placeholders(value),placeholders(row[1]),`${lab}.${row[0]}: placeholders`);
    }
  }
});

test('lesson pages only name labs, pages and tasks that exist',()=>{
  const check=(lessonId,index,value,count)=>{
    const spec=labSpec(value),lab=getLab(spec);
    assert.ok(lab,`${lessonId}/${index}: lab ${spec.id} exists`);
    assert.ok(Number(index)<count,`${lessonId}/${index}: page exists`);
    for(const task of spec.tasks||[])assert.ok(lab.taskKeys().includes(task),`${lessonId}: task ${task}`);
    assert.ok((spec.tasks||lab.taskKeys()).length<=3,`${lessonId}/${index}: at most three tasks per page`);
    for(const key of Object.keys(spec.initial||{}))assert.ok(key in lab.def.initial,`${lessonId}: initial ${key}`);
  };
  for(const [id,pages] of Object.entries(lessonLabs)){
    const lesson=lessons.find(l=>l.id===id);assert.ok(lesson,id);
    for(const [index,value] of Object.entries(pages)){check(id,index,value,lesson.concepts.length);assert.equal(lesson.conceptLabs[index],value);}
  }
  for(const [id,questions] of Object.entries(quizLabs)){
    const lesson=lessons.find(l=>l.id===id);
    for(const [index,value] of Object.entries(questions)){check(id,index,value,lesson.quiz.length);assert.equal(lesson.quiz[index].lab,value);}
  }
});

test('every lab renders an accessible static fallback in all six languages',()=>{
  for(const lab of Object.values(LABS)){
    assert.ok(lab.def.controls.length<=2||lab.def.loop,`${lab.id}: at most two controls`);
    for(const lang of LAB_LANGS){
      const svg=renderLabFigure(lab.id,lang),caption=labCaption(lab.id,lang);
      assert.match(svg,/^<svg/);assert.match(svg,/role="img"/);assert.match(svg,new RegExp(`lang="${lang}"`));
      assert.match(svg,/<title id="[^"]+">[^<]+<\/title><desc id="[^"]+">[^<]{20,}<\/desc>/);
      assert.doesNotMatch(svg,/undefined|NaN|<script|javascript:/i,`${lab.id}/${lang}`);
      assert.ok(caption.length>40,`${lab.id}/${lang}: caption`);
      for(const key of lab.taskKeys())assert.ok(labText(lang)(lab.def.tasks[key].label).length>5);
      assert.ok(lab.readout({},lang).length>10,`${lab.id}/${lang}: readout`);
      if(lang!=='en')assert.notEqual(caption,labCaption(lab.id,'en'),`${lab.id}/${lang}: caption translated`);
    }
  }
});

test('Lab 1: luffing, stalling, the no-go zone and best drive',()=>{
  assert.equal(sailForceModel({windAngle:90,sheet:90}).status,'luffing');
  assert.equal(sailForceModel({windAngle:90,sheet:20}).status,'stalled');
  assert.equal(sailForceModel({windAngle:90,sheet:72}).status,'working');
  assert.equal(sailForceModel({windAngle:150,sheet:80}).status,'parachute');
  for(let angle=0;angle<=38;angle+=2)for(const sheet of [0,20,45,90]){
    const m=sailForceModel({windAngle:angle,sheet});assert.equal(m.drive,0);assert.equal(m.status,'nogo');
  }
  // Close hauled the push is mostly sideways; on a reach mostly forward.
  const upwind=sailForceModel({windAngle:45,sheet:30}),reach=sailForceModel({windAngle:90,sheet:72});
  assert.ok(upwind.side>upwind.drive);assert.ok(reach.drive>reach.side);
  assert.match(LABS['sail-force'].readout({windAngle:90,sheet:90}),/Luffing/);
  assert.match(LABS['sail-force'].readout({windAngle:20,sheet:10}),/no-go/);
});

test('Lab 1 agrees with the full simulator sail model',()=>{
  const flow={luffing:'Luffing',nogo:'Luffing',stalled:'Stalled',working:'Drawing',parachute:'Drawing'};
  for(const windAngle of [20,40,45,60,90,120,150,170])for(const sheet of [0,15,30,45,60,75,90]){
    const s=initialState();Object.assign(s,{heading:0,windDirection:windAngle,windSpeed:12,currentSpeed:0,speed:0,leeway:0,mainSheet:sheet,trim:sheet,traveler:0});
    refreshDerived(s);
    const m=sailForceModel({windAngle,sheet});
    assert.equal(flow[m.status],s.mainFlow,`${windAngle}°/${sheet}°`);
    assert.ok(Math.abs(Math.min(1,m.efficiency)*m.noGo-s.mainEfficiency)<1e-9,`${windAngle}°/${sheet}°: efficiency`);
  }
});

test('Lab 2: point of sail and tack, and agreement with the simulator',()=>{
  const m=compassWindModel({heading:45,windFrom:315});
  assert.equal(m.status,'beam');assert.equal(m.tack,'port');
  assert.equal(compassWindModel({heading:45,windFrom:135}).tack,'starboard');
  assert.equal(compassWindModel({heading:0,windFrom:10}).status,'irons');
  assert.equal(compassWindModel({heading:0,windFrom:10}).tack,null);
  assert.equal(LABS['compass-wind'].readout({}),'Heading ⁦045°⁩, wind from ⁦315°⁩: beam reach on port tack.');
  const names={irons:'In irons',closeHauled:'Close hauled',closeReach:'Close reach',beam:'Beam reach',broad:'Broad reach',running:'Running'};
  for(let heading=0;heading<360;heading+=25)for(let windFrom=0;windFrom<360;windFrom+=35){
    const s=initialState();Object.assign(s,{heading,windDirection:windFrom,currentSpeed:0,speed:0,leeway:0});refreshDerived(s);
    assert.equal(names[compassWindModel({heading,windFrom}).status],pointOfSail(s.waterWindAngle),`${heading}/${windFrom}`);
  }
});

test('Lab 13: time the entry for a lull, face a set with power, never side-on',async()=>{
  const {createSurfSim,stepSurfSim,surfDone,surfModel}=await import('../src/learning/labs/surf-entry.js');
  const run=plan=>{const sim=createSurfSim();while(!surfDone(sim))stepSurfSim(sim,.1,plan(sim));return sim;};
  const waitThen=(go,settings)=>sim=>sim.time<go?{engine:'neutral',heading:'in'}:settings;
  // Right after the last wave of the first set passes, full power reaches the harbor before the next set.
  assert.equal(run(waitThen(37,{engine:'full',heading:'in'})).result,'inside');
  // The same timing at slow speed is caught from behind; so is going straight in, or drifting.
  assert.equal(run(waitThen(37,{engine:'slow',heading:'in'})).result,'broached');
  assert.equal(run(()=>({engine:'full',heading:'in'})).result,'broached');
  assert.equal(run(sim=>sim.time<37?{engine:'neutral',heading:'in'}:sim.time<60?{engine:'full',heading:'in'}:{engine:'full',heading:'side'}).result,'rolled');
  // Caught by a set: turning the bow to it with the engine on survives every wave, then the boat gets in.
  let facing=false;
  const faced=run(sim=>{if(sim.time<55)return {engine:'neutral',heading:'in'};if(surfModel({engine:'full',heading:'in'},sim).status==='setComing')facing=true;if(facing&&sim.faced>=4)facing=false;return facing?{engine:'slow',heading:'out'}:{engine:'full',heading:'in'};});
  assert.equal(faced.result,'inside');assert.equal(faced.faced,4);
  facing=false;
  assert.equal(run(sim=>{if(sim.time<55)return {engine:'neutral',heading:'in'};if(surfModel({engine:'full',heading:'in'},sim).status==='setComing')facing=true;return facing?{engine:'neutral',heading:'out'}:{engine:'full',heading:'in'};}).result,'swung');
});

test('Lab 14: every who-keeps-clear card has an answer and text in every language',async()=>{
  const {CARDS,ANSWERS,nightWayModel,nightWayLab}=await import('../src/learning/labs/night-way.js');
  const {LAB_LANGS}=await import('../src/i18n/labs.js');
  assert.equal(new Set(CARDS.map(c=>c.id)).size,CARDS.length);
  for(const [i,card] of CARDS.entries()){
    assert.ok(ANSWERS.includes(card.answer),card.id);
    assert.ok(Boolean(card.lights)!==Boolean(card.shapes),`${card.id}: night lights or day shapes`);
    assert.equal(nightWayModel({card:i+1,answer:null}).status,'ask');
    assert.equal(nightWayModel({card:i+1,answer:card.answer}).status,'right');
    for(const other of ANSWERS.filter(a=>a!==card.answer))assert.equal(nightWayModel({card:i+1,answer:other}).status,'wrong');
    for(const lang of LAB_LANGS)for(const answer of [null,card.answer])assert.ok(nightWayLab.readout({card:i+1,answer},lang).length>20,`${lang}/${card.id}`);
  }
  // Under engine you keep clear of sail; not under command yourself, others keep clear; two special statuses both act.
  const answer=id=>CARDS.find(c=>c.id===id).answer;
  assert.equal(answer('motorSail'),'you');assert.equal(answer('nucOwn'),'other');assert.equal(answer('nucRam'),'both');
  assert.equal(answer('crossRed'),'you');assert.equal(answer('crossGreen'),'other');assert.equal(answer('headOn'),'both');
  // A new card clears the previous answer.
  assert.deepEqual(nightWayLab.def.controls.find(c=>c.key==='card').resets,['answer']);
});
