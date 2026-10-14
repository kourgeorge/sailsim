// Safety equipment and abandoning ship. These lessons sit in "Before you leave"
// after "Safety before speed"; their decision exercises live in decision-scenarios.js.
const TRANSFER =
  'Learn your own boat’s equipment with an instructor: fit the harness, read the flare instructions, find the extinguishers and attend a sea-survival course with a real life raft.';
const lesson = (id, title, concepts, observe, mistake, quiz, figure, conceptFigures = {}, localNotes = undefined) => ({
  id,
  module: 'aboard',
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
      'A safety harness clips you to the boat so you cannot go overboard in rough weather. Clip on before you leave the cockpit, to strong points or to jacklines: strong lines or webbing run from bow to stern along both side decks. Keep the tether short and clip on to the windward side when you can.',
      'Each flare has its own job. A red parachute rocket climbs about 300 m and burns for about 40 seconds, so it is seen from far away by day or night. A red hand flare shows your exact position to someone nearby and keeps burning even if dropped in the water. Orange smoke works only by day and also shows a helicopter the wind direction. Replace flares before their expiry date, store them dry and within reach, and hold hand flares out over the downwind side.',
      'Match the extinguisher to the fire. Foam smothers burning liquids such as fuel and oil by cutting them off from the air; dry powder works on most fires, including fuel and electrical ones; carbon dioxide (CO2) suits electrical and engine-space fires; a fire blanket smothers a pan fire in the galley. Never use water on burning fuel or on live electrical equipment. Know where each extinguisher is and check its pressure gauge and service date.',
      'When refuelling, stop the engine and put out any flame, close the hatches, and switch the automatic bilge pump off so it cannot pump spilt fuel into the sea. Keep absorbent rags ready, check that the tank breather is clear and watch the gauge so the tank does not overflow. If heavy flooding beats the bilge pumps, the engine’s sea-water cooling pump can also pump the bilge, on boats fitted to switch its intake.',
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
    ],
  ),
  lesson(
    'sail-59',
    'Life raft and abandoning ship',
    [
      'Abandon the boat only when staying aboard is clearly more dangerous, for example when it is sinking or burning out of control. Before you go, send a distress call, put on lifejackets and warm clothing, and take the grab bag: water, a handheld VHF, an emergency beacon, flares and seasickness tablets. Step up into the raft if you can, rather than jumping into the water.',
      'Stow the life raft on deck or on the stern rail in its cradle, ready to launch quickly, with its painter, the line that ties it to the boat, made fast to a strong point. A hydrostatic release frees the raft automatically if the boat sinks: at a depth of a few metres it lets go, the raft floats up and the painter pulls it open.',
      'To launch, check that the painter is tied to the boat, throw the raft over the leeward side and pull out the painter. Its full length, printed on the canister, ends in a pull that fires the gas bottle and inflates the raft. When the raft is full, its relief valves whistle as the extra gas escapes. Keep it tied alongside while the crew boards.',
      'If the raft inflates upside down, a swimmer climbs onto the gas bottle on its bottom, takes hold of the righting strap and leans back, pulling the raft over. Do it from the downwind side, so the wind helps the raft flip toward you.',
      'Once everyone is in, cut the painter with the raft’s safety knife, paddle clear of the sinking boat and stream the raft’s sea anchor to stay near the position you reported and to steady the raft. Take seasickness tablets straight away, because vomiting loses body water. Close the canopy, bail out, keep warm and keep a lookout. Ration water and save flares for when you see a ship or aircraft. The raft packs flares, a floating rescue line, a bailer, a repair kit and a survival manual; a radar transponder (SART) is a separate item for the grab bag.',
      'A sea anchor is a large cone or parachute streamed on a long line. From the bow of a boat or raft it holds the bow to the wind and waves and greatly reduces drift; in a survival storm with no sail left it keeps a yacht from lying beam-on to the seas. A drogue is smaller and towed astern: it slows a boat running down big waves so it does not surf, slew and broach.',
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
