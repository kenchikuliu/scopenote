import test from "node:test";
import assert from "node:assert/strict";
import {
  syntheticExample,
  validateWorkspace,
  MAX_BACKUP_BYTES,
} from "../src/lib/domain.js";
import { createMarkdown, safeFilename } from "../src/lib/export.js";

test("export preserves pending vs recorded approval and excludes declined estimates", () => {
  const data = syntheticExample("en");
  data.changes[0].status = "accepted";
  data.changes[1].status = "declined";
  const markdown = createMarkdown(data, "en");
  assert.ok(
    markdown.includes("| **Recorded approved budget** | **$3,000.00** |"),
  );
  assert.ok(
    markdown.includes("| **Estimated total budget** | **$3,500.00** |"),
  );
  assert.ok(markdown.includes("Status: **Pending**"));
  assert.ok(markdown.includes("Synthetic example data"));
  assert.ok(markdown.includes(data.changes[2].source));
});

test("Markdown escapes user HTML/formatting and filenames remove unsafe characters", () => {
  const data = syntheticExample();
  data.project.title = "<script>alert(1)</script> | **title**";
  const markdown = createMarkdown(data);
  assert.ok(!markdown.includes("<script>"));
  assert.ok(markdown.includes("\\<script\\>"));
  assert.equal(safeFilename("a/b:c*?"), "a-b-c--");
});

test("largest supported multilingual backup remains within the restore size limit", () => {
  const data = syntheticExample();
  const template = data.changes[0];
  data.changes = Array.from({ length: 100 }, (_, index) => ({
    ...template,
    id: `max-${index}`,
    title: "项".repeat(120),
    source: "原".repeat(3000),
    deliverable: "交".repeat(3000),
    decisionNote: "确".repeat(2000),
  }));
  assert.equal(validateWorkspace(data).ok, true);
  assert.ok(
    Buffer.byteLength(JSON.stringify(data, null, 2), "utf8") < MAX_BACKUP_BYTES,
  );
});
