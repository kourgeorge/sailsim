# Sailing school curriculum

The course contains 42 authored lessons and 84 explained knowledge questions across ten modules. Every lesson has assessed training: 19 live boat-handling exercises and 23 interactive seamanship scenarios with 69 decision stages. Basic covers lessons 01–16, Intermediate 17–36, and Advanced 37–42. It prepares a learner for supervised on-water instruction; it does not confer a license, safety certification, or permission to skipper. No claim of endorsement by a sailing organization is made.

## Learning sequence

Each lesson has **training goals → performed tasks → judged evidence → debrief**, accompanied by illustrated study and knowledge checks. **Start training** launches its physical exercise or decision workspace directly. **Study material** opens the separate paged reader and can pause/resume an existing attempt. Reading and page navigation award no training credit. Estimated durations are planning guidance, not enforced time requirements.

| Module | Lessons | Intended outcome |
| --- | --- | --- |
| 1. Before you leave | Safety before speed; Know your yacht; Lines, winches, and loads; Read the instruments | Brief a crew, use boat vocabulary, distinguish line functions, locate the instruments. |
| 2. Your first sail | Where the wind comes from; Raise the sails; Feel the boat accelerate; Hold a steady course | Explain the wind convention, set sails, gain steerage, hold a heading. |
| 3. Make the wind work | Find a beam reach; Sail close hauled; Bear away to a broad reach; Trim with feedback | Relate points of sail to the wind and use controlled sheet adjustments. |
| 4. Change direction | Head up and bear away; Make a controlled tack; Make a planned gybe; Recover from loss of drive | Distinguish heading up/bearing away, bow/stern wind crossings, and residual-way recovery. |
| 5. Stay in control | True and apparent wind; Reef before you need to; Reduce power deliberately; Choose a weather limit | Read apparent wind, reduce sail, anticipate coasting, choose conservative conditions. |
| 6. Find your way | Read a practice chart; Steer toward a waypoint; Estimate distance and time; Sail a short passage | Interpret the fictional chart, check a route, estimate travel time, sail connected legs. |
| 7. Share the water | Keep an effective lookout; Reason through encounters; Lights, marks, and signals; Make a passage decision | Recognize collision risk, explain basic encounter priorities, identify information gaps, revise a passage plan. |
| 8. Arrive and depart | Plan a docking approach; Choose an anchorage; Stop, then anchor; Prepare to leave | Prepare an approach and escape, reason about scope/swing, stop in sequence, depart a prepared open anchorage. |
| 9. Respond and review | Person overboard priorities; Distress and urgent action; Your assessed first passage; From simulation to the sea | Explain emergency priorities, combine modeled skills, identify remaining supervised practice. |
| 10. Coastal decisions | Plan the route and the escape; Tidal depth and clearance; Current vectors and passage time; Weather: go, wait or divert; Collision risk and limited visibility; Night pilotage and cross-checks | Produce bounded route plans, clearance calculations, course-to-steer solutions, revised weather decisions, collision-risk assessments and pilotage checks using stated fictional data. |

## Assessment contract

- Every lesson is browsable. Mastery is sequential: a lesson needs its predecessor, a correct knowledge check, and a pass in its prescribed physical or decision assessment.
- Knowledge answers have immediate explanations. Both must be correct; an incorrect response records a revision and never awards credit. Learners may retry.
- Practical attempts start explicitly and reset the boat and prescribed steady weather. Free sailing cannot silently complete a lesson.
- Checkpoints are ordered. Observation events from an earlier stage cannot be banked for a later stage.
- Timed checks require continuous performance. Leaving tolerance resets that checkpoint's timer. Pauses, dialogs, and suspended browser time earn no credit.
- Mainsail trim requires an exposed mainsail with drawing airflow; reefing requires the reefed main to remain hoisted. Coasting with a lowered main cannot satisfy either exercise. Anchor checks require rode long enough to reach the bottom, but do not establish safe real-world scope or seabed holding.
- Tacking requires a bow crossing of the wind plus settled speed on the opposite tack. Gybing requires a stern crossing. A sign change alone is insufficient to distinguish these maneuvers.
- Grounding, vessel/object contact, non-neutral throttle during a sail exercise, changing the specified wind/current, deploying the anchor before its stage, boat reset, or switching modes invalidates an active physical attempt. An ongoing contact at the start is also a failure; old incidents cannot fail a new, clear attempt.
- Successful practical evidence remains available while studying its quiz. Repeating a mastered exercise does not erase earlier credit.
- The final passage combines heading, trim, tack, coasting, and anchoring in order. Passing means those modeled tasks were demonstrated in the prescribed environment.
- Decision scenarios require inspecting the stated reports and submitting a plan, sequence, chart route, calculation or control decision. Stages award 34/33/33 points; incorrect committed decisions deduct 5 points, and authored critical choices end the attempt. Missing inputs do not carry a penalty. All stages, at least 80/100 and no critical failure are required. See [the scoring contract](PRACTICE_SCORING.md) for numerical tolerances and physical scoring.

## Feedback and records

