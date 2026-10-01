export function validateCourseLocale(payload,lessons,modules){
 if(!payload||typeof payload!=='object'||!payload.lessons||!payload.modules)throw new Error('Invalid language pack');
 const text=(v,label)=>{if(typeof v!=='string'||!v.trim())throw new Error('Missing translation: '+label);};
 const list=(v,original,label)=>{if(!Array.isArray(v)||v.length!==original.length)throw new Error('Translation shape: '+label);v.forEach((s,i)=>text(s,`${label}.${i}`));};
 for(const m of modules){const tr=payload.modules[m.id];if(!tr)throw new Error('Missing module '+m.id);text(tr.title,m.id);text(tr.outcome,m.id);}
 for(const l of lessons){const tr=payload.lessons[l.id];if(!tr)throw new Error('Missing lesson '+l.id);for(const key of ['title','mistake','transfer'])text(tr[key],l.id+'.'+key);for(const key of ['concepts','observe'])list(tr[key],l[key],l.id+'.'+key);
  if(!Array.isArray(tr.quiz)||tr.quiz.length!==l.quiz.length)throw new Error('Missing quiz '+l.id);tr.quiz.forEach((q,i)=>{text(q.prompt,l.id);text(q.explanation,l.id);list(q.options,l.quiz[i].options,l.id+'.options');});
  if(l.practice){if(!tr.practice||tr.practice.steps?.length!==l.practice.steps.length)throw new Error('Missing practice '+l.id);text(tr.practice.debrief,l.id);tr.practice.steps.forEach((s,i)=>{text(s.label,l.id);if(l.practice.steps[i].hint)text(s.hint,l.id+'.hint');});}
 }
 return true;
}
