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
      'First establish whether the vessels are in sight, whether collision risk exists, and whether overtaking, a narrow channel or special vessel status changes the case. These sailing examples use International Rules with vessels in sight, in open water, and no special status. Both vessels keep a lookout and remain responsible for avoiding collision.',
      'Port and starboard belong to the boat when facing its bow. A yacht with the wind on its port side is on port tack; wind on starboard means starboard tack. For Rule 12, the windward side is the side opposite the mainsail. Check the mainsail, not just the headsail or where the other yacht appears on your screen.',
      'With collision risk on different tacks, the port-tack yacht keeps out of the way. On the same tack, the windward yacht keeps out of the way of the leeward yacht, because it can usually bear away more easily. If you are on port tack and see a vessel to windward whose tack you cannot determine with certainty, keep out of its way. This uncertainty rule is specific; it is not a rule that the yacht seen on your right always wins.',
      'Check overtaking before applying tack rules. You are overtaking when coming up from more than 22.5° abaft the other vessel’s beam: the 135° sector around its stern. At night this corresponds to seeing its sternlight but neither sidelight. Any overtaking vessel keeps clear of the vessel being overtaken, including a sailing yacht overtaking a motor vessel.',
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
    body: 'First establish whether the vessels are in sight, whether collision risk exists, and whether overtaking, a narrow channel or special vessel status changes the case. These sailing examples use International Rules with vessels in sight, in open water, and no special status. Both vessels keep a lookout and remain responsible for avoiding collision.',
    goal: 'Read the briefing and check your understanding',
    tip: 'Identify each yacht’s tack from the mainsail before assigning roles.',
  },
  {
    id: 'sail-47',
    rules: [3, 13, 14, 15, 18, 23, 25],
    title: 'Under engine: head-on, crossing and mixed encounters',
    concepts: [
      'A sailing vessel under Rule 3 is under sail with propelling machinery, if fitted, not being used. A yacht propelled by its engine is power-driven even with sails raised. An engine merely running to charge batteries does not alone establish propulsion by machinery. State the actual propulsion before choosing a rule.',
      'For two power-driven vessels in sight crossing with collision risk, the vessel with the other on her starboard side keeps out of the way and, if circumstances admit, avoids crossing ahead. The other vessel initially keeps course and speed under Rule 17. Reverse the viewpoint: a contact on A’s starboard can see A on its port side.',
      'For two power-driven vessels meeting on reciprocal or nearly reciprocal courses with collision risk, both alter to starboard so they pass port-to-port. If both turn right, they always turn away from each other. If in doubt whether this head-on situation exists, assume it does and act accordingly. This is the power-driven head-on rule; do not apply it automatically to two sailing vessels.',
      'In an ordinary in-sight encounter, a power-driven vessel underway keeps out of the way of a sailing vessel. First check the exceptions in Rules 9, 10 and 13 and any special vessel status. A sailing yacht overtaking a motorboat still keeps clear; a yacht using engine propulsion does not claim sailing-vessel status. Vessel size alone does not decide these ordinary encounters.',
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
    body: 'A sailing vessel under Rule 3 is under sail with propelling machinery, if fitted, not being used. A yacht propelled by its engine is power-driven even with sails raised. An engine merely running to charge batteries does not alone establish propulsion by machinery. State the actual propulsion before choosing a rule.',
    goal: 'Read the briefing and check your understanding',
    tip: 'Describe the same crossing from A and B before choosing who acts.',
  },
  {
    id: 'sail-48',
    rules: [2, 5, 6, 7, 8, 16, 17],
    title: 'Give-way and stand-on: act as risk develops',
    concepts: [
      'Keep a lookout by sight, hearing and all appropriate available means. Use safe speed for visibility, traffic, maneuverability and conditions. A closing vessel on a nearly constant compass bearing signals risk; bearing change does not always rule it out, especially at close range or with large vessels or tows. If in doubt, assume risk exists.',
      'The give-way vessel takes early and substantial action to keep well clear. Make course or speed changes readily apparent when circumstances allow; avoid a succession of small changes: the other vessel must be able to see that you are acting, and small changes look like no change. Check sea room and other traffic before maneuvering. Slow, stop or reverse propulsion if needed to avoid collision or gain assessment time, then monitor until finally past and clear.',
      'Rule 17 has three stages. Initially the stand-on vessel keeps course and speed. It may act by its maneuver alone as soon as it becomes apparent that the give-way vessel is not taking appropriate action. When so close that collision cannot be avoided by the give-way vessel’s action alone, it must take the action that best helps avoid collision. Do not wait for that final stage to start assessing options.',
      'In a crossing between two power-driven vessels, a stand-on vessel acting under Rule 17(a)(ii) shall, if circumstances admit, not alter to port for a vessel on its own port side. This is a specific restriction, not a universal instruction to turn right in every emergency. The give-way vessel remains obliged to keep clear even when the stand-on vessel acts.',
      'There is no universal safe passing distance or last-second turning point. Judge the full circumstances and keep reassessing. Rule 2 retains responsibility for ordinary seamanship and special circumstances; departure from the rules is justified only when necessary to avoid immediate danger. Stand-on status never means an unconditional right to collide.',
    ],
    observe: [
      'Describe what changes between “may act” and “must act.”',
      'After a maneuver, check the new bearing, range and surrounding traffic.',
    ],
    mistake:
      'Keeping course and speed despite a situation in which the other vessel alone can no longer prevent collision.',
    quiz: [
      {
        prompt:
          'The give-way vessel is clearly not acting appropriately. May the stand-on vessel act before collision becomes unavoidable by the other alone?',
        options: [
          'Yes, under Rule 17(a)(ii)',
          'No, it must always wait',
          'Only with radio permission',
        ],
        correct: 0,
        explanation:
          'The permission to act comes earlier than the final duty to act. Continue judging the full circumstances.',
      },
      {
        prompt: 'You have made an avoiding turn. What completes the response?',
        options: [
          'Stop observing the other vessel',
          'Check effectiveness until past and clear',
          'Assume the turn removed every risk',
        ],
        correct: 1,
        explanation:
          'Rule 8 requires checking the maneuver’s effect and achieving a safe passing, without creating another close-quarters situation.',
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
    body: 'Keep a lookout by sight, hearing and all appropriate available means. Use safe speed for visibility, traffic, maneuverability and conditions. A closing vessel on a nearly constant compass bearing signals risk; bearing change does not always rule it out, especially at close range or with large vessels or tows. If in doubt, assume risk exists.',
    goal: 'Read the briefing and check your understanding',
    tip: 'Describe what changes between “may act” and “must act.”',
  },
  {
    id: 'sail-49',
    rules: [3, 8, 9, 10, 18, 26, 27, 28, 34],
    title: 'Special vessels, narrow channels and traffic lanes',
    concepts: [
      'Identify actual status, not appearance or size. “Not under command” means exceptional circumstances prevent maneuvering as the rules require. “Restricted in ability to maneuver” concerns the nature of work, such as dredging, that limits compliance. “Engaged in fishing” means gear restricts maneuverability; recreational trolling that does not restrict it does not qualify. Confirm the appropriate lights, shapes and situation.',
      'The idea: vessels that cannot easily turn or stop get room from vessels that can. Subject to Rules 9, 10 and 13, an ordinary sailing vessel underway keeps clear of vessels not under command, restricted in ability to maneuver, and engaged in fishing. An ordinary power-driven vessel also keeps clear of sailing vessels. Under International Rule 18(d), vessels other than the first two categories shall, if circumstances admit, avoid impeding a vessel constrained by her draught displaying the required signals. That vessel still navigates with particular caution.',
      'In a narrow channel, keep as near the starboard outer limit as is safe and practicable. A sailing vessel or a vessel under 20 m must not impede a vessel that can safely navigate only within the channel. Do not cross if doing so impedes such a vessel. Fishing vessels must not impede other vessels navigating the channel. Approach obscured bends with particular alertness and caution, and avoid anchoring in the channel when circumstances admit.',
      'In a traffic separation scheme adopted by the International Maritime Organization (IMO), follow the lane’s traffic direction; join or leave from the side at a small angle. Avoid crossing if practicable; if obliged to cross, use a heading as nearly as practicable at right angles to the traffic flow. This means heading, not a ground track corrected for current. Sailing vessels and vessels under 20 m must not impede power-driven vessels following a lane. Stay clear of separation zones except as the rules allow.',
      '“Do not impede” requires early action to leave sufficient sea room, before a collision-risk encounter develops. That obligation continues if risk develops, and both vessels then still comply with the collision-avoidance rules. A traffic lane does not confer an unconditional right of way. Check local harbor directions, charts and notices as well as the International Rules.',
      'A narrow channel has its own overtaking signals. A vessel that can only pass safely if the one ahead moves over asks by whistle: two prolonged and one short mean “I intend to overtake you on your starboard side”; two prolonged and two short, “on your port side.” The vessel ahead agrees with prolonged, short, prolonged, short and makes room. If she doubts it is safe, she sounds at least five short rapid blasts.',
      'A dredger or a vessel working underwater may be blocked on one side by her work. She then shows two all-round red lights, or two black balls by day, on the blocked side, and two all-round green lights, or two black diamonds, on the side where you may pass. These come with her red-white-red or ball-diamond-ball.',
      'Fishing gear reaching more than 150 m out is marked on the side it extends. As well as her fishing lights, the vessel shows an all-round white light, or by day a cone point up, in the direction of the gear. Pass on the other side, well clear of the gear.',
    ],
    observe: [
      'Distinguish a work-related maneuvering restriction from simply being a large boat.',
      'For a traffic-lane crossing, compare heading with course over ground.',
    ],
    mistake:
      'Using “sail has priority” to cross ahead of a ship that can navigate safely only in the channel.',
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
          'Rule 9 requires a sailing vessel not to impede such a ship; this duty is not conditional on a radio call.',
      },
      {
        prompt:
          'When obliged to cross a traffic lane, what should be nearly perpendicular to traffic flow?',
        options: ['Heading', 'Ground track regardless of heading', 'The boom'],
        correct: 0,
        explanation: 'Rule 10(c) specifies heading. Current can make the ground track differ.',
      },
      {
        prompt:
          'In a narrow channel, the vessel ahead hears two prolonged and two short blasts from astern. What do they mean?',
        options: [
          'The vessel astern intends to overtake on the port side',
          'The vessel astern is in distress',
          'The vessel astern intends to overtake on the starboard side',
        ],
        correct: 0,
        explanation:
          'Under Rule 34(c), two prolonged and one short ask to pass on the starboard side; two prolonged and two short, on the port side. Agree with prolonged-short-prolonged-short, or sound five short blasts if in doubt.',
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
    body: 'Identify actual status, not appearance or size. “Not under command” means exceptional circumstances prevent maneuvering as the rules require. “Restricted in ability to maneuver” concerns the nature of work, such as dredging, that limits compliance. “Engaged in fishing” means gear restricts maneuverability; recreational trolling that does not restrict it does not qualify. Confirm the appropriate lights, shapes and situation.',
    goal: 'Read the briefing and check your understanding',
    tip: 'Distinguish a work-related maneuvering restriction from simply being a large boat.',
  },
  {
    id: 'sail-50',
    rules: [20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 32, 34, 35],
    title: 'Read lights, shapes and sound signals',
    concepts: [
      'Red is the port sidelight and green is starboard, each covering 112.5° from ahead to 22.5° abaft the beam. A white sternlight covers the remaining 135° astern; a white masthead light covers 225° ahead. Identify the complete pattern and observed aspect. One white light alone might be a sternlight, anchor light or another permitted light: it does not prove vessel type or absence of risk.',
      'A sailing vessel normally shows sidelights and a sternlight; permitted small-vessel combinations and exceptions depend on length. A power-driven vessel normally adds the required masthead light or lights. A yacht proceeding under sail while also propelled by machinery displays a black cone, point down, by day. A vessel at anchor shows the required all-round white light or lights and a black ball by day, subject to length and location exceptions. A sailing vessel may also show an optional pair of all-round lights at the masthead, red over green, but not together with a combined masthead lantern. Study the complete arrangements before night operation.',
      'Useful status patterns, read vertically: not under command, two all-round red lights or two black balls; restricted ability to maneuver, red-white-red or ball-diamond-ball; fishing other than trawling, red over white; trawling, green over white. Fishing day shapes are two cones with points together. A vessel constrained by draught may show three all-round red lights or a cylinder. These are status signals; additional navigation lights may be required. The next pages add the patterns for large, anchored, aground, towing, pilot and diving vessels.',
      'Lights are shown from sunset to sunrise and whenever visibility is restricted. That includes daytime fog or heavy rain; shapes are shown by day. During those hours, show no other lights that could be mistaken for navigation lights or spoil the lookout. An ordinary yacht or motorboat with no special status has no day shape to show.',
      'A power-driven vessel 50 m or longer shows two masthead lights, the after one higher than the forward one. The pair also shows her heading: when the two lights line up vertically, she is pointing toward you or away from you. A vessel under 50 m may show only one. A vessel restricted in ability to maneuver adds masthead lights, sidelights and a sternlight to her red-white-red only while making way through the water.',
      'At anchor, a vessel under 50 m shows one all-round white light where it can best be seen. A vessel of 50 m or more shows two: one forward and a lower one at or near the stern. By day she shows one black ball forward. A vessel of 100 m or more also lights her decks, so a brightly lit ship that is not moving may well be at anchor.',
      'A vessel aground shows her anchor lights plus two all-round red lights in a vertical line; by day, three black balls in a vertical line. Treat the signal as a warning about the water as well as the vessel: the depth there was too little for her, and may be too little for you.',
      'A towing vessel adds masthead lights and a yellow towing light. A power-driven vessel towing astern shows two masthead lights in a vertical line, or three when the tow, measured from her stern to the end of the tow, is longer than 200 m. She also shows sidelights, a sternlight and a yellow towing light above the sternlight; the towed vessel shows sidelights and a sternlight. Only when the tow is longer than 200 m do both show a black diamond by day. Never pass between a tug and its tow.',
      'An ordinary tug and tow is a power-driven vessel. It keeps out of the way of a sailing vessel and follows the normal crossing and head-on rules. A vessel pushing ahead or towing alongside shows two masthead lights, sidelights and a sternlight but no yellow towing light. If towing work severely restricts her ability to change course, the tug also shows red-white-red, or ball-diamond-ball by day, and then other vessels, including sailing vessels, keep out of her way.',
      'A pilot vessel on duty shows two all-round lights at the masthead, white over red; a memory aid is “white over red, pilot ahead.” Underway she adds sidelights and a sternlight, and at anchor her anchor lights. Ships slow down and maneuver near a pilot station to take on a pilot, so expect sudden changes there.',
      'A vessel supporting divers shows code flag A by day. The flag is a rigid copy at least 1 m high, white and blue with a swallow-tailed end. At night she shows the restricted-in-ability-to-maneuver lights, red-white-red. Divers may be in the water anywhere around her, so keep well clear and slow down.',
      'Under International Rule 34, a power-driven vessel underway, maneuvering with vessels in sight, gives one short blast for altering to starboard, two for port, and three for operating astern propulsion. Three blasts do not necessarily mean the vessel is already moving backward. When in-sight vessels approach and intentions or sufficient action are in doubt, sound at least five short rapid blasts. Near an obscured channel bend, sound one prolonged blast; an approaching vessel within hearing answers with one prolonged blast.',
      'Fog signals use a different system. At intervals of no more than two minutes: a power-driven vessel making way sounds one prolonged blast; underway but stopped and making no way, two prolonged blasts about two seconds apart; a sailing vessel, one prolonged then two short. That last pattern is also sounded by vessels not under command, restricted in ability to maneuver, constrained by draught, engaged in fishing, or towing or pushing, so it does not identify a sailing vessel alone. A manned towed vessel, the last of the tow, sounds one prolonged and three short right after the tug’s signal. A short blast lasts about one second; prolonged means four to six seconds. Rule 35 specifies other cases and small-vessel exceptions; International and inland signals can differ.',
    ],
    observe: [
      'Name the full observed light pattern before inferring vessel status.',
      'Separate in-sight maneuvering signals from fog signals.',
    ],
    mistake:
      'Identifying a vessel from one color or treating a fog signal as a turning instruction.',
    quiz: [
      {
        prompt: 'In sight under International Rule 34, three short blasts mean…',
        options: ['Operating astern propulsion', 'Already moving astern', 'Claiming priority'],
        correct: 0,
        explanation:
          'The signal describes propulsion operation, not guaranteed movement through the water.',
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
          'Rule 35 shares this pattern among sailing and several special vessel categories. Keep assessing risk.',
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
    body: 'Red is the port sidelight and green is starboard, each covering 112.5° from ahead to 22.5° abaft the beam. A white sternlight covers the remaining 135° astern; a white masthead light covers 225° ahead. Identify the complete pattern and observed aspect. One white light alone might be a sternlight, anchor light or another permitted light: it does not prove vessel type or absence of risk.',
    goal: 'Read the briefing and check your understanding',
    tip: 'Name the full observed light pattern before inferring vessel status.',
  },
  {
    id: 'sail-51',
    rules: [2, 5, 6, 7, 8, 19, 35],
    title: 'Restricted visibility and a complete encounter plan',
    concepts: [
      'Choose the rule framework before assigning give-way and stand-on roles. International Rule 19 applies when vessels are not in sight of one another in or near restricted visibility. Do not apply the ordinary in-sight sail-versus-power or crossing roles to an unseen contact. If vessels are visually in sight, apply the appropriate in-sight rules while still accounting for the visibility and general duties.',
      'Proceed at a safe speed adapted to the conditions. A power-driven vessel keeps engines ready for immediate maneuver. Maintain lookout, use required sound signals and available equipment correctly, and avoid conclusions from scanty radar information. AIS and a radio conversation do not replace lookout, establish a complete traffic picture or cancel the rules.',
      'With a contact detected by radar alone, determine whether close quarters or collision risk is developing and act in ample time. If altering course, avoid as far as possible a port alteration for a vessel forward of the beam, except a vessel being overtaken; also avoid turning toward a vessel abeam or abaft the beam. These restrictions do not prescribe one universally safe turn: check all contacts, sea room and speed options.',
      'Unless absence of collision risk has been determined, hearing a fog signal apparently forward of the beam, or being unable to avoid close quarters with a vessel forward of the beam, requires reducing speed to the minimum at which course can be kept. Take all way off if necessary and navigate with extreme caution until the danger is over. Do not maintain cruising speed while waiting to see the vessel.',
      'Use the same decision sequence in every exercise: observe and assess risk; establish visibility, propulsion, vessel status and local constraints; check overtaking before ordinary encounter roles; choose timely action without creating another danger; verify the result until past and clear. Reopen the assessment when conditions change. These lessons teach core International encounter reasoning, not the complete lights syllabus, local law or a qualification for unsupervised navigation.',
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
          'Rule 19 plus the general applicable duties',
          'No rules until visual contact',
        ],
        correct: 1,
        explanation:
          'The not-in-sight restricted-visibility framework applies; ordinary in-sight roles cannot simply be assigned.',
      },
      {
        prompt:
          'A fog signal is apparently ahead of your beam and absence of risk has not been established. What is required?',
        options: [
          'Keep speed until you see the vessel',
          'Turn to port immediately in every case',
          'Reduce to minimum course-keeping speed; take all way off if needed',
        ],
        correct: 2,
        explanation:
          'Rule 19(e) requires that speed response and extreme caution until collision danger is over.',
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
    body: 'Choose the rule framework before assigning give-way and stand-on roles. International Rule 19 applies when vessels are not in sight of one another in or near restricted visibility. Do not apply the ordinary in-sight sail-versus-power or crossing roles to an unseen contact. If vessels are visually in sight, apply the appropriate in-sight rules while still accounting for the visibility and general duties.',
    goal: 'Read the briefing and check your understanding',
    tip: 'State explicitly whether the contact is visually in sight or detected only by instruments.',
  },
];
