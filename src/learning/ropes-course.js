// Ropes, wire, knots and pulleys. This lesson sits in "Before you leave" after
// "Lines, winches, and loads"; its decision exercise lives in decision-scenarios.js.
const q = (prompt, options, correct, explanation) => ({ prompt, options, correct, explanation });
const concepts = [
  'Ropes are made from different fibres, and each suits a different job. Nylon stretches a lot, so it absorbs shocks: use it for anchor and mooring lines. Polyester stretches little, so the sail keeps its shape: use it for sheets and halyards. Polypropylene floats, which suits a rescue throwing line, but it chafes and weakens in sunlight. Aramid and similar fibres, such as Kevlar and Dyneema, are the strongest for their size and hardly stretch.',
  'A mooring or tow line needs a high breaking strength, and a tow line must also be long and able to stretch. One strong line is better than two weak ones, because a load rarely shares evenly between two lines. Every knot or splice weakens a rope: a knot can take away up to about half its strength, a splice much less. Chafe weakens it too, so protect lines where they pass through fairleads.',
  'Look after your ropes, because sunlight and salt crystals weaken the fibres. Rinse the salt out with fresh water, dry them and store them coiled in the shade. Check for chafe, cuts and stiff or glazed patches, and replace a rope before it fails.',
  'Wire rope is described by its strands and wires. A marking such as 6/12 means 6 strands with 12 wires in each. 7×19 wire, 7 strands of 19 wires, is flexible and suits running rigging (the lines you adjust) that bends round sheaves (pulley wheels). 1×19 wire, a single strand of 19 wires, is stiff and stretches little, so it suits standing rigging (the fixed wires holding up the mast), such as the shrouds at its sides, and guardrails.',
  'One more line you will meet is the topping lift, from the masthead (the top of the mast) to the end of the boom. It holds the boom up when the mainsail is lowered or reefed, so the boom does not drop into the cockpit or onto the crew.',
  'A block and tackle multiplies your pull; the mainsheet on the boom is one. A block is a pulley: one is fixed to the boat, the other moves with the load. Count the rope parts that hold up the moving block: with four parts, a 320 kg load needs about 80 kg of pull, ignoring friction. With two double blocks (two wheels each), if the rope leaves from the moving block there are five parts, a gain of 5 to 1; if it leaves from the fixed block, 4 to 1. You pull that much more rope for the same lift.',
  'Know a few knots well enough to tie them in the dark:\n• Bowline: makes a loop that will not slip or jam.\n• Cleat hitch: makes a line fast to a cleat.\n• Clove hitch: quickly holds a fender on a rail.\n• Figure-of-eight: stops a line running out through a block.\n• Round turn and two half hitches: ties a line to a ring or post under load.',
];

export const ropesLessons = [
  {
    id: 'sail-60',
    module: 'aboard',
    title: 'Ropes, wire, knots and pulleys',
    concepts,
    observe: [
      'Find the anchor line, a sheet and a halyard aboard and say which fibre each is made of, and why.',
      'Count the parts of rope at the moving block of the mainsheet tackle and work out its gain.',
    ],
    mistake: 'Joining two weak lines in place of one strong one, or forgetting that a knot weakens the rope it is tied in.',
    quiz: [
      q('Which rope is the strongest for its thickness?', ['Kevlar', 'Polypropylene', 'Nylon'], 0, 'Aramid fibres such as Kevlar are far stronger than nylon or polypropylene of the same size.'),
      q('What does a knot do to a rope’s strength?', ['It weakens the rope', 'It makes the rope stronger', 'Nothing'], 0, 'Every knot or splice weakens a rope; a knot can take away up to about half its strength.'),
      q('Two double blocks, with the rope leaving from the moving block. What is the gain?', ['5 to 1', '2 to 1', '4 to 1'], 0, 'Count the parts at the moving block: four between the blocks plus the one leaving it make five.'),
    ],
    figure: 'ropes:types',
    conceptFigures: { 3: 'ropes:wire', 5: 'ropes:tackle' },
    practice: null,
    transfer: 'Practise the knots with a real rope until you can tie them without looking, and ask an instructor to check how lines are led and protected aboard your boat.',
    minutes: 12,
    type: 'Theory & decisions',
    body: concepts[0],
    goal: 'Read the briefing and check your understanding',
    tip: 'Find the anchor line, a sheet and a halyard aboard and say which fibre each is made of, and why.',
  },
];
