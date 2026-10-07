# Study material review (October 2026)

Scope: the reader text of all 53 lessons (`concepts`, `observe`, `mistake`, `quiz`, `transfer`) and the 13 "Learn more" topic guides (`src/learning/instrument-guides.js`, opened by **Explore this topic**). The goal is to judge each lesson against one test: **after reading it, does the learner understand how to control the boat, and why it behaves that way?** Explaining the app is allowed, but it is not the purpose of a lesson.

**Progress:** Lessons 05–53 have been rewritten following this review, in all six languages. Lessons 01–04 (Module 1) are not done yet. Done beyond the review: the "Explore this topic" mapping now covers all 53 lessons. Not done: merging 27/41 (they were shortened instead), turning L50's status lights into a figure, and the plain-language pass on 37, 40, 41, 50 and 51. Interactive diagrams are planned in `docs/MINILABS_PLAN.md`.

Length target: keep roughly today's page count per lesson. Where a lesson gains a "why" page, it should lose a page of simulator explanation.

## What is wrong across the course

1. **Too much of the text is about the simulator, not about sailing.** About a third of all concept pages describe sliders, timers, tolerances, modeled rates, or what the model leaves out. Examples: Lesson 3 (3 of 5 pages are about the Boat systems panel), Lesson 31 (3 of 4 pages are windlass rates and targets), Lessons 43–45 and 53 (almost entirely exercise instructions). The practice checklist page already lists the exercise steps, so most of this text appears twice.
2. **The rules are given without the reasons.** The lessons tell the learner *what* to do but rarely *why it works*. Missing from the lesson text, among others: why a sail can drive a boat toward the wind (lift plus keel); why the no-go zone exists; how telltales show whether a sail is working; "ease until it luffs, then trim until it stops"; why wind force grows with the square of wind speed (the real reason to reef early); why longer anchor rode holds better (pulling flat on the anchor); why you approach a dock into the wind or current; prop walk and the stern swinging out when you turn; how a leading line tells you which way to steer.
3. **The same warning repeats in almost every lesson.** "This is not a qualification", "practice with an instructor" and "the model does not simulate X" appear in nearly every lesson, often twice (in a concept page *and* in a quiz question *and* in the takeaway). Each repeat crowds out teaching. About 15 quiz questions only test this disclaimer (for example L1 Q2, L3 Q2, L6 Q2, L12 Q2, L16 Q2, L18 Q2, L20 Q2, L29 Q2, L31 Q2, L32 Q2). They should test sailing understanding instead.
4. **The "Learn more" guides are short and also mostly about the model.** They do hold a few important ideas that the lessons lack. Move these into the lessons:
   | Guide idea | Promote into |
   | --- | --- |
   | Under sternway the same helm turns the bow the *opposite* way (helm) | L7 or L8 (as a principle), L44–45 |
   | Ahead/astern is thrust, not motion; neutral removes thrust but the boat keeps moving (engine) | L19, L43 |
   | Current moves the boat over the ground even at zero speed through the water (current) | L4, L22 |
   | A correct heading does not give a safe track (heading) | L22 |
   | Apparent wind moves forward as the boat speeds up (wind) | L9 or L10 (one sentence; L17 keeps the full version) |
   | Compare heel before and after a reef (reef) | L18 |
   | A knot is speed, not distance (speed) | L4 already has it, keep |

   Once those are moved, the guides can stay as a short glossary.
5. **Bug: "Explore this topic" opens the wrong guide in many lessons.** `lessonTopics` in `src/learning/tools-ui.js:7` has only 42 entries, so Lessons 43–53 (marina, COLREGs 46–51, catamaran, night) all fall back to "Lookout and collision rules". The marina and catamaran lessons should open **engine**/**helm**, and night pilotage should open **heading**/**depth**. Some early entries are also odd: L1 → lookout (should be weather or emergency), L2 → sheets (should be helm), L16 → sheets (should be helm).
6. **Translation cost.** Lesson text is translated by exact English string in `public/locales/*.json` (five languages). Every reworded sentence needs five new translations, so rewrite each lesson in a single pass rather than editing it over and over.

## Verdict key

- **Keep**: clear and on target; only small wording fixes.
- **Add why**: structure is fine, but the physics or reasoning behind the rule is missing. Replace a weak page with it.
- **Rebalance**: too much simulator text. Cut it down to one short "In this exercise" page (or leave it to the practice checklist) and use the freed space for fundamentals.
- **Tighten**: correct and complete, but too dense, too legalistic, or too long for plain reading.
- **Merge**: overlaps with another lesson.

