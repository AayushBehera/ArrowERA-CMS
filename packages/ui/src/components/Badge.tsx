import React from 'react';
import type { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'destructive';
}

const variantClasses = {
  neutral: 'bg-ae-surface-secondary text-ae-text-secondary border-ae-border',
  success: 'bg-ae-surface-secondary text-ae-text-primary border-ae-border',
  warning: 'bg-ae-surface-secondary text-ae-text-primary border-ae-border-strong',
  destructive: 'bg-ae-surface-secondary text-ae-text-primary border-ae-border-strong',
} as const;

export function Badge({
  variant = 'neutral',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-ae-xs font-medium rounded-ae-sm border ${variantClasses[variant]} ${className}`}
      data-variant={variant}
      {...props}
    >
      {children}
    </span>
  );
}

Badge.displayName = 'Badge';
