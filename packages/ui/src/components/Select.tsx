import React, { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { IconChevronDown } from '../icons/IconChevronDown';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, options, placeholder, className = '', id, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

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
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={`w-full h-9 px-3 pr-9 text-ae-sm bg-ae-bg border rounded-ae-md text-ae-text-primary outline-none transition-all duration-ae-fast appearance-none cursor-pointer
              ${error
                ? 'border-ae-fg focus-visible:border-ae-fg focus-visible:ring-1 focus-visible:ring-ae-fg'
                : 'border-ae-border hover:border-ae-border-strong focus-visible:border-ae-fg focus-visible:ring-1 focus-visible:ring-ae-fg'
              }
              disabled:opacity-40 disabled:pointer-events-none disabled:bg-ae-surface
              ${className}
            `}
            data-error={error || undefined}
            aria-invalid={error ? 'true' : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ae-text-muted pointer-events-none">
            <IconChevronDown size={16} />
          </div>
        </div>
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

Select.displayName = 'Select';
