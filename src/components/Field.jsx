export default function Field({
  id,
  label,
  error,
  hint,
  children,
  className = "",
}) {
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p id={`${id}-help`} className="field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-help`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function fieldA11y(id, error, hint) {
  return {
    id,
    "aria-invalid": !!error,
    "aria-describedby": error || hint ? `${id}-help` : undefined,
  };
}
