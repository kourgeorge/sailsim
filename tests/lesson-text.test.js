import test from 'node:test';
import assert from 'node:assert/strict';
import {splitLead,summaryPoints,withLessonNumbers,bodyBlocks} from '../src/learning/lesson-text.js';
import {lessons} from '../src/learning/curriculum.js';

test('the first sentence of a concept page becomes its headline',()=>{
 assert.deepEqual(splitLead('Heading is the direction the bow points, measured from north. Speed is in knots.'),{lead:'Heading is the direction the bow points, measured from north.',rest:'Speed is in knots.'});
 assert.deepEqual(splitLead('A halyard raises a sail. A sheet adjusts its angle. A reef reduces area.'),{lead:'A halyard raises a sail. A sheet adjusts its angle.',rest:'A reef reduces area.'});
 assert.equal(splitLead('Use a cleat, e.g. a horn cleat, to hold the line under load for now. Then ease it.').lead,'Use a cleat, e.g. a horn cleat, to hold the line under load for now.');
 assert.equal(splitLead('كيف يبحر القارب عكس اتجاه الريح بزاوية معينة؟ الهواء يتدفق حول الشراع المنحني ويصنع قوة.').lead,'كيف يبحر القارب عكس اتجاه الريح بزاوية معينة؟');
 assert.equal(splitLead(`${'x'.repeat(230)}. Rest.`).lead,'');
});

test('the lesson summary skips opening questions and covers every lesson',()=>{
 const points=summaryPoints({concepts:['How can a boat sail toward the wind? Air flowing around the sail makes a force. More text.','Pointing higher is not always better. More.']});
 assert.deepEqual(points,['Air flowing around the sail makes a force.','Pointing higher is not always better.']);
 for(const lesson of lessons)assert.ok(summaryPoints(lesson).length>0,`${lesson.id} has a summary`);
});

test('a short first sentence stays the headline when the next one is long',()=>{
 assert.equal(splitLead(`Pointing higher is not always better. ${'y'.repeat(220)}.`).lead,'Pointing higher is not always better.');
});

test('lesson cross-references show the referenced lesson’s current number',()=>{
 assert.equal(withLessonNumbers('See Lesson {lesson:sail-17}.',id=>id==='sail-17'?19:undefined),'See Lesson 19.');
 assert.equal(withLessonNumbers('Unknown {lesson:sail-99}',()=>undefined),'Unknown {lesson:sail-99}');
});

test('every cross-reference in the course points at a real lesson',()=>{
 for(const l of lessons)for(const text of l.concepts)for(const [,id] of text.matchAll(/\{lesson:([\w-]+)\}/g))assert.ok(lessons.some(x=>x.id===id),`${l.id} -> ${id}`);
});

test('page bodies turn "• " lines into lists, and a list never joins the headline',()=>{
 const text='Distress can be seen or heard.\n• A red hand flare\n• Orange smoke\nUse them only in real distress.';
 assert.equal(splitLead(text).lead,'Distress can be seen or heard.');
 assert.deepEqual(bodyBlocks(splitLead(text).rest),[{type:'list',items:['A red hand flare','Orange smoke']},{type:'text',text:'Use them only in real distress.'}]);
 assert.equal(splitLead('Signals you can see:\n• A flare. Another sentence.').lead,'Signals you can see:');
 assert.deepEqual(bodyBlocks('Plain text only.'),[{type:'text',text:'Plain text only.'}]);
});
