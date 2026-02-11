'use client';

import { Component, type ReactNode } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { ApolloWrapper } from '@/lib/apollo-provider';
import { ThemeProvider } from '@/lib/theme-provider';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/lib/toast-context';
import { ShellLayout } from '@/components/ShellLayout';

/* ---------- Error Boundary ---------- */

interface EBState {
  hasError: boolean;
  error: Error | null;
}

class ShellErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error !== null) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-4">
          <Alert variant="danger" className="text-center" style={{ maxWidth: 500 }}>
            <Alert.Heading>Something went wrong</Alert.Heading>
            <p className="mb-3">{this.state.error.message}</p>
            <Button
              variant="outline-danger"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload Application
            </Button>
          </Alert>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------- Providers ---------- */

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ShellErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ApolloWrapper>
            <ToastProvider>
              <ShellLayout>{children}</ShellLayout>
            </ToastProvider>
          </ApolloWrapper>
        </AuthProvider>
      </ThemeProvider>
    </ShellErrorBoundary>
  );
}
