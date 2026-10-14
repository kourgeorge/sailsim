// Signal flags and visiting other countries. This lesson sits in "Share the water"
// after "Lights, marks, and signals"; its decision exercise lives in decision-scenarios.js.
const q = (prompt, options, correct, explanation) => ({ prompt, options, correct, explanation });
const concepts = [
  'Single flags of the International Code of Signals carry short, urgent messages. Two of them tell you to keep clear:\n• Flag A, white and blue with a swallow-tailed (notched) end: "I have a diver down; keep well clear at slow speed." A diver may come up anywhere near the boat.\n• Flag B, red and swallow-tailed: the vessel is loading, unloading or carrying dangerous goods such as fuel. Keep clear, though you may still pass or enter a harbor with care. At night she also shows an all-round red light (seen from every direction).',
  'Two other single flags are about people and arriving in port:\n• Flag O, red and yellow halves: man overboard. Keep a lookout for a person in the water.\n• Flag Q, plain yellow: "My vessel is healthy and I request free pratique." Free pratique is permission from the port health authorities to enter port and go ashore.',
  'Flags N over C, hoisted together, are a distress signal, and so is a square flag with a ball above or below it. A single code flag on its own never means distress. Read a hoist of several flags from the top down. A vessel at anchor may fly a signal flag as well as showing her black ball.',
  'Your ensign, the flag of the country where the boat is registered, flies at the stern. In another country’s waters, also fly that country’s flag, the courtesy flag, under the starboard spreader (the crossbar on the mast). On first arrival, fly the yellow Q flag under the port spreader until customs and immigration have cleared you, then lower it.',
  'Some countries require extra papers for a visiting yacht. Turkey, for example, issues a transit log at an official port of entry, which then allows free movement in Turkish coastal waters. Before you leave, check the entry rules, ports of entry and reporting requirements of every country on your route, and of your own country for the return.',
];

export const flagsLessons = [
  {
    id: 'sail-61',
    module: 'seamanship',
    title: 'Signal flags and visiting other countries',
    concepts,
    observe: [
      'Find the code flags aboard and name what each single flag means.',
      'Before a trip abroad, list the flags you will fly and where each one goes.',
    ],
    mistake: 'Treating a single code flag as a distress signal, or flying a courtesy flag in place of your own ensign.',
    quiz: [
      q('A vessel arriving in port flies a plain yellow flag. What does it mean?', ['My vessel is healthy and I request free pratique', 'I have a diver down', 'Man overboard'], 0, 'Flag Q asks for free pratique, permission to enter port. It comes down once the authorities have cleared you.'),
      q('Where do you fly the courtesy flag of the country you are visiting?', ['Under the starboard spreader', 'At the stern, in place of your ensign', 'Nowhere; it is optional'], 0, 'The courtesy flag goes under the starboard spreader; your own ensign stays at the stern.'),
      q('A vessel near the harbor entrance flies flag B. What do you do?', ['Enter, but keep well clear of her', 'Stop and wait outside for permission', 'Go alongside to offer help'], 0, 'Flag B means dangerous goods such as fuel. You may pass, but give her plenty of room.'),
    ],
    figure: 'flags:code',
    conceptFigures: { 3: 'flags:courtesy' },
    localNotes: [
      {
        page: 4,
        region: 'israel',
        text: 'The Israeli boat operator licence material expects a vessel to carry the code flags N, A, B, C, Q and O. Returning to Israel from abroad, within 25 NM of the coast, report your position and identity to RCC Haifa on VHF channel 16; this entry report is called IMOT. Check the current Israeli regulations.',
      },
    ],
    practice: null,
    transfer: 'Learn the full International Code of Signals for the waters you sail, and check each country’s current entry rules before you go.',
    minutes: 10,
    type: 'Theory & decisions',
    body: concepts[0],
    goal: 'Read the briefing and check your understanding',
    tip: 'Find the code flags aboard and name what each single flag means.',
  },
];
