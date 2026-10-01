# Physical-practice scoring

The 19 existing sailing practices retain their ordered control and physics predicates. A pass requires every objective, the full continuous dwell for each timed objective, no critical failure, and a score of at least 80/100. Elapsed time by itself earns no points. Completing an objective earns its equal share of 100 points; an unfinished objective earns none.

Losing a satisfied condition after at least one continuous second deducts 2 points. The total deduction is capped at 20 points. Shorter fluctuations reset the required continuous hold but carry no score deduction. Hints mark the attempt as assisted and record their count; they do not reduce the score or prevent credit. Repeating an attempt has no score penalty.

Grounding, changing prescribed conditions, using the engine, or deploying the anchor before the permitted stage ends the attempt. The report records a stable failure code and the observed state. A failed or interrupted attempt cannot pass regardless of points; its displayed score is capped at 79. Starting another attempt, changing modes, or resetting records an interrupted outcome without claiming a specific safety violation.

Reports preserve each objective's predicate kind and target, required and achieved continuous hold, longest hold, meaningful hold losses, completion time, and a state snapshot. A snapshot supports review of the model; it is not a full replay or proof of real seamanship. The debrief identifies remaining objectives and links the practice's existing transfer guidance.

`practiceRubric(lesson)` and `practiceAssessment(attempt, lesson)` are exported from `learning/engine.js`. `PRACTICE_SCORE_RULES` describes the scoring policy. Terminal attempts save `lastPracticeResult` and the latest five `practiceResults` in the existing lesson record. Historic practice and knowledge booleans remain valid; old records receive no fabricated score. Loading reports validates objective structure, bounds numerical evidence, and recalculates scores, without using a saved score to grant mastery.

This design draws on the checkpoint states and explicit scored-event approach in the driving project at `mooc`, which was inspected read-only. No driving code or road rules were copied into the sailing assessment.

## Separate decision-scenario evidence

Lessons declaring `decisionScenarioId` and an ordered `decisionObjectiveIds` list require `decision` evidence as well as their knowledge check. Existing knowledge and physical-practice evidence remains stored; legacy records receive no automatic scenario pass.

`recordDecisionResult(progress, lesson, report)` accepts a terminal version-1 report only when its lesson, scenario and complete ordered objective list match the trusted lesson metadata. Points must match integer stage weights summing to 100. A revised decision deducts 5 points. A pass requires all stages complete, at least 80 points and no critical failure. Failed scores are capped at 79. Score arithmetic, numerical types and report identity are validated before persistence.

Decision reports have unique `id` values for deduplication. Records preserve `decisionAttempts`, `lastDecisionResult` and the latest five `decisionResults`. A later failed retry does not erase earlier evidence. Observed answers and inspected-source identifiers are copied and bounded; reports do not execute content or grant physical-practice credit. Decision evidence still respects sequential course prerequisites.

## Learner workflow and scenario judging

Every lesson now has one primary **Start training** action: 19 lessons start live boat handling in the 3D world; 23 start an interactive seamanship workspace. **Study material** opens the illustrated reader independently. Opening it during training pauses the task and preserves entered actions; returning or choosing **Resume training** resumes the same attempt. Changing lessons/modes or explicitly ending training records an interrupted result. Reading, browsing and elapsed time never earn scenario points.

The 23 decision scenarios contain 69 stages. Each stage requires inspection of authored evidence and a concrete task product: crew assignments, a checklist, ordered procedure, route, observation log, or numerical plan. Correct products complete objectives worth 34/33/33 points. An incorrect committed product deducts five points; editing drafts and incomplete submissions do not. Authored critical choices immediately end the run. Required chart waypoints, their order, explicit start/finish and the entire geometry of every route segment are checked. A chart segment touching an exclusion ellipse is unsafe. Numerical answers are bounded and tested against authored tolerances; booleans, arrays and blank strings are rejected as numbers.

Scenarios model changing supplied evidence, not real boat handling for every subject. Their scope is shown in the workspace and debrief: emergency communications are offline planning, preparation uses reported equipment state, anchoring plans do not demonstrate physical deployment, and contact decisions do not demonstrate radar operation or full traffic avoidance. The existing 19 practices continue to require real modeled control/physics outcomes.

The workspace displays current goals, score, mandatory completion criteria and deductions. Debriefs retain the learner's submitted products—including critical failed choices—and each achieved or missed goal. The latest five scored attempts are reviewable; JSON course export preserves the record. Text-only language packs cover English, Spanish, Arabic, Hebrew, Russian and French. Their loader validates completeness and copies only display text; translations cannot alter answer keys, geometry or scoring.

The independent knowledge check remains required alongside training and earlier sequential prerequisites. Existing knowledge and physical practice evidence is preserved, but previously theory-only lessons now require their new scenario evidence. No historical scenario score is invented.

Validation: `npm test` covers all 19 physical practices, all 23 canonical decision scenarios, critical choices, route omissions/order/segment hazards, malformed inputs, localization boundaries and score persistence. `scripts/check-decision-training.mjs --locales` exercises the actual training controls, all scenario passes, critical failure, study/resume, live boat launch, stored debriefs and six-language large-text layouts.
