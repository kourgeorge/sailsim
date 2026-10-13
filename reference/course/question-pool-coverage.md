# Question pool coverage — Seamanship for Boat Operator

Source: `Question Pool  Seamanship for Boat Operator.pdf` (Israel Shipping & Ports Authority, 362 questions).
Extracted questions: `question-pool-seamanship.json` (re-create with `python3 scripts/extract-question-pool.py`).
Per-question verdicts: `question-pool-coverage.json`. The plan for closing gaps is in `docs/QUESTION_POOL_PLAN.md`.

A question is **covered** when the course states the fact needed to pick the right answer, **partial** when the topic is taught but that fact is missing, and **not covered** when the topic is absent. Verdicts come from reading the lesson and scenario text in English, so treat them as a guide, not an audit. 74 questions refer to a picture booklet that is not in the PDF; those were judged from the answer text.

## Totals

| Date | Covered | Partial | Not covered |
| --- | --- | --- | --- |
| 2026-10-13, first review | 91 (25%) | 121 (33%) | 150 (41%) |
| 2026-10-13, after batch 1 (lights, shapes, signals) | 146 (40%) | 69 (19%) | 147 (41%) |
| 2026-10-13, after batch 2 (buoys and harbor entrances) | 153 (42%) | 62 (17%) | 147 (41%) |
| 2026-10-13, after batch 3 (distress, grounding, flooding, fire) | 175 (48%) | 47 (13%) | 140 (39%) |

## By topic

| Topic | Questions | Covered | Partial | Not covered | Not-covered question numbers |
| --- | --- | --- | --- | --- | --- |
| Weather | 61 | 1 | 4 | 56 | 80, 121, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 189, 190, 191, 192, 193, 194, 195, 196, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 250, 257, 258, 259, 264, 268, 270, 271, 275, 276, 277, 296, 297, 298, 305, 306, 307, 308 |
| Lights and day shapes | 60 | 53 | 4 | 3 | 218, 345, 354 |
| Right-of-way rules | 44 | 41 | 3 | 0 |  |
| Sailing theory and trim | 40 | 27 | 12 | 1 | 285 |
| Emergencies and distress | 28 | 23 | 0 | 5 | 83, 91, 110, 151, 272 |
| Safety equipment | 25 | 2 | 1 | 22 | 41, 43, 48, 52, 53, 75, 87, 93, 102, 109, 111, 165, 230, 232, 246, 248, 263, 267, 281, 299, 355, 359 |
| Boat handling under engine | 20 | 2 | 9 | 9 | 79, 84, 100, 146, 149, 159, 161, 183, 304 |
| Anchoring and mooring | 18 | 2 | 10 | 6 | 94, 95, 105, 138, 247, 360 |
| Sound signals | 16 | 16 | 0 | 0 |  |
| Israeli law and regulations | 15 | 0 | 1 | 14 | 37, 38, 39, 40, 42, 45, 49, 51, 152, 252, 301, 312, 352, 353 |
| Ropes and knots | 11 | 0 | 0 | 11 | 76, 90, 99, 101, 107, 108, 118, 132, 266, 280, 300 |
| Other (mostly signal flags) | 10 | 1 | 0 | 9 | 60, 63, 64, 65, 66, 67, 68, 148, 273 |
| Buoys and marks | 8 | 7 | 1 | 0 |  |
| Charts and navigation | 3 | 0 | 2 | 1 | 284 |
| Boat parts and terms | 2 | 0 | 0 | 2 | 119, 254 |
| Radio | 1 | 0 | 0 | 1 | 50 |

## Biggest remaining gaps

1. **Weather:** pressure systems, fronts, isobars, clouds, barometer trends, the Beaufort scale, and local winds (Sharqiya, Meltemi).
2. **Safety equipment:** life rafts and their automatic release, fire extinguisher types, flare types and storage, harnesses, sea anchors.
3. **Israeli law and regulations** and **ropes and knots:** not taught at all.
4. **Signal flags** other than A (B, O, Q, quarantine/health, flags for entering a foreign port).

## Strong areas

Right-of-way rules, lights and day shapes (after batch 1), sound signals, and sailing theory and trim line up well with the exam.
