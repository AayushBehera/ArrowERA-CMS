import React from 'react';
import type { HTMLAttributes } from 'react';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-[768px]',
  md: 'max-w-[1024px]',
  lg: 'max-w-[1280px]',
  xl: 'max-w-[1440px]',
  full: 'max-w-full',
} as const;

export function Container({
  size = 'lg',
  className = '',
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Container.displayName = 'Container';
