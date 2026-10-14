import Icon from "./Icon.jsx";
import { changeFee, formatHours, formatMoney } from "../lib/domain.js";

export default function ConfirmationDocument({
  data,
  totals,
  t,
  locale,
  onDownload,
  onPrint,
  onCreate,
  onExample,
}) {
  if (!data.project)
    return (
      <div className="paper-card document-empty">
        <span className="section-icon">
          <Icon name="document" size={25} />
        </span>
        <h2>{t("documentEmpty")}</h2>
        <p>{t("documentEmptyHint")}</p>
        <div className="empty-actions">
          <button className="button primary" onClick={onCreate}>
            {t("createProject")}
            <Icon name="plus" size={17} />
          </button>
          <button className="button secondary" onClick={onExample}>
            {t("demoButton")}
          </button>
        </div>
      </div>
    );
  const p = data.project;
  const money = (value) => formatMoney(value, p.currency, locale);
  const hours = (value) => `${formatHours(value, locale)} ${t("shortHour")}`;
  return (
    <div className="document-view">
      <div className="document-toolbar">
        <p>
          <Icon name="info" size={16} />
          {t("downloadHint")}
        </p>
        <div>
          <button className="button secondary" onClick={onDownload}>
            <Icon name="download" size={18} />
            {t("downloadMd")}
          </button>
          <button className="button primary" onClick={onPrint}>
            <Icon name="print" size={18} />
            {t("print")}
          </button>
        </div>
      </div>
      <article id="print-document" className="confirmation-document">
        <header className="document-header">
          <div className="document-brand">
            <Icon name="note" size={25} />
            <span>ScopeNote</span>
          </div>
          <span className="document-kind">{t("documentTitle")}</span>
        </header>
        <div className="document-intro">
          <span className="eyebrow">{t("documentTitle")}</span>
          <h2>{p.title}</h2>
          <p>
            {t("preparedFor")} <span>/</span> {p.client}
          </p>
          {data.isExample && (
            <div className="document-example">
              <Icon name="info" size={15} />
              {t("exampleFootnote")}
            </div>
          )}
        </div>
        <section className="document-section">
          <h3>
            <span>01</span>
            {t("originalAgreementTitle")}
          </h3>
          <p className="document-scope preserve-lines">{p.scope}</p>
          <dl className="document-baseline">
            <div>
              <dt>{t("originalBudget")}</dt>
              <dd>
                {money(p.budgetCents)} <small>{p.currency}</small>
              </dd>
            </div>
            <div>
              <dt>{t("originalHours")}</dt>
              <dd>{hours(p.hoursHundredths)}</dd>
            </div>
            <div>
              <dt>{t("defaultRateField")}</dt>
              <dd>{money(p.rateCents)} / h</dd>
            </div>
          </dl>
        </section>
        <section className="document-section">
          <h3>
            <span>02</span>
            {t("changeScheduleTitle")}
          </h3>
          {data.changes.length ? (
            data.changes.map((c, index) => (
              <section className="document-change" key={c.id}>
                <div className="document-change-heading">
                  <span className="change-code">
                    CR-{String(index + 1).padStart(3, "0")}
                  </span>
                  <span className={`status-pill ${c.status}`}>
                    <span />
                    {t(c.status)}
                  </span>
                  <strong>{money(changeFee(c))}</strong>
                </div>
                <h4>{c.title}</h4>
                <p className="preserve-lines">{c.deliverable}</p>
                <div className="document-estimate">
                  <span>
                    {t("estimateLabel")} · {hours(c.hoursHundredths)}
                  </span>
                  <span>
                    {t("rateField")} · {money(c.rateCents)} / h
                  </span>
                </div>
                <div className="document-source">
                  <span>{t("sourceLabel")}</span>
                  <blockquote className="preserve-lines">{c.source}</blockquote>
                </div>
                {c.decisionNote && (
                  <div className="document-decision">
                    <span>{t("recordedDecision")}</span>
                    <p className="preserve-lines">{c.decisionNote}</p>
                  </div>
                )}
              </section>
            ))
          ) : (
            <p className="document-scope">{t("noDocumentChanges")}</p>
          )}
        </section>
        <section className="document-section document-summary">
          <h3>
            <span>03</span>
            {t("budgetTitle")}
          </h3>
          <dl>
            <div>
              <dt>{t("baselineLine")}</dt>
              <dd>{money(totals.baseline)}</dd>
            </div>
            <div>
              <dt>{t("acceptedLine")}</dt>
              <dd>+{money(totals.accepted.fee)}</dd>
            </div>
            <div>
              <dt>{t("pendingLine")}</dt>
              <dd>+{money(totals.pending.fee)}</dd>
            </div>
            <div className="document-approved">
              <dt>{t("approvedTotal")}</dt>
              <dd>{money(totals.approved)}</dd>
            </div>
            <div className="document-estimated">
              <dt>{t("estimatedTotal")}</dt>
              <dd>{money(totals.estimated)}</dd>
            </div>
            <div>
              <dt>{t("estimatedHours")}</dt>
              <dd>{hours(totals.totalHours)}</dd>
            </div>
            {totals.declined.count > 0 && (
              <div className="document-declined">
                <dt>{t("declinedLine")}</dt>
                <dd>{money(totals.declined.fee)}</dd>
              </div>
            )}
          </dl>
          <p className="document-currency">{p.currency}</p>
        </section>
        <footer className="document-footer">
          <Icon name="info" size={17} />
          <p>{t("documentFootnote")}</p>
        </footer>
      </article>
    </div>
  );
}
