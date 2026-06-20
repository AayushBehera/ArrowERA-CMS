import React, { forwardRef } from 'react';
import type { IconProps } from './types';
import { DEFAULT_ICON_SIZE, DEFAULT_STROKE_WIDTH } from './types';

/**
 * Creates a consistent SVG icon component.
 * Every ArrowERA icon uses this factory for uniform stroke, sizing, and behavior.
 */
export function createIcon(
  displayName: string,
  path: React.ReactNode,
  defaultViewBox = '0 0 24 24'
) {
  const Icon = forwardRef<SVGSVGElement, IconProps>(
    (
      {
        size = DEFAULT_ICON_SIZE,
        strokeWidth = DEFAULT_STROKE_WIDTH,
        className = '',
        ...props
      },
      ref
    ) => {
      return (
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox={defaultViewBox}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
          {...props}
        >
          {path}
        </svg>
      );
    }
  );

  Icon.displayName = displayName;
  return Icon;
}
