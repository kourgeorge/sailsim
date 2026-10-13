# Plan: close the "partial" gaps from the Boat Operator question pool

Source analysis: `reference/course/question-pool-coverage.json` and `.md`. Today 91 of 362 exam questions are covered, 121 partial and 150 not covered. This plan handles the 121 partial questions only. These are questions whose topic the course already teaches but where it leaves out the exact fact the exam asks for. New modules for weather, safety gear, ropes, flags and Israeli law are a later step.

**Goal:** about 110 of the 121 partial questions become covered, raising total coverage from 25% to about 55%. We do this without new modules, new lesson IDs or changes to the progress chain.

## Ground rules

1. **Our own words, real rules.** Every added fact is taken from the International COLREGs (rule numbers given below), IALA buoyage, or standard seamanship. We do not copy the exam's wording. Exam question numbers are listed here only to track coverage.
2. **One idea per page.** A lesson page is one string in `concepts`, and its first sentence becomes the page headline (`lesson-text.js`). New facts go in as new pages whose first sentence states the fact.
3. **General rule in the text, Israel in a note.** The page states the international rule. Israeli specifics (Region A, 200 m from divers, local harbours) go in a "Local rules: Israel" note on that page.
4. **Don't teach answers we think are wrong.** Two exam answers disagree with common seamanship; they are left out (see Decisions).
5. **Every change goes into all six languages.** English goes in the course files. The five translations go in `public/locales/{es,ar,he,ru,fr}.json` under `lessons['sail-NN']`, keeping the array order. Hebrew matters most, because Israeli learners take this exam in Hebrew.

## How quiz questions change

Each lesson currently has 2 quiz questions (3 or 4 for lessons 04, 05 and 17), and `tests/learning.test.js:8` pins those counts. A learner must answer all of them correctly to master a lesson.

- Lessons that gain three or more pages get 1–2 new quiz questions, up to 4 per lesson. That means lessons 21, 29, 34, 47, 49 and 50.
- Update the pinned counts in the test to match.
- Existing learners keep their mastery: a saved `knowledge: true` is not rechecked when questions are added. New learners answer the longer quiz.
- Drill-style practice on every exam fact belongs in the later "Exam practice" mode, not in these mastery quizzes.

## Work, in order

Each batch is one commit and can ship on its own. Counts are partial questions resolved.

### Batch 1: Lights, shapes and sound signals (lessons 50, 49, 47, 46, 27, 48), 60 questions

**Status: done (2026-10-13).** As built, with these differences from the plan below:
- The optional red-over-green sailing lights went into lesson 50, page 2, not lessons 27 and 46.
- The figure is its own module, `src/learning/status-lights-figure.js`. It has 13 variants, chosen per page through `conceptFigures` (`'status-lights:<variant>'`), and shows 1–5 related rows per page.
- Israeli specifics are "Local rules: Israel" notes: the 200 m diving distance (lesson 50) and giving way to rowing boats (lesson 47).
- Lesson 50 now has 13 pages and 4 questions, lesson 49 has 8 pages and 3 questions, and lesson 47 has 6 pages and 3 questions.

The single biggest gain. Lesson 50 currently says towing, pilot and aground vessels "have further arrangements" (`colregs-course.js:222`) and stops there. That sentence is replaced by real content.

**Lesson 50, "Read lights, shapes and sound signals"** grows from 5 pages to about 10:

| New page (first sentence = headline) | Rule | Exam questions |
| --- | --- | --- |
| Lights are shown from sunset to sunrise and in restricted visibility, even in daytime fog; shapes are shown by day. A vessel with no special status needs no day shape. | 20 | 20, 23, 44 |
| A power-driven vessel 50 m or longer shows a second, higher masthead light aft. A restricted vessel making way adds masthead lights, sidelights and sternlight to its red-white-red. | 23, 27 | 6 |
| At anchor: one all-round white under 50 m; two (forward higher) at 50 m or more; one black ball by day. | 30 | 7 |
| Aground: the anchor lights plus two all-round reds; three black balls by day. | 30 | 3, 13, 14, 310, 314, 318, 331, 339 |
| Towing: two masthead lights in a line (three when the tow is over 200 m), a yellow towing light above the sternlight, and a diamond by day when the tow is over 200 m. Pushing ahead shows two masthead lights and no yellow light. | 24 | 8, 17, 211, 217, 226, 311, 313, 340 |
| Pilot vessel on duty: white over red all-round. | 29 | 4 |
| Diving operations: a rigid copy of code flag A by day and red-white-red at night. Local rules set a keep-clear distance (200 m in Israel). | 27(e) | 16, 73, 260, 351 |
| Fog sound for the last vessel of a tow: one long and three short. Long and two short also covers towing, fishing and restricted vessels. | 35 | 58, 70 |

The narrow-channel overtaking signals (Q59, Q62) go in lesson 49, below.

