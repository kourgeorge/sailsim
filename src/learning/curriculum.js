import {advancedModule,advancedLessons} from './advanced-course.js';
import {decisionScenarios} from './decision-scenarios.js';
import {marinaModule,marinaLessons} from './marina-course.js';
import {colregsModule,colregsLessons} from './colregs-course.js';
import {catamaranModule,catamaranLessons} from './catamaran-course.js';
import {nightModule,nightLessons} from './night-course.js';
// A module groups related lessons. Each lesson contains teaching pages, questions,
// and its assessed training. Practical assessments only use simulated capabilities.
export const modules=[
 {id:'aboard',title:'Before you leave',outcome:'Use boat terminology, identify essential equipment, and prepare a safe crew briefing.'},
 {id:'wind',title:'Your first sail',outcome:'Read the wind, raise sails, get underway, and hold a steady course.'},
 {id:'trim',title:'Make the wind work',outcome:'Recognize points of sail and connect sail angle with speed and heading.'},
 {id:'maneuvers',title:'Change direction',outcome:'Head up, bear away, tack, gybe, and recover from the no-go zone.'},
 {id:'conditions',title:'Stay in control',outcome:'Distinguish true and apparent wind, reduce sail, and make conservative weather decisions.'},
 {id:'navigation',title:'Find your way',outcome:'Interpret a practice chart, steer a bearing, monitor depth, and execute a short route.'},
 {id:'seamanship',title:'Share the water',outcome:'Maintain a lookout and reason through basic traffic and weather situations.'},
 {id:'harbor',title:'Arrive and depart',outcome:'Plan docking and anchoring, rehearse stopping, and prepare for departure.'},
 {id:'readiness',title:'Respond and review',outcome:'Explain emergency priorities and demonstrate a complete simulated sailing exercise.'},
];
const q=(prompt,options,correct,explanation)=>({prompt,options,correct,explanation});
const step=(label,kind,value,duration=0,hint='')=>({label,kind,value,duration,hint});
const lessons=[];
function lesson(module,title,concepts,observe,mistake,quiz,practice=null,transfer='Practice this with a qualified instructor aboard a real yacht. The simulator cannot reproduce crew coordination, loads, or all vessel behavior.'){
 const index=lessons.length;
 lessons.push({id:`sail-${String(index+1).padStart(2,'0')}`,module,title,sub:modules.find(m=>m.id===module).outcome,
  concepts,observe,mistake,quiz,practice,transfer,minutes:practice?10:6,prerequisite:index?lessons[index-1].id:null,
  type:practice?'Guided practice':'Theory & decisions',body:concepts[0],goal:practice?practice.steps[0].label:'Read the briefing and check your understanding',tip:observe[0]});
}
lesson('aboard','Safety before speed',[
 'A good departure begins with the crew, weather, and boat, not the throttle. Wear a correctly fitted lifejacket, identify emergency equipment, and agree how to call for help and recover a person from the water.',
 'Brief everyone on the boom, trip hazards, safe handholds, and keeping hands clear of loaded lines and winches. Check the forecast, local restrictions, communications, fuel or battery supply, and that the boat is seaworthy.',
 'Choose conditions appropriate to the least experienced crew member and agree an abort plan. This course develops understanding and selected simulated skills; completion is not a qualification to skipper a real yacht.'
],['Before departure, tell your crew where to sit, how to move, and who will keep lookout.','Identify the boom and imagine its sweep across the cockpit.'], 'Starting because the weather looks pleasant without checking the forecast or briefing the crew.',[
 q('A new crew member is aboard. What comes before departure?',['Demonstrate maximum speed','Fit lifejackets and explain hazards, emergency equipment, and roles','Leave first and explain the controls underway'],1,'Prepare the crew and boat before getting underway; discovering a missing safety item after departure is too late.'),
 q('What does passing this simulator course establish?',['Permission to charter any yacht','Understanding and selected skills in a simplified simulation','Readiness to sail alone in all weather'],1,'On-water instruction and assessment are still needed. The simulator omits many physical and environmental demands.')]);
lesson('aboard','Know your yacht',[
 'Bow means the front; stern means the back. Port is the left side and starboard the right when facing the bow. These names stay with the boat when you turn around.',
 'The mainsail is behind the mast; the headsail is forward. The boom supports the mainsail foot. The keel contributes stability and resists sideways motion; the rudder steers when water flows over it.',
 'Use Chase for the whole boat, Helm for the sailing viewpoint, and Cockpit to inspect the wheel, winches, and screens.'
],['Switch to Cockpit and locate the wheel, companionway, and sheet winches.','Switch to Chase and identify the bow, mast, boom, and two sails.'], 'Calling a side port or starboard from whichever direction you happen to be looking.',[
 q('You are facing the stern. Which side is port?',['Your current left','Your current right','Whichever side the wind comes from'],1,'Port is the yacht’s left when facing forward, so it is on your right when facing aft.'),
 q('What needs water flowing over it to steer effectively?',['The anchor','The mast','The rudder'],2,'The rudder changes the direction of water flow. With little boat speed its authority is reduced.')]);
lesson('aboard','Lines, winches, and loads',[
 'A halyard raises a sail. A sheet adjusts its angle. A reef reduces exposed sail area. A cleat or clutch holds a line; a winch helps manage load.',
 'On this yacht, colored sheets run aft toward the cockpit winches. Inspect the wraps and clutches in Cockpit view. The Boat systems panel controls the two halyards and sheets independently, plus traveler, vang, outhaul, reefs, engine, and anchor rode. The sliders represent control settings, not physical line handling.',
 'The main and headsail hoists set how much sail is exposed. The two sheets change sail angle independently. The traveler moves the boom’s sheeting position; vang tension controls modeled twist, while the outhaul flattens the modeled sail foot. Change one control at a time and compare the response.',
 'Reef level reduces mainsail area. Engine throttle selects reverse, neutral, or ahead; return to neutral for sailing assessments. The anchor rode slider sets a target. Run the windlass to pay out or retrieve line over time; watch actual paid-out rode and stop the windlass when needed.',
 'Keep fingers, loose clothing, and hair clear of loaded lines. Learn real winch loading, line handling, knots, and controlled easing with an instructor; a mouse cannot teach the feel of a loaded line.'
],['Follow a colored sheet from the deck toward its winch.','Compare a halyard’s lifting purpose with a sheet’s trimming purpose.'], 'Treating a heavily loaded sheet like an unloaded rope, or confusing the sheet with the halyard.',[
 q('You want to adjust the mainsail’s angle. Which line has that job?',['Mainsheet','Main halyard','Anchor rode'],0,'The mainsheet controls the boom and mainsail angle; the halyard hoists the sail.'),
 q('Can the visual winch model assess safe handling of a loaded rope?',['Yes, fully','Only at maximum zoom','No; physical line handling needs supervised practice'],2,'The rendered hardware provides orientation, not a simulation of hand placement, friction, or line loads.')]);
