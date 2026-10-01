import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {lessons,modules} from '../src/learning/curriculum.js';
import {validateCourseLocale} from '../src/i18n/validation.js';
import {extraUI} from '../src/i18n/supplemental.js';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const english=read('public/locales/en.json'),ui=read('src/i18n/en-ui.json');
const languages=['en','es','ar','he','ru','fr'];
const placeholders=text=>[...text.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort();
function strings(v){return typeof v==='string'?[v]:Array.isArray(v)?v.flatMap(strings):Object.values(v||{}).flatMap(strings);}
for(const code of languages){
 test(`${code}: full course, modules, quizzes, and practice text are present`,()=>{const pack=read(`public/locales/${code}.json`);assert.equal(validateCourseLocale(pack,lessons,modules),true);assert.deepEqual(Object.keys(pack.lessons).sort(),Object.keys(english.lessons).sort());assert.deepEqual(Object.keys(pack.modules).sort(),Object.keys(english.modules).sort());assert.equal(strings(pack).length,strings(english).length);if(code!=='en'){const source=strings(english),translated=strings(pack);const copied=source.filter((s,i)=>s.length>65&&s===translated[i]);assert.deepEqual(copied,[],'No copied English paragraphs');}});
 test(`${code}: interface keys and variable placeholders stay complete`,()=>{const pack=read(`src/i18n/${code}-ui.json`);assert.deepEqual(Object.keys(pack).sort(),Object.keys(ui).sort());for(const key of Object.keys(ui)){assert.equal(typeof pack[key],'string');assert.ok(pack[key].trim(),key);assert.deepEqual(placeholders(pack[key]),placeholders(key),key);}});
}
test('missing translation of a practice hint or reordered answer length is rejected',()=>{const clone=structuredClone(english);delete clone.lessons['sail-08'].practice.steps[0].hint;assert.throws(()=>validateCourseLocale(clone,lessons,modules));const bad=structuredClone(english);bad.lessons['sail-01'].quiz[0].options.pop();assert.throws(()=>validateCourseLocale(bad,lessons,modules));});
test('supplemental status, accessibility, and fallback strings preserve language coverage',()=>{
 for(const code of languages){assert.deepEqual(Object.keys(extraUI[code]).sort(),Object.keys(extraUI.en).sort());for(const [key,value] of Object.entries(extraUI[code])){assert.equal(typeof value,'string',`${code}: ${key}`);assert.ok(value.trim());assert.deepEqual(placeholders(value),placeholders(key),`${code}: ${key}`);}}
});
test('localized payload cannot replace the numerical assessment specification',()=>{for(const code of languages){const pack=read(`public/locales/${code}.json`);for(const l of lessons){const translated=pack.lessons[l.id];assert.equal('prerequisite' in translated,false);for(const q of translated.quiz)assert.equal('correct' in q,false);for(const s of translated.practice?.steps||[]){for(const key of ['kind','value','duration'])assert.equal(key in s,false,`${code}/${l.id}/${key}`);}}}});
