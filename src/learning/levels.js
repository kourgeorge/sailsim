// A lesson's level comes from its module, so a lesson added later can sit wherever
// its topic fits. Level ranges follow the lessons' course order.
export const COURSE_LEVELS=[
 {id:'basic',title:'Basic',description:'Crew safety, wind, steering, and sail trim.',modules:['aboard','wind','trim','maneuvers']},
 {id:'intermediate',title:'Intermediate',description:'Maneuvers, navigation, harbor planning, and emergencies.',modules:['conditions','navigation','seamanship','harbor','marina','readiness']},
 {id:'advanced',title:'Advanced',description:'Coastal decisions, tides, weather, and passage planning.',modules:null},
];
export function levelFor(lesson){return COURSE_LEVELS.find(level=>level.modules?.includes(lesson?.module))??COURSE_LEVELS[2];}
export function levelRange(level,lessons){
 const numbers=lessons.filter(l=>levelFor(l)===level).map(l=>l.number??lessons.indexOf(l)+1),pad=n=>String(n).padStart(2,'0');
 return numbers.length?`${pad(Math.min(...numbers))}–${pad(Math.max(...numbers))}`:'';
}