lesson('aboard','Read the instruments',[
 'Heading is the direction the bow points, measured clockwise from north: 000° north, 090° east, 180° south, 270° west. Speed is shown in knots; one knot is one nautical mile per hour.',
 'The multifunction display behind the wheel and the dashboard below the controls show the same live readings. Wind over water names where the wind comes from relative to moving water; its angle is measured from the bow. Depth estimates water depth, not clearance below the keel.',
 'Current and leeway can make course over ground differ from heading, and speed over ground differ from speed through water. Compare these readings on the dashboard. You can enlarge the display for easier reading.',
 'The app combines a compass and a wind indicator in one dial. North stays at the top, east at the right, south at the bottom, and west at the left, even when the boat or camera turns. Read the white boat symbol’s bow against the compass scale to find your heading.',
 'The gold arrow identifies where wind over water comes from. The shaded no-go sector surrounds that source; it marks headings too close to the wind for sailing. In this example, the white boat points northeast at 045°, while the arrow and sector face northwest at 315°. The knots reading beneath the dial is wind speed.'
],['Open Helm or Cockpit and compare the multifunction display behind the wheel with the dashboard below the controls.','Select Chart and find the yacht symbol and north arrow.','Find the floating compass. Identify north, read the white boat’s heading, then read the gold wind-from arrow. These are two separate bearings.'], 'Reading depth as guaranteed clearance or treating heading as a guaranteed ground track.',[
 q('Which heading points east?',['000°','090°','270°'],1,'Bearings are measured clockwise from north; east is 090°.'),
 q('At 6 knots, how far would you travel in 30 minutes without current?',['6 nautical miles','12 nautical miles','3 nautical miles'],2,'Distance = speed × time. Six nautical miles per hour for half an hour is three nautical miles.'),
 q('On the illustrated app compass, the white bow points to 045° and the gold arrow to 315°. What is your heading?',['045° — read the white bow','315° — read the gold arrow','135° — follow the airflow'],0,'Heading comes from the white boat’s bow: 045°. The gold arrow gives the wind-from bearing, 315°. Neither the wind pointer nor the shaded sector is a course to follow.')],{setup:{sails:0},steps:[step('Inspect the cockpit instruments','camera','deck'),step('Open the navigation chart','event','chart')],debrief:'You can now locate the displays. Check instruments regularly while maintaining an outside lookout.'});
lesson('wind','Where the wind comes from',[
 'A northwesterly wind comes from the northwest and blows toward the southeast. Windward is toward the source of the wind; leeward is away from it.',
 'Weather settings describe wind relative to fixed ground. Subtract the current vector to obtain wind relative to moving water: the reference for points of sail here. Apparent wind is airflow relative to the moving yacht. Always check which reference an instrument uses for “true wind.”',
 'The no-go zone is the sector too close to the wind for the sails to drive the boat. Its limit varies with boat and conditions; this simulator uses 38° on either side of wind over water. In calm relative to water, its direction and angle are undefined.',
 'Read the app’s gold wind pointer like a weather vane: its arrowhead faces the wind’s source. The airflow arrows in the general teaching diagrams show air moving away from its source, so they point the opposite way. For wind from northwest, the compass pointer faces 315° while the air moves toward 135°. The shaded no-go sector stays on the source side.',
 'In the illustrated compass, wind over water from 315° and a boat heading of 045° are 90° apart: a beam reach. Turning the bow toward 315° would put it inside the shaded no-go sector. With steady wind over water, turning the boat changes the white boat symbol; the gold arrow and sector stay on the same compass bearing.'
],['With no current and wind from 315°, compare headings 315°, 045°, and 135° on the compass.','The 045° heading puts the wind approximately across the side.','On the app compass, compare the white bow with the shaded sector. Say where the wind comes from and where the air moves before choosing a heading.'], 'Interpreting the arrow as where the wind is going rather than where it comes from.',[
 q('A wind from 315° comes from which direction?',['Southeast','Northwest','Northeast'],1,'315° is northwest. Wind direction is conventionally named for its source.'),
 q('Why can a yacht not make useful progress aimed directly into the wind?',['The compass stops working','The keel becomes too heavy','The sails cannot generate effective driving force in that direction'],2,'You must sail outside the no-go zone and tack to make progress upwind.'),
 q('Why do the app’s gold arrow and shaded no-go sector both face 315° in this example?',['They tell you to steer toward 315°','The air is moving toward 315°','Both identify the wind’s source; the air moves toward 135°'],2,'The pointer marks wind from 315°, and the sector marks headings too close to that source. Air flows toward 135°. The white boat at 045° is outside the sector, on a beam reach.')]);
lesson('wind','Raise the sails',[
 'In practice, prepare halyards and sheets, check for fouled lines, and ensure sea room before hoisting. A mainsail is commonly hoisted with the boat pointing into the wind and the sheet eased so it does not fill unexpectedly.',
 'The Raise sails shortcut moves both sails; Boat systems provides separate main and headsail hoist controls. These controls do not assess the real sequence of topping lift, clutches, sail slides, or furling-line handling.',
 'Once set, bear away far enough to fill the sails. A raised sail alone does not guarantee boat speed.'
],['Start the exercise facing into the wind with sails lowered.','Raise the sails; then turn to a sailable course in later exercises.'], 'Assuming raised sails always propel the boat, or hoisting without first checking the lines and boom area.',[
 q('Before a real mainsail hoist, what should be checked?',['Only the chart color','Clear lines, sea room, crew, and an unloaded sail','Whether the boat is at top speed'],1,'Preparation prevents jams and unexpected sail loading.'),
 q('Does the Raise sails control teach the full real hoisting procedure?',['No; it is a simplified combined control','Yes; there are no additional steps','Only when the wind exceeds 20 knots'],0,'You still need supervised practice with halyards, clutches, sail slides, and the vessel’s equipment.')],{setup:{heading:315,sails:0},steps:[step('Raise the sails','sails',1,2)],debrief:'You set the sails in the model. The next exercise starts on a reach where they can produce drive.'});
lesson('wind','Feel the boat accelerate',[
 'A beam reach puts the wind approximately at right angles to the yacht. It is a useful starting point because the sails can drive the boat without pointing close to the no-go zone.',
 'The yacht accelerates gradually. Watch speed build before applying a large helm angle: steering authority increases with water flow over the rudder.',
 'Start with small adjustments. Centering the helm stops the turn; it does not automatically restore your previous heading.'
],['Begin on 045° with a northwesterly wind, sails lowered, and anchor up.','Raise both sails, then watch speed increase. Keep the helm centered while the yacht builds steerage.'], 'Applying full helm while stationary and expecting the yacht to pivot instantly.',[
 q('When does this rudder gain steering authority?',['As water flow and boat speed increase','When the anchor is lowered','Only when sails are lowered'],0,'A yacht normally needs water flow over the rudder to respond.'),
 q('After centering the helm, what happens?',['The yacht returns automatically to north','The turn reduces and the yacht tends to maintain its new heading','The yacht stops instantly'],1,'The helm controls turning, not a selected compass heading.')],{setup:{heading:45,sails:0,trim:65,jibSheet:60},steps:[step('Raise sails and build speed above 3 knots','speedAbove',3,6)],debrief:'The sail force accelerated the boat; the rudder became useful as speed built.'});
