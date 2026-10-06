export const nightModule = {
  id: 'night-navigation',
  title: 'Practical night navigation',
  outcome:
    'Navigate by flashing lights and a leading line, then make a controlled stop in safe water.',
};

export const nightLessons = [
  {
    id: 'sail-53',
    module: nightModule.id,
    level: 'advanced',
    prerequisite: 'sail-52',
    title: 'Navigate a night approach',
    sub: nightModule.outcome,
    minutes: 10,
    type: 'Guided practice',
    concepts: [
      'Start in Haven after dark, with sails lowered and the engine in neutral. Open the chart before moving. The lighthouse flashes white once every 6 seconds; buoy 1 flashes yellow every 4 seconds. Observe complete cycles and match both color and period to the chart.',
      'Use gentle ahead thrust and steer 000° toward the first checkpoint, passing east of buoy 1. Turn toward 027° for the second checkpoint. The two steady white lights on North Head form the leading line: the higher rear light should sit above the front light. Cross-check the alignment with heading, chart position and at least 3 metres of water depth.',
      'Keep below 3 knots throughout. Slow before the final circle and use a brief astern input to check momentum, then neutral. Hold below 0.15 knots on 027° for five seconds. If references disagree, remain in verified safe water. The route and light characteristics are fictional training aids.',
    ],
    observe: [
      'Watch the white lighthouse for two complete 6-second cycles before setting off. The beacons pause when the simulation is paused.',
      'Use W/S or the engine slider for thrust and N for neutral. Make small helm corrections; the chart and goal panel show the next checkpoint.',
    ],
    mistake:
      'Identifying a light by color alone or reaching the stopping circle before reducing speed.',
    quiz: [
      {
        prompt: 'Which observation identifies the Haven lighthouse in this exercise?',
        options: [
          'Any white light',
          'A white flash once every 6 seconds',
          'A yellow flash once every 4 seconds',
        ],
        correct: 1,
        explanation: 'Match the color and the complete flash period with the training light list.',
      },
      {
        prompt: 'What completes the final checkpoint?',
        options: [
          'Passing the circle at speed',
          'Selecting neutral anywhere',
          'Holding the marked position and heading below 0.15 knots in neutral',
        ],
        correct: 2,
        explanation:
          'Position, heading, speed and neutral must meet the targets together for five continuous seconds.',
      },
    ],
    transfer:
      'Practice real night pilotage with an instructor using current charts and light lists. This exercise does not reproduce dark adaptation, visibility limits or every vessel-light configuration.',
    practice: {
      setup: {
        locationId: 'haven',
        timeOfDay: 'night',
        x: 120,
        z: 0,
        heading: 0,
        speed: 0,
        sails: 0,
        throttle: 0,
        windSpeed: 3,
        currentSpeed: 0,
      },
      propulsion: 'engine',
      maxSpeed: 3,
      area: { x: 155, z: -125, radius: 230 },
      chart: { center: { x: 110, z: -270 }, span: 1000 },
      steps: [
        {
          label: 'Review the chart and light characteristics',
          kind: 'event',
          value: 'chart',
          duration: 0,
          hint: 'Open the chart. Find Fl W 6s, buoy 1 (Fl Y 4s), and the steady white leading lights on 027°.',
        },
        {
          label: 'Approach buoy 1 on 000° at 0.5–2.5 knots',
          kind: 'engineWaypoint',
          value: { x: 120, z: -85, heading: 0, speed: [0.5, 2.5], radius: 12, tolerance: 15 },
          duration: 0,
          hint: 'Use gentle ahead thrust and steer north. Keep the yellow buoy to port and compare its 4-second flash with the chart.',
        },
        {
          label: 'Join the leading line on 027° at 0.5–2 knots',
          kind: 'engineWaypoint',
          value: { x: 165, z: -195, heading: 27, speed: [0.5, 2], radius: 14, tolerance: 12 },
          duration: 0,
          hint: 'Turn gradually toward 027°. Align the two steady white lights ahead; confirm your depth and chart position.',
        },
        {
          label: 'Stop on 027°, neutral, below 0.15 knots',
          kind: 'engineStop',
          value: { x: 190, z: -245, heading: 27, radius: 10, tolerance: 10, maxSpeed: 0.15 },
          duration: 5,
          hint: 'Slow early. Use a short astern input, then neutral in the final circle. Hold position and heading for five seconds.',
        },
      ],
      debrief:
        'You reviewed the light list, steered a night approach, joined the leading line and stopped in safe water.',
    },
  },
];
for (const lesson of nightLessons) {
  lesson.body = lesson.concepts[0];
  lesson.goal = lesson.practice.steps[0].label;
  lesson.tip = lesson.observe[0];
}
