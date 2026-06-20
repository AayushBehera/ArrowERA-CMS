import React, { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, hint, autoResize = false, className = '', id, onChange, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-ae-sm font-medium text-ae-text-primary mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          onChange={handleChange}
          className={`w-full min-h-[80px] px-3 py-2 text-ae-sm bg-ae-bg border rounded-ae-md text-ae-text-primary placeholder:text-ae-text-disabled outline-none transition-all duration-ae-fast resize-vertical
            ${error
              ? 'border-ae-fg focus-visible:border-ae-fg focus-visible:ring-1 focus-visible:ring-ae-fg'
              : 'border-ae-border hover:border-ae-border-strong focus-visible:border-ae-fg focus-visible:ring-1 focus-visible:ring-ae-fg'
            }
            disabled:opacity-40 disabled:pointer-events-none disabled:bg-ae-surface
            ${className}
          `}
          data-error={error || undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-ae-xs text-ae-text-primary" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-ae-xs text-ae-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