lesson('wind','Hold a steady course',[
 'Steering a course is a cycle: choose a distant reference, compare the compass, make a small correction, then center the helm before overshooting.',
 'Keep a lookout beyond the instruments. A course that is accurately steered can still lead into danger.',
 'Hold 045° within 5° for ten continuous seconds, with speed above 2 knots. The timer restarts when you leave the tolerance.'
],['Use short port or starboard inputs, then select Center.','Watch heading settle rather than keeping the helm over.'], 'Holding a large correction too long and oscillating from one side of the target to the other.',[
 q('You are approaching your intended heading. What usually helps avoid overshoot?',['Center the helm in good time','Increase helm to maximum','Lower the anchor'],0,'The boat has rotational response; reducing the correction early helps the turn settle.'),
 q('Which is a complete steering routine?',['Watch the compass only','Look away until the boat drifts','Look out, check heading, make a small correction, reassess'],2,'Steering and lookout must happen together.')],{setup:{heading:60,speed:3,trim:34},steps:[step('Hold 045° ±5°, above 2 knots, for 10 seconds','heading',45,10,'Port brings 060° down toward 045°. Center before you reach the target.')],debrief:'A steady course requires small corrections and anticipation, not continuous large helm input.'});
lesson('trim','Find a beam reach',[
 'Point of sail describes your heading relative to wind over water, not relative to north. On a beam reach that wind is about 90° off the bow.',
 'The boat can be on a beam reach on either tack. With no current and wind from 315°, headings near 045° and 225° are beam reaches.',
 'Steer until the wind angle over water is between 80° and 105° and maintain useful speed. Apparent wind guides sail trim.'
],['Compare the bow marker with the direction of wind over water on the onboard display.','Notice that two different compass headings can give the same point of sail.'], 'Memorizing a compass heading as a point of sail when the wind direction may change.',[
 q('What defines a beam reach?',['Heading east','Wind about 90° off the bow','Sails completely lowered'],1,'Points of sail are relative to the wind.'),
 q('If the wind shifts, can an unchanged heading produce a different point of sail?',['Yes','No','Only at anchor'],0,'A wind shift changes the angle between the bow and the wind.')],{setup:{heading:75,speed:3,trim:40},steps:[step('Hold a beam reach above 2 knots for 8 seconds','windAngle',[80,105],8)],debrief:'You selected a course using the wind relationship, rather than the compass alone.'});
lesson('trim','Sail close hauled',[
 'Close hauled means sailing near the upwind limit with the sails relatively close to the centerline. Do not point so high that the sails luff and speed disappears.',
 'In this simplified model, a wind angle over water of 45°–58° is a useful close-hauled exercise. Real yachts need assessment of apparent wind, sail shape, telltales, sea state, and leeway.',
 'As you head up, trim in gradually. Watch whether speed remains healthy instead of chasing the smallest possible wind angle.'
],['Start on a reach and steer nearer to the wind.','Trim inward as the wind angle decreases.'], 'Pinching: pointing too close to the wind and losing the speed that makes the boat and rudder work.',[
 q('What is pinching?',['Sailing too close to the wind and losing useful drive','Sailing with too much anchor chain','Turning away from the wind'],0,'A slightly lower course may produce better upwind progress because it preserves speed.'),
 q('Relative to a beam reach, a close-hauled mainsail is generally…',['Further out','Lowered completely','Trimmed closer to the centerline'],2,'As you sail closer to the wind, the sail angle normally comes inward.')],{setup:{heading:30,speed:3,trim:20},steps:[step('Hold 45°–58° off the wind above 2 knots','windAngle',[45,58],8)],debrief:'You balanced pointing with boat speed. The simulator estimates leeway but does not assess reading physical telltales.'});
lesson('trim','Bear away to a broad reach',[
 'Bearing away turns the bow away from the wind. The wind angle increases and the sails generally need easing.',
 'On a broad reach the wind comes from aft of the beam. As you approach dead downwind, watch for an unintended gybe when the wind crosses the stern.',
 'Find an angle of 120°–150°, ease the mainsheet, and keep the helm controlled.'
],['Increase your angle to the wind, then ease the sheet.','Keep a margin from dead downwind while learning.'], 'Leaving the mainsheet tight after bearing away or losing track of which side the boom will move to.',[
 q('What happens to wind angle when you bear away?',['It always becomes zero','It increases','It becomes a compass heading'],1,'The bow moves farther away from the source of the wind.'),
 q('What maneuver becomes a concern near dead downwind?',['An unintended gybe','An automatic tack','Instant anchoring'],0,'A small heading or wind change can take the wind across the stern and move the boom.')],{setup:{heading:55,speed:3,trim:50},steps:[step('Hold a broad reach, 120°–150° off the wind','windAngle',[120,150],8)],debrief:'You increased the wind angle and kept clear of an accidental stern crossing.'});
lesson('trim','Trim with feedback',[
 'Trim means adjusting the sail to the airflow. A mainsheet pulled in too far can stall the sail; too far out can leave it luffing. Real trimming depends on telltales, sail shape, and feel.',
 'Here the suggested mainsheet angle is a teaching aid calculated from apparent wind angle. Match it, then observe boat speed. It is a model-specific guide, not a universal sail-trim formula.',
 'The trim assessment needs an angle within 6° of the model target and boat speed above 2 knots for ten seconds.'
],['Leave the helm centered and change only the sheet.','Wait for speed to respond instead of making constant large changes.'], 'Changing heading and sheet simultaneously so you cannot tell which adjustment improved the boat.',[
 q('For a useful trim comparison, which technique helps?',['Change all controls rapidly','Hold a steady course and adjust one thing at a time','Anchor while trimming'],1,'A stable course makes the effects of sheet changes easier to observe.'),
 q('Is the suggested angle a valid rule for all real yachts?',['Yes','Only at night','No; it belongs to this simplified model'],2,'Real trim requires observation of the particular sail, boat, and conditions.')],{setup:{heading:45,speed:3,trim:80},steps:[step('Hold efficient trim and speed for 10 seconds','trim',6,10)],debrief:'You used a controlled adjustment and allowed time for the speed response.'});
lesson('maneuvers','Head up and bear away',[
 'Heading up turns toward the source of the wind; bearing away turns away from it. Port and starboard name turn direction relative to the boat, not whether you are heading up.',
 'On one tack, a port turn may head up; on the opposite tack it may bear away. Always reason from the current wind direction.',
 'First sail at 50° off the wind, then at 110°. Settle each course before making the next change.'
],['Notice whether the wind angle grows or shrinks with each helm input.','Center the helm at each target, and adjust trim to the new point of sail.'], 'Assuming “turn left” always means “head up.”',[
 q('Is a port turn always a turn toward the wind?',['Yes','No; it depends on the tack and wind direction','Only above 5 knots'],1,'The same helm direction changes the wind relationship differently on opposite tacks.'),
 q('What should follow a substantial course change?',['Reassess sail trim and lookout','Ignore the sails','Always drop anchor'],0,'The new heading changes airflow and the situation around the boat.')],{setup:{heading:45,speed:3,trim:30},steps:[step('Settle at 45°–55° off the wind','windAngle',[45,55],6),step('Bear away and settle at 105°–115°','windAngle',[105,115],6)],debrief:'You changed your relationship to the wind in both directions and stabilized between turns.'});
