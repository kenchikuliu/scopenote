import Icon from "./Icon.jsx";
import {
  changeFee,
  formatHours,
  formatMoney,
  STATUSES,
} from "../lib/domain.js";

export function EmptyState({ project, t, onCreate, onExample, onAdd }) {
  return (
    <div className={`empty-state paper-card ${project ? "" : "first-run"}`}>
      <div className="empty-illustration" aria-hidden="true">
        <div className="illustration-sheet">
          <span />
          <span />
          <span />
          <div>
            <Icon name="check" size={24} />
          </div>
        </div>
        <span className="illustration-plus">
          <Icon name="plus" size={20} />
        </span>
        <span className="illustration-leaf">
          <Icon name="leaf" size={24} />
        </span>
      </div>
      <h2>{t(project ? "noChangesTitle" : "emptyTitle")}</h2>
      <p>{t(project ? "noChangesHint" : "emptyHint")}</p>
      <div className="empty-actions">
        <button className="button primary" onClick={project ? onAdd : onCreate}>
          <Icon name="plus" size={18} />
          {t(project ? "addChange" : "createProject")}
        </button>
        {!project && (
          <button className="button secondary" onClick={onExample}>
            {t("demoButton")}
            <Icon name="arrow" size={18} />
          </button>
        )}
      </div>
      {!project && (
        <div className="example-scenario">
          <span className="scenario-label">{t("scenarioLabel")}</span>
          <div>
            <span>{t("scenarioBeforeLabel")}</span>
            <p>{t("scenarioBefore")}</p>
          </div>
          <div>
            <span>{t("scenarioRequestLabel")}</span>
            <p>{t("scenarioRequest")}</p>
          </div>
          <div className="scenario-quote">
            <span>{t("scenarioQuoteLabel")}</span>
            <p>{t("scenarioQuote")}</p>
          </div>
        </div>
      )}
      {!project && (
        <div className="mini-journey">
          {[
            ["note", "stepRequest"],
            ["clock", "stepEstimate"],
            ["document", "stepDocument"],
          ].map(([icon, label], index) => (
            <div key={label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Icon name={icon} size={18} />
              <p>{t(label)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChangeList({
  data,
  t,
  locale,
  filter,
  setFilter,
  search,
  setSearch,
  onEdit,
  onDecision,
  onDelete,
  onAdd,
  onCreate,
  onExample,
}) {
  if (!data.changes.length)
    return (
      <EmptyState
        project={data.project}
        t={t}
        onAdd={onAdd}
        onCreate={onCreate}
        onExample={onExample}
      />
    );
  const query = search.trim().toLocaleLowerCase();
  const filtered = data.changes
    .map((change, index) => ({ ...change, index }))
    .filter(
      (c) =>
        (filter === "all" || c.status === filter) &&
        `${c.title} ${c.deliverable} ${c.source}`
          .toLocaleLowerCase()
          .includes(query),
    );
  const money = (cents) => formatMoney(cents, data.project.currency, locale);
  return (
    <section className="changes-list" aria-label={t("changes")}>
      <div className="list-controls">
        <div className="filter-tabs" role="group" aria-label={t("filterLabel")}>
          {["all", ...STATUSES].map((status) => (
            <button
              key={status}
              className={filter === status ? "active" : ""}
              aria-pressed={filter === status}
              onClick={() => setFilter(status)}
            >
              {t(status)}
              <span>
                {status === "all"
                  ? data.changes.length
                  : data.changes.filter((c) => c.status === status).length}
              </span>
            </button>
          ))}
        </div>
        <div className="search-field">
          <Icon name="search" size={17} />
          <input
            aria-label={t("searchLabel")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            maxLength={120}
          />
        </div>
      </div>
      <div className="list-caption">
        <span>
          {t("deliverableLabel")} / {t("sourceLabel")}
        </span>
        <span>
          {t("estimateLabel")} · {t("quoteLabel")}
        </span>
      </div>
      {filtered.length ? (
        filtered.map((change) => (
          <article
            key={change.id}
            id={`record-${change.id}`}
            className={`change-card ${change.status}`}
            data-testid={`change-${change.id}`}
            tabIndex={-1}
          >
            <div className="change-card-top">
              <span className="change-code">
                CR-{String(change.index + 1).padStart(3, "0")}
              </span>
              <span className={`status-pill ${change.status}`}>
                <span />
                {t(change.status)}
              </span>
              <div className="card-tools">
                <button
                  className="icon-button"
                  onClick={() => onEdit(change)}
                  aria-label={`${t("edit")} · ${change.title}`}
                >
                  <Icon name="edit" size={18} />
                </button>
                <button
                  className="icon-button delete-button"
                  onClick={() => onDelete(change)}
                  aria-label={`${t("delete")} · ${change.title}`}
                >
                  <Icon name="trash" size={18} />
                </button>
              </div>
            </div>
            <div className="change-card-body">
              <div className="change-description">
                <h3>{change.title}</h3>
                <p>{change.deliverable}</p>
              </div>
              <div className="change-estimate">
                <div>
                  <strong>
                    {formatHours(change.hoursHundredths, locale)}
                    <small>{t("shortHour")}</small>
                  </strong>
                  <span>{money(change.rateCents)} / h</span>
                </div>
                <strong className="change-fee">
                  +{money(changeFee(change))}
                </strong>
              </div>
            </div>
            <div className="change-next-action">
              <button
                onClick={() => onDecision(change)}
                aria-label={`${t(change.status === "pending" ? "recordDecision" : "updateDecision")} · ${change.title}`}
              >
                <Icon name="check" size={15} />
                {t(change.status === "pending" ? "recordDecision" : "updateDecision")}
                <Icon name="arrow" size={15} />
              </button>
            </div>
            <details className="request-details">
              <summary>
                <Icon name="note" size={15} />
                {t("sourceLabel")}
                <Icon name="chevron" size={14} />
              </summary>
              <blockquote>{change.source}</blockquote>
              {change.decisionNote && (
                <div className="decision-note">
                  <span>{t("recordedDecision")}</span>
                  <p>{change.decisionNote}</p>
                </div>
              )}
            </details>
          </article>
        ))
      ) : (
        <div className="no-results paper-card">
          <Icon name="search" size={28} />
          <h3>{t("noMatches")}</h3>
          <p>{t("noMatchesHint")}</p>
          <button
            className="button secondary small"
            onClick={() => {
              setFilter("all");
              setSearch("");
            }}
          >
            {t("clearFilters")}
          </button>
        </div>
      )}
      <button className="add-another" onClick={onAdd}>
        <Icon name="plus" size={18} />
        {t("addChange")}
      </button>
    </section>
  );
}
