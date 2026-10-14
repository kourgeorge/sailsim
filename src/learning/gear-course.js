// Gear failures and towing. This lesson sits in "Respond and review" after
// "Distress and urgent action"; its decision exercise lives in decision-scenarios.js.
const q = (prompt, options, correct, explanation) => ({ prompt, options, correct, explanation });
const concepts = [
  'If the wheel steering fails, fit the emergency tiller to the top of the rudder stock. It is the fix when a steering cable or the wheel’s shaft breaks, and it usually fits under a deck plate in the cockpit. Learn where it is stowed and practise fitting it in calm water. Near a harbor entrance, slow down, call for help early and keep well clear of the breakwater while you fit it.',
  'If the roller furler jams as you roll the headsail away, first take the load off the sail. Bear away so the mainsail shelters it, or ease the sheet, and try again gently. Do not force it with a bigger winch, which can break the drum or the line. If it still will not turn, let the halyard go, pull the sail down onto the deck and tie it there.',
  'If a loaded shroud breaks, act at once to take the strain off the mast. Tack or gybe so the broken side is to leeward and no longer carries the load, ease the sheets and reduce sail. Then rig a spare halyard to a strong point on that side as a temporary shroud before sailing on gently.',
  'Before you take another boat in tow, check the sea state, your fuel and the strength of the points you will tie to on both boats. Use a long, strong line that can stretch, such as 50 m of thick nylon in a 2 m sea, made fast to strong points or to a bridle spread across both sides. In rough weather, lengthen the tow line and weight it so it does not snatch tight, and agree signals with the other crew.',
  'Tow slowly and turn gently. With a short line, a sharp turn lets the line go slack; when it comes tight again, it jerks the towed boat’s bow round after you, so in a sharp turn to starboard her bow sheers hard to starboard and she can run into your stern. Turn wide and keep the line taut. In a harbor, towing alongside, lashed to your side, gives far better control.',
];

export const gearLessons = [
  {
    id: 'sail-62',
    module: 'readiness',
    title: 'When gear fails, and towing',
    concepts,
    observe: [
      'Find the emergency tiller aboard and work out how it fits onto the rudder stock.',
      'Look at the shrouds and decide which side carries the load on each tack.',
    ],
    mistake: 'Forcing a jammed furler with a bigger winch, or towing on a short line and turning sharply.',
    quiz: [
      q('When do you need the emergency tiller on a wheel-steered boat?', ['When a steering cable or the wheel’s shaft breaks', 'Only when the rudder itself breaks', 'Whenever the engine is off'], 0, 'The emergency tiller fits straight onto the rudder stock, so it works when the wheel’s link to the rudder fails.'),
      q('On starboard tack, the starboard shroud breaks. What do you do first?', ['Tack so the broken side is to leeward', 'Hold your course and ease the backstay', 'Hoist more sail to steady the boat'], 0, 'The windward shroud carries the load. Tacking puts the broken side to leeward and takes the strain off the mast.'),
      q('What tow line suits rough weather?', ['A long, heavy line that can stretch', 'A short line, to keep the boats close', 'A thin line that will break before the cleats do'], 0, 'A long, heavy, stretchy line keeps the boats in step with the waves and stops it snatching tight.'),
    ],
    figure: 'gear:tiller',
    conceptFigures: { 2: 'gear:shroud', 3: 'gear:tow', 4: 'gear:tow' },
    practice: null,
    transfer: 'Fit the emergency tiller and rig a tow with an instructor in calm water before you need to do it for real.',
    minutes: 12,
    type: 'Theory & decisions',
    body: concepts[0],
    goal: 'Read the briefing and check your understanding',
    tip: 'Find the emergency tiller aboard and work out how it fits onto the rudder stock.',
  },
];
