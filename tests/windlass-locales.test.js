import test from 'node:test';
import assert from 'node:assert/strict';
import {WINDLASS_UI_KEYS,windlassUI} from '../src/i18n/windlass.js';

test('powered windlass copy is complete and preserves placeholders in all six languages',()=>{
 assert.deepEqual(Object.keys(windlassUI).sort(),['ar','en','es','fr','he','ru']);
 assert.equal(new Set(WINDLASS_UI_KEYS).size,WINDLASS_UI_KEYS.length);assert.ok(Object.isFrozen(WINDLASS_UI_KEYS));
 const placeholders=value=>[...value.matchAll(/\{\w+\}/g)].map(match=>match[0]).sort();
 for(const [language,dictionary] of Object.entries(windlassUI)){
  assert.ok(Object.isFrozen(dictionary));assert.deepEqual(Object.keys(dictionary),WINDLASS_UI_KEYS);
  for(const key of WINDLASS_UI_KEYS){
   const value=dictionary[key];assert.equal(typeof value,'string',`${language}: ${key}`);assert.ok(value.trim(),`${language}: ${key}`);
   assert.doesNotMatch(value,/<\/?[a-z][^>]*>/i,`${language}: display copy must be text`);assert.deepEqual(placeholders(value),placeholders(key),`${language}: ${key}`);
   if(language==='en')assert.equal(value,key);else assert.notEqual(value,key,`${language}: untranslated ${key}`);
  }
 }
});

test('operation states, actual versus target length, and historic assessment notice stay distinct',()=>{
 const operations=['Lowering anchor','Retrieving anchor','Retrieval blocked · unload rode','Windlass stopped','Windlass paused'];
 const commands=['Run to target','Stop windlass','Resume windlass'];
 const notices=['Choose a positive rode target.','Resume simulation to operate the windlass.','The anchor remains deployed until retrieval is complete.','Earlier criteria · timed windlass operation was not assessed'];
 for(const [language,dictionary] of Object.entries(windlassUI)){
  for(const group of [operations,commands,['Rode target','Rode paid out'],notices]){
   for(const key of group)assert.ok(dictionary[key],`${language}: ${key}`);
   assert.equal(new Set(group.map(key=>dictionary[key])).size,group.length,language);
  }
  assert.deepEqual([...dictionary['At least {rode} m paid out'].matchAll(/\{\w+\}/g)].map(match=>match[0]),['{rode}']);
 }
 for(const value of Object.values(windlassUI.he))assert.match(value,/[\u0590-\u05ff]/u);
 for(const value of Object.values(windlassUI.ar))assert.match(value,/[\u0600-\u06ff]/u);
});
