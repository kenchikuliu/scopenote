---
doc: spec
status: draft
---

# ScopeNote — Technical Specification

## How This Works, In Plain Language

The website holds an original agreement and additions. Each addition keeps its own estimate/rate. One calculation module produces displayed/exported totals. The browser keeps a local copy; JSON is the portable backup. No account or external AI call. This is an agent recommendation for a small testable prototype.

## The Core Journey Through the System

Baseline form → validated project → change dialog → change with rate snapshot → shared totals → list/budget/document → browser storage/downloads. PRD ref: `prd.md > The Core Journey`.

## Stack

- JavaScript/JSX and [React](https://react.dev/) 19.2.0.
- [Vite](https://vite.dev/guide/) static build/dev server; exact version in lockfile. Node 22.20.0 available.
- Plain CSS, original SVG icons, localStorage, Blob downloads, native dialog and print.
- Node built-in tests for financial/schema cases; [Playwright](https://playwright.dev/) 1.56.1 is a development-only dependency for isolated Chromium checks. It is excluded from the production bundle.

No participant stack familiarity is assumed. Installation/build will verify versions.

## Where It Runs and How Someone Tries It

Public source: https://github.com/kenchikuliu/scopenote. License: https://github.com/kenchikuliu/scopenote/blob/main/LICENSE. Clone with `git clone https://github.com/kenchikuliu/scopenote.git` and enter `scopenote/`.

Node >=22.12: `npm ci`, `npm run dev`, open `http://localhost:5173`. Production: `npm run build`, `npm run preview`, open `http://localhost:4173`. No credentials. `npm test` verifies domain logic. Public demo video: https://youtu.be/BZBYqzdNMM0 (97 seconds, English UI, silent, synthetic data). Anonymous playback was verified on 2026-10-16. Deployment is optional and has not occurred. Devpost submission and participant review remain pending.

## Look and Feel

Implements `prd.md > Look and Feel`: warm paper, deep green, ink/slate and restrained amber; tabular numbers. Rail/list/sticky summary on desktop; compact navigation/stack below 900px. Focus rings, reduced-motion support; clean white print document.

## Components

### Workspace Shell

`src/App.jsx`: navigation, locale, notices, guarded replacement/undo, filters, save status and dialogs. Saving a change clears search/decision filters and focuses its visible card. Undo checks for unsaved agreement edits; cancellation retains the draft and protection, while confirmed discard returns to the change log. Implements `prd.md > Screens and Layout`, `prd.md > Local Save and Backup`.

### AgreementForm

`src/components/AgreementForm.jsx`: baseline validation, currency restriction and unsaved feedback. Implements `prd.md > Original Agreement`.

### ChangeDialog and ChangeList

`src/components/ChangeDialog.jsx`, `ChangeList.jsx`: accessible estimate form, filters, request expansion, edit/delete and empty state. A fictional fixed-price website example explains the first-use scenario. Each record has an explicit decision action that opens the existing dialog and focuses the decision select; no decision is changed until saved. Quote preview uses the same numeric validation as saving and shows a dash for incomplete, malformed or out-of-range hours/rates, even while unrelated text is unfinished. Implements `prd.md > Traceable Change Records`.

### BudgetPanel

`src/components/BudgetPanel.jsx`: consumes shared totals. Implements `prd.md > Budget Summary`.

### ConfirmationDocument

`src/components/ConfirmationDocument.jsx`, `src/lib/export.js`: same totals for preview/Markdown and print styling. Implements `prd.md > Confirmation Document`.

### Domain and Persistence

`src/lib/domain.js`: integer parsing, validation, record transitions, schema checks, totals. `storage.js`: guarded browser load/save/locale. Implements `prd.md > Budget Summary`, `prd.md > Local Save and Backup`.

## Data Model

Version 1: `{version:1, project:null|Project, changes:Change[], isExample:boolean}`. Project: `title`, `client`, `scope`, `currency` (USD/CNY), `budgetCents`, `hoursHundredths`, `rateCents`. Change: unique `id`, `title`, `deliverable`, `source`, `hoursHundredths`, `rateCents`, `status` (pending/accepted/declined), `decisionNote`, `createdAt`, `updatedAt`.

React holds validated data; serialize accepted mutations and validate on reload/import. Locale stored separately. Fee = round(hoursHundredths × rateCents / 100). Bounds: 100 changes, 10,000h/item, 100,000 currency units/h, 100,000,000 baseline, 5MB backup. Integer products/sums stay safe. Text never interpreted as HTML. Existing rates do not follow baseline edits.

## File Structure

```
project/
├── src/
│   ├── App.jsx                  # orchestration
│   ├── main.jsx                 # entry
│   ├── styles.css               # responsive/focus/print
│   ├── components/
│   │   ├── AgreementForm.jsx
│   │   ├── ChangeDialog.jsx
│   │   ├── ChangeList.jsx
│   │   ├── BudgetPanel.jsx
│   │   ├── ConfirmationDocument.jsx
│   │   ├── Icon.jsx             # original paths
│   │   └── Field.jsx            # shared accessible form labels/errors
│   └── lib/
│       ├── domain.js
│       ├── export.js
│       ├── storage.js
│       └── i18n.js
├── tests/                      # domain and document checks
├── scripts/verify-ui.mjs        # isolated browser journey
├── devpost/                    # plans/checklist/offline app map
├── public/favicon.svg
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## External Services and Dependencies

No runtime APIs, keys, analytics, fonts or image requests. npm setup fetches packages. Isolated verification browser preserves existing user tabs. Optional static hosting may be chosen later.

## Important Failure Modes

- Invalid imported/stored JSON → reject/recovery feedback; preserve valid current work and unreadable storage until explicit replacement.
- Storage blocked/full → keep session work, show warning, allow backup.
- Edited accepted quote → reset pending and old evidence; notify.
- Currency change with records → explain restriction; create a new project instead.
- Invalid/incomplete hours or rate → no monetary preview until both numbers pass validation.
- Saved record excluded by existing search/filter → clear both and focus the saved card.
- Undo while an agreement draft is unsaved → guard discard before restoring the previous workspace.

## What Was Simplified and Why

One browser/project, manual estimates/decisions, offline export: preserves the kernel without integrations.

## Decisions and Open Issues

The actual reported uncertainty was website versus app; responsive web supports desktop and phone, installation can wait. This is advice, not a completed learner experiment. No other uncertainty is invented. Stack/design/persistence are agent prototype recommendations. Reviews, participant trial and deployment remain pending.
