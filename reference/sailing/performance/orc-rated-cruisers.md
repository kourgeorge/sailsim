# Quantitative reference: two ORC-rated cruising monohulls

Publisher: Offshore Racing Congress (ORC); certificates issued through Norges Seilforbund.

Primary records:

- [Melody, Bavaria 38, certificate 03440004PTC](https://data.orc.org/public/WPub.dll/CC/255602), issued 14 May 2026, VPP 2026 1.00.
- [Twist, Bavaria 34 Cruiser, certificate 03440004HRC](https://data.orc.org/public/WPub.dll/CC/247346), issued 16 March 2026, VPP 2026 1.00.
- [Matching Norway non-spinnaker rating data](https://data.orc.org/public/WPub.dll?action=DownRMS&CountryId=NOR&Family=NS&ext=json).

Retrieval timestamps, byte counts, SHA-256 digests and supporting sources are recorded in [the performance manifest](../manifest-performance.json). The selected factual numeric values are in [the machine-readable dataset](orc-2026-rated-cruisers.json). Full certificate pages, fleet exports and manuals are not redistributed here.

## Original summary

The official ORC records provide a reproducible numerical comparison for a sailing simulator. They identify two specific cruising yachts, their rated sail configurations, and speeds at a grid of true wind angles and strengths. Melody is a useful approximately twelve-metre example with about 8.56 tonnes of sailing displacement and a main plus luffed headsail. Twist provides a smaller example close to the project's original mass and sail-area assumptions. Their selection is based on available configuration evidence and broad dimensions, not on which speeds happen to match the simulator.

These numbers are **rated boat velocities**, including rating adjustments. They are not sea-trial measurements or the unadjusted polar predictions available in an ORC Speed Guide. They can reveal implausible simulator trends and establish a documented comparison range, but matching them does not validate the engine's forces, handling, or a claim to reproduce either yacht.

## Configuration evidence

Both records are 2026 Non Spin/HSF Club certificates. Each explicitly allows zero spinnakers and zero flying headsails. This avoids comparing the simulator's main-and-jib model against a spinnaker polar. Neither record identifies a fixed reef or flattening state at each wind point.

| Quantity | Melody | Twist |
|---|---:|---:|
| Certificate class | Bavaria 38 Cr 02-0 | Bavaria 34 Cruiser |
| Certificate printed overall length | 11.830 m | 10.450 m |
| RMS overall length | 11.990 m | 10.403 m |
| RMS IMS length | 10.676 m | 9.405 m |
| Maximum beam | 3.898 m | 3.514 m |
| Draft | 1.714 m | 1.847 m |
| Measurement displacement | 7,551 kg | 5,589 kg |
| Sailing displacement, RMS | 8,562 kg | 6,415 kg |
| Maximum crew weight | 736 kg | 614 kg |
| Measured / rated mainsail area | 38.49 / 39.33 m² | 28.93 / 29.41 m² |
| Measured and rated luffed headsail area | 35.86 m² | 26.71 m² |
| Dynamic allowance | 0.360% | 0.360% |
| Age allowance | 0.650% | 0.618% |
| Spinnaker pole aboard | No | Yes |

The two overall-length fields disagree in the public records. Both are retained rather than choosing one silently. The dataset does **not** relabel IMS length as waterline length. In particular, a rendered afloat waterline should not be equated to an ORC IMS length without the relevant geometric definition. Measurement displacement and sailing displacement are different quantities; the latter includes the VPP's sailing load and should not be confused with an empty vessel's mass. The mainsail's rated area also differs from its measured area.

## Numerical table and interpretation

The dataset preserves the certificate's 72 reaching values per yacht: true wind speeds 4, 6, 8, 10, 12, 14, 16, 20 and 24 knots, at true wind angles 52°, 60°, 75°, 90°, 110°, 120°, 135° and 150°. It also preserves optimum beat and run angles and their rated VMGs separately.

A compact sample for Melody, in rated boat-speed knots:

| True wind angle | 6 kn wind | 12 kn wind | 20 kn wind |
|---|---:|---:|---:|
| 52° | 4.92 | 7.07 | 7.56 |
| 60° | 5.28 | 7.31 | 7.83 |
| 75° | 5.52 | 7.52 | 8.26 |
| 90° | 5.42 | 7.55 | 8.53 |
| 110° | 4.81 | 7.40 | 8.70 |
| 120° | 4.54 | 7.23 | 8.61 |
| 135° | 3.96 | 6.77 | 8.31 |
| 150° | 3.36 | 5.99 | 7.84 |

At 12 knots true wind, Melody's listed optimum beat angle is 41.7° and its beat VMG is 4.80 knots. That VMG is progress toward the wind, not a boat speed of 4.80 knots at 41.7°. Likewise, run VMG must not be plotted as boat speed at 180°. The dataset leaves these quantities distinct and does not synthesize missing 0° or 180° boat-speed points.

All 144 reaching cells were independently compared with the matched official JSON `Allowances.R<angle>` arrays using `rated speed = 3600 / time allowance`, where time allowance is seconds per nautical mile. Differences were below 0.006 knots, consistent with the published two-decimal speed and one-decimal allowance precision. The certificate's rounded values are retained; the arithmetic does not create additional measured precision.

## Why these are rated speeds

[ORC VPP Documentation 2022](https://orc.org/uploads/files/Rules-Regulations/ORC-VPP-Documentation-2022.pdf), section 8.1 on page 78, describes the certificate's velocity table after dynamic and age allowances and gives the conversion `TA = 3600 / v`. It describes the grid in true wind speed and true wind angle. This older explanatory document establishes semantics; the numerical records here are explicitly the 2026 certificates, whose wind grid includes 4 and 24 knots in addition to the 2022 document's listed values.

[ORC Speed Guide Explanation 2020](https://orc.org/uploads/files/Rules-Regulations/Speed-Guide-Explanation-2020.pdf), section 2, distinguishes its unadjusted polars: age and dynamic allowances are omitted there because they concern handicap rating rather than straight-line performance. Section 3 describes optimized sail flattening and reefing; Appendix A uses wind sensed at 10 metres above water and explains true/apparent wind conversion. Pages 2–3 of the guide and page 78 of the VPP documentation were rendered and visually checked during this research.

The public [ORC Rating Files page](https://orc.org/race-managment/rms-files) identifies the exports as certificate scoring data and expressly describes studying relative boat performance as another use. The certificate tables call the quantities “Rated boat velocities in knots.” No attempt is made here to remove percentage allowances or infer a raw polar: course-dependent adjustments and other rating factors are not resolved by one global multiplier.

## Suggested simulator comparison contract

Use both references descriptively until a coherent simulated vessel profile is chosen. Declare the simulator's actual mass, waterline, sail areas, draft, appendages and sail state alongside every comparison; do not mix Melody's sails, Twist's measurement displacement and an unrelated rendered hull and call that a calibrated yacht.

For an initial numerical comparison, use steady conditions, zero current, neutral engine, the anchor stowed, and sufficient open water. Zero current avoids treating the simulator's ground-referenced true wind as if it were automatically equivalent to a water-referenced sailing instrument convention. Report the steady speed and whether a stable heading/trim state was achieved; do not silently substitute target heading or desired speed for the simulated result. The reference does not establish that the VPP predicts the same sea state, sail reduction, leeway or crew placement as the simulator.

Compare like quantities: reaching boat speed with reaching boat speed, and windward/leeward VMG with VMG. Account explicitly for any difference between forward hull speed and the magnitude of water-relative velocity when lateral motion is present. Keep side-by-side differences visible rather than hiding them behind a fit score. A mismatch can arise from different vessel particulars, rating adjustments, sail choices, or model errors; the data alone do not distinguish these causes.

The tables do not calibrate acceleration, tacking losses, rudder response, heel, stability, loaded line handling, anchor performance or sea-state response. Exact real-vessel validation would require configuration-matched unadjusted predictions or measured trials, controlled conditions, and independent expertise.