lesson('maneuvers','Make a controlled tack',[
 'A tack takes the bow through the wind, changing which side receives the wind. Check for traffic and sea room, prepare the crew and sheets, then make the turn with sufficient boat speed.',
 'Expect a short loss of drive through the no-go zone. Keep the turn purposeful, then center the helm on the new close-hauled course and trim.',
 'The simulator shifts the sails automatically. This exercise assesses the bow crossing and recovery of control, not real jib-sheet handling or crew calls.'
],['Start with wind over the starboard side, then turn starboard through 315°.','Continue past the no-go zone, center the helm, and rebuild speed.'], 'Stopping the turn in the no-go zone, or calling a turn across the stern a tack.',[
 q('Which part of the yacht crosses the wind during a tack?',['The stern','The anchor','The bow'],2,'A tack takes the bow through the source of the wind; a gybe takes the stern through it.'),
 q('Before the turn, what is needed?',['Lookout, sea room, preparation, and enough boat speed','An anchor already lowered','All crew standing beneath the boom'],0,'Preparation and momentum help the boat complete the no-go-zone crossing.')],{setup:{heading:265,speed:4,trim:14},steps:[step('Turn the bow through the wind and recover above 2 knots','tack',null,6,'Turn starboard through 315°, then continue to about 005° and center. Trim for the new course.')],debrief:'The assessment recorded a bow crossing, a new tack, and recovered speed. Sheet transfer remains an on-water skill.'});
lesson('maneuvers','Make a planned gybe',[
 'A gybe takes the stern through the wind. The boom can cross the cockpit forcefully, so check the area, warn the crew, and control the mainsheet according to your instructor’s procedure.',
 'Approach deliberately on a broad reach and make a small controlled stern crossing. Avoid a large uncontrolled boom swing or an unnecessary turn into a reach on the other side.',
 'Our boom is animated but does not simulate impact forces or crew injury. The assessment recognizes a stern crossing and a stable new broad reach.'
],['Start at 160° with wind from 315°. Turn port toward and through 135°.','Settle near 110° and keep the wind well aft of the beam.'], 'Treating a gybe like an unannounced sharp turn with the mainsheet fully loose.',[
 q('What is the principal gybe hazard for the crew?',['A compass reversal','The boom and mainsheet crossing the cockpit','The anchor becoming heavier'],1,'Control the boom and keep people clear of its path.'),
 q('What distinguishes a gybe from a tack?',['The stern passes through the wind','The boat must use an engine','The sails are always lowered'],0,'The wind crosses the stern during a gybe and the bow during a tack.')],{setup:{heading:160,speed:3.5,trim:78},steps:[step('Cross the wind with the stern and settle on the new tack','gybe',null,6,'Turn port through 135° and settle near 110°. Center the helm.')],debrief:'You made the correct stern crossing. Real mainsheet control must be learned with supervision.'});
lesson('maneuvers','Recover from loss of drive',[
 'In irons means stopped or nearly stopped pointing into the wind. The sails luff and the rudder loses authority as speed falls.',
 'Avoid the situation by keeping momentum during a tack and not pinching. This exercise begins with residual forward motion: bear away promptly and trim to restore drive.',
 'A completely stopped real yacht may require a backed sail, engine assistance, or a vessel-specific recovery method. Backing sails is not modeled. The engine is available in free sailing, but this residual-way exercise requires neutral; restart if all steerage is lost.'
],['Use the remaining way to turn away from 315°.','Do not wait until speed reaches zero before correcting.'], 'Expecting the rudder to rotate a fully stationary yacht without water flow.',[
 q('Why should you act before all speed is lost?',['Residual water flow gives steering authority','The chart will disappear','The sails become too short'],0,'Use the remaining steerage to get outside the no-go zone.'),
 q('Does this exercise teach all methods of recovering a fully stopped real yacht?',['Yes','No; this exercise assesses residual-way recovery under sail','Only on starboard tack'],1,'The exercise covers recovery with residual way; real recovery depends on the vessel and situation.')],{setup:{heading:325,speed:2.6,trim:20},steps:[step('Exit the no-go zone and rebuild speed above 2 knots','recover',null,7,'Turn starboard toward 010° or beyond before the remaining way disappears.')],debrief:'You used residual momentum. A stopped-boat recovery is a separate practical skill.'});
lesson('conditions','True and apparent wind',[
 'Apparent wind is airflow relative to the yacht. Weather wind is relative to fixed ground; wind over water subtracts current from that air velocity. “True wind” may use either ground or water as its reference, so check the instrument convention.',
 'As speed through water increases on a steady reach, apparent wind generally shifts forward relative to wind over water. Downwind, motion with the airflow can reduce apparent wind speed. When wind over water is calm, its direction is undefined, but a yacht moving through the water can still experience apparent airflow.',
 'Compare Wind over water with Apparent wind on the onboard multifunction display or dashboard. Points of sail, the no-go sector, and modeled outhaul response use wind over water. Sail pressure, coefficients, and suggested sheet angles use apparent wind. This empirical model does not replace reading telltales and sail shape.',
 'A sail can work like an aircraft wing: deflecting airflow produces an aerodynamic force with a forward component and a sideways component. The keel, centreboard or underwater foils resist sideways motion. On a reach, a well-trimmed sail can still provide forward drive when boat speed exceeds true-wind speed. Acceleration ends when driving force balances resistance.',
 'Efficient racing boats can therefore sail faster than the true wind. Light hulls and efficient sails help; hydrofoils can lift the hull clear of the water and reduce resistance further. The energy comes from wind moving relative to the water. Apparent wind describes the airflow at the moving sail; boat motion creates no extra energy. An ordinary cruising yacht may have too much resistance to exceed wind speed.',
 'For a worked example, assume no current or leeway: a racing boat travels north at 30 knots while a 20-knot wind blows from the west. The two velocities are perpendicular. Apparent wind speed is √(20² + 30²) ≈ 36.1 knots, arriving about 34° to port of the bow. This calculates the airflow for an assumed boat speed; it does not prove that every boat can reach 30 knots. Sailing straight downwind at wind speed instead removes the apparent airflow in this simple case.',
 'Try Challenges → Apparent Wind Lab. Record the wind with sails lowered, then hoist and trim on a beam reach. Watch apparent wind strengthen and move forward as boat speed builds. Bear away to a broad reach and compare again. This live cruising-yacht exercise demonstrates the changing airflow; the racing-boat example explains how lower resistance can make faster-than-wind sailing possible.'
],['Imagine riding a bicycle in still air: you feel wind from ahead.','Compare the apparent wind display as speed increases on a steady course.'], 'Assuming true and apparent wind have identical direction and speed while the yacht is moving.',[
 q('What wind does a moving sail actually experience?',['Only the weather forecast wind','Apparent wind','A fixed compass wind'],1,'Sails interact with airflow relative to the moving yacht.'),
 q('What does this prototype use for its sail-force calculation?',['An empirical model using apparent wind','A validated full aerodynamic simulation','Measured masthead airflow'],0,'Apparent wind reflects vessel motion. The empirical force model still omits many real aerodynamic details.'),
 q('Why can an efficient racing boat sail faster than the true wind on a reach?',['Boat motion creates an unlimited energy supply','Sail lift can still provide forward drive greater than resistance','Every sailboat automatically matches apparent wind speed'],1,'The sail interacts with apparent airflow while underwater surfaces resist sideways motion. With sufficiently low resistance, useful forward drive can remain above true-wind speed. Energy still comes from wind relative to water.'),
 q('With no current or leeway, a boat travels at 30 knots perpendicular to a 20-knot true wind. What apparent wind speed does it experience?',['10 knots','50 knots','About 36.1 knots'],2,'Perpendicular velocities combine as √(20² + 30²) ≈ 36.1 knots. Adding or subtracting the speeds directly only applies to collinear motion; this example assumes the boat has reached 30 knots.')]);
