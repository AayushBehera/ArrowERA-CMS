import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { useSidebar } from './Sidebar';

export interface SidebarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string | number;
}

export function SidebarItem({
  icon,
  label,
  active = false,
  badge,
  className = '',
  ...props
}: SidebarItemProps) {
  const { collapsed } = useSidebar();

  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-ae-sm font-medium rounded-ae-md transition-all duration-ae-fast outline-none select-none
        ${active
          ? 'bg-ae-hover text-ae-text-primary border-l-2 border-ae-fg pl-[10px]'
          : 'text-ae-text-secondary hover:bg-ae-hover hover:text-ae-text-primary focus-visible:ring-2 focus-visible:ring-ae-focus-ring border-l-2 border-transparent pl-[10px]'
        }
        ${collapsed ? 'justify-center px-2' : ''}
        ${className}
      `}
      data-active={active || undefined}
      title={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      {...props}
    >
      <span className={`flex-shrink-0 ${active ? 'text-ae-text-primary' : 'text-ae-text-muted'}`}>
        {icon}
      </span>
      {!collapsed && (
        <span className="flex-1 text-left truncate">{label}</span>
      )}
      {!collapsed && badge !== undefined && (
        <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-ae-xs font-medium text-ae-text-muted bg-ae-surface-secondary rounded-ae-sm">
          {badge}
        </span>
      )}
    </button>
  );
}

SidebarItem.displayName = 'SidebarItem';
