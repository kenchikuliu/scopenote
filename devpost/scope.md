---
doc: scope
status: draft
---

# Client change confirmation website — Scope

Working label: **ScopeNote**. This is a prototype label, not the participant's final submission title.

## Decision Basis

The participant wants a website or app for Build With AI: Basics, requested Reddit problem research, and then said “继续” (continue) after the client-change tool was recommended. That authorizes a concrete prototype in this direction. Detailed choices below are agent recommendations for review; implementation is not evidence of sign-off. Formal review and hands-on checkpoints remain pending. The earlier experiment-comparison draft is preserved outside the application in `../scope-experiment-archive.md`.

## The Unique Kernel

Turn an additional client request into a traceable change record: original request → deliverable → estimated hours and fee → recorded decision → exportable confirmation document. Pending quotes remain separate from accepted changes, so an estimate never silently becomes an approved budget.

## Who It's For

A freelance website designer or developer handling additions to a fixed-price project. Public Reddit accounts describe extra pages and revisions increasing work after the original quote. This is evidence of a problem, not measured demand or a payment commitment.

Sources: [23 hours of unpaid additions](https://www.reddit.com/r/freelance/comments/1ozc3zq/lost_2300_to_scope_creep_on_one_project_how_do/), [repeated changes](https://www.reddit.com/r/freelance/comments/1to9m9h/nightmare_client_from_hell_please_help/). Broader research is in `../reddit-problems.md`, outside the app repository.

## The Core Loop

Record the original agreement, add a request and editable estimate, review proposed extra cost, export a confirmation document, and manually record the client's decision when received outside the app. Repeat for another addition.

## Inspiration & Identity

Agent proposal: a calm document workspace, warm white paper, forest green accents, clear tabular numbers, and a client-facing document preview. Chinese default; English switch supports demonstration. No third-party design or source code is copied.

## Why This Matters to the Learner

The stated goal is “做成一个网站或者一个app” for the hackathon. Personal freelance experience has not been reported.

## What "Working" Looks Like

Load a labeled synthetic example: $2,000 / 20h agreement with $100/h additions of 10h, 8h, and 5h. Observe 23h / $2,300 pending and $4,300 estimated, while the recorded approved total stays $2,000. Record one decision, verify totals, and export a matching document. New projects, editing, reload, and backup restore also work.

## The POC Boundary

One responsive website, one locally saved project, editable baseline, source-backed change records, per-change rate snapshots, three decision states, correct summaries, Markdown/print export, validated JSON backup/restore, synthetic example, and empty/error states.

## Later

Validate usefulness with freelancers; consider hosted sharing or message extraction based on feedback.

## Explicitly Cut

- Accounts, shared databases, and multiple active projects: first prove one complete workflow.
- Email, payments, electronic signatures: a downloaded document proves the output.
- Automatic legal advice, client approval and estimates: users supply estimates and record outside decisions.
- Native packaging and LLM API calls: a responsive deterministic prototype demonstrates the idea; in-app AI is not required by this competition.
