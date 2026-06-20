import React from 'react';
import type { HTMLAttributes } from 'react';
import { IconSearch } from '../icons/IconSearch';
import { IconBell } from '../icons/IconBell';
import { IconChevronDown } from '../icons/IconChevronDown';

export interface TopbarProps extends HTMLAttributes<HTMLElement> {
  userName?: string;
  userEmail?: string;
  notificationCount?: number;
  onSearch?: (query: string) => void;
  onNotificationsClick?: () => void;
  onUserMenuClick?: () => void;
  children?: React.ReactNode;
}

export function Topbar({
  userName = 'User',
  userEmail = '',
  notificationCount = 0,
  onSearch,
  onNotificationsClick,
  onUserMenuClick,
  className = '',
  children,
  ...props
}: TopbarProps) {
  return (
    <header
      className={`h-16 flex items-center gap-4 px-6 bg-ae-bg border-b border-ae-border ${className}`}
      role="banner"
      {...props}
    >
      {/* Global Search */}
      <div className="relative flex-1 max-w-md">
        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ae-text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full h-9 pl-9 pr-4 text-ae-sm bg-ae-surface rounded-ae-md border border-transparent text-ae-text-primary placeholder:text-ae-text-disabled outline-none focus:bg-ae-bg focus:border-ae-border-strong focus-visible:ring-1 focus-visible:ring-ae-fg transition-all duration-ae-fast"
        />
      </div>

      {/* Notification Bell */}
      <button
        onClick={onNotificationsClick}
        className="relative p-2 text-ae-text-muted hover:text-ae-text-primary hover:bg-ae-hover rounded-ae-md transition-all duration-ae-fast"
        aria-label={`Notifications${notificationCount ? ` (${notificationCount})` : ''}`}
      >
        <IconBell size={20} />
        {notificationCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ae-fg rounded-full" />
        )}
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-ae-border" />

      {/* User Menu */}
      <button
        onClick={onUserMenuClick}
        className="flex items-center gap-3 px-2 py-1 -mr-2 hover:bg-ae-hover rounded-ae-md transition-all duration-ae-fast"
      >
        <div className="text-right hidden sm:block">
          <p className="text-ae-sm font-medium text-ae-text-primary leading-tight">
            {userName}
          </p>
          {userEmail && (
            <p className="text-ae-xs text-ae-text-muted leading-tight">{userEmail}</p>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-ae-surface-secondary border border-ae-border flex items-center justify-center text-ae-text-primary text-ae-sm font-medium">
          {userName.charAt(0).toUpperCase()}
        </div>
        <IconChevronDown size={14} className="text-ae-text-muted" />
      </button>

      {children}
    </header>
  );
}

Topbar.displayName = 'Topbar';
