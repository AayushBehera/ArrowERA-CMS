import type { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number | string;
}

export const DEFAULT_ICON_SIZE = 20;
export const DEFAULT_STROKE_WIDTH = 1.75;
