import React, { forwardRef, useCallback, useRef, useEffect, useState } from 'react';
import type { HTMLAttributes } from 'react';

/* ── Tab Shape ── */

export interface Tab {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

/* ── Tabs Props ── */

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

/* ── Tabs Component ── */

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ tabs, activeTab, onChange, className = '', ...props }, ref) => {
    const tabListRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
      left: 0,
      width: 0,
    });

    /* ── Update indicator position ── */

    const updateIndicator = useCallback(() => {
      const list = tabListRef.current;
      if (!list) return;
      const activeEl = list.querySelector<HTMLElement>(`[data-tab-id="${activeTab}"]`);
      if (activeEl) {
        const listRect = list.getBoundingClientRect();
        const tabRect = activeEl.getBoundingClientRect();
        setIndicatorStyle({
          left: tabRect.left - listRect.left,
          width: tabRect.width,
        });
      }
    }, [activeTab]);

    useEffect(() => {
      updateIndicator();
      const observer = new ResizeObserver(updateIndicator);
      if (tabListRef.current) observer.observe(tabListRef.current);
      return () => observer.disconnect();
    }, [updateIndicator]);

    /* ── Keyboard navigation ── */

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
        const enabledTabs = tabs.filter((t) => !t.disabled);
        const currentId = tabs[currentIndex].id;
        const enabledIndex = enabledTabs.findIndex((t) => t.id === currentId);

        let nextIndex = enabledIndex;

        if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextIndex = (enabledIndex + 1) % enabledTabs.length;
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          nextIndex = (enabledIndex - 1 + enabledTabs.length) % enabledTabs.length;
        } else {
          return;
        }

        const nextTab = enabledTabs[nextIndex];
        onChange(nextTab.id);

        // Focus the next tab button
        const nextEl = tabListRef.current?.querySelector<HTMLElement>(
          `[data-tab-id="${nextTab.id}"]`
        );
        nextEl?.focus();
      },
      [tabs, onChange]
    );

    /* ── Render ── */

    return (
      <div ref={ref} className={`${className}`} {...props}>
        <div
          ref={tabListRef}
          role="tablist"
          aria-orientation="horizontal"
          className="relative flex items-center border-b border-ae-border"
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                aria-disabled={tab.disabled || undefined}
                data-tab-id={tab.id}
                data-active={isActive || undefined}
                disabled={tab.disabled}
                onClick={() => onChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`relative px-4 py-2.5 text-ae-sm font-medium outline-none transition-colors duration-ae-fast select-none
                  ${
                    isActive
                      ? 'text-ae-text-primary'
                      : 'text-ae-text-secondary hover:text-ae-text-primary'
                  }
                  ${tab.disabled ? 'text-ae-text-disabled pointer-events-none' : 'cursor-pointer'}
                `}
              >
                <span className="inline-flex items-center gap-1.5">
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-ae-xs rounded-ae-sm font-medium tabular-nums
                        ${
                          isActive
                            ? 'bg-ae-fg text-ae-bg'
                            : 'bg-ae-surface-secondary text-ae-text-muted'
                        }
                      `}
                    >
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}

          {/* ── Active Indicator Line ── */}
          <span
            className="absolute bottom-0 h-[2px] bg-ae-fg transition-all duration-ae-normal"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';
