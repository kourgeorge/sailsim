export const COURSE_LEVELS=[
 {id:'basic',title:'Basic',range:'01–16',description:'Crew safety, wind, steering, and sail trim.'},
 {id:'intermediate',title:'Intermediate',range:'17–36',description:'Maneuvers, navigation, harbor planning, and emergencies.'},
 {id:'advanced',title:'Advanced',range:'37–42',description:'Coastal decisions, tides, weather, and passage planning.'},
];
export function levelFor(lesson){const n=Number(lesson?.id?.split('-')[1]||1);return COURSE_LEVELS[n<=16?0:n<=36?1:2];}
