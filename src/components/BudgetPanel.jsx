import Icon from "./Icon.jsx";
import { formatHours, formatMoney } from "../lib/domain.js";

export default function BudgetPanel({ data, totals, t, locale, onDocument }) {
  const money = (cents) =>
    formatMoney(cents, data.project?.currency ?? "USD", locale, true);
  if (!data.project)
    return (
      <aside className="budget-panel empty-budget">
        <span className="budget-empty-icon">
          <Icon name="leaf" size={28} />
        </span>
        <h2>{t("emptyRailTitle")}</h2>
        <p>{t("emptyRailHint")}</p>
        <div className="budget-placeholder">
          <span />
          <span />
          <span />
        </div>
        <div className="quiet-note">
          <Icon name="shield" size={18} />
          <span>{t("quoteHint")}</span>
        </div>
      </aside>
    );
  const maximum = Math.max(totals.estimated, 1);
  return (
    <aside className="budget-panel" aria-label={t("budgetTitle")}>
      <div className="budget-heading">
        <h2>{t("budgetTitle")}</h2>
        <Icon name="document" size={21} />
      </div>
      <div className="pending-spotlight">
        <span className="eyebrow">{t("pendingFor")}</span>
        <strong data-testid="pending-total">{money(totals.pending.fee)}</strong>
        <p>
          <Icon name="clock" size={15} />
          <span>
            +{formatHours(totals.pending.hours, locale)} {t("hourUnit")}{" "}
            <span className="spotlight-separator">/</span>{" "}
            {totals.pending.count} {t("itemCount")}
          </span>
        </p>
      </div>
      <div className="budget-lines">
        <div>
          <span>{t("baselineLine")}</span>
          <strong>{money(totals.baseline)}</strong>
        </div>
        <div>
          <span>
            <i className="key-dot green" />
            {t("acceptedLine")}
          </span>
          <strong>+{money(totals.accepted.fee)}</strong>
        </div>
        <div>
          <span>
            <i className="key-dot amber" />
            {t("pendingLine")}
          </span>
          <strong>+{money(totals.pending.fee)}</strong>
        </div>
      </div>
      <div
        className="budget-bar"
        role="img"
        aria-label={`${t("breakdown")}: ${t("baselineLine")} ${money(totals.baseline)}, ${t("acceptedLine")} ${money(totals.accepted.fee)}, ${t("pendingLine")} ${money(totals.pending.fee)}`}
      >
        <span style={{ width: `${(totals.baseline / maximum) * 100}%` }} />
        <span style={{ width: `${(totals.accepted.fee / maximum) * 100}%` }} />
        <span style={{ width: `${(totals.pending.fee / maximum) * 100}%` }} />
      </div>
      <div className="budget-total">
        <span>{t("estimatedTotal")}</span>
        <strong data-testid="estimated-total">{money(totals.estimated)}</strong>
      </div>
      <div className="approved-total">
        <span>{t("approvedTotal")}</span>
        <strong data-testid="approved-total">{money(totals.approved)}</strong>
      </div>
      <div className="total-effort">
        <span>{t("estimatedHours")}</span>
        <strong>
          {formatHours(totals.totalHours, locale)} {t("shortHour")}
        </strong>
      </div>
      {totals.declined.count > 0 && (
        <p className="declined-summary">
          {totals.declined.count} {t("itemCount")} {t("declinedLine")}
        </p>
      )}
      <button className="button primary full-width" onClick={onDocument}>
        {t("reviewDoc")}
        <Icon name="arrow" size={18} />
      </button>
      <p className="budget-hint">{t("budgetHint")}</p>
      <div className="quiet-note">
        <Icon name="info" size={17} />
        <span>{t("approvalHint")}</span>
      </div>
    </aside>
  );
}
