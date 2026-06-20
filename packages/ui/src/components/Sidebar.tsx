import React, { createContext, useContext, useState, useCallback } from 'react';
import type { HTMLAttributes } from 'react';

export interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
  expand: () => {},
  collapse: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  defaultCollapsed?: boolean;
  collapsedWidth?: number;
  expandedWidth?: number;
}

export function Sidebar({
  defaultCollapsed = false,
  collapsedWidth = 64,
  expandedWidth = 240,
  className = '',
  children,
  ...props
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggle = useCallback(() => setCollapsed((prev) => !prev), []);
  const expand = useCallback(() => setCollapsed(false), []);
  const collapse = useCallback(() => setCollapsed(true), []);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, expand, collapse }}>
      <aside
        className={`flex flex-col bg-ae-bg border-r border-ae-border transition-all duration-ae-slow ease-in-out overflow-hidden ${className}`}
        style={{ width: collapsed ? collapsedWidth : expandedWidth }}
        data-collapsed={collapsed || undefined}
        role="navigation"
        aria-label="Sidebar"
        {...props}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  );
}

Sidebar.displayName = 'Sidebar';
