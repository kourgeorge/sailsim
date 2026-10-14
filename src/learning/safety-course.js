// Safety equipment and abandoning ship. These lessons sit in "Respond and review"
// with the other emergency lessons; their decision exercises live in decision-scenarios.js.
const TRANSFER =
  'Learn your own boat’s equipment with an instructor: fit the harness, read the flare instructions, find the extinguishers and attend a sea-survival course with a real life raft.';
const lesson = (id, title, concepts, observe, mistake, quiz, figure, conceptFigures = {}, localNotes = undefined) => ({
  id,
  module: 'readiness',
  title,
  concepts,
  observe,
  mistake,
  quiz,
  figure,
  conceptFigures,
  ...(localNotes ? {localNotes} : {}),
  practice: null,
  transfer: TRANSFER,
  minutes: 12,
  type: 'Theory & decisions',
  body: concepts[0],
  goal: 'Read the briefing and check your understanding',
  tip: observe[0],
});
const q = (prompt, options, correct, explanation) => ({ prompt, options, correct, explanation });

export const safetyLessons = [
  lesson(
    'sail-58',
    'Safety gear aboard',
    [
      'The safety gear a boat must carry depends on its size and on how far from shore it sails. The list for your boat is in its seaworthiness certificate: check the gear against it before each season and before a longer trip.',
      'A safety harness clips you to the boat so you cannot go overboard in rough weather. Clip on before you leave the cockpit, to strong points or to jacklines: strong lines or webbing that run from bow to stern along both side decks. Keep the tether short, and clip on to the windward side (the side the wind comes from) when you can, so a fall throws you onto the deck rather than over the side.',
      'Each type of flare has its own job, so carry the right mix:\n• Red parachute rocket: climbs about 300 m and burns for about 40 seconds, so ships far away see it, by day or night.\n• Red hand flare: shows your exact position to someone nearby, and keeps burning even if dropped in the water.\n• Orange smoke: works by day only, and also shows a helicopter which way the wind blows.\nReplace flares before their expiry date and store them dry and within reach. Hold a hand flare out over the downwind side, so the smoke and hot drips blow away from the boat.',
      'Match the extinguisher to the fire, because the wrong one can make it worse:\n• Foam: burning liquids such as fuel and oil. It covers the liquid and cuts it off from the air.\n• Dry powder: most fires, including fuel and electrical ones.\n• Carbon dioxide (CO2): electrical and engine-space fires.\n• Fire blanket: a pan fire in the galley (the boat’s kitchen).\nNever use water on burning fuel, which spreads it, or on live electrical equipment, which can give a shock. Know where each extinguisher is and check its pressure gauge and service date.',
      'Refuelling is a fire risk, because fuel vapour is heavier than air and can collect inside the boat. Stop the engine, put out any flame and close the hatches. Switch off the automatic bilge pump (the pump that empties water from the bottom of the hull), so it cannot pump spilt fuel into the sea. Keep rags ready, check that the tank’s air vent is clear, and watch the gauge so the tank does not overflow.',
    ],
    [
      'Find your boat’s seaworthiness certificate and check the listed safety gear against what is aboard.',
      'Read the instructions printed on each flare and find its expiry date.',
    ],
    'Carrying expired flares or the wrong extinguisher, or clipping a harness to a weak fitting such as a guardrail.',
    [
      q('What is a safety harness for?', ['Keeping the crew from going overboard in rough weather', 'Securing gear on deck', 'Holding the boom in place'], 0, 'Clipped to strong points or jacklines, the harness keeps you attached to the boat.'),
      q('When can you use a red parachute rocket?', ['By day and by night', 'Only at night', 'Only by day'], 0, 'It climbs high and burns brightly, so it can be seen far away at any time of day.'),
      q('Which fire is foam mainly for?', ['Burning liquids such as fuel and oil', 'Live electrical equipment', 'Every kind of fire'], 0, 'Foam blankets a burning liquid and cuts it off from the air. Use powder or CO2 on electrical fires.'),
    ],
    'safety:harness',
    {2: 'safety:flares', 3: 'safety:extinguishers'},
    [
      {
        page: 0,
        region: 'israel',
        text: 'The Israeli boat operator licence material expects, for example, a life raft on a private yacht sailing 15 NM from shore, at least 4 red parachute rockets, and a fire blanket where there is open-flame cooking. Your boat’s seaworthiness certificate gives the exact list; check the current Israeli regulations.',
      },
      {
        page: 0,
        region: 'israel',
        text: 'Under Israeli rules a boat is a vessel 7 to 24 m long. On a national voyage, along the Israeli coast, it may sail up to 12 NM from shore. A private boat’s seaworthiness is inspected every 24 months. The required equipment, including the anchor weight for the boat’s size, is set by the Israel Shipping and Ports Authority safety equipment regulations, published by the Authority and on the Ministry of Transport website.',
      },
    ],
  ),
  lesson(
    'sail-59',
    'Life raft and abandoning ship',
    [
      'Abandon the boat only when staying aboard is clearly more dangerous, for example when it is sinking or burning out of control. A boat that is still afloat is safer and easier to find than a raft. Before you go:\n• Send a distress call.\n• Put on lifejackets and warm clothing.\n• Take the grab bag: water, a handheld VHF radio, an emergency beacon, flares and seasickness tablets.\nStep up into the raft from the boat if you can, rather than jumping into the water, so you stay dry and warm.',
      'Stow the life raft on deck or on the stern rail in its cradle, ready to launch quickly. Its painter, the line that ties it to the boat, is made fast to a strong point. A hydrostatic release frees the raft automatically if the boat sinks: at a depth of a few metres it lets go, the raft floats up and the painter pulls it open.',
      'To launch, first check that the painter is tied to the boat. Throw the raft over the leeward side (the side away from the wind, where the boat shelters it) and pull out the painter. Its full length, printed on the canister, ends in a pull that fires the gas bottle and inflates the raft. When the raft is full, its relief valves whistle as the extra gas escapes. Keep it tied alongside while the crew boards.',
      'If the raft inflates upside down, one swimmer can turn it over. Climb onto the gas bottle on its bottom, take hold of the righting strap and lean back, pulling the raft over. Do it from the downwind side, so the wind helps the raft flip toward you.',
      'Once everyone is in, cut the painter with the raft’s safety knife and paddle clear of the sinking boat. Then:\n• Stream the sea anchor, to stay near the position you reported and to steady the raft.\n• Take seasickness tablets straight away, because vomiting loses body water.\n• Close the canopy, bail out the water, keep warm and keep a lookout.\n• Ration the water, and save flares for when you see a ship or aircraft.\nThe raft packs flares, a floating rescue line, a bailer, a repair kit and a survival manual. A radar transponder (SART), which shows up on a ship’s radar screen, is a separate item for the grab bag.',
      'A sea anchor is a large cone or parachute streamed on a long line. From the bow of a boat or raft it holds the bow to the wind and waves and greatly reduces drift. In a survival storm with no sail left, it keeps a yacht from lying beam-on to the seas: side-on to the waves, which can roll her over. A drogue is smaller and towed astern. It slows a boat running down big waves, so she does not surf, swing sideways to a wave and broach (get knocked flat).',
    ],
    [
      'Find where your boat’s life raft is stowed and read its canister: painter length, service date and hydrostatic release.',
      'Check what is in the grab bag and who is responsible for taking it.',
    ],
    'Jumping into the water before the raft is ready, or forgetting to tie the painter before throwing the raft overboard.',
    [
      q('What does a life raft’s hydrostatic release do?', ['Frees the raft automatically if the boat sinks', 'Sounds an alarm in distress', 'Keeps the raft locked until it is serviced'], 0, 'At a depth of a few metres it releases the raft so it floats up and inflates.'),
      q('The raft has inflated upside down. How is it righted?', ['A swimmer stands on the gas bottle, holds the righting strap and leans back', 'Let the air out and inflate it again', 'It cannot be used; launch another raft'], 0, 'The righting strap on the bottom lets one person pull the raft upright, ideally from the downwind side.'),
      q('Everyone is in the raft and clear of the boat. What do you do first?', ['Take seasickness tablets', 'Fire all the flares to reassure the crew', 'Eat the food rations'], 0, 'Seasickness quickly dehydrates people in a raft. Save flares for when a ship or aircraft is in sight.'),
    ],
    'safety:raft',
    {5: 'safety:anchor'},
  ),
];
