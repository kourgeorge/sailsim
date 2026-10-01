import test from 'node:test';
import assert from 'node:assert/strict';
import {decisionScenarios} from '../src/learning/decision-scenarios.js';
import {renderScenarioScene} from '../src/learning/scenario-visual.js';

test('all authored scenario fixtures render safely in six languages without answer keys',()=>{
 for(const scenario of decisionScenarios)for(const stage of scenario.stages)for(const lang of ['en','es','fr','ru','he','ar']){
  const {svg}=renderScenarioScene({scenarioId:scenario.id,family:scenario.family,stageId:stage.id,scene:stage.scene,facts:stage.facts,values:{},lang});
  assert.match(svg,/role="img"/);assert.match(svg,/http:\/\/www\.w3\.org\/2000\/svg/);
  assert.match(svg,/<desc[^>]*>.+<\/desc>/);assert.doesNotMatch(svg,/NaN|undefined|<script|onerror=|javascript:/);
 }
});

test('crew and navigation drafts respond to learner values without grading them',()=>{
 const crew={family:'preparation',scene:{variant:'crew',people:3,readyJackets:2},lang:'en'};
 assert.match(renderScenarioScene(crew).svg,/Fitted lifejackets: 2 \/ 3/);
 assert.match(renderScenarioScene({...crew,values:{prepare:['replace','fit'],sam:'helm'}}).svg,/Fitted lifejackets: 3 \/ 3/);
 const tide={family:'navigation',scene:{variant:'tide',chartDepth:2.4,tideHeight:1.1,draft:1.8},lang:'en'};
 assert.match(renderScenarioScene({...tide,values:{ukc:99}}).svg,/>99 m</,'incorrect predictions are displayed without renderer awarding credit');
 assert.match(renderScenarioScene({family:'preparation',scene:{variant:'boat-plan',rotation:180}}).svg,/rotate\(180\)/);
});

test('chart actions use the exact authored coordinates and field ID',()=>{
 const vm={family:'passage',scene:{variant:'route',routeFieldId:'planRoute',start:{x:90,y:220},waypoints:[{id:'A',x:260,y:370},{id:'B',x:560,y:370}]},values:{planRoute:['A','B']}};
 const result=renderScenarioScene({...vm,scene:{...vm.scene,fieldMap:{route:'planRoute'}}});
 assert.deepEqual(result.waypoints.map(p=>[p.id,p.x,p.y,p.fieldId]),[['A',260,370,'planRoute'],['B',560,370,'planRoute']]);
 assert.match(result.svg,/M90 220L260 370L560 370/);
});

test('untrusted display labels are escaped and arrow definitions remain local',()=>{
 const {svg,waypoints}=renderScenarioScene({family:'passage',scene:{variant:'route',routeFieldId:'route',routes:[{id:'a',label:'<img src=x onerror=alert(1)>',points:[{x:80,y:200},{x:400,y:300}]}],waypoints:[{id:'<bad>',label:'<script>bad</script>',x:80,y:200}]},values:{route:'a'}});
 assert.doesNotMatch(svg,/<img|<script>/);assert.ok(svg.includes('&lt;img'));
 assert.equal(waypoints[0].label,'<script>bad</script>','component escapes button labels at the DOM boundary');
 const ids=new Set([...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 for(const [,id] of svg.matchAll(/marker-end="url\(#([^\)]+)\)"/g)){assert.ok(ids.has(id));assert.match(svg,new RegExp(`<marker id="${id}"[^>]+orient="auto"`));}
});
