# Sailing course levels: evidence and implementation guidance

Research reviewed 1 October 2026. Thirteen substantive public pages from RYA, US Sailing and World Sailing were retrieved and read. Each has an original summary, source URL, retrieval timestamp and source-response hash in [the training manifest](../reference/sailing/manifest-training.json). Hashes identify the response reviewed; full scraped pages and manuals are not republished.

## What the three levels mean

These are **app learning stages**, not universal sailing qualifications. RYA uses practical courses, shorebased study and separate certificates-of-competence exams; US Sailing uses task-specific certifications; World Sailing offshore safety requirements concern offshore racing. None establishes a universal three-level legal ladder.

| App level | Primary lessons | Intended learning outcome | Evidence produced |
|---|---|---|---|
| Basic | sail-01–16 | Prepare as a crew member, read wind and instruments, control sails and helm, tack and gybe in the model. | Knowledge checks and selected simulated control sequences. |
| Intermediate | sail-17–36; three auxiliary-power drills | Manage sail power, plan a short daytime passage, understand traffic/harbor/emergency decisions and develop open-water engine control. | Knowledge checks, measured model tasks and drill records; no physical docking or rescue assessment. |
| Advanced | sail-37–42 | Reason through coastal passage contingencies, tidal clearance, current/time, weather limits, collision-risk uncertainty and night-position cross-checks. | Theory and numerical decision checks only. |

Keep all content browsable. Prerequisites suggest a learning sequence and must not hide emergency information. Recommend sail-33 and sail-34 immediately from Basic safety orientation, and revisit them during later passage planning. Also offer Basic review links to sail-18 and sail-25–27: real introductory training includes reefing, lookout and navigation rules even though the app’s main sequence places their fuller treatment later. “Basic complete” must never mean “safe to sail independently.”

## Organization standards, legal requirements and ICC

- RYA Competent Crew and US Sailing Basic Keelboat support a crew-and-fundamentals stage, but both expect physical skills absent here. RYA Day Skipper and US Sailing Basic/Bareboat Cruising support increasingly integrated planning, auxiliary handling and crew responsibilities.
- US Sailing Coastal Navigation and RYA shorebased courses justify separate navigation reasoning tasks. Their full syllabuses are much broader than six short advanced lessons. Advanced theory does not establish advanced practical seamanship.
- RYA Yachtmaster Offshore is an independent practical competence exam with substantial qualifying experience, plus radio/first-aid requirements and other conditions. Simulated hours are not qualifying sea time.
- World Sailing Offshore Special Regulations are offshore racing requirements. At review, the page separately lists a Version 2 effective **1 January 2027**; do not treat it as effective in October 2026. A race standard is neither COLREGs nor a general recreational license.
- The [RYA ICC explanation](../reference/sailing/standards/rya-icc.md) describes vessel and coastal/inland categories under UNECE Resolution No. 40. Those categories are not Basic/Intermediate/Advanced. Issuance, acceptance and operating limits depend on eligibility and relevant flag/coastal-state requirements. Direct UNECE page/PDF retrieval returned 403; primary wording/current revision was not verified.
- American Sailing’s target domain repeatedly timed out. The former asa.com path returned an unrelated corporate 404 page. **ASA 101/103/104/105/106 cross-equivalence is intentionally unverified**, not inferred from memory or another school’s sales page. Record this gap and revisit the official source when accessible.

Do not describe any app level as an RYA/ASA/US Sailing qualification, ICC entitlement, charter entitlement or legal permission. Real navigation teaching must distinguish International Regulations for Preventing Collisions at Sea from inland/local rules and check the rules applicable to the voyage. The standards pages identify required topics; they are not themselves the legal texts.

## Existing lesson crosswalk

“Model task” means an assessment against implemented simulator state, not a real-world competence test. “Theory” means a knowledge/decision check; some also invite visual observation.

