---
doc: checklist
status: draft
---

# Build Checklist

Execution: autonomous prototype under “continue”; formal learn/fast choice and planning approval are not claimed. Implementation progress is separate from hands-on review. Local Git checkpoints preserve working steps.

## Slices

- [ ] **1. An original agreement and additions produce distinct budget totals**
  Becomes usable: Responsive workspace where baseline and source-backed requests produce pending/accepted/estimated figures.
  Why now: Proves the unique kernel early.
  PRD ref: `prd.md > Original Agreement`, `prd.md > Traceable Change Records`, `prd.md > Budget Summary`
  Spec ref: `spec.md > Workspace Shell`, `spec.md > AgreementForm`, `spec.md > ChangeDialog and ChangeList`, `spec.md > BudgetPanel`, `spec.md > Domain and Persistence`
  Build: React/Vite, integer domain logic, synthetic example, baseline/change forms, list/filter and budget.
  Verify (mechanical): Domain tests, build, browser-create baseline/change and record decisions; responsive visual check.
  Learner check: Load example; see pending $2,300 vs approved $2,000; record one decision.
  Commit: `Build traceable changes and budget workspace`

- [ ] **2. The project survives reload and produces a portable confirmation document**
  Becomes usable: Local save, guarded JSON restore, matching Markdown/print and Chinese/English interface.
  Why now: Completes output and return journey after financial kernel works.
  PRD ref: `prd.md > Confirmation Document`, `prd.md > Local Save and Backup`, `prd.md > Synthetic Example`
  Spec ref: `spec.md > ConfirmationDocument`, `spec.md > Domain and Persistence`, `spec.md > Important Failure Modes`
  Build: Persistence/import, replacement/undo, export/print, locale and run instructions.
  Verify (mechanical): Reload/restore/export, corrupt import preservation, accepted-edit reset, blocked/corrupt storage, mobile, English and print PDF inspection.
  Learner check: Reload; download document/backup; restore; try English.
  Commit: `Add local persistence and confirmation exports`

## Hands-on Checkpoints

- [ ] Participant explores usable workflow and reports feedback
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete
- [ ] Optional edit and transfer reflection addressed
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown

Activity and evidence: Participant interaction pending. Agent verification will not be described as learner practice.
Route and stops: To be derived from implemented code.
Edit outcome: Not offered yet.
Reflection: Not offered yet; personal answers belong in ignored profile.
Activity mode: Reference route planned; interactive activity pending.

## Revisions