**Lesson 49, "Special vessels, narrow channels and traffic lanes"** gets about 3 new pages:
- Overtaking in a narrow channel by sound: two long and one short means "I intend to pass on your starboard side". Two long and two short means "on your port side". Long, short, long, short means agreement. (Rule 34(c). Questions 59, 62, 295.)
- A dredger shows two reds or two balls on the side that is blocked, and two greens or two diamonds on the side where you may pass. (Rule 27(d). Questions 188, 206.)
- Fishing gear stretching more than 150 m out is marked with a cone, point up, or a white light on the side the gear extends. (Rule 26. Question 329.)
- Spell out IMO as the International Maritime Organization the first time it appears. (Question 255.)

**Lesson 47, "Under engine: head-on, crossing and mixed encounters"** gets about 2 new pages:
- "Underway" means not at anchor, not tied to the shore and not aground. (Rule 3. Question 27.)
- A hovercraft shows a flashing yellow all-round light. Rowing boats may show sailing lights or a white torch, and the exam expects power and sail to keep clear of them. (Rules 23 and 25. Questions 197, 261, 328, 333, 337.)

**Lessons 27 and 46** get one sentence each: a sailing vessel may show an optional red-over-green all-round pair at the masthead. (Rule 25(c). Questions 1, 11, 36, 200, 213.)

**About 14 picture-based questions** (214–216, 222–223, 225, 227, 342–343, 203–204, 336 and others) should become answerable once towing, hovercraft and optional sailing lights are taught. We can't confirm this without the picture booklet.

**One new figure.** The exam's picture booklet is missing, so lesson 50 gets a "lights and day shapes" reference card. It's an SVG in `colregs-figures.js` that reuses the existing `copy`/`captions` six-language tables. It shows the towing, aground, anchored over 50 m, pilot, dredger-side and diver patterns, each as a night view and a day view.

Optionally, the `lights-aspect` mini-lab (`labs/lights-leading.js`) could gain `tow` and `pilot` vessel types. That is a small first step toward option 3 and isn't needed to close these gaps.

**Quizzes:** lesson 50 goes from 2 to 4 questions (aground pattern, tow over 200 m). Lesson 49 goes from 2 to 3 (overtaking signal). Lesson 47 goes from 2 to 3 (hovercraft or underway).

### Batch 2: Buoys and harbour entrances (lesson 21), 8 questions

**Status: done (2026-10-13).** Lesson 21 now has 6 pages and 3 questions. Pages 4–5 use a new buoyage card (`src/learning/buoyage-figure.js`, variants `lateral` and `cardinal`). Page 6 runs the `lights-flash` lab, which gained the Q(3), Q(6)+LFl and Q(9) cardinal patterns and two tasks. The Israel note says Israel uses Region A and where the marina entrance lights are. 7 of the 8 questions are covered; Q344 (lights seen when leaving a marina) depends on a missing picture.

Lesson 21 names lateral and cardinal marks but tells learners to "check the region". Add about 3 pages:
- **IALA Region A** (Europe, Africa and the Mediterranean, including Israel): coming in from sea, red marks and red lights are on your left and green ones on your right. A harbour or marina entrance shows a flashing green on the right and a flashing red on the left. (Questions 5, 10, 12, 344.)
- **Cardinal marks:** colours, top marks, and which side to pass. You pass on the side the mark is named after, so you pass north of a North mark. (Questions 144, 287.)
- **Cardinal light patterns, read like a clock face:** North flashes continuously, East 3 flashes, South 6 flashes plus one long, West 9 flashes. (Questions 265, 358.)

Reuse the existing `lights-flash` lab (lessons 42 and 53) with cardinal patterns as new tasks. Add one quiz question (West = 9 flashes), taking lesson 21 to 3 questions.

### Batch 3: Emergencies and distress (lessons 34, 33), 15 questions

**Lesson 34, "Distress and urgent action"** gets about 4 pages:
- **The full list of distress signals** (COLREG Annex IV): red flares and rockets, orange smoke, flames on the vessel, a gun or explosion about once a minute, a continuous foghorn, SOS (··· ––– ···) in light or sound, MAYDAY by voice, code flags N over C, a square flag with a ball, slowly raising and lowering outstretched arms, DSC, and an EPIRB. (Questions 54, 55, 56, 71, 72, 74, 309, 323.)
- **The duty to help:** you must go to people in distress unless doing so seriously endangers your own crew. You have no duty to tow a boat that isn't in distress, though you may choose to. (Questions 142, 164.)
- **After grounding:** engine to neutral first, check for damage and leaks, then try to get off by lowering sails and reversing carefully. (Questions 86, 127.)
- **Flooding:** find where the water comes from (taste it: salt or fresh), pump, and close or plug the opening. (Question 123.)

**Lesson 33, "Person overboard priorities"** gets 1 page: the lifebuoy light switches on by itself when it floats upright. Under sail in rough water, roll in the headsail, start the engine (checking for lines in the water first) and approach under power. (Questions 82, 141.)

