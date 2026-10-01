# Sailing simulator roadmap

The aim is a clear, useful training companion with defensible assessments and convincing vessel behavior. Work should improve a learner’s ability to explain a decision or demonstrate a supported task, with evidence for each new claim. No release is a sailing qualification or a substitute for supervised on-water assessment.

## Current baseline

- **42 lessons / 10 modules / 84 explained questions / 19 assessed sailing practices / 23 interactive scenarios with 69 stages.** Basic covers lessons 01–16, Intermediate 17–36 and Advanced 37–42. The six Advanced lessons include assessed planning and numerical decision scenarios. All lessons are browsable, including early access to emergency lessons 33–34.
- Compact header status control: study, not started, running, paused, unassessed practice and debrief are explicitly distinguished.
- Finite-hull contact response shared with the rendered world, including movable yachts/buoys and fixed marina/shore obstacles. Contact evidence fails assessed runs and survives restoration.
- Direct training launch, live scores, required objectives and saved scored debriefs across all 42 lessons; study remains a separate action that can pause and resume training.
- A full-page illustrated reader divides study into concepts, observations, practice instructions where supported, questions and transfer to real sailing. Page navigation is separate from assessment evidence.
- Six languages: English, Spanish, Arabic, Hebrew, Russian and French. RTL reading layouts, text scaling from 100–200%, a 125% default and saved preferences support readability.
- Thirteen contextual guides and a searchable library of 25 verified official-source records with original English notes and links. The library excludes unsuccessful retrievals; those remain documented in source manifests.
- Three fictional locations: Haven Islands, Shelter Bay and Windward Strait. Shared geometry data supports the rendered islands, chart, plotter and depth model.
- Three auxiliary-power drills have separate history and debriefs based on actual recorded tracks, control changes and measured performance. They supplement the 19 course practices without claiming alongside docking competence.
- Independent yacht controls and an empirical physics model with documented reference frames and behavioral tests. No yacht-specific calibration or sea-trial validation has been completed.

## Priorities

### 1. Verify teaching, accessibility and assessment

Have qualified sailing instructors review the entire progression, quiz explanations, control conventions and limits. Seek native nautical-language review for all translated material, particularly emergency wording, navigation references and RTL numerical examples. Fix discovered errors before expanding content.

Exercise the reader, guides, library, maps and lab on desktop/mobile at 100%, 125% and 200% text size. Include keyboard-only operation, focus return, screen-reader names, language switching, long translations, paused-state behavior and recovery from interrupted sessions. Record a reproducible acceptance matrix and screenshots.

Preserve stable lesson IDs and existing learner evidence. Keep browsing, knowledge checks, model practice and physical competence distinct. Show what was measured, which margin failed and whether hints were used; do not award credit from a timer alone or visual proximity to scenery.

### 2. Establish a measured physics baseline

Choose a representative yacht and a documented operating envelope. Collect suitable published or authorized data for speed/polars, acceleration, deceleration, turning, astern control, heel and leeway. Review assumptions with an instructor or naval architect, and record units, uncertainty and configuration for each comparison.

Validate changes against both quantitative reference cases and all existing training scenarios. Test frame-rate sensitivity and extreme inputs. Keep calibration data separate from validation cases. Publish deviations instead of calling the model accurate merely because tests pass.

Sail balance, backed headsail behavior, aerodynamic braking and heaving-to need explicit work before adding assessed heave-to exercises. Wave-induced motion should be coupled to a defensible force model before visual sea state is treated as a handling condition. Uniform current and aesthetic waves must remain clearly identified until replaced.

### 3. Build navigation decisions around trustworthy data

Extend the six Advanced lessons with bounded chart exercises: route alternatives, abort points, estimated positions, current vectors, course to steer, tidal heights and clearance margins. Every exercise needs stated datums, times, units, assumptions, uncertainty and a reference answer.

Introduce licensed or original training charts and time-dependent data before claiming real chartwork practice. Preserve the distinction between compass heading, water-relative motion and ground track. Add independent position checks and situations in which instrument disagreement requires reassessment.

Develop traffic cases from verified International and applicable inland/local rules. Cover lookout, uncertainty, overtaking, restricted visibility and responsibilities after initial action. Dynamic traffic, visibility, lights and signals must exist before awarding collision-avoidance maneuver credit. Avoid universal turns or blanket sailing priority.

### 4. Expand harbor, crew and emergency capability

Keep current power drills focused on open-water control. Build believable contact, fenders, line constraints, propeller effects and crew roles before adding assessed berthing or spring-line maneuvers. Include failed approaches with viable abort options, not only ideal arrivals.

For anchoring, distinguish approach control, deployment, setting and monitoring. Anchor/rode visuals, the live monitor and chart now share bow-based deployment geometry, including suspension, bottom contact and dragging. Stopping assessments include sideways drift and current. Remaining work includes windlass/fall timing, terrain-following dragging, seabed/anchor holding behavior and changing environmental loads before assessing more than sequence and settling.

Add crew briefing, equipment checks, lookout assignments and emergency decisions first. Person-overboard training needs detection, continuous observation, flotation/marking, casualty drift, approach, propeller hazards and a credible recovery/lifting process. Physical line handling, first aid and casualty recovery still require onboard or hands-on instruction even after better simulation.

### 5. Improve visual detail and performance together

Prioritize details that communicate sailing state: sail shape and airflow cues, reef configuration, loaded versus eased lines, boom movement, instrument readability, wake and motion. Keep decorative geometry from obscuring controls or compromising small-screen performance.

The rig-state audit now checks tack-normalized traveler direction, a complete rotating masthead wind pointer, elapsed-time boom response and keel geometry matching the 1.8 m modeled draft. These verify consistency with simulator state, not real sail shape or hydrodynamic calibration.

Measure representative integrated/discrete GPUs and mobile devices. Track frame time, memory and input latency; introduce quality settings or level-of-detail changes based on measured bottlenecks. Software-WebGL browser checks establish functional behavior, not normal hardware performance.

### 6. Maintain sources and release safely

Recheck official-source links and effective dates regularly. Retry American Sailing’s unavailable official pages and direct UNECE Resolution No. 40 sources when accessible; do not invent missing equivalences. Separate organization training standards, race requirements, ICC categories and applicable law.

Update original summaries and translations when evidence changes. Keep research provenance, curriculum mappings and public library generation synchronized. Do not redistribute full manuals as lesson content.

Use small reviewed Git checkpoints, meaningful numerical and scenario tests, a production build and targeted browser verification. Run suites sequentially when software rendering is used. Maintain rollback instructions and record material limitations with each release; never imply that a larger feature count or passing suite grants certification.

## Done means demonstrated

For each increment, state the learner outcome, required simulated capabilities, evidence collected, failure conditions, tests and remaining real-world skills. New lesson content can ship as theory when appropriate. Practical credit waits until the behavior it claims to assess is implemented and verified.

The supporting evidence and crosswalk are in [course-level research](COURSE_LEVELS_RESEARCH.md); the model contract is in [physics](PHYSICS.md). These priorities are development work, not a promise of accreditation, calibration or unrestricted real-world readiness.
