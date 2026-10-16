import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";

// Actual UI recording in a fresh local test browser, with fictional data only.
// Produces raw, silent footage; the participant supplies the final narration.
const baseURL = process.env.BASE_URL ?? "http://localhost:4173";
const output = resolve("artifacts/demo");
await mkdir(`${output}/raw`, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  screen: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: { dir: `${output}/raw`, size: { width: 1440, height: 900 } },
  acceptDownloads: true,
  reducedMotion: "reduce",
});
const page = await context.newPage();
const video = page.video();
const startedAt = Date.now();
const scenes = [];
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const button = (name) => page.getByRole("button", { name, exact: true }).first();
const hold = (seconds) => new Promise((done) => setTimeout(done, seconds * 1000));
const scene = (name) => {
  const seconds = Number(((Date.now() - startedAt) / 1000).toFixed(1));
  scenes.push({ seconds, name });
  console.log(`${seconds}s: ${name}`);
};
const dismissToast = async () => {
  if (await page.locator(".toast-close").count()) await page.locator(".toast-close").click();
};
const totals = async (approved, pending, estimated) => {
  assert.equal(await page.getByTestId("approved-total").innerText(), approved);
  assert.equal(await page.getByTestId("pending-total").innerText(), pending);
  assert.equal(await page.getByTestId("estimated-total").innerText(), estimated);
};
const download = async (label, filename) => {
  const event = page.waitForEvent("download");
  await button(label).click();
  const file = await event;
  await file.saveAs(`${output}/${filename}`);
  return readFile(`${output}/${filename}`, "utf8");
};

try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  // Refresh the capture dimensions after initial navigation on Windows.
  await page.setViewportSize({ width: 1441, height: 900 });
  await page.setViewportSize({ width: 1440, height: 900 });
  await button("Switch to English").click();
  scene("Empty English workspace");
  await hold(4);
  await button("Try example").click();
  await totals("$2,000", "$2,300", "$4,300");
  await dismissToast();
  scene("Synthetic example: original, pending and estimated budgets");
  // Full-page captures resize the screencast surface; keep the recording viewport fixed.
  await page.screenshot({ path: `${output}/01-workspace-desktop.png` });
  await hold(9);
  await page.getByTestId("change-example-1").locator("summary").click();
  scene("Trace original request to deliverable, estimate and fee");
  await hold(7);
  await button("Original agreement").click();
  scene("Original agreement: fixed quote and included deliverables");
  await hold(8);
  await page.getByRole("navigation").getByRole("button", { name: /^Change log/ }).click();
  await button("Record client decision · Add a blog page").click();
  await hold(3);
  await page.getByLabel("Record client decision", { exact: true }).selectOption("accepted");
  await page.getByLabel("Decision note (optional)", { exact: true }).fill("Synthetic example: outside email approval recorded by the project owner.");
  scene("Manually record a fictional outside decision");
  await hold(6);
  await button("Save change").click();
  await totals("$3,000", "$1,300", "$4,300");
  await dismissToast();
  await page.getByTestId("change-example-1").scrollIntoViewIfNeeded();
  scene("Accepted change: approved $3,000, pending $1,300");
  await page.screenshot({ path: `${output}/02-accepted-desktop.png` });
  await hold(9);
  await page.reload({ waitUntil: "networkidle" });
  await totals("$3,000", "$1,300", "$4,300");
  scene("Reload retains the saved project");
  await hold(4);
  await button("Edit · Add a blog page").click();
  await page.getByLabel("Additional hours", { exact: true }).fill("-1");
  await button("Save change").click();
  assert.equal(await page.locator("#change-hours").getAttribute("aria-invalid"), "true");
  scene("Invalid hours are rejected without losing the edit");
  await hold(5);
  await page.getByLabel("Additional hours", { exact: true }).fill("12");
  await button("Save change").click();
  await totals("$2,000", "$2,500", "$4,500");
  scene("Changing an accepted quote returns it to pending");
  await hold(7);
  await button("Edit · Add a blog page").click();
  await page.getByLabel("Record client decision", { exact: true }).selectOption("accepted");
  await page.getByLabel("Decision note (optional)", { exact: true }).fill("Synthetic example: revised quote confirmed outside the app.");
  await button("Save change").click();
  await totals("$3,200", "$1,300", "$4,500");
  await button("View confirmation").click();
  await dismissToast();
  scene("Confirmation document preserves the same scope and totals");
  const markdown = await download("Download Markdown", "confirmation.en.md");
  assert.ok(markdown.includes("$3,200.00"));
  assert.ok(markdown.includes("$4,500.00"));
  assert.ok(markdown.includes("Synthetic example"));
  await dismissToast();
  await page.screenshot({ path: `${output}/03-confirmation-desktop.png` });
  await page.pdf({ path: `${output}/confirmation.en.pdf`, printBackground: true, preferCSSPageSize: true });
  await hold(10);
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await hold(6);
  const backup = await download("Download backup", "synthetic-backup.en.json");
  assert.equal(JSON.parse(backup).isExample, true);
  await page.getByRole("navigation").getByRole("button", { name: /^Change log/ }).click();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await dismissToast();
  scene("Portable JSON backup downloaded");
  await hold(6);
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobile = await mobileContext.newPage();
  await mobile.goto(baseURL, { waitUntil: "networkidle" });
  await mobile.getByRole("button", { name: "Switch to English", exact: true }).click();
  await mobile.locator("input[type=file]").setInputFiles(`${output}/synthetic-backup.en.json`);
  assert.equal(await mobile.getByTestId("approved-total").innerText(), "$3,200");
  assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  if (await mobile.locator(".toast-close").count()) await mobile.locator(".toast-close").click();
  await mobile.screenshot({ path: `${output}/04-workspace-mobile.png`, fullPage: true });
  await mobileContext.close();
  scene("Return to the completed workspace");
  await hold(8);
  assert.deepEqual(errors, []);
  await writeFile(`${output}/recording.json`, JSON.stringify({
    recordedAt: new Date().toISOString(), baseURL, browser: await browser.version(),
    viewport: { width: 1440, height: 900 }, scenes,
    recordedSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(1)),
    audio: false, syntheticData: true, participantNarrationPending: true, pageErrors: errors,
  }, null, 2));
} finally {
  await context.close();
  await browser.close();
}
await rename(await video.path(), `${output}/demo-silent.webm`);
console.log(`Saved silent UI recording and supporting files to ${output}`);
