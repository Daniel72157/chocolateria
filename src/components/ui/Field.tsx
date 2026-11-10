import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

type Common = { label: string; error?: string; hint?: ReactNode; hideLabel?: boolean };
export const Input = forwardRef<HTMLInputElement, Common & InputHTMLAttributes<HTMLInputElement>>(
  ({ label, error, hint, hideLabel, id, className = '', ...rest }, ref) => {
    const fid = id ?? `f-${rest.name}`;
    return (
      <div className={className}>
        <label htmlFor={fid} className={hideLabel ? 'sr-only' : 'label'}>{label}</label>
        <input ref={ref} id={fid} className="field" aria-invalid={!!error} aria-describedby={error ? `${fid}-e` : hint ? `${fid}-h` : undefined} {...rest} />
        {hint && !error && <p id={`${fid}-h`} className="t-small mt-1">{hint}</p>}
        {error && <p id={`${fid}-e`} role="alert" className="err">{error}</p>}
      </div>
    );
  },
);
export const Textarea = forwardRef<HTMLTextAreaElement, Common & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ label, error, hint, hideLabel, id, className = '', ...rest }, ref) => {
    const fid = id ?? `f-${rest.name}`;
    return (
      <div className={className}>
        <label htmlFor={fid} className={hideLabel ? 'sr-only' : 'label'}>{label}</label>
        <textarea ref={ref} id={fid} className="field" aria-invalid={!!error} aria-describedby={error ? `${fid}-e` : hint ? `${fid}-h` : undefined} {...rest} />
        {hint && !error && <p id={`${fid}-h`} className="t-small mt-1">{hint}</p>}
        {error && <p id={`${fid}-e`} role="alert" className="err">{error}</p>}
      </div>
    );
  },
);