## Lesson by lesson

### Module 1. Before you leave

| # | Lesson | Verdict | What to change |
|---|---|---|---|
| 01 | Safety before speed | Keep | Good. Change Q2 (what the course certifies) to a real safety question, e.g. what the abort plan is for. Keep the qualification disclaimer *here* and in L36 only. |
| 02 | Know your yacht | Add why | Explain *why* the keel does two jobs: its heavy ballast low down pulls the boat upright against heel, and its fin shape grips the water so the boat goes forward instead of sliding sideways. Explain that the rudder is a small underwater wing: it only steers when water flows past it. Cut C3 (camera views) to one sentence in Observe. |
| 03 | Lines, winches, and loads | Rebalance | 3 of 5 pages describe the Boat systems panel. Keep C1 (halyard/sheet/reef/clutch/winch) and C5 (safety). Replace C2–C4 with one page on *what each sail control does to the sail and when you use it*: sheet = angle to the wind; traveler = boom angle without changing twist; vang = holds the boom down and keeps the top of the sail from twisting off; outhaul = tight flattens the sail (less power, for strong wind), eased makes it fuller (more power, for light wind); a winch multiplies your pull. The engine and anchor controls belong in L19/L31. |
| 04 | Read the instruments | Tighten | Five pages; C4 and C5 both teach the app compass dial. Merge them into one page. Add the guide's point that current can move the boat even at zero speed through the water, so heading ≠ track. |

### Module 2. Your first sail

| # | Lesson | Verdict | What to change |
|---|---|---|---|
| 05 | Where the wind comes from | Add why | Explain *why* the no-go zone exists: a sail only works with air flowing across it at an angle; pointed straight at the wind it just flaps like a flag. Most cruising yachts stop working about 40–45° from the wind. C2 (ground/water/apparent wind frames) is heavy for lesson 5: move it to L17 and leave one sentence here. C4–C5 both explain the app's gold arrow; merge them. |
| 06 | Raise the sails | Add why | Explain *why* you hoist head to wind: the sail luffs with no load, so it slides up easily and the boom cannot swing hard. Explain why main first, then headsail (the main helps keep the bow toward the wind). Cut C2 (app shortcut caveat) to one line. Replace Q2 (disclaimer). |
| 07 | Feel the boat accelerate | Add why | Explain *why* acceleration is gradual: the boat is heavy, and water drag grows quickly with speed, so the boat settles at the speed where drive equals drag. Explain why the beam reach is the easy, powerful starting point. Add the tiller-vs-wheel note: a wheel turns like a car; a tiller is pushed the *opposite* way to the turn. This is a basic fact that is missing everywhere. |
| 08 | Hold a steady course | Add why | Explain the lag: the boat keeps turning after you center the helm because of its rotational momentum, so you center *before* you reach the heading. Add "steer by a distant mark, not by the compass needle". Mention weather helm: a boat that keeps trying to turn into the wind usually has too much sail or too much heel (links to L18). C3 (the 5°/10 s tolerance) belongs only in the practice checklist. |

### Module 3. Make the wind work

| # | Lesson | Verdict | What to change |
|---|---|---|---|
| 09 | Find a beam reach | Add why | This is where all the points of sail should be shown together: close hauled, close reach, beam reach, broad reach, run. Give the rule of thumb that the sail angle is roughly half the wind angle. One sentence: apparent wind moves forward as the boat speeds up, so you trim in a little as you accelerate. |
| 10 | Sail close hauled | Add why | **The most important gap in the course.** Explain how a boat sails toward the wind: the sail works like a wing and makes a force mostly sideways but slightly forward; the keel resists the sideways part; what remains pushes the boat forward. That is why close hauled feels heeled and slow, and why you zigzag (tack) to go upwind. Introduce telltales here: both streaming = good; windward one lifting = steering too close or sail too far out; leeward one stalling = sail pulled in too far. Cut C2's model range (45°–58°) to the checklist. |
| 11 | Bear away to a broad reach | Add why | Explain the change of mechanism: as you turn downwind, the sail works less like a wing and more like a parachute being pushed. So you ease the sheets, and the boat heels less. Explain *sailing by the lee* (wind coming from the same side the boom is on) as the cause of accidental gybes. |
| 12 | Trim with feedback | Rebalance | C2 and C3 are model targets. Replace them with the classic method: **ease the sheet until the front of the sail starts to luff, then pull in just until it stops**. Explain luffing (too far out, front of the sail flaps) vs stalling (too far in, air breaks away on the back, the boat heels and slows but does not speed up). Keep "one change at a time". Replace Q2 (disclaimer) with a telltale question. |

