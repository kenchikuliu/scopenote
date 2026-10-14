---
doc: prd
status: draft
---

# ScopeNote — Product Requirements

A responsive change workspace for freelance web projects. Working label/design are prototype proposals. Source: `scope.md > The Unique Kernel` and `scope.md > The POC Boundary`.

## The Core Journey

1. Open an empty workspace; create the baseline or explicitly load the synthetic example.
2. Record project/client, original deliverables, fixed fee, planned hours, default additional-work rate and currency (USD/CNY).
3. Add a change with title, deliverable, original request, hours and rate; it starts pending.
4. Inspect pending/accepted/declined items and distinguish estimated from recorded approved totals.
5. Preview and download Markdown or print/save as PDF.
6. Record outside decisions manually, with optional evidence notes. Reload preserves work; backup/restore enables transfer.

## Screens and Layout

One workspace with Changes, Original agreement and Confirmation document views. Desktop: navigation rail, records and budget panel; mobile: compact navigation and stacked content. Accessible dialogs for change/replace/delete forms. No inactive navigation or invented client activity.

## Look and Feel

Agent proposal: warm off-white canvas, forest green navigation, white paper cards, amber pending indicators, restrained corners, system sans-serif and tabular numbers. Chinese first, English interface/export option. No independent participant visual preference has yet been supplied.

## Features and Behavior

### Original Agreement

Edit project/client, original deliverables, currency, fixed budget, planned hours and default rate. Required/invalid fields show errors. Fixed budget is independent of hours × rate. Changing the default rate does not reprice existing changes. Currency cannot change with existing records; no exchange conversion is provided.

Acceptance: $2,000 / 20h / $100/h saves; change creation becomes available; reload restores it.

### Traceable Change Records

Add/edit/delete title, deliverable, request source, estimate and decision note. States have text labels. Store a rate snapshot per item. Accepted is a manually recorded outside decision, not a client action or signature. Editing accepted content/pricing returns it to pending and clears old evidence. Editing only the decision note preserves acceptance. Filters affect the list, never totals.

Acceptance: 10h × $100/h = $1,000; source is inspectable; invalid input cannot save; edited accepted quote needs reconfirmation.

### Budget Summary

Round each change to cents. Pending = pending fees. Recorded approved budget = baseline + accepted. Estimated total = baseline + accepted + pending. Declined items are excluded from both totals. Separate work estimates from money.

Acceptance: 10+8+5h = 23h / $2,300 pending; estimated $4,300 vs approved $2,000. Accepting 10h yields $1,300 pending and $3,000 approved. Declining 8h yields $500 pending and $3,500 estimated.

### Confirmation Document

Readable preview with baseline, requests/deliverables/estimates/rates/states/evidence and labeled totals. UTF-8 Markdown and print/PDF. Label synthetic data and manually recorded decisions. Pending remains pending in exports.

Acceptance: exports match the screen; Chinese/English work; print hides navigation and preserves long source text.

### Local Save and Backup

Store in the current site's browser storage with saved/failed status. Versioned JSON restore validates size, schema, unique IDs, amounts, currency and states before replacement. Confirm replacement; offer undo. Invalid storage/import must not silently wipe valid work.

Acceptance: reload persists; backup restores; invalid import preserves current data; blocked storage shows a warning and permits export.

### Synthetic Example

Explicit load, labeled in workspace and exports. Fictional names/prose; numerical scenario inspired by public Reddit account. Confirm replacing existing data and allow undo. Empty first visit does not silently inject a real-looking project.

## States and Boundaries

- Empty: Create project and Try example; exports/additions wait for baseline.
- Invalid: inline errors, focus failed field; retain typed input.
- No matches: clear-filter action; summaries still cover the whole project.
- Storage unavailable/corrupt: persistent recovery feedback; do not overwrite unreadable data until explicit replacement.
- Delete/replace: confirm and undo.
- Unsaved form: show unsaved feedback and browser-departure guard where applicable.

## Product Decisions

Participant: website/app for hackathon; Reddit discovery; continue recommended direction. Agent recommendations: label, layout, design, local single-project boundary and detailed behaviors. These are not separately reviewed.

## What We're Building

The complete journey above, technical README and planning artifacts. Implementation is authorized by continuation; formal review remains draft.

## Deferred From the POC

Hosted sharing, automatic extraction, multiple projects and native packaging depend on later feedback.

## Non-Goals

Legal judgments, payments, client authentication/online acceptance, conversion, cloud sync and generated estimates.

## Open Questions

Participant feedback, final name, freelancer trial and optional deployment. None block a reversible local prototype; publication and submission are separate actions.
