# Content Quality Audit

## Delivered

- Corrected the core inventory from 855 entries to 850 headwords. The extra entries `less`, `least`, `most`, `she`, and `un` remain accepted course exceptions; no lesson or progress IDs changed.
- Before Week 13, scheduled course coverage was 174/850 (20.5%), with 676 missing core headwords and 53 supplementary course words. After the Week 13 extension, coverage is 191/850 (22.5%), with 659 missing core headwords and 53 supplementary course words. All 244 course words occur in day word lists.
- Replaced spelling-based placeholder phonetics for all 50 Week 8-12 words with British IPA. The typed pronunciation map makes missing entries a compile-time error.
- Corrected countable-word language in all weekly assessment rubrics. Scores, criteria IDs, and pass thresholds are unchanged.
- Corrected Day 80's `much days` model answer, cloze and Chinese prompt together: `A week has 7 days.`
- Added incremental library browsing beyond the former hard limit of 120 entries. Search/filter changes reset the batch, and the visible count is announced as status.
- Added machine-readable health output with exact missing/supplementary words, unscheduled IDs, and first-introduction lists for every day.
- Added Week 13 (Days 85-91), with 17 new core words, 4 patterns, a complete home-object picture scene, and all day-level scene/remix assets.

## Audit Method

Compared the local inventory with the five groups in [Ogden's grouped list, university-hosted archive](https://static.hlt.bme.hu/semantics/external/pages/Ogden-lista/ogden.basic-english.org/words.html). The archived groups total 850 unique headwords. Normalized its alternative spellings `grey/gray` to `gray` and `plough/plow` to `plough`, matching the existing course. The original local inventory had no missing headwords and exactly the five additions listed above. This is an inventory check, not a claim that every accepted derivative is itself a core headword.

Pronunciations follow British IPA. Homographs were checked against dictionary entries: [wind](https://dictionary.cambridge.org/pronunciation/english/wind), [record, noun](https://www.oxfordlearnersdictionaries.com/definition/english/record_1). Audio still uses the learner's configured browser voice; this change does not force a British voice.

Reproduce the health report:

```powershell
npm run content:health
node scripts/course-health-report.cjs --json
```

The JSON report derives scheduled coverage from actual day references, independently of `weekIntroduced`. It includes exact missing words rather than assuming that every word in the dictionary has a lesson or image.

## Verification

- Regression tests initially reproduced the placeholder phonetics, invalid answer, inaccessible library tail, and incorrect headword count.
- Production build passed; the main JavaScript chunk remains approximately 527 kB before gzip.
- Desktop/mobile E2E covers all 850 library entries, query reset, overflow, and existing learning flows.
- Course health reports zero errors, with four existing load warnings retained.

## Remaining Product Work

This closes the bounded content-correctness and library-access repair, not the entire future curriculum backlog.

- Weeks 2-4 remain uneven: Week 2 introduces 33 words and averages 11.7 active references/day; Weeks 3 and 4 introduce 48 and 39 words. The warnings were not suppressed or thresholds relaxed. A future lesson-load revision must account for prerequisite patterns and existing progress.
- The 13-week course is not full coverage of all 850 words, nor a guarantee of describing every possible life situation. The 659 missing headwords need authored teaching content and reviewed assets before they can be called delivered.
- The pre-existing untracked Weeks 13-52 proposal remains a separate draft, not shipped curriculum. Its capacity is 679 slots, now three above the corrected remaining inventory; its test expectations were minimally reconciled without changing the proposed lessons or promoting the draft into the product.
- This audit checks targeted grammar defects and pronunciation placeholders. It is not a complete linguistic certification of all prompts.
- Initial bundle optimization remains open. No image was regenerated, redrawn, resized, or compressed in this repair.
