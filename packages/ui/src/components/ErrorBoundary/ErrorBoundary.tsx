import { Component, type ReactNode } from 'react';
import { Alert, Button } from 'react-bootstrap';

interface Props {
  fallback?: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error !== null) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <Alert variant="danger">
          <Alert.Heading>Something went wrong</Alert.Heading>
          <p>{this.state.error.message}</p>
          <Button
            variant="outline-danger"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </Button>
        </Alert>
      );
    }
    return this.props.children;
  }
}
