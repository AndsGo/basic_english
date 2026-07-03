# Today Review and Reading Language Update

## Summary

This update fixes the Today review step and adds a learner-facing reading language setting.

## Today Review

Today review now uses the previous day's learning content instead of a fixed placeholder.

- Day 1 still shows the no-review message.
- From Day 2 onward, Quick Review displays the previous day's title.
- Review words come from the previous day's `wordIds`, limited by the current day's `review.wordCount`.
- Review patterns come from the previous day's `patternIds`, limited by the current day's `review.patternCount`.
- Review-step word marks are stored separately from the current day's Words step marks, so reviewing a repeated word does not complete the current day's word gate by accident.

## Reading Language

Reading aloud still uses the browser Web Speech API, but the learner can now choose the English voice language/accent.

Options:

- American English: `en-US`
- British English: `en-GB`
- Australian English: `en-AU`
- Canadian English: `en-CA`

Implementation notes:

- The app passes the selected language from `App` to `SpeechProvider`.
- `SpeechProvider` passes the language to `speechService.speak`.
- `speechService` sets `SpeechSynthesisUtterance.lang` to the selected value.
- The setting is stored under `basic-english-reading-language`.
- The app still does not select a specific browser voice package; the browser chooses the best available voice for the configured language.

## Verification

Coverage includes:

- Speech service language propagation.
- Speech provider language propagation.
- Speech button compatibility with the new service signature.
- Me page language setting callback behavior.
- App-level persistence for reading language.
- Today review showing Day 2 content when Day 3 is current.
