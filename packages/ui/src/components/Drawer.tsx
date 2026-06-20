import React, { useEffect } from 'react';
import type { HTMLAttributes } from 'react';
import { IconX } from '../icons/IconX';

export interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  title?: string;
  width?: number;
}

export function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  width = 400,
  className = '',
  children,
  ...props
}: DrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handler);
      return () => {
        document.removeEventListener('keydown', handler);
        document.body.style.overflow = '';
      };
    }
  }, [open, onClose]);

  const translateClass =
    side === 'left'
      ? open
        ? 'translate-x-0'
        : '-translate-x-full'
      : open
        ? 'translate-x-0'
        : 'translate-x-full';

  const positionClass = side === 'left' ? 'left-0' : 'right-0';

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ae-backdrop animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 ${positionClass} z-50 h-full bg-ae-bg border-l border-ae-border shadow-ae-overlay transform transition-transform duration-ae-slow ease-in-out ${translateClass} ${className}`}
        style={{ width: `${width}px`, maxWidth: '100vw' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-ae-border">
          {title && (
            <h2 id="drawer-title" className="text-ae-lg font-semibold text-ae-text-primary">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-1.5 text-ae-text-muted hover:text-ae-text-primary hover:bg-ae-hover rounded-ae-md transition-all duration-ae-fast"
            aria-label="Close drawer"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto h-[calc(100%-64px)] p-6">{children}</div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 200ms ease-out; }
      `}</style>
    </>
  );
}

Drawer.displayName = 'Drawer';
