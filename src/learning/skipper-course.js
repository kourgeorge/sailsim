// What a coastal skipper must know beyond boat handling: sails and balance,
// stability, heavy weather, watches and the logbook, and a skipper's legal duties.
// These lessons cover the remaining Seamanship C exam topics; their decision
// exercises live in decision-scenarios.js.
export const skipperModule = {
  id: 'skipper',
  title: 'The skipper’s knowledge',
  outcome: 'Choose sails for the wind, keep the boat stable, prepare for heavy weather, run watches and the logbook, and know a skipper’s duties at sea.',
};
const TRANSFER =
  'Check these points against your own boat, its papers and the current regulations, and go through them with an instructor before you skipper.';
const lesson = (id, title, concepts, observe, mistake, quiz, figure, localNotes = undefined) => ({
  id,
  module: skipperModule.id,
  title,
  concepts,
  observe,
  mistake,
  quiz,
  figure,
  conceptFigures: {},
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

export const skipperLessons = [
  lesson(
    'sail-69',
    'Sails and balance',
    [
      'A cruising yacht carries several sails, each for a job:\n• Mainsail: behind the mast, on the boom. It is made smaller by reefing.\n• Genoa: a large headsail that overlaps the mast. Good in light and moderate wind.\n• Jib: a smaller headsail that does not reach past the mast. Easier to handle in more wind.\n• Storm jib: a very small headsail of heavy cloth, often bright orange, for gale-force wind.\n• Trysail: a small, strong storm sail set in place of the mainsail, without the boom.',
      'Downwind, in light and moderate wind, two light sails add power:\n• Spinnaker: a large, balloon-shaped symmetric sail set on a pole. Fast, but it needs a trained crew.\n• Gennaker (asymmetric spinnaker): tied at the bow with no pole, easier for a small crew.\nTake them down early when the wind rises, because a big downwind sail can make the boat roll and broach (swing up into the wind out of control).',
      'Choose the sails for the wind and the crew. Light wind: full main and genoa, perhaps a gennaker downwind. Moderate wind: working sails, reefed when the boat heels too far. Strong wind: a reefed main and a small headsail, or the headsail partly rolled away. A rolled-up genoa loses its shape, so in really strong wind a proper storm jib sets better. In a storm: storm jib and trysail, or the storm jib alone.',
      'The sails push on the boat at one point, the centre of effort (CE). The water resists the hull and keel sideways at another, the centre of lateral resistance (CLR). The boat turns around the CLR. When the CE is behind the CLR, the boat tries to turn up into the wind: weather helm. When it is in front, the boat tries to bear away: lee helm.',
      'A little weather helm is good: if you let go of the wheel, the boat turns into the wind and slows down by itself. Too much weather helm brakes the boat and can make it round up. Heeling moves the sails’ push out to leeward of the hull, which adds weather helm, so a boat that heels too far gets harder to steer. To reduce weather helm, ease or reef the mainsail, drop the traveller to leeward, and reduce heel.',
      'Use the sails to help the rudder (see Lesson {lesson:sail-18}). The mainsail alone turns the bow toward the wind, and the headsail alone turns it away. To bear away in strong wind, ease the mainsail first; to head up, ease the headsail. With the right balance between the two sails the boat steers easily and the rudder hardly works.',
    ],
    [
      'Note how the helm feels on a close reach before and after you ease the mainsail.',
      'Find the storm jib aboard and check how it is set.',
    ],
    'Keeping a big genoa or spinnaker up as the wind rises, then fighting heavy weather helm with the rudder.',
    [
      q('The boat has heavy weather helm on a close reach. What helps most?', ['Ease or reef the mainsail and reduce heel', 'Pull the mainsail in harder', 'Unroll more genoa'], 0, 'Weather helm comes mainly from the mainsail and from heel. Easing or reefing the main moves the push forward and reduces heel.'),
      q('Which sail is set in a storm in place of the mainsail?', ['Gennaker', 'Trysail', 'Genoa'], 1, 'A trysail is a small, strong storm sail set without the boom.'),
      q('Why is a little weather helm good?', ['The boat goes faster with the rudder hard over', 'If the helm is let go, the boat turns into the wind and slows down', 'It stops the boat from heeling'], 1, 'A boat that rounds up gently when released is safer than one that bears away and gathers speed.'),
    ],
    'skipper:balance',
  ),
  lesson(
    'sail-70',
    'Stability',
    [
      'Two forces keep a boat upright. Its weight pulls down through the centre of gravity (G), and the water pushes up through the centre of buoyancy (B), the centre of the underwater part of the hull. When the boat is upright, G and B are one above the other.',
      'When the boat heels, the underwater shape changes and B moves toward the low side. Weight and buoyancy are then no longer in line, and together they turn the boat back upright. The horizontal distance between them is the righting lever (GZ). The longer the lever, the harder the boat pushes back.',
      'The lower the centre of gravity, the more stable the boat. The heavy keel keeps G low on a sailing yacht. Weight added high up raises G and cuts stability: heavy gear on deck, a dinghy full of water on the foredeck, or many people standing up. Stow heavy things low and near the middle of the boat, and never load the boat beyond the limits in its papers.',
      'A wide, flat boat such as a catamaran is very stable at small angles: it heels little. A deep-keeled monohull heels more easily but keeps pushing back to large angles, so it can recover from a knockdown. Every boat has an angle at which the righting lever reaches zero; beyond it, the boat goes on over and may stay upside down. A catamaran, once past its own limit, stays upside down.',
      'Free surface is dangerous. When a tank is part full, or water lies in the bilge, the liquid runs to the low side as the boat heels. Its weight moves the same way and acts as if G were higher, so the boat loses stability. Keep tanks either full or empty when you can, pump the bilge dry, and treat water coming aboard as a stability problem as well as a flooding one.',
      'Stability also depends on keeping water out. Close the hatches and the washboards (the boards that close the companionway) in rough weather, because once the boat heels far enough for water to pour in, it can fill and sink fast. A stiff boat, with G low, rolls back quickly; a tender boat heels easily and rolls slowly. A boat that suddenly feels tender may have water inside: check the bilge.',
    ],
    [
      'List the heavy items aboard and check that they are stowed low and secured.',
      'Look at the boat’s papers for the maximum number of people and load.',
    ],
    'Carrying heavy gear or water on deck, or leaving water sloshing in the bilge, and expecting the boat to stay as stable.',
    [
      q('What makes a sailing yacht more stable?', ['A higher centre of gravity', 'A lower centre of gravity', 'Heavy gear stowed on deck'], 1, 'A low G gives a longer righting lever when the boat heels.'),
      q('Why are part-full tanks and water in the bilge dangerous?', ['They make the boat heavier at the bow only', 'The liquid runs to the low side and reduces stability', 'They raise the centre of buoyancy'], 1, 'This free-surface effect moves weight to the low side and acts as if the centre of gravity were higher.'),
      q('When the boat heels, what moves toward the low side?', ['The centre of buoyancy', 'The centre of gravity', 'The mast step'], 0, 'The underwater shape changes, so B moves to the low side; G stays where the weight is.'),
    ],
    'skipper:stability',
  ),
  lesson(
    'sail-71',
    'Heavy weather at sea',
    [
      'The best way to handle a gale is to avoid it. Read the forecast and the barometer (Lesson {lesson:sail-20}), and decide early: reach shelter before it arrives, or head for open water with plenty of sea room, well away from a lee shore. Do not try to enter a harbour whose entrance is breaking (Lesson {lesson:sail-56}).',
      'Prepare the boat before the wind builds, while it is still easy to move about:\n• Stow and lash everything below; secure the dinghy and anything loose on deck.\n• Close the hatches and portholes; have the washboards ready.\n• Rig the jacklines; check the bilge pumps and the lifejackets.\n• Reef early, and have the storm jib ready.\n• Plot your position and write it in the log.',
      'Prepare the crew too. Everyone wears a lifejacket and a harness, and clips on before leaving the cockpit. Cook a hot meal and fill flasks before it gets rough. Give seasickness tablets early, because they work only before the sickness starts. Dress warmly and keep dry: cold and tiredness lead to mistakes.',
      'Run the boat to save the crew’s strength. Shorten the watches, let the off-watch crew rest below, and keep one person on lookout. Brief tasks before anyone moves: one hand for yourself and one for the boat. Avoid going forward if you can, and keep a clear plan for a person overboard.',
      'Heaving to stops the boat in rough weather, to rest, reef or cook. Tack without releasing the headsail, so it is backed (held on the windward side). Ease the mainsail and lash the helm to turn the boat toward the wind. The two balance: the boat lies at about 50° to the wind, drifts slowly downwind and rides the waves quietly. The live model below uses the sailing engine. Open the Heave To challenge to tack, back the jib and hold the drift aboard the yacht.',
      'In a real storm there are three main tactics:\n• Keep sailing slowly to windward under storm sails, taking the waves just off the bow.\n• Run before the waves with very little sail, towing a drogue (a small sea anchor) from the stern to slow the boat, so it does not surf too fast and broach.\n• Lie to a sea anchor from the bow (Lesson {lesson:sail-59}).\nDo not lie beam-on to big breaking waves with no sail: a breaking wave can roll the boat over.',
    ],
    [
      'Walk through your boat and decide what you would stow and lash before a gale.',
      'Practise heaving to in moderate wind with an instructor.',
    ],
    'Waiting until the wind is already strong before reefing, stowing and clipping on.',
    [
      q('How do you heave to?', ['Back the headsail, ease the main and lash the helm toward the wind', 'Drop all sails and lie beam-on', 'Run downwind at full speed'], 0, 'The backed headsail and the helm balance each other, and the boat lies quietly at about 50° to the wind.'),
      q('Why tow a drogue from the stern when running before a storm?', ['To speed the boat up', 'To slow the boat down so it does not surf and broach', 'To keep the bow into the wind'], 1, 'A drogue slows the boat and keeps its stern to the waves.'),
      q('When should you take seasickness tablets?', ['When you first feel sick', 'Before the rough weather starts', 'Only after vomiting'], 1, 'They work only if taken before the sickness starts.'),
    ],
    'skipper:heavy',
  ),
  lesson(
    'sail-72',
    'Watches and the logbook',
    [
      'On a passage someone must be in charge on deck at all times. A watch system shares the work so the crew can rest. With a small crew, two watches of 3 or 4 hours on and off is common; at night and in cold or rough weather, shorter watches keep people alert. The skipper stays out of the system or takes a light watch, so they can be called at any time.',
      'The skipper writes standing orders: when the watch must call the skipper. Typical reasons are a vessel getting closer on a steady bearing, a change in the wind or the weather, a falling barometer, any doubt about the position, a change of course or sail, any damage, and simply feeling unsure. Calling too often is never wrong.',
      'At a watch change, the new watch comes up a little early so their eyes can get used to the dark, which takes about 20 minutes. The outgoing watch hands over: the course and position, vessels in sight, the weather and the barometer, the sails, anything to watch for, and the skipper’s orders. The watch is not handed over until the new person understands the situation.',
      'The watch keeps an all-round lookout, by eye and with radar and AIS where fitted, and listens on VHF channel 16. It checks the course and position at least every hour and writes them in the log, watches the sails, the bilge and any chafe, and makes sure everyone on deck at night is clipped on.',
      'At anchor you also need an anchor watch. As soon as you are anchored, take bearings of two or three fixed objects or note a transit, and set the GPS anchor alarm. Check them regularly, and more often when the wind rises or shifts. Know how far the boat can swing, show the anchor light at night, and in strong wind keep the engine ready and someone on watch.',
      'The logbook is the boat’s official record. Write in pen, regularly, and never rub anything out: strike a mistake through with one line so it can still be read. Record the departure and arrival, the crew, the position, course, speed and log reading (Lesson {lesson:sail-23}), the weather and the barometer, the engine hours and fuel, and every event: sail changes, traffic, damage, injuries and radio messages. After an accident, the log is the evidence of what happened.',
    ],
    [
      'Write a set of standing orders for a night watch on a short passage.',
      'Take bearings of two fixed objects the next time you anchor, and check them an hour later.',
    ],
    'Handing over a watch with a quick “all fine”, or anchoring for the night without bearings or an alarm.',
    [
      q('When should the watch call the skipper?', ['Only in an emergency', 'Whenever something on the standing orders happens, or when in any doubt', 'Only at the end of the watch'], 1, 'Standing orders list the reasons; any doubt is also a reason to call.'),
      q('How do you correct a mistake in the logbook?', ['Rub it out and rewrite it', 'Strike it through with one line so it can still be read', 'Tear out the page'], 1, 'The log is a record and evidence; nothing should be erased.'),
      q('Right after anchoring, what should the anchor watch set up?', ['Bearings of fixed objects or a transit, and the GPS anchor alarm', 'Nothing until the wind rises', 'Only the deck lights'], 0, 'With a reference set from the start, you can tell at once if the anchor drags.'),
    ],
    'skipper:watch',
  ),
  lesson(
    'sail-73',
    'A skipper’s duties and the law',
    [
      'The skipper is responsible for the safety of the boat and of everyone aboard, and for keeping the rules. Never skipper after drinking alcohol or taking drugs. Know what your licence allows: which boats, how far from shore, and whether you may carry passengers for pay.',
      'You must go to the help of people in distress at sea when you can do so without serious danger to your own boat and crew. Answer a distress call, and if you cannot help, relay it. After a collision, stay to help the other vessel and give your boat’s name and port.',
      'Carry the boat’s papers and keep them valid:\n• The boat’s licence or registration certificate.\n• The seaworthiness certificate, with its list of required equipment (Lesson {lesson:sail-58}).\n• The insurance policy.\n• The skipper’s licence.\nA boat must be registered, and its name and registration number marked on the hull as the rules require.',
      'Check that the insurance matches how the boat is used. A private boat, a boat rented out without a skipper (bareboat charter) and a boat carrying passengers for pay each need their own licence and insurance. A bareboat charter must be licensed and insured for hire, and carrying passengers for pay needs a special licence for both the boat and the skipper.',
      'Before sailing, read the Notices to Mariners for your area. They warn of temporary changes: firing practice, works, moved buoys, unlit marks and closed areas. Keep out of closed and restricted areas shown on the chart or in the notices, such as naval areas and the waters near ports, oil terminals and tankers. Keep well clear of vessels and buoys showing that divers are down (flag A, Lesson {lesson:sail-61}).',
      'Protect the sea. Do not throw rubbish, food, oil, fuel or chemicals overboard. Use the marina’s pump-out for the toilet tank, and refuel with care so nothing spills. In a marine nature reserve, anchoring, fishing and collecting may be forbidden: anchor on sand, never on coral or seagrass. Report any accident, injury or serious damage to the maritime authority.',
    ],
    [
      'Check that your boat’s licence, seaworthiness certificate and insurance are valid and aboard.',
      'Read the current Notices to Mariners for your sailing area.',
    ],
    'Assuming a private licence and private insurance cover chartering the boat out or taking paying passengers.',
    [
      q('You hear a distress call. What must you do?', ['Ignore it if you are not the closest boat', 'Go to help if you can do so safely, and relay the call if you cannot', 'Only write it in the log'], 1, 'Helping people in distress is a duty at sea, as far as you can without seriously endangering your own boat.'),
      q('A friend wants to pay you to take a group out for the day. What applies?', ['Your private licence covers it', 'Carrying passengers for pay needs a special licence for the boat and the skipper', 'It is allowed if they wear lifejackets'], 1, 'Passengers for hire need a commercial licence and matching insurance.'),
      q('Where do you find temporary changes such as a moved buoy or a firing area?', ['In the Notices to Mariners', 'Only on the original chart', 'In the boat’s logbook'], 0, 'Notices to Mariners publish changes and warnings; check them before you sail.'),
    ],
    'skipper:law',
    [
      {page: 0, region: 'israel', text: 'A coastal skipper’s licence (Skipper 30) in Israel allows motor and sailing vessels in coastal waters, and boats of any power, but not carrying passengers for pay or international voyages.'},
      {page: 5, region: 'israel', text: 'In Israel, report accidents to the Israel Shipping and Ports Authority. Read its Notices to Mariners before sailing, and do not approach Israeli ports, oil and chemical tankers, or closed naval areas except as the regulations allow.'},
    ],
  ),
];