### Module 4. Change direction

| # | Lesson | Verdict | What to change |
|---|---|---|---|
| 13 | Head up and bear away | Keep | Clear. Add one sentence: heading up = sheet in, bearing away = sheet out. |
| 14 | Make a controlled tack | Add why | Explain *why* you need speed: through the no-go zone the sails give no drive, so only momentum carries the bow across. Turning too slowly stops you in irons; turning too hard uses the rudder as a brake. Name the steps in order (ready about, helm over, release the old jib sheet, sheet in the new one). Turn C3 (sails shift automatically) into one line. |
| 15 | Make a planned gybe | Add why | Explain *why* a gybe is more dangerous than a tack: in a tack the sails go slack as you pass the wind, but in a gybe the main stays full and the wind slams the boom across. That is why you pull the boom to the center before the stern crosses the wind and ease it out after. Cut C3 to one line. |
| 16 | Recover from loss of drive | Keep | Clear. Mention the common real methods in plain words (push the boom out or hold the jib on the "wrong" side so the wind pushes the bow round) even though they are not modeled. Replace Q2 (disclaimer). Fix the guide mapping to **helm**. |

### Module 5. Stay in control

| # | Lesson | Verdict | What to change |
|---|---|---|---|
| 17 | True and apparent wind | Tighten | The best physics in the course, but 7 pages long and 2 quiz questions are about the model. Keep C1, C2, C4, C6. Shorten C3 (which model parts use which wind) to one sentence. Fold C5 (racing boats/foils) into C4. Move C7 (lab instructions) to a button note. Replace Q2 (about the prototype) with a sailing question. |
| 18 | Reef before you need to | Add why | Add the key intuition: **wind force grows with the square of wind speed**, so 20 knots pushes about four times as hard as 10 knots. A reef lowers the sail's area and its height, so the boat heels less. Too much heel makes the boat *slower*, pulls it into the wind (weather helm) and makes it slip sideways. "Reef when you first think about it." Use the guide's idea of comparing heel before and after the reef. Cut C3 to one line. Replace Q2. |
| 19 | Reduce power deliberately | Add why | List the ways to take power out of the sails and why each works: ease sheets (sail luffs), head up toward the wind (less angle), flatten the sail, lower it. Add the engine guide's point that the boat keeps its momentum, and that a heavy boat coasts a long way. Mention heaving to as a real technique, even though it is not modeled. |
| 20 | Choose a weather limit | Add why | Explain *why* wind against current makes steep waves (the waves get shorter and taller). Define lee shore in plain words (the wind is blowing you toward land) and why it is dangerous: if something fails, you drift onto it. Replace Q2 (disclaimer). |

### Module 6. Find your way

| # | Lesson | Verdict | What to change |
|---|---|---|---|
| 21 | Read a practice chart | Rebalance | C2 and C3 mostly explain what the app chart is *not*. Use the space to teach basic chart reading: depth numbers and contours, land/drying areas, scale (latitude scale = nautical miles), and what a buoy symbol tells you. Replace Q1 (what the amber app buoys are). |
| 22 | Steer toward a waypoint | Add why | Add the guide ideas: heading ≠ track; current and leeway push you off the line, so you aim slightly up-current; check the bearing to the mark — if it changes, you are being set. C3 (exercise details) belongs to the checklist. |
| 23 | Estimate distance and time | Keep | Clear and practical. Optional: 1 minute of latitude = 1 nautical mile, so you can measure distance on the chart's side scale. |
| 24 | Sail a short passage | Keep | Clear. C3 (3 m depth rule) can move to the checklist; add a sentence on choosing a safety depth from your draft. |

### Module 7. Share the water

