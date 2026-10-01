import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../src/learning/curriculum.js';
import {decisionScenarios} from '../src/learning/decision-scenarios.js';
import {beginDecision,inspectDecision,setDecisionValue,submitDecision,decisionReport,tickDecision} from '../src/learning/decision-engine.js';
import {restoreProgress,recordDecisionResult,recordFor} from '../src/learning/engine.js';
const prepare=(attempt,scenario,stage)=>{for(const fact of stage.requiredFacts)inspectDecision(attempt,scenario,fact);for(const field of stage.fields)setDecisionValue(attempt,scenario,field.id,field.expected);};
test('every lesson has exactly one assessed training format; all23 decision scenarios have distinct staged tasks',()=>{
 assert.equal(decisionScenarios.length,23);assert.equal(new Set(decisionScenarios.map(s=>s.id)).size,23);
 for(const lesson of lessons)assert.equal(Number(!!lesson.practice)+Number(!!lesson.decisionScenarioId),1,lesson.id);
 for(const scenario of decisionScenarios){assert.equal(scenario.stages.length,3);assert.equal(new Set(scenario.stages.map(s=>s.id)).size,3);for(const stage of scenario.stages){assert.ok(stage.fields.length);assert.ok(stage.facts.length);assert.ok(stage.goal);for(const id of stage.requiredFacts)assert.ok(stage.facts.some(f=>f.id===id));for(const field of stage.fields){assert.ok(['checks','order','route','number','select'].includes(field.type));if(field.type==='number')assert.ok(Number.isFinite(field.expected));else for(const id of Array.isArray(field.expected)?field.expected:[field.expected])assert.ok(field.options.some(o=>o.id===id),`${scenario.id} ${field.id} ${id}`);}}}
});
for(const scenario of decisionScenarios)test(`${scenario.lessonId}: performed task products earn100, save once, and restore`,()=>{
 const attempt=beginDecision(scenario);for(const stage of scenario.stages){assert.equal(submitDecision(attempt,scenario).kind,'incomplete');tickDecision(attempt,.1);assert.equal(attempt.completed.length,attempt.index);prepare(attempt,scenario,stage);assert.equal(submitDecision(attempt,scenario).kind,'complete',`${stage.id}: ${JSON.stringify(attempt.message)}`);}
 const report=decisionReport(attempt,scenario);assert.equal(report.status,'passed');assert.equal(report.score,100);assert.equal(report.objectives.reduce((s,r)=>s+r.maxPoints,0),100);assert.equal(submitDecision(attempt,scenario).kind,'inactive');
 const progress=restoreProgress(null),lesson=lessons.find(l=>l.id===scenario.lessonId);recordDecisionResult(progress,lesson,report);recordDecisionResult(progress,lesson,report);assert.equal(recordFor(progress,lesson.id).decision,true);assert.equal(recordFor(progress,lesson.id).decisionAttempts,1);const restored=restoreProgress(JSON.stringify(progress));assert.equal(recordFor(restored,lesson.id).lastDecisionResult.score,100);
});
test('every authored critical choice terminates the run and preserves the submitted evidence',()=>{
 let checked=0;for(const scenario of decisionScenarios)for(let index=0;index<scenario.stages.length;index++){const stage=scenario.stages[index];for(const field of stage.fields)for(const value of field.criticalValues||[]){const a=beginDecision(scenario);for(let i=0;i<index;i++){prepare(a,scenario,scenario.stages[i]);submitDecision(a,scenario);}prepare(a,scenario,stage);setDecisionValue(a,scenario,field.id,['checks','order','route'].includes(field.type)?[value]:value);assert.equal(submitDecision(a,scenario).kind,'critical',`${scenario.id}/${stage.id}/${field.id}`);const report=decisionReport(a,scenario);assert.equal(report.status,'failed');assert.ok(report.score<80);assert.deepEqual(report.objectives[index].evidence[field.id],['checks','order','route'].includes(field.type)?[value]:value);assert.ok(report.objectives[index].inspected.length);checked++;}}assert.ok(checked>=20);
});
test('numeric tasks reject empty/coercible values without credit or penalties',()=>{
 const scenario=decisionScenarios.find(s=>s.stages[0].fields.some(f=>f.type==='number')),stage=scenario.stages[0],field=stage.fields.find(f=>f.type==='number');
 for(const value of [true,false,[],[field.expected],{},'   ',Infinity,NaN]){const a=beginDecision(scenario);prepare(a,scenario,stage);setDecisionValue(a,scenario,field.id,value);assert.equal(submitDecision(a,scenario).kind,'incomplete');assert.equal(a.mistakes,0);assert.equal(a.completed.length,0);}
});
test('all six authored compass-bearing fields declare circular comparison and canonical limits',()=>{
 const bearings=decisionScenarios.flatMap(s=>s.stages.flatMap(stage=>stage.fields.filter(f=>f.unit==='°')));
 assert.equal(bearings.length,6);
 for(const field of bearings){assert.equal(field.comparison,'bearing');assert.equal(field.type,'number');assert.equal(field.min,0);assert.equal(field.max,360);assert.equal(field.tolerance,1);assert.ok(field.expected>=0&&field.expected<360);}
});
test('sail-05 accepts 360 degrees for the shifted north wind without a revision deduction',()=>{
 const scenario=decisionScenarios.find(s=>s.lessonId==='sail-05');
 for(const north of [360,359.5]){const a=beginDecision(scenario);for(const stage of scenario.stages){prepare(a,scenario,stage);if(stage.id==='shift')setDecisionValue(a,scenario,'windFrom',north);assert.equal(submitDecision(a,scenario).kind,'complete');}
  assert.equal(decisionReport(a,scenario).score,100);const progress=restoreProgress(null),lesson=lessons.find(l=>l.id===scenario.lessonId);recordDecisionResult(progress,lesson,decisionReport(a,scenario));assert.equal(restoreProgress(JSON.stringify(progress)).records[lesson.id].lastDecisionResult.objectives[2].evidence.windFrom,north);
 }
});
test('authored chart routes require explicit endpoints and the ordered diversion/corridor waypoints',()=>{
 for(const id of ['sail-21','sail-37']){const scenario=decisionScenarios.find(s=>s.lessonId===id),index=scenario.stages.findIndex(s=>s.fields.some(f=>f.type==='route')),stage=scenario.stages[index],field=stage.fields.find(f=>f.type==='route');for(const route of [[field.expected[1]],[field.expected[0],field.expected[2],field.expected.at(-1)],[field.expected[0],field.expected[2],field.expected[1],field.expected.at(-1)],field.expected.slice(1),field.expected.slice(0,-1)]){const a=beginDecision(scenario);for(let i=0;i<index;i++){prepare(a,scenario,scenario.stages[i]);submitDecision(a,scenario);}prepare(a,scenario,stage);setDecisionValue(a,scenario,field.id,route);assert.equal(submitDecision(a,scenario).kind,'revision',`${id}: ${route}`);assert.equal(a.index,index);}}
});
