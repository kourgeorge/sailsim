// Chart work for the coastal skipper: the geographic grid, compass errors, fixes,
// horizon and passing distances, current and leeway, time and tides. These lessons
// cover the Navigation A exam topics; their decision exercises live in decision-scenarios.js.
export const chartworkModule = {
  id: 'chartwork',
  title: 'Work on the chart',
  outcome: 'Plot positions, convert compass courses and bearings, fix the boat, allow for current and leeway, and work out horizon distances, time and tides.',
};
const TRANSFER =
  'Practise chart work on a real paper chart with dividers and a plotter, and check every calculation with an instructor. The examples here are simplified.';
const lesson = (id, title, concepts, observe, mistake, quiz, figure, conceptFigures = {}) => ({
  id,
  module: chartworkModule.id,
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

export const chartworkLessons = [
  lesson(
    'sail-63',
    'Latitude, longitude and the chart',
    [
      'Every position on Earth has a latitude and a longitude:\n• Latitude is how far north or south of the equator you are, from 0° at the equator to 90° at the poles.\n• Longitude is how far east or west of the Greenwich meridian (the north–south line through Greenwich, near London) you are, from 0° to 180°.\nEach degree has 60 minutes (′), and minutes are written with decimals. Tel Aviv marina is at about 32°05′ N, 034°46′ E: latitude first, then longitude.',
      'You can also give a position as a bearing and distance from a charted object, for example “270° from Jaffa lighthouse, 3 NM”. The bearing is measured from the object out to the boat. Draw the line from the object in that direction and measure the distance along it.',
      'Most sea charts use the Mercator projection. The meridians (lines of longitude) are drawn parallel, so a straight line on the chart is a line of constant compass course. The price is that the scale grows as you move away from the equator, so a mile looks longer on the chart the farther north you go. So measure distance only on the latitude scale at the side of the chart, beside your position: one minute of latitude is one nautical mile. Never use the longitude scale along the top or bottom.',
      'To measure a distance, open the dividers between the two points and read them on the latitude scale at the same height. To measure a direction, lay the plotter or parallel rulers along the line and read the angle against true north, or move the line to the compass rose printed on the chart. Its outer ring shows true directions, and the inner ring magnetic.',
      'Chart symbols and abbreviations are explained in the booklet Chart 5011 (INT 1). Some you will use all the time:\n• Depths in metres below chart datum, the lowest water level the chart allows for.\n• Underlined figures: heights that dry at low water.\n• Seabed letters: S sand, M mud, R rock, Sh shells, Wd weed. They help you choose an anchorage.\n• A light: “Fl(3) 10s 15m 12M” means three flashes every 10 seconds, the light is 15 m above the water and its nominal range is 12 NM.',
      'A large-scale chart shows a small area in great detail, such as a harbour plan; a small-scale chart shows a large area with less detail. Use the largest scale near the coast. A chart catalogue lists every chart and the area it covers, so you can choose the right ones before a passage.',
      'A chart is only as good as its last correction. Hydrographic offices publish Notices to Mariners with changes: new wrecks, moved buoys, changed lights. Mark each correction on the chart and note its number in the bottom corner, so you can see how up to date the chart is.',
    ],
    [
      'Find the latitude and longitude scales on a chart, and measure one nautical mile on the latitude scale.',
      'Look up three symbols you do not know in Chart 5011.',
    ],
    'Measuring a distance on the longitude scale, or on the latitude scale far from your own position.',
    [
      q('Where do you measure a distance on a Mercator chart?', ['On the latitude scale at the side, beside your position', 'On the longitude scale at the top', 'Anywhere, because the scale is the same everywhere'], 0, 'One minute of latitude is one nautical mile. The scale changes with latitude, so use the part of the scale level with your position.'),
      q('A light is charted as “Fl(3) 10s 15m 12M”. What does “12M” tell you?', ['It shows 12 flashes a minute', 'Its nominal range is 12 nautical miles', 'It is 12 m high'], 1, 'Fl(3) is three flashes, 10s the period, 15m the height and 12M the nominal range in nautical miles.'),
      q('Your position is given as “090° from the lighthouse, 2 NM”. Where are you?', ['2 NM west of the lighthouse', '2 NM east of the lighthouse', '2 NM north of the lighthouse'], 1, 'The bearing is measured from the object to the boat: 090° from the lighthouse puts you to its east.'),
    ],
    'chartwork:grid',
  ),
  lesson(
    'sail-64',
    'Compass courses and bearings',
    [
      'A direction can be given in three ways, and you must always say which:\n• True (T): measured from true north, as on the chart.\n• Magnetic (M): measured from magnetic north, where a compass with no error would point.\n• Compass (C): what your own compass actually shows.\nVariation turns true into magnetic, and deviation turns magnetic into compass. Lesson {lesson:sail-22} gives the rule: going from compass to true, add East errors and subtract West ones.',
      'Variation depends on where you are and changes slowly over the years. The compass rose gives it with a year and a yearly change, for example “3°30′ E 2015 (8′ E)”. In 2025, ten years later, it has grown by 10 × 8′ = 80′, or 1°20′, to 4°50′ E. Round it to 5° E.',
      'Deviation depends on the boat’s heading, not on the direction you are looking. Read it from the boat’s deviation card for the heading you are steering. A hand bearing compass, held well away from the boat’s metal and electrics, is usually taken to have no deviation: correct its bearings for variation only.',
      'Work the same way for courses and bearings. Example, from compass to true: you steer 210° C, the deviation card gives 2° W and variation is 5° E. Magnetic = 210 − 2 = 208° M; True = 208 + 5 = 213° T. From true to compass you do the opposite: 213° T − 5° E = 208° M, and 208° M + 2° W = 210° C.',
      'A relative bearing is measured from the bow, clockwise from 000° to 360°: 090° relative is abeam to starboard and 270° is abeam to port. Some crews use 0° to 180° red (port) or green (starboard) instead. To turn a relative bearing into a true one, add your true heading: heading 040° T and an object 100° relative give 140° T. If the sum is more than 360°, subtract 360°.',
      'A transit, or leading line, is two charted objects in line, and the chart gives its true bearing. It is the best way to check the compass. Say the chart gives a transit as 076° T and variation is 5° E, so the magnetic bearing is 071° M. As the objects come into line, your steering compass reads 074° C. It reads 3° more than magnetic, so the deviation on this heading is 3° W.',
      'You will meet several kinds of compass:\n• The steering compass: a magnetic card floating in liquid, gimballed to stay level, mounted where the helmsman can see it.\n• The hand bearing compass: for taking bearings of objects.\n• The electronic (fluxgate) compass: senses the Earth’s magnetism and feeds the autopilot and instruments. It is still magnetic, so it has variation and deviation too.\nA GPS gives your course over the ground, not where the bow points, and shows nothing useful when the boat is stopped.',
    ],
    [
      'Find the compass rose on a chart and work out this year’s variation from its yearly change.',
      'Take a hand bearing of a fixed object and convert it to true.',
    ],
    'Using the deviation for the direction of the object instead of for the boat’s heading.',
    [
      q('You steer 120° C. Deviation on this heading is 3° E and variation is 5° E. What is your true course?', ['112° T', '128° T', '122° T'], 1, 'From compass to true, add East errors: 120 + 3 = 123° M, then 123 + 5 = 128° T.'),
      q('Your true heading is 300° and a buoy bears 090° relative. What is its true bearing?', ['030° T', '210° T', '390° T'], 0, '300 + 090 = 390; subtract 360 to get 030° T.'),
      q('A charted transit is 155° T, variation is 5° E, and the steering compass reads 152° C on the transit. What is the deviation?', ['2° E', '2° W', '7° W'], 1, 'The magnetic bearing is 155 − 5 = 150° M. The compass reads 2° more than magnetic, so the deviation is 2° W. Check: 152 − 2 + 5 = 155° T.'),
    ],
    'chartwork:compass',
  ),
  lesson(
    'sail-65',
    'Fix your position',
    [
      'Navigators use three kinds of position, each with its own chart symbol:\n• Dead reckoning (DR): worked from your course and the distance run through the water. Mark it with a short cross line on the track.\n• Estimated position (EP): the DR corrected for current and leeway. Mark it with a triangle.\n• Fix: found from outside references such as bearings, ranges or GPS. Mark it with a small circle around a dot.\nWrite the time and the log reading beside every position.',
      'A cross-bearing fix uses compass bearings of two or, better, three charted objects. Convert each bearing to true and draw it on the chart as a line ending at the object: you are somewhere on each line, so you are where they cross. Choose objects that are clearly identified and well apart in angle: two bearings about 90° apart, or three about 60° apart.',
      'Take the bearings quickly, one after another. Take the object ahead or astern first, because its bearing changes slowly, and the object abeam last, because its bearing changes fastest. Three lines rarely meet at one point; they form a small triangle, the “cocked hat”. A small triangle means a good fix. Take the corner nearest to danger as your position until you can check it.',
      'Other ways to fix the boat:\n• Bearing and range of one object: the bearing line and a circle of that distance around the object cross at one point. Radar gives both together.\n• Two ranges: two circles around two objects cross at two points; use a bearing or the depth to choose between them.\n• Range and depth: a rough position where the circle crosses the depth contour that matches your sounder reading, corrected for tide.',
      'A running fix uses one object at two times, when nothing else is in sight. Take a bearing and note the time and the log. Keep a steady course, and when the bearing has changed by at least 30°, take a second. Move the first bearing line along your course by the distance run between the two bearings: where the moved line crosses the second bearing is your position. Any current you ignored makes it less accurate.',
      'GPS gives an accurate fix almost anywhere, but it can fail, and a position typed into the wrong datum or a wrong waypoint can put you on the rocks. Plot the GPS position on the chart and log it regularly, at least every hour on passage. Check it now and then against a bearing or a depth: two independent methods that agree are worth far more than one.',
    ],
    [
      'Choose three charted objects along your coast that would give a good three-bearing fix.',
      'Compare your sounder reading with the charted depth at your GPS position.',
    ],
    'Taking bearings of objects close together in angle, or taking the bearing abeam first.',
    [
      q('Your three bearing lines make a small triangle. Which position do you use?', ['The centre of the triangle', 'The corner nearest to danger', 'The corner farthest from danger'], 1, 'Until you can check it, assume you are in the most dangerous place the fix allows.'),
      q('In a cross-bearing fix, which bearing should you take last?', ['The object ahead', 'The object abeam', 'The object astern'], 1, 'The bearing of an object abeam changes fastest, so take it last, just before you plot.'),
      q('What is a running fix?', ['A fix from bearings of two objects taken at the same time', 'A fix from one object’s bearings at two times, with the first line moved by the distance run', 'A GPS position taken while the boat is moving'], 1, 'The first bearing line is moved along the course by the distance run and crossed with the second bearing.'),
    ],
    'chartwork:fix',
  ),
  lesson(
    'sail-66',
    'Horizon, lights and passing distance',
    [
      'The higher you are, the farther you can see. The distance to the horizon in nautical miles is about 2.08 × √(height of eye in metres), or about 1.15 × √(height in feet). Some tables use 1.17 for feet; the answers differ only a little. One metre is 3.28 feet. Sitting in a cockpit with your eye 2.5 m above the water, √2.5 ≈ 1.58, so the horizon is about 2.08 × 1.58 ≈ 3.3 NM away.',
      'A tall object can be seen from farther away, because it has its own horizon too. Add the two distances: the greatest distance at which you can see an object = 2.08 × (√ height of eye + √ height of object), with both heights in metres. A lighthouse 49 m high has a horizon of 2.08 × 7 = 14.6 NM, so from an eye height of 2.5 m its light can show up to about 14.6 + 3.3 = 17.9 NM away.',
      'You see a light at the shorter of two distances: this geometric range, and its luminous range, how far its brightness carries. The chart gives the nominal range, for example 12M. A light 49 m high with a 12M range shows at about 12 NM in clear weather, not 17.9 NM. When a strong light first appears over the horizon, its rising, you are about at its geometric range: with its bearing, that gives a rough fix. Heights of lights on the chart are measured above high water.',
      'To pass a headland or a danger safely, first decide your passing distance, for example 1 NM. Draw a circle of that radius around the danger and plan your track to touch the outside of the circle. On the way, check your distance off with the radar range, with a bearing and the chart, or with a clearing bearing.',
      'A clearing bearing is a bearing of a charted object that keeps you clear of a danger. Draw the line from the object past the edge of the danger and read its bearing, for example 040° T. Then write which side is safe: “not less than 040°”. Take the object’s bearing often; while it stays on the safe side, you are clear of the danger.',
      'You can find your distance off from a single object with no chart work, by doubling the angle on the bow. Hold a steady course and note the object’s angle from the bow and the log. When the angle has doubled, your distance from the object equals the distance you have run. A common case is 45°, then 90° abeam: at 6 knots, if the angle goes from 45° to 90° in 30 minutes, you ran 3 NM, so you pass 3 NM off. Current makes the answer less accurate.',
    ],
    [
      'Estimate your height of eye in the cockpit and work out your distance to the horizon.',
      'Find a light on your local chart and work out where you should first see it.',
    ],
    'Expecting to see a light at its geometric range when its luminous range is shorter, or the other way round.',
    [
      q('Your eye is 4 m above the water. About how far is your horizon?', ['About 2 NM', 'About 4.2 NM', 'About 8.3 NM'], 1, '√4 = 2, and 2.08 × 2 ≈ 4.2 NM.'),
      q('A headland light bears 45° on your bow. At 5 knots it is abeam (90°) 36 minutes later. How far off are you?', ['3 NM', '5 NM', '1.5 NM'], 0, 'The angle doubled, so the distance off equals the distance run: 5 kn × 0.6 h = 3 NM.'),
      q('A clearing bearing is marked “not less than 040°”. The object now bears 035°. What does it mean?', ['You are clear of the danger', 'You are on the dangerous side and must turn away', 'The compass is wrong'], 1, 'The bearing is less than 040°, so you are on the danger side of the clearing line.'),
    ],
    'chartwork:horizon',
  ),
  lesson(
    'sail-67',
    'Allow for current and leeway',
    [
      'Lesson {lesson:sail-39} showed that the boat moves through the water while the water itself moves. To reach a point you must steer a course that cancels both the current and leeway, the sideways slip the wind causes. The chart work for this is the course-to-steer triangle.',
      'Leeway pushes the boat downwind of where it points. It is largest close-hauled in strong wind, often 5° or more, and small on a run. Estimate it from the angle between your wake and the centreline. To correct it, steer into the wind by the leeway angle: to make good 090° T with the wind from the north and 5° of leeway, steer 085° T.',
      'To draw the course-to-steer triangle for one hour:\n1. Draw the track you want from your position A toward the destination B.\n2. From A draw the current for one hour: its set (direction) and drift (speed), for example 090° at 2 knots.\n3. From the end of the current line, open the dividers to your speed through the water, for example 5 knots, and mark where they cut the track line.\n4. The line from the end of the current to that mark is the course to steer. The distance from A to the mark is your speed over the ground.',
      'Worked example: you want to make good 000° T, the current sets 090° at 2 knots and you sail at 5 knots. The triangle gives a course to steer of about 336° T, aimed 24° up into the current, and a speed over the ground of about 4.6 knots. A 12 NM leg then takes 12 ÷ 4.6 ≈ 2.6 hours, about 2 hours 37 minutes.',
      'The same triangle works backwards to find your estimated position. If you steer 000° T at 5 knots for one hour and the current sets 090° at 2 knots, draw the water track 5 NM north, then add the current 2 NM east. Your EP is about 5.4 NM away, on a track of about 022° T.',
      'Work in this order: solve the current triangle in true, then correct for leeway, then turn the true course into a compass course with variation and deviation. Information on currents comes from the chart, pilot books and current atlases. Along the Israeli coast the current is usually weak and often sets north, but it varies, so check your progress against fixes and correct the course as you go.',
    ],
    [
      'Next time you sail close-hauled, estimate your leeway from the angle of the wake.',
      'Draw a course-to-steer triangle for a short leg on your local chart.',
    ],
    'Steering straight at the destination and letting the current carry you sideways, or applying leeway the wrong way.',
    [
      q('In the course-to-steer triangle, what do you draw from your position first?', ['Your speed through the water', 'The current for one hour', 'The compass course'], 1, 'Draw the current first; then swing your boat speed from its end to cut the track line.'),
      q('You want to make good 180° T. The wind is from the west and leeway is 6°. Which way do you correct?', ['Steer 174° T', 'Steer 186° T, toward the wind', 'Steer 180° T; leeway does not matter'], 1, 'With the wind from the west, leeway pushes you east. Steer 6° toward the west: 186° T.'),
      q('You make 4.5 knots over the ground on a 9 NM leg. How long will it take?', ['1 hour', '2 hours', '2.5 hours'], 1, 'Time = distance ÷ speed over the ground: 9 ÷ 4.5 = 2 hours.'),
    ],
    'chartwork:current',
  ),
  lesson(
    'sail-68',
    'Time and tides',
    [
      'Navigation and radio use UTC (Coordinated Universal Time), the same as Greenwich Mean Time. Local time differs by your time zone. Each zone covers 15° of longitude, one hour. Israel is at about 34° E, in the zone two hours ahead of UTC: Israel Standard Time is UTC+2, and in summer, Israel Daylight Time, it is UTC+3.',
      'To convert, apply the zone difference. In summer, 14:00 Israeli time is 14:00 − 3 = 11:00 UTC. In winter, 08:00 UTC is 08:00 + 2 = 10:00 Israeli time. Weather forecasts, tide tables and radio warnings often give UTC, so check which time a table uses, and whether it includes summer time. Write the time zone in the logbook, for example “ship’s time UTC+3”.',
      'Tides are caused mainly by the Moon, with help from the Sun. Most coasts have two high waters and two low waters a day: about 6 hours 12 minutes from high to low, so each tide is about 50 minutes later than the day before. Spring tides, with the biggest range, come just after new and full moon; neap tides, with the smallest range, come at half moon.',
      'Tide tables give the times and heights of high and low water at a port, as heights above chart datum. The water depth at a place is the charted depth plus the height of the tide. Over a drying bank, the depth is the height of the tide minus the underlined drying height. Lesson {lesson:sail-38} adds the clearance under the keel.',
      'To estimate the height between high and low water, use the rule of twelfths. In the six hours from low to high water the tide rises 1, 2, 3, 3, 2 and 1 twelfths of its range. Example: low water 0.3 m at 08:00, high water 1.5 m at 14:00, a range of 1.2 m. At 10:00, after two hours, it has risen 1 + 2 = 3 twelfths: 3/12 × 1.2 = 0.3 m. The height is 0.3 + 0.3 = 0.6 m.',
      'In the eastern Mediterranean the tide is small, only a few tens of centimetres, and wind and pressure often change the water level more than the tide does. In the Gulf of Eilat the range is larger. Wherever you sail, the moving tide also makes tidal streams, the flood and the ebb, which are strongest halfway between high and low water.',
    ],
    [
      'Convert the time of the next marine forecast from UTC to local time.',
      'Look up today’s high and low water for a port you know, and note the range.',
    ],
    'Forgetting to convert a table’s UTC times, or its summer time, into the time on the boat’s clock.',
    [
      q('It is 16:00 Israeli summer time. What is the time in UTC?', ['13:00 UTC', '14:00 UTC', '19:00 UTC'], 0, 'Israeli summer time is UTC+3, so subtract 3 hours.'),
      q('Low water is 0.2 m at 06:00 and high water is 1.4 m at 12:00. What is the height at 09:00?', ['0.5 m', '0.8 m', '1.1 m'], 1, 'After three hours the tide has risen 1 + 2 + 3 = 6 twelfths, half the 1.2 m range: 0.2 + 0.6 = 0.8 m.'),
      q('When do spring tides, with the biggest range, occur?', ['At half moon', 'Just after new and full moon', 'Only in spring'], 1, 'Springs come when the Sun and Moon pull in line, at new and full moon; the name has nothing to do with the season.'),
    ],
    'chartwork:tide',
  ),
];
