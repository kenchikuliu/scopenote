import { useEffect, useMemo, useState } from "react";
import Field, { fieldA11y } from "./Field.jsx";
import Icon from "./Icon.jsx";
import { decimalInput, validateProjectForm } from "../lib/domain.js";

export default function AgreementForm({
  project,
  hasChanges,
  t,
  onSave,
  onDirty,
}) {
  const initial = useMemo(
    () =>
      project
        ? {
            title: project.title,
            client: project.client,
            scope: project.scope,
            currency: project.currency,
            budget: decimalInput(project.budgetCents),
            hours: decimalInput(project.hoursHundredths),
            rate: decimalInput(project.rateCents),
          }
        : {
            title: "",
            client: "",
            scope: "",
            currency: "USD",
            budget: "",
            hours: "",
            rate: "",
          },
    [project],
  );
  const [fields, setFields] = useState(initial);
  const [errors, setErrors] = useState({});
  const dirty = JSON.stringify(fields) !== JSON.stringify(initial);
  useEffect(() => {
    setFields(initial);
    setErrors({});
  }, [initial]);
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
  }, [dirty, onDirty]);
  const update = (key) => (event) => {
    setFields((f) => ({ ...f, [key]: event.target.value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  function submit(event) {
    event.preventDefault();
    const result = validateProjectForm(fields, project, hasChanges);
    setErrors(result.errors);
    const first = Object.keys(result.errors)[0];
    if (first) {
      document.getElementById(`project-${first}`)?.focus();
      return;
    }
    onSave(result.project);
  }
  const input = (key, placeholder, maxLength = 120, hint) => (
    <input
      {...fieldA11y(`project-${key}`, errors[key], hint)}
      value={fields[key]}
      onChange={update(key)}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
  const amount = (key, label, hint) => (
    <Field
      id={`project-${key}`}
      label={t(label)}
      error={errors[key] && t(errors[key])}
      hint={hint && t(hint)}
    >
      <div className="input-unit">
        <input
          {...fieldA11y(`project-${key}`, errors[key], hint)}
          value={fields[key]}
          onChange={update(key)}
          inputMode="decimal"
          placeholder="0.00"
          maxLength={12}
        />
        <span>{key === "hours" ? t("shortHour") : fields.currency}</span>
      </div>
    </Field>
  );
  return (
    <form className="agreement-form" onSubmit={submit} noValidate>
      <div className="paper-card">
        <div className="section-heading">
          <span className="section-icon">
            <Icon name="agreement" />
          </span>
          <div>
            <h2>{t("agreementSection")}</h2>
            <p>{t("agreementHint")}</p>
          </div>
        </div>
        <div className="form-grid">
          <Field
            id="project-title"
            label={t("projectTitle")}
            error={errors.title && t(errors.title)}
          >
            {input("title", t("projectPlaceholder"))}
          </Field>
          <Field
            id="project-client"
            label={t("clientField")}
            error={errors.client && t(errors.client)}
          >
            {input("client", t("clientPlaceholder"))}
          </Field>
        </div>
        <Field
          id="project-scope"
          label={t("scopeField")}
          error={errors.scope && t(errors.scope)}
          hint={t("originalScopeHint")}
        >
          <textarea
            {...fieldA11y("project-scope", errors.scope, true)}
            value={fields.scope}
            onChange={update("scope")}
            placeholder={t("scopePlaceholder")}
            maxLength={6000}
            rows={7}
          />
        </Field>
      </div>
      <div className="paper-card">
        <div className="section-heading">
          <span className="section-icon">
            <Icon name="clock" />
          </span>
          <div>
            <h2>{t("commercialSection")}</h2>
            <p>{t("fixedBudgetHint")}</p>
          </div>
        </div>
        <div className="form-grid">
          <Field
            id="project-currency"
            label={t("currencyField")}
            error={errors.currency && t(errors.currency)}
            hint={hasChanges ? t("currencyHint") : undefined}
          >
            <select
              {...fieldA11y("project-currency", errors.currency, hasChanges)}
              value={fields.currency}
              onChange={update("currency")}
              disabled={hasChanges}
            >
              <option value="USD">USD · US Dollar</option>
              <option value="CNY">CNY · 人民币</option>
            </select>
          </Field>
          {amount("budget", "budgetField")}
          {amount("hours", "baselineHoursField")}
          {amount("rate", "defaultRateField", "baselineRateHint")}
        </div>
      </div>
      <div className="form-save-bar">
        <span className={dirty ? "unsaved-label" : "muted"}>
          {dirty ? t("unsaved") : ""}
        </span>
        <button className="button primary" type="submit">
          <Icon name="check" size={18} />
          {t("saveAgreement")}
        </button>
      </div>
    </form>
  );
}
