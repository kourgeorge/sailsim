import test from 'node:test';
import assert from 'node:assert/strict';
import {decisionScenarios} from '../src/learning/decision-scenarios.js';
import {beginDecision,setDecisionValue,inspectDecision,decisionReport} from '../src/learning/decision-engine.js';
import {decisionFormGuidance,decisionNumberMinimum,decisionDraftErrors,decisionRequirementStatus,submitDecisionForm} from '../src/learning/decision-form.js';
import {decisionGuidanceUI,DECISION_GUIDANCE_KEYS} from '../src/i18n/decision-guidance.js';

const scenario=decisionScenarios.find(s=>s.lessonId==='sail-17');
function prepare(attempt){const stage=scenario.stages[attempt.index];for(const fact of stage.requiredFacts)inspectDecision(attempt,scenario,fact);for(const field of stage.fields)setDecisionValue(attempt,scenario,field.id,field.expected);}
test('negative and nonfinite wind drafts never enter scoring or create submission evidence',()=>{
 for(const value of [-10,-.01,Infinity,-Infinity,NaN,'NaN','1e309','',null,true,[],{}]){
  const attempt=beginDecision(scenario);prepare(attempt);setDecisionValue(attempt,scenario,'apparentSpeed',value);
  const result=submitDecisionForm(attempt,scenario);
  assert.equal(result.kind,'invalid',String(value));assert.deepEqual(result.fields,['apparentSpeed']);
  assert.match(result.errors[0].key,/zero or a positive number/);
  assert.equal(attempt.mistakes,0);assert.equal(attempt.submissions,0);assert.equal(attempt.index,0);assert.deepEqual(attempt.events,[]);
  assert.deepEqual(decisionReport(attempt,scenario).penalties,[]);
 }
});
test('valid wrong answers retain the five-point cost; corrected answers use unchanged authored outcomes',()=>{
 const original=structuredClone(scenario),attempt=beginDecision(scenario);prepare(attempt);
 setDecisionValue(attempt,scenario,'apparentSpeed',-10);assert.equal(submitDecisionForm(attempt,scenario).kind,'invalid');
 setDecisionValue(attempt,scenario,'apparentSpeed',12);assert.equal(submitDecisionForm(attempt,scenario).kind,'revision');
 assert.equal(attempt.mistakes,1);assert.equal(attempt.submissions,1);
 setDecisionValue(attempt,scenario,'apparentSpeed',10);assert.equal(submitDecisionForm(attempt,scenario).kind,'complete');
 while(attempt.status==='active'){prepare(attempt);assert.equal(submitDecisionForm(attempt,scenario).kind,'complete');}
 const report=decisionReport(attempt,scenario);assert.equal(report.score,95);assert.equal(report.status,'passed');
 assert.equal(report.penalties[0].points,5);assert.equal(report.objectives[0].attempts,2);assert.equal(report.events.length,4);
 assert.deepEqual(scenario,original,'Guidance and form validation do not mutate answer keys');
});
test('zero is a valid magnitude; missing observations and out-of-bounds bearings remain free to correct',()=>{
 const attempt=beginDecision(scenario);prepare(attempt);setDecisionValue(attempt,scenario,'apparentSpeed',0);
 assert.equal(submitDecisionForm(attempt,scenario).kind,'revision','Zero is wrong for this authored case, but is valid input');
 const unread=beginDecision(scenario);for(const field of scenario.stages[0].fields)setDecisionValue(unread,scenario,field.id,field.expected);
 assert.equal(submitDecisionForm(unread,scenario).kind,'incomplete');assert.equal(unread.mistakes,0);
 const bearing={fields:[{id:'bearing',type:'number',min:0,max:360}]};
 assert.equal(decisionDraftErrors(bearing,{bearing:361})[0].key,'Enter a number no greater than {max}.');
 assert.equal(decisionDraftErrors(bearing,{bearing:-1})[0].key,'Enter a number of at least {min}.');
 assert.deepEqual(decisionDraftErrors({fields:[{id:'margin',type:'number'}]},{margin:-2}),[],'Signed margins are not misclassified as wind magnitudes');
});
test('wind instructions name the exact action for each stage without revealing answers',()=>{
 const instructions=scenario.stages.map(stage=>decisionFormGuidance(stage));
 for(const [index,guidance] of instructions.entries()){
  assert.equal(guidance.submitLabel,'Check answer');assert.match(guidance.instruction,/zero or a positive number/);assert.match(guidance.instruction,/press Check answer/);
  assert.ok(!guidance.instruction.includes(String(scenario.stages[index].fields[0].expected)));
  assert.equal(decisionNumberMinimum(scenario.stages[index].fields[0]),0);
 }
 assert.match(instructions[0].instruction,/where the wind comes from/);
 assert.match(instructions[1].instruction,/relative to the bow/);
 assert.match(instructions[2].instruction,/wind reference used for sail trim/);
 for(const type of ['route','order','checks'])assert.equal(decisionFormGuidance({fields:[{id:'action',type}]}).submitLabel,'Commit actions');
 assert.equal(decisionFormGuidance({fields:[{id:'depth',type:'number'}]}).submitLabel,'Check answer');
});
test('correct answers still require explicitly opened observations and identify each missing report',()=>{
 const attempt=beginDecision(scenario),stage=scenario.stages[0];
 for(const field of stage.fields)setDecisionValue(attempt,scenario,field.id,field.expected);
 assert.equal(submitDecisionForm(attempt,scenario).kind,'incomplete');
 const requirements=decisionRequirementStatus(stage,attempt);
 assert.equal(requirements.total,1);assert.equal(requirements.read,0);
 assert.deepEqual(requirements.unread.map(f=>f.label),['Observation A']);assert.deepEqual(requirements.missing,[]);
 assert.deepEqual(attempt.inspected,[],'Reading status/guidance cannot silently inspect a report');
 assert.equal(attempt.mistakes,0);assert.equal(attempt.submissions,0);
 inspectDecision(attempt,scenario,'case');
 assert.equal(decisionRequirementStatus(stage,attempt).read,1);assert.equal(submitDecisionForm(attempt,scenario).kind,'complete');
 const many={requiredFacts:['weather','crew'],facts:[{id:'weather',label:'Weather report'},{id:'crew',label:'Crew report'}],fields:[{id:'answer',label:'Your plan'}]};
 const status=decisionRequirementStatus(many,{inspected:[],message:{fields:['answer']}});
 assert.deepEqual(status.unread.map(f=>f.label),['Weather report','Crew report']);assert.deepEqual(status.missing.map(f=>f.label),['Your plan']);
});
test('all six locales cover every instruction and retain validation placeholders',()=>{
 assert.deepEqual(Object.keys(decisionGuidanceUI),['en','es','fr','ru','he','ar']);
 for(const [lang,copy] of Object.entries(decisionGuidanceUI))for(const key of DECISION_GUIDANCE_KEYS){
  assert.ok(copy[key]?.trim(),`${lang}: ${key}`);if(lang!=='en')assert.notEqual(copy[key],key);
  assert.deepEqual([...copy[key].matchAll(/\{\w+\}/g)].map(m=>m[0]).sort(),[...key.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort());
 }
 for(const lang of Object.keys(decisionGuidanceUI))for(const stage of scenario.stages){
  const copy=decisionGuidanceUI[lang],guidance=decisionFormGuidance(stage);
  assert.ok(copy[guidance.instruction].includes(copy['Check answer']),`${lang}: instructional button name matches the actual button`);
 }
});
