'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

interface ToastItem {
  id: string;
  title: string;
  body?: string;
  variant?: 'success' | 'danger' | 'warning' | 'info';
}

interface ToastContextValue {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1070 }}>
        {toasts.slice(0, 5).map((t) => (
          <Toast
            key={t.id}
            onClose={() => removeToast(t.id)}
            autohide
            delay={4000}
            {...(t.variant ? { bg: t.variant } : {})}
            aria-live="polite"
            aria-atomic="true"
          >
            <Toast.Header closeButton>
              <strong className="me-auto">
                {t.variant === 'success' && '\u2705 '}
                {t.variant === 'danger' && '\u274C '}
                {t.variant === 'warning' && '\u26A0\uFE0F '}
                {t.variant === 'info' && '\u2139\uFE0F '}
                {t.title}
              </strong>
            </Toast.Header>
            {t.body && (
              <Toast.Body
                className={t.variant === 'danger' || t.variant === 'success' ? 'text-white' : ''}
              >
                {t.body}
              </Toast.Body>
            )}
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
