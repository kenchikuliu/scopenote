import test from "node:test";
import assert from "node:assert/strict";
import {
  parseHundredths,
  changeFee,
  calculateTotals,
  syntheticExample,
  applyChangeEdit,
  validateWorkspace,
  validateProjectForm,
} from "../src/lib/domain.js";

test("decimal parsing rejects exponent, negative, extra decimals and unsafe values", () => {
  assert.equal(parseHundredths("0.29"), 29);
  assert.equal(parseHundredths(".5"), 50);
  for (const value of ["-1", "1e3", "1.001", "", "NaN", "9007199254740991"])
    assert.equal(parseHundredths(value), null);
});

test("fees round each estimate to cents", () => {
  assert.equal(changeFee({ hoursHundredths: 125, rateCents: 9999 }), 12499);
  assert.equal(changeFee({ hoursHundredths: 1, rateCents: 150 }), 2);
});

test("pending, approved and declined amounts remain distinct", () => {
  const data = syntheticExample();
  let t = calculateTotals(data);
  assert.deepEqual(
    [t.pending.hours, t.pending.fee, t.approved, t.estimated],
    [2300, 230000, 200000, 430000],
  );
  data.changes[0].status = "accepted";
  t = calculateTotals(data);
  assert.deepEqual(
    [t.pending.fee, t.approved, t.estimated],
    [130000, 300000, 430000],
  );
  data.changes[1].status = "declined";
  t = calculateTotals(data);
  assert.deepEqual(
    [t.pending.fee, t.approved, t.estimated, t.totalHours],
    [50000, 300000, 350000, 3500],
  );
});

test("baseline rate edits do not reprice old quotes", () => {
  const data = syntheticExample();
  data.project.rateCents = 15000;
  assert.equal(calculateTotals(data).pending.fee, 230000);
});

test("editing an accepted quote requires reconfirmation; note-only edit does not", () => {
  const old = {
    ...syntheticExample().changes[0],
    status: "accepted",
    decisionNote: "Email confirmed",
  };
  const edited = applyChangeEdit(old, { ...old, hoursHundredths: 1200 });
  assert.equal(edited.reconfirmation, true);
  assert.equal(edited.change.status, "pending");
  assert.equal(edited.change.decisionNote, "");
  assert.equal(
    applyChangeEdit(old, { ...old, hoursHundredths: 1200, status: "pending" })
      .change.decisionNote,
    "",
  );
  const note = applyChangeEdit(old, {
    ...old,
    decisionNote: "Email confirmed 10/14",
  });
  assert.equal(note.reconfirmation, false);
  assert.equal(note.change.status, "accepted");
});

test("backup validation rejects invalid states, duplicate IDs, oversized/unsafe data", () => {
  assert.equal(validateWorkspace(syntheticExample()).ok, true);
  for (const mutate of [
    (d) => (d.changes[0].status = "paid"),
    (d) => (d.changes[1].id = d.changes[0].id),
    (d) => (d.project.rateCents = 0),
    (d) => (d.changes[0].hoursHundredths = Infinity),
    (d) => (d.changes[0].source = "x".repeat(3001)),
    (d) => (d.changes[0].updatedAt = "2026-02-30T00:00:00.000Z"),
    (d) => (d.version = 2),
  ]) {
    const data = syntheticExample();
    mutate(data);
    assert.equal(validateWorkspace(data).ok, false);
  }
});

test("currency cannot change once quote records exist; zero baseline is allowed", () => {
  const p = syntheticExample().project;
  const form = {
    title: p.title,
    client: p.client,
    scope: p.scope,
    currency: "CNY",
    budget: "0",
    hours: "20",
    rate: "100",
  };
  assert.equal(
    validateProjectForm(form, p, true).errors.currency,
    "currencyLocked",
  );
  const result = validateProjectForm(form, p, false);
  assert.deepEqual(result.errors, {});
  assert.equal(result.project.budgetCents, 0);
});
