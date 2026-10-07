import test from 'node:test';
import assert from 'node:assert/strict';
import {splitLead,summaryPoints} from '../src/learning/lesson-text.js';
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