The live card reports the current physical checkpoint, continuous timer and score; the decision workspace shows required reports, task products and stage scores. Optional coaching uses the current state and exercise stage. The course record saves knowledge evidence, separate physical/decision passes, attempts, hints, revised answers, the selected lesson and the latest five reports per training format in browser local storage. Reports retain completed goals, deductions, submitted actions and contact evidence where applicable. Records can be exported as JSON. Completed evidence restores after refresh; active attempts do not resume across page reload. The former six-lesson click badges are not migrated into assessed mastery.

Local progress is a learner convenience, not tamper-proof examination evidence. Storage restoration validates known lesson identifiers and field types; there is no server identity or external certification.

## Model boundaries and transfer

The simulation estimates apparent wind, separate sails, leeway/current, rudder response, engine thrust, and anchor swing. Its coefficients are empirical and are not validated against a particular yacht. Instructor-led practice remains necessary for loaded line handling, knots, physical hoisting/reefing, crew commands and timing, real weather and breaking seas, real chart/tidal planning, traffic and local rules, engine docking, spring lines, anchor holding, and casualty recovery. The docking and emergency lessons are decision exercises, not physical competence assessments.

The chart depicts fictional practice water, not a navigational chart. Visual proximity to the dock is not docking credit. Course completion is a study milestone, not evidence that the learner can handle an unfamiliar boat or situation.

## Further study

These independent organizations publish real-world training and regulatory material. The curriculum's original text is not represented as a reproduction of or approved syllabus from them:

- [RYA training](https://www.rya.org.uk/training): structured practical and shore-based sailing instruction.
- [US Sailing education](https://www.ussailing.org/education/): instructor-led sailing development and safety education.
- [US Coast Guard Navigation Center — Navigation Rules](https://www.navcen.uscg.gov/navigation-rules-amalgamated): authoritative rules reference; applicable local requirements must also be checked.
- [RNLI safety](https://rnli.org/safety): preparation, personal safety, and emergency information.

## Next curriculum development gates

Three additional engine maneuvering drills already measure controlled stopping, astern steering and a precision approach, with track replay and separate history. Hull/object contact is modeled, but contact response does not establish docking competence. Remaining domains include fenders and spring-line handling, collision avoidance with navigational traffic behavior, time-dependent tides and independent fixes, validated heaving-to/backing-sail behavior, and person-overboard tracking plus recovery. Before extending practical credit, implement the relevant forces, observations and failure conditions, then establish attainable scenarios and tests. More questions alone cannot make those domains practically assessed.

Automated coverage currently verifies authored curriculum structure, sequential prerequisites, knowledge-only versus practical evidence, persistence validation, continuous holds, ordered events, tack/gybe discrimination, and invalidation paths. Browser checks are needed for dialog navigation, responsive layout, camera/chart events, and scenario controls after UI changes.

## Practical reachability verification

Run `node scripts/check-training-scenarios.mjs` (or add `--json` for checkpoint positions and timing). The verifier initializes the same prescribed practice state, then applies a deterministic proportional/damped helm controller, apparent-wind sheet adjustments, and real sail/reef/anchor controls. Every change in position, heading, and speed after initialization comes from the production physics integrator. Camera and chart checkpoints receive explicit observation events. This verifies feasibility, not ease of use by a novice or real-vessel fidelity.

All 19 scenarios passed on the current model with a 0.1-second evaluation step. Results below are simulated seconds using continuous control adjustments; human completion times will vary. Observation-only checks are intentionally instantaneous after the relevant event.

| Exercise | Passing time | Minimum depth |
| --- | ---: | ---: |
| Read the instruments | 0.2 s | 35.0 m |
| Raise the sails | 2.0 s | 35.0 m |
| Feel the boat accelerate | 13.0 s | 35.0 m |
| Hold a steady course | 16.0 s | 35.0 m |
| Find a beam reach | 12.7 s | 35.0 m |
| Sail close hauled | 14.7 s | 35.0 m |
| Bear away to a broad reach | 13.1 s | 35.0 m |
| Trim with feedback | 10.1 s | 35.0 m |
| Head up and bear away | 32.1 s | 35.0 m |
| Make a controlled tack | 20.7 s | 35.0 m |
| Make a planned gybe | 11.2 s | 35.0 m |
| Recover from loss of drive | 15.4 s | 35.0 m |
| Reef before you need to | 10.1 s | 35.0 m |
| Reduce power deliberately | 82.2 s | 35.0 m |
| Steer toward a waypoint | 35.7 s | 35.0 m |
| Sail a short passage | 78.3 s | 34.2 m |
| Stop, then anchor | 204.2 s | 35.0 m |
| Prepare to leave | 14.8 s | 35.0 m |
| Your assessed first passage | 270.7 s | 23.6 m |

No scenario needed its tolerances, order, or failure rules relaxed to pass. The anchor exercises take several minutes because a lowered anchor with slack rode is not an immediate brake; they complete with the model reporting “Deployed · settling,” and therefore assess sequence and low speed rather than anchor holding. The capstone completes its bow crossing around 27 seconds, finishes the post-tack recovery around 39 seconds, coasts below 0.8 knots around 153 seconds, and settles below 0.2 knots around 271 seconds.

Regression tests run the complete 19-scenario loop, physical tacks through compass north in both directions, and true/apparent wind source conventions. The compass-north cases verify that 359°/000° wrapping is not mistaken for a gybe. Rerun the verifier after changes to drag, steering, sail forces, coastline, or assessment thresholds and refresh these observations when the model changes.
