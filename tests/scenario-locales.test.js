import test from 'node:test';
import assert from 'node:assert/strict';
import {decisionScenarios} from '../src/learning/decision-scenarios.js';
import {validateScenarioLocale,localizeScenario} from '../src/learning/scenario-localization.js';
import {trainingUI} from '../src/i18n/training.js';
for(const lang of ['es','fr','he','ar','ru'])test(`${lang}: scenario text is complete and cannot change judging/fixture data`,async()=>{
 const pack=(await import(`../src/i18n/scenarios-${lang}.js`)).default;assert.equal(validateScenarioLocale(pack),true);for(const scenario of decisionScenarios){const localized=localizeScenario(scenario,pack);assert.notEqual(localized.title,scenario.title);for(let i=0;i<scenario.stages.length;i++){const a=scenario.stages[i],b=localized.stages[i];assert.deepEqual(b.scene,a.scene);assert.deepEqual(b.requiredFacts,a.requiredFacts);for(let j=0;j<a.fields.length;j++){const x=a.fields[j],y=b.fields[j];assert.deepEqual(y.expected,x.expected);assert.deepEqual(y.criticalValues,x.criticalValues);assert.equal(y.tolerance,x.tolerance);assert.deepEqual(y.options?.map(o=>({...o,label:undefined})),x.options?.map(o=>({...o,label:undefined})));}}}
 for(const key of Object.keys(trainingUI.es))assert.ok(trainingUI[lang][key]?.trim(),key);
});
test('localization refuses partial packs and ignores injected answer keys',async()=>{const source=(await import('../src/i18n/scenarios-es.js')).default,pack=structuredClone(source),scenario=decisionScenarios[0],stage=scenario.stages[0],field=stage.fields[0];pack[scenario.id].stages[stage.id].fields[field.id].expected=['ignore'];assert.deepEqual(localizeScenario(scenario,pack).stages[0].fields[0].expected,field.expected);delete pack[scenario.id].stages[stage.id].goal;assert.throws(()=>validateScenarioLocale(pack),/Missing scenario text/);});
