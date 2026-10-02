// Fictional in-sight / restricted-visibility cases. Answers stay outside scene data.
export const colregsScenarios = [
  {
    id: 'decision-sail-46',
    lessonId: 'sail-46',
    title: 'Sailing encounters: tack, windward and overtaking',
    brief: 'Inspect the diagram and situation report before choosing the response.',
    family: 'colregs',
    stages: [
      {
        id: 'opposite',
        title: 'Different tacks',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Different tacks',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'International rules, in sight, open water, collision risk, no special status or overtaking. You are A on port tack. B is on starboard tack.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'sailing',
          ownTack: 'port',
          otherTack: 'starboard',
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'A keeps clear; both continue monitoring',
              },
              {
                id: 'choice-1',
                label: 'B keeps clear because it is on the right of the diagram',
              },
              {
                id: 'choice-2',
                label: 'Neither vessel has a duty',
              },
            ],
            expected: 'choice-0',
            criticalValues: ['choice-2'],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
      {
        id: 'same',
        title: 'Change to the other viewpoint',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Change to the other viewpoint',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'Now you are B, the leeward yacht. A is windward; both are on starboard tack, with collision risk and no overtaking. A is taking appropriate early action.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'same-tack',
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'Change course unpredictably',
              },
              {
                id: 'choice-1',
                label: 'Initially maintain course and speed, while monitoring',
              },
              {
                id: 'choice-2',
                label: 'Stop keeping lookout',
              },
            ],
            expected: 'choice-1',
            criticalValues: ['choice-2'],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
      {
        id: 'overtake',
        title: 'Overtaking overrides tack',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Overtaking overrides tack',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'You are A, a sailing yacht approaching motor vessel B from 30° abaft B’s beam. The encounter is in sight. You reach abeam, but are not yet past and clear.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'overtake',
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'B must now give way to sail',
              },
              {
                id: 'choice-1',
                label: 'The overtaking duty ended abeam',
              },
              {
                id: 'choice-2',
                label: 'A keeps clear until finally past and clear',
              },
            ],
            expected: 'choice-2',
            criticalValues: ['choice-0', 'choice-1'],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
    ],
    limitations:
      'Study the cited International COLREG rules and the rules applicable to your waters. Rehearse these decisions with an instructor; diagrams assess reasoning, not real collision-avoidance competence.',
  },
  {
    id: 'decision-sail-47',
    lessonId: 'sail-47',
    title: 'Under engine: head-on, crossing and mixed encounters',
    brief: 'Inspect the diagram and situation report before choosing the response.',
    family: 'colregs',
    stages: [
      {
        id: 'crossing',
        title: 'Crossing under engine',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Crossing under engine',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'You are A, heading north, propelled by your engine with sails raised. B is an ordinary motorboat approaching from your starboard. Both are in sight, with crossing risk in open water; neither is overtaking.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'crossing',
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'A gives way and, if circumstances admit, avoids crossing ahead',
              },
              {
                id: 'choice-1',
                label: 'A has sailing priority',
              },
              {
                id: 'choice-2',
                label: 'B must give way because A is larger',
              },
            ],
            expected: 'choice-0',
            criticalValues: ['choice-1'],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
      {
        id: 'reverse',
        title: 'The same crossing from B',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'The same crossing from B',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'Now you are B in the same crossing. A is on your port side and is taking appropriate early avoiding action. No special status or local restriction applies.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'crossing',
          viewpoint: 'B',
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'Always turn to port',
              },
              {
                id: 'choice-1',
                label: 'Maintain course and speed initially, and watch A’s action',
              },
              {
                id: 'choice-2',
                label: 'Ignore A because it gives way',
              },
            ],
            expected: 'choice-1',
            criticalValues: ['choice-2'],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
      {
        id: 'head-on',
        title: 'Head-on on the next leg',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Head-on on the next leg',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'Both ordinary power-driven vessels are now meeting on nearly reciprocal courses with collision risk. They are in sight in open water. There is no overtaking or special status.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'head-on',
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'Only A turns',
              },
              {
                id: 'choice-1',
                label: 'Both turn to port',
              },
              {
                id: 'choice-2',
                label: 'Both turn to starboard for port-to-port passing',
              },
            ],
            expected: 'choice-2',
            criticalValues: ['choice-1'],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
    ],
    limitations:
      'Study the cited International COLREG rules and the rules applicable to your waters. Rehearse these decisions with an instructor; diagrams assess reasoning, not real collision-avoidance competence.',
  },
  {
    id: 'decision-sail-48',
    lessonId: 'sail-48',
    title: 'Give-way and stand-on: act as risk develops',
    brief: 'Inspect the diagram and situation report before choosing the response.',
    family: 'colregs',
    stages: [
      {
        id: 'early',
        title: 'Make the action clear',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Make the action clear',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'You are the give-way vessel in an in-sight crossing. There is adequate sea room for an early course alteration. You have checked nearby traffic and hazards.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'duties',
          phase: 0,
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'Make a substantial, apparent change and monitor its effect',
              },
              {
                id: 'choice-1',
                label: 'Make many tiny turns the other vessel may not notice',
              },
              {
                id: 'choice-2',
                label: 'Wait until very close',
              },
            ],
            expected: 'choice-0',
            criticalValues: ['choice-2'],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
      {
        id: 'may',
        title: 'The other vessel fails to act',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'The other vessel fails to act',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'You are now stand-on B in a crossing of two power-driven vessels. Give-way A is on your port side and clearly not taking appropriate action. There is still room to avoid collision before A alone becomes unable to do so.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'duties',
          phase: 1,
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'You must wait for an emergency',
              },
              {
                id: 'choice-1',
                label: 'You may act; if circumstances admit, avoid turning to port for A',
              },
              {
                id: 'choice-2',
                label: 'A radio call transfers all responsibility to A',
              },
            ],
            expected: 'choice-1',
            criticalValues: ['choice-0', 'choice-2'],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
      {
        id: 'must',
        title: 'Action is now mandatory',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Action is now mandatory',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'The next observation shows the vessels so close that A’s action alone cannot avoid collision. You are still B. The exact maneuver must consider all available sea room and hazards.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'duties',
          phase: 2,
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'Maintain course and speed regardless',
              },
              {
                id: 'choice-1',
                label: 'Sound a signal but take no avoiding action',
              },
              {
                id: 'choice-2',
                label: 'Take the action that best helps avoid collision',
              },
            ],
            expected: 'choice-2',
            criticalValues: ['choice-0', 'choice-1'],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
    ],
    limitations:
      'Study the cited International COLREG rules and the rules applicable to your waters. Rehearse these decisions with an instructor; diagrams assess reasoning, not real collision-avoidance competence.',
  },
  {
    id: 'decision-sail-49',
    lessonId: 'sail-49',
    title: 'Special vessels, narrow channels and traffic lanes',
    brief: 'Inspect the diagram and situation report before choosing the response.',
    family: 'colregs',
    stages: [
      {
        id: 'status',
        title: 'Check actual vessel status',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Check actual vessel status',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'B is a recreational motorboat trolling a line that does not restrict maneuverability. It has no other special status. Classify B before applying the encounter rules.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'status',
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'Ordinary power-driven vessel',
              },
              {
                id: 'choice-1',
                label: 'Always a privileged fishing vessel',
              },
              {
                id: 'choice-2',
                label: 'Not under command',
              },
            ],
            expected: 'choice-0',
            criticalValues: [],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
      {
        id: 'channel',
        title: 'Leave the channel passage clear',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Leave the channel passage clear',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'Your 12 m sailing yacht A plans to cross a narrow channel. Ship B can safely navigate only within it. Crossing now would impede B; you can safely wait outside the channel.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'channel',
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'Cross ahead because A has sails',
              },
              {
                id: 'choice-1',
                label: 'Wait clear and cross when it will not impede B',
              },
              {
                id: 'choice-2',
                label: 'Anchor in the middle of the channel',
              },
            ],
            expected: 'choice-1',
            criticalValues: ['choice-0', 'choice-2'],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
      {
        id: 'lane',
        title: 'Plan the lane crossing',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Plan the lane crossing',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'A must cross an IMO traffic lane flowing north. Current will set A east. A safe gap is available and no power-driven vessel following the lane will be impeded. Choose the heading principle.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'lane',
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'Follow the lane indefinitely',
              },
              {
                id: 'choice-1',
                label: 'Use any heading if ground track is perpendicular',
              },
              {
                id: 'choice-2',
                label: 'Cross on a heading nearly at right angles to traffic flow',
              },
            ],
            expected: 'choice-2',
            criticalValues: [],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
    ],
    limitations:
      'Study the cited International COLREG rules and the rules applicable to your waters. Rehearse these decisions with an instructor; diagrams assess reasoning, not real collision-avoidance competence.',
  },
  {
    id: 'decision-sail-50',
    lessonId: 'sail-50',
    title: 'Read lights, shapes and sound signals',
    brief: 'Inspect the diagram and situation report before choosing the response.',
    family: 'colregs',
    stages: [
      {
        id: 'lights',
        title: 'Read the vertical pattern',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Read the vertical pattern',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'In sight at night, B shows three all-round lights vertically: red, white, red. These are the observed status lights; additional navigation lights depend on its activity and movement.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'lights',
          lights: ['red', 'white', 'red'],
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'Restricted in ability to maneuver',
              },
              {
                id: 'choice-1',
                label: 'A sailing yacht on port tack',
              },
              {
                id: 'choice-2',
                label: 'No special status',
              },
            ],
            expected: 'choice-0',
            criticalValues: [],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
      {
        id: 'shape',
        title: 'Identify the daytime cone',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Identify the daytime cone',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'B is proceeding under sail and shows a black cone with its point down. No other special status is reported. Which propulsion status does that day shape communicate?',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'shape',
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'Sail propulsion only',
              },
              {
                id: 'choice-1',
                label: 'Also propelled by machinery: power-driven',
              },
              {
                id: 'choice-2',
                label: 'At anchor',
              },
            ],
            expected: 'choice-1',
            criticalValues: [],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
      {
        id: 'doubt',
        title: 'Signal doubt promptly',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Signal doubt promptly',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'The vessels are in sight and approaching. You do not understand B’s intentions and doubt that B is taking sufficient action to avoid collision. Select the International warning signal and follow-up.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'signals',
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'One prolonged blast and stop observing',
              },
              {
                id: 'choice-1',
                label: 'Three short blasts to demand priority',
              },
              {
                id: 'choice-2',
                label: 'At least five short rapid blasts; continue assessment and required action',
              },
            ],
            expected: 'choice-2',
            criticalValues: ['choice-0'],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
    ],
    limitations:
      'Study the cited International COLREG rules and the rules applicable to your waters. Rehearse these decisions with an instructor; diagrams assess reasoning, not real collision-avoidance competence.',
  },
  {
    id: 'decision-sail-51',
    lessonId: 'sail-51',
    title: 'Restricted visibility and a complete encounter plan',
    brief: 'Inspect the diagram and situation report before choosing the response.',
    family: 'colregs',
    stages: [
      {
        id: 'radar',
        title: 'Assess the unseen contact',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Assess the unseen contact',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'In fog, B is detected by radar alone forward of your beam. Collision risk exists. You are not overtaking B. If choosing a course alteration, which direction should be avoided as far as possible under Rule 19(d)?',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'fog',
          stage: 0,
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'Avoid altering to port for B; assess all safe options',
              },
              {
                id: 'choice-1',
                label: 'Always turn to port',
              },
              {
                id: 'choice-2',
                label: 'Claim stand-on status because B is unseen',
              },
            ],
            expected: 'choice-0',
            criticalValues: ['choice-1', 'choice-2'],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
      {
        id: 'sound',
        title: 'A fog signal ahead',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'A fog signal ahead',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'A fog signal is now heard apparently forward of the beam. You have not determined that collision risk is absent. Your yacht is under engine.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'fog',
          stage: 1,
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'Maintain cruising speed until visual contact',
              },
              {
                id: 'choice-1',
                label:
                  'Reduce to minimum course-keeping speed, stop way if needed, use extreme caution',
              },
              {
                id: 'choice-2',
                label: 'Sound a horn instead of changing speed',
              },
            ],
            expected: 'choice-1',
            criticalValues: ['choice-0', 'choice-2'],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
      {
        id: 'reassess',
        title: 'Reassess after taking action',
        brief: 'Inspect the diagram and situation report before choosing the response.',
        goal: 'Reassess after taking action',
        facts: [
          {
            id: 'report',
            label: 'Situation report',
            text: 'You have slowed and begun avoiding action. A new radar observation shows the same bearing and a shorter range. The contact remains unseen. No safe passing outcome has been established.',
          },
        ],
        requiredFacts: ['report'],
        scene: {
          variant: 'fog',
          stage: 2,
        },
        fields: [
          {
            id: 'response',
            label: 'Your decision',
            type: 'select',
            options: [
              {
                id: 'choice-0',
                label: 'Declare clear because you already acted',
              },
              {
                id: 'choice-1',
                label: 'Switch to ordinary sailing priority',
              },
              {
                id: 'choice-2',
                label:
                  'Keep the risk open, reassess action and monitor until safe passing is established',
              },
            ],
            expected: 'choice-2',
            criticalValues: ['choice-0', 'choice-1'],
          },
        ],
        success: 'Checkpoint complete. Reassess the next situation on its own facts.',
        retry:
          'Review the encounter, applicable rule and both vessels’ duties, then revise your decision.',
      },
    ],
    limitations:
      'Study the cited International COLREG rules and the rules applicable to your waters. Rehearse these decisions with an instructor; diagrams assess reasoning, not real collision-avoidance competence.',
  },
];
