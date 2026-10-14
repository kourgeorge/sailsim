// Original teaching summaries checked against International COLREGs, 2026-10-02.
// Append-only IDs preserve existing saved course records.
export const colregsModule = {
  id: 'colregs',
  title: 'Give way and avoid collisions',
  outcome:
    'Identify the encounter, assign duties, act early, and keep checking until past and clear.',
};
export const colregsLessons = [
  {
    id: 'sail-46',
    rules: [2, 3, 7, 12, 13],
    title: 'Sailing encounters: tack, windward and overtaking',
    concepts: [
      'Before using the sailing rules, first ask three questions:\n• Are the vessels in sight of each other?\n• Is there a risk of collision?\n• Does overtaking, a narrow channel or a special vessel status change the case?\nThese sailing examples use International Rules with vessels in sight, in open water, and no special status. Both vessels keep a lookout and remain responsible for avoiding collision.',
      'Port and starboard belong to the boat when facing its bow. A yacht with the wind on its port side is on port tack; wind on starboard means starboard tack. For Rule 12, the windward side is the side opposite the mainsail. Check the mainsail, not just the headsail or where the other yacht appears on your screen.',
      'With collision risk on different tacks, the port-tack yacht keeps out of the way. On the same tack, the windward yacht (closer to where the wind comes from) keeps out of the way of the leeward (downwind) yacht, because it can usually bear away (turn away from the wind) more easily. If you are on port tack and see a vessel to windward whose tack you cannot determine with certainty, keep out of its way. This uncertainty rule is specific; it is not a rule that the yacht seen on your right always wins.',
      'Check overtaking before applying tack rules. You are overtaking when coming up from more than 22.5° abaft the other vessel’s beam (behind the line across its widest point): roughly from behind, in the 135° sector around its stern. At night this corresponds to seeing its sternlight but neither sidelight. Any overtaking vessel keeps clear of the vessel being overtaken, including a sailing yacht overtaking a motor vessel.',
      'If in doubt whether you are overtaking, assume that you are and act accordingly. The obligation continues until finally past and clear. Reaching abeam or changing relative bearing does not turn an established overtaking case into a crossing case.',
    ],
    observe: [
      'Identify each yacht’s tack from the mainsail before assigning roles.',
      'Draw the overtaking sector around the other vessel, not your own.',
    ],
    mistake: 'Applying the tack rule before checking whether you are overtaking.',
    quiz: [
      {
        prompt:
          'You are on port tack; the yacht to windward has an uncertain tack. What is required?',
        options: ['Keep out of its way', 'Assume it must give way', 'Wait until alongside'],
        correct: 0,
        explanation:
          'Rule 12(a)(iii) requires the port-tack vessel to keep clear in this stated uncertainty.',
      },
      {
        prompt: 'Your sailing yacht is overtaking a motor vessel. When does your duty end?',
        options: [
          'As soon as you are abeam',
          'When finally past and clear',
          'As soon as your sails fill',
        ],
        correct: 1,
        explanation:
          'Rule 13 overrides the simple sail-versus-power comparison and continues through the whole overtaking encounter.',
      },
    ],
    module: 'colregs',
    level: 'advanced',
    sub: 'Identify the encounter, assign duties, act early, and keep checking until past and clear.',
    minutes: 12,
    prerequisite: 'sail-45',
    type: 'Theory & decisions',
    practice: null,
    transfer:
      'Study the cited International COLREG rules and the rules applicable to your waters. Rehearse these decisions with an instructor; diagrams assess reasoning, not real collision-avoidance competence.',
    sources: ['uscg-rules', 'imo-colregs'],
    body: 'Before using the sailing rules, first ask three questions:\n• Are the vessels in sight of each other?\n• Is there a risk of collision?\n• Does overtaking, a narrow channel or a special vessel status change the case?\nThese sailing examples use International Rules with vessels in sight, in open water, and no special status. Both vessels keep a lookout and remain responsible for avoiding collision.',
    goal: 'Read the briefing and check your understanding',
    tip: 'Identify each yacht’s tack from the mainsail before assigning roles.',
  },
  {
    id: 'sail-47',
    rules: [3, 13, 14, 15, 18, 23, 25],
    title: 'Under engine: head-on, crossing and mixed encounters',
    concepts: [
      'A boat counts as a sailing vessel only when it is under sail and its engine is not pushing it (Rule 3). A yacht driven by its engine is power-driven even with sails raised. An engine running only to charge batteries does not, on its own, mean the engine is driving the boat. State how the boat is actually being driven before choosing a rule.',
      'When two power-driven vessels in sight cross with collision risk, the one with the other on its starboard side gives way. In plain words: if you see the other boat on your right, you give way, usually by turning right and passing behind it, not crossing ahead if you can avoid it. The other vessel at first keeps its course and speed (Rule 17). Reverse the viewpoint: a contact on A’s starboard can see A on its port side.',
      'When two power-driven vessels with collision risk head straight at each other, bow to bow or nearly so, both turn to starboard. They then pass port-to-port. If both turn right, they always turn away from each other. If in doubt whether this head-on situation exists, assume it does and act accordingly. This is the power-driven head-on rule; do not apply it automatically to two sailing vessels.',
      'In an ordinary in-sight encounter, a power-driven vessel underway keeps out of the way of a sailing vessel. First check the exceptions: narrow channels, traffic lanes and overtaking (Rules 9, 10 and 13), and any special vessel status. A sailing yacht overtaking a motorboat still keeps clear; a yacht using engine propulsion does not claim sailing-vessel status. Vessel size alone does not decide these ordinary encounters.',
      '“Underway” means not at anchor, not made fast to the shore and not aground; a vessel drifting with her engine stopped is still underway. Status matters more than motion: a stopped power-driven vessel that is underway keeps her give-way duties.',
      'Two less common vessels need a second look. A hovercraft running on its air cushion shows an all-round flashing yellow light as well as power-driven lights, and it can be fast. A rowing boat may show sailing-vessel lights or keep a white torch ready to show in time. The International Rules give rowing boats no place of their own in the give-way order, but they are slow and low in the water, so keep clear of them early.',
    ],
    observe: [
      'Describe the same crossing from A and B before choosing who acts.',
      'Check whether the engine is actually propelling the yacht.',
    ],
    mistake:
      'Treating raised sails as proof of sailing-vessel status while using engine propulsion.',
    quiz: [
      {
        prompt:
          'Your engine is propelling the yacht and the mainsail is raised. Which status applies?',
        options: ['Sailing vessel', 'Power-driven vessel', 'Whichever status is more favorable'],
        correct: 1,
        explanation:
          'Machinery is providing propulsion, so Rule 3 defines this as a power-driven vessel.',
      },
      {
        prompt: 'Two power-driven vessels meet head-on with collision risk. Who alters course?',
        options: ['Only the smaller vessel', 'Both to port', 'Both to starboard'],
        correct: 2,
        explanation: 'Rule 14 requires both to alter to starboard for a port-to-port passing.',
      },
      {
        prompt: 'Above a power-driven vessel’s lights you see an all-round flashing yellow light. What is it?',
        options: ['A pilot vessel on duty', 'A hovercraft on its air cushion', 'A sailing yacht under engine'],
        correct: 1,
        explanation:
          'Rule 23 gives an air-cushion vessel in non-displacement mode an all-round flashing yellow light. Treat it as a fast power-driven vessel.',
      },
    ],
    module: 'colregs',
    level: 'advanced',
    sub: 'Identify the encounter, assign duties, act early, and keep checking until past and clear.',
    minutes: 14,
    conceptFigures: {
      5: 'status-lights:hovercraft',
    },
    localNotes: [
      {
        page: 5,
        region: 'israel',
        text: 'The Israeli boat operator licence material expects motorboats and sailing boats alike to give way to rowing boats. Check the current Israeli regulations.',
      },
    ],
    prerequisite: 'sail-46',
    type: 'Theory & decisions',
    practice: null,
    transfer:
      'Study the cited International COLREG rules and the rules applicable to your waters. Rehearse these decisions with an instructor; diagrams assess reasoning, not real collision-avoidance competence.',
    sources: ['uscg-rules', 'imo-colregs'],
    body: 'A boat counts as a sailing vessel only when it is under sail and its engine is not pushing it (Rule 3). A yacht driven by its engine is power-driven even with sails raised. An engine running only to charge batteries does not, on its own, mean the engine is driving the boat. State how the boat is actually being driven before choosing a rule.',
    goal: 'Read the briefing and check your understanding',
    tip: 'Describe the same crossing from A and B before choosing who acts.',
  },
  {
    id: 'sail-48',
    rules: [2, 5, 6, 7, 8, 16, 17],
    title: 'Give-way and stand-on: act as risk develops',
    concepts: [
      'Spot collision risk early, so you know in time whether you must give way or stand on. The give-way vessel must keep out of the way; the stand-on vessel keeps going. Keep a lookout by sight, hearing and all appropriate available means, at a safe speed for visibility, traffic, maneuverability and conditions. A closing vessel on a nearly constant compass bearing (the direction to it) signals risk. A changing bearing does not always rule it out, especially at close range or with large vessels or tows. If in doubt, assume risk exists.',
      'As the give-way boat, act early and boldly so the other boat can see you are keeping clear. Make a large, obvious change of course or speed, because small changes look like no change from the other boat (Rule 8). Avoid a series of small changes. Before you turn, check your sea room (open water around you) and other traffic. If needed, slow down, stop or reverse the engine to avoid collision or to gain time to judge the situation. Then keep watching until you are finally past and clear.',
      'The stand-on boat\'s duty grows in three stages as the danger grows (Rule 17). Start weighing your options early; do not wait for the last stage. The stages:\n• At first, keep your course and speed, so the other boat can predict you.\n• Once it is clear the give-way boat is not acting properly, you may act on your own.\n• When so close that the give-way boat alone can no longer avoid collision, you must act in the way that best helps avoid it.',
      'When two power boats cross and you stand on but act, avoid turning left (to port) toward a boat on your left. This applies when two power-driven vessels cross and you, the stand-on boat, act alone because the other is not giving way (Rule 17(a)(ii)). Where possible, do not alter to port for a vessel on your own port side, because if she does finally turn to starboard (right), as the rules expect, your turn to port would carry you into her. This is a specific limit, not an order to turn right in every emergency. The give-way vessel must still keep clear even when you act.',
      'There is no fixed safe passing distance, so judge each situation and keep checking. There is also no last-second turning point that always works. You stay responsible for ordinary good seamanship and for special circumstances (Rule 2). You may break a rule only when you must, to avoid a danger that is about to happen (Rule 2). Being the stand-on boat never gives you an unconditional right to collide.',
    ],
    observe: [
      'Describe what changes for the stand-on boat between “may act” and “must act.”',
      'After a maneuver, check the new bearing, the range (distance) and the surrounding traffic.',
    ],
    mistake:
      'Keeping course and speed as the stand-on boat when the other vessel alone can no longer prevent a collision.',
    quiz: [
      {
        prompt:
          'The give-way vessel is clearly not acting properly. May the stand-on vessel act before collision becomes unavoidable by the give-way vessel alone?',
        options: [
          'Yes, under Rule 17(a)(ii)',
          'No, it must always wait',
          'Only with radio permission',
        ],
        correct: 0,
        explanation:
          'The permission to act comes earlier than the final duty to act. Keep judging the full situation.',
      },
      {
        prompt: 'You have made a turn to avoid another vessel. What completes the response?',
        options: [
          'Stop watching the other vessel',
          'Check that it works until you are past and clear',
          'Assume the turn removed every risk',
        ],
        correct: 1,
        explanation:
          'Rule 8 requires you to check the effect of your maneuver and pass at a safe distance, without creating another close-quarters situation.',
      },
    ],
    module: 'colregs',
    level: 'advanced',
    sub: 'Identify the encounter, assign duties, act early, and keep checking until past and clear.',
    minutes: 12,
    prerequisite: 'sail-47',
    type: 'Theory & decisions',
    practice: null,
    transfer:
      'Study the cited International COLREG rules and the rules applicable to your waters. Rehearse these decisions with an instructor; diagrams assess reasoning, not real collision-avoidance competence.',
    sources: ['uscg-rules', 'imo-colregs'],
    body: 'Spot collision risk early, so you know in time whether you must give way or stand on. The give-way vessel must keep out of the way; the stand-on vessel keeps going. Keep a lookout by sight, hearing and all appropriate available means, at a safe speed for visibility, traffic, maneuverability and conditions. A closing vessel on a nearly constant compass bearing (the direction to it) signals risk. A changing bearing does not always rule it out, especially at close range or with large vessels or tows. If in doubt, assume risk exists.',
    goal: 'Read the briefing and check your understanding',
    tip: 'Describe what changes for the stand-on boat between “may act” and “must act.”',
  },
  {
    id: 'sail-49',
    rules: [3, 8, 9, 10, 18, 26, 27, 28, 34],
    title: 'Special vessels, narrow channels and traffic lanes',
    concepts: [
      'Judge a vessel by what it can actually do, not by how big it looks. Confirm her status from the right lights, shapes and the situation. Three special kinds matter here:\n• Not under command: exceptional circumstances (such as a steering failure) stop her maneuvering as the rules require.\n• Restricted in ability to maneuver: her work, such as dredging, limits how she can follow the rules.\n• Engaged in fishing: her gear (nets or lines) limits her maneuvering; recreational trolling that does not do this does not count.',
      'Vessels that cannot easily turn or stop get room from vessels that can. An ordinary sailing vessel underway (not anchored, tied up or aground) keeps clear of vessels not under command, restricted in ability to maneuver, and engaged in fishing. An ordinary power-driven vessel (one using an engine) also keeps clear of sailing vessels. Narrow channels, traffic lanes and overtaking can change this order (Rules 9, 10 and 13). A vessel constrained by her draught (a deep ship that must stay in deep water) shows special signals. All vessels except those not under command or restricted in ability to maneuver should, where possible, avoid impeding her (getting in her way) by moving early (International Rule 18(d)). She still navigates with particular caution. When both vessels have a special status, for example one not under command and one restricted in ability to maneuver, the rules give neither priority, so both act to avoid collision.',
      'In a narrow channel, keep as near the starboard (right-hand) edge as is safe and practicable. A sailing vessel or a vessel under 20 m (about 65 feet) must not impede a vessel that can safely navigate only within the channel, because the big ship has nowhere else to go (Rule 9). Do not cross if that would impede such a vessel. Fishing vessels must not impede other vessels navigating the channel. Approach bends you cannot see around with particular alertness and caution. Where possible, do not anchor in the channel.',
      'A traffic separation scheme is a set of one-way shipping lanes, like a motorway, so follow your lane\'s direction. These schemes, adopted by the International Maritime Organization (IMO), have a central strip between lanes, the separation zone. Join or leave a lane from the side at a small angle. Avoid crossing if you can. If you must cross, keep your heading (where your bow points) as nearly as practicable at right angles to the traffic flow, so you leave the lane fastest and ships see clearly what you are doing. This means heading, not a ground track corrected for current. Sailing vessels and vessels under 20 m must not impede power-driven vessels following a lane. Stay out of separation zones except as the rules allow (Rule 10).',
      '“Do not impede” means acting early to leave plenty of sea room, before any risk of collision develops. The duty continues if risk does develop, and both vessels must then also follow the collision-avoidance rules. A traffic lane does not give a ship an unconditional right of way. Check local harbor directions, charts and notices as well as the International Rules.',
      'In a narrow channel, ask by whistle before overtaking (passing a slower vessel ahead). You do this when you can pass safely only if the vessel ahead moves over. A prolonged blast lasts 4 to 6 seconds; a short blast about 1 second. The signals (Rule 34(c)):\n• Two prolonged, one short: “I intend to overtake you on your starboard side.”\n• Two prolonged, two short: “I intend to overtake you on your port (left) side.”\n• Prolonged, short, prolonged, short: the vessel ahead agrees and makes room.\n• At least five short rapid blasts: the vessel ahead doubts it is safe.',
      'A dredger or underwater work vessel shows which side is blocked and which side you may pass. Her work may block one side. On the blocked side she shows two all-round red lights (seen from every direction), or two black balls by day. On the side where you may pass, she shows two all-round green lights, or two black diamonds by day. These come with her red-white-red lights or ball-diamond-ball shapes, the signal for restricted in ability to maneuver.',
      'Fishing gear reaching more than 150 m out is marked on the side where it extends. 150 m is about one and a half football pitches. As well as her fishing lights, the vessel shows an all-round white light, or by day a cone point up, in the direction of the gear. Pass on the other side, well clear of the gear, because nets and lines can catch your keel or propeller.',
    ],
    observe: [
      'Tell apart a vessel restricted by her work from one that is simply large.',
      'For a traffic-lane crossing, compare your heading with your course over ground (your actual path, which current can push sideways).',
    ],
    mistake:
      'Using “sail has priority” as a reason to cross ahead of a ship that can navigate safely only in the channel.',
    quiz: [
      {
        prompt:
          'Your sailing yacht would impede a ship that can safely navigate only in this narrow channel. What is required?',
        options: [
          'Cross because you are sailing',
          'Act early so you do not impede its passage',
          'Wait for a radio demand',
        ],
        correct: 1,
        explanation:
          'Rule 9 requires a sailing vessel not to impede such a ship; this duty does not depend on a radio call.',
      },
      {
        prompt:
          'When you must cross a traffic lane, what should be nearly at right angles to the traffic flow?',
        options: ['Heading', 'Ground track regardless of heading', 'The boom'],
        correct: 0,
        explanation: 'Rule 10(c) specifies heading. Current can make your track over the ground differ.',
      },
      {
        prompt:
          'In a narrow channel, the vessel ahead hears two prolonged and two short blasts from astern (behind). What do they mean?',
        options: [
          'The vessel astern intends to overtake on the port side',
          'The vessel astern is in distress',
          'The vessel astern intends to overtake on the starboard side',
        ],
        correct: 0,
        explanation:
          'Under Rule 34(c), two prolonged and one short ask to pass on the starboard side; two prolonged and two short, on the port side. The vessel ahead agrees with prolonged-short-prolonged-short, or sounds five short blasts if in doubt.',
      },
    ],
    module: 'colregs',
    level: 'advanced',
    sub: 'Identify the encounter, assign duties, act early, and keep checking until past and clear.',
    minutes: 16,
    conceptFigures: {
      6: 'status-lights:dredger',
      7: 'status-lights:gear',
    },
    prerequisite: 'sail-48',
    type: 'Theory & decisions',
    practice: null,
    transfer:
      'Study the cited International COLREG rules and the rules applicable to your waters. Rehearse these decisions with an instructor; diagrams assess reasoning, not real collision-avoidance competence.',
    sources: ['uscg-rules', 'imo-colregs'],
    body: 'Judge a vessel by what it can actually do, not by how big it looks. Confirm her status from the right lights, shapes and the situation. Three special kinds matter here:\n• Not under command: exceptional circumstances (such as a steering failure) stop her maneuvering as the rules require.\n• Restricted in ability to maneuver: her work, such as dredging, limits how she can follow the rules.\n• Engaged in fishing: her gear (nets or lines) limits her maneuvering; recreational trolling that does not do this does not count.',
    goal: 'Read the briefing and check your understanding',
    tip: 'Tell apart a vessel restricted by her work from one that is simply large.',
  },
  {
    id: 'sail-50',
    rules: [20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 32, 34, 35],
    title: 'Read lights, shapes and sound signals',
    concepts: [
      'Each light shines over only part of the circle, so the lights you see show which way a boat faces. Red is the port (left) sidelight and green the starboard (right) one. Each covers 112.5°, from dead ahead to 22.5° abaft the beam (just behind the side). The white sternlight covers the remaining 135° astern; the white masthead light covers 225° ahead. Red and green together mean she is heading at you. One white light alone might be a sternlight, anchor light or another permitted light: it proves neither vessel type nor absence of risk.',
      'A boat\'s normal lights and shapes depend on what she is doing:\n• Sailing vessel: sidelights and a sternlight (small-vessel options and exceptions depend on length).\n• Power-driven vessel: adds the required masthead light or lights.\n• Under sail and engine together: a black cone, point down, by day.\n• At anchor: the required all-round white light or lights (seen from every direction), and a black ball by day, with length and location exceptions.\nA sailing vessel may also show an optional pair of all-round lights at the masthead, red over green (“red over green, sailing machine”). She may not show them together with a combined masthead lantern (red, green and white in one lantern at the top of the mast). Study the complete arrangements before sailing at night.',
      'Some lights and shapes show a special status; read them from top to bottom:\n• Not under command (cannot maneuver as needed): two all-round red lights, or two black balls by day.\n• Restricted in ability to maneuver (her work limits her movement): red-white-red, or ball-diamond-ball.\n• Fishing other than trawling: red over white.\n• Trawling (dragging a net): green over white.\n• Constrained by draught (too deep to leave deep water): three all-round red lights, or a cylinder.\nFishing day shapes are two cones with points together. These are status signals, so navigation lights may also be needed. The next pages add large, anchored, aground, towing, pilot and diving vessels.',
      'Lights are shown from sunset to sunrise and whenever visibility is restricted. That includes daytime fog or heavy rain. Shapes are shown by day. During those hours, show no other lights that could be mistaken for navigation lights or spoil the lookout, because they can hide the real pattern. An ordinary yacht or motorboat with no special status has no day shape to show.',
      'Large power-driven vessels show two masthead lights, which also show which way they point. A power-driven vessel 50 m or longer (about the length of an Olympic pool) shows two, the after (rear) one higher than the forward one. When the two lights line up vertically, she is pointing toward you or away from you. A vessel under 50 m may show only one. A vessel restricted in ability to maneuver adds masthead lights, sidelights and a sternlight to her red-white-red only while making way (actually moving through the water).',
      'Anchored vessels show all-round white lights at night and one black ball by day. A vessel under 50 m shows one all-round white light where it can best be seen. A vessel of 50 m or more shows two: one forward and a lower one at or near the stern. The black ball is shown forward. A vessel of 100 m or more also lights her decks, so a brightly lit ship that is not moving may well be at anchor.',
      'A vessel aground warns you about the ship and about shallow water nearby. A vessel aground (stuck on the bottom) shows her anchor lights plus two all-round red lights in a vertical line; by day, three black balls in a vertical line. The depth there was too little for her, so it may be too little for you.',
      'A towing vessel adds masthead lights and a yellow towing light. A power-driven vessel towing astern (pulling the tow behind her) shows two masthead lights in a vertical line. She shows three when the tow is longer than 200 m (about two football pitches), measured from her stern to the end of the tow. She also shows sidelights, a sternlight and a yellow towing light above the sternlight. The towed vessel shows sidelights and a sternlight. Only when the tow is longer than 200 m do both show a black diamond by day. Never pass between a tug and its tow, because the towline can be hidden low in the water.',
      'An ordinary tug and tow is a power-driven vessel, so it keeps out of the way of a sailing vessel. It follows the normal crossing and head-on rules. A vessel pushing ahead or towing alongside (the tow tied to her side) shows two masthead lights, sidelights and a sternlight, but no yellow towing light. If towing work severely restricts her ability to change course, the tug also shows red-white-red, or ball-diamond-ball by day. Then other vessels, including sailing vessels, keep out of her way.',
      'A pilot vessel on duty shows two all-round lights at the masthead, white over red. A pilot is a local expert who boards ships to guide them in; a memory aid is “white over red, pilot ahead.” Underway (not anchored, moored or aground), she adds sidelights and a sternlight; at anchor, her anchor lights. Ships slow down and maneuver near a pilot station to take on a pilot, so expect sudden changes there.',
      'A vessel supporting divers shows code flag A by day and red-white-red at night. The flag is a rigid copy at least 1 m high, white and blue with a swallow-tailed end (a V-shaped notch at the free end). At night she shows the restricted-in-ability-to-maneuver lights, red-white-red. Divers may be in the water anywhere around her, so keep well clear and slow down.',
      'Power-driven vessels that can see each other signal their maneuvers with horn blasts:\n• One short blast: altering to starboard.\n• Two short blasts: altering to port.\n• Three short blasts: operating astern propulsion (engine in reverse).\n• At least five short rapid blasts: doubt about the other\'s intentions, or whether she is doing enough.\nA short blast lasts about one second; a prolonged blast, four to six seconds. These come from a power-driven vessel underway, maneuvering with vessels in sight (International Rule 34). Three blasts do not necessarily mean she is already moving backward. Near a blind channel bend, sound one prolonged blast; an approaching vessel within hearing answers with one prolonged blast.',
      'In fog, vessels sound a different set of signals, at intervals of no more than two minutes. A power-driven vessel making way sounds one prolonged blast. Underway but stopped and making no way, she sounds two prolonged blasts about two seconds apart. A manned towed vessel, the last of the tow, sounds one prolonged and three short right after the tug\'s signal. One prolonged then two short is sounded by:\n• a sailing vessel\n• a vessel not under command, or restricted in ability to maneuver\n• a vessel constrained by draught, or engaged in fishing\n• a vessel towing or pushing\nSo that signal does not identify a sailing vessel alone. Rule 35 specifies other cases and small-vessel exceptions; International and inland signals can differ.',
    ],
    observe: [
      'Name the full observed light pattern before inferring vessel status.',
      'Separate in-sight maneuvering signals from fog signals.',
    ],
    mistake:
      'Identifying a vessel from one color or treating a fog signal as a turning instruction.',
    quiz: [
      {
        prompt: 'Two vessels can see each other. Under International Rule 34, three short blasts mean…',
        options: ['Operating astern propulsion', 'Already moving astern', 'Claiming priority'],
        correct: 0,
        explanation:
          'The signal says her engine is working astern (in reverse). It does not guarantee she is already moving backward through the water.',
      },
      {
        prompt: 'In fog you hear one prolonged and two short blasts. What can you conclude?',
        options: [
          'Definitely a sailing yacht',
          'It is turning to port',
          'Several categories use this signal; identity remains uncertain',
        ],
        correct: 2,
        explanation:
          'Under Rule 35, sailing vessels and several special vessel types all use this pattern. Keep assessing the risk.',
      },
      {
        prompt: 'At night you see white anchor lights and two all-round red lights in a vertical line. What is it?',
        options: ['A vessel not under command making way', 'A vessel aground', 'A vessel towing'],
        correct: 1,
        explanation:
          'Anchor lights plus two vertical reds mean aground; by day she shows three black balls. Expect shallow water nearby.',
      },
      {
        prompt: 'A tug and the vessel she tows both show a black diamond by day. What does the diamond tell you?',
        options: [
          'The tow is longer than 200 m',
          'The tug is restricted in ability to maneuver',
          'Both vessels are at anchor',
        ],
        correct: 0,
        explanation:
          'Rule 24 adds the diamond, and a third masthead light at night, only when the tow is longer than 200 m. A shorter tow needs no day shape.',
      },
    ],
    module: 'colregs',
    level: 'advanced',
    sub: 'Identify the encounter, assign duties, act early, and keep checking until past and clear.',
    minutes: 20,
    // Status pages show the lights-and-shapes card with that pattern highlighted.
    conceptFigures: {
      1: 'status-lights:sailing',
      2: 'status-lights:status',
      3: 'status-lights:when',
      4: 'status-lights:large',
      5: 'status-lights:anchored',
      6: 'status-lights:aground',
      7: 'status-lights:tow',
      8: 'status-lights:push',
      9: 'status-lights:pilot',
      10: 'status-lights:diving',
    },
    localNotes: [
      {
        page: 10,
        region: 'israel',
        text: 'The Israeli boat operator licence material expects you to keep at least 200 m from a vessel showing the diving flag. Check the current Israeli regulations before you rely on a distance.',
      },
    ],
    prerequisite: 'sail-49',
    type: 'Theory & decisions',
    practice: null,
    transfer:
      'Study the cited International COLREG rules and the rules applicable to your waters. Rehearse these decisions with an instructor; diagrams assess reasoning, not real collision-avoidance competence.',
    sources: ['uscg-rules', 'imo-colregs'],
    body: 'Each light shines over only part of the circle, so the lights you see show which way a boat faces. Red is the port (left) sidelight and green the starboard (right) one. Each covers 112.5°, from dead ahead to 22.5° abaft the beam (just behind the side). The white sternlight covers the remaining 135° astern; the white masthead light covers 225° ahead. Red and green together mean she is heading at you. One white light alone might be a sternlight, anchor light or another permitted light: it proves neither vessel type nor absence of risk.',
    goal: 'Read the briefing and check your understanding',
    tip: 'Name the full observed light pattern before inferring vessel status.',
  },
  {
    id: 'sail-51',
    rules: [2, 5, 6, 7, 8, 19, 35],
    title: 'Restricted visibility and a complete encounter plan',
    concepts: [
      'First decide which set of rules applies; only then decide who gives way. When vessels cannot see each other and are in or near restricted visibility (fog, heavy rain or similar), International Rule 19 applies. Then do not give an unseen contact (a vessel detected but not seen) the ordinary in-sight roles, such as sail before power or the crossing rules. If you can see each other, use the in-sight rules, still allowing for the visibility and your general duties.',
      'In poor visibility, go at a safe speed and keep a lookout, so you can stop or turn in time. A power-driven vessel keeps engines ready for immediate maneuver. Use the required sound signals and your equipment correctly. Avoid conclusions from scanty radar information: one or two glimpses cannot show another boat\'s course. AIS (ships broadcasting position and course) and radio do not replace lookout, give a complete traffic picture or cancel the rules.',
      'If a vessel shows only on radar, judge the risk early and act in good time. Work out whether close quarters (getting dangerously close) or collision risk is developing. If you alter course, as far as possible do not turn to port (left) for a vessel forward of the beam (ahead of your side), unless you are overtaking her. Also avoid turning toward a vessel abeam or abaft the beam (beside or behind you) (Rule 19(d)). No single turn is always safe, so check all contacts, sea room (space to maneuver) and speed options.',
      'If a fog signal seems to come from forward of the beam, slow right down. Go at the lowest speed that still keeps your course. Do the same if you cannot avoid getting close to a vessel forward of the beam. This applies unless you are already sure there is no risk of collision. Take all way off (stop in the water) if needed, and navigate with extreme caution until the danger is over (Rule 19(e)). Do not hold cruising speed waiting to see the vessel, because you cannot yet tell where she is going.',
      'Use the same five steps in every exercise, in this order:\n• Observe and assess the risk.\n• Establish the visibility, how each vessel is driven, her status and local limits.\n• Check for overtaking before the ordinary encounter roles.\n• Choose timely action that does not create another danger.\n• Keep checking the result until you are past and clear.\nStart the assessment again whenever conditions change. These lessons teach core International encounter reasoning, not the complete lights syllabus, local law or a qualification for unsupervised navigation.',
    ],
    observe: [
      'State explicitly whether the contact is visually in sight or detected only by instruments.',
      'Reassess a closing contact after each new observation; a plan alone does not remove risk.',
    ],
    mistake: 'Assigning automatic sailing priority to a contact that is not in sight in fog.',
    quiz: [
      {
        prompt:
          'In fog, another vessel is detected by radar but not seen. Which framework applies?',
        options: [
          'Automatic sail-over-power priority',
          'Rule 19 plus the general duties that apply',
          'No rules until you can see her',
        ],
        correct: 1,
        explanation:
          'The rules for vessels not in sight in restricted visibility apply; you cannot simply assign the ordinary in-sight roles.',
      },
      {
        prompt:
          'A fog signal seems to come from forward of your beam, and you have not made sure there is no risk. What must you do?',
        options: [
          'Keep speed until you see the vessel',
          'Turn to port immediately in every case',
          'Slow to the lowest speed that keeps your course; take all way off if needed',
        ],
        correct: 2,
        explanation:
          'Rule 19(e) requires this slowdown and extreme caution until the danger of collision is over.',
      },
    ],
    module: 'colregs',
    level: 'advanced',
    sub: 'Identify the encounter, assign duties, act early, and keep checking until past and clear.',
    minutes: 12,
    prerequisite: 'sail-50',
    type: 'Theory & decisions',
    practice: null,
    transfer:
      'Study the cited International COLREG rules and the rules applicable to your waters. Rehearse these decisions with an instructor; diagrams assess reasoning, not real collision-avoidance competence.',
    sources: ['uscg-rules', 'imo-colregs'],
    body: 'First decide which set of rules applies; only then decide who gives way. When vessels cannot see each other and are in or near restricted visibility (fog, heavy rain or similar), International Rule 19 applies. Then do not give an unseen contact (a vessel detected but not seen) the ordinary in-sight roles, such as sail before power or the crossing rules. If you can see each other, use the in-sight rules, still allowing for the visibility and your general duties.',
    goal: 'Read the briefing and check your understanding',
    tip: 'State explicitly whether the contact is visually in sight or detected only by instruments.',
  },
];
