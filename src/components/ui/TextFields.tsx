import { useId, type ComponentProps } from 'react';
import { FormField, fieldDescription, type FieldContent } from './FormField';

export function TextField({ label, hint, error, id, className = '', fieldClassName, type = 'text', ...props }: FieldContent & Omit<ComponentProps<'input'>, 'type'> & { type?: 'text' | 'search'; fieldClassName?: string }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return <FormField htmlFor={inputId} label={label} hint={hint} error={error} className={fieldClassName}>
    <input {...props} id={inputId} type={type} className={`ui-input ${className}`} aria-invalid={Boolean(error) || props['aria-invalid']}
      aria-describedby={fieldDescription(inputId, hint, error, props['aria-describedby'])} />
  </FormField>;
}

export function TextArea({ label, hint, error, id, className = '', fieldClassName, rows = 3, ...props }: FieldContent & ComponentProps<'textarea'> & { fieldClassName?: string }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return <FormField htmlFor={inputId} label={label} hint={hint} error={error} className={fieldClassName}>
    <textarea {...props} id={inputId} rows={rows} className={`ui-input ui-textarea ${className}`} aria-invalid={Boolean(error) || props['aria-invalid']}
      aria-describedby={fieldDescription(inputId, hint, error, props['aria-describedby'])} />
  </FormField>;
}

export function Select({ label, hint, error, id, className = '', fieldClassName, children, ...props }: FieldContent & ComponentProps<'select'> & { fieldClassName?: string }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return <FormField htmlFor={inputId} label={label} hint={hint} error={error} className={fieldClassName}>
    <span className="ui-select-wrap">
      <select {...props} id={inputId} className={`ui-input ui-select ${className}`} aria-invalid={Boolean(error) || props['aria-invalid']}
        aria-describedby={fieldDescription(inputId, hint, error, props['aria-describedby'])}>{children}</select>
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5" /></svg>
    </span>
  </FormField>;
}
