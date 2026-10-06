// Stable lesson IDs extend the course without changing any existing saved record.
export const marinaModule={id:'marina',title:'Practical marina handling',outcome:'Enter the marina, dock in a berth, and depart using the engine and helm.'};
const q=(prompt,options,correct,explanation)=>({prompt,options,correct,explanation});
const waypoint=(label,x,z,heading,speed,radius=8,hint='')=>({label,kind:'engineWaypoint',value:{x,z,heading,speed,radius,tolerance:20},duration:0,hint});
const stop=(label,x,z,heading,radius=5,hint='')=>({label,kind:'engineStop',value:{x,z,heading,radius,tolerance:10,maxSpeed:.15},duration:5,hint});
const setup=(x,z,heading)=>({locationId:'haven',x,z,heading,speed:0,sails:0,throttle:0,windSpeed:3,currentSpeed:0});
export const marinaLessons=[
 {
  id:'sail-43',title:'Enter the marina under engine',
  concepts:[
   'Start outside Haven marina with both sails lowered. Use ahead thrust and small helm corrections to follow the marked approach into the fairway. The chart and water markers show the current target.',
   'Reach the first marker on 090°, turn toward the second on 135°, then settle on 180° in the fairway. Keep below 2.5 knots throughout; each marker also has its own heading and speed targets.',
   'Anticipate momentum. Use neutral, then a short burst of astern to stop in the final circle. Finish in neutral below 0.15 knots for five seconds, clear of the docks and other boats.'
  ],
  observe:['Use the engine slider or W/S; N selects neutral. Center the helm before overshooting.','Follow the current marker on the chart. The goal panel shows distance, heading, and speed.'],
  mistake:'Entering too fast and waiting until the stopping circle to reduce power.',
  quiz:[q('What should you do before entering the confined fairway?',['Build maximum speed','Lower sails and establish a controlled engine approach','Deploy the anchor while moving'],1,'Prepare the boat and control its speed before entering confined water.'),q('What completes the final stop?',['Touching the dock','Reaching the circle at any speed','Holding position and heading at low speed in neutral'],2,'Position, heading, ground speed, and neutral must all meet the targets for five continuous seconds.')],
  practice:{setup:setup(225,-35,90),steps:[
   waypoint('Enter the approach on 090° at 0.5–2 knots',285,-35,90,[.5,2],8,'Apply gentle ahead thrust. Steer east toward the amber marker.'),
   waypoint('Turn into the fairway on 135° at 0.3–1.5 knots',327,-12,135,[.3,1.5],9,'Turn starboard gradually, keeping the dock fingers to port.'),
   stop('Stop in the fairway on 180°, neutral, below 0.15 knots',335,28,180,6,'Turn south, slow early, and use astern to check your motion. Return to neutral inside the green circle.')
  ],debrief:'You entered the marina, turned into the fairway, and stopped under engine control.'}
 },
 {
  id:'sail-44',title:'Dock in a marina berth',
  concepts:[
   'The northern berth at Haven marina is empty for practice. Start in the fairway facing east on 090°, aligned with the space between the two northern dock fingers.',
   'Approach the amber marker at 0.3–1 knot. Continue into the berth and stop with the boat center within 2 metres of the green target, heading 090° ±10°. Keep both sails lowered and the anchor stowed.',
   'Use brief ahead and astern inputs with neutral between them. Finish below 0.15 knots in neutral for five seconds. Contact with any dock or boat ends the attempt; mooring-line handling is not part of this exercise.'
  ],
  observe:['The green circle marks the boat center, not the bow. Leave clearance ahead and on both sides.','Watch ground speed and reduce power before reaching the berth.'],
  mistake:'Using the dock to stop the boat or leaving the engine engaged after reaching the target.',
  quiz:[q('Where should the boat stop?',['With its bow touching the dock','Anywhere near the marina','Centered in the marked berth, aligned and clear of obstacles'],2,'The exercise checks a controlled, aligned stop inside the berth without contact.'),q('The boat is aligned but still moving. What is needed?',['Control the remaining momentum and finish in neutral','Increase ahead thrust','Drop anchor in the berth'],0,'Alignment alone is insufficient. Slow the boat and hold the complete stopping target.')],
  practice:{setup:setup(305,37,90),steps:[
   waypoint('Approach the empty berth on 090° at 0.3–1 knot',340,37,90,[.3,1],5,'Use low ahead thrust and keep the bow aligned with the empty northern berth.'),
   stop('Park in the berth on 090°, neutral, below 0.15 knots',367,37,90,2,'Slow before the green circle. Use a short astern input, then neutral. Keep clear of the pontoon ahead.')
  ],debrief:'You maneuvered into the berth and held an aligned stop without contact.'}
 },
 {
  id:'sail-45',title:'Leave the berth and exit the marina',
  concepts:[
   'Start stopped in the northern berth, bow facing east. The boat is free to move; this exercise begins after mooring lines have been released. Keep sails lowered and use astern thrust to back straight into the fairway.',
   'Reverse to the first marker on 090° at 0.3–1.2 knots astern. Steering response reverses while backing. Stop at the second target and select neutral before making the departure turn.',
   'Once clear of the dock fingers, use ahead thrust and port helm to turn north. Follow the two departure markers on 000° and establish controlled ahead speed in open water. Keep below 2.5 knots and clear of other boats.'
  ],
  observe:['Look astern before backing out. Keep the helm centered for the straight reverse leg.','Back far enough to leave turning room, stop, then turn under ahead power.'],
  mistake:'Turning while still between the dock fingers or accelerating before there is room.',
  quiz:[q('When should you start the departure turn?',['While still inside the berth','After backing clear and stopping in the fairway','As soon as astern is selected'],1,'Clear the dock fingers and establish control before turning.'),q('How does the rudder respond while moving astern?',['Exactly as when moving ahead','It cannot steer at all','Its turning effect reverses'],2,'Water flow reverses under sternway, so the same helm input turns the bow the opposite way.')],
  practice:{setup:setup(367,37,90),steps:[
   waypoint('Back clear on 090° at 0.3–1.2 knots astern',327,37,90,[-1.2,-.3],5,'Select gentle astern with the helm centered. Watch the space behind the boat.'),
   stop('Stop in the fairway on 090°, neutral, below 0.15 knots',317,37,90,6,'Use a short ahead input to stop sternway, then neutral. Leave room for the bow to turn.'),
   waypoint('Turn north on 000° at 0.4–1.5 knots',336,0,0,[.4,1.5],12,'Apply ahead thrust and port helm. Center the helm as the bow approaches north.'),
   waypoint('Exit the marina on 000° at 0.5–2 knots',336,-65,0,[.5,2],10,'Continue north toward the final marker, checking heading and keeping a lookout.')
  ],debrief:'You backed out, stopped clear of the berth, and exited the marina under ahead power.'}
 }
];
for(const [i,lesson] of marinaLessons.entries()){
 Object.assign(lesson,{module:'marina',level:'advanced',sub:marinaModule.outcome,minutes:10,prerequisite:i?marinaLessons[i-1].id:'sail-42',type:'Guided practice',body:lesson.concepts[0],goal:lesson.practice.steps[0].label,tip:lesson.observe[0],transfer:'This exercise assesses engine maneuvering in the model. Practice real docking, propeller effects, and mooring lines with a qualified instructor.'});
 Object.assign(lesson.practice,{propulsion:'engine',maxSpeed:2.5,area:{x:300,z:0,radius:180},chart:{center:{x:315,z:25},span:300}});
}

export function marinaCues(lesson,index=0){
 if(lesson?.practice?.propulsion!=='engine')return null;
 const check=lesson.practice.steps[Math.min(index,lesson.practice.steps.length-1)],p=check.value;
 const points=lesson.practice.steps.filter(step=>['engineWaypoint','engineStop'].includes(step.kind));
 if(!points.includes(check))return {route:points.map((step,i)=>({x:step.value.x,z:step.value.z,number:i+1}))};
 return {
  route:points.map((step,i)=>({x:step.value.x,z:step.value.z,number:i+1})),
  ...(lesson.id==='sail-44'?{corridor:{x:367,z:37,width:8,length:17,heading:90}}:{}),
  ...(check.kind==='engineStop'?{target:{x:p.x,z:p.z,radius:p.radius,heading:p.heading}}:{gate:{x:p.x,z:p.z,width:p.radius*2,heading:p.heading},target:{x:p.x,z:p.z,radius:p.radius}})
 };
}
