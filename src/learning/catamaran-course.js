export const catamaranModule = {
  id: 'catamaran',
  title: 'Catamaran handling',
  outcome: 'Use twin engines deliberately and account for beam, windage, and sail loads.',
};

const stop = (label, x, radius, hint) => ({
  label,
  kind: 'engineStop',
  value: { x, z: 0, heading: 90, radius, tolerance: 10, maxSpeed: 0.15 },
  duration: 5,
  hint,
});

export const catamaranLessons = [
  {
    id: 'sail-52',
    module: 'catamaran',
    level: 'advanced',
    title: 'Handle a catamaran with twin engines',
    sub: catamaranModule.outcome,
    minutes: 10,
    prerequisite: 'sail-51',
    type: 'Guided practice',
    concepts: [
      'A cruising catamaran has two widely spaced hulls and engines. Allow for its beam when choosing a berth or turning space. Shallow draft does not guarantee clearance; check the actual vessel, depth, and margins. High topsides and a wide cabin can catch the wind at low speed.',
      'The engines are far apart, so each one pushes on a long lever: opposite thrust spins the boat almost on the spot. Equal engine commands give mainly ahead or astern motion. With the helm centered, port ahead and starboard astern turn the bow to starboard; reverse the commands to turn to port. Use gentle bursts with neutral between them. Equal lever settings need not produce equal ahead and astern thrust, so watch both heading and drift.',
      'This exercise starts in open water with sails lowered. Use the separate port and starboard engine controls to turn from 000° to 090° within the starting circle. Stop the rotation and select neutral on both engines for five seconds. Then use the linked engine control to reach the next marker and stop in the final circle. Stay below 2.5 knots and clear of traffic.',
      'Under sail, a catamaran may heel little even as loads increase. Reef early using the boat maker’s guidance, forecast, sea state, and crew ability. Wide beam provides initial stability, not immunity from capsize; do not use low heel as permission to carry more sail.',
    ],
    observe: [
      'Keep the helm centered for the pivot; use opposing engines and ease before 090° to allow for momentum.',
      'N or the linked neutral control stops both engines. Opposing engine commands are not neutral, even if their average is zero.',
    ],
    mistake: 'Relying on the rudder at rest, or assuming low heel means low sail loads.',
    quiz: [
      {
        prompt: 'With the helm centered, which engine combination turns the bow to starboard?',
        options: [
          'Port ahead and starboard astern',
          'Port astern and starboard ahead',
          'Both engines equally ahead',
        ],
        correct: 0,
        explanation:
          'The separated thrust forces form a turning couple. Watch drift because ahead and astern thrust may differ.',
      },
      {
        prompt:
          'The wind is increasing but the catamaran is hardly heeling. What should guide reefing?',
        options: [
          'Wait for a large heel angle',
          'The boat maker’s guidance, conditions, loads, and crew ability',
          'Beam makes reefing unnecessary',
        ],
        correct: 1,
        explanation:
          'Low heel can hide increasing loads. Catamarans have finite stability and need timely sail reduction.',
      },
    ],
    practice: {
      setup: {
        locationId: 'haven',
        vesselId: 'catamaran',
        x: 0,
        z: 0,
        heading: 0,
        speed: 0,
        sails: 0,
        throttle: 0,
        windSpeed: 3,
        currentSpeed: 0,
      },
      propulsion: 'engine',
      maxSpeed: 2.5,
      area: { x: 35, z: 0, radius: 100 },
      chart: { center: { x: 35, z: 0 }, span: 220 },
      steps: [
        stop(
          'Pivot to 090° and hold neutral below 0.15 knots',
          0,
          12,
          'Center the helm. Use port ahead and starboard astern gently. Ease early, check the turn, and select neutral on both engines.',
        ),
        {
          label: 'Proceed on 090° at 0.5–1.5 knots',
          kind: 'engineWaypoint',
          value: { x: 40, z: 0, heading: 90, speed: [0.5, 1.5], radius: 8, tolerance: 15 },
          duration: 0,
          hint: 'Use the linked engine control for equal ahead thrust. Keep the bow east and watch the marker.',
        },
        stop(
          'Stop on 090° with both engines neutral',
          65,
          7,
          'Reduce power early. Use brief astern thrust to check headway, then neutral. Hold below 0.15 knots for five seconds.',
        ),
      ],
      debrief:
        'You turned a twin-engine catamaran, made a controlled approach, and stopped with both engines neutral.',
    },
    transfer:
      'Practice on the specific catamaran with a qualified instructor. This model does not assess real windage, propeller wash, mooring lines, or capsize recovery.',
  },
];
for (const lesson of catamaranLessons) {
  lesson.body = lesson.concepts[0];
  lesson.goal = lesson.practice.steps[0].label;
  lesson.tip = lesson.observe[0];
}