| ID | Current lesson | Primary level | Assessment |
|---|---|---|---|
| sail-01 | Safety before speed | Basic | Theory |
| sail-02 | Know your yacht | Basic | Theory |
| sail-03 | Lines, winches, and loads | Basic | Theory |
| sail-04 | Read the instruments | Basic | Model task + knowledge |
| sail-05 | Where the wind comes from | Basic | Theory |
| sail-06 | Raise the sails | Basic | Model task + knowledge |
| sail-07 | Feel the boat accelerate | Basic | Model task + knowledge |
| sail-08 | Hold a steady course | Basic | Model task + knowledge |
| sail-09 | Find a beam reach | Basic | Model task + knowledge |
| sail-10 | Sail close hauled | Basic | Model task + knowledge |
| sail-11 | Bear away to a broad reach | Basic | Model task + knowledge |
| sail-12 | Trim with feedback | Basic | Model task + knowledge |
| sail-13 | Head up and bear away | Basic | Model task + knowledge |
| sail-14 | Make a controlled tack | Basic | Model task + knowledge |
| sail-15 | Make a planned gybe | Basic | Model task + knowledge |
| sail-16 | Recover from loss of drive | Basic | Model task + knowledge |
| sail-17 | True and apparent wind | Intermediate | Theory |
| sail-18 | Reef before you need to | Intermediate | Model task + knowledge |
| sail-19 | Reduce power deliberately | Intermediate | Model task + knowledge |
| sail-20 | Choose a weather limit | Intermediate | Theory |
| sail-21 | Read a practice chart | Intermediate | Theory |
| sail-22 | Steer toward a waypoint | Intermediate | Model task + knowledge |
| sail-23 | Estimate distance and time | Intermediate | Theory |
| sail-24 | Sail a short passage | Intermediate | Model task + knowledge |
| sail-25 | Keep an effective lookout | Intermediate | Theory |
| sail-26 | Reason through encounters | Intermediate | Theory |
| sail-27 | Lights, marks, and signals | Intermediate | Theory |
| sail-28 | Make a passage decision | Intermediate | Theory |
| sail-29 | Plan a docking approach | Intermediate | Theory |
| sail-30 | Choose an anchorage | Intermediate | Theory |
| sail-31 | Stop, then anchor | Intermediate | Model task + knowledge |
| sail-32 | Prepare to leave | Intermediate | Model task + knowledge |
| sail-33 | Person overboard priorities | Intermediate | Theory |
| sail-34 | Distress and urgent action | Intermediate | Theory |
| sail-35 | Your assessed first passage | Intermediate | Model task + knowledge |
| sail-36 | From simulation to the sea | Intermediate | Theory |

### Auxiliary-power drills

| Drill | Primary level | Valid measured outcome | Boundary |
|---|---|---|---|
| Ahead and controlled stop | Intermediate | Establish ahead motion and reduce ground motion within the defined exercise envelope. | No dock contact, crew line handling or universally transferable stopping distance. |
| Astern steering corridor | Intermediate | Maintain the modeled astern path and bounded speed. | Empirical reverse response; no validated vessel-specific prop walk or close-quarters clearance claim. |
| Precision approach and stop | Intermediate | Approach a virtual gate and control stopping position/speed. | A virtual gate is not an alongside arrival; no spring-line forces or physical berthing assessment. |

Use Basic helm lessons before these drills and review sail-29 (docking plan), sail-25 (lookout) and sail-34 (urgent action). All three are preparation for supervised auxiliary handling.

### Advanced additions

| ID | Decision lesson | Principal verified evidence | Assessment design |
|---|---|---|---|
| sail-37 | Route and contingency planning | RYA Coastal Skipper; US Sailing Bareboat | Choose a route using escape options and a pre-set diversion trigger. |
| sail-38 | Tidal depth and under-keel clearance | US Sailing Coastal Navigation; RYA Day Skipper Theory | Calculate a stated static clearance and recognize missing dynamic/uncertainty allowances. |
| sail-39 | Current vectors and passage time | US Sailing Coastal Navigation | Compute same/opposite-direction ground speed and distinguish cross-current vectors from scalar addition. |
| sail-40 | Weather go/no-go decisions | RYA coastal theory/practical | Reassess against crew/boat limits and deteriorating exposure; no universal wind threshold. |
| sail-41 | Collision risk and restricted visibility | US Sailing cruising/navigation; verified USCG Rules 5–8 and 19 | Recognize constant-bearing/decreasing-range risk, uncertainty and the different Rule 19 context; no fake traffic maneuver credit. |
| sail-42 | Night pilotage and position cross-checks | RYA Coastal Skipper; US Sailing Coastal Navigation | Cross-check expected marks/position and respond conservatively to disagreement. |