Add one quiz question to lesson 34 (pick the distress signal from a list).

### Batch 4: Docking and anchoring (lessons 29–32), 16 questions

**Lesson 29, "Plan a docking approach"** gets about 3 pages:
- **Prop walk:** a right-hand propeller pulls the stern to port in reverse. You can use this on purpose to turn in a tight space. This matches what the existing `docking` lab already shows. (Questions 78, 134, 288.)
- **Spring lines:** motoring gently against a spring line holds the boat against the dock and swings one end out. To leave a dock when the wind pushes you onto it, motor forward against a bow spring with a fender at the bow so the stern swings out. (Questions 113, 135, 249, 290.)
- **Bow-to, stern-to and Mediterranean mooring:** drop the anchor off the berth, reverse in while paying out, and allow for a crosswind. (Questions 137, 282.)

**Lessons 30–32** get about 3 pages:
- **Rope versus chain:** a good anchor rope stretches and sinks. There are a few common anchor types, and each suits a different seabed. (Questions 133, 166.)
- **Dragging:** you can feel it as a juddering through the line, and the bow stops pointing into the wind. Lining up two fixed points on shore is the more reliable check. If the anchor drags, first let out more rode, then re-anchor. (Questions 92, 117, 139.) Keep the course's existing advice on lining up shore marks; just add the "feel" check alongside it.
- **Other anchor uses:** an anchor dropped while coming in keeps the bow facing seaward near the shore. A snubber line to a cleat takes the load off the windlass. (Questions 98, 269.)

Add one quiz question to lesson 29 (which way the stern walks).

### Batch 5: Sail handling and weather decisions (lessons 01–23, 37), 22 questions

These are small additions, mostly one sentence added to an existing page:

| Lesson | Addition | Questions |
| --- | --- | --- |
| 03 | The vang also stops the boom lifting on a reach or run. | 294 |
| 06 or 33 | If the engine fails in a harbour entrance, get a sail up at once for drive. | 253 |
| 07 | Steering bites better heading into waves than running with them. | 154 |
| 08 | Two-masted boats balance their helm with the mizzen; ease or drop the mizzen first in a gust. | 120, 145, 156, 274 |
| 09 | "Running before the wind" is the name for a run; following seas make steering harder. | 115 |
| 11 | Send crew to the foredeck on a broad reach, where the boat heels and pitches less. | 122 |
| 14 | In strong wind, turn the long way round through a tack rather than gybe. | 129 |
| 16 / 19 | Heaving-to: the headsail is backed to windward, the boat lies about 45–60° off the wind and drifts slowly. | 150, 361 |
| 18 | In a storm, reduce sail but keep some up for drive and control. | 153 |
| 20 | Prepare the boat in harbour before strong wind: extra lines, fenders, sails tied down. | 163 |
| 23 | Keep a logbook: time, position, course, speed, weather, events. | 302 |
| 37 | Pilot books describe harbours, hazards and local rules. | 136 |
| 01 | For a trip of several days, the briefing also covers fire, the toilet and abandoning ship. | 131 |

Questions 106, 182 and 184 (local Israeli harbours, barometer trends, safety harness) are left for the Weather and Safety modules in option 2. No new quiz questions in this batch.

## Decisions (2026-10-13)

1. **Exam answers we think are wrong (Q286, Q147) are left out.** They stay uncovered.
2. **Quizzes may grow to 4 questions per lesson.** Backward compatibility of saved progress is not a concern.
3. **Israel-specific rules go in a separate "Local rules: Israel" note** on the page they belong to, not in the main text. A lesson can carry `localNotes: [{page, region, text}]`; translation packs carry the matching `localNotes` texts in the same order.

## Checks for each batch

- `npm test`, including the updated quiz counts in `tests/learning.test.js` and `tests/lesson-text.test.js`. Headlines must still come out of every new page.
- `npm run build`, then `node scripts/check-locales.mjs` (all six languages, no copied English, RTL layout).
- `node scripts/check-teaching-figures.mjs` for the new lights card. Look at the screenshots in light and dark mode.
- Re-run the coverage review on the questions each batch targets and update `question-pool-coverage.json` and `.md`, so the gain is measured rather than assumed.
- Update the counts in `docs/CURRICULUM.md` ("110 explained knowledge questions") and `docs/LOCALIZATION.md`.

## Size estimate

| Batch | New pages | New quiz questions | Partial questions resolved |
| --- | --- | --- | --- |
| 1 Lights and signals | ~15 + figure | 4 | ~60 |
| 2 Buoys | ~3 | 1 | 8 |
| 3 Distress | ~5 | 1 | 15 |
| 4 Docking and anchoring | ~6 | 1 | 16 |
| 5 Sail handling | ~13 sentences | 0 | 22 |
| **Total** | **~30 pages + ~13 sentences** | **7** | **~110 of 121** |

Each page and each quiz question has to be written in English plus five translations, so translation is the bulk of the work.
