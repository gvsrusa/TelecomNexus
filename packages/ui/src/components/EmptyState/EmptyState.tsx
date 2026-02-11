import { Card, Button } from 'react-bootstrap';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="text-center py-5">
      <Card.Body>
        {icon && <div className="mb-3">{icon}</div>}
        <h5>{title}</h5>
        <p className="text-muted mb-3">{description}</p>
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}
