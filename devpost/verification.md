# Observed verification

Verified on October 14, 2026. These are agent-run mechanical checks, not participant trial or a claim that the project has been publicly shipped.

## October 16 usability revision

The participant requested continued website optimization. Agent reproduction found that clearing estimate hours showed a misleading $0 quote; saving a pending addition under an accepted-only filter left it hidden; and undo cleared the dirty flag while an unsaved agreement draft remained on screen. These behaviors are fixed. First-use guidance now names freelancers/small studios and illustrates a fictional $2,000 website with a separately quoted $1,000 blog request. Primary actions appear before that example. Cards expose a 44px-high decision action that opens the existing form at the select without changing any data until saved.

- All 10 domain/export cases pass. The production build succeeds: 253.15KB JavaScript / 79.36KB gzip and 40.62KB CSS / 9.39KB gzip.
- The isolated production-preview browser harness passes 10 integrated groups with zero page errors. New coverage checks empty, zero, negative, malformed, precision and out-of-range hours/rates; valid preview before text is complete; clearing filters/search and focusing the saved card; desktop/mobile decision focus; and cancel/discard branches of guarded undo. Cancel keeps both the draft and subsequent navigation protection. Editing no longer copies a display-only list index into saved records.
- Chinese and English first-use screens pass horizontal-overflow checks at 320/390/768/1024/1440px. Existing record layouts, mobile form/rounding, reload, local storage failure/recovery, JSON rejection/restore, bilingual Markdown and real print-PDF checks still pass.
- Desktop empty/example screens, English mobile first-use screen and mobile decision modal were visually inspected. Evidence is regenerated in ignored `artifacts/`, including `empty-1440-en.png`, `empty-390-en.png`, `example-desktop.png`, `mobile-decision.png` and `ui-verification.json`.
- The English UI recording was regenerated locally against the revision, including the direct decision action. All scene assertions pass with zero page errors. The encoded silent H.264 video is 96.97 seconds at 1440×900/30fps, and sampled frames were visually inspected. This local file is separate from the previously uploaded private review video; no replacement upload or publication occurred.

These are technical checks. Participant hands-on/final review remains unchecked, and this revision does not publish a video or submit the Devpost draft.

## Environment

Windows, Node 22.20.0, npm 10.9.3, React/React DOM 19.2.0, Vite 8.3.4, Playwright 1.56.1, isolated test Chromium 153.0.8010.12. Existing user browser windows/profiles were not touched. No external app writes or messages were sent.

## Evidence and outcome

- `npm test`: 10 passing financial/schema/export cases. Distinct pending/accepted/declined totals, rounding to cents, per-change rate snapshots and accepted-edit reconfirmation are verified with concrete values. A maximum multilingual backup fits the supported 5MB limit.
- `npm run build`: static production output succeeds; approximately 250.46KB JavaScript / 78.62KB gzip, 39.36KB CSS / 9.12KB gzip. No runtime API or remote asset dependency.
- Production preview at `http://localhost:4173`: synthetic example totals, reload persistence and Chinese document download pass in a fresh isolated context, with zero browser errors.
- Independent copy of source/manifest/lockfile to ignored `artifacts/clean-install`: `npm ci`, all 10 tests, and production build pass. Standard packages are pinned by the lockfile.
- `npm run test:ui` with the installed isolated Chromium: 8 integrated check groups, zero page errors. Raw record in ignored `artifacts/ui-verification.json`.

## Browser coverage

1. Empty first visit and explicit synthetic example; $2,300 pending vs $2,000 recorded approved vs $4,300 estimated.
2. Record outside acceptance; reload preserves the state/evidence; editing accepted effort returns pending and clears old evidence.
3. Cancel replacement, inspect original request, search and decision filters; financial totals remain project-wide.
4. Change baseline default rate without repricing existing records; lock currency; recover from invalid effort; native modal keyboard focus and unsaved-edit guard.
5. Chinese/English Markdown download agrees with visible amounts/source text; print button wiring and real Chromium print PDF.
6. Exact backup restore; reject malformed JSON, duplicate IDs and oversized file without changing stored project; deletion and undo.
7. Declined estimates excluded; no horizontal overflow at 320/390/768/1024/1440px; mobile addition with 1.25h × $99.99 = $124.99; proper save focus and persistent locale.
8. Simulated storage failure retains session data and permits backup; corrupt original storage remains unchanged/downloadable until explicit replacement, then valid data survives reload.

Earlier first-slice browser verification also created a real empty-project baseline through the form and added a 2.25h × $100/h change ($225), including required-input errors. These are synthetic QA inputs, not customer data.

## Visual and print review

Desktop example, empty state, 390px English workspace and mobile dialog screenshots were inspected. Chinese print PDF has three readable A4 pages for a four-change example; the baseline, all sources/quotes and correct $4,637.50 estimated vs $2,000.00 recorded approved summary are preserved. PDF page images were rendered and inspected. No navigation, toast or action buttons appear in the PDF.

Files are under ignored `artifacts/`: `example-desktop.png`, `example-390-en.png`, `mobile-dialog.png`, `confirmation-desktop.png`, `confirmation.pdf`, both Markdown exports, and validated backup. These can be regenerated by the browser harness.

## Fixes found during verification

English navigation overflowed at 320px; compact navigation now passes all five widths. Saving a modal launched from a disappearing empty-state button could expose the focused skip link; focus now returns to the main workspace. The initial 1MB restore cap did not contain every valid long multilingual project; it is now 5MB with an explicit upper-bound test.

## Practical limits and remaining review

Browser checks cover Chromium on this machine; native Safari/Firefox and real phone hardware have not been exercised. PDF save destinations and pagination may vary by browser/printer. There is one local project with no cross-device sync. Participant actual use, planning approval, final review/reflection, optional hosting, public video and submission remain pending. `devpost/checklist.md` keeps learner review boxes unchecked. Public source is available at https://github.com/kenchikuliu/scopenote.

## Local release preparation

On October 14, 2026, the production build and all ten existing tests passed again during release preparation. `npm audit --json` reported zero known dependency vulnerabilities. A pattern audit examined all four existing Git commits and 55 unique historical blobs, and the current intended publication files: no credential patterns or private learner-profile / environment-file paths were found. This is a bounded inspection, not a claim of exhaustive secret detection. No account authentication state is included.

The MIT notices for the bundled React, React DOM and Scheduler runtime were checked against installed license files and recorded in `THIRD_PARTY_NOTICES.md`. They are also included beside the static website when packaged. Vite and Playwright are development-only dependencies.

`scripts/record-demo.mjs` records actual English UI actions in a fresh test Chromium, using fictional example data. Assertions check the displayed budgets, invalid hours, accepted-quote reconfirmation, local reload, exported Markdown figures, JSON example marker and phone backup restore. It produces a silent raw recording, screenshots and a real English print PDF; the participant supplies their own final explanation. Recording is preparation, not participant review, publication or final submission.

## Public Source Check

On October 14, 2026 (UTC), the participant authorized publishing the inspected source and its history. The initial public push contained five commits and 34 tracked files at `7f7e5ac`; the release audit examined 60 historical blobs without finding the specified credential patterns or private learner-profile/environment paths. Anonymous GitHub API requests returned HTTP 200 for the repository, README, license, required planning documents, checklist and third-party notices. The remote main SHA matched the local commit; the public tree excluded the private learner profile and local artifacts. Repository and license links are recorded in `spec.md`. Source publication does not complete learner review, video publication or final submission.
