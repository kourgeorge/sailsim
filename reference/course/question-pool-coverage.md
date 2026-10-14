# Question pool coverage — Seamanship for Boat Operator

Source: `Question Pool  Seamanship for Boat Operator.pdf` (Israel Shipping & Ports Authority, 362 questions).
Extracted questions: `question-pool-seamanship.json` (re-create with `python3 scripts/extract-question-pool.py`).
Per-question verdicts: `question-pool-coverage.json`. The plan for closing gaps is in `docs/QUESTION_POOL_PLAN.md`.

Three exam answers contradict other answers or common seamanship and are left out on purpose: Q147, Q286 and Q288 (see `docs/QUESTION_POOL_PLAN.md`).

A question is **covered** when the course states the fact needed to pick the right answer, **partial** when the topic is taught but that fact is missing, and **not covered** when the topic is absent. Verdicts come from reading the lesson and scenario text in English, so treat them as a guide, not an audit. 74 questions refer to the exam's picture booklet; they were checked against its official answer key (`picture-booklet-catalog.json`).

## Totals

| Date | Covered | Partial | Not covered |
| --- | --- | --- | --- |
| 2026-10-13, first review | 91 (25%) | 121 (33%) | 150 (41%) |
| 2026-10-13, after batch 1 (lights, shapes, signals) | 146 (40%) | 69 (19%) | 147 (41%) |
| 2026-10-13, after batch 2 (buoys and harbor entrances) | 153 (42%) | 62 (17%) | 147 (41%) |
| 2026-10-13, after batch 3 (distress, grounding, flooding, fire) | 175 (48%) | 47 (13%) | 140 (39%) |
| 2026-10-13, after batch 4 (docking and anchoring) | 196 (54%) | 32 (9%) | 134 (37%) |
| 2026-10-13, after batch 5 (sail handling and weather decisions) | 216 (60%) | 12 (3%) | 134 (37%) |
| 2026-10-14, after the weather lessons | 255 (70%) | 29 (8%) | 78 (22%) |
| 2026-10-14, after the safety-equipment lessons | 283 (78%) | 29 (8%) | 50 (14%) |
| 2026-10-14, after the ropes, flags and gear lessons, Israeli notes and the picture booklet | 343 (95%) | 19 (5%) | 0 (0%) |

## By topic

| Topic | Questions | Covered | Partial | Not covered | Not-covered question numbers |
| --- | --- | --- | --- | --- | --- |
| Weather | 61 | 45 | 16 | 0 |  |
| Lights and day shapes | 60 | 60 | 0 | 0 |  |
| Right-of-way rules | 44 | 44 | 0 | 0 |  |
| Sailing theory and trim | 40 | 39 | 1 | 0 |  |
| Emergencies and distress | 28 | 28 | 0 | 0 |  |
| Safety equipment | 25 | 25 | 0 | 0 |  |
| Boat handling under engine | 20 | 18 | 2 | 0 |  |
| Anchoring and mooring | 18 | 18 | 0 | 0 |  |
| Sound signals | 16 | 16 | 0 | 0 |  |
| Israeli law and regulations | 15 | 15 | 0 | 0 |  |
| Ropes and knots | 11 | 11 | 0 | 0 |  |
| Other (mostly signal flags) | 10 | 10 | 0 | 0 |  |
| Buoys and marks | 8 | 8 | 0 | 0 |  |
| Charts and navigation | 3 | 3 | 0 | 0 |  |
| Boat parts and terms | 2 | 2 | 0 | 0 |  |
| Radio | 1 | 1 | 0 | 0 |  |

## What is left

The 19 partial questions are:

- **Left out on purpose (3):** Q147, Q286 and Q288. Their official answers look wrong or contradict other answers.
- **Weather-chart questions (16):** 181, 190, 191, 192, 196, 237, 241, 243, 258, 275, 276, 277, 298, 305, 306 and 307. The course teaches the rules (wind around lows, isobar spacing, the order of the fronts). The answers depend on the exam's own chart, so a worked eastern-Mediterranean chart example would be the only further step.

Picture questions were checked against the official picture booklet (`assistant_exam_book.pdf`), whose answer key is catalogued in `picture-booklet-catalog.json`.

## Strong areas

Right-of-way rules, lights and day shapes (after batch 1), sound signals, and sailing theory and trim line up well with the exam.
