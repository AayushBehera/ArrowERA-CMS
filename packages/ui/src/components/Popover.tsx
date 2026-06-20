import React, { useState, useRef, useEffect } from 'react';
import type { HTMLAttributes } from 'react';

export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  trigger: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'start' | 'center' | 'end';
}

export function Popover({
  trigger,
  open: controlledOpen,
  onOpenChange,
  align = 'center',
  className = '',
  children,
  ...props
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [isOpen, setOpen]);

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  } as const;

  return (
    <div className="relative inline-flex">
      <div ref={triggerRef} onClick={() => setOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={panelRef}
          className={`absolute z-50 top-full mt-1 min-w-[200px] bg-ae-bg border border-ae-border rounded-ae-lg shadow-ae-md py-1 ${alignClasses[align]} ${className}`}
          role="dialog"
          {...props}
        >
          {children}
        </div>
      )}
    </div>
  );
}

Popover.displayName = 'Popover';