lesson('conditions','Reef before you need to',[
 'Reefing reduces sail area to improve control as wind increases. A decision to reef should consider forecast, gusts, sea state, crew ability, and the boat’s behavior, not a universal wind-speed rule.',
 'Excessive heel, heavy helm, and difficulty maintaining control are reasons to reassess sail area early. Delaying can make the work harder when conditions deteriorate.',
 'The Reef control reduces mainsail height and modeled drive. It does not teach reefing-line, tack-cringle, or halyard procedures.'
],['Observe heel and speed in the exercise’s 22-knot breeze.','Select Reef, keep the boat on a reach, and compare its response.'], 'Waiting until the crew are overloaded or using a fixed wind threshold without considering the boat.',[
 q('What is a sound reason to reef early?',['Increasing difficulty keeping the yacht controlled','Wanting the largest possible heel','Every yacht always reefs at exactly 20 knots'],0,'Reefing is a control decision based on boat, crew, and conditions.'),
 q('Which real skill is not assessed by the Reef button?',['Recognizing reduced sail area','Reading boat speed','Managing halyards and reefing lines under load'],2,'The single control abstracts several important physical tasks.')],{setup:{heading:45,speed:4,windSpeed:22,trim:34},steps:[step('Set a reef and maintain steerage for 10 seconds','reef',true,10)],debrief:'You reduced sail area and retained control. Real reefing needs a practiced crew procedure.'});
lesson('conditions','Reduce power deliberately',[
 'Reducing driving force slows the boat, but momentum remains. Leave sea room and avoid treating a sailing yacht like a car with immediate brakes.',
 'You can spill some drive by easing the mainsheet. Lowering sails removes modeled sail power; the yacht then coasts and loses steerage as it slows.',
 'For this exercise, reduce sail power, lower the sails, and wait until speed is below 1 knot. The anchor is not a substitute for a planned speed reduction.'
],['Compare the speed before and after lowering sails.','Notice the delay and the reduction in rudder authority.'], 'Dropping an anchor at speed as a routine way to stop.',[
 q('What remains after you lower the sails?',['Momentum','Full sail driving force','Guaranteed steering at zero speed'],0,'The boat continues to move until drag reduces its speed.'),
 q('Why leave room when slowing down?',['A yacht always reverses instantly','Stopping distance and declining steerage need to be anticipated','The compass becomes unreliable at low speed'],1,'Plan your speed reduction early enough to remain in control.')],{setup:{heading:45,speed:4,trim:34},steps:[step('Lower the sails','sails',0,1),step('Coast below 1 knot without anchoring','coast',1,3)],debrief:'You allowed momentum to decay instead of expecting an immediate stop.'});
lesson('conditions','Choose a weather limit',[
 'Read a marine forecast for the whole intended trip and a margin beyond it. Consider mean wind, gusts, direction changes, sea state, visibility, temperature, tides, and local effects.',
 'Wind against current can steepen waves. Offshore wind can make returning difficult; an exposed lee shore can leave little room to recover from a failure.',
 'Set a go/no-go decision and escape options before departure. The simulation has adjustable steady wind but no gust fronts, breaking-wave hazards, weather forecasting, or changing tidal streams; adjustable current is a steady approximation.'
],['For a novice crew, decide what change would make you shorten or cancel a trip.','Name a sheltered alternative and a return deadline.'], 'Treating a low average wind speed as proof that the entire trip will be safe.',[
 q('The average wind is manageable but the forecast includes strong gusts and worsening visibility. What is appropriate?',['Ignore the gusts','Depart because only average speed matters','Reassess the trip against crew ability and safe alternatives'],2,'The entire forecast and its trend matter, not one number.'),
 q('Can this simulation assess handling breaking seas or wind-against-tide conditions?',['No','Yes, using the speed display','Only when reefed'],0,'Those environmental dynamics are not implemented and require separate instruction.')]);
lesson('navigation','Read a practice chart',[
 'A chart is a planning tool, not a picture to follow blindly. Check scale, orientation, depth information, hazards, marks, and the source and currency of the chart.',
 'Our fictional chart shows islands, your yacht, and amber course buoys. These amber marks are training targets; they are not a representation of the complete IALA buoyage system.',
 'Before a real passage, learn chart symbols, chart datum, local buoyage, tidal heights, and under-keel clearance. None should be inferred from this simplified map.'
],['Open the chart. Locate north, your position, and the next mark.','Identify land you must keep clear of along the intended route.'], 'Assuming a screen showing your position is a complete and current navigational chart.',[
 q('What do the three amber buoys in this app represent?',['The full international buoyage system','Practice course targets','Guaranteed safe-water marks on a real chart'],1,'Their purpose is exercise navigation, not teaching every real-world mark.'),
 q('Which should a real chart check include?',['Only the screen brightness','Only the destination name','Scale, source, currency, depths, hazards, and local conventions'],2,'Charts need interpretation and context to support safe navigation.')]);
lesson('navigation','Steer toward a waypoint',[
 'A bearing is the direction from your position to a target. Decide whether the direct track is safe and sailable before following it.',
 'A direct bearing may point into the no-go zone or cross land. In those cases, plan a different route rather than forcing the bow toward the target.',
 'The exercise starts south of buoy 1. Use the chart, steer toward the mark, and pass within 35 metres while keeping speed controlled.'
],['Open the chart before changing course.','Aim toward buoy 1, then check progress and depth regularly.'], 'Fixating on the target and ignoring land, traffic, or the wind angle.',[
 q('Your waypoint lies directly upwind. What is required?',['Plan a sailable route using tacks','Hold the bow in the no-go zone indefinitely','Increase the compass reading until the wind changes'],0,'You may need multiple legs to make progress toward an upwind destination.'),
 q('Is the direct bearing always a safe course?',['Yes','Only if the waypoint is visible','No; check hazards, depth, wind, and traffic'],2,'A bearing describes direction, not safety.')],{setup:{x:20,z:5,heading:60,speed:3,trim:26},steps:[step('Open the chart to plan the approach','event','chart'),step('Reach buoy 1 with at least 3 m depth','waypoint',{x:90,z:-140,radius:35})],debrief:'You related chart position to the world and monitored a real approach in the simulation.'});
