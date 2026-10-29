import { useId, type ComponentProps, type ReactNode } from 'react';
import { FieldGroup, fieldDescription, type FieldContent } from './FormField';

type ChoiceProps = Omit<ComponentProps<'input'>, 'type' | 'children'> & FieldContent;

function BooleanControl({ kind, label, hint, error, id, className = '', ...props }: ChoiceProps & { kind: 'checkbox' | 'switch' }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return <div className="ui-choice-field">
    <label className={`ui-choice-row ui-choice-row--${kind} ${className}`} htmlFor={inputId}>
      <span className="ui-control-box">
        <input {...props} id={inputId} type="checkbox" role={kind === 'switch' ? 'switch' : undefined}
          aria-labelledby={`${inputId}-label`} aria-describedby={fieldDescription(inputId, hint, error, props['aria-describedby'])}
          aria-invalid={Boolean(error) || props['aria-invalid']} />
        <span className="ui-choice-mark" aria-hidden="true">{kind === 'checkbox' && <svg viewBox="0 0 20 20"><path d="m4 10 4 4 8-8" /></svg>}</span>
      </span>
      <span className="ui-choice-copy"><span id={`${inputId}-label`}>{label}</span>
        {hint && <span className="ui-field-hint" id={`${inputId}-hint`}>{hint}</span>}
      </span>
    </label>
    {error && <p className="ui-field-error" id={`${inputId}-error`}>{error}</p>}
  </div>;
}

export function Checkbox(props: ChoiceProps) {
  return <BooleanControl {...props} kind="checkbox" />;
}

export function Switch(props: ChoiceProps) {
  return <BooleanControl {...props} kind="switch" />;
}

export interface RadioOption {
  value: string;
  label: ReactNode;
  hint?: string;
  disabled?: boolean;
}

export function RadioGroup({ label, hint, error, options, value, onValueChange, name, disabled = false, role }: FieldContent & {
  options: readonly RadioOption[];
  value: string;
  onValueChange: (value: string) => void;
  name?: string;
  disabled?: boolean;
  role?: 'radiogroup';
}) {
  const groupId = useId();
  return <FieldGroup id={groupId} label={label} hint={hint} error={error} disabled={disabled} role={role}>
    {options.map((option, index) => {
      const inputId = `${groupId}-${index}`;
      return <label className="ui-choice-row ui-choice-row--radio" key={option.value} htmlFor={inputId}>
        <span className="ui-control-box">
          <input type="radio" id={inputId} name={name ?? groupId} value={option.value} checked={value === option.value}
            disabled={disabled || option.disabled} onChange={() => onValueChange(option.value)}
            aria-labelledby={`${inputId}-label`} aria-invalid={Boolean(error)}
            aria-describedby={fieldDescription(groupId, hint, error, option.hint ? `${inputId}-hint` : undefined)} />
          <span className="ui-choice-mark" aria-hidden="true" />
        </span>
        <span className="ui-choice-copy"><span id={`${inputId}-label`}>{option.label}</span>
          {option.hint && <span className="ui-field-hint" id={`${inputId}-hint`}>{option.hint}</span>}
        </span>
      </label>;
    })}
  </FieldGroup>;
}
