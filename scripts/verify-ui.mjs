import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";

// Uses isolated contexts; never connects to an existing browser or customer profile.
const baseURL = process.env.BASE_URL ?? "http://localhost:5173";
const output = "artifacts";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
  headless: true,
});
const errors = [];
const checks = [];
const storageKey = "scopenote.workspace.v1";
const context = await browser.newContext({
  viewport: { width: 1440, height: 1050 },
  acceptDownloads: true,
});
const page = await context.newPage();
page.on("pageerror", (error) => errors.push(error.message));
const button = (name) =>
  page.getByRole("button", { name, exact: true }).first();
const current = () =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
const sum = async (id, expected) =>
  assert.equal(await page.getByTestId(id).innerText(), expected);
const closeToast = async () => {
  if (await page.locator(".toast-close").count())
    await page.locator(".toast-close").click();
};
const download = async (name, filename) => {
  const event = page.waitForEvent("download");
  await button(name).click();
  const result = await event;
  await result.saveAs(`${output}/${filename}`);
  return readFile(`${output}/${filename}`, "utf8");
};

try {
  await page.goto(baseURL);
  await page
    .getByRole("heading", { name: "追加需求，从这里开始说清楚" })
    .waitFor();
  await page.screenshot({
    path: `${output}/empty-desktop.png`,
    fullPage: true,
  });
  await button("试用示例").click();
  await sum("pending-total", "$2,300");
  await sum("approved-total", "$2,000");
  await sum("estimated-total", "$4,300");
  await closeToast();
  await page.screenshot({
    path: `${output}/example-desktop.png`,
    fullPage: true,
  });
  checks.push(
    "Empty first visit and explicitly labeled synthetic example with separate pending/approved totals",
  );

  await button("编辑 · 增加博客页面").click();
  await page
    .getByLabel("记录客户决定", { exact: true })
    .selectOption("accepted");
  await page
    .getByLabel("确认备注（选填）", { exact: true })
    .fill("合成示例：邮件确认");
  await button("保存变更").click();
  await sum("approved-total", "$3,000");
  await sum("pending-total", "$1,300");
  await page.reload();
  await sum("approved-total", "$3,000");
  assert.equal((await current()).changes[0].decisionNote, "合成示例：邮件确认");
  await button("编辑 · 增加博客页面").click();
  await page.getByLabel("追加工时", { exact: true }).fill("12");
  await button("保存变更").click();
  await sum("approved-total", "$2,000");
  await sum("pending-total", "$2,500");
  assert.equal((await current()).changes[0].decisionNote, "");
  checks.push(
    "Outside decision recording, reload persistence and accepted-edit reconfirmation",
  );

  await button("试用示例").click();
  await button("取消").click();
  await sum("pending-total", "$2,500");
  await button("试用示例").click();
  await button("替换项目").click();
  await page.getByRole("button", { name: "已放弃 0", exact: true }).click();
  await page.getByRole("heading", { name: "没有匹配的变更" }).waitFor();
  await sum("pending-total", "$2,300");
  await button("清除筛选").click();
  await page.getByLabel("搜索变更").fill("不会匹配的搜索");
  await page.getByRole("heading", { name: "没有匹配的变更" }).waitFor();
  await sum("estimated-total", "$4,300");
  await button("清除筛选").click();
  await page.getByTestId("change-example-1").locator("summary").click();
  await page
    .getByText("“我们还想要一个博客，可以顺便加上文章详情吗？”", {
      exact: true,
    })
    .waitFor();
  checks.push(
    "Replacement cancellation, original request expansion and filters that preserve financial totals",
  );

  await button("原始约定").click();
  assert.equal(await page.getByLabel("报价货币").isDisabled(), true);
  await page.getByLabel("新增工作默认费率").fill("150");
  await button("保存约定").click();
  await sum("pending-total", "$2,300");
  await button("新增变更").click();
  assert.equal(
    await page.getByLabel("每小时费率", { exact: true }).inputValue(),
    "150",
  );
  await page.getByLabel("变更标题").fill("测试追加页面");
  await page.getByLabel("交付内容", { exact: true }).fill("联系表单页面");
  await page
    .getByLabel("需求原文", { exact: true })
    .fill("请再加一个联系页面。");
  await page.getByLabel("追加工时").fill("-1");
  await button("保存变更").click();
  assert.equal(
    await page.locator("#change-hours").getAttribute("aria-invalid"),
    "true",
  );
  await page.getByLabel("追加工时").fill("2.25");
  await page.keyboard.press("Escape");
  await page
    .getByText("这些修改还没有保存。要放弃并关闭吗？", { exact: true })
    .waitFor();
  await button("继续编辑").click();
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => !!document.activeElement?.closest("dialog")),
    true,
  );
  await button("保存变更").click();
  await sum("pending-total", "$2,637.50");
  await sum("estimated-total", "$4,637.50");
  const backupRaw = await download("下载备份", "verified-backup.json");
  const backup = JSON.parse(backupRaw);
  assert.equal(backup.changes[0].rateCents, 10000);
  assert.equal(backup.changes[3].rateCents, 15000);
  checks.push(
    "Baseline rate snapshots, locked currency, invalid estimate recovery, dialog focus and dirty-edit protection",
  );

  await button("查看确认单").click();
  const markdown = await download("下载 Markdown", "confirmation.zh.md");
  assert.ok(markdown.includes("| **已记录确认预算** | **$2,000.00** |"));
  assert.ok(markdown.includes("| **预估总预算** | **$4,637.50** |"));
  assert.ok(markdown.includes("状态: **待确认**"));
  assert.ok(markdown.includes("请再加一个联系页面。"));
  await page.evaluate(() => {
    window.print = () => {
      window.__printCalled = true;
    };
  });
  await button("打印 / 保存 PDF").click();
  assert.equal(await page.evaluate(() => window.__printCalled), true);
  await closeToast();
  await page.screenshot({
    path: `${output}/confirmation-desktop.png`,
    fullPage: true,
  });
  await page.pdf({
    path: `${output}/confirmation.pdf`,
    printBackground: true,
    preferCSSPageSize: true,
  });
  await button("Switch to English").click();
  const english = await download("Download Markdown", "confirmation.en.md");
  assert.ok(english.includes("Recorded approved budget"));
  assert.ok(english.includes("Synthetic example data"));
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  checks.push(
    "Chinese/English Markdown figures and source text, wired print action and actual print PDF generation",
  );

  await button("New project").click();
  await button("Start new project").click();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(backupRaw),
    });
  await sum("pending-total", "$2,637.50");
  const before = await current();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from("{broken"),
    });
  await page
    .getByText(
      "Invalid backup or unsupported version. Your current project was not replaced.",
      { exact: true },
    )
    .waitFor();
  assert.deepEqual(await current(), before);
  const duplicate = structuredClone(backup);
  duplicate.changes[1].id = duplicate.changes[0].id;
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "duplicate.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(duplicate)),
    });
  assert.deepEqual(await current(), before);
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "oversized.json",
      mimeType: "application/json",
      buffer: Buffer.alloc(5 * 1024 * 1024 + 1, 32),
    });
  await page
    .getByText(
      "Backups must be 5 MB or smaller. Your current project was not replaced.",
      { exact: true },
    )
    .waitFor();
  assert.deepEqual(await current(), before);
  await button("Delete · 测试追加页面").click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await sum("pending-total", "$2,300");
  await button("Undo").click();
  await sum("pending-total", "$2,637.50");
  checks.push(
    "Exact backup restore; malformed, duplicate-ID and oversized import preservation; delete/undo",
  );

  await button("Try example").click();
  await button("Replace project").click();
  await page
    .getByRole("button", {
      name: "Edit · Refresh the color palette",
      exact: true,
    })
    .click();
  await page.getByLabel("Record client decision").selectOption("declined");
  await button("Save change").click();
  await sum("pending-total", "$1,500");
  await sum("estimated-total", "$3,500");
  await button("Try example").click();
  await button("Replace project").click();
  await closeToast();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `overflow at ${width}`,
    );
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `${output}/example-${width}-en.png`,
        fullPage: true,
      });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await button("Add change").click();
  await page.getByLabel("Change title").fill("Mobile request");
  await page.getByLabel("Deliverable", { exact: true }).fill("A mobile layout");
  await page
    .getByLabel("Original request", { exact: true })
    .fill("Please make a mobile version.");
  await page.getByLabel("Additional hours").fill("1.25");
  await page.getByLabel("Hourly rate", { exact: true }).fill("99.99");
  await page.screenshot({
    path: `${output}/mobile-dialog.png`,
    fullPage: true,
  });
  await button("Save change").click();
  await sum("pending-total", "$2,424.99");
  assert.equal(
    await page
      .locator(".skip-link")
      .evaluate((e) => getComputedStyle(e).transform !== "none"),
    true,
  );
  await page.reload();
  await sum("pending-total", "$2,424.99");
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  checks.push(
    "Declined exclusions, five responsive widths, mobile form, cent rounding, focus and locale persistence",
  );

  const failedContext = await browser.newContext();
  await failedContext.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Blocked", "QuotaExceededError");
    };
  });
  const failedPage = await failedContext.newPage();
  failedPage.on("pageerror", (error) => errors.push(error.message));
  await failedPage.goto(baseURL);
  await failedPage
    .getByRole("button", { name: "试用示例", exact: true })
    .first()
    .click();
  await failedPage
    .getByText("浏览器暂时无法保存。当前操作仍可继续，请下载备份保留数据。", {
      exact: true,
    })
    .waitFor();
  assert.equal(
    await failedPage.getByTestId("pending-total").innerText(),
    "$2,300",
  );
  const failureDownload = failedPage.waitForEvent("download");
  await failedPage
    .getByRole("button", { name: "下载备份", exact: true })
    .first()
    .click();
  assert.ok((await failureDownload).suggestedFilename().endsWith(".json"));
  await failedContext.close();

  const corruptContext = await browser.newContext();
  await corruptContext.addInitScript(() => {
    if (!localStorage.getItem("qa.corrupt-seeded")) {
      localStorage.setItem("scopenote.workspace.v1", "{broken-original");
      localStorage.setItem("qa.corrupt-seeded", "1");
    }
  });
  const corruptPage = await corruptContext.newPage();
  corruptPage.on("pageerror", (error) => errors.push(error.message));
  await corruptPage.goto(baseURL);
  await corruptPage
    .getByText(
      "本机保存的数据无法读取。原始内容仍被保留；请导出原始数据或导入有效备份。",
      { exact: true },
    )
    .waitFor();
  assert.equal(
    await corruptPage.evaluate((key) => localStorage.getItem(key), storageKey),
    "{broken-original",
  );
  const rawDownloadEvent = corruptPage.waitForEvent("download");
  await corruptPage
    .getByRole("button", { name: "导出原始数据", exact: true })
    .click();
  const rawDownload = await rawDownloadEvent;
  assert.equal(
    await readFile(await rawDownload.path(), "utf8"),
    "{broken-original",
  );
  await corruptPage
    .getByRole("button", { name: "试用示例", exact: true })
    .first()
    .click();
  await corruptPage.getByRole("button", { name: "取消", exact: true }).click();
  assert.equal(
    await corruptPage.evaluate((key) => localStorage.getItem(key), storageKey),
    "{broken-original",
  );
  await corruptPage
    .getByRole("button", { name: "试用示例", exact: true })
    .first()
    .click();
  await corruptPage
    .getByRole("button", { name: "替换项目", exact: true })
    .click();
  await corruptPage.reload();
  assert.equal(
    await corruptPage.getByTestId("pending-total").innerText(),
    "$2,300",
  );
  await corruptContext.close();
  checks.push(
    "Blocked storage keeps session work/export usable; corrupt raw data retained/downloadable until explicit replacement",
  );

  assert.deepEqual(errors, []);
  await writeFile(
    `${output}/ui-verification.json`,
    JSON.stringify(
      {
        baseURL,
        checkedAt: new Date().toISOString(),
        browser: await browser.version(),
        checks,
        pageErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log(
    `PASS: ${checks.length} integrated browser checks; zero page errors. Screenshots, backup, Markdown and print PDF saved in artifacts/.`,
  );
} finally {
  await browser.close();
}
