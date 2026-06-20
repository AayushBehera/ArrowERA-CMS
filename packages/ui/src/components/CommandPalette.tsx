import React, {
  forwardRef,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import type { HTMLAttributes } from 'react';
import { IconSearch } from '../icons/IconSearch';
import { IconArrowUp } from '../icons/IconArrowUp';
import { IconArrowDown } from '../icons/IconArrowDown';
import { IconX } from '../icons/IconX';

/* ── Command Shape ── */

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  keywords?: string[];
  onSelect: () => void;
}

/* ── Group Shape ── */

export interface CommandGroup {
  id: string;
  label: string;
  commands: Command[];
}

/* ── CommandPalette Props ── */

export interface CommandPaletteProps {
  groups: CommandGroup[];
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

/* ── Animation keyframes (injected once) ── */

const STYLE_ID = 'ae-command-palette-keyframes';

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes ae-cp-scale-in {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
      to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes ae-cp-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

/* ── CommandPalette Component ── */

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  (
    {
      groups,
      placeholder = 'Search commands...',
      emptyMessage = 'No results found.',
      className = '',
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const activeItemRef = useRef<HTMLButtonElement>(null);

    /* ── Inject keyframes ── */

    useEffect(() => {
      injectKeyframes();
    }, []);

    /* ── Global shortcut listener ── */

    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, []);

    /* ── Focus input on open ── */

    useEffect(() => {
      if (isOpen) {
        setQuery('');
        setActiveIndex(0);
        // small delay so the input mounts
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    }, [isOpen]);

    /* ── Scroll active item into view ── */

    useEffect(() => {
      activeItemRef.current?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    /* ── Filter commands ── */

    const filteredGroups = useMemo(() => {
      if (!query.trim()) return groups;

      const lower = query.toLowerCase();
      return groups
        .map((group) => ({
          ...group,
          commands: group.commands.filter(
            (cmd) =>
              cmd.label.toLowerCase().includes(lower) ||
              cmd.description?.toLowerCase().includes(lower) ||
              cmd.keywords?.some((kw) => kw.toLowerCase().includes(lower))
          ),
        }))
        .filter((group) => group.commands.length > 0);
    }, [groups, query]);

    /* ── Flat list for keyboard nav ── */

    const flatCommands = useMemo(() => {
      const result: { command: Command; groupId: string }[] = [];
      filteredGroups.forEach((group) => {
        group.commands.forEach((command) => {
          result.push({ command, groupId: group.id });
        });
      });
      return result;
    }, [filteredGroups]);

    const totalCommands = flatCommands.length;

    /* ── Keyboard navigation ── */

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % Math.max(totalCommands, 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex(
            (prev) => (prev - 1 + totalCommands) % Math.max(totalCommands, 1)
          );
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const item = flatCommands[activeIndex];
          if (item) {
            item.command.onSelect();
            setIsOpen(false);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setIsOpen(false);
        }
      },
      [activeIndex, flatCommands, totalCommands]
    );

    /* ── Close on backdrop click ── */

    const handleBackdropClick = useCallback(
      (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      },
      []
    );

    /* ── Close ── */

    const close = useCallback(() => setIsOpen(false), []);

    /* ── Not open — render nothing visible ── */

    if (!isOpen) return null;

    /* ── Render ── */

    return (
      <div
        ref={ref}
        className={`fixed inset-0 z-50 ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-ae-backdrop backdrop-blur-[2px] animate-[ae-cp-fade-in_150ms_ease-out]"
          onClick={handleBackdropClick}
        />

        {/* Palette Panel */}
        <div
          className="absolute top-[15%] left-1/2 w-full max-w-[520px] animate-[ae-cp-scale-in_200ms_ease-out]"
          style={{ transform: 'translate(-50%, 0)' }}
          onKeyDown={handleKeyDown}
        >
          <div className="mx-4 bg-ae-bg border border-ae-border rounded-ae-lg shadow-ae-overlay overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 h-12 border-b border-ae-border">
              <IconSearch
                size={18}
                strokeWidth={1.75}
                className="text-ae-text-muted shrink-0"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-ae-sm text-ae-text-primary placeholder-ae-text-disabled outline-none"
                aria-autocomplete="list"
                aria-controls="ae-cp-list"
                aria-activedescendant={
                  flatCommands[activeIndex]
                    ? `ae-cp-${flatCommands[activeIndex].command.id}`
                    : undefined
                }
              />
              <button
                type="button"
                onClick={close}
                className="p-1 rounded-ae-sm text-ae-text-muted hover:text-ae-text-primary transition-colors duration-ae-fast"
                aria-label="Close command palette"
              >
                <IconX size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              id="ae-cp-list"
              role="listbox"
              className="max-h-[320px] overflow-y-auto p-2"
            >
              {filteredGroups.length === 0 ? (
                <div className="px-3 py-8 text-center text-ae-sm text-ae-text-muted">
                  {emptyMessage}
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.id} className="mb-1 last:mb-0">
                    {/* Group Label */}
                    <div className="px-3 py-1.5 text-ae-xs font-medium text-ae-text-muted uppercase tracking-wider select-none">
                      {group.label}
                    </div>

                    {group.commands.map((cmd) => {
                      const flatIndex = flatCommands.findIndex(
                        (f) => f.command.id === cmd.id
                      );
                      const isActive = flatIndex === activeIndex;

                      return (
                        <button
                          key={cmd.id}
                          ref={isActive ? activeItemRef : undefined}
                          id={`ae-cp-${cmd.id}`}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          tabIndex={-1}
                          onClick={() => {
                            cmd.onSelect();
                            setIsOpen(false);
                          }}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-ae-md text-left outline-none transition-colors duration-ae-fast
                            ${
                              isActive
                                ? 'bg-ae-surface-secondary'
                                : 'hover:bg-ae-hover'
                            }
                          `}
                        >
                          {/* Icon */}
                          {cmd.icon && (
                            <span className="flex items-center justify-center w-7 h-7 shrink-0 text-ae-text-secondary">
                              {cmd.icon}
                            </span>
                          )}

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <div className="text-ae-sm font-medium text-ae-text-primary truncate">
                              {cmd.label}
                            </div>
                            {cmd.description && (
                              <div className="text-ae-xs text-ae-text-muted truncate mt-0.5">
                                {cmd.description}
                              </div>
                            )}
                          </div>

                          {/* Shortcut hint */}
                          {isActive && (
                            <span className="flex items-center gap-1 text-ae-xs text-ae-text-disabled shrink-0">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-ae-sm border border-ae-border text-ae-text-muted">
                                ↵
                              </span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}

              {/* Footer hint */}
              {totalCommands > 0 && (
                <div className="flex items-center gap-4 px-3 py-2 border-t border-ae-border mt-1 text-ae-xs text-ae-text-disabled">
                  <span className="inline-flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center px-1.5 h-5 rounded-ae-sm border border-ae-border text-ae-text-muted font-sans">
                      ↑↓
                    </kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center px-1.5 h-5 rounded-ae-sm border border-ae-border text-ae-text-muted font-sans">
                      ↵
                    </kbd>
                    <span>Select</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center px-1.5 h-5 rounded-ae-sm border border-ae-border text-ae-text-muted font-sans">
                      Esc
                    </kbd>
                    <span>Close</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CommandPalette.displayName = 'CommandPalette';