lesson('navigation','Estimate distance and time',[
 'For a first estimate, distance equals speed multiplied by time. At 4 knots, a 3-nautical-mile leg takes 45 minutes if speed remains constant and there is no current.',
 'Dead reckoning advances an earlier position using course, speed, and time. Real estimates also account for current, leeway, and uncertainty; a fix from observations checks the estimate.',
 'Record assumptions and update the estimate as conditions change. Do not confuse a precise-looking number with an accurate prediction.'
],['Compute the time for 3 nautical miles at 4 knots before checking the answer.','Describe one reason the actual arrival time might differ.'], 'Mixing minutes and hours or ignoring current and changing boat speed.',[
 q('At 4 knots, how long is a 3-nautical-mile leg without current?',['30 minutes','45 minutes','75 minutes'],1,'3 ÷ 4 hours = 0.75 hour = 45 minutes.'),
 q('What checks an estimated position?',['Assuming the log cannot be wrong','Rounding the number more precisely','An independent position observation or fix'],2,'An estimate needs verification and an allowance for uncertainty.')]);
lesson('navigation','Sail a short passage',[
 'Break a route into manageable legs with clear targets, hazards, and a plan for the next turn. Keep a lookout before altering course at a mark.',
 'This exercise runs from south of buoy 1 to buoy 1, then buoy 2. The wind makes both direct legs sailable, but you still need to turn and retrim.',
 'Keep at least 3 metres of modeled water depth. Grounding invalidates the attempt and requires a restart; passing the marks alone is not sufficient.'
],['Study both legs before setting off.','At buoy 1, look toward buoy 2 and prepare the course change.'], 'Reaching a waypoint without planning what happens immediately afterward.',[
 q('When should the next leg be considered?',['Only after leaving the chart behind','Before arriving at the turning point','Never; the yacht follows marks automatically'],1,'Anticipation leaves time for lookout, crew preparation, and safe course changes.'),
 q('You passed the marks but ran aground. Was the passage successful?',['No; avoiding hazards is part of the task','Yes; only the marks matter','Yes, if the speed was high'],0,'A completed route is not a safe route if essential margins were lost.')],{setup:{x:25,z:-15,heading:60,speed:3,trim:26},steps:[step('Pass within 35 m of buoy 1','waypoint',{x:90,z:-140,radius:35}),step('Pass within 35 m of buoy 2','waypoint',{x:240,z:-290,radius:35})],debrief:'You planned and sailed two connected legs. Tides, traffic, and real pilotage require additional training.'});
lesson('seamanship','Keep an effective lookout',[
 'A proper lookout uses sight, hearing, and appropriate available means. Scan ahead, astern, and to both sides; the sails and structures can hide other craft.',
 'A vessel staying on a nearly constant bearing while getting closer is a warning of collision risk. Reassess early rather than waiting for certainty at close range.',
 'Electronic aids support the lookout; they do not replace it. This world has static moored yachts and does not assess realistic traffic detection.'
],['Use the camera to scan the side hidden by the headsail.','Explain how you would share lookout duties with a real crew.'], 'Looking only ahead or only at the chartplotter.',[
 q('A nearby vessel stays at a nearly constant bearing while the distance closes. What might that indicate?',['No risk because it is not changing direction on the window','Potential collision risk','A guarantee that it will pass astern'],1,'Constant bearing with decreasing range is a classic warning; act early based on the full situation.'),
 q('Can a chartplotter replace sight and hearing?',['Yes','Only in daylight','No'],2,'Use all appropriate available means and keep an outside lookout.')]);
lesson('seamanship','Reason through encounters',[
 'For two sailing vessels in the basic crossing cases: different tacks generally means the port-tack vessel keeps clear of the starboard-tack vessel; on the same tack, the windward vessel generally keeps clear of the leeward vessel.',
 'An overtaking vessel keeps clear. Other vessel responsibilities, narrow channels, traffic schemes, restricted visibility, and local rules can change the analysis. Do not reduce the rules to “sail always wins.”',
 'A stand-on vessel still has responsibilities and must act when needed to avoid collision. Learn the full applicable collision regulations and local requirements before sailing.'
],['Identify the windward side of each vessel before deciding its tack.','State the assumptions before applying a simplified crossing rule.'], 'Treating stand-on status as permission to ignore developing collision risk.',[
 q('In a basic two-sailing-vessel encounter on different tacks, which normally keeps clear?',['The starboard-tack yacht','Whichever yacht is larger','The port-tack yacht'],2,'Under the basic sailing-vessel rule, port tack keeps clear of starboard tack, subject to the full situation and other applicable rules.'),
 q('Does a stand-on vessel have no further responsibility?',['No; it must continue monitoring and act as required to avoid collision','Yes; it can close its eyes','Yes; the other vessel accepts all responsibility'],0,'Collision avoidance is an ongoing duty. The complete rules specify stand-on actions and responsibilities.')]);
lesson('seamanship','Lights, marks, and signals',[
 'Navigation lights and day shapes communicate a vessel’s type and activity, not just its direction. Red and green sidelights help identify which aspect you are seeing.',
 'In the international maneuvering-signal context, one short blast means altering course to starboard, two to port, and three operating astern propulsion. Restricted-visibility signals are a different system; local or inland rules may differ.',
 'This introductory lesson does not cover the full recognition syllabus. Before night or restricted-visibility operation, study and practice the complete applicable lights, shapes, and sound-signal rules.'
],['Identify the red port light and green starboard light on the yacht.','Distinguish an action signal from a signal used in restricted visibility.'], 'Assuming one memorized signal applies in every jurisdiction and situation.',[
 q('Which side normally carries the red sidelight?',['Starboard','Port','Both sides'],1,'The port sidelight is red; starboard is green.'),
 q('In the stated international maneuvering-signal context, two short blasts indicate…',['Turning to port','Turning to starboard','A complete fog-signal vocabulary'],0,'Two short blasts mean altering course to port in that context; do not generalize without checking the applicable rules.')]);
