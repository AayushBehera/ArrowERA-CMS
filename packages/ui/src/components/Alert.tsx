import React from 'react';
import type { HTMLAttributes } from 'react';
import { IconX } from '../icons/IconX';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantStyles = {
  info: 'bg-ae-surface border-ae-border',
  success: 'bg-ae-surface border-ae-border',
  warning: 'bg-ae-surface-secondary border-ae-border-strong',
  error: 'bg-ae-surface-secondary border-ae-border-strong',
} as const;

export function Alert({
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  className = '',
  children,
  ...props
}: AlertProps) {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  return (
    <div
      className={`flex gap-3 px-4 py-3 rounded-ae-lg border text-ae-sm ${variantStyles[variant]} ${className}`}
      role="alert"
      data-variant={variant}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <p className="font-medium text-ae-text-primary">{title}</p>
        )}
        <div className={title ? 'mt-1 text-ae-text-secondary' : 'text-ae-text-secondary'}>
          {children}
        </div>
      </div>
      {dismissible && (
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          className="p-0.5 text-ae-text-muted hover:text-ae-text-primary rounded transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <IconX size={14} />
        </button>
      )}
    </div>
  );
}

Alert.displayName = 'Alert';
