import React, { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const sizeClasses = {
  sm: 'h-8 px-3 text-ae-xs gap-1.5 rounded-ae-md',
  md: 'h-9 px-4 text-ae-sm gap-2 rounded-ae-md',
  lg: 'h-11 px-6 text-ae-base gap-2.5 rounded-ae-lg',
} as const;

const variantClasses = {
  primary:
    'bg-ae-fg text-ae-bg hover:opacity-90 active:opacity-80 focus-visible:ring-2 focus-visible:ring-ae-focus-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ae-bg disabled:opacity-40 disabled:pointer-events-none',
  ghost:
    'text-ae-text-primary hover:bg-ae-hover active:bg-ae-active focus-visible:ring-2 focus-visible:ring-ae-focus-ring disabled:opacity-40 disabled:pointer-events-none',
  outline:
    'border border-ae-border text-ae-text-primary hover:bg-ae-hover active:bg-ae-active focus-visible:ring-2 focus-visible:ring-ae-focus-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ae-bg disabled:opacity-40 disabled:pointer-events-none',
  destructive:
    'bg-ae-fg text-ae-bg hover:opacity-90 active:opacity-80 focus-visible:ring-2 focus-visible:ring-ae-focus-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ae-bg disabled:opacity-40 disabled:pointer-events-none',
} as const;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-medium transition-all duration-ae-fast outline-none select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        data-variant={variant}
        data-size={size}
        data-loading={loading || undefined}
        {...props}
      >
        {loading && <Spinner size={size === 'sm' ? 14 : 16} />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