lesson('seamanship','Make a passage decision',[
 'A passage plan includes the crew, forecast, route, hazards, tidal constraints, daylight, safe havens, communications, and a latest turn-back time.',
 'Good seamanship includes changing or abandoning the plan when its assumptions fail. Do not let a fixed arrival promise outweigh safety margins.',
 'Scenario: you have a novice crew, fading daylight, a forecast wind increase, and an exposed destination. A nearby sheltered alternative is available.'
],['Name the factors that make the original destination less suitable.','Choose a conservative alternative and tell the crew why.'], 'Continuing because the destination was promised before conditions changed.',[
 q('For the stated scenario, which is the sounder decision?',['Press on to preserve the schedule','Ask the least experienced crew member to decide alone','Reassess and favor the sheltered alternative or an early return'],2,'Rising exposure and shrinking margins support a conservative change of plan.'),
 q('Which makes an abort plan useful?',['Clear decision points and viable alternatives','Leaving every decision until the last minute','A promise never to change course'],0,'Specific triggers and alternatives help avoid rushed decisions under pressure.')]);
lesson('harbor','Plan a docking approach',[
 'Docking combines wind, current, propeller effects, boat momentum, and crew coordination. Prepare fenders and lines, assign roles, choose an approach, and keep an escape route.',
 'Approach at the lowest speed that preserves the control you need. Never use a person’s body to stop the boat or put hands or feet between the yacht and dock.',
 'Boat systems includes ahead and reverse thrust, and the model estimates current. Prop walk, spring-line forces, and dock contact are not modeled. Docking is taught here as planning and decision-making; touching the visual dock is not an assessed docking skill.'
],['Describe your approach, crew jobs, and go-around plan before moving.','Explain why wind and current change a safe approach.'], 'Relying on crew to jump ashore or physically catch the yacht.',[
 q('If the approach becomes unstable, what should the preplanned option be?',['Ask someone to fend off with a foot','Abort and make a controlled new approach if safe','Add speed to get it over with'],1,'An escape plan is part of preparation; avoid trapping the boat or crew in an unrecoverable maneuver.'),
 q('Can arriving beside the rendered pontoon prove docking competence here?',['No; dock contact, spring lines, and crew tasks are not assessed','Yes, if the boat looks aligned','Yes, at any speed'],0,'A visual result without the relevant dynamics is not a valid skill assessment.')]);
lesson('harbor','Choose an anchorage',[
 'Choose shelter, suitable holding ground, adequate depth throughout the tidal range, and room to swing without reaching hazards or neighboring vessels.',
 'Scope compares the rode deployed with the vertical distance from bow roller to seabed. Required scope depends on rode, anchor, conditions, boat, and guidance; no single ratio guarantees holding.',
 'Example for arithmetic only: at 5 m water depth and a roller 1 m above water, an assumed 5:1 ratio gives 30 m of rode. This calculation is not a deployment prescription. Add tidal changes and assess swing room.'
],['Sketch the expected swing circle and nearby hazards.','Include roller height in the example’s vertical distance.'], 'Multiplying charted depth alone or assuming an anchor always holds once it touches bottom.',[
 q('Under the stated example assumptions, how much rode corresponds to 5:1?',['25 m','30 m','5 m'],1,'The vertical distance is 5 + 1 = 6 m. Five times 6 m is 30 m, before other real-world considerations.'),
 q('What must an anchorage plan consider beyond depth?',['Only the distance to a café','Only anchor color','Shelter, holding ground, tide, swing room, and hazards'],2,'Depth alone does not establish a suitable or safe anchorage.')]);
lesson('harbor','Stop, then anchor',[
 'A real anchoring approach is controlled and slow. The crew lowers the anchor and deploys rode deliberately, then checks that it has set and continues monitoring position.',
 'The rode target is a command, not the length in the water. Check actual paid-out rode in Systems. Lowering runs at a modeled 24 metres per minute and retrieval at 15 metres per minute; these are illustrative powered rates.',
 'Lower sails and coast below 0.8 knots with the anchor stowed. Then set a 45 m rode target and run the windlass. It pays out gradually and stops at the target. Use Stop windlass to halt it and Run to target to continue. Wait for 45 m actually paid out, the windlass stopped, and ground speed below 0.2 knots. Deploying early invalidates the attempt.',
 'The 45 m target belongs to this prepared shallow-water exercise. Plan a real anchorage from its depth, tide, shelter, holding ground, and swing room. The model does not validate anchor setting in a particular seabed or represent full rode catenary.'
],['Reduce sail power well before the intended stopping point.','Wait for speed to fall before using the anchor control.'], 'Deploying the anchor at speed instead of completing a controlled approach.',[
 q('What is the correct sequence in this exercise?',['Anchor at full speed, then lower sails','Lower sails, slow with anchor up, then anchor','Ignore the speed display'],1,'The exercise checks anticipation and sequencing, not the anchor’s holding ability.'),
 q('Does the stopped position demonstrate that a real anchor is properly set?',['Yes','Only after 5 seconds','No; modeled holding cannot prove real anchor setting'],2,'Real anchoring requires checks of holding and ongoing monitoring.')],{setup:{x:681,z:428,heading:225,speed:2,trim:34,anchorRode:45},anchorOnlyAtEnd:true,steps:[step('Lower sails and coast below 0.8 knots, anchor up','coast',.8,3),{...step('Pay out 45 m, stop the windlass, and settle below 0.2 knots','anchor',true,4),minimumRode:45}],debrief:'You practiced a controlled stop and the correct simplified sequence. Real anchor setting is not assessed.'});
lesson('harbor','Prepare to leave',[
 'Before departure, recheck the surrounding area, intended route, conditions, and crew readiness. Make sure lines and equipment are secure and everyone knows what happens next.',
 'This exercise starts with 45 m of rode already paid out and the bow above the anchor. Select Weigh anchor and watch actual rode length reduce. The anchor remains deployed during retrieval. Wait until it is fully stowed before raising sails, then establish a steady reach.',
 'If the rode becomes taut while the boat is away from the anchor, retrieval pauses. In free sailing, move slowly toward the anchor to slacken the rode, then continue recovery. The windlass must not be used to tow the boat toward the anchor.',
 'In a real harbor, weigh-anchor and sail-hoisting plans depend on shelter, space, traffic, wind, engine availability, and the vessel. The simulator’s convenient setup is not a universal departure procedure.'
],['Confirm the wind and your intended course before releasing the hold.','Restore sail power, gain steerage, and make a controlled departure.'], 'Releasing the boat before having a clear plan and adequate room.',[
 q('What belongs before releasing the boat?',['Crew briefing, lookout, and a clear plan','A maximum-speed test','Looking at the route only after leaving'],0,'Preparation should precede the point at which the vessel is free to move.'),
 q('Is this open-water sail departure a method for every real anchorage?',['Yes','No; plan for the specific boat, space, and conditions','Only if a chartplotter is fitted'],1,'The exercise omits many constraints of actual anchorages and harbors.')],{setup:{x:649.667,z:459.333,heading:225,sails:0,anchor:true,anchorRode:45},steps:[step('Weigh anchor','anchor',false,1),step('Raise sails','sails',1,1),step('Maintain a reach above 2.5 knots','speedAbove',2.5,8)],debrief:'You restored movement deliberately and established control in a prepared practice area.'});
