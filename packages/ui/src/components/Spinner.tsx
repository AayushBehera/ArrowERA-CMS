import React, { forwardRef } from 'react';
import type { SVGProps } from 'react';

export interface SpinnerProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ size = 20, className = '', ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={`animate-spin ${className}`}
        aria-hidden="true"
        {...props}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-20"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }
);

Spinner.displayName = 'Spinner';