| # | Lesson | Verdict | What to change |
|---|---|---|---|
| 25 | Keep an effective lookout | Add why | Explain *why* a steady bearing means collision: two boats on straight courses that will meet stay at the same angle to each other all the way to the meeting point. Show how to check it (line the other boat up with a stanchion or a hand-bearing compass). |
| 26 | Reason through encounters | Add why | Give the intuition behind the rules: they exist so both boats know who acts and who holds course, avoiding the "both turn the same way" dance. Point out that L46 covers this fully, so keep this one short. |
| 27 | Lights, marks, and signals | Merge | Heavy overlap with L50, which covers sidelights and sound signals in full. Keep a short intro here (red = port, green = starboard; seeing both = boat coming at you; white only = you see its stern) and point to L50. Use freed space for what a buoy *tells you to do* (lateral marks: keep red/green on the correct side), which is missing from the course. |
| 28 | Make a passage decision | Keep | Clear. Slight overlap with L37/L40, acceptable as the basic-level version. |

### Module 8. Arrive and depart

| # | Lesson | Verdict | What to change |
|---|---|---|---|
| 29 | Plan a docking approach | Add why | Add the core rule: **approach into the wind or current where possible**, because it slows you down and still lets water flow past the rudder at low speed. Explain prop walk (in reverse the propeller pulls the stern to one side), and windage (the bow blows off at low speed). These can be *explained* even though they are not modeled. Cut C3's model list to one line. Replace Q2. |
| 30 | Choose an anchorage | Add why | Explain *why* scope matters: an anchor holds best when pulled flat along the seabed; a short rode pulls upward and breaks it out. Chain's weight keeps the pull flat and absorbs jerks. That is why more rode is used in stronger wind. Keep the 5:1 arithmetic. |
| 31 | Stop, then anchor | Rebalance | C2–C4 are windlass rates, targets and model caveats. Replace with the real sequence and its reasons: approach head to wind (or current) so the boat stops; lower the anchor to the seabed; let the boat drift back as rode goes out (do not pile chain on top of the anchor); set it with gentle reverse; check with two fixed marks on shore that you are not moving. Keep one short "In this exercise" note. Replace Q2. |
| 32 | Prepare to leave | Rebalance | C2–C4 are mostly app mechanics. C3 has a good physical point hidden inside (do not use the windlass to pull the boat; motor or sail slowly toward the anchor). Rewrite around the real sequence: motor toward the anchor while the crew brings in rode, "anchor up and down" (rode vertical), break it out, then get steerage. Replace Q2. |

### Module 9. Respond and review

| # | Lesson | Verdict | What to change |
|---|---|---|---|
| 33 | Person overboard priorities | Add why | Priorities are clear. Add the basic idea of the return: stay close; come back slowly so the final approach is on a close reach, where you can stop by easing the sails; stop with the person beside the boat, away from the propeller. Shorten C3 (no POB model) to one line. |
| 34 | Distress and urgent action | Keep | Clear. Could teach the MAYDAY message order in one short list. |
| 35 | Your assessed first passage | Keep | It is an assessment lesson, so app details are reasonable here. Cut C4 (disclaimer, already in L36). |
| 36 | From simulation to the sea | Keep | Correct place for the disclaimer. Fine. |

### Module 10. Coastal decisions (37–42)

| # | Lesson | Verdict | What to change |
|---|---|---|---|
| 37 | Plan the route and the escape | Tighten | Solid but long sentences. Plain-language pass. |
| 38 | Tidal depth and clearance | Tighten | Good worked example. Define chart datum in plain words ("the very low water level the chart depths are measured from") and explain squat in a phrase, or drop it. |
| 39 | Current vectors and passage time | Keep | Clear and well built. Good example of the style the basic lessons should follow. |
| 40 | Weather: go, wait or divert | Tighten | Repeats L20 and L28 in places. Focus on what is new: limits agreed in advance and checked underway. |
| 41 | Collision risk and limited visibility | Merge | Heavily overlaps L48 and L51. Either shorten it to the planning angle or point to the COLREGs module. |
| 42 | Night pilotage and cross-checks | Add why | Explain how light characteristics work (flashing, occulting, isophase; you count the period) and how a leading line works (the rear light appears on the same side of the front light as you are off the line: rear light to the right means you are right of the line, so move left until they line up again). This lesson and L53 both need it. |

### Module 11. Practical marina handling (43–45)

All three are almost entirely exercise instructions (which headings, which speeds, which circles). They teach the route but not boat handling. Give the module **one shared "why" page each** and move the targets to the practice checklist.