For the collision lesson, the [USCG amalgamated rules](https://www.navcen.uscg.gov/navigation-rules-amalgamated) were also retrieved and read directly: Rules 5–8 establish lookout, safe speed, risk assessment and timely action; Rule 19 addresses vessels not in sight of one another in or near restricted visibility. Provenance for that official source is in the separate seamanship manifest. The lesson avoids prescribing a universal avoiding turn or applying in-sight sailing/power priorities to unseen contacts.

Keep IDs stable, chain from sail-36 and set practice to null. Correct answer indices belong in the canonical lesson data; locale snippets contain only translated text and preserve option order. None of these numerical examples is a real route, forecast, chart or navigational instruction for the rendered island.

## Gaps ranked by assessment honesty and training value

| Competence | Current evidence category | Next useful increment | Feature/practical prerequisite |
|---|---|---|---|
| Helm, trim, hoist/reef selection, ordered maneuvers | Currently measured in model | Improve debriefs with heading/trim/speed history and consistent thresholds. | Empirical-force validation against an identified yacht is needed before fidelity claims. |
| Wind, current and motion distinctions | Measured state + theory | Compare heading/STW with COG/SOG and show vector interpretation. | Reference conventions, units and numerical stability must remain explicit. |
| Crew briefing, knots, winches and loaded lines | Theory only; physical assessment required | Role/sequence scenarios and hardware orientation. | Real rope friction, loads, safe hands and crew communication require supervised practice. |
| Heaving-to, backed jib and recovery from irons | Future capability + physical assessment | Implement independently backed headsail and balance behavior before adding assessed heave-to. | Validated sail/rudder balance; real vessel behavior varies. |
| Docking, spring lines, prop walk | Theory and open-water model drills only | Add wind/current approach choices and abort triggers first. | Credible contact, lines, propeller effects and crew tasks before berthing credit. |
| Person-overboard recovery | Theory only; physical assessment required | Spotter, alarm, flotation, help and approach decision scenarios. | Detection, casualty drift, propeller hazard, recovery equipment and lifting aboard are essential. |
| Tidal planning, variation, fixes and chartwork | Theory/decision only | Data-driven chart exercises with dates, datums, uncertainty and independent fixes. | Correct chart/publication licensing, current local data and carefully scoped assessment. |
| Traffic and navigation rules | Theory only | Verified legal-source decision library including uncertainty, overtaking and restricted visibility. | Traffic motion, visibility, sound/lights and correct jurisdiction before maneuver assessment. |
| Night/weather passage management | Theory only | Briefing, decision points, progress checks and diversions. | Realistic visibility/weather effects and meaningful time-dependent tasks. |
| Systems, first aid, radio and survival | Theory only; hands-on assessment required | Vessel checklist and emergency prioritization scenarios. | Physical equipment training and jurisdiction/provider-specific qualifications remain external. |

## Recommended integration order

1. Introduce transparent level metadata, persistent progress and unrestricted browsing. Link safety/emergency review from the first lesson.
2. Add six original Advanced decision lessons with two questions each and honest theory-only records. Require numerical assumptions in every calculation.
3. Add debriefs that explain evidence: measured quantities, failed margins, hint use and unassessed real tasks. Avoid scoring completion from visual proximity alone.
4. Develop feature-backed teaching in small increments: route plans and diversions, current vectors, tide tables and chart references, traffic scenarios, crew/systems decisions.
5. Obtain review from qualified sailing instructors and assess the model against an identified yacht and operating envelope. Use findings to adjust lesson limits before increasing claims.

A long list of lessons is not a complete sailing education. Quality here means correct, observable learning outcomes, clear feedback and a usable path to physical instruction.
