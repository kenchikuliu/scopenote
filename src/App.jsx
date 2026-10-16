import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./components/Icon.jsx";
import AgreementForm from "./components/AgreementForm.jsx";
import ChangeDialog from "./components/ChangeDialog.jsx";
import ChangeList from "./components/ChangeList.jsx";
import BudgetPanel from "./components/BudgetPanel.jsx";
import ConfirmationDocument from "./components/ConfirmationDocument.jsx";
import {
  applyChangeEdit,
  calculateTotals,
  emptyWorkspace,
  formatHours,
  formatMoney,
  MAX_CHANGES,
  MAX_BACKUP_BYTES,
  syntheticExample,
  validateWorkspace,
} from "./lib/domain.js";
import { translate } from "./lib/i18n.js";
import {
  loadLocale,
  loadWorkspace,
  saveLocale,
  saveWorkspace,
} from "./lib/storage.js";
import { createMarkdown, downloadText, safeFilename } from "./lib/export.js";

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  danger,
  t,
  onConfirm,
  onClose,
}) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className={`confirm-symbol ${danger ? "danger-symbol" : ""}`}>
        <Icon name={danger ? "trash" : "info"} size={25} />
      </div>
      <h2 id="confirm-title">{title}</h2>
      <p>{body}</p>
      <div className="confirm-actions">
        <button className="button secondary" onClick={onClose} autoFocus>
          {t("cancel")}
        </button>
        <button
          className={`button ${danger ? "danger" : "primary"}`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

export default function App() {
  const [initial] = useState(loadWorkspace);
  const [data, setData] = useState(initial.data);
  const [locale, setLocale] = useState(loadLocale);
  const [protectStored, setProtectStored] = useState(
    initial.issue === "corruptStorage",
  );
  const [storageIssue, setStorageIssue] = useState(initial.issue);
  const [saveState, setSaveState] = useState(
    initial.issue ? "saveError" : "saved",
  );
  const importInput = useRef(null);
  const [tab, setTab] = useState("changes");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [focusDecision, setFocusDecision] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [dirty, setDirty] = useState(false);
  const onDirty = useCallback((value) => setDirty(value), []);
  const t = translate(locale);
  const totals = calculateTotals(data);
  const money = (cents) =>
    formatMoney(cents, data.project?.currency ?? "USD", locale, true);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.title = `ScopeNote · ${t("pageTitle")}`;
    saveLocale(locale);
  }, [locale]);
  useEffect(() => {
    if (protectStored) {
      setSaveState("saveError");
      return;
    }
    const saved = saveWorkspace(data);
    setSaveState(saved ? "saved" : "saveError");
    setStorageIssue(saved ? null : "saveFailure");
  }, [data, protectStored]);
  useEffect(() => {
    const beforeUnload = (event) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  function guard(action) {
    if (!dirty) {
      action();
      return;
    }
    setConfirm({
      title: "unsaved",
      body: "discardHint",
      label: "discard",
      danger: true,
      action: () => {
        setDirty(false);
        action();
      },
    });
  }
  function navigate(next) {
    if (next !== tab) guard(() => setTab(next));
  }
  function replace(next, message, nextTab = "changes") {
    const previous = protectStored ? null : data;
    setData(next);
    setFilter("all");
    setSearch("");
    setDirty(false);
    setTab(nextTab);
    setProtectStored(false);
    setStorageIssue(null);
    setToast({ key: message, undo: previous });
  }
  function loadExample() {
    const action = () => replace(syntheticExample(locale), "exampleLoaded");
    if (data.project || protectStored)
      setConfirm({
        title: "replaceTitle",
        body: protectStored ? "corruptReplaceBody" : "replaceBody",
        label: "replace",
        action,
      });
    else guard(action);
  }
  function newProject() {
    const action = () => replace(emptyWorkspace(), "newProject", "agreement");
    if (data.project || protectStored)
      setConfirm({
        title: "resetTitle",
        body: protectStored ? "corruptReplaceBody" : "resetBody",
        label: "reset",
        danger: true,
        action,
      });
    else guard(() => setTab("agreement"));
  }
  function addChange() {
    if (!data.project) {
      navigate("agreement");
      return;
    }
    if (data.changes.length >= MAX_CHANGES) {
      setToast({ key: "changeLimit" });
      return;
    }
    guard(() => {
      setFocusDecision(false);
      setEditing(null);
    });
  }
  function editChange(change, decision = false) {
    guard(() => {
      setFocusDecision(decision);
      setEditing(data.changes.find((item) => item.id === change.id));
    });
  }
  function saveProject(project) {
    const action = () => {
      setData((current) => ({ ...current, project }));
      setProtectStored(false);
      setStorageIssue(null);
      setDirty(false);
      setTab("changes");
      setToast({ key: "successAgreement" });
    };
    if (protectStored)
      setConfirm({
        title: "replaceTitle",
        body: "corruptReplaceBody",
        label: "replace",
        action,
      });
    else action();
  }
  function saveChange(values) {
    let key = "successChange";
    let changes;
    const savedId = editing?.id ?? crypto.randomUUID();
    if (editing) {
      const result = applyChangeEdit(editing, values);
      changes = data.changes.map((c) =>
        c.id === editing.id ? result.change : c,
      );
      if (result.reconfirmation) key = "reconfirmed";
    } else {
      const now = new Date().toISOString();
      changes = [
        ...data.changes,
        { ...values, id: savedId, createdAt: now, updatedAt: now },
      ];
    }
    setData({ ...data, changes });
    setEditing(undefined);
    setFilter("all");
    setSearch("");
    setDirty(false);
    setToast({ key });
    requestAnimationFrame(() => {
      const saved = document.getElementById(`record-${savedId}`);
      saved?.focus({ preventScroll: true });
      saved?.scrollIntoView({ block: "nearest" });
    });
  }
  function undoLastAction() {
    const previous = toast.undo;
    guard(() => {
      setEditing(undefined);
      setData(previous);
      setFilter("all");
      setSearch("");
      setDirty(false);
      setTab("changes");
      setToast({ key: "undone" });
    });
  }
  function deleteChange(change) {
    setConfirm({
      title: "deleteTitle",
      body: "deleteBody",
      label: "delete",
      danger: true,
      action: () => {
        const previous = data;
        setData({
          ...data,
          changes: data.changes.filter((c) => c.id !== change.id),
        });
        setToast({ key: "deleted", undo: previous });
      },
    });
  }

  function downloadBackup() {
    downloadText(
      JSON.stringify(data, null, 2),
      `${safeFilename(data.project.title)}.scopenote.json`,
      "application/json;charset=utf-8",
    );
    setToast({ key: "exported" });
  }
  function downloadDocument() {
    downloadText(
      createMarkdown(data, locale),
      `${safeFilename(data.project.title)}.confirmation.${locale}.md`,
      "text/markdown;charset=utf-8",
    );
    setToast({ key: "exported" });
  }
  async function restoreBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) {
      setToast({ key: "fileTooLarge", error: true });
      return;
    }
    let raw;
    try {
      raw = await file.text();
    } catch {
      setToast({ key: "fileReadError", error: true });
      return;
    }
    let result;
    try {
      result = validateWorkspace(JSON.parse(raw));
    } catch {
      result = { ok: false };
    }
    if (!result.ok) {
      setToast({ key: "invalidBackup", error: true });
      return;
    }
    const action = () => replace(result.data, "restored");
    if (data.project || protectStored)
      setConfirm({
        title: "replaceTitle",
        body: protectStored ? "corruptReplaceBody" : "replaceBody",
        label: "replace",
        action,
      });
    else guard(action);
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {t("skipContent")}
      </a>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="note" size={25} />
          </span>
          <div>
            <strong>ScopeNote</strong>
            <p>{t("tagline")}</p>
          </div>
        </div>
        <div className="workspace-label">
          <span className="live-dot" />
          {t("workspace")}
        </div>
        <div className="sidebar-project">
          <span className="project-avatar">
            <Icon name="leaf" size={21} />
          </span>
          <div>
            <small>{data.isExample ? t("demoBadge") : t("navCaption")}</small>
            <strong>{data.project?.title ?? t("newProject")}</strong>
          </div>
        </div>
        <nav aria-label={t("workspace")}>
          {[
            ["changes", "list"],
            ["agreement", "agreement"],
            ["document", "document"],
          ].map(([key, icon]) => (
            <button
              className={`nav-item ${tab === key ? "active" : ""}`}
              key={key}
              onClick={() => navigate(key)}
              aria-current={tab === key ? "page" : undefined}
            >
              <Icon name={icon} size={20} />
              <span>{t(key)}</span>
              {key === "changes" && (
                <span className="nav-count">{data.changes.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-file-actions">
            <button disabled={!data.project} onClick={downloadBackup}>
              <Icon name="download" size={16} />
              {t("backup")}
            </button>
            <button onClick={() => importInput.current.click()}>
              <Icon name="upload" size={16} />
              {t("restore")}
            </button>
          </div>
          <button className="new-project-button" onClick={newProject}>
            <Icon name="plus" size={17} />
            {t("newProject")}
          </button>
          <div className="local-info">
            <Icon name="shield" size={20} />
            <div>
              <strong>{t("localOnly")}</strong>
              <p>{t("localHint")}</p>
            </div>
          </div>
          <span className="sidebar-footnote">
            SMALL REQUESTS. CLEAR AGREEMENTS.
          </span>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <div className="breadcrumb">
            <span>{t("workspace")}</span>
            <Icon name="chevron" size={13} />
            <strong>{t(tab)}</strong>
          </div>
          <div className="topbar-actions">
            <span
              className={`save-indicator ${saveState === "saveError" ? "failed" : ""}`}
              title={t("localOnly")}
            >
              <span />
              {t(saveState)}
            </span>
            <button
              className="language-button"
              onClick={() => setLocale((l) => (l === "zh" ? "en" : "zh"))}
              aria-label={t("switchLanguage")}
            >
              <Icon name="globe" size={17} />
              {locale === "zh" ? "EN" : "中文"}
            </button>
            <button
              className="button secondary small demo-top-button"
              onClick={loadExample}
            >
              {t("demoButton")}
              <Icon name="arrow" size={15} />
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <div className="page-eyebrow">
                <span>{t("pageTitle")}</span>
                {data.isExample && (
                  <span className="example-tag">{t("demoBadge")}</span>
                )}
              </div>
              <h1>{data.project?.title ?? t("tagline")}</h1>
              <p>
                {data.project
                  ? `${data.project.client} · ${t(`${tab}Subtitle`)}`
                  : t("pageSubtitle")}
              </p>
            </div>
            {tab === "changes" && data.project && (
              <button className="button primary" onClick={addChange}>
                <Icon name="plus" size={18} />
                {t("addChange")}
              </button>
            )}
          </div>
          {data.isExample && (
            <div className="example-banner">
              <Icon name="info" size={16} />
              <span>{t("demoNotice")}</span>
            </div>
          )}
          {storageIssue && (
            <div className="storage-warning" role="alert">
              <Icon name="info" size={18} />
              <div>
                <p>{t(storageIssue)}</p>
                {initial.raw && (
                  <button
                    onClick={() =>
                      downloadText(initial.raw, "scopenote-recovery.txt")
                    }
                  >
                    {t("rawBackup")}
                    <Icon name="download" size={15} />
                  </button>
                )}
                {data.project && (
                  <button onClick={downloadBackup}>
                    {t("backup")}
                    <Icon name="download" size={15} />
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="mobile-file-actions">
            <button
              className="button secondary small"
              disabled={!data.project}
              onClick={downloadBackup}
            >
              <Icon name="download" size={15} />
              {t("backup")}
            </button>
            <button
              className="button secondary small"
              onClick={() => importInput.current.click()}
            >
              <Icon name="upload" size={15} />
              {t("restore")}
            </button>
            <button className="button secondary small" onClick={newProject}>
              <Icon name="plus" size={15} />
              {t("newProject")}
            </button>
          </div>
          {tab === "changes" && (
            <>
              <div className="stats-grid">
                {[
                  [
                    "originalBudget",
                    totals.baseline,
                    "agreement",
                    data.project
                      ? `${formatHours(data.project.hoursHundredths, locale)} ${t("shortHour")} · ${t("originalHours")}`
                      : "—",
                  ],
                  [
                    "pendingExtra",
                    totals.pending.fee,
                    "clock",
                    `${totals.pending.count} ${t("itemCount")} · +${formatHours(totals.pending.hours, locale)} ${t("shortHour")}`,
                  ],
                  [
                    "acceptedExtra",
                    totals.accepted.fee,
                    "check",
                    `${totals.accepted.count} ${t("itemCount")} · +${formatHours(totals.accepted.hours, locale)} ${t("shortHour")}`,
                  ],
                ].map(([label, fee, icon, hint]) => (
                  <div className={`stat-card ${label}`} key={label}>
                    <div>
                      <span>{t(label)}</span>
                      <Icon name={icon} size={18} />
                    </div>
                    <strong>{data.project ? money(fee) : "—"}</strong>
                    <p>{hint}</p>
                  </div>
                ))}
              </div>
              <div className="workspace-columns">
                <ChangeList
                  data={data}
                  t={t}
                  locale={locale}
                  filter={filter}
                  setFilter={setFilter}
                  search={search}
                  setSearch={setSearch}
                  onEdit={editChange}
                  onDecision={(change) => editChange(change, true)}
                  onDelete={deleteChange}
                  onAdd={addChange}
                  onCreate={() => navigate("agreement")}
                  onExample={loadExample}
                />
                <BudgetPanel
                  data={data}
                  totals={totals}
                  t={t}
                  locale={locale}
                  onDocument={() => navigate("document")}
                />
              </div>
            </>
          )}
          {tab === "agreement" && (
            <div className="workspace-columns">
              <AgreementForm
                project={data.project}
                hasChanges={data.changes.length > 0}
                t={t}
                onSave={saveProject}
                onDirty={onDirty}
              />
              <div className="agreement-side-note">
                <span className="section-icon">
                  <Icon name="leaf" size={25} />
                </span>
                <h2>{t("originalScopeTitle")}</h2>
                <p>{t("originalScopeHint")}</p>
                <div className="quiet-note">
                  <Icon name="info" size={18} />
                  <span>{t("baselineRateHint")}</span>
                </div>
              </div>
            </div>
          )}
          {tab === "document" && (
            <ConfirmationDocument
              data={data}
              totals={totals}
              t={t}
              locale={locale}
              onDownload={downloadDocument}
              onPrint={() => window.print()}
              onCreate={() => navigate("agreement")}
              onExample={loadExample}
            />
          )}
          <footer className="workspace-footer">
            <span>
              ScopeNote <i>·</i> {t("tagline")}
            </span>
            <span>
              {data.project?.currency ?? "USD"} <i>·</i> {t("approvalHint")}
            </span>
          </footer>
        </main>
      </div>
      <input
        ref={importInput}
        className="visually-hidden"
        type="file"
        accept=".json,application/json"
        aria-label={t("restore")}
        tabIndex={-1}
        onChange={restoreBackup}
      />
      {editing !== undefined && data.project && (
        <ChangeDialog
          change={editing}
          project={data.project}
          t={t}
          locale={locale}
          focusDecision={focusDecision}
          onSave={saveChange}
          onDirty={onDirty}
          onClose={() => {
            setEditing(undefined);
            setDirty(false);
          }}
        />
      )}
      {confirm && (
        <ConfirmDialog
          title={t(confirm.title)}
          body={t(confirm.body)}
          confirmLabel={t(confirm.label)}
          danger={confirm.danger}
          t={t}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            const action = confirm.action;
            setConfirm(null);
            action();
          }}
        />
      )}
      {toast && (
        <div
          className={`toast ${toast.error ? "error-toast" : ""}`}
          role={toast.error ? "alert" : "status"}
        >
          <Icon name={toast.error ? "info" : "check"} size={18} />
          <span>{t(toast.key)}</span>
          {toast.undo && (
            <button onClick={undoLastAction}>
              <Icon name="undo" size={15} />
              {t("undo")}
            </button>
          )}
          <button
            className="toast-close"
            aria-label={t("close")}
            onClick={() => setToast(null)}
          >
            <Icon name="close" size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
