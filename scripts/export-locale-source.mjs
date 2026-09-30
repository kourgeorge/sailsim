import {lessons,modules} from '../src/learning/curriculum.js';
import {writeFile} from 'node:fs/promises';
const content={modules:Object.fromEntries(modules.map(m=>[m.id,{title:m.title,outcome:m.outcome}])),lessons:Object.fromEntries(lessons.map(l=>[l.id,{title:l.title,concepts:l.concepts,observe:l.observe,mistake:l.mistake,quiz:l.quiz.map(q=>({prompt:q.prompt,options:q.options,explanation:q.explanation})),transfer:l.transfer,...(l.practice?{practice:{steps:l.practice.steps.map(s=>({label:s.label,...(s.hint?{hint:s.hint}:{})})),debrief:l.practice.debrief}}:{})}]))};
await writeFile('public/locales/en.json',JSON.stringify(content,null,2)+'\n');
