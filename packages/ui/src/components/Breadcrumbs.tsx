import React, { forwardRef } from 'react';
import type { AnchorHTMLAttributes } from 'react';
import { IconChevronRight } from '../icons/IconChevronRight';

/* ── Breadcrumb Item ── */

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/* ── Breadcrumbs Props ── */

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: 'slash' | 'chevron' | 'dot';
  className?: string;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

/* ── Separator ── */

const Separator = ({ type }: { type: 'slash' | 'chevron' | 'dot' }) => {
  if (type === 'chevron') {
    return <IconChevronRight size={14} strokeWidth={2} className="text-ae-text-disabled shrink-0" />;
  }
  if (type === 'dot') {
    return <span className="text-ae-text-disabled text-ae-xs shrink-0 select-none">·</span>;
  }
  // slash
  return <span className="text-ae-text-disabled text-ae-sm shrink-0 select-none">/</span>;
};

/* ── Breadcrumbs Component ── */

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ items, separator = 'slash', className = '', onItemClick }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={`flex items-center gap-1.5 ${className}`}
      >
        <ol className="flex items-center gap-1.5 list-none p-0 m-0">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center gap-1.5">
                {isLast ? (
                  <span
                    className="text-ae-sm font-medium text-ae-text-primary truncate max-w-[200px]"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : item.href || onItemClick ? (
                  <a
                    href={item.href}
                    onClick={(e) => {
                      if (onItemClick) {
                        e.preventDefault();
                        onItemClick(item, index);
                      }
                    }}
                    className="text-ae-sm text-ae-text-secondary hover:text-ae-text-primary transition-colors duration-ae-fast truncate max-w-[200px] outline-none focus-visible:underline"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-ae-sm text-ae-text-muted truncate max-w-[200px]">
                    {item.label}
                  </span>
                )}

                {!isLast && <Separator type={separator} />}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumbs.displayName = 'Breadcrumbs';
