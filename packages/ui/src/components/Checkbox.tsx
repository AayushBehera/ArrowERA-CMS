import React, { forwardRef, useRef, useEffect } from 'react';
import type { InputHTMLAttributes } from 'react';
import { IconCheck } from '../icons/IconCheck';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, indeterminate = false, className = '', id, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const innerRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const setRefs = (el: HTMLInputElement | null) => {
      innerRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
    };

    return (
      <label
        htmlFor={inputId}
        className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
        data-checked={props.checked || undefined}
        data-indeterminate={indeterminate || undefined}
      >
        <div className="relative flex items-center justify-center">
          <input
            ref={setRefs}
            type="checkbox"
            id={inputId}
            className="sr-only peer"
            {...props}
          />
          <div className="w-4 h-4 border rounded-ae-sm flex items-center justify-center transition-all duration-ae-fast
            border-ae-border-strong
            group-hover:border-ae-fg
            peer-focus-visible:ring-2 peer-focus-visible:ring-ae-focus-ring peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-ae-bg
            peer-checked:bg-ae-fg peer-checked:border-ae-fg
            peer-indeterminate:bg-ae-fg peer-indeterminate:border-ae-fg
            peer-disabled:opacity-40 peer-disabled:pointer-events-none
          ">
            <IconCheck
              size={12}
              strokeWidth={3}
              className="text-ae-bg opacity-0 peer-checked:opacity-100 transition-opacity duration-ae-fast"
            />
            {indeterminate && !props.checked && (
              <div className="w-2 h-0.5 bg-ae-bg absolute" />
            )}
          </div>
        </div>
        {label && (
          <span className="text-ae-sm text-ae-text-primary group-disabled:opacity-40">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
