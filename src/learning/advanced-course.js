// Original coastal decision exercises grounded in docs/COURSE_LEVELS_RESEARCH.md.
// All examples are fictional. No simulated or physical maneuver credit is awarded.
export const advancedModule = {
 id:'coastal-decisions',title:'Coastal decisions',
 outcome:'Plan conservative coastal passages, calculate simple margins, and cross-check navigation information.'
};
const q=(prompt,options,correct,explanation)=>({prompt,options,correct,explanation});
const content=[
 {
 title:'Plan the route and the escape',
 concepts:[
  'A passage plan links preparing, choosing the route, sailing it and checking progress. Check:\n• the water: current charts, notices to mariners (official updates on new hazards or moved buoys), tide and current\n• the weather: forecast and daylight\n• the boat and crew: readiness, ability, fuel and communications\nMark hazards, safe water, alternatives and points where choices become limited.',
  'Choose decision points before you leave, while you still have options. At a decision point you check conditions and choose to go on or divert. In this fictional exercise, the exposed headland is acceptable only if the agreed weather and daylight margins remain. A sheltered alternative is available before the headland; after passing it, returning may be difficult.',
  'Treat the route as a plan you keep checking, not a promise. Compare actual progress and conditions with the plan. Agree a diversion trigger in advance, because it stops you pressing on just because the destination is close. Share the route, crew roles and backup plan.',
  'For a harbor you do not know, read the pilot book, a cruising guide for the area, alongside the official charts. Pilot books describe approaches, anchorages, berthing and mooring arrangements, hazards and local rules. Recent reports from sailors who know the area help too.'
 ],
 observe:['Write a primary route, one sheltered alternative and one clear diversion trigger.','Identify the last safe decision point before the exposed section.'],
 mistake:'Selecting a destination and following its waypoint without checking hazards or preserving an escape option.',
 quiz:[
  q('Before an exposed headland, the forecast worsens beyond your agreed limit. A sheltered alternative remains open. What best follows the plan?',['Continue because the headland is nearby','Use the sheltered alternative while it remains viable','Increase speed and decide after rounding'],1,'Act at the planned decision point. Keeping an acceptable alternative avoids committing to conditions beyond the agreed limits.'),
  q('Which makes a contingency usable?',['A specific trigger, safe alternative and decision point','A promise to reach the destination','A spare waypoint without checking its approach'],0,'A contingency needs a feasible option and a clear moment to act, checked against conditions and crew capability.')
 ],
 transfer:'With an instructor, plan a real short passage using current local charts, forecasts and tide information. Walk through the alternatives and the places where turning back becomes difficult.',
 sources:['rya-coastal-skipper','us-bareboat']
 },
 {
 title:'Tidal depth and clearance',
 concepts:[
  'Chart depths are measured from a stated low water level called chart datum, so most of the time there is more water than the chart shows. Add the tide height for this place and this time, measured from the same level as the chart. Water depth is not the space under your keel. A depth sounder may measure from the waterline or from the keel, so check its offset (the distance from where it measures to the bottom of the keel).',
  'Here is a worked example with made-up numbers, for a boat that is still and level:\n• Charted depth 2.4 m plus tidal height 1.1 m gives a water depth of 3.5 m.\n• Take away the 1.8 m draft: 1.7 m of static under-keel clearance (the water between keel and seabed).\n• Take away the exercise’s 0.8 m allowance: 0.9 m remains.\nThis is arithmetic, not permission to cross a shoal.',
  'Real planning needs more margin than this simple sum, for these reasons:\n• the tide keeps changing, so use the lowest tide during the passage\n• surveys and forecasts are never exact\n• waves and heel can bring the keel closer to the bottom\n• squat: the boat sits lower when moving fast in shallow water\nDo not add the tide again to a depth-sounder reading: it already shows the real water depth. One good reading cannot prove a safe route.'
 ],
 observe:['Label chart datum, tidal height, water depth and draft separately in the example.','List information missing before you could approve a real shallow-water passage.'],
 mistake:'Treating charted depth or a depth-display number as guaranteed under-keel clearance.',
 quiz:[
  q('For the stated example, what is the static clearance before the 0.8 m allowance?',['3.5 m','0.6 m','1.7 m'],2,'Water depth is 2.4 + 1.1 = 3.5 m. Subtracting the 1.8 m draft leaves 1.7 m.'),
  q('Why does that calculation not approve a real crossing?',['Tidal height never affects depth','Datum/time, changing tide, uncertainty and dynamic allowances still need checking','Any positive clearance guarantees safety'],1,'A static arithmetic result omits changing conditions and uncertainties. Confirm compatible data and adequate vessel-specific margins.')
 ],
 transfer:'Practice with a current local chart and tide source under instruction. Confirm chart datum, time zone, tidal station, vessel draft and the actual sounder offset before using any number.',
 sources:['us-coastal-navigation','rya-day-theory']
 },
 {
 title:'Current vectors and passage time',
 concepts:[
  'Heading is where the bow points; course over ground is where the boat really goes over the seabed. They differ because a current carries the whole boat along, like a moving walkway, so speed through the water and speed over ground differ too. Leeway (sideways slip from the wind) adds another difference. A current\'s set is the direction it flows toward (setting east carries you east); its drift is its speed in knots.',
  'Fictional example: a current straight along your route simply adds to or takes away from your speed. A yacht makes 5 knots through the water directly along a 12 nautical mile route. A steady 1-knot current directly against the route leaves 4 knots over ground, so the leg takes 3 hours. A current directly behind gives 6 knots and 2 hours. Ignore speeding up and leeway only for this example.',
  'A current from the side pushes you off your line, so you cannot just add or subtract it. Draw the boat\'s and the current\'s arrows together: the result is your ground track, and you may need to steer a little into the current to stay on line. Real passages also need:\n• current that changes over time\n• wind and tacking (zig-zagging upwind)\n• sea conditions and a time reserve\nSo recalculate your ETA (arrival time) from the progress you actually make.'
 ],
 observe:['In Boat systems, compare heading and water speed with course and speed over ground.','Draw arrows for a current from ahead, from behind and from the side before doing any sums.'],
 mistake:'Using water speed for every arrival estimate, or subtracting a cross-current as if it flowed straight along the route.',
 quiz:[
  q('At 5 knots through the water, with a 1-knot current directly against you, how long does the 12 nautical mile leg take?',['2 hours','3 hours','2.4 hours'],1,'The example gives 4 knots over ground. Time = 12 nautical miles ÷ 4 knots = 3 hours.'),
  q('What changes when the same current flows across the route?',['Combine the boat\'s and the current\'s arrows (speed and direction), then recheck your track and course to steer','Always subtract 1 knot from water speed','Heading and ground track must stay the same'],0,'A cross-current changes the direction you move over the ground. You can only simply add or subtract speeds when the current flows straight along or against your route, as in the simple examples.')
 ],
 transfer:'With a navigation instructor and real tidal-stream data, plot a course to steer. Compare planned and actual progress; do not treat this app\'s current as a local forecast.',
 sources:['us-coastal-navigation','us-bareboat']
 },
 {
 title:'Weather: go, wait or divert',
 concepts:[
  'Decide before you leave what weather would make you stay in harbour or change plan. That limit belongs to your boat, crew, route and conditions, so a single wind number does not describe the risk. Check official marine forecasts and warnings for:\n• gusts (the strongest bursts) and wind direction\n• sea state (wave size) and visibility\n• where tide or current meets the wind\n• a safe alternative route',
  'Fictional decision: if either agreed warning sign is forecast, wait or take the sheltered route. Your crew agreed to avoid an exposed leg if gusts rise beyond its practised ability, or poor visibility hides the pilotage references (marks and landmarks you steer by near the coast). Either is now forecast before you can finish the leg. Waiting, or an acceptable sheltered route, keeps the agreed margin.',
  'Keep checking the weather underway, and change the plan while you still have choices. Wind against current can steepen the waves. An onshore wind raises lee-shore danger (a coast the wind blows toward, so a disabled boat drifts onto it). Reef (make the sail smaller) early as needed and save crew energy. A reef does not make every forecast acceptable.'
 ],
 observe:['State two departure limits, and where on the route you would check them again.','Compare the exposed route with its sheltered alternative for wind direction, sea state and visibility.'],
 mistake:'Treating one wind-speed limit for everyone, or the ability to reef, as proof that a passage is safe.',
 quiz:[
  q('The forecast goes beyond your crew\'s agreed limits before the exposed leg ends. What is the sound plan?',['Reef and assume all risk is gone','Ignore the forecast if the harbour is calm','Wait, or choose a checked alternative within the limits'],2,'The decision to leave should keep the margins agreed for this crew, yacht and route. Calm water in the harbour tells you nothing certain about conditions offshore.'),
  q('Why think about current as well as wind?',['Wind against current can make the sea steeper and change the route\'s risk','Current affects only the compass display','Current guarantees sheltered water'],0,'When wind and current run in opposite directions, the sea can get worse. Look at the route\'s exposure and the forecast together.')
 ],
 transfer:'Discuss a real forecast with an instructor, including local effects and how uncertain it is. Agree limits for your own boat and crew, and keep checking them; these examples give no universal safe wind speed.',
 sources:['rya-coastal-theory','rya-coastal-skipper']
 },
 {
 title:'Collision risk and limited visibility',
 concepts:[
  'Keep a proper lookout, and treat a steady bearing on an approaching boat as collision risk. Look, listen and use every suitable means available. If an approaching vessel\'s compass bearing (its direction from you) hardly changes over repeated checks, you are both heading for the same point. A changing bearing does not always remove risk, especially close by, or near a large ship or a tow (a tug pulling something on a long line), whose long length can still hit you. If in doubt, treat risk as present.',
  'Go at a safe speed: one that lets you take avoiding action or stop in time. It depends on:\n• visibility and traffic\n• how easily your boat turns and stops\n• wind, sea and current\n• nearby hazards\nAct early under the rules and keep checking until the other vessel is past and clear. One AIS symbol (ships shown on a screen by radio) is not a full lookout, because many small boats do not transmit.',
  'When you cannot see the other boat in fog or rain, the usual in-sight give-way rules do not apply (International Rule 19). This holds in or near restricted visibility, because neither boat can see what the other is. Instead:\n• slow to a safe speed and keep a lookout\n• sound the required signals\n• use your equipment correctly\n• power-driven vessels keep engines ready to manoeuvre at once\nLearn the full rules with an instructor; this exercise picks no universal avoiding turn.'
 ],
 observe:['Sketch several compass bearings and distances over time, rather than relying on one glance.','Note what information is missing when a vessel is heard or shown on a screen but cannot be seen.'],
 mistake:'Claiming an automatic right of way in fog, or assuming that no AIS target means no vessel.',
 quiz:[
  q('A vessel is getting closer while its compass bearing barely changes. What should you conclude?',['Collision risk exists; keep assessing and act in good time','The other vessel will certainly pass astern','Only motor vessels need to respond'],0,'A bearing that hardly changes as a vessel approaches is a sign of collision risk. Use all suitable information you have and act under the rules that apply.'),
  q('In restricted visibility, another vessel is not in sight. Which statement is sound under International Rule 19?',['A sailing yacht always has priority over an unseen motor vessel','Follow the restricted-visibility rules: safe speed and a proper lookout','Keep your speed until you can see the other vessel'],1,'The in-sight sail and power rules cannot simply be used for a vessel you cannot see. Rule 19 and the general rules call for a response that fits the situation.')
 ],
 transfer:'Study the full International rules, and any inland or local rules that apply, with a qualified instructor. Practise a steady lookout routine and the use of equipment aboard; this lesson does not test real collision avoidance.',
 sources:['us-basic-cruising','us-coastal-navigation','uscg-rules']
 },
 {
 title:'Night pilotage and cross-checks',
 concepts:[
   'Plan a night approach in daylight: list the lights you expect, in order, and how you will recognize each one. Also mark hazards, safe water, expected depths and a safe alternative. A light is identified by its color, pattern and period: “Fl W 6s” is one white flash every 6 seconds. Time several full cycles; color alone is not enough, and lights ashore can confuse the picture.',
   'Leading lights are two lights, the rear one higher and farther away. When the rear light is straight above the front one, you are on the safe line. If the rear light appears to the right of the front one, you are right of the line: move left until they line up again. Two marks ashore used the same way by day are called a transit.',
   'Cross-check the electronic position with independent evidence such as identified lights, bearings, transits and depth trends. Allow for tide and instrument offsets: the depth sounder may read from the keel, not the surface. Two displays using the same GPS source are not independent fixes. Confirm chart scale, updates and datum (the chart’s reference grid; a mismatch shifts your position); a precise-looking symbol can still be wrong.',
   'When the plotter and what you see disagree, stop and check. In this fictional approach the plotter suggests you are on track, but an expected leading-light alignment and the depth trend disagree. Do not continue into shallower or tighter water just to solve the puzzle. Reduce risk, stay in or return to safe water you have checked if you can, cross-check the observations and revise the plan.'
  ],
 observe:['List the expected navigation references in their approach order and explain how each will be identified.','Choose an abort point that leaves adequate sea room before the difficult section.'],
 mistake:'Trusting a bright plotter symbol over conflicting observations or treating two screens sharing one sensor as independent confirmation.',
 quiz:[
  q('Two screens share the same GPS source. Do matching positions provide independent confirmation?',['Yes, because there are two screens','Only when both displays are bright','No; use a genuinely independent observation or source'],2,'A shared sensor can produce the same error on both screens. Identified visual references and properly interpreted depth can provide other evidence.'),
  q('Plotter position conflicts with the expected light alignment and depth trend before a narrow entrance. What is the prudent response?',['Maintain speed and trust the plotted line','Reduce risk in verified safe water and resolve the disagreement before committing','Switch off the depth display'],1,'Conflicting observations reduce confidence. Preserve sea room and cross-check before continuing into a constrained approach.')
 ],
 transfer:'Rehearse a real pilotage plan with an instructor in daylight before supervised night work. Practice identifying light characteristics and obtaining independent position checks.',
 sources:['rya-coastal-skipper','us-coastal-navigation']
 }
];
export const advancedLessons=content.map((item,index)=>({
 ...item,id:`sail-${index+37}`,module:advancedModule.id,sub:advancedModule.outcome,
 level:'advanced',prerequisite:`sail-${index+36}`,practice:null,minutes:8,
 type:'Theory & decisions',body:item.concepts[0],
 goal:'Read the briefing and check your understanding',tip:item.observe[0]
}));
