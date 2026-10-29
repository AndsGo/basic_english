import type { ComponentProps, ReactNode } from 'react';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'quiet';
  loading?: boolean;
  loadingLabel?: string;
}

export function Button({ variant = 'primary', loading, loadingLabel = 'Working…', disabled, className = '', children, type = 'button', ...props }: ButtonProps) {
  return <button {...props} type={type} className={`ui-button ui-button--${variant} ${className}`}
    disabled={disabled || loading} aria-busy={loading || props['aria-busy']} data-loading={loading || undefined}>
    <span className="ui-button-label" aria-hidden={loading || undefined}>{children}</span>
    {loading !== undefined && <span className="ui-button-loading" aria-hidden={!loading || undefined}><span className="ui-spinner" aria-hidden="true" />{loadingLabel}</span>}
  </button>;
}

export function IconButton({ label, icon, className = '', variant = 'secondary', ...props }: Omit<ButtonProps, 'children'> & { label: string; icon: ReactNode }) {
  return <Button {...props} loadingLabel="" variant={variant} aria-label={label} className={`ui-icon-button ${className}`}>
    <span aria-hidden="true">{icon}</span>
  </Button>;
}

export function AnswerOption({ selected, result, className = '', ...props }: Omit<ButtonProps, 'variant'> & { selected: boolean; result?: 'correct' | 'retry' }) {
  return <Button {...props} variant="secondary" className={`ui-answer-option ${className}`} aria-pressed={selected} data-result={selected ? result : undefined} />;
}
