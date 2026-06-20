import React from 'react';
import type { HTMLAttributes } from 'react';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}

export function Divider({
  orientation = 'horizontal',
  className = '',
  ...props
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={`w-px self-stretch bg-ae-border ${className}`}
        role="separator"
        aria-orientation="vertical"
        {...props}
      />
    );
  }

  return (
    <hr
      className={`border-0 h-px bg-ae-border ${className}`}
      role="separator"
      aria-orientation="horizontal"
      {...props}
    />
  );
}

Divider.displayName = 'Divider';