lesson('readiness','Person overboard priorities',[
 'Raise the alarm, maintain continuous visual contact, point to the person, and deploy appropriate flotation and marking equipment. Assign roles and call for help as the situation requires.',
 'A successful recovery includes getting the yacht safely back to the casualty, stopping in a suitable position, avoiding propeller injury, and lifting the person aboard. The precise maneuver depends on vessel, sail plan, conditions, and training.',
 'There is no person-overboard dynamics or recovery model here. This lesson checks priorities only. Practice a vessel-specific maneuver and recovery system with an instructor, using a training object rather than putting a person at risk.'
],['Assign a dedicated pointer who does not lose sight of the casualty.','Explain why returning alongside is only one part of recovery.'], 'Everyone looking at the controls while nobody keeps the casualty in sight.',[
 q('What is an immediate priority after the alarm?',['Everyone changes the chart scale','Keep visual contact and deploy appropriate flotation/marking aids','Wait to see whether the person swims back'],1,'Tracking and supporting the casualty are urgent while the crew organizes the recovery and help.'),
 q('Does reaching the casualty complete the task?',['Yes','Only in daylight','No; safe stopping, lifting aboard, and aftercare also matter'],2,'Recovery includes the difficult physical steps and casualty care, not just navigation.')]);
lesson('readiness','Distress and urgent action',[
 'Distress means grave and imminent danger requiring immediate assistance. Know the vessel’s communications equipment, local procedures, and how to give identity, position, nature of the emergency, and assistance needed.',
 'For an immediate life-threatening situation, use the appropriate distress facilities, such as DSC distress and a MAYDAY call on VHF channel 16 where applicable and available. Learn the equipment before departure and never transmit a real distress alert for practice.',
 'After a grounding, flooding, or fire, protect people, assess the situation, call for help as needed, and follow vessel-specific emergency procedures. Blindly applying power after grounding may worsen damage.'
],['Rehearse the information you would provide without transmitting.','Locate the simulated position and explain what a real rescue service needs.'], 'Giving a long story but omitting position, identity, or the kind of help needed.',[
 q('Which information is central to a distress message?',['Only the yacht’s paint color','Identity, position, danger, and assistance needed','A complete holiday itinerary'],1,'Clear essential information helps rescuers locate the vessel and prioritize a response.'),
 q('How should you practice an emergency radio message?',['Make a real distress transmission for realism','Trigger DSC distress without warning','Rehearse without transmitting, or use an authorized training setting'],2,'False distress alerts can divert real emergency resources.')]);
lesson('readiness','Your assessed first passage',[
 'Combine the course skills without rushing: establish a steady course, trim effectively, change tack through the bow, recover control, and slow to a planned stop.',
 'The simulator gives measured targets but no automatic steering. Each stage must be completed in order. Grounding or using the anchor before the final stopping stage invalidates the attempt.',
 'The final stage uses a prepared deep-water anchorage and a 180 m rode target. Wait for all 180 m to be paid out, the windlass to stop, and ground speed to fall below 0.2 knots. Allow about 15 minutes for the complete exercise. This target is specific to these training conditions.',
 'Passing demonstrates the selected modeled tasks in steady wind and open water. It does not establish real-world navigation, docking, emergency recovery, or skipper competence.'
],['Brief yourself on the sequence before selecting Begin practice.','Use the checklist and retain lookout while monitoring the instruments.'], 'Treating isolated skills as independent of lookout, sea room, and the next step.',[
 q('Which result counts as a successful simulated passage?',['High speed alone','Completing the stages in order while keeping the safety margins','Touching every control once'],1,'The assessment combines controlled performance, sequence, and maintained margins.'),
 q('If a task is invalidated, what is the right response?',['Restart, understand the cause, and practice again','Ignore the warning and claim a pass','Change the weather until the result is accepted'],0,'Reviewing the cause is part of learning; invalid attempts do not earn a pass.')],{setup:{x:100,z:220,heading:60,speed:3,trim:70,anchorRode:180},anchorOnlyAtEnd:true,steps:[step('Hold 045° ±5° above 2 knots','heading',45,10),step('Maintain efficient trim','trim',6,10),step('Tack through the bow and recover speed','tack',null,6,'From 045°, turn port through 315° and settle near 265°.'),step('Lower sails and coast below 0.8 knots','coast',.8,3),{...step('Pay out 180 m, stop the windlass, and settle below 0.2 knots','anchor',true,4),minimumRode:180}],debrief:'You linked steering, trimming, tacking, and stopping. Review any hints used and repeat with less assistance.'});
lesson('readiness','From simulation to the sea',[
 'Review the difference between explaining a task, performing it in this model, and performing it aboard a real yacht. Your course record separates theory checks from simulated practice and records the use of hints.',
 'The next step is supervised on-water training: preparation and equipment checks; knots and line handling; hoisting, trimming, reefing, tacking and gybing with crew; engine handling and docking; real anchoring; lookout and navigation; and person-overboard recovery.',
 'Choose an instructor and conditions appropriate to your experience. Bring your course record, explain the simulator’s limitations, and ask for an individual practical assessment. Course completion here is a learning milestone, not a license or safety certification.'
],['Review your record and identify the exercises where you used hints or repeated attempts.','Write down three real-world skills that still need supervised practice.'], 'Treating a completion badge as evidence that every real boat and condition can be handled safely.',[
 q('What should follow successful completion?',['Supervised on-water training and practical assessment','Immediate solo sailing in unfamiliar conditions','Assuming docking and rescue were already mastered'],0,'The course supports preparation; it does not replace real experience and instruction.'),
 q('Which important skills remain unassessed by this simulator?',['Reading the modeled heading','Loaded line handling, engine docking, and casualty recovery','Changing the camera'],1,'Those skills require forces, equipment, coordination, and conditions that this version does not model.')]);
lessons.find(lesson=>lesson.id==='sail-35').minutes=15;
modules.push(advancedModule);
lessons.push(...advancedLessons);
modules.push(marinaModule);
lessons.push(...marinaLessons);
modules.push(colregsModule);
lessons.push(...colregsLessons);
modules.push(catamaranModule);
lessons.push(...catamaranLessons);
modules.push(nightModule);
lessons.push(...nightLessons);
for(const scenario of decisionScenarios){const lesson=lessons.find(l=>l.id===scenario.lessonId);if(lesson){lesson.decisionScenarioId=scenario.id;lesson.decisionObjectiveIds=scenario.stages.map(stage=>stage.id);}}
// Supplemental pages retain the original general-purpose lesson diagrams.
for(const id of ['sail-04','sail-05']){const lesson=lessons.find(l=>l.id===id);lesson.conceptFigures={3:'app-compass',4:'app-compass'};lesson.quiz[2].figure='app-compass';}
const apparentWindLesson=lessons.find(l=>l.id==='sail-17');
apparentWindLesson.conceptFigures={5:'faster-than-wind'};
apparentWindLesson.quiz[3].figure='faster-than-wind';
apparentWindLesson.minutes=10;
apparentWindLesson.challengeId='apparent-wind-lab';
export {lessons};
