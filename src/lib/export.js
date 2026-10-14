import {
  calculateTotals,
  changeFee,
  formatHours,
  formatMoney,
} from "./domain.js";
import { translate } from "./i18n.js";

const escapeMarkdown = (value) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/([`*_\[\]{}<>#|!])/g, "\\$1");
export const safeFilename = (title) =>
  title
    .replace(/[\x00-\x1F<>:"/\\|?*]/g, "-")
    .slice(0, 70)
    .trim() || "project";

export function createMarkdown(data, locale = "zh") {
  if (!data.project) return "";
  const t = translate(locale);
  const p = data.project;
  const totals = calculateTotals(data);
  const money = (value) => formatMoney(value, p.currency, locale);
  const hours = (value) => `${formatHours(value, locale)} ${t("shortHour")}`;
  const text = escapeMarkdown;
  const lines = [
    `# ${t("documentTitle")}`,
    "",
    `## ${text(p.title)}`,
    "",
    `${t("preparedFor")}: ${text(p.client)}`,
    "",
    ...(data.isExample ? [`> ${t("exampleFootnote")}`, ""] : []),
    `## ${t("originalAgreementTitle")}`,
    "",
    text(p.scope),
    "",
    `- ${t("originalBudget")}: ${money(p.budgetCents)} (${p.currency})`,
    `- ${t("originalHours")}: ${hours(p.hoursHundredths)}`,
    `- ${t("defaultRateField")}: ${money(p.rateCents)} ${t("perHour")}`,
    "",
    `## ${t("changeScheduleTitle")}`,
    "",
  ];
  if (!data.changes.length) lines.push(t("noDocumentChanges"), "");
  data.changes.forEach((change, index) => {
    lines.push(
      `### CR-${String(index + 1).padStart(3, "0")} · ${text(change.title)}`,
      "",
      `- ${t("statusField")}: **${t(change.status)}**`,
      `- ${t("deliverableLabel")}: ${text(change.deliverable)}`,
      `- ${t("estimateLabel")}: ${hours(change.hoursHundredths)}`,
      `- ${t("rateField")}: ${money(change.rateCents)} ${t("perHour")}`,
      `- ${t("quoteLabel")}: ${money(changeFee(change))}`,
      "",
      `${t("sourceLabel")}:`,
      "",
      ...text(change.source)
        .split("\n")
        .map((line) => `> ${line}`),
      "",
    );
    if (change.decisionNote)
      lines.push(`${t("recordedDecision")}: ${text(change.decisionNote)}`, "");
  });
  lines.push(
    `## ${t("budgetTitle")}`,
    "",
    `| ${t("breakdown")} | ${p.currency} |`,
    "| --- | ---: |",
    `| ${t("baselineLine")} | ${money(totals.baseline)} |`,
    `| ${t("acceptedLine")} | ${money(totals.accepted.fee)} |`,
    `| ${t("pendingLine")} | ${money(totals.pending.fee)} |`,
    `| **${t("approvedTotal")}** | **${money(totals.approved)}** |`,
    `| **${t("estimatedTotal")}** | **${money(totals.estimated)}** |`,
    "",
    `- ${t("pendingExtra")}: ${hours(totals.pending.hours)} / ${totals.pending.count} ${t("itemCount")}`,
    `- ${t("estimatedHours")}: ${hours(totals.totalHours)}`,
    `- ${t("declinedLine")}: ${money(totals.declined.fee)} / ${hours(totals.declined.hours)}`,
    "",
    t("documentFootnote"),
    "",
  );
  return lines.join("\n");
}

export function downloadText(
  content,
  filename,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
