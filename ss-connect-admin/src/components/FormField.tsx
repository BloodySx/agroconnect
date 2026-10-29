import type { ReactNode } from 'react';

export function FormField({
  label,
  error,
  htmlFor,
  required = false,
  children,
}: {
  label: string;
  error?: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label className="field__label" htmlFor={htmlFor}>
        {label}
        {required && <span className="field__required" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && (
        <span id={htmlFor ? `${htmlFor}-error` : undefined} className="field__error">
          {error}
        </span>
      )}
    </div>
  );
}