| # | Lesson | Verdict | What to change |
|---|---|---|---|
| 43 | Enter the marina under engine | Rebalance | Teach: a boat has no brakes, only reverse thrust; at low speed the rudder has little grip, but a short burst ahead pushes propeller water across the rudder and gives steering even when nearly stopped; the boat turns around a point near the front, so the *stern swings out* when you turn (watch it near pontoons). Add the guide idea: ahead/astern is thrust, not motion. |
| 44 | Dock in a marina berth | Rebalance | Teach: come in slowly, the speed you are willing to hit the dock at; use short bursts and neutral; wind on the bow makes it fall away at low speed; prop walk in reverse swings the stern to one side, so plan which side you dock on. |
| 45 | Leave the berth and exit the marina | Rebalance | It already contains the key fact (steering reverses going astern) only as a quiz answer. Move it into the text with *why*: in reverse the rudder is at the front of the motion, so it is weak and reversed; keep speed steady and the helm small. Explain why you back fully clear before turning (the swinging stern/bow needs room). |

### Module 12. COLREGs (46–51)

Accurate and thorough, but these read like a rule book: 5 long pages each, with many sub-cases. The fix is **Tighten**, not new content.

| # | Lesson | Verdict | What to change |
|---|---|---|---|
| 46 | Sailing encounters | Tighten | Add the reason for "windward keeps clear" (the windward boat has more room to turn away and is taking the other boat's wind). The overtaking pages (C4–C5) are good. |
| 47 | Under engine encounters | Tighten | Add the reason for port-to-port: if both turn right, they always turn away from each other. Shorten C1 (the battery-charging sub-case). |
| 48 | Give-way and stand-on | Tighten | Add *why* the give-way vessel should make one big obvious turn: so the other vessel can *see* that you are acting. Merge C4 into C3; it is a narrow sub-case. |
| 49 | Special vessels, channels, lanes | Tighten | Five dense pages. Add the simple reason: a ship that cannot turn or stop quickly gets priority over boats that can. One page per idea (status, channel, traffic lane). |
| 50 | Lights, shapes and sound signals | Tighten | Accurate but a long list. It needs pictures more than text; turn C3 (status lights) into a figure and keep the mnemonics ("red over white, fishing tonight"; "red over red, the captain is dead" for NUC). |
| 51 | Restricted visibility | Tighten | C5 (the five-step decision sequence) is excellent; it could be the summary for the whole module. Shorten C3/C4 wording. |

### Modules 13–14. Catamaran and night

| # | Lesson | Verdict | What to change |
|---|---|---|---|
| 52 | Handle a catamaran with twin engines | Keep | Good physics (the turning couple, low heel hiding high loads). Move C3 (exercise steps) to the checklist and give one sentence on *why* wide engines turn the boat well (the long distance between them acts like a long lever). Fix the guide mapping. |
| 53 | Navigate a night approach | Rebalance | Mostly exercise instructions. Add the fundamentals: how a light is identified (color + pattern + period, timed over full cycles), how a leading line tells you which way to steer, and why your night vision matters (red light inside, no screens on bright). Move headings and speeds to the checklist. Fix the guide mapping. |

## Summary count

| Verdict | Lessons |
|---|---|
| Keep | 01, 13, 16, 23, 24, 28, 34, 35, 36, 39, 52 |
| Add why | 02, 05, 06, 07, 08, 09, 10, 11, 14, 15, 18, 19, 20, 22, 25, 26, 29, 30, 33, 42 |
| Rebalance | 03, 12, 21, 31, 32, 43, 44, 45, 53 |
| Tighten | 04, 17, 37, 38, 40, 46, 47, 48, 49, 50, 51 |
| Merge | 27 (into 50), 41 (with 48/51) |

## Suggested order of work

1. **Lessons 05–15** (wind, points of sail, trim, tack, gybe). This is where the physics is most important and most missing; every later lesson depends on it.
2. **Lessons 18, 29–32** (reefing, docking, anchoring): the rules are there, but the reasons are not.
3. **Lessons 43–45, 53** (exercise-heavy): rebalance and fix the guide mapping bug.
4. **Remove disclaimer repetition and disclaimer-only quiz questions** across the course in one pass.
5. **Lessons 46–51**: plain-language tightening.

Each step changes English strings, so update `public/locales/*.json` (5 languages) and the curriculum counts in `docs/CURRICULUM.md` and tests in the same pass.
