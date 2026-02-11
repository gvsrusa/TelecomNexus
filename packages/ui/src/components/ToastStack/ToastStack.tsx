import { Toast, ToastContainer } from 'react-bootstrap';

export interface ToastItem {
  id: string;
  title: string;
  body?: string;
  variant?: 'success' | 'danger' | 'warning' | 'info';
}

export interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  const visible = toasts.slice(0, 3);

  return (
    <ToastContainer position="top-end" className="p-3">
      {visible.map((t) => (
        <Toast
          key={t.id}
          onClose={() => onDismiss(t.id)}
          autohide
          delay={5000}
          {...(t.variant ? { bg: t.variant } : {})}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">{t.title}</strong>
          </Toast.Header>
          {t.body && <Toast.Body>{t.body}</Toast.Body>}
        </Toast>
      ))}
    </ToastContainer>
  );
}
