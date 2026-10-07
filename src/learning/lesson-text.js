// Shapes existing (already translated) lesson text for the reader, so the layout
// gains headlines and a summary without adding new strings to translate.
const ABBREVIATIONS=new Set(['e.g','i.e','etc','vs','approx','no','st','fig','p.ej','p. ej','ср','т.е','т.д','т.п','ок','см','env','ex']);
const MAX_LEAD=200,MIN_LEAD=40;

function sentenceEnd(text,from=0){
 const pattern=/[.!?؟。]["”»’)]?(?=\s+\S)/g;pattern.lastIndex=from;
 for(let m;(m=pattern.exec(text));){
  const before=text.slice(0,m.index).match(/(\S+)$/)?.[1]?.toLowerCase()||'';
  if(m[0][0]==='.'&&(ABBREVIATIONS.has(before.replace(/^[(“"«]/,''))||/^[a-zа-я]$/.test(before)))continue;
  return m.index+m[0].length;
 }
 return -1;
}
const isQuestion=s=>/[?؟]["”»’)]?$/.test(s);

// The first sentence becomes the page headline (two when the first is very short);
// a long one stays in the body.
export function splitLead(text){
 const value=String(text).trim();let end=sentenceEnd(value);
 if(end>0&&end<MIN_LEAD){const next=sentenceEnd(value,end),joined=next<0?value.length:next;if(joined<=MAX_LEAD)end=next;}
 const lead=end<0?value:value.slice(0,end).trim(),rest=end<0?'':value.slice(end).trim();
 return lead.length>MAX_LEAD?{lead:'',rest:value}:{lead,rest};
}

// One point per concept page: its first statement (an opening question is skipped).
export function summaryPoints(lesson){
 return lesson.concepts.map(text=>{
  const value=String(text).trim();let start=0;
  for(let i=0;i<3;i++){
   const end=sentenceEnd(value,start),sentence=(end<0?value.slice(start):value.slice(start,end)).trim();
   if(!isQuestion(sentence))return sentence.length>MAX_LEAD?'':sentence;
   if(end<0)return '';
   start=end;
  }
  return '';
 }).filter(Boolean);
}
