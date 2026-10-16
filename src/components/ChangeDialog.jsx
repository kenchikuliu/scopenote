import { useEffect, useRef, useState } from "react";
import Field, { fieldA11y } from "./Field.jsx";
import Icon from "./Icon.jsx";
import {
  changeFee,
  decimalInput,
  formatMoney,
  validateChangeForm,
} from "../lib/domain.js";

export default function ChangeDialog({
  change,
  project,
  t,
  locale,
  focusDecision = false,
  onClose,
  onSave,
  onDirty,
}) {
  const initial = useRef(
    change
      ? {
          title: change.title,
          deliverable: change.deliverable,
          source: change.source,
          hours: decimalInput(change.hoursHundredths),
          rate: decimalInput(change.rateCents),
          status: change.status,
          decisionNote: change.decisionNote,
        }
      : {
          title: "",
          deliverable: "",
          source: "",
          hours: "",
          rate: decimalInput(project.rateCents),
          status: "pending",
          decisionNote: "",
        },
  ).current;
  const [fields, setFields] = useState(initial);
  const [errors, setErrors] = useState({});
  const [discard, setDiscard] = useState(false);
  const dialog = useRef(null);
  const dirty = JSON.stringify(fields) !== JSON.stringify(initial);
  useEffect(() => {
    dialog.current.showModal();
    if (focusDecision) {
      const decision = dialog.current.querySelector("#change-status");
      decision?.focus();
      decision?.scrollIntoView({ block: "center" });
    }
  }, []);
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
  }, [dirty, onDirty]);
  const update = (key) => (event) => {
    setFields((f) => ({ ...f, [key]: event.target.value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  function close() {
    if (dirty) setDiscard(true);
    else onClose();
  }
  function submit(event) {
    event.preventDefault();
    const result = validateChangeForm(fields);
    setErrors(result.errors);
    const first = Object.keys(result.errors)[0];
    if (first) {
      document.getElementById(`change-${first}`)?.focus();
      return;
    }
    onSave(result.values);
  }
  const preview = validateChangeForm(fields);
  const quoteError = preview.errors.hours ?? preview.errors.rate;
  const fee = quoteError ? null : changeFee(preview.values);
  const quoteHint = !quoteError
    ? "rateSnapshot"
    : quoteError === "required" ? "quoteIncomplete" : "quoteInvalid";
  const amount = (key, label, unit) => (
    <Field
      id={`change-${key}`}
      label={t(label)}
      error={errors[key] && t(errors[key])}
    >
      <div className="input-unit">
        <input
          {...fieldA11y(`change-${key}`, errors[key])}
          value={fields[key]}
          onChange={update(key)}
          inputMode="decimal"
          placeholder="0.00"
          maxLength={12}
        />
        <span>{unit}</span>
      </div>
    </Field>
  );
  return (
    <dialog
      ref={dialog}
      className="change-dialog"
      aria-labelledby="change-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div className="dialog-heading">
        <div>
          <span className="eyebrow">{t("workspace")}</span>
          <h2 id="change-dialog-title">
            {t(change ? "editChangeTitle" : "addChangeTitle")}
          </h2>
          <p>{t("changeFormHint")}</p>
        </div>
        <button className="icon-button" onClick={close} aria-label={t("close")}>
          <Icon name="close" />
        </button>
      </div>
      <form onSubmit={submit} noValidate>
        <div className="dialog-content">
          <Field
            id="change-title"
            label={t("titleField")}
            error={errors.title && t(errors.title)}
          >
            <input
              {...fieldA11y("change-title", errors.title)}
              value={fields.title}
              onChange={update("title")}
              placeholder={t("titlePlaceholder")}
              maxLength={120}
              autoFocus={!focusDecision}
            />
          </Field>
          <Field
            id="change-deliverable"
            label={t("deliverableLabel")}
            error={errors.deliverable && t(errors.deliverable)}
          >
            <textarea
              {...fieldA11y("change-deliverable", errors.deliverable)}
              value={fields.deliverable}
              onChange={update("deliverable")}
              placeholder={t("deliverablePlaceholder")}
              maxLength={3000}
              rows={2}
            />
          </Field>
          <Field
            id="change-source"
            label={t("sourceLabel")}
            error={errors.source && t(errors.source)}
            hint={t("sourceHint")}
          >
            <textarea
              {...fieldA11y("change-source", errors.source, true)}
              value={fields.source}
              onChange={update("source")}
              placeholder={t("sourcePlaceholder")}
              maxLength={3000}
              rows={2}
            />
          </Field>
          <div className="form-grid">
            {amount("hours", "hoursField", t("shortHour"))}
            {amount("rate", "rateField", project.currency)}
          </div>
          <div className="live-quote">
            <div>
              <span>{t("liveQuote")}</span>
              <p>{t(quoteHint)}</p>
            </div>
            <strong>
              {Number.isSafeInteger(fee)
                ? formatMoney(fee, project.currency, locale)
                : "—"}
            </strong>
          </div>
          {change && (
            <div className="decision-section">
              <Field
                id="change-status"
                label={t("decisionField")}
                hint={t("decisionHint")}
              >
                <select
                  {...fieldA11y("change-status", errors.status, true)}
                  value={fields.status}
                  onChange={update("status")}
                >
                  <option value="pending">{t("pending")}</option>
                  <option value="accepted">{t("accepted")}</option>
                  <option value="declined">{t("declined")}</option>
                </select>
              </Field>
              <Field
                id="change-decisionNote"
                label={t("decisionNote")}
                error={errors.decisionNote && t(errors.decisionNote)}
              >
                <textarea
                  {...fieldA11y("change-decisionNote", errors.decisionNote)}
                  value={fields.decisionNote}
                  onChange={update("decisionNote")}
                  placeholder={t("decisionPlaceholder")}
                  maxLength={2000}
                  rows={2}
                />
              </Field>
              {change.status === "accepted" && (
                <p className="info-line">
                  <Icon name="info" size={16} />
                  {t("reconfirmHint")}
                </p>
              )}
            </div>
          )}
          {discard && (
            <div className="discard-prompt" role="alert">
              <p>{t("discardHint")}</p>
              <button
                className="button danger small"
                type="button"
                onClick={onClose}
              >
                {t("discard")}
              </button>
              <button
                className="button secondary small"
                type="button"
                onClick={() => setDiscard(false)}
              >
                {t("keepEditing")}
              </button>
            </div>
          )}
        </div>
        <div className="dialog-footer">
          <span className="unsaved-label">{dirty ? t("unsaved") : ""}</span>
          <button className="button secondary" type="button" onClick={close}>
            {t("cancel")}
          </button>
          <button className="button primary" type="submit">
            {t("saveChange")}
            <Icon name="check" size={18} />
          </button>
        </div>
      </form>
    </dialog>
  );
}
