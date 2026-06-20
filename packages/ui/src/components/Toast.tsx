import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { IconX } from '../icons/IconX';
import { IconCheck } from '../icons/IconCheck';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export interface ToastContextValue {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
  removeToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const variantStyles = {
  info: 'border-ae-border',
  success: 'border-ae-border',
  warning: 'border-ae-border-strong',
  error: 'border-ae-border-strong',
} as const;

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 w-full max-w-sm p-4 bg-ae-bg border rounded-ae-lg shadow-ae-md animate-slide-in ${variantStyles[toast.variant || 'info']}`}
      role="alert"
    >
      {toast.variant === 'success' && <IconCheck size={18} className="text-ae-text-primary mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-ae-sm font-medium text-ae-text-primary">{toast.title}</p>
        {toast.description && (
          <p className="text-ae-xs text-ae-text-secondary mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-0.5 text-ae-text-muted hover:text-ae-text-primary rounded transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <IconX size={14} />
      </button>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 200ms ease-out; }
      `}</style>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.displayName = 'ToastProvider';
