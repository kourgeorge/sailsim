// Weather knowledge for sailors: charts, fronts, wind and waves, and eastern
// Mediterranean patterns. This deeper theory has its own module after the core
// course; its decision exercises live in decision-scenarios.js.
export const weatherModule = {
  id: 'weather',
  title: 'Read the weather',
  outcome: 'Read a weather chart, recognize fronts and clouds, and judge wind, waves and local weather before a passage.',
};
const TRANSFER =
  'Use official marine forecasts and charts for real decisions. These examples are simplified and fictional; real weather varies.';
const lesson = (id, title, concepts, observe, mistake, quiz, figure, conceptFigures = {}) => ({
  id,
  module: weatherModule.id,
  title,
  concepts,
  observe,
  mistake,
  quiz,
  figure,
  conceptFigures,
  practice: null,
  transfer: TRANSFER,
  minutes: 12,
  type: 'Theory & decisions',
  body: concepts[0],
  goal: 'Read the briefing and check your understanding',
  tip: observe[0],
});
const q = (prompt, options, correct, explanation) => ({ prompt, options, correct, explanation });

export const weatherLessons = [
  lesson(
    'sail-54',
    'Read a weather chart',
    [
      'A weather chart, or synoptic chart (a snapshot of the whole area at one time), maps air pressure at sea level. Lines called isobars join places of equal pressure, usually every 4 hectopascals (hPa, the same as millibars). A high (H) usually brings settled weather; a low (L) brings cloud, rain and stronger wind.',
      'The closer the isobars, the stronger the wind. Widely spaced isobars mean light wind; isobars bunched together mean a strong blow. Over the sea the wind blows roughly along the isobars, turned a little in toward the lower pressure.',
      'In the northern hemisphere, wind circles a low anticlockwise and spirals in toward its centre, and circles a high clockwise and spirals out. Stand with your back to the wind and the low is on your left. Three other shapes appear on charts:\n• A trough is a stretched-out low, bringing cloud and rain like a low.\n• A ridge is a stretched-out high, bringing settled weather like a high.\n• A col, or saddle, lies between two highs and two lows, with light and changeable wind.',
      'To estimate the wind at a place on the chart, find the isobars there and see which side the low is on. Then draw the wind along the isobars, turned slightly toward the low. With a low to your west, for example, the wind blows from the south, because it circles the low anticlockwise. Once the low has passed to your east, it blows from the north.',
      'A barometer shows the trend, which matters more than the number. Pressure falling steadily, for example from 1000 to 992 hPa in eight hours, means a low is coming closer and the wind will strengthen; a fall of 3 hPa or more in three hours is a warning. Rising pressure after a low usually brings clearing skies and a wind shift. Record the reading in the log every few hours.',
    ],
    [
      'Look at a real synoptic chart, find the nearest low and see whether its isobars are close together or far apart.',
      'Note the barometer reading and the time, then compare it three hours later.',
    ],
    'Reading one barometer value instead of its trend, or forgetting that wind circles a low anticlockwise in the northern hemisphere.',
    [
      q('On a weather chart the isobars are close together over your area. What do you expect?', ['Strong wind', 'Calm', 'Fog'], 0, 'The closer the isobars, the stronger the wind.'),
      q('In the northern hemisphere, how does the wind blow around a low?', ['Anticlockwise, spiralling in', 'Clockwise, spiralling out', 'Straight toward the centre'], 0, 'Around a low the wind turns anticlockwise and spirals in; around a high it turns clockwise and spirals out.'),
      q('Your barometer reads 1000, 996, then 992 hPa at four-hour intervals. What does it tell you?', ['A low is approaching and the wind will strengthen', 'High pressure is building', 'Nothing; only the number matters'], 0, 'A steady fall means a low is coming closer. Watch the trend and expect more wind.'),
    ],
    'weather:chart',
  ),
  lesson(
    'sail-55',
    'Fronts and clouds',
    [
      'A front is the edge where a mass of warm air meets cold air. Most lows that cross the Mediterranean are frontal lows, carrying fronts with them. In the northern hemisphere a warm front usually comes first, then a warm sector, then a cold front, moving roughly from west to east. On a chart a warm front is drawn with half circles, a cold front with triangles.',
      'As a warm front approaches, high thin cloud thickens and lowers into a grey layer, with steady rain, poor visibility and falling pressure. As it passes, the wind veers (shifts clockwise), for example from south to south-west. In the warm sector behind it the isobars are almost straight, the pressure is steady and the air is warm and moist, often with mist or drizzle. Sea fog forms when warm, moist air like this flows over colder water; near the coast it can come and go quickly.',
      'The cold front brings the roughest weather. It builds towering cumulus and cumulonimbus clouds, heavy showers, sometimes thunderstorms and hail, and a sudden, gusty shift of wind to the west or north-west. Behind it the pressure rises, the air is cooler and the visibility improves greatly, though gusty showers can continue.',
      'Cumulonimbus is a cloud of great vertical growth, often with a flat, anvil-shaped top. It can bring squalls, heavy rain, hail and lightning. Clouds form when rising air cools to its dew point (the temperature at which its moisture turns into visible droplets). The cloud base is the height where that happens. Air stops rising once it is no longer warmer than the air around it; forecasters call the air stable at that height.',
      'In a thunderstorm, stay away from the mast, shrouds and other metal fittings. Keep the crew low in the middle of the boat, and switch off electronics you do not need. Reef early, because the squall under a cumulonimbus can arrive with little warning.',
    ],
    [
      'Watch how cloud changes over a day: thin high cloud thickening and lowering often means a warm front is coming.',
      'Notice the base of cumulus clouds: it is flat because that is the height where rising air reaches its dew point.',
    ],
    'Treating the end of the steady warm-front rain as the end of the bad weather, when the cold front and its squalls are still to come.',
    [
      q('Which clouds come with a cold front?', ['Cumulus and cumulonimbus', 'Only thin high cloud', 'No cloud at all'], 0, 'A cold front lifts air quickly and builds tall cumulus and cumulonimbus, with showers and squalls.'),
      q('After a cold front passes, what usually happens to the visibility?', ['It improves', 'It gets worse', 'It stays the same'], 0, 'Cooler, drier air arrives behind the cold front and the visibility improves.'),
      q('During a thunderstorm aboard, what should you avoid?', ['Being close to the mast and other metal fittings', 'Reefing the sails', 'Wearing a lifejacket'], 0, 'Lightning follows the mast and rigging. Keep clear of metal fittings and stay low in the middle of the boat.'),
    ],
    'weather:fronts',
  ),
  lesson(
    'sail-56',
    'Wind and waves',
    [
      'The Beaufort scale describes wind by its effect on the sea. Forecasts often give the Beaufort force together with the expected gusts. What each force looks like:\n• Force 4 (11–16 knots): many white horses (small breaking crests with white foam).\n• Force 5 (17–21): moderate waves and spray.\n• Force 6 (22–27): large waves with white foam crests everywhere.\n• Force 7 (28–33): a heaped-up sea with foam blown in streaks.\n• Force 8 (34–40): a gale.',
      'A sea breeze is caused by the difference in temperature between land and sea. On a sunny day the land warms faster, warm air rises over it, and cooler sea air flows in toward the shore, usually from late morning to evening. At night the land cools and a lighter land breeze may blow out to sea. Mountains make their own winds too: a katabatic wind is cold air flowing down a mountain slope, often strong and dry at the foot of the mountains.',
      'Wind waves are raised by the local wind. Swell is made of waves that were raised by strong wind in a distant storm and have travelled far from it: long, smooth and regular, and they can arrive before or after the storm itself. When the local wind blows against the swell, the swell becomes lower; wind against current, as Lesson {lesson:sail-20} explains, makes waves short and steep.',
      'Waves grow higher and steeper as they reach shallow water, and in a swell they can break across a harbor entrance. Before entering, watch the waves from outside: they often come in sets, with lulls in between. Time your entry for a lull and go in with enough speed to steer.',
      'Breaking waves near the shore can wreck a yacht. Swell from deep water slows and rises when it reaches shallow water, then breaks as a wall of white water. In breaking waves:\n• The boat can surf down a wave, dig its bow in and swing out of control (a broach).\n• A wave can throw the boat onto rocks, the breakwater or another boat.\n• A crew member can be washed overboard, and is very hard to reach in the surf.\nThe worst position is with the side of the boat to the waves, because a breaking wave can roll it over. Keep the bow or the stern toward them.',
      'The best defence is to stay away from the shore. If the wind and waves are pushing you toward land, act early: set the sails properly or start the engine, and head out to deep water, not closer in. Do not stream a sea anchor near the coast: it holds the bow to the waves, but the boat still drifts onto the beach. If you must come in, choose a harbor that is safe to enter in high seas, even if it is farther away.',
      'To enter through breaking waves:\n• Wait outside and watch the sets.\n• Approach the entrance head-on, from the direction the waves come from, not along the coast with your side to the waves.\n• Put a crew member in the cockpit facing back, to watch the sea behind and call out when a set is coming.\n• Right after the last wave of a set, go in with power and get behind the breakwater quickly.\n• If a set catches you on the way, turn the bow into the waves and hold there with the engine until it passes. Then turn back and continue in.',
    ],
    [
      'Compare the wind instrument with the sea around you and name the Beaufort force from what you see.',
      'On a sunny day, note when the sea breeze starts and how strong it gets by mid-afternoon.',
      'Before entering a harbor in a swell, stop outside and watch a few sets: count the waves in each set and how long the lulls last.',
    ],
    'Planning a return in the afternoon on a hot day without allowing for the sea breeze, or rushing a harbor entrance in a swell.',
    [
      q('The wind gauge shows 25 knots and white foam covers the crests. What Beaufort force is it?', ['Force 6', 'Force 3', 'Force 9'], 0, 'Force 6 is 22–27 knots, with large waves and white foam crests everywhere.'),
      q('What causes the summer sea breeze?', ['The difference in temperature between land and sea', 'The tide', 'A distant storm'], 0, 'The land warms faster than the sea; air rises over the land and sea air flows in.'),
      q('What is swell?', ['Waves raised by strong wind in a distant storm', 'Waves raised by today’s local wind', 'Waves made by passing ships'], 0, 'Swell travels far from the storm that made it, so it can arrive even in light local wind.'),
      q('You approach Herzliya marina from the west in a 2 m westerly swell. What is your plan?', ['Expect bigger, breaking waves at the entrance; wait outside and time your entry for a lull', 'Come in from the north along the coast to check that the entrance is clear', 'Stream a sea anchor and let the boat drift in slowly'], 0, 'The swell grows and may break near the entrance. Coming along the coast puts your side to the waves, and with a sea anchor you still drift onto the shore.'),
      q('Halfway into the entrance, the crew member watching astern calls out that a new set is coming. What do you do?', ['Turn the bow into the waves and hold there with the engine until the set passes, then continue in', 'Slow down and let the waves carry you in', 'Turn side-on so the waves pass under you'], 0, 'A breaking wave from behind can make you surf and lose control, and side-on is the most dangerous position. Face the set, then go in after it.'),
      q('You sail a 14 m yacht from Ashkelon to Haifa, 2 NM off the coast. Off Tel Aviv a 25-knot south-westerly wind starts. What do you do?', ['Carry on north and shelter in Herzliya marina', 'Turn back to Ashkelon', 'Turn in to Tel Aviv marina'], 0, 'Herzliya is about 40 minutes away, large and easy to enter before the sea builds. Ashkelon is far away into the wind and waves, and Tel Aviv marina is small, with an entrance that becomes dangerous in a south-westerly sea.'),
    ],
    'weather:beaufort',
    { 1: 'weather:breeze' },
  ),
  lesson(
    'sail-57',
    'Eastern Mediterranean weather',
    [
      'In winter, lows cross the eastern Mediterranean from the west, and some deepen near Cyprus (their pressure drops further, so the wind gets stronger). Along the Israeli coast they usually bring a warm front first, with southerly to south-westerly wind, then a cold front with stormy south-westerly to westerly wind, rising seas and showers. A forecast of a cold front coming in from the sea means rough weather and high waves.',
      'Sharqiya is a strong, dry easterly wind that blows off the land, mainly in spring and autumn. It is felt most in the north of the country. Near the shore the sea stays flat because the wind blows offshore, but farther out it raises waves and can make the return to harbor hard. Winter easterlies are a different case: cold, strong easterly winds in winter usually come from a high pressure system to the north-east, over Russia, not from a low.',
      'In spring, a hot low can move along North Africa or up from the south. Ahead of it the wind is southerly, hot and dry, dust lowers the visibility along the Mediterranean coast, and Eilat gets southerly wind. When it passes, the wind turns west and the temperature drops.',
      'Summer is usually settled: a north-westerly sea breeze builds along the Israeli coast in the afternoon and dies at night. In the Aegean, the Meltemi is a strong, dry north wind in July and August, often force 6 to 7 for days. Farther away, in the Adriatic, the Bora is a cold, dry, very gusty north-easterly wind that falls from the mountains in winter.',
      'Two seasonal troughs, long fingers of low pressure, also shape the weather around Israel:\n• The Persian trough, in summer, reaches across from the Persian Gulf. It brings the steady north-westerly wind and humid heat of most summer days, and strengthens the afternoon sea breeze.\n• The Red Sea trough, mainly in autumn and spring, reaches north from the Red Sea. It usually brings hot, dry easterly wind (Sharqiya) and haze. When cold air lies above it, it becomes “active” and can set off sudden, violent thunderstorms with no front in sight.\nThe hot spring low from North Africa described above is often called a Libyan low.',
      'Get the weather from more than one source:\n• The official marine forecast, which divides the sea into named areas; a map of the areas is published with it.\n• Radio and VHF weather broadcasts, and NAVTEX on larger boats.\n• Weather apps and websites. They show computer-model forecasts, so compare more than one model.\n• Your own barometer, the sky and the sea.\nKnow the units: pressure in hectopascals (hPa), the same as millibars, with 1013 hPa equal to 760 mmHg or 29.92 inches; temperature in °C, where °F = °C × 9 ÷ 5 + 32; and wind in knots, metres per second (1 m/s is about 2 knots) or Beaufort force.',
    ],
    [
      'Before a passage, read the forecast for the whole region, not just your harbor, and find the nearest low.',
      'On a calm morning with an easterly wind, look offshore: the sea farther out may already be rough.',
    ],
    'Leaving on a flat-calm Sharqiya morning, or planning an Aegean summer passage without allowing for the Meltemi.',
    [
      q('What is the Meltemi?', ['A strong north wind in the Aegean in July and August', 'A warm south wind in Israel in winter', 'A sea breeze in Eilat'], 0, 'The Meltemi blows from the north across the Aegean in high summer, often force 6 to 7 for days.'),
      q('What is the Sharqiya?', ['A dry easterly wind off the land, mainly in spring and autumn', 'A westerly gale in winter', 'A cold front'], 0, 'It blows off the land, so the sea near shore is flat while waves build farther out.'),
      q('A winter low is approaching Israel from the west. What usually comes first?', ['A warm front', 'A cold front', 'A high'], 0, 'The warm front comes first, then the warm sector, then the cold front with the strongest wind and sea.'),
    ],
    'weather:med',
  ),
];
