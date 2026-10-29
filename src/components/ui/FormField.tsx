import { useId, type ComponentProps, type ReactNode } from 'react';

export interface FieldContent {
  label: ReactNode;
  hint?: string;
  error?: string;
}

export function fieldDescription(id: string, hint?: string, error?: string, existing?: string) {
  return [existing, hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
}

export function FormField({ htmlFor, label, hint, error, children, className = '' }: FieldContent & { htmlFor: string; children: ReactNode; className?: string }) {
  return <div className={`ui-field ${className}`}>
    <label htmlFor={htmlFor} className="ui-field-label">{label}</label>
    {children}
    {hint && <p className="ui-field-hint" id={`${htmlFor}-hint`}>{hint}</p>}
    {error && <p className="ui-field-error" id={`${htmlFor}-error`}>{error}</p>}
  </div>;
}

export function FieldGroup({ label, hint, error, children, id, className = '', ...props }: FieldContent & Omit<ComponentProps<'fieldset'>, 'children'> & { children: ReactNode }) {
  const generatedId = useId();
  const groupId = id ?? generatedId;
  return <fieldset {...props} id={groupId} className={`ui-field-group ${className}`}
    aria-describedby={fieldDescription(groupId, hint, error, props['aria-describedby'])} aria-invalid={Boolean(error) || props['aria-invalid']}>
    <legend>{label}</legend>
    {hint && <p className="ui-field-hint" id={`${groupId}-hint`}>{hint}</p>}
    <div className="ui-field-group-items">{children}</div>
    {error && <p className="ui-field-error" id={`${groupId}-error`}>{error}</p>}
  </fieldset>;
}
