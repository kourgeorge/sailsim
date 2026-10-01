# Course languages

English (`en`), Spanish (`es`), Arabic (`ar`), Hebrew (`he`), Russian (`ru`), and French (`fr`) are available from the header selector. A `?lang=` URL parameter takes precedence over the saved browser preference. English is the default. All packs are served locally; no translation service or language-model API is called by the app.

Each course pack contains 723 text leaves covering nine modules, 36 lessons, 72 questions with options and explanations, and every practical label, coaching hint, and debrief. Each interface dictionary has 276 source keys; supplemental entries cover composed status and accessibility text. Proper place names, international radio terms, compass notation, units, and some instrument abbreviations remain conventional.

Translations were directly authored and reviewed for completeness and nautical meaning by coding agents. Raw offline machine-translation drafts were discarded. This is not professional translation or independent native-speaking sailing-instructor validation. Further review should focus on regional nautical vocabulary, emergency wording, and learner comprehension.

## Assessment stays consistent

Language packs contain prose only. They do not set correct-answer indices, physical setup, checkpoint types, durations, thresholds, or prerequisites. Array order must match the English curriculum. The runtime checks the complete course structure and interface placeholders before changing languages. Missing or invalid packs leave an English interface and a visible loading error.

Mastery and quiz/practice evidence use stable lesson IDs and the existing `sail-training-v1` browser record. Switching language reloads the interface, preserving completed evidence but restarting an active physical attempt. The selector explains this behavior.

Arabic and Hebrew set the document language and RTL direction. Sidebar placement, reading order, and dialogs adapt. Charts, geographic bearings, helm commands, and physical sliders remain LTR to preserve their operational meaning; a language change never reverses steering.

## Editing and verification

1. Edit the English curriculum in `src/learning/curriculum.js`, then run `node scripts/export-locale-source.mjs`.
2. Apply equivalent changes to all five translated course packs in `public/locales/`, preserving IDs, arrays, option order, quantities, and conventions.
3. Update matching UI keys across `src/i18n/*-ui.json` and preserve every `{placeholder}` exactly.
4. Run `npm test`, `npm run build`, and `node scripts/check-locales.mjs` with the app running on port 5187. A subset can use `--locales=en,ar,he`.

Automated checks verify schema completeness, copied-English paragraphs, interface keys/placeholders, lesson navigation, quiz feedback, progress persistence after switching, RTL orientation, and mobile access. Screenshots and results are saved in `artifacts/locales/`. These checks establish coverage and interface behavior; they cannot establish idiomatic language or instructional effectiveness.
