import React from 'react';
import type { HTMLAttributes } from 'react';
import { Button } from './Button';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
      {...props}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-ae-surface-secondary border border-ae-border flex items-center justify-center text-ae-text-muted mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-ae-lg font-semibold text-ae-text-primary">{title}</h3>
      {description && (
        <p className="mt-2 text-ae-sm text-ae-text-secondary max-w-sm">{description}</p>
      )}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';
